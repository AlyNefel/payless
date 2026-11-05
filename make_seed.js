const fs = require('fs');

const fleet = JSON.parse(fs.readFileSync('payless-car-rental/compiled_fleet.json', 'utf8'));
const termsText = fs.readFileSync('payless-car-rental/terms_extracted.txt', 'utf8');

const seedContent = `import connectDB from "./db";
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
  const rawFleet = ${JSON.stringify(fleet, null, 2)};

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
    { key: "terms_and_conditions", value: ${JSON.stringify(termsText)}, group: "legal", label: "Conditions Générales de Location", type: "string" as const },
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
`;

fs.writeFileSync('payless-car-rental/src/lib/seed.ts', seedContent, 'utf8');
console.log('Successfully generated complete seed.ts with Tunisian data, full terms, 25 cars, and 11 locations!');

