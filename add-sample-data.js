// Create this file: add-sample-data.js
// Run with: node add-sample-data.js

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function addSampleData() {
    try {
        console.log('🌱 Adding sample issues to your database...');

        // Create sample issues
        const issues = await Promise.all([
            prisma.issue.create({
                data: {
                    title: 'Fix login button alignment',
                    description: 'The login button is not properly aligned on mobile devices. It appears to be shifted to the left and causes UI inconsistency.',
                    status: 'OPEN'
                }
            }),
            prisma.issue.create({
                data: {
                    title: 'Add dark mode support',
                    description: 'Users have requested a dark mode option for better viewing in low-light conditions. This should include theme switching functionality.',
                    status: 'IN_PROGRESS'
                }
            }),
            prisma.issue.create({
                data: {
                    title: 'Database backup automation',
                    description: 'Set up automated daily backups for the production database to ensure data safety and recovery options.',
                    status: 'CLOSED'
                }
            }),
            prisma.issue.create({
                data: {
                    title: 'Performance optimization needed',
                    description: 'The dashboard loads slowly when there are more than 100 issues. Need to implement pagination and optimize queries.',
                    status: 'OPEN'
                }
            }),
            prisma.issue.create({
                data: {
                    title: 'Add email notifications',
                    description: 'Users should receive email notifications when issues are assigned to them or when status changes occur.',
                    status: 'OPEN'
                }
            })
        ]);

        console.log(`✅ Successfully created ${issues.length} sample issues!`);

        // Count total issues
        const totalIssues = await prisma.issue.count();
        console.log(`📊 Total issues in database: ${totalIssues}`);

        // Show status breakdown
        const openCount = await prisma.issue.count({ where: { status: 'OPEN' } });
        const inProgressCount = await prisma.issue.count({ where: { status: 'IN_PROGRESS' } });
        const closedCount = await prisma.issue.count({ where: { status: 'CLOSED' } });

        console.log('\n📈 Issue Status Breakdown:');
        console.log(`   Open: ${openCount}`);
        console.log(`   In Progress: ${inProgressCount}`);
        console.log(`   Closed: ${closedCount}`);

        console.log('\n🎉 Your app is ready to use!');
        console.log('👉 Run: npm run dev');

    } catch (error) {
        console.error('❌ Error adding sample data:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

addSampleData();