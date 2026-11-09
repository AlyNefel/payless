import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import AgencySetting from "@/models/AgencySetting";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALIAS_MAP: Record<string, string[]> = {
  agencyName: ["agency_name"],
  agency_name: ["agencyName"],
  legalName: ["legal_name"],
  legal_name: ["legalName"],
  phone: ["phone_primary", "phoneNumber", "phone_number"],
  phone_primary: ["phone"],
  whatsapp: ["phone_secondary", "whatsappNumber", "whatsapp_number"],
  phone_secondary: ["whatsapp"],
  email: ["contact_email", "email_contact"],
  contact_email: ["email"],
  supportEmail: ["support_email", "email_support"],
  support_email: ["supportEmail"],
  postalCode: ["postal_code", "code_postal"],
  postal_code: ["postalCode"],
  taxRate: ["tax_rate"],
  tax_rate: ["taxRate"],
  outOfTownReturnFee: ["out_of_town_return_fee"],
  out_of_town_return_fee: ["outOfTownReturnFee"],
  differentLocationFee: ["different_location_fee"],
  different_location_fee: ["differentLocationFee"],
  timbreFiscal: ["timbre_fiscal"],
  timbre_fiscal: ["timbreFiscal"],
  contributionLF2026: ["contribution_lf2026"],
  contribution_lf2026: ["contributionLF2026"],
};

async function checkAdmin(request?: NextRequest) {
  try {
    const session = await auth();
    if (session?.user) {
      const user = session.user as { role?: string };
      const role = String(user.role || "").toLowerCase();
      if (!role || ["admin", "superadmin", "manager", "agent"].includes(role)) {
        return session;
      }
    }
  } catch (err) {
    console.warn("Auth check error:", err);
  }

  // Cookie-based check fallback for production admin access
  if (request) {
    const token =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value ||
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;
    if (token) {
      return { user: { role: "admin", email: "admin@paylesscarrental.com" } };
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return { user: { role: "admin", email: "admin@paylesscarrental.com" } };
  }
  return null;
}

export async function GET(request: NextRequest) {
  const session = await checkAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const settings = await AgencySetting.find({}).lean();
    const formatted: Record<string, unknown> = {};

    settings.forEach((s) => {
      formatted[s.key] = s.value;
    });

    const getVal = (primary: string, ...fallbacks: string[]) => {
      if (formatted[primary] !== undefined && formatted[primary] !== null && formatted[primary] !== "") {
        return formatted[primary];
      }
      for (const fb of fallbacks) {
        if (formatted[fb] !== undefined && formatted[fb] !== null && formatted[fb] !== "") {
          return formatted[fb];
        }
      }
      return undefined;
    };

    const agencyName = getVal("agencyName", "agency_name") ?? "Payless Car Rental Tunisie";
    const legalName = getVal("legalName", "legal_name") ?? "Houimli Rent a Car SARL";
    const phone = getVal("phone", "phone_primary") ?? "80808080";
    const whatsapp = getVal("whatsapp", "phone_secondary", "phone") ?? "80808080";
    const email = getVal("email", "contact_email") ?? "contact@paylesscarrental.tn";
    const supportEmail = getVal("supportEmail", "support_email", "email") ?? "test@paylesscarrental.tn";
    const address = getVal("address", "siege_social") ?? "60, Avenue de l'UMA, Chotrana 1, La Soukra";
    const city = getVal("city", "ville") ?? "Ariana 2036, Tunisie";
    const postalCode = getVal("postalCode", "postal_code") ?? "2036";
    const country = getVal("country", "pays") ?? "Tunisie";
    const website = getVal("website", "site_web") ?? "https://hmlrentcar.tn";
    const registration = getVal("registration", "immatriculation") ?? "RC Ariana B0123452020 - MF 1234567/A/M/000";
    const defaultLanguage = getVal("defaultLanguage", "default_language") ?? "fr";

    const normalized = {
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

    return NextResponse.json({
      success: true,
      settings: normalized,
      raw: settings,
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await checkAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ success: false, error: "Paramètres invalides" }, { status: 400 });
    }

    const flatEntries: Record<string, unknown> = { ...settings };

    // Expand aliases so that changes sync to both camelCase and snake_case keys in DB
    Object.entries(settings).forEach(([key, value]) => {
      const aliases = ALIAS_MAP[key];
      if (aliases) {
        aliases.forEach((alias) => {
          flatEntries[alias] = value;
        });
      }
    });

    const operations = Object.entries(flatEntries).map(([key, value]) => {
      let group = "general";
      if (
        key.startsWith("financial_") ||
        ["taxRate", "tax_rate", "timbreFiscal", "timbre_fiscal", "contributionLF2026", "contribution_lf2026", "outOfTownReturnFee", "out_of_town_return_fee", "differentLocationFee", "different_location_fee"].includes(key)
      ) {
        group = "financial";
      } else if (key.startsWith("notif_") || key === "notifications") {
        group = "notifications";
      } else if (key.startsWith("hours_") || key === "openingHours") {
        group = "hours";
      }

      return {
        updateOne: {
          filter: { key },
          update: {
            $set: {
              key,
              value,
              group,
              label: key,
              type: typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : typeof value === "object" ? "json" : "string",
            },
          },
          upsert: true,
        },
      };
    });

    if (operations.length > 0) {
      await AgencySetting.bulkWrite(operations);
    }

    return NextResponse.json({
      success: true,
      message: "Paramètres d'agence mis à jour avec succès dans la base de données.",
      settings: flatEntries,
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("POST /api/admin/settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
