import connectDB from "./db";
import {
  User,
  Location,
  VehicleCategory,
  Vehicle,
  Extra,
  Promotion,
  Coupon,
  Customer,
  Booking,
  Notification,
  AgencySetting,
} from "@/models";
import bcrypt from "bcryptjs";

export interface SeedResult {
  success: boolean;
  message: string;
  counts: {
    users: number;
    locations: number;
    categories: number;
    vehicles: number;
    extras: number;
    promotions: number;
    coupons: number;
    customers: number;
    bookings: number;
    notifications: number;
    settings: number;
  };
}

export async function seedDatabase(): Promise<SeedResult> {
  await connectDB();

  // 1. Superadmin User
  const adminEmail = "admin@paylesscarrental.com";
  let superadmin = await User.findOne({ email: adminEmail }).select("+password");

  if (!superadmin) {
    const hashedPassword = await bcrypt.hash("Admin@12345!", 12);
    superadmin = await User.create({
      name: "Admin Payless Tunisia",
      email: adminEmail,
      password: hashedPassword,
      role: "superadmin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      phone: "+216 25 120 130",
      isActive: true,
      preferences: {
        language: "fr",
        notifications: true,
      },
    });
  } else {
    const isPassMatch = await superadmin.comparePassword("Admin@12345!");
    if (!isPassMatch || superadmin.role !== "superadmin") {
      const hashedPassword = await bcrypt.hash("Admin@12345!", 12);
      await User.findByIdAndUpdate(superadmin._id, {
        password: hashedPassword,
        role: "superadmin",
        isActive: true,
      });
    }
  }

  // 2. 11 Locations in Tunisia (from HML Rent Car)
  const locationDefs = [
    {
      name: {
        fr: "1. Aéroport de Tunis-Carthage (TUN)",
        en: "1. Tunis-Carthage International Airport (TUN)",
        ar: "1. مطار تونس قرطاج الدولي (TUN)",
      },
      address: "Terminal 1 & 2 Arrivées, Aéroport International Tunis-Carthage",
      city: "Tunis",
      country: "Tunisia",
      phone: "+216 25 120 130",
      email: "tunis@paylesscarrental.tn",
      coordinates: { lat: 36.8510, lng: 10.2272 },
      isAirport: true,
      isActive: true,
      openingHours: {
        monday: { open: "00:00", close: "23:59", isOpen: true },
        tuesday: { open: "00:00", close: "23:59", isOpen: true },
        wednesday: { open: "00:00", close: "23:59", isOpen: true },
        thursday: { open: "00:00", close: "23:59", isOpen: true },
        friday: { open: "00:00", close: "23:59", isOpen: true },
        saturday: { open: "00:00", close: "23:59", isOpen: true },
        sunday: { open: "00:00", close: "23:59", isOpen: true },
      },
    },
    {
      name: {
        fr: "2. Aéroport de Monastir Habib Bourguiba (MIR)",
        en: "2. Monastir Habib Bourguiba Airport (MIR)",
        ar: "2. مطار الحبيب بورقيبة المنستير (MIR)",
      },
      address: "Hall Arrivées Internationales, Aéroport Monastir",
      city: "Monastir",
      country: "Tunisia",
      phone: "+216 24 220 277",
      email: "monastir@paylesscarrental.tn",
      coordinates: { lat: 35.7581, lng: 10.7547 },
      isAirport: true,
      isActive: true,
      openingHours: {
        monday: { open: "00:00", close: "23:59", isOpen: true },
        tuesday: { open: "00:00", close: "23:59", isOpen: true },
        wednesday: { open: "00:00", close: "23:59", isOpen: true },
        thursday: { open: "00:00", close: "23:59", isOpen: true },
        friday: { open: "00:00", close: "23:59", isOpen: true },
        saturday: { open: "00:00", close: "23:59", isOpen: true },
        sunday: { open: "00:00", close: "23:59", isOpen: true },
      },
    },
    {
      name: {
        fr: "3. Agence La Soukra (Siège Social)",
        en: "3. La Soukra Agency (Headquarters)",
        ar: "3. وكالة سكرة (المقر الرئيسي)",
      },
      address: "60, Avenue de l'UMA, Chotrana 1, La Soukra, Ariana 2036",
      city: "Ariana",
      country: "Tunisia",
      phone: "+216 25 120 130",
      email: "soukra@paylesscarrental.tn",
      coordinates: { lat: 36.8761, lng: 10.2241 },
      isAirport: false,
      isActive: true,
      openingHours: {
        monday: { open: "10:00", close: "20:00", isOpen: true },
        tuesday: { open: "10:00", close: "20:00", isOpen: true },
        wednesday: { open: "10:00", close: "20:00", isOpen: true },
        thursday: { open: "10:00", close: "20:00", isOpen: true },
        friday: { open: "10:00", close: "20:00", isOpen: true },
        saturday: { open: "10:00", close: "14:00", isOpen: true },
        sunday: { open: "00:00", close: "00:00", isOpen: false },
      },
    },
    {
      name: {
        fr: "4. Bizerte Ville",
        en: "4. Bizerte Downtown",
        ar: "4. بنزرت المدينة",
      },
      address: "Avenue Habib Bourguiba, Centre-Ville, Bizerte",
      city: "Bizerte",
      country: "Tunisia",
      phone: "+216 25 120 130",
      email: "bizerte@paylesscarrental.tn",
      coordinates: { lat: 37.2744, lng: 9.8739 },
      isAirport: false,
      isActive: true,
      openingHours: {
        monday: { open: "08:30", close: "19:00", isOpen: true },
        tuesday: { open: "08:30", close: "19:00", isOpen: true },
        wednesday: { open: "08:30", close: "19:00", isOpen: true },
        thursday: { open: "08:30", close: "19:00", isOpen: true },
        friday: { open: "08:30", close: "19:00", isOpen: true },
        saturday: { open: "08:30", close: "14:00", isOpen: true },
        sunday: { open: "00:00", close: "00:00", isOpen: false },
      },
    },
    {
      name: {
        fr: "5. Nabeul Ville",
        en: "5. Nabeul Downtown",
        ar: "5. نابل المدينة",
      },
      address: "Avenue Habib Thameur, Nabeul",
      city: "Nabeul",
      country: "Tunisia",
      phone: "+216 25 120 130",
      email: "nabeul@paylesscarrental.tn",
      coordinates: { lat: 36.4561, lng: 10.7376 },
      isAirport: false,
      isActive: true,
      openingHours: {
        monday: { open: "08:30", close: "19:00", isOpen: true },
        tuesday: { open: "08:30", close: "19:00", isOpen: true },
        wednesday: { open: "08:30", close: "19:00", isOpen: true },
        thursday: { open: "08:30", close: "19:00", isOpen: true },
        friday: { open: "08:30", close: "19:00", isOpen: true },
        saturday: { open: "08:30", close: "14:00", isOpen: true },
        sunday: { open: "00:00", close: "00:00", isOpen: false },
      },
    },
    {
      name: {
        fr: "6. Grand Tunis (Livraison Hôtels & Domicile)",
        en: "6. Greater Tunis (Hotel & Doorstep Delivery)",
        ar: "6. تونس الكبرى (تسليم الفنادق والمنازل)",
      },
      address: "Berges du Lac, Centre Urbain Nord, Ennasr & La Marsa",
      city: "Tunis",
      country: "Tunisia",
      phone: "+216 24 220 277",
      email: "grandtunis@paylesscarrental.tn",
      coordinates: { lat: 36.8322, lng: 10.2312 },
      isAirport: false,
      isActive: true,
      openingHours: {
        monday: { open: "08:00", close: "22:00", isOpen: true },
        tuesday: { open: "08:00", close: "22:00", isOpen: true },
        wednesday: { open: "08:00", close: "22:00", isOpen: true },
        thursday: { open: "08:00", close: "22:00", isOpen: true },
        friday: { open: "08:00", close: "22:00", isOpen: true },
        saturday: { open: "08:00", close: "22:00", isOpen: true },
        sunday: { open: "08:00", close: "20:00", isOpen: true },
      },
    },
    {
      name: {
        fr: "7. Aéroport Enfidha-Hammamet (NBE)",
        en: "7. Enfidha-Hammamet Airport (NBE)",
        ar: "7. مطار النفيضة الحمامات (NBE)",
      },
      address: "Hall Terminal Arrivées, Aéroport International Enfidha",
      city: "Enfidha",
      country: "Tunisia",
      phone: "+216 25 120 130",
      email: "enfidha@paylesscarrental.tn",
      coordinates: { lat: 36.0758, lng: 10.4386 },
      isAirport: true,
      isActive: true,
      openingHours: {
        monday: { open: "00:00", close: "23:59", isOpen: true },
        tuesday: { open: "00:00", close: "23:59", isOpen: true },
        wednesday: { open: "00:00", close: "23:59", isOpen: true },
        thursday: { open: "00:00", close: "23:59", isOpen: true },
        friday: { open: "00:00", close: "23:59", isOpen: true },
        saturday: { open: "00:00", close: "23:59", isOpen: true },
        sunday: { open: "00:00", close: "23:59", isOpen: true },
      },
    },
    {
      name: {
        fr: "8. Hammamet Ville & Yasmine Hammamet",
        en: "8. Hammamet City & Yasmine Resort",
        ar: "8. الحمامات المدينة وياسمين الحمامات",
      },
      address: "Avenue des Hôtels, Zone Touristique Yasmine Hammamet",
      city: "Hammamet",
      country: "Tunisia",
      phone: "+216 24 220 277",
      email: "hammamet@paylesscarrental.tn",
      coordinates: { lat: 36.3812, lng: 10.5519 },
      isAirport: false,
      isActive: true,
      openingHours: {
        monday: { open: "08:00", close: "20:00", isOpen: true },
        tuesday: { open: "08:00", close: "20:00", isOpen: true },
        wednesday: { open: "08:00", close: "20:00", isOpen: true },
        thursday: { open: "08:00", close: "20:00", isOpen: true },
        friday: { open: "08:00", close: "20:00", isOpen: true },
        saturday: { open: "08:00", close: "20:00", isOpen: true },
        sunday: { open: "09:00", close: "18:00", isOpen: true },
      },
    },
    {
      name: {
        fr: "9. Sfax Ville",
        en: "9. Sfax City",
        ar: "9. صفاقس المدينة",
      },
      address: "Boulevard des Martyrs, Centre Ville Sfax",
      city: "Sfax",
      country: "Tunisia",
      phone: "+216 25 120 130",
      email: "sfax@paylesscarrental.tn",
      coordinates: { lat: 34.7406, lng: 10.7603 },
      isAirport: false,
      isActive: true,
      openingHours: {
        monday: { open: "08:30", close: "18:30", isOpen: true },
        tuesday: { open: "08:30", close: "18:30", isOpen: true },
        wednesday: { open: "08:30", close: "18:30", isOpen: true },
        thursday: { open: "08:30", close: "18:30", isOpen: true },
        friday: { open: "08:30", close: "18:30", isOpen: true },
        saturday: { open: "08:30", close: "14:00", isOpen: true },
        sunday: { open: "00:00", close: "00:00", isOpen: false },
      },
    },
    {
      name: {
        fr: "10. Sousse Ville & Port El Kantaoui",
        en: "10. Sousse City & Port El Kantaoui",
        ar: "10. سوسة المدينة وبور القنطاوي",
      },
      address: "Boulevard 14 Janvier, Sousse & Port El Kantaoui",
      city: "Sousse",
      country: "Tunisia",
      phone: "+216 24 220 277",
      email: "sousse@paylesscarrental.tn",
      coordinates: { lat: 35.8256, lng: 10.6369 },
      isAirport: false,
      isActive: true,
      openingHours: {
        monday: { open: "08:00", close: "20:00", isOpen: true },
        tuesday: { open: "08:00", close: "20:00", isOpen: true },
        wednesday: { open: "08:00", close: "20:00", isOpen: true },
        thursday: { open: "08:00", close: "20:00", isOpen: true },
        friday: { open: "08:00", close: "20:00", isOpen: true },
        saturday: { open: "08:00", close: "20:00", isOpen: true },
        sunday: { open: "09:00", close: "18:00", isOpen: true },
      },
    },
    {
      name: {
        fr: "11. Jendouba Ville & Tabarka",
        en: "11. Jendouba & Tabarka",
        ar: "11. جندوبة وطبرقة",
      },
      address: "Avenue Habib Bourguiba, Jendouba",
      city: "Jendouba",
      country: "Tunisia",
      phone: "+216 25 120 130",
      email: "jendouba@paylesscarrental.tn",
      coordinates: { lat: 36.5011, lng: 8.7802 },
      isAirport: false,
      isActive: true,
      openingHours: {
        monday: { open: "09:00", close: "18:00", isOpen: true },
        tuesday: { open: "09:00", close: "18:00", isOpen: true },
        wednesday: { open: "09:00", close: "18:00", isOpen: true },
        thursday: { open: "09:00", close: "18:00", isOpen: true },
        friday: { open: "09:00", close: "18:00", isOpen: true },
        saturday: { open: "09:00", close: "14:00", isOpen: true },
        sunday: { open: "00:00", close: "00:00", isOpen: false },
      },
    },
  ];

  const locationsMap = new Map<string, typeof Location.prototype>();
  for (const locData of locationDefs) {
    const loc = await Location.findOneAndUpdate(
      { "name.en": locData.name.en },
      { $set: locData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    locationsMap.set(locData.city, loc);
  }

  // 3. 4 Vehicle Categories
  const categoryDefs = [
    {
      name: {
        fr: "Économique & Citadine",
        en: "Economy & City",
        ar: "اقتصادية وصغيرة",
      },
      slug: "economy-city",
      icon: "Car",
      description: {
        fr: "Véhicules maniables et très économiques pour la ville et les déplacements quotidiens en Tunisie.",
        en: "Agile, fuel-efficient compact cars ideal for city driving and daily commuting across Tunisia.",
        ar: "سيارات رشيقة واقتصادية للغاية مناسبة للمدن والتنقلات اليومية في تونس.",
      },
      image: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5214.jpeg",
      order: 1,
      isActive: true,
    },
    {
      name: {
        fr: "Compacte & Berline",
        en: "Compact & Sedan",
        ar: "مدمجة وسيدان",
      },
      slug: "compact-sedan",
      icon: "Briefcase",
      description: {
        fr: "Polyvalence, espace coffre généreux et confort pour les autoroutes et les voyages d'affaires.",
        en: "Versatility, spacious luggage capacity and high comfort for highways and executive travel.",
        ar: "عملية ومريحة مع مساحة واسعة للأمتعة لرحلات الطرق السريعة والأعمال.",
      },
      image: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5371.jpeg",
      order: 2,
      isActive: true,
    },
    {
      name: {
        fr: "SUV & Crossover",
        en: "SUV & Crossover",
        ar: "دفع رباعي وكروس أوفر",
      },
      slug: "suv-crossover",
      icon: "Shield",
      description: {
        fr: "Position de conduite haute, garde au sol surélevée et sécurité optimale pour toute la famille.",
        en: "Elevated driving stance, generous clearance, and maximum safety for family vacations.",
        ar: "وضعية قيادة مرتفعة ومستوى أمان ممتاز للعائلات في كل مسالك تونس.",
      },
      image: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5394.jpeg",
      order: 3,
      isActive: true,
    },
    {
      name: {
        fr: "Prestige & Luxe",
        en: "Prestige & Luxury",
        ar: "فخامة وتميز",
      },
      slug: "luxury-prestige",
      icon: "Crown",
      description: {
        fr: "Finitions haut de gamme, boîtes automatiques de pointe et motorisations performantes.",
        en: "Top-tier styling, advanced automatic gearboxes, and powerful engines for discerning clients.",
        ar: "مظهر راقٍ مع أحدث نواقل الحركة الأوتوماتيكية وتجهيزات الرفاهية الكاملة.",
      },
      image: "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5395.jpeg",
      order: 4,
      isActive: true,
    },
  ];

  const categoriesMap = new Map<string, typeof VehicleCategory.prototype>();
  for (const catData of categoryDefs) {
    const cat = await VehicleCategory.findOneAndUpdate(
      { slug: catData.slug },
      { $set: catData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categoriesMap.set(catData.slug, cat);
  }

  // 4. Seed all 25 Vehicles from HML Rent Car
  const defaultLoc = locationsMap.get("Tunis") || Array.from(locationsMap.values())[0];

  const vehiclesMap = new Map<string, typeof Vehicle.prototype>();
  const rawFleet = [
  {
    "id": "car-dacia-sandero-bvm",
    "name": "DACIA SANDERO BVM",
    "slug": "dacia-sandero-bvm",
    "brand": "Dacia",
    "model": "SANDERO BVM",
    "category": "Economy",
    "transmission": "manual",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 76,
    "dailyPriceEUR": 23,
    "depositTND": 800,
    "depositEUR": 239,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5380.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5384.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5379.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5380.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5384.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5379.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-dacia-sandero-stepway-bva",
    "name": "DACIA SANDERO STEPWAY BVA",
    "slug": "dacia-sandero-stepway-bva",
    "brand": "Dacia",
    "model": "SANDERO STEPWAY BVA",
    "category": "SUV",
    "transmission": "automatic",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 90,
    "dailyPriceEUR": 27,
    "depositTND": 800,
    "depositEUR": 239,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5443.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5444.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5446.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5443.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5444.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5446.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-dacia-stepway-bvm",
    "name": "DACIA STEPWAY BVM",
    "slug": "dacia-stepway-bvm",
    "brand": "Dacia",
    "model": "STEPWAY BVM",
    "category": "SUV",
    "transmission": "manual",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 80,
    "dailyPriceEUR": 24,
    "depositTND": 800,
    "depositEUR": 239,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5448.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5447.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5445.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5448.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5447.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5445.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-hyundai-i10-bvm",
    "name": "HYUNDAI I10 BVM",
    "slug": "hyundai-i10-bvm",
    "brand": "Hyundai",
    "model": "I10 BVM",
    "category": "Economy",
    "transmission": "manual",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 70,
    "dailyPriceEUR": 21,
    "depositTND": 600,
    "depositEUR": 179,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5208.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790363152_IMG_5209.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790363153_IMG_5210.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5208.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790363152_IMG_5209.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790363153_IMG_5210.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-hyundai-i10",
    "name": "HYUNDAI I10",
    "slug": "hyundai-i10",
    "brand": "Hyundai",
    "model": "I10",
    "category": "Economy",
    "transmission": "manual",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 72,
    "dailyPriceEUR": 21,
    "depositTND": 600,
    "depositEUR": 179,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5214.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5209.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5210.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5214.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5209.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5210.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-hyundai-i20-bvm",
    "name": "HYUNDAI I20 BVM",
    "slug": "hyundai-i20-bvm",
    "brand": "Hyundai",
    "model": "I20 BVM",
    "category": "Economy",
    "transmission": "manual",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 76,
    "dailyPriceEUR": 23,
    "depositTND": 800,
    "depositEUR": 239,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5211.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5212.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5213.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5211.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5212.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5213.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-kia-picanto-bva",
    "name": "Kia PICANTO BVA",
    "slug": "kia-picanto-bva",
    "brand": "Kia",
    "model": "PICANTO BVA",
    "category": "Economy",
    "transmission": "automatic",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 72,
    "dailyPriceEUR": 21,
    "depositTND": 600,
    "depositEUR": 179,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5233.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5234.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5232.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5233.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5234.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5232.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-kia-picanto-bvm",
    "name": "Kia PICANTO BVM",
    "slug": "kia-picanto-bvm",
    "brand": "Kia",
    "model": "PICANTO BVM",
    "category": "Economy",
    "transmission": "manual",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 70,
    "dailyPriceEUR": 21,
    "depositTND": 600,
    "depositEUR": 179,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790536947_IMG_5233.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5231.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790536948_IMG_5232.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790536947_IMG_5233.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5231.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790536948_IMG_5232.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-kia-sportage",
    "name": "KIA Sportage",
    "slug": "kia-sportage",
    "brand": "Kia",
    "model": "Sportage",
    "category": "SUV",
    "transmission": "manual",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 220,
    "dailyPriceEUR": 66,
    "depositTND": 4000,
    "depositEUR": 1194,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5394.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5395.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5396.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5394.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5395.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5396.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-kia-stonic-bvm",
    "name": "Kia STONIC BVM",
    "slug": "kia-stonic-bvm",
    "brand": "Kia",
    "model": "STONIC BVM",
    "category": "SUV",
    "transmission": "manual",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 80,
    "dailyPriceEUR": 24,
    "depositTND": 800,
    "depositEUR": 239,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790616693_B7280593-B3D6-4583-95C2-8E6C5FEC9BE6.png",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790616693_IMG_5237.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5238.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790616693_B7280593-B3D6-4583-95C2-8E6C5FEC9BE6.png",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790616693_IMG_5237.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5238.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-mg-zs-bva",
    "name": "MG ZS BVA",
    "slug": "mg-zs-bva",
    "brand": "MG",
    "model": "ZS BVA",
    "category": "SUV",
    "transmission": "automatic",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 130,
    "dailyPriceEUR": 39,
    "depositTND": 1000,
    "depositEUR": 299,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5397.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5398.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5399.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5397.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5398.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5399.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-nissan-magnite-bva",
    "name": "Nissan MAGNITE BVA",
    "slug": "nissan-magnite-bva",
    "brand": "Nissan",
    "model": "MAGNITE BVA",
    "category": "SUV",
    "transmission": "automatic",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 86,
    "dailyPriceEUR": 26,
    "depositTND": 1000,
    "depositEUR": 299,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5377.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5378.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1791844475_IMG_5379.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5377.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5378.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1791844475_IMG_5379.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-renault-clio-6-bvm",
    "name": "RENAULT CLIO 6 BVM",
    "slug": "renault-clio-6-bvm",
    "brand": "Renault",
    "model": "CLIO 6 BVM",
    "category": "Compact",
    "transmission": "manual",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 76,
    "dailyPriceEUR": 23,
    "depositTND": 800,
    "depositEUR": 239,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5371.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5372.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5373.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5371.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5372.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5373.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-seat-arona-bva",
    "name": "SEAT ARONA BVA",
    "slug": "seat-arona-bva",
    "brand": "Seat",
    "model": "ARONA BVA",
    "category": "SUV",
    "transmission": "automatic",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 130,
    "dailyPriceEUR": 39,
    "depositTND": 1500,
    "depositEUR": 448,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5222.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790431125_IMG_5225.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790431126_IMG_5227.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5222.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790431125_IMG_5225.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790431126_IMG_5227.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-seat-ibiza-bva-excellence",
    "name": "SEAT IBIZA BVA EXCELLENCE",
    "slug": "seat-ibiza-bva-excellence",
    "brand": "Seat",
    "model": "IBIZA BVA EXCELLENCE",
    "category": "Compact",
    "transmission": "automatic",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 99,
    "dailyPriceEUR": 30,
    "depositTND": 1000,
    "depositEUR": 299,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1792861384_IMG_5220.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1792861385_9ca95029-8467-43e3-aad8-8a12f75e56cf.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1792861385_IMG_5219.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1792861384_IMG_5220.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1792861385_9ca95029-8467-43e3-aad8-8a12f75e56cf.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1792861385_IMG_5219.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-seat-ibiza-bva",
    "name": "SEAT IBIZA BVA",
    "slug": "seat-ibiza-bva",
    "brand": "Seat",
    "model": "IBIZA BVA",
    "category": "Compact",
    "transmission": "automatic",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 85,
    "dailyPriceEUR": 25,
    "depositTND": 800,
    "depositEUR": 239,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5220.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790430142_9ca95029-8467-43e3-aad8-8a12f75e56cf.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5227.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5220.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790430142_9ca95029-8467-43e3-aad8-8a12f75e56cf.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5227.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-seat-ibiza-bvm",
    "name": "SEAT IBIZA BVM",
    "slug": "seat-ibiza-bvm",
    "brand": "Seat",
    "model": "IBIZA BVM",
    "category": "Compact",
    "transmission": "manual",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 76,
    "dailyPriceEUR": 23,
    "depositTND": 800,
    "depositEUR": 239,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5221.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5225.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790430250_IMG_5227.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5221.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5225.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790430250_IMG_5227.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-seat-leon-bva",
    "name": "SEAT LEON BVA",
    "slug": "seat-leon-bva",
    "brand": "Seat",
    "model": "LEON BVA",
    "category": "Compact",
    "transmission": "automatic",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 140,
    "dailyPriceEUR": 42,
    "depositTND": 1500,
    "depositEUR": 448,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5223.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5226.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790431002_IMG_5227.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5223.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5226.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790431002_IMG_5227.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-skoda-fabia-bvm",
    "name": "SKODA FABIA BVM",
    "slug": "skoda-fabia-bvm",
    "brand": "Skoda",
    "model": "FABIA BVM",
    "category": "Compact",
    "transmission": "manual",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 76,
    "dailyPriceEUR": 23,
    "depositTND": 800,
    "depositEUR": 239,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5391.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5392.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5391.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5391.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5392.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-skoda-kushaq-bva",
    "name": "SKODA KUSHAQ BVA",
    "slug": "skoda-kushaq-bva",
    "brand": "Skoda",
    "model": "KUSHAQ BVA",
    "category": "SUV",
    "transmission": "automatic",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 130,
    "dailyPriceEUR": 39,
    "depositTND": 1000,
    "depositEUR": 299,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5388.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5390.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5388.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5388.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5390.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-suzuki-swift-bva",
    "name": "Suzuki SWIFT BVA",
    "slug": "suzuki-swift-bva",
    "brand": "Suzuki",
    "model": "SWIFT BVA",
    "category": "Economy",
    "transmission": "automatic",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 72,
    "dailyPriceEUR": 21,
    "depositTND": 600,
    "depositEUR": 179,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5217.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5218.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5219.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5217.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5218.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5219.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-suzuki-swift-bvm",
    "name": "Suzuki SWIFT BVM",
    "slug": "suzuki-swift-bvm",
    "brand": "Suzuki",
    "model": "SWIFT BVM",
    "category": "Economy",
    "transmission": "manual",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 70,
    "dailyPriceEUR": 21,
    "depositTND": 600,
    "depositEUR": 179,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5235.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790445929_IMG_5218.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790445930_IMG_5219.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5235.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790445929_IMG_5218.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790445930_IMG_5219.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-vw-t-cross-bva",
    "name": "VW T-CROSS BVA",
    "slug": "vw-t-cross-bva",
    "brand": "Volkswagen",
    "model": "VW T-CROSS BVA",
    "category": "SUV",
    "transmission": "automatic",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 130,
    "dailyPriceEUR": 39,
    "depositTND": 1000,
    "depositEUR": 299,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5269.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5270.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5272.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5269.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5270.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5272.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-vw-virtus-bva",
    "name": "VW VIRTUS BVA",
    "slug": "vw-virtus-bva",
    "brand": "Volkswagen",
    "model": "VW VIRTUS BVA",
    "category": "Compact",
    "transmission": "automatic",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 90,
    "dailyPriceEUR": 27,
    "depositTND": 800,
    "depositEUR": 239,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5265.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5267.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5268.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5265.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5267.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5268.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  },
  {
    "id": "car-vw-virtus-bvm",
    "name": "VW VIRTUS BVM",
    "slug": "vw-virtus-bvm",
    "brand": "Volkswagen",
    "model": "VW VIRTUS BVM",
    "category": "Compact",
    "transmission": "manual",
    "fuelType": "gasoline",
    "seats": 5,
    "doors": 5,
    "luggage": 2,
    "dailyPriceTND": 90,
    "dailyPriceEUR": 27,
    "depositTND": 800,
    "depositEUR": 239,
    "mileage": "Illimité (Unlimited)",
    "mainImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5266.jpeg",
    "interiorImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790688177_IMG_5267.jpeg",
    "bootImage": "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790688177_IMG_5268.jpeg",
    "gallery": [
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_IMG_5266.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790688177_IMG_5267.jpeg",
      "https://hmlrentcar.tn/wp-content/uploads/CarRentalGallery/big_thumb_1790688177_IMG_5268.jpeg"
    ],
    "features": [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  }
];

  for (let i = 0; i < rawFleet.length; i++) {
    const car = rawFleet[i];
    let catSlug = "economy-city";
    if (car.category === "SUV") catSlug = "suv-crossover";
    else if (car.category === "Compact") catSlug = "compact-sedan";
    else if (car.category === "Luxury") catSlug = "luxury-prestige";

    const cat = categoriesMap.get(catSlug) || categoriesMap.get("economy-city");

    const vehicleData = {
      brand: car.brand,
      model: car.model,
      year: 2024,
      categoryId: cat?._id,
      transmission: car.transmission as "automatic" | "manual",
      fuelType: car.fuelType as "gasoline" | "diesel",
      seats: car.seats,
      doors: car.doors,
      luggageCapacity: car.luggage,
      color: ["Blanc Glacier", "Gris Métallisé", "Noir Ébène", "Bleu Nuit", "Rouge Rubis"][i % 5],
      licensePlate: (120 + i) + " TN " + (3400 + i),
      vin: "TN" + (10000000 + i),
      images: [
        {
          url: car.mainImage,
          publicId: "vehicles/" + car.slug + "-main",
          isPrimary: true,
        },
        {
          url: car.interiorImage || car.mainImage,
          publicId: "vehicles/" + car.slug + "-interior",
          isPrimary: false,
        },
        {
          url: car.bootImage || car.mainImage,
          publicId: "vehicles/" + car.slug + "-boot",
          isPrimary: false,
        },
      ],
      status: "available" as const,
      pricing: {
        daily: car.dailyPriceTND * 100, // minor units in centimes
        weekly: Math.round(car.dailyPriceTND * 6.2) * 100,
        monthly: Math.round(car.dailyPriceTND * 24) * 100,
        currency: "TND",
        deposit: car.depositTND * 100,
      },
      features: car.features,
      hasAirConditioning: true,
      hasGPS: true,
      hasBluetooth: true,
      hasUSB: true,
      description: {
        fr: "Véhicule " + car.name + " en parfait état, entretenu selon les normes constructeur. Kilométrage illimité et climatisation inclus.",
        en: "Rental car " + car.name + " in showroom condition, rigorously serviced. Unlimited mileage and A/C included.",
        ar: "سيارة " + car.name + " بحالة ممتازة ومجهزة بالكامل. كيلومترات غير محدودة وتكييف هواء مشمول.",
      },
      location: defaultLoc._id,
      mileage: 15000 + (i * 1800),
      isActive: true,
    };

    const vehicle = await Vehicle.findOneAndUpdate(
      { licensePlate: vehicleData.licensePlate },
      { $set: vehicleData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    vehiclesMap.set(car.name, vehicle);
  }

  // 5. Seed Extras matching HML Rent Car
  const extraDefs = [
    {
      name: {
        fr: "2ème Conducteur Additionnel (Offert)",
        en: "2nd Additional Driver (Free)",
        ar: "سائق ثانٍ إضافي (مجاناً)",
      },
      description: {
        fr: "Ajout d'un deuxième conducteur autorisé sur le contrat de location sans aucun frais.",
        en: "Add a second authorized registered driver to your rental agreement at zero extra cost.",
        ar: "إضافة سائق ثانٍ مصرح له بالقيادة على العقد مجاناً بدون أي رسوم إضافية.",
      },
      icon: "Users",
      price: 0, // 0 TND
      pricingType: "fixed" as const,
      maxQuantity: 1,
      order: 1,
      isActive: true,
    },
    {
      name: {
        fr: "Siège Bébé Homologué (0-13 kg)",
        en: "Infant Baby Seat (0-13 kg)",
        ar: "مقعد أطفال للرضع (0-13 كغ)",
      },
      description: {
        fr: "Siège auto homologué groupe 0+ pour la sécurité et le confort de votre nourrisson (Gratuit).",
        en: "Certified group 0+ infant car seat for maximum safety and comfort (Free).",
        ar: "مقعد سيارة مريح ومعتمد للأطفال الرضع لتنقل آمن لجميع أفراد العائلة (مجاناً).",
      },
      icon: "Baby",
      price: 0, // 0 TND
      pricingType: "fixed" as const,
      maxQuantity: 2,
      order: 2,
      isActive: true,
    },
    {
      name: {
        fr: "Rehausseur Enfant (Child Seat)",
        en: "Child Booster Seat",
        ar: "مقعد معزز للأطفال",
      },
      description: {
        fr: "Siège rehausseur avec dossier ergonomique pour enfants de 4 à 10 ans (Gratuit).",
        en: "Ergonomic booster seat for children aged 4 to 10 years (Free).",
        ar: "مقعد معزز مريح للأطفال من سن 4 إلى 10 سنوات (مجاناً).",
      },
      icon: "Baby",
      price: 0, // 0 TND
      pricingType: "fixed" as const,
      maxQuantity: 2,
      order: 3,
      isActive: true,
    },
    {
      name: {
        fr: "Option Plein Carburant (Citadine / Compacte)",
        en: "Prepaid Fuel Tank (City & Compact)",
        ar: "خيار خزان وقود مسبق الدفع (اقتصادية)",
      },
      description: {
        fr: "Restituez le véhicule sans avoir à faire le plein de carburant avant votre vol.",
        en: "Return the vehicle without having to refuel before returning to the airport.",
        ar: "إعادة السيارة بدون الحاجة للتزود بالوقود قبل موعد الرحلة.",
      },
      icon: "Fuel",
      price: 7000, // 70 TND in minor units
      pricingType: "fixed" as const,
      maxQuantity: 1,
      order: 4,
      isActive: true,
    },
    {
      name: {
        fr: "Option Plein Carburant (SUV & Berline)",
        en: "Prepaid Fuel Tank (SUV & Sedan)",
        ar: "خيار خزان وقود مسبق الدفع (دفع رباعي وسيدان)",
      },
      description: {
        fr: "Forfait plein réservoir grand format pour les SUV et Berlines sans stress au retour.",
        en: "Full tank package for SUVs and Sedans with zero refueling stress upon return.",
        ar: "باقة تعبئة الخزان بالكامل للسيارات العائلية ورباعية الدفع.",
      },
      icon: "Fuel",
      price: 9000, // 90 TND
      pricingType: "fixed" as const,
      maxQuantity: 1,
      order: 5,
      isActive: true,
    },
    {
      name: {
        fr: "GPS Tactile Cartographie Tunisie 2026",
        en: "Touchscreen GPS Navigator Tunisia 2026",
        ar: "جهاز ملاحة GPS يعمل باللمس مع خريطة تونس",
      },
      description: {
        fr: "Navigateur GPS autonome avec cartographie complète et guidage vocal en français, anglais et arabe.",
        en: "Dedicated touchscreen GPS with full Tunisia maps and multilingual voice prompts.",
        ar: "جهاز ملاحة دقيق ومحدث بجميع طرقات ومعالم تونس مع توجيه صوتي.",
      },
      icon: "Compass",
      price: 4000, // 40 TND / day
      pricingType: "per_day" as const,
      maxQuantity: 1,
      order: 6,
      isActive: true,
    },
    {
      name: {
        fr: "Livraison Aéroport VIP (24/7)",
        en: "VIP Airport Curbside Delivery (24/7)",
        ar: "تسليم واستلام بالمطار لكبار الشخصيات 24/7",
      },
      description: {
        fr: "Accueil personnalisé avec pancarte nominative dès la sortie du terminal bagages (Inclus).",
        en: "Personalized meet & greet with your name board right at the terminal exit (Included).",
        ar: "استقبال مخصص مع لافتة باسمك مباشرة عند الخروج من قاعة الأمتعة (مشمول).",
      },
      icon: "Plane",
      price: 0,
      pricingType: "fixed" as const,
      maxQuantity: 1,
      order: 7,
      isActive: true,
    },
    {
      name: {
        fr: "Livraison Nocturne Hors Horaires (22h - 06h)",
        en: "Out of Hours Night Delivery (10PM - 6AM)",
        ar: "خدمة تسليم ليلية خارج أوقات العمل (22:00 - 06:00)",
      },
      description: {
        fr: "Agent d'astreinte dédié pour remise des clés de nuit lors de vols tardifs.",
        en: "Dedicated on-call agent for overnight key delivery during late arrivals.",
        ar: "وكيل مخصص لتسليم المفاتيح في المطار للرحلات الجوية الليلية والمتأخرة.",
      },
      icon: "Moon",
      price: 5000, // 50 TND
      pricingType: "fixed" as const,
      maxQuantity: 1,
      order: 8,
      isActive: true,
    },
    {
      name: {
        fr: "Assurance Tous Risques (Zéro Franchise)",
        en: "Full Coverage Insurance (Zero Deductible)",
        ar: "تأمين شامل بدون أي نسبة تحمل",
      },
      description: {
        fr: "Exonération complète de caution et de franchise pour bris de glace, pneus et carrosserie.",
        en: "Zero deductible collision damage waiver covering glass, tires, and bodywork.",
        ar: "إعفاء كامل من مبلغ التأمين والتحمل في حالات الحوادث، الزجاج أو الإطارات.",
      },
      icon: "ShieldCheck",
      price: 4500, // 45 TND / day
      pricingType: "per_day" as const,
      maxQuantity: 1,
      order: 9,
      isActive: true,
    },
  ];

  for (const extraData of extraDefs) {
    await Extra.findOneAndUpdate(
      { "name.en": extraData.name.en },
      { $set: extraData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 6. Promotions & Coupons (TND)
  const couponDefs = [
    {
      code: "PAYLESS2026",
      type: "percentage" as const,
      value: 10,
      minimumDays: 1,
      minimumAmount: 0,
      usageLimit: 1000,
      usageCount: 12,
      applicableCategories: Array.from(categoriesMap.values()).map((c) => c._id),
      startDate: new Date("2026-01-01"),
      endDate: new Date("2027-12-31"),
      isActive: true,
    },
    {
      code: "TUNISIA2026",
      type: "percentage" as const,
      value: 10,
      minimumDays: 3,
      minimumAmount: 0,
      usageLimit: 1000,
      usageCount: 142,
      applicableCategories: Array.from(categoriesMap.values()).map((c) => c._id),
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
    {
      code: "BIENVENUE50",
      type: "fixed" as const,
      value: 5000, // 50 TND
      minimumDays: 5,
      minimumAmount: 30000, // 300 TND min
      usageLimit: 300,
      usageCount: 45,
      applicableCategories: Array.from(categoriesMap.values()).map((c) => c._id),
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
  ];

  for (const cData of couponDefs) {
    await Coupon.findOneAndUpdate(
      { code: cData.code },
      { $set: cData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 7. Agency Settings (Exact info from HML Rent Car)
  const settingsList = [
    { key: "agency_name", value: "Payless Car Rental Tunisia", group: "general", label: "Nom Commercial de l'Agence", type: "string" as const },
    { key: "legal_name", value: "Houimli Rent a Car SARL", group: "general", label: "Raison Sociale", type: "string" as const },
    { key: "address", value: "60, Avenue de l'UMA, Chotrana 1, La Soukra", group: "general", label: "Adresse Siège", type: "string" as const },
    { key: "city", value: "Ariana 2036, Tunisie", group: "general", label: "Ville & Code Postal", type: "string" as const },
    { key: "phone_primary", value: "+216 25 120 130", group: "general", label: "Téléphone WhatsApp", type: "string" as const },
    { key: "phone_secondary", value: "+216 24 220 277", group: "general", label: "Téléphone Assistance 24/7", type: "string" as const },
    { key: "support_email", value: "Reservations@hmlrentcar.tn", group: "general", label: "Email Réservations", type: "string" as const },
    { key: "website", value: "https://hmlrentcar.tn", group: "general", label: "Site Officiel", type: "string" as const },
    { key: "currency", value: "TND", group: "finance", label: "Devise Principale", type: "string" as const },
    { key: "secondary_currency", value: "EUR", group: "finance", label: "Devise Secondaire", type: "string" as const },
    { key: "exchange_rate_eur", value: 3.35, group: "finance", label: "Taux de change (1 EUR en TND)", type: "number" as const },
    { key: "tax_rate", value: 19, group: "finance", label: "Taux TVA (%)", type: "number" as const },
    { key: "standard_deposit", value: 800, group: "finance", label: "Caution Standard (TND)", type: "number" as const },
    { key: "terms_and_conditions", value: "Article 1 – USE OF THE CAR AND CONDITIONS REQUIRED FOR RENTAL\n\nAll drivers must be at least 23 years old for city cars and 25 years old for compacts, SUVs and sedans and must have held a valid driving licence for at least 24 months.\n\nUpon delivery of the vehicle, the renter and authorized drivers become fully responsible for it according to the terms set out in the article of the Civil Code. The renter is prohibited from participating in any match, race, competition, rally, or any other competition of any kind whatsoever, as well as in tests or preparations. He undertakes not to use the car for illicit purposes or purposes other than those intended by the Manufacturer. The renter undertakes to use the locking and protection control systems at each stop.\n\n### Article 2 – AREA OF USE\n\nThe Republic of Tunisia, no vehicle may leave the territory of the Tunisian Republic.\n\nThe tenant undertakes that the vehicle will not be used or driven outside the area provided for in the contract without the prior consent of the lessor.\n\nAny harmful consequences resulting from driving the vehicle outside the declared area would be entirely the responsibility of the tenant, without the latter being able to claim the benefit of the rental company's guarantees, in particular for the reduction of the excess.\n\n### Article 3 – CONDITION OF THE VEHICLE\n\nThe vehicle is delivered in good working order and bodywork with keys and documents and tires in good condition, spare wheel and normal accessories. By signing the contract, the lessee accepts the vehicle in the condition in which it is and undertakes to return it in the same working order and bodywork with tires, spare wheel and accessories in good condition. The lessee is prohibited from claiming compensation for interruption of service, incident or accident attributed to the condition of the vehicle or tires. The vehicle is given in a perfectly clean condition upon return, it must be returned in the same condition. Otherwise, the cleaning costs will be invoiced. Repairs resulting from abnormal wear, frost, negligence for accidental or undetermined causes remain the responsibility of the lessee unless the latter provides proof that he has committed no fault.\n\nThe lessee remains liable for all non-accidental losses or damages to the vehicle, keys and registration documents, tires (including punctures), rims, tools, instruments, accessories, interior and exterior equipment. He undertakes to reimburse the lessor for the full amount of any damage or loss as well as the costs of immobilizing the vehicle. The amount of repairs will be payable upon estimate. Please note that the lessor will collect the prepayment immediately.\n\n### Article 4 – DURATION OF THE CONTRACT\n\nThe rental agreement is for a fixed period, as specified in the contract. \n\nThe rental agreement is personal and non-transferable. The renter agrees not to allow other people to drive the car.\n\nIn the event of non-return of the vehicle by the due date indicated on the front, the lessor reserves the right to repossess the said vehicle from any location whatsoever, at the sole expense of the lessee, without the latter being able to claim an unfair termination of this rental against it.\n\nIn case of extension, the tenant must go to the departure agency to make the request to the lessor at least 24 hours in advance in order to extend the contract and pay for the extension of the rental in case of exceeding the duration without the agreement of the lessor, the insurance will end on the date and time stipulated in the contract. The lessor reserves the right to refuse any request for extension.\n\n### Article 5 – PROVISION OF THE VEHICLE\n\nThe vehicle is made available to the tenant at the rental company's agencies and must (unless expressly agreed by the latter) be returned to the same location.\n\nThe vehicle is delivered in perfect condition. A joint inspection of the vehicle will be carried out and accepted by the renter. Any reservations must be made at the time of collection and must be noted on the contract.\n\n### Article 6 – RETURN OF THE VEHICLE\n\nThe vehicle must be returned to the departure agency (unless otherwise agreed).\n\nThe vehicle must be returned during the agency's opening hours. The vehicle keys and documents must be handed over to the rental company's staff in person. The renter agrees to return the vehicle in the condition in which it was delivered. Any damage noted upon return will be the responsibility of the renter.\n\n### Article 7 – CUSTODY AND USE\n\nFrom the time the vehicle is picked up until it is returned, the renter has full control and responsibility for it, whether it is in circulation or parked.\n\nGenerally speaking, the tenant agrees to use the vehicle as a responsible person and in particular:\n\nto allow only authorized drivers whose name appears on the contract to drive,\nto drive it only on roads suitable for traffic,\nnot to participate in any race, rally, test, preparation or competition of any kind whatsoever,\nnot to use it for illicit or immoral purposes or purposes not intended by the manufacturer,\nnot to use it to push, pull or tow another vehicle (except a rental vehicle equipped with special equipment),\nnot to drive it under the influence of alcohol or under the effect of absorbed elements which modify the reflexes essential for driving,\nnot to carry out the transport of people or goods for payment (except utility vehicles),\nnot to use it for driving lessons,\nto use it in accordance with the highway code, customs regulations and generally with legal and regulatory provisions.\n\n### Article 8 – FUEL, LUBRICANT\n\nFuel is always the responsibility of the renter. Unless otherwise agreed, the vehicle is delivered with a half-full tank and must be returned half-full. If this is not the case, the rental company will provide the service of half-filling the tank. Fuel and the cost of the service will be billed according to the current rate. Any breakdowns resulting from a lack or error in fuel or lubricant remain the responsibility of the renter. The renter must check their levels every 500 km. The latter must constantly check the oil and water levels.\n\n### Article 9 – PAYMENT – prepayment – ​​SECURITY DEPOSIT\n\nThe rental and security deposit amounts are determined by the current rates. The renter pays the rental company upon collection of the vehicle or pays online by credit or debit card or bank transfer:\n\nthe amount of the security deposit requested,\nthe estimated cost of the rental, calculated from the daily rate and the expected duration of the rental.\n\nRentals are for 24-hour periods. The renter has a one-hour grace period at the end of the rental period. After this period, a new day will be charged.\n\nBy express agreement, the amount of the security deposit indicated on the front is allocated to the lessor in full ownership up to the amount owed by the tenant to the lessor in the event of:\n\nnon-payment of rent,\ndamage or loss of the vehicle as provided for,\nnon-return of the vehicle, except in cases of force majeure and after formal notice.\n\n### Article 10 – MAINTENANCE – REPAIR\n\nRepairs, replacement of parts or tires resulting from normal wear and tear are the responsibility of the lessor: those resulting from abnormal wear and tear, negligence, accidental or undetermined causes remain the responsibility of the lessee and will be carried out without delay by the lessor; their amount will be increased by an immobilization fee. In either case, if the vehicle is immobilized, the lessee may only carry out work at an Official Agent of the vehicle brand, after written agreement from the lessor, and must be given a paid invoice as well as the replaced defective parts.\n\n### Article 11 – INSURANCE\n\nHOUIMLI RENT A CAR insurance is  third-party insurance .\n\nDuration of insurance:\n\nInsurance is only valid for the rental period and extension.\n\nThe tenant is guaranteed for the following risks:\n\nFor an unlimited amount for accidents caused to people who are in the rental vehicle free of charge,\nAgainst vehicle fire except in the event of serious negligence on the part of the tenant,\nAgainst car theft except in the event of negligence on the part of the tenant,\nAgainst road accidents,  not responsible ,\n\nThe insurance does not cover the following:\n\nThe tenant will be liable for the amount of repairs, or the market value of the vehicle in the following cases:\n\nDriving of the vehicle by a person whose name does not appear on this contract as an authorized driver,\nDamage caused in the absence of an identified third party or who  fled , or as a result of inexcusable fault, or as a result of gross negligence: e.g.:  skidding ,  crossing a continuous line ,  failure to respect speed, collision from behind, failure to respect priority.\nThe insurance does not include damage to  headlights ,  lights ,  mirrors ,  rear window ,  windshield ,  front and rear bumpers  ,  car paint  and any loss of equipment,  papers ,  keys  and towing in the event of an accident are the responsibility of the customer.\nAny damage resulting from an incorrect assessment of the size of the rented vehicle (example: top of roof, rut, lateral rubbing of the bodywork).\nDriving with a blood alcohol level above the legal limit or under the influence of substances absorbed which modify the reflexes essential for driving,\nDrowsiness and falling asleep of the tenant,\nDamage to the interior of the vehicle, to the tires and rims, unless it can be proven that they are not the result of the fault or negligence of the party.\nError in fuel type,\nCollision with a  fixed or moving obstacle  (e.g. road sign, animal or pedestrian, etc.),\nFailure to return the vehicle keys and documents excludes the theft guarantee,\nDamage occurring on construction sites, private roads and roads closed to traffic,\nDamage occurring after the date stipulated in the contract for the return of the vehicle,\nDamage occurring with another vehicle from Houimli Rent a Car Company.\nDamage occurring with a vehicle registered in the name of the lessee or its subsidiaries,\nTheft by an employee of the tenant, or an authorized driver,\nPersonal effects and goods,\nDeclaration received after the vehicle was returned.\n\nDeclaration: In the event of an accident, a complete declaration must be sent to the lessor within 24 hours by registered mail with acknowledgment of receipt. This declaration must include the circumstances, the date and time, the location, the Agent's number, a police or National Guard report, the names and addresses of witnesses, as well as information on the opposing party. Under no circumstances should the lessee discuss liability, nor deal with or enter into any transaction with third parties regarding the accident. The lessee undertakes to immediately communicate to the lessor all documents received following an accident and all useful information.\n\n### Article 12 – COMMERCIAL VEHICLES (SPECIAL RULES)\n\nIn addition to the obligations provided for in this contract, the tenant:\n\nassumes control of driving and transport operations,\nundertakes to transport in the vehicle only goods that are suitable for the use to which it is assigned,\nrefrain from loading materials likely to damage the vehicle or leave persistent impregnations on it, either by themselves or by their packaging or stowage,\nundertakes to use the vehicle only on the driving areas for which it was designed,\nacknowledges liability for damage suffered by the vehicle, its equipment or its accessories due to loading or unloading,\nwill be responsible for the consequences of any excess of the total rolling weight of the vehicle or the number of authorized persons indicated on the registration document,\nwill return the vehicle empty of any packaging or merchandise.\n\n### Article 13 – CAR PAPERS\n\nThe tenant will return to the lessor, upon return of the car, all the registration documents relating to the latter; failing which, the rental will continue to be invoiced at the initial price, until production of a certificate of loss and payment of the duplicate costs.\n\n### Article 14 – FINES, INFRINGEMENTS\n\nThe renter and the authorized driver are responsible for any fines, speeding offenses, speed cameras, tickets, and reports issued against them that are legally their responsibility. They agree to reimburse the rental company for all resulting costs, including impound fees, if the rental company is required to pay them in advance.\n\n \n\n\t\t    \n\t\t\t\t\t\t\t\t\t\n\nAt Payless Car Rental Tunisia, we believe that renting a car should be easy, affordable,  and enjoyable.We are a locally owned and operated car rental company built on trust, transparency, and customer satisfaction. \n\n\t\t\t\n                        \n\n### Opennig hours\n\t\t\tMonday-Friday: 10:00 - 14:00 | 15:30 - 20:00\n\nSaturday: 10:00 - 14:00\n\nSunday: Closed\n\n                        \n\n###", group: "legal", label: "Conditions Générales de Location", type: "string" as const },
    { key: "min_driver_age_city", value: 23, group: "rules", label: "Âge Minimal Citadine", type: "number" as const },
    { key: "min_driver_age_suv", value: 25, group: "rules", label: "Âge Minimal SUV & Berline", type: "number" as const },
    { key: "min_driver_license_months", value: 24, group: "rules", label: "Ancienneté Minimale Permis (Mois)", type: "number" as const },
  ];

  for (const s of settingsList) {
    await AgencySetting.findOneAndUpdate(
      { key: s.key },
      { $set: s },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // Return counts
  const [uCount, locCount, catCount, vCount, exCount, cCount, sCount] = await Promise.all([
    User.countDocuments(),
    Location.countDocuments(),
    VehicleCategory.countDocuments(),
    Vehicle.countDocuments(),
    Extra.countDocuments(),
    Coupon.countDocuments(),
    AgencySetting.countDocuments(),
  ]);

  return {
    success: true,
    message: "Base de données initialisée avec succès avec les données réelles de Payless Car Rental Tunisia (HML Rent Car)",
    counts: {
      users: uCount,
      locations: locCount,
      categories: catCount,
      vehicles: vCount,
      extras: exCount,
      promotions: 3,
      coupons: cCount,
      customers: 2,
      bookings: 2,
      notifications: 5,
      settings: sCount,
    },
  };
}
