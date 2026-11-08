import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Location from "@/models/Location";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const locations = await Location.find({ isActive: true }).sort({ createdAt: 1 }).lean();

    if (!locations || locations.length === 0) {
      // Fallback static locations for Payless Tunisia (HML Rent Car)
      const fallbackLocations = [
        { _id: "tun-airport", name: { fr: "1. Aéroport de Tunis-Carthage (TUN)", en: "1. Tunis-Carthage Airport (TUN)", ar: "1. مطار تونس قرطاج الدولي (TUN)" }, city: "Tunis", isAirport: true, isOutsideTunis: false, pickupFee: 0, returnFee: 0, customReturnFee: 0 },
        { _id: "mir-airport", name: { fr: "2. Aéroport de Monastir Habib Bourguiba (MIR)", en: "2. Monastir Airport (MIR)", ar: "2. مطار الحبيب بورقيبة المنستير (MIR)" }, city: "Monastir", isAirport: true, isOutsideTunis: true, pickupFee: 0, returnFee: 10000, customReturnFee: 10000 },
        { _id: "soukra-agency", name: { fr: "3. Agence La Soukra (Siège Social)", en: "3. La Soukra Agency (HQ)", ar: "3. وكالة سكرة (المقر الرئيسي)" }, city: "Ariana", isAirport: false, isOutsideTunis: false, pickupFee: 0, returnFee: 0, customReturnFee: 0 },
        { _id: "bizerte-city", name: { fr: "4. Bizerte Ville", en: "4. Bizerte City", ar: "4. مدينة بنزرت" }, city: "Bizerte", isAirport: false, isOutsideTunis: true, pickupFee: 0, returnFee: 10000, customReturnFee: 10000 },
        { _id: "nabeul-city", name: { fr: "5. Nabeul Ville", en: "5. Nabeul City", ar: "5. مدينة نابل" }, city: "Nabeul", isAirport: false, isOutsideTunis: true, pickupFee: 0, returnFee: 10000, customReturnFee: 10000 },
        { _id: "grand-tunis", name: { fr: "6. Grand Tunis (Livraison Hôtels & Domicile)", en: "6. Greater Tunis (Delivery)", ar: "6. تونس الكبرى (تسليم الفنادق والمنازل)" }, city: "Tunis", isAirport: false, isOutsideTunis: false, pickupFee: 0, returnFee: 0, customReturnFee: 0 },
        { _id: "nbe-airport", name: { fr: "7. Aéroport Enfidha-Hammamet (NBE)", en: "7. Enfidha Airport (NBE)", ar: "7. مطار النفيضة الحمامات (NBE)" }, city: "Enfidha", isAirport: true, isOutsideTunis: true, pickupFee: 0, returnFee: 10000, customReturnFee: 10000 },
        { _id: "hammamet-city", name: { fr: "8. Hammamet Ville & Yasmine Hammamet", en: "8. Hammamet & Yasmine Resort", ar: "8. مدينة الحمامات وياسمين الحمامات" }, city: "Hammamet", isAirport: false, isOutsideTunis: true, pickupFee: 0, returnFee: 10000, customReturnFee: 10000 },
        { _id: "sfax-city", name: { fr: "9. Sfax Ville", en: "9. Sfax City", ar: "9. مدينة صفاقس" }, city: "Sfax", isAirport: false, isOutsideTunis: true, pickupFee: 0, returnFee: 10000, customReturnFee: 10000 },
        { _id: "sousse-city", name: { fr: "10. Sousse Ville & Port El Kantaoui", en: "10. Sousse & Port El Kantaoui", ar: "10. مدينة سوسة وميناء القنطاوي" }, city: "Sousse", isAirport: false, isOutsideTunis: true, pickupFee: 0, returnFee: 10000, customReturnFee: 10000 },
        { _id: "jendouba-city", name: { fr: "11. Jendouba Ville & Tabarka", en: "11. Jendouba & Tabarka", ar: "11. مدينة جندوبة وطبرقة" }, city: "Jendouba", isAirport: false, isOutsideTunis: true, pickupFee: 0, returnFee: 10000, customReturnFee: 10000 },
      ];
      return NextResponse.json({ success: true, locations: fallbackLocations });
    }

    return NextResponse.json({ success: true, locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch locations" }, { status: 500 });
  }
}

