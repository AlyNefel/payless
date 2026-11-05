import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Extra from "@/models/Extra";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const extras = await Extra.find({ isActive: true }).sort({ order: 1, price: 1 }).lean();

    if (!extras || extras.length === 0) {
      const fallbackExtras = [
        { _id: "extra-driver", name: { fr: "2ème Conducteur Additionnel (Offert)", en: "2nd Additional Driver (Free)", ar: "سائق إضافي ثانٍ (مجاناً)" }, price: 0, pricingType: "per_rental", icon: "👤", maxQuantity: 1 },
        { _id: "baby-seat", name: { fr: "Siège Bébé Homologué (0-13 kg)", en: "Infant Baby Seat (0-13 kg)", ar: "مقعد أطفال معتمد" }, price: 1500, pricingType: "per_day", icon: "👶", maxQuantity: 2 },
        { _id: "child-seat", name: { fr: "Rehausseur Enfant (Child Seat)", en: "Child Booster Seat", ar: "كرسي رفع للأطفال" }, price: 1000, pricingType: "per_day", icon: "🧒", maxQuantity: 2 },
        { _id: "fuel-70", name: { fr: "Option Plein Carburant (70 TND)", en: "Prepaid Fuel Tank (70 TND)", ar: "خيار خزان وقود كامل (70 د.ت)" }, price: 7000, pricingType: "per_rental", icon: "⛽", maxQuantity: 1 },
        { _id: "fuel-90", name: { fr: "Option Plein Carburant (90 TND)", en: "Prepaid Fuel Tank (90 TND)", ar: "خيار خزان وقود كامل (90 د.ت)" }, price: 9000, pricingType: "per_rental", icon: "⛽", maxQuantity: 1 },
        { _id: "gps", name: { fr: "GPS Tactile Cartographie Tunisie 2026", en: "Touchscreen GPS Tunisia 2026", ar: "جهاز ملاحة خرائط تونس 2026" }, price: 1000, pricingType: "per_day", icon: "🗺️", maxQuantity: 1 },
      ];
      return NextResponse.json({ success: true, extras: fallbackExtras });
    }

    return NextResponse.json({ success: true, extras });
  } catch (error) {
    console.error("Error fetching extras:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch extras" }, { status: 500 });
  }
}

