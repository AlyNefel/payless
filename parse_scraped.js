const fs = require('fs');

function cleanHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#038;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('══════════════ 1. CONTACT INFO ══════════════');
if (fs.existsSync('scraped/contact.html')) {
  const contactHtml = fs.readFileSync('scraped/contact.html', 'utf8');
  console.log(cleanHtml(contactHtml).slice(0, 2000));
}

console.log('\n══════════════ 2. TERMS AND CONDITIONS ══════════════');
if (fs.existsSync('scraped/terms.html')) {
  const termsHtml = fs.readFileSync('scraped/terms.html', 'utf8');
  console.log(cleanHtml(termsHtml).slice(0, 3000));
}

console.log('\n══════════════ 3. FAQ ══════════════');
if (fs.existsSync('scraped/faq.html')) {
  const faqHtml = fs.readFileSync('scraped/faq.html', 'utf8');
  console.log(cleanHtml(faqHtml).slice(0, 2500));
}

console.log('\n══════════════ 4. ABOUT US ══════════════');
if (fs.existsSync('scraped/about.html')) {
  const aboutHtml = fs.readFileSync('scraped/about.html', 'utf8');
  console.log(cleanHtml(aboutHtml).slice(0, 2000));
}

console.log('\n══════════════ 5. BOOKING PROCESS ══════════════');
if (fs.existsSync('scraped/booking_process.html')) {
  const bpHtml = fs.readFileSync('scraped/booking_process.html', 'utf8');
  console.log(cleanHtml(bpHtml).slice(0, 2000));
}

