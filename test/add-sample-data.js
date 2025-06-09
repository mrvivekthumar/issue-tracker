// Fixed add-sample-data.js - Simple and Reliable Version
// Run with: node add-sample-data.js

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function addSampleData() {
    try {
        console.log('🌱 Adding sample issues to your database...');

        // 🔐 STEP 1: Get any existing user or create a demo user
        let sampleUser = await prisma.user.findFirst();

        // If no users exist, create a sample user
        if (!sampleUser) {
            console.log('👤 No users found, creating a sample user...');
            sampleUser = await prisma.user.create({
                data: {
                    email: 'demo@example.com',
                    name: 'Demo User',
                    image: null
                }
            });
            console.log('✅ Sample user created:', sampleUser.email);
        } else {
            console.log('👤 Using existing user as creator:', sampleUser.email || 'No email');
        }

        // 🔐 STEP 2: Create sample issues with creator tracking
        const issueData = [
            {
                title: 'Fix login button alignment',
                description: 'The login button is not properly aligned on mobile devices. It appears to be shifted to the left and causes UI inconsistency.',
                status: 'CLOSED'
            },
            {
                title: 'Add dark mode support',
                description: 'Users have requested a dark mode option for better viewing in low-light conditions. This should include theme switching functionality.',
                status: 'IN_PROGRESS'
            },
            {
                title: 'Database backup automation',
                description: 'Set up automated daily backups for the production database to ensure data safety and recovery options.',
                status: 'CLOSED'
            },
            {
                title: 'Performance optimization needed',
                description: 'The dashboard loads slowly when there are more than 100 issues. Need to implement pagination and optimize queries.',
                status: 'IN_PROGRESS'
            },
            {
                title: 'Add email notifications',
                description: 'Users should receive email notifications when issues are assigned to them or when status changes occur.',
                status: 'IN_PROGRESS'
            }
        ];

        const issues = [];
        for (const data of issueData) {
            const issue = await prisma.issue.create({
                data: {
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    createdByUserId: sampleUser.id // 🔐 Track who created this issue
                }
            });
            issues.push(issue);
            console.log(`✅ Created issue: ${data.title}`);
        }

        console.log(`\n🎉 Successfully created ${issues.length} sample issues!`);

        // 🔐 STEP 3: Show creator information
        console.log(`👤 All issues created by: ${sampleUser.name || 'Unknown'} (${sampleUser.email || 'No email'})`);

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

        // 🔐 STEP 4: Show creator-based permissions info
        console.log('\n🔐 Permission System:');
        console.log(`   ✅ ${sampleUser.name || sampleUser.email} can edit all these issues (creator)`);
        console.log(`   ✅ Assigned users can change status only`);
        console.log(`   ✅ Other users can only view issues`);

        console.log('\n🎉 Your app is ready to use with creator-based permissions!');
        console.log('👉 Run: npm run dev');
        console.log('🔐 Log in with Google to test the permission system');

    } catch (error) {
        console.error('❌ Error adding sample data:', error.message);

        // More specific error handling
        if (error.code === 'P2002') {
            console.error('💡 Tip: This might be a duplicate key error. Try deleting existing data first.');
        } else if (error.code === 'P2025') {
            console.error('💡 Tip: Record not found. Make sure your database is properly set up.');
        } else if (error.message.includes('createdByUserId')) {
            console.error('💡 Tip: Make sure you ran "npx prisma db push" to update your database schema.');
        }

        console.error('\nFull error details:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addSampleData();