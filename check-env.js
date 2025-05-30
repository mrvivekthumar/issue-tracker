// Create this file: check-env.js
// Run with: node check-env.js

require('dotenv').config();

console.log('🔍 Checking all environment variables...\n');

// Check DATABASE_URL variations
const dbUrls = [
    'DATABASE_URL',
    'DIRECT_URL',
    'POSTGRES_URL',
    'SUPABASE_URL'
];

dbUrls.forEach(key => {
    const value = process.env[key];
    if (value) {
        console.log(`✅ ${key}:`, value.substring(0, 50) + '...');
    } else {
        console.log(`❌ ${key}: Not set`);
    }
});

console.log('\n🔍 Checking NextAuth variables...');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Not set');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set ✅' : 'Not set ❌');

console.log('\n🔍 Checking Google OAuth...');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set ✅' : 'Not set ❌');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set ✅' : 'Not set ❌');

// Show the exact DATABASE_URL being used
console.log('\n📋 Exact DATABASE_URL format check:');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
    console.log('Starts with postgresql://?', dbUrl.startsWith('postgresql://'));
    console.log('Contains password?', dbUrl.includes(':') && dbUrl.split(':').length >= 3);
    console.log('Contains host?', dbUrl.includes('@'));
    console.log('Contains database name?', dbUrl.includes('/') && dbUrl.split('/').length >= 4);
} else {
    console.log('❌ DATABASE_URL is not set!');
}