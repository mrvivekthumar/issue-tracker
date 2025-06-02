const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testIssueTable() {
    try {
        console.log('🔍 Testing Issue table specifically...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Missing ❌');

        // Test connection
        await prisma.$connect();
        console.log('✅ Connected to database successfully!');

        // Check if Issue table exists specifically
        console.log('\n📋 Checking Issue table existence...');

        try {
            const tableExists = await prisma.$queryRaw`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'Issue'
                );
            `;
            console.log('Issue table exists:', tableExists[0].exists);
        } catch (error) {
            console.log('❌ Error checking table existence:', error.message);
        }

        // Check table structure
        console.log('\n📋 Checking Issue table structure...');
        try {
            const columns = await prisma.$queryRaw`
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'Issue' 
                AND table_schema = 'public'
                ORDER BY ordinal_position;
            `;

            if (columns.length > 0) {
                console.log('✅ Issue table columns:');
                columns.forEach(col => {
                    console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
                });
            } else {
                console.log('❌ No columns found for Issue table');
            }
        } catch (error) {
            console.log('❌ Error checking table structure:', error.message);
        }

        // Try to count issues
        console.log('\n📊 Testing issue count...');
        try {
            const count = await prisma.issue.count();
            console.log('✅ Total issues:', count);
        } catch (error) {
            console.log('❌ Error counting issues:', error.message);
            console.log('Full error:', error);
        }

        // Try to find first issue
        console.log('\n📄 Testing findFirst...');
        try {
            const firstIssue = await prisma.issue.findFirst();
            console.log('✅ First issue:', firstIssue ? 'Found' : 'No issues in table');
        } catch (error) {
            console.log('❌ Error finding first issue:', error.message);
        }

        // Check all tables again
        console.log('\n📋 All tables in database:');
        const allTables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;
        console.log('Tables:', allTables.map(t => t.table_name).join(', '));

        // Check case sensitivity
        console.log('\n🔤 Checking case variations...');
        const caseCheck = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND LOWER(table_name) = 'issue';
        `;
        console.log('Case variations found:', caseCheck.map(t => t.table_name));

    } catch (error) {
        console.error('❌ Database error:', error.message);
        console.error('Full error object:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testIssueTable();