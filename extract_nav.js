const fs = require('fs');
const html = fs.readFileSync('scratch_home.html', 'utf8');

// Find all <a> tags with text and href
const aRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
let match;
const links = [];
while ((match = aRegex.exec(html)) !== null) {
  const href = match[1];
  const text = match[2].replace(/<[^>]+>/g, '').trim();
  if (text && !href.startsWith('#') && !href.startsWith('javascript:')) {
    links.push({ href, text });
  }
}

console.log('--- NAV / MENU LINKS ---');
const menuLinks = links.filter(l => l.href.includes('hmlrentcar.tn'));
console.log(JSON.stringify(menuLinks, null, 2));

// Find select options (locations, categories, etc.)
const selectRegex = /<select[^>]*name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/select>/gi;
let selMatch;
console.log('\n--- SELECTS / FORM DROPDOWNS ---');
while ((selMatch = selectRegex.exec(html)) !== null) {
  const name = selMatch[1];
  const body = selMatch[2];
  const optRegex = /<option\s+[^>]*value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi;
  let oMatch;
  const options = [];
  while ((oMatch = optRegex.exec(body)) !== null) {
    options.push({ val: oMatch[1], text: oMatch[2].replace(/<[^>]+>/g, '').trim() });
  }
  console.log(`Select [${name}]:`, options);
}

