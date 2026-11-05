const { execSync } = require('child_process');
const fs = require('fs');

const pages = [
  { name: 'terms', url: 'https://hmlrentcar.tn/terms-and-conditions/' },
  { name: 'contact', url: 'https://hmlrentcar.tn/about-us/contact/' },
  { name: 'about', url: 'https://hmlrentcar.tn/about-us/' },
  { name: 'faq', url: 'https://hmlrentcar.tn/faq/' },
  { name: 'booking_process', url: 'https://hmlrentcar.tn/booking-process/' },
  { name: 'car_hyundai_i10', url: 'https://hmlrentcar.tn/car-model/hyundai-i10/' },
  { name: 'car_clio', url: 'https://hmlrentcar.tn/car-model/renault-clio-6-bvm/' },
  { name: 'car_sportage', url: 'https://hmlrentcar.tn/car-model/kia-sportage/' },
  { name: 'car_swift', url: 'https://hmlrentcar.tn/car-model/suzuki-swift-bva/' }
];

if (!fs.existsSync('scraped')) {
  fs.mkdirSync('scraped');
}

for (const p of pages) {
  const filePath = `scraped/${p.name}.html`;
  if (!fs.existsSync(filePath)) {
    console.log(`Downloading ${p.url}...`);
    try {
      execSync(`curl.exe -s -L "${p.url}" -o "${filePath}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Error downloading ${p.name}:`, e.message);
    }
  }
}
console.log('Done downloading subpages.');

