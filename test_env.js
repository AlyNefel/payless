const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
if (!process.env.MONGODB_URI) {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
}

console.log('Using MongoDB URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.slice(0, 35) + '...' : 'NONE');

// We can compile TypeScript or run via next/register or write a small standalone seeder in JS

