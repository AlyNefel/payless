const { execSync } = require('child_process');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scraped_hmlrentcar.json', 'utf8'));
const cars = data.cars;

console.log(`Starting crawl for ${cars.length} cars...`);

if (!fs.existsSync('scraped/cars')) {
  fs.mkdirSync('scraped/cars', { recursive: true });
}

cars.forEach((car, index) => {
  const slug = car.url.replace(/\/$/, '').split('/').pop();
  const filePath = `scraped/cars/${slug}.html`;
  if (!fs.existsSync(filePath)) {
    console.log(`[${index + 1}/${cars.length}] Fetching ${car.name} (${slug})...`);
    try {
      execSync(`curl.exe -s -L "${car.url}" -o "${filePath}"`);
    } catch (e) {
      console.error(`Failed ${slug}:`, e.message);
    }
  }
});

console.log('All car pages downloaded successfully!');

