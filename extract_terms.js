const fs = require('fs');
const html = fs.readFileSync('scraped/terms.html', 'utf8');

// Match everything from "Article 1" to footer
const startIdx = html.indexOf('Article 1');
const endIdx = html.indexOf('Useful Links', startIdx);
let termsContent = html.substring(startIdx, endIdx !== -1 ? endIdx : undefined);

termsContent = termsContent
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/p>/gi, '\n\n')
  .replace(/<h[1-6][^>]*>/gi, '\n\n### ')
  .replace(/<\/h[1-6]>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#8217;/g, "'")
  .replace(/&#8211;/g, '-')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

console.log('Terms length:', termsContent.length);
fs.writeFileSync('payless-car-rental/terms_extracted.txt', termsContent, 'utf8');
console.log('First 1000 chars:\n', termsContent.slice(0, 1000));

