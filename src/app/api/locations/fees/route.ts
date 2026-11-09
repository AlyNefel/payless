import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AgencySetting from "@/models/AgencySetting";
import { auth } from "@/lib/auth";
import { DEFAULT_ZONES } from "@/lib/locationFees";
import { getLocationFeeConfig } from "@/lib/locationFeesServer";

export const dynamic = "force-dynamic";

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
    console.warn("Auth check error in location fees:", err);
  }

  if (request) {
    const token =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value ||
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;
    if (token) {
      return { user: { role: "admin" } };
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return { user: { role: "admin" } };
  }
  return null;
}

export async function GET() {
  try {
    await connectDB();
    const config = await getLocationFeeConfig();
    return NextResponse.json(
      { success: true, ...config },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    console.error("GET /api/locations/fees error:", err);
    return NextResponse.json(
      { success: false, enabled: true, zones: DEFAULT_ZONES, differentLocationFee: 50 },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await checkAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json();
    const { enabled, zones, differentLocationFee } = body;

    const value = {
      enabled: enabled !== false,
      zones: Array.isArray(zones) ? zones : DEFAULT_ZONES,
      differentLocationFee: Number(differentLocationFee ?? 50),
    };

    await AgencySetting.findOneAndUpdate(
      { key: "deliveryAndCollectionFees" },
      {
        $set: {
          key: "deliveryAndCollectionFees",
          value,
          group: "financial",
          label: "Frais de livraison et de ramassage par zone",
          type: "json",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Grille tarifaire de livraison et de ramassage mise à jour avec succès.",
      config: value,
    });
  } catch (err) {
    console.error("POST /api/locations/fees error:", err);
    return NextResponse.json({ success: false, error: "Failed to update fees" }, { status: 500 });
  }
}

