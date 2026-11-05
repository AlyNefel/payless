const fs = require('fs');

const homeHtml = fs.readFileSync('scratch_home.html', 'utf8');

// 1. CARS
const carRegex = /<a[^>]+href=["'](https:\/\/hmlrentcar\.tn\/car-model\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
const carList = [];
let match;
while ((match = carRegex.exec(homeHtml)) !== null) {
  const url = match[1];
  const name = match[2].replace(/<[^>]+>/g, '').trim();
  if (name && !carList.some(c => c.url === url)) {
    carList.push({ name, url });
  }
}

// 2. LOCATIONS
const locRegex = /<option[^>]+value=["']([0-9]+)["'][^>]*>([0-9]+\.\s*[^<]+)<\/option>/gi;
const locations = [];
while ((match = locRegex.exec(homeHtml)) !== null) {
  const id = match[1];
  const name = match[2].trim();
  if (!locations.some(l => l.id === id)) {
    locations.push({ id, name });
  }
}

// 3. TERMS & CONDITIONS
let termsText = '';
if (fs.existsSync('scraped/terms.html')) {
  const raw = fs.readFileSync('scraped/terms.html', 'utf8');
  // extract content inside article or entry-content
  const contentMatch = raw.match(/<div[^>]*class=["'][^"']*(?:entry-content|content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (contentMatch) {
    termsText = contentMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<h[1-6][^>]*>/gi, '\n\n### ')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<li[^>]*>/gi, '\n- ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#8217;/g, "'")
      .replace(/&#8211;/g, '-')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}

// 4. FAQ
let faqItems = [];
if (fs.existsSync('scraped/faq.html')) {
  const raw = fs.readFileSync('scraped/faq.html', 'utf8');
  // Match question and answer blocks
  const qRegex = /<h[3-5][^>]*>([\s\S]*?)<\/h[3-5]>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;
  let qMatch;
  while ((qMatch = qRegex.exec(raw)) !== null) {
    const q = qMatch[1].replace(/<[^>]+>/g, '').replace(/&#8217;/g, "'").trim();
    const a = qMatch[2].replace(/<[^>]+>/g, '').replace(/&#8217;/g, "'").trim();
    if (q && a && q.includes('?')) {
      faqItems.push({ question: q, answer: a });
    }
  }
}

// 5. CONTACT & AGENCY
const agencyInfo = {
  name: "Payless Car Rental Tunisia (Houimli Rent a Car)",
  address: "60, Avenue de l'UMA, La Soukra, Ariana 2036, Tunisie",
  phones: ["+216 25 120 130", "+216 24 220 277"],
  whatsapp: "+21625120130",
  email: "Reservations@hmlrentcar.tn",
  openingHours: {
    weekdays: "Lundi - Vendredi: 10:00 - 14:00 | 15:30 - 20:00",
    saturday: "Samedi: 10:00 - 14:00",
    sunday: "Fermé (Prise en charge aéroport disponible 24h/24)"
  },
  currencies: ["TND (Dinar Tunisien)", "EUR (€)"],
  experienceYears: 14,
  logoUrl: "https://hmlrentcar.tn/wp-content/uploads/2025/08/IMG_9268.png",
  faviconUrl: "https://hmlrentcar.tn/wp-content/uploads/2025/08/cropped-IMG_9268-192x192.png"
};

const fullScraped = {
  agencyInfo,
  locations,
  carsCount: carList.length,
  cars: carList,
  termsAndConditions: termsText,
  faq: faqItems
};

fs.writeFileSync('scraped_hmlrentcar.json', JSON.stringify(fullScraped, null, 2), 'utf8');
console.log('Saved scraped data to scraped_hmlrentcar.json');
console.log('Total Cars found:', carList.length);
console.log('Total Locations:', locations.length);
console.log('Terms text length:', termsText.length);
console.log('FAQ items found:', faqItems.length);

