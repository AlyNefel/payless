import nodemailer from "nodemailer";
import { Resend } from "resend";
import connectDB from "./db";
import EmailLog from "@/models/EmailLog";

const resend = process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("placeholder")
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function getSmtpTransporter(): Promise<{
  transporter: nodemailer.Transporter | null;
  fromAddress: string;
}> {
  await connectDB();

  // 1. Check database AgencySetting for custom SMTP credentials first
  let dbUser = "";
  let dbPass = "";
  let dbHost = "";
  let dbPort = 465;
  let dbSecure: boolean | undefined = undefined;
  let dbFromName = "";
  let dbFromEmail = "";

  try {
    const AgencySetting = (await import("@/models/AgencySetting")).default;
    const smtpSettingDoc = await AgencySetting.findOne({
      key: { $in: ["smtp_config", "smtpSettings", "smtp"] },
    }).lean();

    if (smtpSettingDoc && typeof smtpSettingDoc.value === "object" && smtpSettingDoc.value !== null) {
      const v = smtpSettingDoc.value as any;
      dbUser = (v.user || v.smtpUser || "").trim();
      dbPass = (v.pass || v.smtpPass || "").replace(/^["']|["']$/g, "").trim();
      dbHost = (v.host || v.smtpHost || "").trim();
      dbPort = Number(v.port || v.smtpPort) || 465;
      dbSecure = v.secure !== undefined ? Boolean(v.secure) : dbPort === 465;
      dbFromName = (v.fromName || "").trim();
      dbFromEmail = (v.fromEmail || "").trim();
    }
  } catch (err) {
    console.warn("Could not query DB for SMTP settings:", err);
  }

  // 2. Fallback to process.env
  const user = dbUser || process.env.SMTP_USER?.trim() || "";
  const pass = dbPass || (process.env.SMTP_PASS || "").replace(/^["']|["']$/g, "").trim();
  const host = dbHost || process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = dbPort || Number(process.env.SMTP_PORT) || 465;
  const secure = dbSecure !== undefined ? dbSecure : (process.env.SMTP_SECURE === "true" || port === 465);

  const fromName = dbFromName || process.env.EMAIL_FROM_NAME || "Payless Car Rental Tunisie";
  const fromEmail = dbFromEmail || process.env.EMAIL_FROM || user || "contact@paylesscarrental.tn";
  const fromAddress = `"${fromName}" <${fromEmail}>`;

  if (user && pass) {
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

    return {
      transporter: nodemailer.createTransport(transportConfig),
      fromAddress,
    };
  }

  return { transporter: null, fromAddress };
}

export interface EmailPayload {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  templateType?: string;
  language?: "fr" | "en" | "ar";
  bookingId?: string;
  customerId?: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
}

export async function sendEmail(payload: EmailPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  await connectDB();

  const log = await EmailLog.create({
    to: payload.to,
    toName: payload.toName,
    subject: payload.subject,
    templateType: payload.templateType || "general",
    language: payload.language || "fr",
    bookingId: payload.bookingId,
    customerId: payload.customerId,
    status: "pending",
  });

  const { transporter: smtp, fromAddress } = await getSmtpTransporter();
  const toRecipient = payload.toName ? `"${payload.toName}" <${payload.to}>` : payload.to;

  try {
    if (smtp) {
      try {
        const info = await smtp.sendMail({
          from: fromAddress,
          to: toRecipient,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          replyTo: payload.replyTo,
          attachments: payload.attachments,
        });

        await EmailLog.findByIdAndUpdate(log._id, {
          status: "sent",
          messageId: info.messageId,
          sentAt: new Date(),
        });

        return { success: true, messageId: info.messageId };
      } catch (smtpErr: any) {
        const rawErr = smtpErr?.message || "Erreur de transmission SMTP";
        console.error("[SMTP_SEND_FAILURE]:", rawErr);

        let friendlyError = rawErr;
        if (rawErr.includes("535") || rawErr.includes("BadCredentials") || rawErr.includes("Username and Password not accepted")) {
          friendlyError =
            "Erreur 535 Bad Credentials : L'authentification Google/SMTP a échoué. Votre mot de passe d'application Gmail est invalide ou expiré. Veuillez le mettre à jour dans Admin > Paramètres > Serveur SMTP.";
        } else if (rawErr.includes("ETIMEDOUT") || rawErr.includes("Greeting never received")) {
          friendlyError = "Délai de connexion dépassé avec le serveur SMTP d'envoi. Veuillez vérifier les paramètres réseau.";
        }

        await EmailLog.findByIdAndUpdate(log._id, {
          status: "failed",
          error: friendlyError,
        });

        return { success: false, error: friendlyError };
      }
    }

    if (resend) {
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [toRecipient],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        replyTo: payload.replyTo,
        attachments: payload.attachments?.map((a) => ({
          filename: a.filename,
          content: Buffer.isBuffer(a.content) ? a.content : Buffer.from(a.content),
        })),
      });

      if (error) {
        await EmailLog.findByIdAndUpdate(log._id, {
          status: "failed",
          error: error.message,
        });
        return { success: false, error: error.message };
      }

      await EmailLog.findByIdAndUpdate(log._id, {
        status: "sent",
        messageId: data?.id,
        sentAt: new Date(),
      });

      return { success: true, messageId: data?.id };
    }

    // Neither SMTP nor Resend configured
    const noConfigMsg =
      "Aucun serveur SMTP d'envoi n'est configuré. Veuillez renseigner votre email et mot de passe d'application dans Admin > Paramètres > Serveur SMTP.";
    console.warn(`[EMAIL_NO_CONFIG] To: ${toRecipient} | Subject: ${payload.subject}`);
    await EmailLog.findByIdAndUpdate(log._id, {
      status: "failed",
      error: noConfigMsg,
    });
    return { success: false, error: noConfigMsg };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue lors de l'envoi de l'email";
    await EmailLog.findByIdAndUpdate(log._id, {
      status: "failed",
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Booking confirmation email template
 */
export function buildBookingConfirmationEmail(data: {
  customerName: string;
  bookingReference: string;
  vehicleName: string;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  totalAmount: string;
  currency: string;
  language: "fr" | "en" | "ar";
  timbreFiscal?: string;
  contributionLF2026?: string;
  pickupLocationFee?: string;
  differentLocationFee?: string;
  outOfTownFee?: string;
}): { subject: string; html: string } {
  const subjects = {
    fr: `Confirmation de réservation - ${data.bookingReference} | Payless Tunisie`,
    en: `Booking Confirmation - ${data.bookingReference} | Payless Tunisia`,
    ar: `تأكيد الحجز - ${data.bookingReference} | بايليس لتأجير السيارات`,
  };

  const greetings = {
    fr: `Cher(e) ${data.customerName},`,
    en: `Dear ${data.customerName},`,
    ar: `عزيزي ${data.customerName}،`,
  };

  const messages = {
    fr: `Votre réservation a été confirmée instantanément avec succès. Votre véhicule est garanti et bloqué dans notre planning. Vous trouverez ci-joint votre bon de réservation officiel au format PDF.`,
    en: `Your booking has been instantly confirmed. Your vehicle is guaranteed and locked in our schedule. Please find attached your official reservation voucher in PDF format.`,
    ar: `تم تأكيد حجزك تلقائياً وبشكل فوري بنجاح. سيارتك مضمونة ومحجوزة في جدولنا. تجدون مرفقاً وصل الحجز الرسمي بصيغة PDF.`,
  };

  const labels = {
    fr: {
      ref: "Référence de réservation",
      vehicle: "Véhicule",
      pickup: "Prise en charge",
      return: "Restitution",
      fiscalStamp: "Timbre fiscal",
      lf2026: "Contribution LF 2026 (2 DT/jour)",
      pickupFee: "Frais prise en charge",
      oneWayFee: "Restitution agence différente (Aller-simple)",
      outOfTownFee: "Frais restitution hors Tunis / Ramassage",
      tva: "TVA",
      tvaValue: "0% (Prix TTC)",
      total: "Montant Total TTC",
      footerNote: "Payless Car Rental Tunisie — Houimli Rent a Car SARL. Tous droits réservés.",
      automated: "Ceci est un e-mail automatique. Veuillez ne pas y répondre directement.",
    },
    en: {
      ref: "Booking Reference",
      vehicle: "Vehicle",
      pickup: "Pick-up",
      return: "Return",
      fiscalStamp: "Fiscal Stamp",
      lf2026: "Contribution LF 2026 (2 TND/day)",
      pickupFee: "Pickup Location Fee",
      oneWayFee: "Inter-Agency Return Fee (One-Way)",
      outOfTownFee: "Out-of-Town Return Fee",
      tva: "VAT",
      tvaValue: "0% (VAT included)",
      total: "Total Amount (Incl. taxes)",
      footerNote: "Payless Car Rental Tunisia — Houimli Rent a Car SARL. All rights reserved.",
      automated: "This is an automated email. Please do not reply directly.",
    },
    ar: {
      ref: "مرجع الحجز",
      vehicle: "السيارة",
      pickup: "مكان وتاريخ الاستلام",
      return: "مكان وتاريخ التسليم",
      fiscalStamp: "طابع جبائي",
      lf2026: "مساهمة قانون المالية 2026 (2 د.ت/يوم)",
      pickupFee: "معلوم الاستلام في الموقع",
      oneWayFee: "معلوم تسليم في وكالة أخرى (ذهاب فقط)",
      outOfTownFee: "معلوم التسليم خارج تونس الكبرى",
      tva: "الأداء على القيمة المضافة",
      tvaValue: "0% (السعر باحتساب جميع الأداءات)",
      total: "المبلغ الإجمالي",
      footerNote: "بايليس لتأجير السيارات تونس — Houimli Rent a Car SARL. جميع الحقوق محفوظة.",
      automated: "هذه رسالة بريد إلكتروني آلية. يرجى عدم الرد عليها مباشرة.",
    },
  }[data.language] || {
    ref: "Booking Reference",
    vehicle: "Vehicle",
    pickup: "Pick-up",
    return: "Return",
    fiscalStamp: "Fiscal Stamp",
    lf2026: "Contribution LF 2026 (2 TND/day)",
    pickupFee: "Pickup Location Fee",
    oneWayFee: "Inter-Agency Return Fee",
    outOfTownFee: "Out-of-Town Return Fee",
    tva: "VAT",
    tvaValue: "0% (VAT included)",
    total: "Total Amount",
    footerNote: "Payless Car Rental Tunisia — All rights reserved.",
    automated: "This is an automated email.",
  };

  const html = `
    <!DOCTYPE html>
    <html lang="${data.language}" dir="${data.language === "ar" ? "rtl" : "ltr"}">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${subjects[data.language]}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 620px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0284c7, #0369a1); padding: 36px 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px; }
        .header p { color: #e0f2fe; margin: 8px 0 0; font-size: 14px; }
        .body { padding: 32px; }
        .greeting { font-size: 17px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .intro { color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
        .reference-box { background: #f0f9ff; border: 1px dashed #0284c7; border-radius: 8px; padding: 18px; margin: 20px 0; text-align: center; }
        .reference-label { margin: 0 0 6px; color: #0369a1; font-size: 12px; text-transform: uppercase; font-weight: 700; }
        .reference-code { font-size: 24px; font-weight: 800; color: #0369a1; letter-spacing: 2px; }
        .details-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
        .details-table tr { border-bottom: 1px solid #f1f5f9; }
        .details-table td { padding: 12px 6px; font-size: 14px; color: #1e293b; }
        .details-table td.label { color: #64748b; font-weight: 500; width: 45%; }
        .details-table td.value { font-weight: 600; text-align: ${data.language === "ar" ? "left" : "right"}; }
        .total-box { background: #0f172a; color: #ffffff; padding: 20px 28px; border-radius: 8px; margin-top: 24px; display: flex; justify-content: space-between; align-items: center; }
        .total-label { font-size: 14px; color: #94a3b8; font-weight: 500; }
        .total-val { font-size: 22px; font-weight: 800; color: #38bdf8; }
        .footer { padding: 24px 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PAYLESS CAR RENTAL</h1>
          <p>Tunisie — Houimli Rent a Car SARL</p>
        </div>
        <div class="body">
          <p class="greeting">${greetings[data.language]}</p>
          <p class="intro">${messages[data.language]}</p>
          <div class="reference-box">
            <div class="reference-label">${labels.ref}</div>
            <div class="reference-code">${data.bookingReference}</div>
          </div>
          <table class="details-table">
            <tr><td class="label">${labels.vehicle}</td><td class="value">${data.vehicleName}</td></tr>
            <tr><td class="label">${labels.pickup}</td><td class="value">${data.pickupDate} — ${data.pickupLocation}</td></tr>
            <tr><td class="label">${labels.return}</td><td class="value">${data.returnDate} — ${data.returnLocation}</td></tr>
            <tr><td class="label">${labels.tva}</td><td class="value">${labels.tvaValue}</td></tr>
            <tr><td class="label">${labels.fiscalStamp}</td><td class="value">${data.timbreFiscal || "1"} ${data.currency}</td></tr>
            ${data.contributionLF2026 ? `<tr><td class="label">${labels.lf2026}</td><td class="value">${data.contributionLF2026} ${data.currency}</td></tr>` : ""}
            ${data.pickupLocationFee ? `<tr><td class="label">${labels.pickupFee}</td><td class="value">+${data.pickupLocationFee} ${data.currency}</td></tr>` : ""}
            ${data.differentLocationFee ? `<tr><td class="label">${labels.oneWayFee}</td><td class="value">+${data.differentLocationFee} ${data.currency}</td></tr>` : ""}
            ${data.outOfTownFee ? `<tr><td class="label">${labels.outOfTownFee}</td><td class="value">+${data.outOfTownFee} ${data.currency}</td></tr>` : ""}
          </table>
          <div class="total-box">
            <div class="total-label">${labels.total}</div>
            <div class="total-val">${data.totalAmount} ${data.currency}</div>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 6px;">${labels.footerNote}</p>
          <p style="margin: 0;">${labels.automated}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject: subjects[data.language], html };
}
