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
  vehicleYear?: number;
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

/**
 * Generates an executive Black & White invoice / booking voucher in structured table view.
 * Complies with strict black & white accounting aesthetics:
 * - High contrast, monochrome elegance
 * - Clear table grids with column headers
 * - No sensitive data (no license plate, no vehicle year for clients)
 */
export function generateBookingPDF(data: PDFBookingData): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 14;
  const marginRight = 14;
  const contentWidth = pageWidth - marginLeft - marginRight; // 182 mm
  const currency = data.currency || "TND";
  const agencyName = (data.agencyName || "Payless Car Rental Tunisie").toUpperCase();
  const agencyPhone = data.agencyPhone || "+216 80 80 80 80";
  const agencyEmail = data.agencyEmail || "contact@paylesscarrental.tn";
  const agencyAddress = data.agencyAddress || "60, Avenue de l'UMA, Chotrana 1, La Soukra, Ariana";
  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("fr-FR")
    : new Date().toLocaleDateString("fr-FR");

  // ==========================================
  // 1. TOP HEADER & INVOICE META TABLE
  // ==========================================
  let y = 14;

  // Left Side: Company Identity
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(agencyName, marginLeft, y + 5);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text("HOUIMLI RENT A CAR SARL — Location de Véhicules Touristiques", marginLeft, y + 10.5);
  doc.text(`Adresse : ${agencyAddress}`, marginLeft, y + 15);
  doc.text(`Tél : ${agencyPhone}  |  Email : ${agencyEmail}`, marginLeft, y + 19.5);
  doc.text("Matricule Fiscale : 1678942/A/P/000  |  Code TVA : 1678942 A", marginLeft, y + 24);

  // Right Side: Professional Invoice Meta Box (Table format)
  const metaBoxWidth = 72;
  const metaBoxX = pageWidth - marginRight - metaBoxWidth;
  const metaBoxY = y;

  // Header of Meta Box (Solid Black with White Text)
  doc.setFillColor(0, 0, 0);
  doc.rect(metaBoxX, metaBoxY, metaBoxWidth, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("FACTURE / BON DE RÉSERVATION", metaBoxX + metaBoxWidth / 2, metaBoxY + 5, { align: "center" });

  // Body of Meta Box (Bordered Table Grid)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(metaBoxX, metaBoxY + 7, metaBoxWidth, 21, "D");

  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);

  // Row 1: Reference
  doc.setFont("helvetica", "bold");
  doc.text("N° Réf :", metaBoxX + 3, metaBoxY + 12);
  doc.setFont("helvetica", "bold");
  doc.text(data.bookingReference, metaBoxX + metaBoxWidth - 3, metaBoxY + 12, { align: "right" });
  doc.setDrawColor(210, 210, 210);
  doc.line(metaBoxX, metaBoxY + 14, metaBoxX + metaBoxWidth, metaBoxY + 14);

  // Row 2: Date
  doc.setFont("helvetica", "normal");
  doc.text("Date d'émission :", metaBoxX + 3, metaBoxY + 18.5);
  doc.text(formattedDate, metaBoxX + metaBoxWidth - 3, metaBoxY + 18.5, { align: "right" });
  doc.line(metaBoxX, metaBoxY + 21, metaBoxX + metaBoxWidth, metaBoxY + 21);

  // Row 3: Status
  doc.setFont("helvetica", "bold");
  doc.text("Statut :", metaBoxX + 3, metaBoxY + 25);
  doc.text("CONFIRMÉE (Auto)", metaBoxX + metaBoxWidth - 3, metaBoxY + 25, { align: "right" });

  y += 30;

  // Horizontal divider rule
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  doc.line(marginLeft, y, pageWidth - marginRight, y);

  y += 5;

  // ==========================================
  // 2. TWO-COLUMN TABLE: CLIENT & VEHICLE
  // ==========================================
  const colWidth = (contentWidth - 4) / 2;
  const colHeight = 32;

  // --- Left Table: Client / Driver ---
  doc.setFillColor(0, 0, 0);
  doc.rect(marginLeft, y, colWidth, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("1. INFORMATIONS DU CONDUCTEUR", marginLeft + 3, y + 4.2);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(marginLeft, y + 6, colWidth, colHeight - 6, "D");

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);

  const leftY = y + 10.5;
  doc.setFont("helvetica", "bold");
  doc.text("Nom & Prénom :", marginLeft + 3, leftY);
  doc.setFont("helvetica", "normal");
  doc.text(data.customerName || "Client", marginLeft + 28, leftY, { maxWidth: colWidth - 30 });

  doc.setFont("helvetica", "bold");
  doc.text("Tél / WhatsApp :", marginLeft + 3, leftY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(data.customerPhone || "-", marginLeft + 28, leftY + 5, { maxWidth: colWidth - 30 });

  doc.setFont("helvetica", "bold");
  doc.text("Adresse Email :", marginLeft + 3, leftY + 10);
  doc.setFont("helvetica", "normal");
  doc.text(data.customerEmail || "-", marginLeft + 28, leftY + 10, { maxWidth: colWidth - 30 });

  doc.setFont("helvetica", "bold");
  doc.text("Permis de conduire :", marginLeft + 3, leftY + 15);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Validé${data.drivingLicenceYear ? ` (Année : ${data.drivingLicenceYear})` : ""}`,
    marginLeft + 32,
    leftY + 15
  );

  doc.setFont("helvetica", "bold");
  doc.text("Pays de résidence :", marginLeft + 3, leftY + 20);
  doc.setFont("helvetica", "normal");
  doc.text(data.customerCountry || "Tunisie", marginLeft + 32, leftY + 20);

  // --- Right Table: Vehicle Info ---
  const rightX = marginLeft + colWidth + 4;
  doc.setFillColor(0, 0, 0);
  doc.rect(rightX, y, colWidth, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("2. VÉHICULE RÉSERVÉ", rightX + 3, y + 4.2);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(rightX, y + 6, colWidth, colHeight - 6, "D");

  doc.setTextColor(0, 0, 0);
  const rightY = y + 10.5;

  doc.setFont("helvetica", "bold");
  doc.text("Modèle réservé :", rightX + 3, rightY);
  doc.setFont("helvetica", "bold");
  // Vehicle year is strictly hidden from client invoice
  doc.text(`${data.vehicleBrand} ${data.vehicleModel}`, rightX + 28, rightY, { maxWidth: colWidth - 30 });

  doc.setFont("helvetica", "bold");
  doc.text("Catégorie :", rightX + 3, rightY + 5);
  doc.setFont("helvetica", "normal");
  doc.text("Économique / Standard Garantie", rightX + 28, rightY + 5);

  doc.setFont("helvetica", "bold");
  doc.text("Durée facturée :", rightX + 3, rightY + 10);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.rentalDuration} Jour(s)`, rightX + 28, rightY + 10);

  doc.setFont("helvetica", "bold");
  doc.text("Kilométrage :", rightX + 3, rightY + 15);
  doc.setFont("helvetica", "normal");
  doc.text("Illimité sur toute la Tunisie", rightX + 28, rightY + 15);

  doc.setFont("helvetica", "bold");
  doc.text("Garanties :", rightX + 3, rightY + 20);
  doc.setFont("helvetica", "normal");
  doc.text("Tous Risques avec Franchise Incluse", rightX + 28, rightY + 20);

  y += colHeight + 3.5;

  // ==========================================
  // 3. FULL-WIDTH TABLE: ITINERARY & SCHEDULE (PRISE EN CHARGE & RESTITUTION)
  // ==========================================
  const itinHeight = 20;
  const halfWidth = (contentWidth - 4) / 2;

  // Clean location labels (stripping leading "1. ", "2. ", etc.)
  const cleanPickupLoc = (data.pickupLocation || "Aéroport Tunis-Carthage").replace(/^\d+[\.\s\-]+\s*/, "").trim();
  const cleanReturnLoc = (data.returnLocation || "Aéroport Tunis-Carthage").replace(/^\d+[\.\s\-]+\s*/, "").trim();

  // Headers (Solid Black with White Text)
  doc.setFillColor(0, 0, 0);
  doc.rect(marginLeft, y, halfWidth, 6, "F");
  doc.rect(marginLeft + halfWidth + 4, y, halfWidth, 6, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("3. PRISE EN CHARGE DU VÉHICULE", marginLeft + 3, y + 4.2);
  doc.text("4. RESTITUTION DU VÉHICULE", marginLeft + halfWidth + 7, y + 4.2);

  // Bordered Content Boxes
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(marginLeft, y + 6, halfWidth, itinHeight - 6, "D");
  doc.rect(marginLeft + halfWidth + 4, y + 6, halfWidth, itinHeight - 6, "D");

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);

  // Left Content: Prise en charge
  const itinY = y + 10.5;
  doc.setFont("helvetica", "bold");
  doc.text("Date & Heure :", marginLeft + 3, itinY);
  doc.setFont("helvetica", "normal");
  doc.text(data.pickupDate, marginLeft + 24, itinY, { maxWidth: halfWidth - 26 });

  doc.setFont("helvetica", "bold");
  doc.text("Lieu / Agence :", marginLeft + 3, itinY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(cleanPickupLoc, marginLeft + 24, itinY + 5, { maxWidth: halfWidth - 26 });

  // Right Content: Restitution
  const rightItinX = marginLeft + halfWidth + 4;
  doc.setFont("helvetica", "bold");
  doc.text("Date & Heure :", rightItinX + 3, itinY);
  doc.setFont("helvetica", "normal");
  doc.text(data.returnDate, rightItinX + 24, itinY, { maxWidth: halfWidth - 26 });

  doc.setFont("helvetica", "bold");
  doc.text("Lieu / Agence :", rightItinX + 3, itinY + 5);
  doc.setFont("helvetica", "normal");
  doc.text(cleanReturnLoc, rightItinX + 24, itinY + 5, { maxWidth: halfWidth - 26 });

  y += itinHeight + 3.5;

  // ==========================================
  // 3. DETAILED INVOICE TABLE (BLACK & WHITE)
  // ==========================================
  const col1W = 96;  // Description
  const col2W = 24;  // Qty / Duration
  const col3W = 28;  // Unit Price
  const col4W = 34;  // Total

  const col1X = marginLeft;
  const col2X = col1X + col1W;
  const col3X = col2X + col2W;
  const col4X = col3X + col3W;

  // Table Header
  doc.setFillColor(0, 0, 0);
  doc.rect(marginLeft, y, contentWidth, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("DÉSIGNATION DE LA PRESTATION", col1X + 3, y + 4.8);
  doc.text("QTÉ / DURÉE", col2X + col2W / 2, y + 4.8, { align: "center" });
  doc.text(`P.U. (${currency})`, col3X + col3W - 3, y + 4.8, { align: "right" });
  doc.text(`TOTAL (${currency})`, col4X + col4W - 3, y + 4.8, { align: "right" });

  y += 7;

  // Items Rows
  interface InvoiceRow {
    desc: string;
    qty: string;
    unitPrice: string;
    total: string;
  }

  const invoiceRows: InvoiceRow[] = [
    {
      desc: `Location de base — ${data.vehicleBrand} ${data.vehicleModel}`,
      qty: `${data.rentalDuration} j`,
      unitPrice: (data.dailyRate / 100).toFixed(2),
      total: (data.subtotal / 100).toFixed(2),
    },
  ];

  if (data.extrasTotal && data.extrasTotal > 0) {
    invoiceRows.push({
      desc: "Options & Équipements supplémentaires",
      qty: "1 forfait",
      unitPrice: (data.extrasTotal / 100).toFixed(2),
      total: (data.extrasTotal / 100).toFixed(2),
    });
  }

  if (data.pickupLocationFee && data.pickupLocationFee > 0) {
    invoiceRows.push({
      desc: `Frais de livraison / prise en charge (${data.pickupLocation})`,
      qty: "1 service",
      unitPrice: (data.pickupLocationFee / 100).toFixed(2),
      total: (data.pickupLocationFee / 100).toFixed(2),
    });
  }

  if (data.returnLocationFee && data.returnLocationFee > 0) {
    invoiceRows.push({
      desc: `Frais de ramassage / restitution (${data.returnLocation})`,
      qty: "1 service",
      unitPrice: (data.returnLocationFee / 100).toFixed(2),
      total: (data.returnLocationFee / 100).toFixed(2),
    });
  } else if (data.outOfTownFee && data.outOfTownFee > 0) {
    invoiceRows.push({
      desc: `Frais de restitution hors Tunis (${data.returnLocation})`,
      qty: "1 service",
      unitPrice: (data.outOfTownFee / 100).toFixed(2),
      total: (data.outOfTownFee / 100).toFixed(2),
    });
  }

  if (data.differentLocationFee && data.differentLocationFee > 0) {
    invoiceRows.push({
      desc: "Frais de retour en agence différente (Aller-simple)",
      qty: "1 service",
      unitPrice: (data.differentLocationFee / 100).toFixed(2),
      total: (data.differentLocationFee / 100).toFixed(2),
    });
  }

  if (data.timbreFiscal && data.timbreFiscal > 0) {
    invoiceRows.push({
      desc: "Timbre fiscal légal obligatoire",
      qty: "1 unité",
      unitPrice: (data.timbreFiscal / 100).toFixed(2),
      total: (data.timbreFiscal / 100).toFixed(2),
    });
  }

  if (data.contributionLF2026 && data.contributionLF2026 > 0) {
    invoiceRows.push({
      desc: `Contribution Fiscale LF 2026 (${data.rentalDuration} jours)`,
      qty: `${data.rentalDuration} j`,
      unitPrice: (data.contributionLF2026 / data.rentalDuration / 100).toFixed(2),
      total: (data.contributionLF2026 / 100).toFixed(2),
    });
  }

  if (data.discountAmount && data.discountAmount > 0) {
    invoiceRows.push({
      desc: "Remise promotionnelle / Code de réduction appliqué",
      qty: "1 remise",
      unitPrice: `-${(data.discountAmount / 100).toFixed(2)}`,
      total: `-${(data.discountAmount / 100).toFixed(2)}`,
    });
  }

  invoiceRows.push({
    desc: "TVA (Taux 0% — Régime fiscal franchise)",
    qty: "0%",
    unitPrice: "0.00",
    total: "0.00",
  });

  const rowHeight = 6.2;
  doc.setFontSize(8);

  invoiceRows.forEach((row, index) => {
    // Alternating rows in white and very light grey
    if (index % 2 === 1) {
      doc.setFillColor(247, 247, 247);
      doc.rect(marginLeft, y, contentWidth, rowHeight, "F");
    }

    // Outer and inner borders
    doc.setDrawColor(215, 215, 215);
    doc.setLineWidth(0.2);
    doc.line(marginLeft, y + rowHeight, marginLeft + contentWidth, y + rowHeight);

    // Vertical column grid lines
    doc.line(col2X, y, col2X, y + rowHeight);
    doc.line(col3X, y, col3X, y + rowHeight);
    doc.line(col4X, y, col4X, y + rowHeight);

    // Text cells
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(row.desc, col1X + 3, y + 4.3);
    doc.text(row.qty, col2X + col2W / 2, y + 4.3, { align: "center" });
    doc.text(row.unitPrice, col3X + col3W - 3, y + 4.3, { align: "right" });
    doc.text(row.total, col4X + col4W - 3, y + 4.3, { align: "right" });

    y += rowHeight;
  });

  // Table outer border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  const tableTotalHeight = 7 + invoiceRows.length * rowHeight;
  doc.rect(marginLeft, y - tableTotalHeight, contentWidth, tableTotalHeight, "D");

  y += 3;

  // ==========================================
  // 4. TOTALS TABLE (SUMMARY BOX - RIGHT ALIGNED)
  // ==========================================
  const totalBoxWidth = 86;
  const totalBoxX = pageWidth - marginRight - totalBoxWidth;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);

  // Subtotal row
  doc.rect(totalBoxX, y, totalBoxWidth, 6, "D");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("Sous-total Hors Taxes (HT) :", totalBoxX + 3, y + 4.2);
  doc.text(`${(data.subtotal / 100).toFixed(2)} ${currency}`, totalBoxX + totalBoxWidth - 3, y + 4.2, {
    align: "right",
  });
  y += 6;

  // Taxes & fees row
  const feesAndTaxes =
    (data.pickupLocationFee || 0) +
    (data.returnLocationFee || 0) +
    (data.outOfTownFee || 0) +
    (data.differentLocationFee || 0) +
    (data.timbreFiscal || 0) +
    (data.contributionLF2026 || 0);

  doc.rect(totalBoxX, y, totalBoxWidth, 6, "D");
  doc.text("Taxes, Timbres & Frais de livraison :", totalBoxX + 3, y + 4.2);
  doc.text(`${(feesAndTaxes / 100).toFixed(2)} ${currency}`, totalBoxX + totalBoxWidth - 3, y + 4.2, {
    align: "right",
  });
  y += 6;

  // TOTAL TTC ROW (SOLID BLACK BACKGROUND WITH WHITE TEXT)
  doc.setFillColor(0, 0, 0);
  doc.rect(totalBoxX, y, totalBoxWidth, 9, "F");
  doc.setDrawColor(0, 0, 0);
  doc.rect(totalBoxX, y, totalBoxWidth, 9, "D");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL NET TTC À PAYER :", totalBoxX + 3, y + 6);
  doc.setFontSize(11);
  doc.text(`${(data.totalAmount / 100).toFixed(2)} ${currency}`, totalBoxX + totalBoxWidth - 3, y + 6.2, {
    align: "right",
  });

  y += 12;

  // Deposit note (Bordered Table Row)
  if (data.depositAmount && data.depositAmount > 0) {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(marginLeft, y, contentWidth, 7, "D");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Dépôt de garantie / Caution : ${(data.depositAmount / 100).toFixed(2)} ${currency} (empreinte bancaire non débitée, restituée au retour).`,
      marginLeft + 3,
      y + 4.7
    );
    y += 10;
  } else {
    y += 2;
  }

  // ==========================================
  // 5. TERMS & CONDITIONS (BORDERED TABLE)
  // ==========================================
  const termsBoxHeight = 24;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(marginLeft, y, contentWidth, termsBoxHeight, "D");

  // Title of terms
  doc.setFillColor(240, 240, 240);
  doc.rect(marginLeft, y, contentWidth, 5, "F");
  doc.line(marginLeft, y + 5, marginLeft + contentWidth, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text("CONDITIONS GÉNÉRALES & PIÈCES EXIGÉES LORS DU DÉPART :", marginLeft + 3, y + 3.7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(40, 40, 40);

  const tY = y + 8.5;
  doc.text(
    "1. Présentation obligatoire de l'original du permis de conduire valide (minimum 1 an d'ancienneté) et passeport ou CIN.",
    marginLeft + 3,
    tY
  );
  doc.text(
    "2. Le règlement s'effectue à la prise en charge du véhicule (Espèces en TND, devises convertibles, ou carte bancaire).",
    marginLeft + 3,
    tY + 4
  );
  doc.text(
    "3. Le véhicule doit être restitué avec le même niveau de carburant qu'à la livraison et dans le même état de propreté.",
    marginLeft + 3,
    tY + 8
  );
  doc.text(
    `4. Assistance dépannage et remorquage 24h/24 & 7j/7 disponible sur l'ensemble de la Tunisie au : ${agencyPhone}.`,
    marginLeft + 3,
    tY + 12
  );

  y += termsBoxHeight + 5;

  // ==========================================
  // 6. SIGNATURES (TWO BORDERED RECTANGLES)
  // ==========================================
  const sigBoxW = (contentWidth - 6) / 2;
  const sigBoxH = 20;

  // Customer signature box
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(marginLeft, y, sigBoxW, sigBoxH, "D");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text("Signature du Client / Conducteur :", marginLeft + 3, y + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(90, 90, 90);
  doc.text('(Mention manuscrite "Lu et approuvé")', marginLeft + 3, y + 8);

  // Agency signature box
  const agSigX = marginLeft + sigBoxW + 6;
  doc.rect(agSigX, y, sigBoxW, sigBoxH, "D");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`Cachet & Signature — ${agencyName} :`, agSigX + 3, y + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(90, 90, 90);
  doc.text("(Validation et enregistrement officiel de la réservation)", agSigX + 3, y + 8);

  // ==========================================
  // 7. FOOTER
  // ==========================================
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(marginLeft, pageHeight - 11, pageWidth - marginRight, pageHeight - 11);

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Document généré le ${new Date().toLocaleString("fr-FR")} | ${agencyName} — Houimli Rent a Car SARL | Page 1/1`,
    pageWidth / 2,
    pageHeight - 7,
    { align: "center" }
  );

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
