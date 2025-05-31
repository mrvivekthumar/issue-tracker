const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function checkConnection() {
    console.log('🔍 Checking if Next.js and Node.js use same database...');

    // This simulates exactly what Next.js does
    const prisma = new PrismaClient();

    try {
        // Show the exact connection string being used
        console.log('DATABASE_URL:', process.env.DATABASE_URL);

        // Connect to database
        await prisma.$connect();
        console.log('✅ Connected successfully');

        // Check what database we're actually connected to
        const dbInfo = await prisma.$queryRaw`SELECT current_database(), current_schema();`;
        console.log('📋 Connected to database:', dbInfo[0].current_database);
        console.log('📋 Connected to schema:', dbInfo[0].current_schema);

        // List all tables in this exact connection
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = current_schema()
            ORDER BY table_name;
        `;
        console.log('📋 Tables in current connection:', tables.map(t => t.table_name));

        // Try the exact same query that's failing in Next.js
        console.log('\n🧪 Testing the exact same queries from Next.js...');

        try {
            const openCount = await prisma.issue.count({ where: { status: "OPEN" } });
            console.log('✅ OPEN count:', openCount);

            const closedCount = await prisma.issue.count({ where: { status: "CLOSED" } });
            console.log('✅ CLOSED count:', closedCount);

            const inProgressCount = await prisma.issue.count({ where: { status: "IN_PROGRESS" } });
            console.log('✅ IN_PROGRESS count:', inProgressCount);

        } catch (error) {
            console.log('❌ Same error in Node.js:', error.message);
            console.log('Error code:', error.code);
            console.log('Error meta:', error.meta);
        }

    } catch (error) {
        console.error('❌ Connection error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkConnection();