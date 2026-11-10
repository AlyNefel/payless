import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    let isAdmin = false;
    try {
      const session = await auth();
      const role = (session?.user as any)?.role?.toLowerCase();
      isAdmin = Boolean(role && ["admin", "superadmin", "manager"].includes(role));
    } catch {}

    // Allow dev or cookie fallback
    if (!isAdmin && process.env.NODE_ENV === "production") {
      const token =
        request.cookies.get("authjs.session-token")?.value ||
        request.cookies.get("__Secure-authjs.session-token")?.value ||
        request.cookies.get("next-auth.session-token")?.value ||
        request.cookies.get("__Secure-next-auth.session-token")?.value;
      if (!token) {
        return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
      }
    }

    const body = await request.json().catch(() => ({}));
    const user = (body.user || process.env.SMTP_USER || "").trim();
    const pass = (body.pass || process.env.SMTP_PASS || "").replace(/^["']|["']$/g, "").trim();
    const host = (body.host || process.env.SMTP_HOST || "smtp.gmail.com").trim();
    const port = Number(body.port || process.env.SMTP_PORT) || 465;
    const secure = body.secure !== undefined ? Boolean(body.secure) : port === 465;
    const testRecipient = (body.testRecipient || user).trim();

    if (!user || !pass) {
      return NextResponse.json(
        { success: false, error: "Veuillez renseigner l'utilisateur (email) et le mot de passe SMTP." },
        { status: 400 }
      );
    }

    const isGmail = host.includes("gmail") || user.endsWith("@gmail.com");
    const transportConfig: any = isGmail
      ? {
          service: "gmail",
          auth: { user, pass },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        }
      : {
          host,
          port,
          secure,
          auth: { user, pass },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        };

    const transporter = nodemailer.createTransport(transportConfig);

    // 1. Verify credentials
    try {
      await transporter.verify();
    } catch (verifyErr: any) {
      const rawMsg = verifyErr?.message || "Échec de vérification SMTP";
      let friendlyError = rawMsg;
      if (rawMsg.includes("535") || rawMsg.includes("BadCredentials") || rawMsg.includes("Username and Password not accepted")) {
        friendlyError =
          "Erreur Google 535 Bad Credentials : L'adresse email ou le mot de passe d'application est incorrect ou révoqué. Rendez-vous sur votre compte Google (https://myaccount.google.com/apppasswords) pour générer un nouveau mot de passe d'application de 16 lettres.";
      } else if (rawMsg.includes("ETIMEDOUT") || rawMsg.includes("Greeting never received")) {
        friendlyError = "Délai de connexion dépassé avec le serveur SMTP. Vérifiez l'hôte et le port.";
      }
      return NextResponse.json({ success: false, error: friendlyError }, { status: 400 });
    }

    // 2. If testRecipient provided, send test email
    if (testRecipient && testRecipient.includes("@")) {
      await transporter.sendMail({
        from: `"Payless Car Rental" <${user}>`,
        to: testRecipient,
        subject: "✓ Test de configuration SMTP réussi — Payless Car Rental",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px; margin: auto;">
            <h2 style="color: #16a34a; margin-top: 0;">✓ Connexion SMTP Réussie !</h2>
            <p>Ce message confirme que votre serveur d'envoi d'emails SMTP est parfaitement opérationnel pour <strong>Payless Car Rental Tunisie</strong>.</p>
            <p style="color: #64748b; font-size: 13px;">Expéditeur configuré : ${user}<br>Destinataire : ${testRecipient}<br>Date : ${new Date().toLocaleString("fr-FR")}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Connexion SMTP validée avec succès ! Un email de test a été envoyé à ${testRecipient}.`,
    });
  } catch (error: any) {
    console.error("Test SMTP error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erreur lors du test SMTP" },
      { status: 500 }
    );
  }
}
