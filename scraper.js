const fs = require('fs');

const html = fs.readFileSync('scratch_home.html', 'utf8');
console.log('HTML length:', html.length);

const links = [];
const regex = /href=["']([^"']+)["']/g;
let match;
while ((match = regex.exec(html)) !== null) {
  links.push(match[1]);
}

const uniqueLinks = [...new Set(links)];
console.log('Total unique links:', uniqueLinks.length);
console.log('Sample links:\n', uniqueLinks.filter(l => l.includes('http') || l.startsWith('/')).slice(0, 40));

// Find phone numbers, emails, addresses
const phoneRegex = /(?:\+?216)?[\s.-]?[0-9]{2}[\s.-]?[0-9]{3}[\s.-]?[0-9]{3}/g;
const phones = [...new Set(html.match(phoneRegex) || [])];
console.log('\nPhones found:', phones);

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const emails = [...new Set(html.match(emailRegex) || [])];
console.log('Emails found:', emails);

// Look for logo
const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
const imgs = [];
let imgMatch;
while ((imgMatch = imgRegex.exec(html)) !== null) {
  imgs.push(imgMatch[1]);
}
console.log('\nImages sample:', imgs.filter(i => i.toLowerCase().includes('logo') || i.toLowerCase().includes('car')).slice(0, 15));

