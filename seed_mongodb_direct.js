const fs = require('fs');
const path = require('path');

// Read .env.local or .env
let envContent = '';
if (fs.existsSync('payless-car-rental/.env.local')) {
  envContent = fs.readFileSync('payless-car-rental/.env.local', 'utf8');
} else if (fs.existsSync('payless-car-rental/.env')) {
  envContent = fs.readFileSync('payless-car-rental/.env', 'utf8');
}

let uri = '';
const match = envContent.match(/MONGODB_URI=["']?([^"'\r\n]+)["']?/);
if (match) {
  uri = match[1].trim();
}

if (!uri) {
  console.error('No MONGODB_URI found in env files!');
  process.exit(1);
}

console.log('Found MongoDB URI:', uri.replace(/:[^:@]+@/, ':****@'));

const mongoose = require(path.join(__dirname, 'node_modules', 'mongoose'));
const bcrypt = require(path.join(__dirname, 'node_modules', 'bcryptjs'));

const fleet = JSON.parse(fs.readFileSync(path.join(__dirname, 'compiled_fleet.json'), 'utf8'));
const termsText = fs.readFileSync(path.join(__dirname, 'terms_extracted.txt'), 'utf8');

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('Connected successfully to database:', mongoose.connection.name);

  const db = mongoose.connection.db;

  // 1. Superadmin User
  const usersColl = db.collection('users');
  const adminEmail = 'admin@paylesscarrental.com';
  const hashedPassword = await bcrypt.hash('Admin@12345!', 12);

  await usersColl.updateOne(
    { email: adminEmail },
    {
      $set: {
        name: 'Admin Payless Tunisia',
        email: adminEmail,
        password: hashedPassword,
        role: 'superadmin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        phone: '+216 25 120 130',
        isActive: true,
        preferences: { language: 'fr', notifications: true },
        updatedAt: new Date()
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );
  console.log('✓ Superadmin seeded (admin@paylesscarrental.com / Admin@12345!)');

  // 2. 11 Locations in Tunisia
  const locationsColl = db.collection('locations');
  const locationDefs = [
    { code: 'TUN', name: { fr: '1. Aéroport de Tunis-Carthage (TUN)', en: '1. Tunis-Carthage International Airport (TUN)', ar: '1. مطار تونس قرطاج الدولي (TUN)' }, address: 'Terminal 1 & 2 Arrivées, Aéroport International Tunis-Carthage', city: 'Tunis', country: 'Tunisia', phone: '+216 25 120 130', email: 'tunis@paylesscarrental.tn', coordinates: { lat: 36.8510, lng: 10.2272 }, isAirport: true, isActive: true },
    { code: 'MIR', name: { fr: '2. Aéroport de Monastir Habib Bourguiba (MIR)', en: '2. Monastir Habib Bourguiba Airport (MIR)', ar: '2. مطار الحبيب بورقيبة المنستير (MIR)' }, address: 'Hall Arrivées Internationales, Aéroport Monastir', city: 'Monastir', country: 'Tunisia', phone: '+216 24 220 277', email: 'monastir@paylesscarrental.tn', coordinates: { lat: 35.7581, lng: 10.7547 }, isAirport: true, isActive: true },
    { code: 'SKR', name: { fr: '3. Agence La Soukra (Siège Social)', en: '3. La Soukra Agency (Headquarters)', ar: '3. وكالة سكرة (المقر الرئيسي)' }, address: '60, Avenue de l’UMA, Chotrana 1, La Soukra, Ariana 2036', city: 'Ariana', country: 'Tunisia', phone: '+216 25 120 130', email: 'soukra@paylesscarrental.tn', coordinates: { lat: 36.8761, lng: 10.2241 }, isAirport: false, isActive: true },
    { code: 'BIZ', name: { fr: '4. Bizerte Ville', en: '4. Bizerte Downtown', ar: '4. بنزرت المدينة' }, address: 'Avenue Habib Bourguiba, Centre-Ville, Bizerte', city: 'Bizerte', country: 'Tunisia', phone: '+216 25 120 130', email: 'bizerte@paylesscarrental.tn', coordinates: { lat: 37.2744, lng: 9.8739 }, isAirport: false, isActive: true },
    { code: 'NAB', name: { fr: '5. Nabeul Ville', en: '5. Nabeul Downtown', ar: '5. نابل المدينة' }, address: 'Avenue Habib Thameur, Nabeul', city: 'Nabeul', country: 'Tunisia', phone: '+216 25 120 130', email: 'nabeul@paylesscarrental.tn', coordinates: { lat: 36.4561, lng: 10.7376 }, isAirport: false, isActive: true },
    { code: 'TUN-CTR', name: { fr: '6. Grand Tunis (Livraison Hôtels & Domicile)', en: '6. Greater Tunis (Hotel & Doorstep Delivery)', ar: '6. تونس الكبرى (تسليم الفنادق والمنازل)' }, address: 'Berges du Lac, Centre Urbain Nord, Ennasr & La Marsa', city: 'Tunis', country: 'Tunisia', phone: '+216 24 220 277', email: 'grandtunis@paylesscarrental.tn', coordinates: { lat: 36.8322, lng: 10.2312 }, isAirport: false, isActive: true },
    { code: 'NBE', name: { fr: '7. Aéroport Enfidha-Hammamet (NBE)', en: '7. Enfidha-Hammamet Airport (NBE)', ar: '7. مطار النفيضة الحمامات (NBE)' }, address: 'Hall Terminal Arrivées, Aéroport International Enfidha', city: 'Enfidha', country: 'Tunisia', phone: '+216 25 120 130', email: 'enfidha@paylesscarrental.tn', coordinates: { lat: 36.0758, lng: 10.4386 }, isAirport: true, isActive: true },
    { code: 'HAM', name: { fr: '8. Hammamet Ville & Yasmine Hammamet', en: '8. Hammamet City & Yasmine Resort', ar: '8. الحمامات المدينة وياسمين الحمامات' }, address: 'Avenue des Hôtels, Zone Touristique Yasmine Hammamet', city: 'Hammamet', country: 'Tunisia', phone: '+216 24 220 277', email: 'hammamet@paylesscarrental.tn', coordinates: { lat: 36.3812, lng: 10.5519 }, isAirport: false, isActive: true },
    { code: 'SFA', name: { fr: '9. Sfax Ville', en: '9. Sfax City', ar: '9. صفاقس المدينة' }, address: 'Boulevard des Martyrs, Centre Ville Sfax', city: 'Sfax', country: 'Tunisia', phone: '+216 25 120 130', email: 'sfax@paylesscarrental.tn', coordinates: { lat: 34.7406, lng: 10.7603 }, isAirport: false, isActive: true },
    { code: 'SOU', name: { fr: '10. Sousse Ville & Port El Kantaoui', en: '10. Sousse City & Port El Kantaoui', ar: '10. سوسة المدينة وبور القنطاوي' }, address: 'Boulevard 14 Janvier, Sousse & Port El Kantaoui', city: 'Sousse', country: 'Tunisia', phone: '+216 24 220 277', email: 'sousse@paylesscarrental.tn', coordinates: { lat: 35.8256, lng: 10.6369 }, isAirport: false, isActive: true },
    { code: 'JEN', name: { fr: '11. Jendouba Ville & Tabarka', en: '11. Jendouba & Tabarka', ar: '11. جندوبة وطبرقة' }, address: 'Avenue Habib Bourguiba, Jendouba', city: 'Jendouba', country: 'Tunisia', phone: '+216 25 120 130', email: 'jendouba@paylesscarrental.tn', coordinates: { lat: 36.5011, lng: 8.7802 }, isAirport: false, isActive: true }
  ];

  const locIdMap = {};
  for (const loc of locationDefs) {
    const res = await locationsColl.findOneAndUpdate(
      { 'name.en': loc.name.en },
      { $set: { ...loc, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );
    locIdMap[loc.code] = res ? res._id : null;
  }
  console.log(`✓ Seeded ${locationDefs.length} locations across Tunisia`);

  // 3. 4 Vehicle Categories
  const categoriesColl = db.collection('vehiclecategories');
  const catDefs = [
    { slug: 'economy-city', name: { fr: 'Économique & Citadine', en: 'Economy & City', ar: 'اقتصادية وصغيرة' }, icon: 'Car', description: { fr: 'Véhicules maniables et très économiques pour la ville et les déplacements quotidiens en Tunisie.', en: 'Agile, fuel-efficient compact cars ideal for city driving and daily commuting across Tunisia.', ar: 'سيارات رشيقة واقتصادية للغاية مناسبة للمدن والتنقلات اليومية في تونس.' }, order: 1, isActive: true },
    { slug: 'compact-sedan', name: { fr: 'Compacte & Berline', en: 'Compact & Sedan', ar: 'مدمجة وسيدان' }, icon: 'Briefcase', description: { fr: 'Polyvalence, espace coffre généreux et confort pour les autoroutes et les voyages d’affaires.', en: 'Versatility, spacious luggage capacity and high comfort for highways and executive travel.', ar: 'عملية ومريحة مع مساحة واسعة للأمتعة لرحلات الطرق السريعة والأعمال.' }, order: 2, isActive: true },
    { slug: 'suv-crossover', name: { fr: 'SUV & Crossover', en: 'SUV & Crossover', ar: 'دفع رباعي وكروس أوفر' }, icon: 'Shield', description: { fr: 'Position de conduite haute, garde au sol surélevée et sécurité optimale pour toute la famille.', en: 'Elevated driving stance, generous clearance, and maximum safety for family vacations.', ar: 'وضعية قيادة مرتفعة ومستوى أمان ممتاز للعائلات في كل مسالك تونس.' }, order: 3, isActive: true },
    { slug: 'luxury-prestige', name: { fr: 'Prestige & Luxe', en: 'Prestige & Luxury', ar: 'فخامة وتميز' }, icon: 'Crown', description: { fr: 'Finitions haut de gamme, boîtes automatiques de pointe et motorisations performantes.', en: 'Top-tier styling, advanced automatic gearboxes, and powerful engines for discerning clients.', ar: 'مظهر راقٍ مع أحدث نواقل الحركة الأوتوماتيكية وتجهيزات الرفاهية الكاملة.' }, order: 4, isActive: true }
  ];

  const catIdMap = {};
  for (const cat of catDefs) {
    const res = await categoriesColl.findOneAndUpdate(
      { slug: cat.slug },
      { $set: { ...cat, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );
    catIdMap[cat.slug] = res ? res._id : null;
  }
  console.log(`✓ Seeded ${catDefs.length} categories`);

  // 4. 25 Vehicles
  const vehiclesColl = db.collection('vehicles');
  const defaultLocId = locIdMap['TUN'] || Object.values(locIdMap)[0];

  for (let i = 0; i < fleet.length; i++) {
    const car = fleet[i];
    let catSlug = 'economy-city';
    if (car.category === 'SUV') catSlug = 'suv-crossover';
    else if (car.category === 'Compact') catSlug = 'compact-sedan';
    else if (car.category === 'Luxury') catSlug = 'luxury-prestige';

    const categoryId = catIdMap[catSlug] || catIdMap['economy-city'];

    const vehicleDoc = {
      brand: car.brand,
      model: car.model,
      year: 2024,
      categoryId,
      transmission: car.transmission,
      fuelType: car.fuelType,
      seats: car.seats,
      doors: car.doors,
      luggageCapacity: car.luggage,
      color: ['Blanc Glacier', 'Gris Métallisé', 'Noir Ébène', 'Bleu Nuit', 'Rouge Rubis'][i % 5],
      licensePlate: `${120 + i} TN ${3400 + i}`,
      vin: `TN${10000000 + i}`,
      images: [
        { url: car.mainImage, publicId: `vehicles/${car.slug}-main`, isPrimary: true },
        { url: car.interiorImage || car.mainImage, publicId: `vehicles/${car.slug}-interior`, isPrimary: false },
        { url: car.bootImage || car.mainImage, publicId: `vehicles/${car.slug}-boot`, isPrimary: false }
      ],
      status: 'available',
      pricing: {
        daily: car.dailyPriceTND * 100, // in minor units
        weekly: Math.round(car.dailyPriceTND * 6.2) * 100,
        monthly: Math.round(car.dailyPriceTND * 24) * 100,
        currency: 'TND',
        deposit: car.depositTND * 100
      },
      features: car.features,
      hasAirConditioning: true,
      hasGPS: true,
      hasBluetooth: true,
      hasUSB: true,
      description: {
        fr: `Véhicule ${car.name} en état neuf, révisé chez le concessionnaire. Kilométrage illimité et climatisation inclus.`,
        en: `Rental car ${car.name} in showroom condition, fully serviced. Unlimited mileage and A/C included.`,
        ar: `سيارة ${car.name} بحالة ممتازة ومجهزة بالكامل. كيلومترات غير محدودة وتكييف هواء مشمول.`
      },
      location: defaultLocId,
      mileage: 15000 + (i * 1800),
      isActive: true,
      updatedAt: new Date()
    };

    await vehiclesColl.updateOne(
      { licensePlate: vehicleDoc.licensePlate },
      { $set: vehicleDoc, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
  }
  console.log(`✓ Seeded ${fleet.length} vehicles from HML Rent Car with accurate TND prices & deposits`);

  // 5. Extras & Fees
  const extrasColl = db.collection('extras');
  const extraDefs = [
    { name: { fr: '2ème Conducteur Additionnel (Offert)', en: '2nd Additional Driver (Free)', ar: 'سائق ثانٍ إضافي (مجاناً)' }, description: { fr: 'Ajout d’un deuxième conducteur sans aucun supplément.', en: 'Free second authorized driver.', ar: 'إضافة سائق ثانٍ مجاناً.' }, icon: 'Users', price: 0, pricingType: 'fixed', maxQuantity: 1, order: 1, isActive: true },
    { name: { fr: 'Siège Bébé Homologué (0-13 kg)', en: 'Infant Baby Seat (0-13 kg)', ar: 'مقعد أطفال للرضع (0-13 كغ)' }, description: { fr: 'Siège auto homologué groupe 0+ pour nourrissons (Gratuit).', en: 'Certified infant car seat (Free).', ar: 'مقعد أطفال للرضع معتمد (مجاناً).' }, icon: 'Baby', price: 0, pricingType: 'fixed', maxQuantity: 2, order: 2, isActive: true },
    { name: { fr: 'Rehausseur Enfant (Child Seat)', en: 'Child Booster Seat', ar: 'مقعد معزز للأطفال' }, description: { fr: 'Siège rehausseur pour enfants de 4 à 10 ans (Gratuit).', en: 'Child booster seat (Free).', ar: 'مقعد معزز للأطفال (مجاناً).' }, icon: 'Baby', price: 0, pricingType: 'fixed', maxQuantity: 2, order: 3, isActive: true },
    { name: { fr: 'Option Plein Carburant (Citadine / Compacte)', en: 'Prepaid Fuel Tank (City & Compact)', ar: 'خيار خزان وقود مسبق الدفع' }, description: { fr: 'Restituez le véhicule sans avoir à faire le plein (70 TND).', en: 'Return vehicle without refueling (70 TND).', ar: 'إعادة السيارة بدون تزويد بالوقود.' }, icon: 'Fuel', price: 7000, pricingType: 'fixed', maxQuantity: 1, order: 4, isActive: true },
    { name: { fr: 'Option Plein Carburant (SUV & Berline)', en: 'Prepaid Fuel Tank (SUV & Sedan)', ar: 'خيار خزان وقود مسبق الدفع (دفع رباعي)' }, description: { fr: 'Forfait plein carburant pour SUV et Berlines (90 TND).', en: 'Full tank package for SUVs (90 TND).', ar: 'باقة تعبئة الخزان للسيارات العائلية.' }, icon: 'Fuel', price: 9000, pricingType: 'fixed', maxQuantity: 1, order: 5, isActive: true },
    { name: { fr: 'GPS Tactile Cartographie Tunisie 2026', en: 'Touchscreen GPS Navigator Tunisia 2026', ar: 'جهاز ملاحة GPS يعمل باللمس' }, description: { fr: 'GPS autonome avec cartographie complète de Tunisie (40 TND/j).', en: 'GPS with full Tunisia road maps (40 TND/day).', ar: 'جهاز ملاحة دقيق لخريطة تونس.' }, icon: 'Compass', price: 4000, pricingType: 'per_day', maxQuantity: 1, order: 6, isActive: true },
    { name: { fr: 'Livraison Aéroport VIP (24/7)', en: 'VIP Airport Curbside Delivery (24/7)', ar: 'تسليم واستلام بالمطار 24/7' }, description: { fr: 'Accueil personnalisé à la sortie du terminal (Gratuit).', en: 'Meet & greet at terminal exit (Free).', ar: 'استقبال مخصص بالمطار (مجاناً).' }, icon: 'Plane', price: 0, pricingType: 'fixed', maxQuantity: 1, order: 7, isActive: true },
    { name: { fr: 'Livraison Nocturne Hors Horaires (22h - 06h)', en: 'Out of Hours Night Delivery (10PM - 6AM)', ar: 'خدمة تسليم ليلية خارج أوقات العمل' }, description: { fr: 'Agent d’astreinte pour remise de clés de nuit (50 TND).', en: 'Overnight airport key handoff (50 TND).', ar: 'تسليم المفاتيح ليلاً للرحلات المتأخرة.' }, icon: 'Moon', price: 5000, pricingType: 'fixed', maxQuantity: 1, order: 8, isActive: true },
    { name: { fr: 'Assurance Tous Risques (Zéro Franchise)', en: 'Full Coverage Insurance (Zero Deductible)', ar: 'تأمين شامل بدون نسبة تحمل' }, description: { fr: 'Exonération complète de caution et de franchise (45 TND/j).', en: 'Zero deductible collision waiver (45 TND/day).', ar: 'إعفاء كامل من مبلغ التأمين والتحمل.' }, icon: 'ShieldCheck', price: 4500, pricingType: 'per_day', maxQuantity: 1, order: 9, isActive: true }
  ];

  for (const ex of extraDefs) {
    await extrasColl.updateOne(
      { 'name.en': ex.name.en },
      { $set: { ...ex, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
  }
  console.log(`✓ Seeded ${extraDefs.length} extras & fees`);

  // 6. Agency Settings (Exact data from HML Rent Car)
  const settingsColl = db.collection('agencysettings');
  const settings = [
    { key: 'agency_name', value: 'Payless Car Rental Tunisia', group: 'general', label: 'Nom Commercial', type: 'string' },
    { key: 'legal_name', value: 'Houimli Rent a Car SARL', group: 'general', label: 'Raison Sociale', type: 'string' },
    { key: 'address', value: '60, Avenue de l’UMA, Chotrana 1, La Soukra', group: 'general', label: 'Adresse Siège', type: 'string' },
    { key: 'city', value: 'Ariana 2036, Tunisie', group: 'general', label: 'Ville', type: 'string' },
    { key: 'phone_primary', value: '+216 25 120 130', group: 'general', label: 'Téléphone WhatsApp', type: 'string' },
    { key: 'phone_secondary', value: '+216 24 220 277', group: 'general', label: 'Téléphone Assistance 24/7', type: 'string' },
    { key: 'support_email', value: 'Reservations@hmlrentcar.tn', group: 'general', label: 'Email', type: 'string' },
    { key: 'website', value: 'https://hmlrentcar.tn', group: 'general', label: 'Site Web', type: 'string' },
    { key: 'currency', value: 'TND', group: 'finance', label: 'Devise Principale', type: 'string' },
    { key: 'secondary_currency', value: 'EUR', group: 'finance', label: 'Devise Secondaire', type: 'string' },
    { key: 'exchange_rate_eur', value: 3.35, group: 'finance', label: 'Taux Change 1 EUR en TND', type: 'number' },
    { key: 'tax_rate', value: 19, group: 'finance', label: 'Taux TVA (%)', type: 'number' },
    { key: 'standard_deposit', value: 800, group: 'finance', label: 'Caution Standard (TND)', type: 'number' },
    { key: 'terms_and_conditions', value: termsText, group: 'legal', label: 'Conditions Générales de Location', type: 'string' },
    { key: 'min_driver_age_city', value: 23, group: 'rules', label: 'Âge Minimal Citadine', type: 'number' },
    { key: 'min_driver_age_suv', value: 25, group: 'rules', label: 'Âge Minimal SUV & Berline', type: 'number' },
    { key: 'min_driver_license_months', value: 24, group: 'rules', label: 'Ancienneté Minimale Permis (Mois)', type: 'number' }
  ];

  for (const s of settings) {
    await settingsColl.updateOne(
      { key: s.key },
      { $set: { ...s, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
  }
  console.log(`✓ Seeded ${settings.length} agency settings & full terms and conditions`);

  // Final summary
  const [totalVehicles, totalLocations, totalExtras, totalSettings] = await Promise.all([
    vehiclesColl.countDocuments(),
    locationsColl.countDocuments(),
    extrasColl.countDocuments(),
    settingsColl.countDocuments()
  ]);

  console.log('═══════════════════════════════════════════════════════');
  console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log(`- Vehicles: ${totalVehicles}`);
  console.log(`- Locations: ${totalLocations} across Tunisia`);
  console.log(`- Extras & Fees: ${totalExtras}`);
  console.log(`- Settings & Full Terms: ${totalSettings}`);
  console.log('═══════════════════════════════════════════════════════');

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
