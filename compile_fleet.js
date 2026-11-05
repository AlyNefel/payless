const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('scraped/cars').filter(f => f.endsWith('.html'));
const fleet = [];

for (const file of files) {
  const html = fs.readFileSync(path.join('scraped/cars', file), 'utf8');
  const slug = file.replace('.html', '');

  // Title
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const name = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : slug;

  // Price in TND
  // looks like: "72.00 TND" or "90.00 TND"
  const priceMatch = html.match(/class=["'][^"']*price[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) ||
                     html.match(/([0-9]+(?:\.[0-9]+)?)\s*TND/i);
  let price = 70;
  if (priceMatch) {
    const rawVal = priceMatch[1].replace(/<[^>]+>/g, '').replace(/[^0-9.]/g, '');
    if (rawVal) price = parseFloat(rawVal);
  }

  // Deposit in TND
  const depMatch = html.match(/Deposit:\s*([0-9,]+)\s*TND/i);
  let deposit = 600;
  if (depMatch) {
    deposit = parseInt(depMatch[1].replace(/,/g, ''), 10);
  }

  // Seats, Doors, Luggage
  const seatsMatch = html.match(/([0-9]+)\s*Seats/i) || html.match(/Passenger seats[^:]*:\s*([0-9]+)/i);
  const seats = seatsMatch ? parseInt(seatsMatch[1], 10) : 5;

  const doorsMatch = html.match(/Doors:\s*([0-9]+)/i);
  const doors = doorsMatch ? parseInt(doorsMatch[1], 10) : 5;

  const luggageMatch = html.match(/luggage:\s*([0-9]+)/i);
  const luggage = luggageMatch ? parseInt(luggageMatch[1], 10) : 2;

  // Fuel & Transmission
  const isAuto = /BVA|Automatic/i.test(name) || /Transmission:\s*Automatic/i.test(html);
  const transmission = isAuto ? "automatic" : "manual";

  const isDiesel = /Diesel/i.test(html);
  const fuel = isDiesel ? "diesel" : "gasoline";

  // Category
  let category = "Economy";
  if (/SUV|Sportage|ZS|Arona|T-Cross|Kushaq|Magnite|Stepway|Stonic/i.test(name)) {
    category = "SUV";
  } else if (/Virtus|Leon|Fabia|Ibiza|Clio/i.test(name)) {
    category = "Compact";
  } else if (/Sportage|Excellence/i.test(name)) {
    category = "Luxury";
  }

  // Brand
  let brand = "Hyundai";
  if (/KIA/i.test(name)) brand = "Kia";
  else if (/SUZUKI/i.test(name)) brand = "Suzuki";
  else if (/DACIA/i.test(name)) brand = "Dacia";
  else if (/RENAULT/i.test(name)) brand = "Renault";
  else if (/SEAT/i.test(name)) brand = "Seat";
  else if (/SKODA/i.test(name)) brand = "Skoda";
  else if (/NISSAN/i.test(name)) brand = "Nissan";
  else if (/VW|VOLKSWAGEN/i.test(name)) brand = "Volkswagen";
  else if (/MG/i.test(name)) brand = "MG";

  // Images
  const imgRegex = /https:\/\/hmlrentcar\.tn\/wp-content\/uploads\/CarRentalGallery\/[a-zA-Z0-9_\-\.]+\.(?:jpeg|jpg|png)/gi;
  const rawImgs = [...new Set(html.match(imgRegex) || [])];
  const bigImages = rawImgs.filter(i => i.includes('big_thumb'));
  const gallery = bigImages.length > 0 ? bigImages : rawImgs;

  fleet.push({
    id: `car-${slug}`,
    name,
    slug,
    brand,
    model: name.replace(new RegExp(`^${brand}\\s*`, 'i'), '').trim(),
    category,
    transmission,
    fuelType: fuel,
    seats,
    doors,
    luggage,
    dailyPriceTND: price,
    dailyPriceEUR: Math.round(price / 3.35),
    depositTND: deposit,
    depositEUR: Math.round(deposit / 3.35),
    mileage: "Illimité (Unlimited)",
    mainImage: gallery[0] || "https://hmlrentcar.tn/wp-content/uploads/2025/08/IMG_9268.png",
    interiorImage: gallery[1] || gallery[0] || "",
    bootImage: gallery[2] || gallery[0] || "",
    gallery,
    features: [
      "Climatisation (A/C)",
      "Air Bags",
      "Direction assistée (Power Steering)",
      "Verrouillage centralisé (Central Locking)",
      "Vitres électriques (Electric Windows)",
      "ABS",
      "Système Audio HD / Bluetooth"
    ]
  });
}

console.log(`Compiled ${fleet.length} cars successfully!`);
fs.writeFileSync('payless-car-rental/compiled_fleet.json', JSON.stringify(fleet, null, 2), 'utf8');

fleet.slice(0, 10).forEach(c => {
  console.log(`- ${c.name} | Cat: ${c.category} | ${c.transmission} | ${c.dailyPriceTND} TND (${c.dailyPriceEUR} €) | Caution: ${c.depositTND} TND | Images: ${c.gallery.length}`);
});

