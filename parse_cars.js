const fs = require('fs');

const carFiles = [
  'scraped/car_hyundai_i10.html',
  'scraped/car_clio.html',
  'scraped/car_sportage.html',
  'scraped/car_swift.html'
];

for (const file of carFiles) {
  if (fs.existsSync(file)) {
    const html = fs.readFileSync(file, 'utf8');
    console.log(`\n=================== FILE: ${file} ===================`);
    
    // Extract title
    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    console.log('Title:', titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'N/A');

    // Extract images
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let m;
    const images = [];
    while ((m = imgRegex.exec(html)) !== null) {
      if (m[1].includes('uploads') && !m[1].includes('logo') && !m[1].includes('cropped')) {
        images.push(m[1]);
      }
    }
    console.log('Car Images:', [...new Set(images)]);

    // Extract specs table/list
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
    const priceMatch = text.match(/([0-9]+(?:[\.,][0-9]+)?)\s*(?:TND|DT|€|EUR|Dinar)/i);
    console.log('Price match:', priceMatch ? priceMatch[0] : 'None found directly');

    // Look for features / specs
    const specsRegex = /(?:Transmission|Fuel|Seats|Doors|Luggage|Airbag|Deposit|Caution|Franchise|Consommation|Mileage)[\s\S]{1,100}?<\/(?:li|td|div|p)>/gi;
    const specs = (text.match(specsRegex) || []).map(s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    console.log('Specs snippet:', specs.slice(0, 10));
  }
}

