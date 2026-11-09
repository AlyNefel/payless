import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AgencySetting from "@/models/AgencySetting";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_SETTINGS: Record<string, unknown> = {
  agencyName: "Payless Car Rental Tunisie",
  agency_name: "Payless Car Rental Tunisie",
  legalName: "Houimli Rent a Car SARL",
  legal_name: "Houimli Rent a Car SARL",
  registration: "RC Ariana B0123452020 - MF 1234567/A/M/000",
  address: "60, Avenue de l'UMA, Chotrana 1, La Soukra",
  city: "Ariana 2036, Tunisie",
  postalCode: "2036",
  postal_code: "2036",
  country: "Tunisie",
  phone: "80808080",
  phone_primary: "80808080",
  whatsapp: "80808080",
  phone_secondary: "80808080",
  email: "contact@paylesscarrental.tn",
  contact_email: "contact@paylesscarrental.tn",
  supportEmail: "test@paylesscarrental.tn",
  support_email: "test@paylesscarrental.tn",
  website: "https://hmlrentcar.tn",
  defaultLanguage: "fr",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  linkedin: "https://linkedin.com",
  twitter: "https://twitter.com",
  currency: "TND",
  currencySymbol: "DT",
  taxRate: 0,
  timbreFiscal: 1,
  contributionLF2026: 2,
  differentLocationFee: 50,
  outOfTownReturnFee: 100,
  minRentalAge: 21,
  minLuxuryAge: 25,
  cancellationHours: 48,
  cancellationFeeRate: 20,
};

export async function GET() {
  try {
    await connectDB();
    const settings = await AgencySetting.find({}).lean();
    const formatted: Record<string, unknown> = {};

    settings.forEach((s) => {
      formatted[s.key] = s.value;
    });

    // Auto-seed initial defaults into DB if database has no agency settings yet
    if (settings.length === 0) {
      const ops = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
        updateOne: {
          filter: { key },
          update: {
            $set: {
              key,
              value,
              group: "general",
              label: key,
              type: typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : "string",
            },
          },
          upsert: true,
        },
      }));
      await AgencySetting.bulkWrite(ops);
      Object.assign(formatted, DEFAULT_SETTINGS);
    }

    // Helper to find value from key or fallback aliases
    const getVal = (primary: string, ...fallbacks: string[]) => {
      if (formatted[primary] !== undefined && formatted[primary] !== null && formatted[primary] !== "") {
        return formatted[primary];
      }
      for (const fb of fallbacks) {
        if (formatted[fb] !== undefined && formatted[fb] !== null && formatted[fb] !== "") {
          return formatted[fb];
        }
      }
      return DEFAULT_SETTINGS[primary];
    };

    const agencyName = getVal("agencyName", "agency_name");
    const legalName = getVal("legalName", "legal_name");
    const phone = getVal("phone", "phone_primary");
    const whatsapp = getVal("whatsapp", "phone_secondary", "phone");
    const email = getVal("email", "contact_email");
    const supportEmail = getVal("supportEmail", "support_email", "email");
    const address = getVal("address", "siege_social");
    const city = getVal("city", "ville");
    const postalCode = getVal("postalCode", "postal_code");
    const country = getVal("country", "pays");
    const website = getVal("website", "site_web");
    const registration = getVal("registration", "immatriculation");
    const defaultLanguage = getVal("defaultLanguage", "default_language");

    // Unified synchronized settings with normalized camelCase & snake_case
    const normalized: Record<string, unknown> = {
      ...DEFAULT_SETTINGS,
      ...formatted,
      agencyName,
      agency_name: agencyName,
      legalName,
      legal_name: legalName,
      phone,
      phone_primary: phone,
      whatsapp,
      phone_secondary: whatsapp,
      email,
      contact_email: email,
      supportEmail,
      support_email: supportEmail,
      address,
      city,
      postalCode,
      postal_code: postalCode,
      country,
      website,
      registration,
      defaultLanguage,
    };

    return NextResponse.json(
      {
        success: true,
        settings: normalized,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}
