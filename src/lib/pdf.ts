import { jsPDF } from "jspdf";

export interface PDFBookingData {
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry?: string;
  drivingLicenceYear?: string | number;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  rentalDuration: number;
  dailyRate: number;
  subtotal: number;
  extrasTotal?: number;
  discountAmount?: number;
  pickupLocationFee?: number;
  returnLocationFee?: number;
  differentLocationFee?: number;
  outOfTownFee?: number;
  timbreFiscal?: number;
  contributionLF2026?: number;
  taxAmount?: number;
  totalAmount: number;
  depositAmount?: number;
  currency?: string;
  agencyName?: string;
  agencyPhone?: string;
  agencyEmail?: string;
  agencyAddress?: string;
  createdAt?: string;
}

export function generateBookingPDF(data: PDFBookingData): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const currency = data.currency || "TND";
  const agencyName = data.agencyName || "Payless Car Rental Tunisie";
  const agencyPhone = data.agencyPhone || "80808080";
  const agencyEmail = data.agencyEmail || "contact@paylesscarrental.tn";
  const agencyAddress = data.agencyAddress || "60, Avenue de l'UMA, Chotrana 1, La Soukra, Ariana";

  // --- Header Banner ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, "F");

  // Accent Line
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 42, pageWidth, 2.5, "F");

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(agencyName.toUpperCase(), 14, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("BON DE RÉSERVATION OFFICIEL — CONFIRMATION INSTANTANÉE", 14, 25);
  doc.text(`${agencyAddress} | Tél: ${agencyPhone} | Email: ${agencyEmail}`, 14, 32);

  // Booking Reference Badge
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(pageWidth - 65, 12, 51, 20, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("RÉFÉRENCE", pageWidth - 39.5, 18, { align: "center" });
  doc.setFontSize(13);
  doc.text(data.bookingReference, pageWidth - 39.5, 26, { align: "center" });

  let y = 54;

  // Status confirmed stamp
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.6);
  doc.roundedRect(14, y, pageWidth - 28, 12, 1.5, 1.5, "D");
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("✓ STATUT : RÉSERVATION CONFIRMÉE AUTOMATIQUEMENT — VÉHICULE GARANTI", 18, y + 7.5);
  y += 18;

  // --- Two Columns: Client & Vehicle ---
  const colWidth = (pageWidth - 32) / 2;

  // Client Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, colWidth, 38, 2, 2, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMATIONS CONDUCTEUR", 18, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Nom complet : ${data.customerName}`, 18, y + 14);
  doc.text(`Téléphone / WhatsApp : ${data.customerPhone}`, 18, y + 20);
  doc.text(`Email : ${data.customerEmail}`, 18, y + 26);
  doc.text(`Pays : ${data.customerCountry || "Tunisie"}${data.drivingLicenceYear ? ` | Année Permis : ${data.drivingLicenceYear}` : ""}`, 18, y + 32);

  // Vehicle Box (NO SENSITIVE DATA: No license plate, no mileage, no color)
  doc.roundedRect(14 + colWidth + 4, y, colWidth, 38, 2, 2, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("VÉHICULE RÉSERVÉ", 18 + colWidth + 4, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text(`${data.vehicleBrand} ${data.vehicleModel}`, 18 + colWidth + 4, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Catégorie : Flotte Standard & Économique Garantie", 18 + colWidth + 4, y + 22);
  doc.text("Climatisation, Airbags, Bluetooth, Direction assistée", 18 + colWidth + 4, y + 27);
  doc.text("Assurance : Tous Risques avec Franchise Incluse", 18 + colWidth + 4, y + 32);

  y += 44;

  // --- Rental Dates and Locations Box ---
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DÉTAILS DE LA LOCATION", 18, y + 6);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  doc.text(`• Prise en charge : ${data.pickupDate}`, 18, y + 13);
  doc.text(`  Lieu : ${data.pickupLocation}`, 18, y + 18);

  doc.text(`• Restitution : ${data.returnDate}`, 18 + colWidth, y + 13);
  doc.text(`  Lieu : ${data.returnLocation}`, 18 + colWidth, y + 18);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text(`Durée totale de location facturée : ${data.rentalDuration} jour(s)`, 18, y + 24);

  y += 34;

  // --- Detailed Pricing Table ---
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, pageWidth - 28, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("DÉSIGNATION / RUBRIQUE", 18, y + 5);
  doc.text(`MONTANT (${currency})`, pageWidth - 18, y + 5, { align: "right" });

  y += 7;

  const rows: [string, string][] = [
    [
      `Location de base (${data.rentalDuration} j × ${(data.dailyRate / 100).toFixed(2)} DT)`,
      `${(data.subtotal / 100).toFixed(2)} ${currency}`,
    ],
  ];

  if (data.extrasTotal && data.extrasTotal > 0) {
    rows.push([
      "Options & Équipements supplémentaires",
      `+${(data.extrasTotal / 100).toFixed(2)} ${currency}`,
    ]);
  }

  if (data.pickupLocationFee && data.pickupLocationFee > 0) {
    rows.push([
      `Frais de livraison / prise en charge (${data.pickupLocation})`,
      `+${(data.pickupLocationFee / 100).toFixed(2)} ${currency}`,
    ]);
  }

  if (data.returnLocationFee && data.returnLocationFee > 0) {
    rows.push([
      `Frais de ramassage / restitution (${data.returnLocation})`,
      `+${(data.returnLocationFee / 100).toFixed(2)} ${currency}`,
    ]);
  } else if (data.outOfTownFee && data.outOfTownFee > 0) {
    rows.push([
      `Frais de restitution hors Tunis (${data.returnLocation})`,
      `+${(data.outOfTownFee / 100).toFixed(2)} ${currency}`,
    ]);
  }

  if (data.differentLocationFee && data.differentLocationFee > 0) {
    rows.push([
      "Frais restitution agence différente (Aller-simple)",
      `+${(data.differentLocationFee / 100).toFixed(2)} ${currency}`,
    ]);
  }

  if (data.timbreFiscal && data.timbreFiscal > 0) {
    rows.push([
      "Timbre fiscal obligatoire",
      `+${(data.timbreFiscal / 100).toFixed(2)} ${currency}`,
    ]);
  }

  if (data.contributionLF2026 && data.contributionLF2026 > 0) {
    rows.push([
      `Contribution Fiscale LF 2026 (${data.rentalDuration} jours)`,
      `+${(data.contributionLF2026 / 100).toFixed(2)} ${currency}`,
    ]);
  }

  if (data.discountAmount && data.discountAmount > 0) {
    rows.push([
      "Remise promotionnelle / Code coupon appliqué",
      `-${(data.discountAmount / 100).toFixed(2)} ${currency}`,
    ]);
  }

  rows.push(["TVA (Taux 0% inclus)", `0.00 ${currency}`]);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  rows.forEach((row, i) => {
    const isEven = i % 2 === 0;
    if (isEven) {
      doc.setFillColor(250, 250, 250);
      doc.rect(14, y, pageWidth - 28, 6.2, "F");
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 6.2, pageWidth - 14, y + 6.2);

    doc.setTextColor(30, 41, 59);
    doc.text(row[0], 18, y + 4.3);
    doc.text(row[1], pageWidth - 18, y + 4.3, { align: "right" });
    y += 6.2;
  });

  // Total Box
  y += 2;
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(14, y, pageWidth - 28, 12, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("MONTANT TOTAL NET TTC À RÉGLER", 18, y + 8);
  doc.setFontSize(14);
  doc.text(`${(data.totalAmount / 100).toFixed(2)} ${currency}`, pageWidth - 18, y + 8.5, { align: "right" });

  y += 18;

  // Deposit note
  if (data.depositAmount && data.depositAmount > 0) {
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, y, pageWidth - 28, 9, 1, 1, "FD");
    doc.setTextColor(146, 64, 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(
      `ℹ Caution par pré-autorisation carte ou accord : ${(data.depositAmount / 100).toFixed(2)} ${currency} (restituée à l'état des lieux de retour).`,
      18,
      y + 5.8
    );
    y += 14;
  }

  // --- Terms & Instructions ---
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("CONDITIONS ET DOCUMENTS À FOURNIR LORS DU DÉPART :", 14, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("1. Présenter l'original de votre permis de conduire (en cours de validité depuis plus d'un an).", 14, y);
  y += 4;
  doc.text("2. Présenter votre passeport ou carte d'identité nationale valide.", 14, y);
  y += 4;
  doc.text("3. Le paiement de la location s'effectue directement à la livraison en dinars tunisiens ou devises convertibles.", 14, y);
  y += 4;
  doc.text("4. Assistance dépannage 24h/24 & 7j/7 sur tout le territoire tunisien au numéro : " + agencyPhone, 14, y);

  // Signatures
  y += 8;
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 80, 20, 1, 1, "D");
  doc.roundedRect(pageWidth - 94, y, 80, 20, 1, 1, "D");

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Signature du client :", 18, y + 5);
  doc.text(`Cachet & Signature ${agencyName} :`, pageWidth - 90, y + 5);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Document généré le ${new Date().toLocaleString("fr-FR")} | ${agencyName} — Houimli Rent a Car SARL | Tous droits réservés.`,
    pageWidth / 2,
    290,
    { align: "center" }
  );

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

