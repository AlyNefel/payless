const fs = require('fs');

const fleet = JSON.parse(fs.readFileSync('payless-car-rental/compiled_fleet.json', 'utf8'));

// Format fleet to match VehicleItem
const vehicleItems = fleet.map((c, i) => {
  return `  {
    id: "${c.id}",
    brand: "${c.brand}",
    model: "${c.model}",
    year: 2024,
    category: "${c.category}",
    transmission: "${c.transmission}",
    fuelType: "${c.fuelType}",
    seats: ${c.seats},
    doors: ${c.doors},
    licensePlate: "${120 + i} TN ${3400 + i}",
    mileage: ${12000 + (i * 2400)},
    status: "${i % 4 === 0 ? 'rented' : i === 8 ? 'maintenance' : 'available'}",
    pricing: {
      daily: ${c.dailyPriceTND},
      weekly: ${Math.round(c.dailyPriceTND * 6.2)},
      monthly: ${Math.round(c.dailyPriceTND * 24)},
      deposit: ${c.depositTND},
    },
    features: ${JSON.stringify(c.features)},
    imageUrl: "${c.mainImage}",
    color: "${['Gris Métallisé', 'Blanc Glacier', 'Noir Ébène', 'Bleu Nuit', 'Rouge Rubis'][i % 5]}",
    location: "${[
      'Aéroport de Tunis-Carthage (Terminal 1 & 2)',
      'Aéroport de Monastir Habib Bourguiba',
      'Agence La Soukra (Siège Social)',
      'Grand Tunis (Livraison Hôtels)',
      'Aéroport Enfidha-Hammamet',
      'Hammamet Ville & Zone Touristique'
    ][i % 6]}",
  }`;
}).join(',\n');

const content = `export interface VehicleItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: "Economy" | "Compact" | "SUV" | "Luxury" | "Sedan";
  transmission: "automatic" | "manual";
  fuelType: "gasoline" | "diesel" | "electric" | "hybrid";
  seats: number;
  doors: number;
  licensePlate: string;
  mileage: number;
  status: "available" | "rented" | "maintenance" | "archived";
  pricing: {
    daily: number; // in TND
    weekly: number;
    monthly: number;
    deposit: number;
  };
  features: string[];
  imageUrl: string;
  color: string;
  location: string;
}

export interface BookingItem {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  rentalDays: number;
  totalPrice: number; // in TND
  depositAmount: number;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  paymentStatus: "paid" | "partial" | "unpaid" | "refunded";
  paymentMethod: "Credit Card (Visa/MC)" | "Cash on Delivery (TND/EUR)" | "Bank Transfer";
  extras: string[];
  createdAt: string;
}

export interface CustomerItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  passportOrLicense: string;
  preferredLanguage: "fr" | "en" | "ar";
  totalBookings: number;
  totalSpent: number; // TND
  isVip: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
  notes: string;
  joinedDate: string;
}

export interface CouponItem {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  value: number; // % or TND
  minDays: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  description: string;
}

export interface PaymentItem {
  id: string;
  transactionId: string;
  bookingRef: string;
  customerName: string;
  amount: number; // TND
  category: "Car Rental" | "Extras & Insurance" | "Security Deposit" | "Cancellation Fee";
  method: "Credit Card (Visa/MC)" | "Cash on Delivery (TND/EUR)" | "Bank Transfer";
  date: string;
  status: "completed" | "pending" | "refunded" | "failed";
}

export interface EmailLogItem {
  id: string;
  recipient: string;
  customerName: string;
  subject: string;
  templateType: "Booking Confirmation" | "Rental Return Reminder" | "Payment Receipt" | "Booking Cancellation" | "Voucher Delivery";
  status: "Sent" | "Pending" | "Failed";
  sentAt: string;
  bookingRef?: string;
}

export interface AgencySettingsData {
  agencyName: string;
  legalName: string;
  rcNumber: string;
  patente: string;
  iceNumber: string;
  address: string;
  city: string;
  phone: string;
  supportEmail: string;
  website: string;
  currency: string;
  secondaryCurrency: string;
  exchangeRateEUR: number; // 1 EUR = ~3.35 TND
  taxRate: number; // in %
  standardDeposit: number; // TND
  luxuryDeposit: number; // TND
  workingHoursWeekday: string;
  workingHoursWeekend: string;
  airportPickup247: boolean;
  lateReturnGraceHours: number;
  emailOnNewBooking: boolean;
  smsOnVipBooking: boolean;
  whatsAppDispatcher: boolean;
  dailySummaryEmail: boolean;
}

// ── 25 Live Scraped Vehicles from HML Rent Car Tunisia ──
export const INITIAL_VEHICLES: VehicleItem[] = [
${vehicleItems}
];

export const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: "book-1",
    reference: "PAY-2026-TUN-01",
    customerName: "Kais Ben Amor",
    customerEmail: "k.benamor@gmail.com",
    customerPhone: "+216 98 123 456",
    vehicleId: "car-kia-sportage",
    vehicleName: "Kia Sportage BVA 2024",
    licensePlate: "214 TN 5510",
    pickupDate: "2026-11-04",
    returnDate: "2026-11-10",
    rentalDays: 6,
    pickupLocation: "Aéroport de Tunis-Carthage (Terminal 1 & 2)",
    returnLocation: "Aéroport de Tunis-Carthage (Terminal 1 & 2)",
    totalPrice: 1320,
    depositAmount: 4000,
    status: "active",
    paymentStatus: "paid",
    paymentMethod: "Credit Card (Visa/MC)",
    extras: ["2ème Conducteur Gratuit", "Plein Carburant Prépayé"],
    createdAt: "2026-11-01T10:30:00Z",
  },
  {
    id: "book-2",
    reference: "PAY-2026-TUN-02",
    customerName: "Jean-Pierre Dumont",
    customerEmail: "jp.dumont@orange.fr",
    customerPhone: "+33 6 45 67 89 10",
    vehicleId: "car-renault-clio-6-bvm",
    vehicleName: "Renault Clio 6 BVM",
    licensePlate: "220 TN 8812",
    pickupDate: "2026-11-05",
    returnDate: "2026-11-12",
    rentalDays: 7,
    pickupLocation: "Aéroport Enfidha-Hammamet",
    returnLocation: "Aéroport de Monastir Habib Bourguiba",
    totalPrice: 532,
    depositAmount: 800,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "Credit Card (Visa/MC)",
    extras: ["Siège Bébé Gratuit"],
    createdAt: "2026-11-02T14:15:00Z",
  },
  {
    id: "book-3",
    reference: "PAY-2026-TUN-03",
    customerName: "Syrine Trabelsi",
    customerEmail: "syrine.t@yahoo.fr",
    customerPhone: "+216 22 445 566",
    vehicleId: "car-hyundai-i10",
    vehicleName: "Hyundai i10 BVA",
    licensePlate: "228 TN 1024",
    pickupDate: "2026-11-03",
    returnDate: "2026-11-06",
    rentalDays: 3,
    pickupLocation: "Agence La Soukra (Siège Social)",
    returnLocation: "Grand Tunis (Livraison Hôtels)",
    totalPrice: 216,
    depositAmount: 600,
    status: "active",
    paymentStatus: "paid",
    paymentMethod: "Cash on Delivery (TND/EUR)",
    extras: [],
    createdAt: "2026-10-31T09:00:00Z",
  }
];

export const INITIAL_CUSTOMERS: CustomerItem[] = [
  {
    id: "cust-1",
    firstName: "Kais",
    lastName: "Ben Amor",
    email: "k.benamor@gmail.com",
    phone: "+216 98 123 456",
    country: "Tunisie",
    passportOrLicense: "TN0894125",
    preferredLanguage: "fr",
    totalBookings: 5,
    totalSpent: 4800,
    isVip: true,
    isBlacklisted: false,
    notes: "Client VIP fidèle. Préfère les SUV automatiques.",
    joinedDate: "2023-04-10",
  },
  {
    id: "cust-2",
    firstName: "Jean-Pierre",
    lastName: "Dumont",
    email: "jp.dumont@orange.fr",
    phone: "+33 6 45 67 89 10",
    country: "France",
    passportOrLicense: "FR9912048",
    preferredLanguage: "fr",
    totalBookings: 3,
    totalSpent: 1650,
    isVip: false,
    isBlacklisted: false,
    notes: "Touriste régulier à Hammamet et Sousse.",
    joinedDate: "2024-02-18",
  }
];

export const INITIAL_COUPONS: CouponItem[] = [
  {
    id: "coup-1",
    code: "TUNISIA2026",
    discountType: "percentage",
    value: 10,
    minDays: 3,
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    maxUses: 500,
    currentUses: 84,
    isActive: true,
    description: "Remise immédiate de 10% pour toute location de 3 jours et plus en Tunisie.",
  },
  {
    id: "coup-2",
    code: "BIENVENUE50",
    discountType: "fixed",
    value: 50,
    minDays: 5,
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    maxUses: 200,
    currentUses: 37,
    isActive: true,
    description: "50 TND de réduction pour les réservations de 5 jours et plus.",
  }
];

export const INITIAL_PAYMENTS: PaymentItem[] = [
  {
    id: "pay-1",
    transactionId: "TXN-2026-TUN-01",
    bookingRef: "PAY-2026-TUN-01",
    customerName: "Kais Ben Amor",
    amount: 1320,
    category: "Car Rental",
    method: "Credit Card (Visa/MC)",
    date: "2026-11-01 10:35",
    status: "completed",
  },
  {
    id: "pay-2",
    transactionId: "TXN-2026-TUN-02",
    bookingRef: "PAY-2026-TUN-02",
    customerName: "Jean-Pierre Dumont",
    amount: 532,
    category: "Car Rental",
    method: "Credit Card (Visa/MC)",
    date: "2026-11-02 14:20",
    status: "completed",
  }
];

export const INITIAL_EMAIL_LOGS: EmailLogItem[] = [
  {
    id: "em-1",
    recipient: "k.benamor@gmail.com",
    customerName: "Kais Ben Amor",
    subject: "Confirmation de Réservation & Bon de Location #PAY-2026-TUN-01",
    templateType: "Booking Confirmation",
    status: "Sent",
    sentAt: "2026-11-01 10:36",
    bookingRef: "PAY-2026-TUN-01",
  }
];

export const INITIAL_SETTINGS: AgencySettingsData = {
  agencyName: "Payless Car Rental Tunisia",
  legalName: "Houimli Rent a Car SARL",
  rcNumber: "RC Ariana B0112482012",
  patente: "1248910/A/M/000",
  iceNumber: "0001248910",
  address: "60, Avenue de l'UMA, Chotrana 1, La Soukra",
  city: "Ariana 2036, Tunisie",
  phone: "+216 25 120 130 / +216 24 220 277",
  supportEmail: "Reservations@hmlrentcar.tn",
  website: "https://hmlrentcar.tn",
  currency: "TND",
  secondaryCurrency: "EUR",
  exchangeRateEUR: 3.35,
  taxRate: 19,
  standardDeposit: 800,
  luxuryDeposit: 4000,
  workingHoursWeekday: "10:00 - 14:00 | 15:30 - 20:00",
  workingHoursWeekend: "10:00 - 14:00 (Samedi) / Fermé (Dimanche)",
  airportPickup247: true,
  lateReturnGraceHours: 2,
  emailOnNewBooking: true,
  smsOnVipBooking: true,
  whatsAppDispatcher: true,
  dailySummaryEmail: true,
};

// ── 11 Real Locations in Tunisia from HML Rent Car ──
export interface LocationItem {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  isAirport: boolean;
  isActive: boolean;
  openingHours: string;
  assignedVehiclesCount: number;
}

export const MOCK_LOCATIONS: LocationItem[] = [
  {
    id: "loc-1",
    code: "TUN",
    name: "1. AEROPORT DE TUNIS-CARTHAGE",
    city: "Tunis",
    address: "Terminal 1 & 2 Arrivées, Aéroport International Tunis-Carthage",
    phone: "+216 25 120 130",
    email: "tunis@paylesscarrental.tn",
    isAirport: true,
    isActive: true,
    openingHours: "24/7 (7j/7)",
    assignedVehiclesCount: 6,
  },
  {
    id: "loc-2",
    code: "MIR",
    name: "2. AEROPORT DE MONASTIR HABIB BOURGUIBA",
    city: "Monastir",
    address: "Hall Arrivées Internationales, Aéroport Monastir",
    phone: "+216 24 220 277",
    email: "monastir@paylesscarrental.tn",
    isAirport: true,
    isActive: true,
    openingHours: "24/7 (7j/7)",
    assignedVehiclesCount: 4,
  },
  {
    id: "loc-3",
    code: "SKR",
    name: "3. AGENCE SOUKRA (Siège Social)",
    city: "Ariana",
    address: "60, Avenue de l'UMA, Chotrana 1, La Soukra",
    phone: "+216 25 120 130",
    email: "soukra@paylesscarrental.tn",
    isAirport: false,
    isActive: true,
    openingHours: "10:00 - 14:00 & 15:30 - 20:00",
    assignedVehiclesCount: 5,
  },
  {
    id: "loc-4",
    code: "BIZ",
    name: "4. BIZERTE VILLE",
    city: "Bizerte",
    address: "Avenue Habib Bourguiba, Centre Ville Bizerte",
    phone: "+216 25 120 130",
    email: "bizerte@paylesscarrental.tn",
    isAirport: false,
    isActive: true,
    openingHours: "08:30 - 19:00",
    assignedVehiclesCount: 1,
  },
  {
    id: "loc-5",
    code: "NAB",
    name: "5. NABEUL VILLE",
    city: "Nabeul",
    address: "Avenue Habib Thameur, Nabeul",
    phone: "+216 25 120 130",
    email: "nabeul@paylesscarrental.tn",
    isAirport: false,
    isActive: true,
    openingHours: "08:30 - 19:00",
    assignedVehiclesCount: 1,
  },
  {
    id: "loc-6",
    code: "TUN-CTR",
    name: "6. GRAND TUNIS (Livraison Hôtels & Domicile)",
    city: "Tunis",
    address: "Centre Urbain Nord, Berges du Lac, Ennasr & Marsa",
    phone: "+216 24 220 277",
    email: "contact@paylesscarrental.tn",
    isAirport: false,
    isActive: true,
    openingHours: "08:00 - 22:00",
    assignedVehiclesCount: 3,
  },
  {
    id: "loc-7",
    code: "NBE",
    name: "7. AEROPORT ENFIDHA-HAMMAMET",
    city: "Enfidha",
    address: "Hall Terminal Arrivées, Aéroport Enfidha",
    phone: "+216 25 120 130",
    email: "enfidha@paylesscarrental.tn",
    isAirport: true,
    isActive: true,
    openingHours: "24/7 (7j/7)",
    assignedVehiclesCount: 3,
  },
  {
    id: "loc-8",
    code: "HAM",
    name: "8. HAMMAMET VILLE",
    city: "Hammamet",
    address: "Avenue des Hôtels, Zone Touristique Yasmine Hammamet",
    phone: "+216 24 220 277",
    email: "hammamet@paylesscarrental.tn",
    isAirport: false,
    isActive: true,
    openingHours: "08:00 - 20:00",
    assignedVehiclesCount: 2,
  },
  {
    id: "loc-9",
    code: "SFA",
    name: "9. SFAX VILLE",
    city: "Sfax",
    address: "Boulevard des Martyrs, Sfax",
    phone: "+216 25 120 130",
    email: "sfax@paylesscarrental.tn",
    isAirport: false,
    isActive: true,
    openingHours: "08:30 - 18:30",
    assignedVehiclesCount: 1,
  },
  {
    id: "loc-10",
    code: "SOU",
    name: "10. SOUSSE VILLE",
    city: "Sousse",
    address: "Boulevard 14 Janvier, Sousse & Port El Kantaoui",
    phone: "+216 24 220 277",
    email: "sousse@paylesscarrental.tn",
    isAirport: false,
    isActive: true,
    openingHours: "08:00 - 20:00",
    assignedVehiclesCount: 2,
  },
  {
    id: "loc-11",
    code: "JEN",
    name: "11. JENDOUBA VILLE (Nord-Ouest & Tabarka)",
    city: "Jendouba",
    address: "Avenue Habib Bourguiba, Jendouba",
    phone: "+216 25 120 130",
    email: "jendouba@paylesscarrental.tn",
    isAirport: false,
    isActive: true,
    openingHours: "09:00 - 18:00",
    assignedVehiclesCount: 1,
  },
];

// ── Live Fees & Extras from HML Rent Car ──
export interface FeeItem {
  id: string;
  code: string;
  name: string;
  category: "extra" | "fee" | "option" | "insurance";
  dayPrice: number; // in TND
  pricingType: "per_day" | "fixed" | "percentage";
  depositRequired: boolean;
  depositAmount: number;
  isActive: boolean;
  description: string;
}

export const MOCK_FEES: FeeItem[] = [
  {
    id: "fee-1",
    code: "2ND_DRIVER",
    name: "2ND DRIVER / Deuxième Conducteur",
    category: "extra",
    dayPrice: 0,
    pricingType: "per_day",
    depositRequired: false,
    depositAmount: 0,
    isActive: true,
    description: "Ajout d'un deuxième conducteur habilité sans supplément (Offert)",
  },
  {
    id: "fee-2",
    code: "BABY_SEAT",
    name: "BABY SEAT / Siège Bébé (0-13 kg)",
    category: "extra",
    dayPrice: 0,
    pricingType: "per_day",
    depositRequired: false,
    depositAmount: 0,
    isActive: true,
    description: "Siège auto homologué groupe 0+ pour nourrissons (Offert)",
  },
  {
    id: "fee-3",
    code: "CHILD_SEAT",
    name: "CHILD SEAT / Siège Enfant Rehausseur",
    category: "extra",
    dayPrice: 0,
    pricingType: "per_day",
    depositRequired: false,
    depositAmount: 0,
    isActive: true,
    description: "Rehausseur confort avec dossier réglable pour enfant (Offert)",
  },
  {
    id: "fee-4",
    code: "FUEL_STD",
    name: "FUEL / Option Plein Carburant Citadine & Compacte",
    category: "option",
    dayPrice: 70,
    pricingType: "fixed",
    depositRequired: false,
    depositAmount: 0,
    isActive: true,
    description: "Restitution du véhicule sans avoir à faire le plein (70 TND)",
  },
  {
    id: "fee-5",
    code: "FUEL_SUV",
    name: "FUEL / Option Plein Carburant SUV & Berline",
    category: "option",
    dayPrice: 90,
    pricingType: "fixed",
    depositRequired: false,
    depositAmount: 0,
    isActive: true,
    description: "Restitution du SUV ou Berline sans avoir à faire le plein (90 TND)",
  },
  {
    id: "fee-6",
    code: "GPS_NAV",
    name: "GPS NAVIGATION / GPS Cartographie Tunisie 2026",
    category: "extra",
    dayPrice: 40,
    pricingType: "per_day",
    depositRequired: false,
    depositAmount: 0,
    isActive: true,
    description: "GPS tactile avec points d'intérêts et guidage vocal",
  },
  {
    id: "fee-7",
    code: "AIRPORT_FEE",
    name: "AIRPORT PICKUP / Livraison & Accueil VIP Terminal Aéroport",
    category: "fee",
    dayPrice: 0,
    pricingType: "fixed",
    depositRequired: false,
    depositAmount: 0,
    isActive: true,
    description: "Accueil personnalisé avec pancarte nominative à la sortie des bagages (Gratuit)",
  },
  {
    id: "fee-8",
    code: "OUT_OF_HOURS",
    name: "OUT OF HOURS / Livraison Hors Horaires (22h00 – 06h00)",
    category: "fee",
    dayPrice: 50,
    pricingType: "fixed",
    depositRequired: false,
    depositAmount: 0,
    isActive: true,
    description: "Agent d'astreinte dédié pour remise des clés de nuit à l'aéroport (50 TND)",
  },
  {
    id: "fee-9",
    code: "INSURANCE_ZERO",
    name: "FULL COVER / Assurance Tous Risques Zéro Franchise",
    category: "insurance",
    dayPrice: 45,
    pricingType: "per_day",
    depositRequired: false,
    depositAmount: 0,
    isActive: true,
    description: "Exonération complète de caution et de franchise bris de glace, pneus et carrosserie (45 TND/j)",
  },
];
`;

fs.writeFileSync('payless-car-rental/src/app/admin/mockData.ts', content, 'utf8');
console.log('Successfully updated payless-car-rental/src/app/admin/mockData.ts with all scraped Tunisian fleet & locations!');

