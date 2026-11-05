import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  locale: z.enum(["fr", "en", "ar"]).default("fr"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, locale } = parsed.data;

    await connectDB();

    // Check if already subscribed
    const existing = await NewsletterSubscriber.findOne({
      email: email.toLowerCase(),
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { message: "Already subscribed", alreadySubscribed: true },
          { status: 200 }
        );
      }
      // Re-activate
      existing.isActive = true;
      existing.language = locale;
      await existing.save();
      return NextResponse.json({ message: "Resubscribed successfully" });
    }

    await NewsletterSubscriber.create({
      email: email.toLowerCase(),
      language: locale,
      subscribedAt: new Date(),
      isActive: true,
    });

    return NextResponse.json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("POST /api/newsletter error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
