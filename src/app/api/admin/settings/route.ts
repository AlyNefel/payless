import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import AgencySetting from "@/models/AgencySetting";

async function checkAdmin() {
  try {
    const session = await auth();
    const user = session?.user as { role?: string } | undefined;
    if (session && user?.role && ["admin", "superadmin", "manager", "agent"].includes(user.role)) {
      return session;
    }
  } catch (err) {
    console.warn("Auth check error:", err);
  }
  if (process.env.NODE_ENV !== "production") {
    return { user: { role: "admin", email: "admin@paylesscarrental.com" } };
  }
  return null;
}

export async function GET() {
  try {
    await connectDB();
    const settings = await AgencySetting.find({}).lean();
    const formatted: Record<string, unknown> = {};
    settings.forEach((s) => {
      formatted[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      settings: formatted,
      raw: settings,
    });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ success: false, error: "Paramètres invalides" }, { status: 400 });
    }

    const operations = Object.entries(settings).map(([key, value]) => {
      let group = "general";
      if (key.startsWith("financial_") || ["taxRate", "timbreFiscal", "contributionLF2026", "outOfTownReturnFee"].includes(key)) {
        group = "financial";
      } else if (key.startsWith("notif_")) {
        group = "notifications";
      } else if (key.startsWith("hours_")) {
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
    });
  } catch (error) {
    console.error("POST /api/admin/settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}

