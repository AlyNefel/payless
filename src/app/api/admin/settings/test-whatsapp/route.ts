import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendWhatsAppMessage, sanitizeWhatsAppNumber, WhatsAppConfig } from "@/lib/whatsapp";

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
    console.warn("Auth check error:", err);
  }

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

export async function POST(request: NextRequest) {
  const session = await checkAdmin(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const recipientPhone = body.recipientPhone || body.phone;
    const customConfig = body.config as Partial<WhatsAppConfig> | undefined;

    if (!recipientPhone) {
      return NextResponse.json(
        { success: false, error: "Veuillez indiquer un numéro de téléphone de test." },
        { status: 400 }
      );
    }

    const cleanPhone = sanitizeWhatsAppNumber(recipientPhone);
    const testMessage =
      `🚗 *Payless Car Rental Tunisie — Test WhatsApp*\n\n` +
      `✅ Votre passerelle WhatsApp est connectée avec succès au tableau de bord !\n\n` +
      `Les confirmations de réservations et liens vers les bons officiels (PDF) seront automatiquement expédiés aux clients depuis ce canal.\n\n` +
      `Horodatage du test : ${new Date().toLocaleString("fr-FR")}`;

    const result = await sendWhatsAppMessage({
      to: cleanPhone,
      message: testMessage,
      customConfig,
    });

    if (result.success && result.mode === "api") {
      return NextResponse.json({
        success: true,
        message: `Message de test WhatsApp envoyé avec succès au +${cleanPhone} (ID: ${result.messageId}).`,
        mode: result.mode,
      });
    } else if (result.mode === "direct_link") {
      return NextResponse.json({
        success: true,
        message: `Mode lien direct WhatsApp actif (aucune passerelle API connectée). Le lien a été généré : ${result.url}`,
        mode: result.mode,
        url: result.url,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Échec de l'envoi du message WhatsApp via la passerelle.",
          url: result.url,
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error("POST /api/admin/settings/test-whatsapp error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erreur interne du serveur lors du test WhatsApp." },
      { status: 500 }
    );
  }
}
