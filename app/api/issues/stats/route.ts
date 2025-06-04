// app/api/issues/stats/route.ts - SAFER VERSION with better error handling
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Dynamic import to ensure Prisma is properly loaded
        const { default: prisma } = await import("@/prisma/client");

        console.log('🔍 Attempting to fetch issue stats...');

        // Test database connection first
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        // Use Promise.all for parallel database queries
        const [total, open, inProgress, closed] = await Promise.all([
            prisma.issue.count().catch(err => {
                console.error('Error counting total issues:', err);
                return 0;
            }),
            prisma.issue.count({ where: { status: "OPEN" } }).catch(err => {
                console.error('Error counting open issues:', err);
                return 0;
            }),
            prisma.issue.count({ where: { status: "IN_PROGRESS" } }).catch(err => {
                console.error('Error counting in-progress issues:', err);
                return 0;
            }),
            prisma.issue.count({ where: { status: "CLOSED" } }).catch(err => {
                console.error('Error counting closed issues:', err);
                return 0;
            })
        ]);

        const stats = {
            total,
            open,
            inProgress,
            closed
        };

        console.log('📊 Issue stats fetched successfully:', stats);

        // Add caching headers
        return NextResponse.json(stats, {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            },
        });

    } catch (error: any) {
        console.error('❌ Failed to fetch issue stats:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            clientVersion: error.clientVersion
        });

        // Return safe default stats instead of throwing
        const defaultStats = {
            total: 0,
            open: 0,
            inProgress: 0,
            closed: 0
        };

        return NextResponse.json(defaultStats, {
            status: 200, // Return 200 with default data
            headers: {
                'X-Error': 'Database connection failed',
                'Cache-Control': 'no-cache',
            },
        });
    } finally {
        try {
            // Always try to disconnect
            const { default: prisma } = await import("@/prisma/client");
            await prisma.$disconnect();
        } catch (disconnectError) {
            console.warn('Warning: Could not disconnect from database:', disconnectError);
        }
    }
}