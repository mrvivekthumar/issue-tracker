// test-users.js - Run this to check your users
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testUsers() {
    try {
        console.log('🔍 Checking users in database...');

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                _count: {
                    select: {
                        createdIssues: true,
                        assignedIssues: true
                    }
                }
            }
        });

        console.log(`\n👥 Found ${users.length} users:`);

        if (users.length === 0) {
            console.log('❌ No users found! You need to log in with Google first.');
        } else {
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. User:`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Name: ${user.name || 'No name'}`);
                console.log(`   Email: ${user.email || 'No email'}`);
                console.log(`   Image: ${user.image ? 'Yes' : 'No'}`);
                console.log(`   Created Issues: ${user._count.createdIssues}`);
                console.log(`   Assigned Issues: ${user._count.assignedIssues}`);
            });
        }

        // Test the API format
        const apiFormat = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
        }));

        console.log('\n📡 API Format:', JSON.stringify(apiFormat, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testUsers();