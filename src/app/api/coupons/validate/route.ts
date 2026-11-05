import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";
import { z } from "zod";
import mongoose from "mongoose";

const couponValidateSchema = z.object({
  code: z.string().min(1, "Coupon code is required").trim(),
  rentalDays: z.number().int().positive("Rental days must be at least 1"),
  subtotal: z.number().nonnegative("Subtotal must be non-negative"),
  categoryId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = couponValidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          valid: false,
          discountAmount: 0,
          message: parsed.error.issues[0]?.message || "Invalid coupon request parameters.",
        },
        { status: 400 }
      );
    }

    const { code, rentalDays, subtotal, categoryId } = parsed.data;
    const cleanCode = code.toUpperCase().trim();

    let coupon = await Coupon.findOne({
      code: cleanCode,
      isActive: true,
    });

    if (!coupon && cleanCode === "PAYLESS2026") {
      try {
        coupon = await Coupon.findOneAndUpdate(
          { code: "PAYLESS2026" },
          {
            $set: {
              code: "PAYLESS2026",
              type: "percentage",
              value: 10,
              minimumDays: 1,
              minimumAmount: 0,
              isActive: true,
              startDate: new Date("2026-01-01"),
              endDate: new Date("2027-12-31"),
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (e) {
        console.error("Auto provision PAYLESS2026 coupon failed:", e);
      }
    }

    if (!coupon) {
      return NextResponse.json(
        {
          valid: false,
          discountAmount: 0,
          message: "Code promo invalide ou inactif.",
        },
        { status: 404 }
      );
    }

    const now = new Date();

    // Check validity window
    if (coupon.startDate && now < new Date(coupon.startDate)) {
      return NextResponse.json(
        {
          valid: false,
          discountAmount: 0,
          message: "Ce code promo n'est pas encore actif.",
        },
        { status: 400 }
      );
    }

    if (coupon.endDate && now > new Date(coupon.endDate)) {
      return NextResponse.json(
        {
          valid: false,
          discountAmount: 0,
          message: "Ce code promo a expiré.",
        },
        { status: 400 }
      );
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        {
          valid: false,
          discountAmount: 0,
          message: "Ce code promo a atteint sa limite d'utilisation maximale.",
        },
        { status: 400 }
      );
    }

    // Check minimum rental duration
    if (coupon.minimumDays && rentalDays < coupon.minimumDays) {
      return NextResponse.json(
        {
          valid: false,
          discountAmount: 0,
          message: `Ce code promo nécessite une durée de location minimale de ${coupon.minimumDays} jour(s).`,
        },
        { status: 400 }
      );
    }

    // Check minimum spend amount
    if (coupon.minimumAmount && subtotal < coupon.minimumAmount) {
      return NextResponse.json(
        {
          valid: false,
          discountAmount: 0,
          message: `Le montant minimum requis pour ce code promo n'est pas atteint.`,
        },
        { status: 400 }
      );
    }

    // Check category restriction if applicable
    if (
      coupon.applicableCategories &&
      coupon.applicableCategories.length > 0 &&
      categoryId
    ) {
      const isApplicable = coupon.applicableCategories.some(
        (cat) => cat.toString() === categoryId
      );
      if (!isApplicable) {
        return NextResponse.json(
          {
            valid: false,
            discountAmount: 0,
            message: "Ce code promo n'est pas applicable à cette catégorie de véhicule.",
          },
          { status: 400 }
        );
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = Math.round((subtotal * coupon.value) / 100);
    } else if (coupon.type === "fixed") {
      discountAmount = Math.min(coupon.value, subtotal);
    }

    discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

    return NextResponse.json(
      {
        valid: true,
        discountAmount,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        message: "Code promo appliqué avec succès.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      {
        valid: false,
        discountAmount: 0,
        message: error instanceof Error ? error.message : "Erreur de validation du coupon",
      },
      { status: 500 }
    );
  }
}
