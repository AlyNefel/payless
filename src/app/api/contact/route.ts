import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2, "Name too short").max(100),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10, "Message too short").max(2000),
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

    const { name, email, phone, subject, message, locale } = parsed.data;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0A0A0B; padding: 24px; border-radius: 8px;">
          <h2 style="color: #1D4ED8; margin-bottom: 16px;">Nouveau message de contact / New Contact Message</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; color: #9CA3AF; width: 120px;">Nom / Name:</td><td style="padding: 8px; color: #fff;">${name}</td></tr>
            <tr><td style="padding: 8px; color: #9CA3AF;">Email:</td><td style="padding: 8px; color: #fff;">${email}</td></tr>
            ${phone ? `<tr><td style="padding: 8px; color: #9CA3AF;">Téléphone:</td><td style="padding: 8px; color: #fff;">${phone}</td></tr>` : ""}
            <tr><td style="padding: 8px; color: #9CA3AF;">Sujet:</td><td style="padding: 8px; color: #fff;">${subject}</td></tr>
            <tr><td style="padding: 8px; color: #9CA3AF;">Langue:</td><td style="padding: 8px; color: #fff;">${locale.toUpperCase()}</td></tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #1a1a1a; border-radius: 4px; border-left: 4px solid #1D4ED8;">
            <p style="color: #9CA3AF; margin: 0 0 8px;">Message:</p>
            <p style="color: #fff; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: process.env.AGENCY_EMAIL || "contact@paylesscarrental.ma",
      subject: `[Contact] ${subject} — ${name}`,
      html,
      replyTo: email,
    });

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

