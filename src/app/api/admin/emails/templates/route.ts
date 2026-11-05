import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import EmailTemplate from "@/models/EmailTemplate";

const DEFAULT_TEMPLATES = [
  {
    type: "booking_confirmation",
    language: "fr",
    name: "Confirmation de Réservation",
    description: "Envoyé immédiatement au client après validation de la réservation",
    subject: "Confirmation de votre réservation - {{bookingReference}} | Payless Car Rental",
    preheader: "Votre réservation est confirmée. Préparez votre voyage en Tunisie avec Payless.",
    variables: [
      "customerName",
      "bookingReference",
      "vehicleName",
      "pickupLocation",
      "returnLocation",
      "pickupDate",
      "returnDate",
      "totalAmount",
      "depositAmount",
      "currency",
      "flightNumber",
      "licenseNumber",
      "insurancePackage",
      "timbreFiscal",
      "contributionLF2026",
      "agencyPhone",
      "agencyEmail",
      "specialRequests"
    ],
    customFields: [
      {
        id: "cf-1",
        key: "flightNumber",
        label: "Numéro de vol",
        defaultValue: "Non renseigné",
        type: "text",
        required: false
      },
      {
        id: "cf-2",
        key: "cautionBancaire",
        label: "Montant caution par carte",
        defaultValue: "1 500 TND (empreinte)",
        type: "text",
        required: true
      },
      {
        id: "cf-3",
        key: "whatsappAssistance",
        label: "Contact WhatsApp d'accueil",
        defaultValue: "+216 22 123 456",
        type: "text",
        required: true
      }
    ],
    isActive: true,
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmation de Réservation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #1d4ed8, #2563eb); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 24px; }
    .ref-box { background: #eff6ff; border: 1px dashed #3b82f6; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
    .ref-title { font-size: 11px; text-transform: uppercase; color: #2563eb; font-weight: 700; margin-bottom: 4px; }
    .ref-code { font-size: 22px; font-weight: 800; color: #1d4ed8; font-family: monospace; }
    .table-details { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .table-details tr { border-bottom: 1px solid #f1f5f9; }
    .table-details td { padding: 10px 4px; }
    .table-details td.label { color: #64748b; font-weight: 500; width: 45%; }
    .table-details td.value { font-weight: 600; text-align: right; color: #0f172a; }
    .total-box { background: #0f172a; color: #ffffff; padding: 18px 20px; border-radius: 12px; margin-top: 24px; display: flex; justify-content: space-between; align-items: center; }
    .total-label { font-size: 13px; color: #94a3b8; }
    .total-val { font-size: 20px; font-weight: 800; color: #60a5fa; }
    .custom-section { background: #f8fafc; border-radius: 12px; padding: 16px; margin-top: 20px; border: 1px solid #e2e8f0; }
    .footer { padding: 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>PAYLESS CAR RENTAL</h1>
      <p>Tunisie — Prise en charge & Contrat Officiel</p>
    </div>
    <div class="content">
      <p style="font-size: 16px; font-weight: bold; margin-top: 0;">Bonjour {{customerName}},</p>
      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        Nous avons le plaisir de vous confirmer votre réservation de véhicule chez <strong>Payless Tunisie</strong>. Notre équipe prépare votre voiture pour vous accueillir dans les meilleures conditions.
      </p>

      <div class="ref-box">
        <div class="ref-title">Numéro de Réservation</div>
        <div class="ref-code">{{bookingReference}}</div>
      </div>

      <table class="table-details">
        <tr><td class="label">Véhicule Réservé</td><td class="value">{{vehicleName}}</td></tr>
        <tr><td class="label">Prise en charge</td><td class="value">{{pickupDate}} ({{pickupLocation}})</td></tr>
        <tr><td class="label">Restitution</td><td class="value">{{returnDate}} ({{returnLocation}})</td></tr>
        <tr><td class="label">Numéro de vol</td><td class="value">{{flightNumber}}</td></tr>
        <tr><td class="label">Permis de conduire</td><td class="value">{{licenseNumber}}</td></tr>
        <tr><td class="label">Protection / Assurance</td><td class="value">{{insurancePackage}}</td></tr>
        <tr><td class="label">Timbre fiscal (DGI)</td><td class="value">{{timbreFiscal}} {{currency}}</td></tr>
        <tr><td class="label">Taxe LF 2026 (2 DT/jour)</td><td class="value">{{contributionLF2026}} {{currency}}</td></tr>
      </table>

      <!-- Champs personnalisables configurés dans l'admin -->
      <div class="custom-section">
        <div style="font-size: 12px; font-weight: bold; color: #1e293b; margin-bottom: 8px;">Informations Pratiques & Remise des Clés :</div>
        <div style="font-size: 12px; color: #475569; line-height: 1.5;">
          • Caution bancaire requise sur place : <strong>{{cautionBancaire}}</strong><br>
          • Assistance WhatsApp aéroport 24/7 : <strong>{{whatsappAssistance}}</strong><br>
          • Documents obligatoires à la remise : Passeport + Permis de conduire original (+2 ans)
        </div>
      </div>

      <div class="total-box">
        <div>
          <div class="total-label">Montant Total TTC</div>
          <div style="font-size: 11px; color: #94a3b8;">Kilométrage & Taxes inclus</div>
        </div>
        <div class="total-val">{{totalAmount}} {{currency}}</div>
      </div>
    </div>
    <div class="footer">
      Payless Car Rental Tunisie • Houimli Rent a Car SARL<br>
      Assistance client : {{agencyPhone}} | {{agencyEmail}}
    </div>
  </div>
</body>
</html>`,
    textBody: `Bonjour {{customerName}},

Votre réservation {{bookingReference}} pour le véhicule {{vehicleName}} est confirmée.
Prise en charge : {{pickupDate}} à {{pickupLocation}}
Restitution : {{returnDate}} à {{returnLocation}}
Montant total : {{totalAmount}} {{currency}}

Documents requis : Permis de conduire + Passeport.
Contact assistance : {{agencyPhone}}`
  },
  {
    type: "booking_confirmation",
    language: "en",
    name: "Booking Confirmation",
    description: "Sent to customer immediately after booking confirmation",
    subject: "Booking Confirmation - {{bookingReference}} | Payless Car Rental Tunisia",
    preheader: "Your car rental in Tunisia is confirmed. View details and pickup instructions.",
    variables: [
      "customerName",
      "bookingReference",
      "vehicleName",
      "pickupLocation",
      "returnLocation",
      "pickupDate",
      "returnDate",
      "totalAmount",
      "currency",
      "flightNumber",
      "licenseNumber",
      "agencyPhone",
      "agencyEmail"
    ],
    customFields: [
      {
        id: "cf-en-1",
        key: "flightNumber",
        label: "Flight Number",
        defaultValue: "Not specified",
        type: "text",
        required: false
      },
      {
        id: "cf-en-2",
        key: "depositNotice",
        label: "Credit Card Security Deposit",
        defaultValue: "1,500 TND pre-authorization",
        type: "text",
        required: true
      }
    ],
    isActive: true,
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Confirmation</title>
  <style>
    body { font-family: sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #2563eb; padding: 28px; text-align: center; color: #fff; }
    .content { padding: 28px; font-size: 14px; color: #334155; }
    .ref-code { font-size: 20px; font-weight: bold; color: #1d4ed8; text-align: center; padding: 12px; background: #eff6ff; border-radius: 8px; margin: 16px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 style="margin:0;font-size:22px;">PAYLESS CAR RENTAL</h1>
      <p style="margin:4px 0 0;font-size:12px;">Tunisia Airport & City Car Rental</p>
    </div>
    <div class="content">
      <p>Dear <strong>{{customerName}}</strong>,</p>
      <p>Your car rental reservation has been successfully confirmed. Our team is ready to welcome you.</p>
      <div class="ref-code">Reference: {{bookingReference}}</div>
      <p><strong>Vehicle:</strong> {{vehicleName}}</p>
      <p><strong>Pickup:</strong> {{pickupDate}} at {{pickupLocation}}</p>
      <p><strong>Return:</strong> {{returnDate}} at {{returnLocation}}</p>
      <p><strong>Flight:</strong> {{flightNumber}}</p>
      <p><strong>Total Amount:</strong> {{totalAmount}} {{currency}}</p>
    </div>
    <div class="footer">Payless Car Rental Tunisia • Contact: {{agencyPhone}} | {{agencyEmail}}</div>
  </div>
</body>
</html>`,
    textBody: `Dear {{customerName}},\n\nYour reservation {{bookingReference}} is confirmed.\nVehicle: {{vehicleName}}\nPickup: {{pickupDate}} at {{pickupLocation}}\nTotal: {{totalAmount}} {{currency}}`
  },
  {
    type: "booking_pending",
    language: "fr",
    name: "Réservation en Attente",
    description: "Envoyé lors de la réception d'une demande de réservation avant validation",
    subject: "Réservation reçue en cours de traitement - {{bookingReference}} | Payless",
    preheader: "Nous avons bien reçu votre demande de réservation et vérifions la disponibilité.",
    variables: ["customerName", "bookingReference", "vehicleName", "pickupDate", "totalAmount", "currency"],
    customFields: [],
    isActive: true,
    htmlBody: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f8fafc;padding:20px;"><div style="max-width:600px;margin:0 auto;background:#fff;padding:24px;border-radius:12px;border:1px solid #e2e8f0;"><h2>Bonjour {{customerName}},</h2><p>Nous avons bien reçu votre demande de réservation <strong>{{bookingReference}}</strong> pour le véhicule <strong>{{vehicleName}}</strong>.</p><p>Notre équipe valide la disponibilité et vous recontactera sous 2 heures avec le contrat officiel.</p><p>Montant estimé : <strong>{{totalAmount}} {{currency}}</strong></p></div></body></html>`,
    textBody: `Bonjour {{customerName}},\n\nVotre demande {{bookingReference}} est en cours de traitement.`
  },
  {
    type: "pickup_reminder",
    language: "fr",
    name: "Rappel de Prise en Charge",
    description: "Envoyé la veille de la prise en charge du véhicule",
    subject: "Rappel : Prise de votre véhicule demain - {{bookingReference}} | Payless",
    preheader: "Votre véhicule vous attend demain. Retrouvez l'emplacement et les documents à apporter.",
    variables: ["customerName", "bookingReference", "vehicleName", "pickupLocation", "pickupDate", "agencyPhone"],
    customFields: [
      {
        id: "cf-p1",
        key: "agentPhone",
        label: "Téléphone agent d'accueil aéroport",
        defaultValue: "+216 22 123 456",
        type: "text",
        required: true
      }
    ],
    isActive: true,
    htmlBody: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f8fafc;padding:20px;"><div style="max-width:600px;margin:0 auto;background:#fff;padding:24px;border-radius:12px;border:1px solid #e2e8f0;"><h2>Rappel de Prise en Charge</h2><p>Bonjour {{customerName}},</p><p>Votre voiture <strong>{{vehicleName}}</strong> est prête pour votre arrivée le <strong>{{pickupDate}}</strong> à <strong>{{pickupLocation}}</strong>.</p><p>Agent sur place : {{agentPhone}}</p></div></body></html>`,
    textBody: `Bonjour {{customerName}},\n\nRappel pour votre location {{bookingReference}} demain à {{pickupLocation}}.`
  },
  {
    type: "return_reminder",
    language: "fr",
    name: "Rappel de Restitution",
    description: "Envoyé 24h avant la fin du contrat de location",
    subject: "Rappel : Restitution de votre véhicule - {{bookingReference}} | Payless",
    preheader: "Pensez à vérifier le niveau de carburant avant la restitution de votre véhicule.",
    variables: ["customerName", "bookingReference", "vehicleName", "returnLocation", "returnDate", "agencyPhone"],
    customFields: [],
    isActive: true,
    htmlBody: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f8fafc;padding:20px;"><div style="max-width:600px;margin:0 auto;background:#fff;padding:24px;border-radius:12px;border:1px solid #e2e8f0;"><h2>Restitution de Véhicule</h2><p>Bonjour {{customerName}},</p><p>Nous vous rappelons que la restitution de la <strong>{{vehicleName}}</strong> est prévue le <strong>{{returnDate}}</strong> à <strong>{{returnLocation}}</strong>.</p><p>Rappel : restitution avec le même niveau d'essence qu'au départ.</p></div></body></html>`,
    textBody: `Bonjour {{customerName}},\n\nRappel restitution {{bookingReference}} le {{returnDate}} à {{returnLocation}}.`
  },
  {
    type: "payment_confirmation",
    language: "fr",
    name: "Confirmation de Paiement",
    description: "Envoyé après réception et validation d'un règlement",
    subject: "Reçu de paiement confirmé - {{bookingReference}} | Payless Car Rental",
    preheader: "Votre règlement a été validé avec succès. Téléchargez votre reçu.",
    variables: ["customerName", "bookingReference", "totalAmount", "depositAmount", "currency"],
    customFields: [],
    isActive: true,
    htmlBody: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f8fafc;padding:20px;"><div style="max-width:600px;margin:0 auto;background:#fff;padding:24px;border-radius:12px;border:1px solid #e2e8f0;"><h2>Paiement Validé</h2><p>Bonjour {{customerName}},</p><p>Votre paiement pour la réservation <strong>{{bookingReference}}</strong> a été reçu avec succès.</p><p>Montant réglé : <strong>{{totalAmount}} {{currency}}</strong></p></div></body></html>`,
    textBody: `Bonjour {{customerName}},\n\nPaiement reçu pour la réservation {{bookingReference}}. Montant: {{totalAmount}} {{currency}}`
  }
];

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("language");
    const type = searchParams.get("type");

    const query: Record<string, unknown> = {};
    if (lang && lang !== "all") query.language = lang;
    if (type && type !== "all") query.type = type;

    let templates = await EmailTemplate.find(query).sort({ type: 1, language: 1 }).lean();

    // Auto-seed if collection is empty
    if (templates.length === 0 && (!lang || lang === "all") && (!type || type === "all")) {
      const existingCount = await EmailTemplate.countDocuments();
      if (existingCount === 0) {
        await EmailTemplate.insertMany(DEFAULT_TEMPLATES);
        templates = await EmailTemplate.find().sort({ type: 1, language: 1 }).lean();
      }
    }

    return NextResponse.json({
      success: true,
      templates,
      count: templates.length,
    });
  } catch (error) {
    console.error("[API_EMAIL_TEMPLATES_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du chargement des modèles d'email" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.type || !body.subject || !body.htmlBody) {
      return NextResponse.json(
        { success: false, error: "Type, Sujet et Corps HTML sont obligatoires." },
        { status: 400 }
      );
    }

    const language = body.language || "fr";

    // Check if combination of type + language already exists
    const existing = await EmailTemplate.findOne({ type: body.type, language });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Un modèle pour le type '${body.type}' en langue '${language}' existe déjà.` },
        { status: 409 }
      );
    }

    const newTemplate = await EmailTemplate.create({
      name: body.name || body.subject,
      description: body.description || "",
      type: body.type,
      language,
      subject: body.subject,
      preheader: body.preheader || "",
      htmlBody: body.htmlBody,
      textBody: body.textBody || "",
      variables: Array.isArray(body.variables) ? body.variables : [],
      customFields: Array.isArray(body.customFields) ? body.customFields : [],
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json({
      success: true,
      template: newTemplate,
      message: "Modèle créé avec succès",
    });
  } catch (error) {
    console.error("[API_EMAIL_TEMPLATES_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création du modèle d'email" },
      { status: 500 }
    );
  }
}

