import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import connectDB from "@/lib/db";
import EmailTemplate from "@/models/EmailTemplate";

const DEFAULT_SAMPLE_DATA: Record<string, string> = {
  customerName: "Mohamed Ben Salem",
  customerEmail: "client.test@payless.tn",
  customerPhone: "+216 22 123 456",
  bookingReference: "PAY-TN-2026-999",
  vehicleName: "Renault Clio 6 (2025)",
  pickupLocation: "Aéroport de Tunis-Carthage (TUN)",
  returnLocation: "Aéroport de Tunis-Carthage (TUN)",
  pickupDate: "2026-11-15 à 10:00",
  returnDate: "2026-11-20 à 18:00",
  totalAmount: "450",
  depositAmount: "90",
  currency: "TND",
  flightNumber: "TU 722",
  licenseNumber: "12/987654",
  insurancePackage: "Pack Sérénité (Franchise Réduite)",
  timbreFiscal: "1",
  contributionLF2026: "10",
  agencyPhone: "+216 71 123 456",
  agencyEmail: "contact@paylesscarrental.com",
  specialRequests: "Livraison au terminal 1 avec siège enfant",
  cautionBancaire: "1 500 TND (Empreinte CB)",
  whatsappAssistance: "+216 22 123 456",
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const to = body.to?.trim();
    if (!to || !to.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Adresse email destinataire invalide." },
        { status: 400 }
      );
    }

    let subject = body.subject || "Test Email Payless Car Rental";
    let html = body.htmlBody || "";

    // If templateId provided and no html given, load from DB
    if (body.templateId && !html) {
      const tpl = await EmailTemplate.findById(body.templateId).lean();
      if (tpl) {
        subject = tpl.subject;
        html = tpl.htmlBody;
      }
    }

    if (!html) {
      return NextResponse.json(
        { success: false, error: "Contenu HTML introuvable pour l'envoi." },
        { status: 400 }
      );
    }

    // Merge sample data with any custom fields provided
    const mergedData = { ...DEFAULT_SAMPLE_DATA, ...(body.sampleData || {}) };

    // Substitute {{variable}} in subject and html
    Object.entries(mergedData).forEach(([key, val]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      subject = subject.replace(regex, String(val));
      html = html.replace(regex, String(val));
    });

    const result = await sendEmail({
      to,
      toName: mergedData.customerName,
      subject: `[TEST] ${subject}`,
      html,
      templateType: body.templateType || "test_email",
      language: body.language || "fr",
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Email de test envoyé avec succès à ${to}`,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Échec de l'envoi de l'email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API_EMAIL_SEND_TEST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de l'envoi du test" },
      { status: 500 }
    );
  }
}

