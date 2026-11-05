export interface VehicleItem {
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
  {
    id: "car-dacia-sandero-bvm",
    brand: "Dacia",
    model: "SANDERO BVM",
    year: 2024,
    category: "Economy",
    transmission: "manual",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "120 TN 3400",
    mileage: 12000,
    status: "rented",
    pricing: {
      daily: 76,
      weekly: 471,
      monthly: 1824,
      deposit: 800,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5380.jpeg",
    color: "Gris Métallisé",
    location: "Aéroport de Tunis-Carthage (Terminal 1 & 2)",
  },
  {
    id: "car-dacia-sandero-stepway-bva",
    brand: "Dacia",
    model: "SANDERO STEPWAY BVA",
    year: 2024,
    category: "SUV",
    transmission: "automatic",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "121 TN 3401",
    mileage: 14400,
    status: "available",
    pricing: {
      daily: 90,
      weekly: 558,
      monthly: 2160,
      deposit: 800,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5443.jpeg",
    color: "Blanc Glacier",
    location: "Aéroport de Monastir Habib Bourguiba",
  },
  {
    id: "car-dacia-stepway-bvm",
    brand: "Dacia",
    model: "STEPWAY BVM",
    year: 2024,
    category: "SUV",
    transmission: "manual",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "122 TN 3402",
    mileage: 16800,
    status: "available",
    pricing: {
      daily: 80,
      weekly: 496,
      monthly: 1920,
      deposit: 800,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5448.jpeg",
    color: "Noir Ébène",
    location: "Agence La Soukra (Siège Social)",
  },
  {
    id: "car-hyundai-i10-bvm",
    brand: "Hyundai",
    model: "I10 BVM",
    year: 2024,
    category: "Economy",
    transmission: "manual",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "123 TN 3403",
    mileage: 19200,
    status: "available",
    pricing: {
      daily: 70,
      weekly: 434,
      monthly: 1680,
      deposit: 600,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5208.jpeg",
    color: "Bleu Nuit",
    location: "Grand Tunis (Livraison Hôtels)",
  },
  {
    id: "car-hyundai-i10",
    brand: "Hyundai",
    model: "I10",
    year: 2024,
    category: "Economy",
    transmission: "manual",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "124 TN 3404",
    mileage: 21600,
    status: "rented",
    pricing: {
      daily: 72,
      weekly: 446,
      monthly: 1728,
      deposit: 600,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5214.jpeg",
    color: "Rouge Rubis",
    location: "Aéroport Enfidha-Hammamet",
  },
  {
    id: "car-hyundai-i20-bvm",
    brand: "Hyundai",
    model: "I20 BVM",
    year: 2024,
    category: "Economy",
    transmission: "manual",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "125 TN 3405",
    mileage: 24000,
    status: "available",
    pricing: {
      daily: 76,
      weekly: 471,
      monthly: 1824,
      deposit: 800,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5211.jpeg",
    color: "Gris Métallisé",
    location: "Hammamet Ville & Zone Touristique",
  },
  {
    id: "car-kia-picanto-bva",
    brand: "Kia",
    model: "PICANTO BVA",
    year: 2024,
    category: "Economy",
    transmission: "automatic",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "126 TN 3406",
    mileage: 26400,
    status: "available",
    pricing: {
      daily: 72,
      weekly: 446,
      monthly: 1728,
      deposit: 600,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5233.jpeg",
    color: "Blanc Glacier",
    location: "Aéroport de Tunis-Carthage (Terminal 1 & 2)",
  },
  {
    id: "car-kia-picanto-bvm",
    brand: "Kia",
    model: "PICANTO BVM",
    year: 2024,
    category: "Economy",
    transmission: "manual",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "127 TN 3407",
    mileage: 28800,
    status: "available",
    pricing: {
      daily: 70,
      weekly: 434,
      monthly: 1680,
      deposit: 600,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790536947_IMG_5233.jpeg",
    color: "Noir Ébène",
    location: "Aéroport de Monastir Habib Bourguiba",
  },
  {
    id: "car-kia-sportage",
    brand: "Kia",
    model: "Sportage",
    year: 2024,
    category: "SUV",
    transmission: "manual",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "128 TN 3408",
    mileage: 31200,
    status: "rented",
    pricing: {
      daily: 220,
      weekly: 1364,
      monthly: 5280,
      deposit: 4000,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5394.jpeg",
    color: "Bleu Nuit",
    location: "Agence La Soukra (Siège Social)",
  },
  {
    id: "car-kia-stonic-bvm",
    brand: "Kia",
    model: "STONIC BVM",
    year: 2024,
    category: "SUV",
    transmission: "manual",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "129 TN 3409",
    mileage: 33600,
    status: "available",
    pricing: {
      daily: 80,
      weekly: 496,
      monthly: 1920,
      deposit: 800,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790616693_B7280593-B3D6-4583-95C2-8E6C5FEC9BE6.png",
    color: "Rouge Rubis",
    location: "Grand Tunis (Livraison Hôtels)",
  },
  {
    id: "car-mg-zs-bva",
    brand: "MG",
    model: "ZS BVA",
    year: 2024,
    category: "SUV",
    transmission: "automatic",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "130 TN 3410",
    mileage: 36000,
    status: "available",
    pricing: {
      daily: 130,
      weekly: 806,
      monthly: 3120,
      deposit: 1000,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5397.jpeg",
    color: "Gris Métallisé",
    location: "Aéroport Enfidha-Hammamet",
  },
  {
    id: "car-nissan-magnite-bva",
    brand: "Nissan",
    model: "MAGNITE BVA",
    year: 2024,
    category: "SUV",
    transmission: "automatic",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "131 TN 3411",
    mileage: 38400,
    status: "available",
    pricing: {
      daily: 86,
      weekly: 533,
      monthly: 2064,
      deposit: 1000,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5377.jpeg",
    color: "Blanc Glacier",
    location: "Hammamet Ville & Zone Touristique",
  },
  {
    id: "car-renault-clio-6-bvm",
    brand: "Renault",
    model: "CLIO 6 BVM",
    year: 2024,
    category: "Compact",
    transmission: "manual",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "132 TN 3412",
    mileage: 40800,
    status: "rented",
    pricing: {
      daily: 76,
      weekly: 471,
      monthly: 1824,
      deposit: 800,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5371.jpeg",
    color: "Noir Ébène",
    location: "Aéroport de Tunis-Carthage (Terminal 1 & 2)",
  },
  {
    id: "car-seat-arona-bva",
    brand: "Seat",
    model: "ARONA BVA",
    year: 2024,
    category: "SUV",
    transmission: "automatic",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "133 TN 3413",
    mileage: 43200,
    status: "available",
    pricing: {
      daily: 130,
      weekly: 806,
      monthly: 3120,
      deposit: 1500,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5222.jpeg",
    color: "Bleu Nuit",
    location: "Aéroport de Monastir Habib Bourguiba",
  },
  {
    id: "car-seat-ibiza-bva-excellence",
    brand: "Seat",
    model: "IBIZA BVA EXCELLENCE",
    year: 2024,
    category: "Compact",
    transmission: "automatic",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "134 TN 3414",
    mileage: 45600,
    status: "available",
    pricing: {
      daily: 99,
      weekly: 614,
      monthly: 2376,
      deposit: 1000,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1792861384_IMG_5220.jpeg",
    color: "Rouge Rubis",
    location: "Agence La Soukra (Siège Social)",
  },
  {
    id: "car-seat-ibiza-bva",
    brand: "Seat",
    model: "IBIZA BVA",
    year: 2024,
    category: "Compact",
    transmission: "automatic",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "135 TN 3415",
    mileage: 48000,
    status: "available",
    pricing: {
      daily: 85,
      weekly: 527,
      monthly: 2040,
      deposit: 800,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5220.jpeg",
    color: "Gris Métallisé",
    location: "Grand Tunis (Livraison Hôtels)",
  },
  {
    id: "car-seat-ibiza-bvm",
    brand: "Seat",
    model: "IBIZA BVM",
    year: 2024,
    category: "Compact",
    transmission: "manual",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "136 TN 3416",
    mileage: 50400,
    status: "rented",
    pricing: {
      daily: 76,
      weekly: 471,
      monthly: 1824,
      deposit: 800,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5221.jpeg",
    color: "Blanc Glacier",
    location: "Aéroport Enfidha-Hammamet",
  },
  {
    id: "car-seat-leon-bva",
    brand: "Seat",
    model: "LEON BVA",
    year: 2024,
    category: "Compact",
    transmission: "automatic",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "137 TN 3417",
    mileage: 52800,
    status: "available",
    pricing: {
      daily: 140,
      weekly: 868,
      monthly: 3360,
      deposit: 1500,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5223.jpeg",
    color: "Noir Ébène",
    location: "Hammamet Ville & Zone Touristique",
  },
  {
    id: "car-skoda-fabia-bvm",
    brand: "Skoda",
    model: "FABIA BVM",
    year: 2024,
    category: "Compact",
    transmission: "manual",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "138 TN 3418",
    mileage: 55200,
    status: "available",
    pricing: {
      daily: 76,
      weekly: 471,
      monthly: 1824,
      deposit: 800,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5391.jpeg",
    color: "Bleu Nuit",
    location: "Aéroport de Tunis-Carthage (Terminal 1 & 2)",
  },
  {
    id: "car-skoda-kushaq-bva",
    brand: "Skoda",
    model: "KUSHAQ BVA",
    year: 2024,
    category: "SUV",
    transmission: "automatic",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "139 TN 3419",
    mileage: 57600,
    status: "available",
    pricing: {
      daily: 130,
      weekly: 806,
      monthly: 3120,
      deposit: 1000,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5388.jpeg",
    color: "Rouge Rubis",
    location: "Aéroport de Monastir Habib Bourguiba",
  },
  {
    id: "car-suzuki-swift-bva",
    brand: "Suzuki",
    model: "SWIFT BVA",
    year: 2024,
    category: "Economy",
    transmission: "automatic",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "140 TN 3420",
    mileage: 60000,
    status: "rented",
    pricing: {
      daily: 72,
      weekly: 446,
      monthly: 1728,
      deposit: 600,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5217.jpeg",
    color: "Gris Métallisé",
    location: "Agence La Soukra (Siège Social)",
  },
  {
    id: "car-suzuki-swift-bvm",
    brand: "Suzuki",
    model: "SWIFT BVM",
    year: 2024,
    category: "Economy",
    transmission: "manual",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "141 TN 3421",
    mileage: 62400,
    status: "available",
    pricing: {
      daily: 70,
      weekly: 434,
      monthly: 1680,
      deposit: 600,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5235.jpeg",
    color: "Blanc Glacier",
    location: "Grand Tunis (Livraison Hôtels)",
  },
  {
    id: "car-vw-t-cross-bva",
    brand: "Volkswagen",
    model: "VW T-CROSS BVA",
    year: 2024,
    category: "SUV",
    transmission: "automatic",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "142 TN 3422",
    mileage: 64800,
    status: "available",
    pricing: {
      daily: 130,
      weekly: 806,
      monthly: 3120,
      deposit: 1000,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5269.jpeg",
    color: "Noir Ébène",
    location: "Aéroport Enfidha-Hammamet",
  },
  {
    id: "car-vw-virtus-bva",
    brand: "Volkswagen",
    model: "VW VIRTUS BVA",
    year: 2024,
    category: "Compact",
    transmission: "automatic",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "143 TN 3423",
    mileage: 67200,
    status: "available",
    pricing: {
      daily: 90,
      weekly: 558,
      monthly: 2160,
      deposit: 800,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5265.jpeg",
    color: "Bleu Nuit",
    location: "Hammamet Ville & Zone Touristique",
  },
  {
    id: "car-vw-virtus-bvm",
    brand: "Volkswagen",
    model: "VW VIRTUS BVM",
    year: 2024,
    category: "Compact",
    transmission: "manual",
    fuelType: "gasoline",
    seats: 5,
    doors: 5,
    licensePlate: "144 TN 3424",
    mileage: 69600,
    status: "rented",
    pricing: {
      daily: 90,
      weekly: 558,
      monthly: 2160,
      deposit: 800,
    },
    features: ["Climatisation (A/C)","Air Bags","Direction assistée (Power Steering)","Verrouillage centralisé (Central Locking)","Vitres électriques (Electric Windows)","ABS","Système Audio HD / Bluetooth"],
    imageUrl: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5266.jpeg",
    color: "Rouge Rubis",
    location: "Aéroport de Tunis-Carthage (Terminal 1 & 2)",
  }
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
