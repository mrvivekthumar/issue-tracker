// Create this file: debug-db.js
// Run with: node debug-db.js

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function debugDatabase() {
    try {
        console.log('🔍 Checking database connection...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Missing ❌');

        // Test basic connection
        await prisma.$connect();
        console.log('✅ Connected to database successfully!');

        // Check what tables exist
        console.log('\n📋 Checking existing tables...');
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;

        if (tables.length === 0) {
            console.log('❌ No tables found in database!');
            console.log('🔧 You need to create tables using: npx prisma db push');
        } else {
            console.log('✅ Found tables:', tables.map(t => t.table_name).join(', '));
        }

    } catch (error) {
        console.error('❌ Database error:', error.message);

        if (error.message.includes('ENOTFOUND')) {
            console.log('💡 Check your DATABASE_URL in .env file');
        } else if (error.message.includes('password authentication failed')) {
            console.log('💡 Check your database password in DATABASE_URL');
        }
    } finally {
        await prisma.$disconnect();
    }
}

debugDatabase();