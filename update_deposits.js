const fs = require('fs');
const path = require('path');

const fleet = JSON.parse(fs.readFileSync('payless-car-rental/compiled_fleet.json', 'utf8'));

for (const car of fleet) {
  const filePath = path.join('scraped/cars', `${car.slug}.html`);
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf8');
    const depMatch = html.match(/Deposit:[\s\S]*?<strong>\s*([0-9,]+)\s*TND\s*<\/strong>/i);
    if (depMatch) {
      const depVal = parseInt(depMatch[1].replace(/,/g, ''), 10);
      car.depositTND = depVal;
      car.depositEUR = Math.round(depVal / 3.35);
    }
  }
}

fs.writeFileSync('payless-car-rental/compiled_fleet.json', JSON.stringify(fleet, null, 2), 'utf8');

fleet.forEach((c, idx) => {
  console.log((idx+1).toString().padStart(2) + '. ' + c.name.padEnd(28) + ' | ' + c.dailyPriceTND + ' TND (' + c.dailyPriceEUR + ' €) | Caution: ' + c.depositTND + ' TND (' + c.depositEUR + ' €)');
});

