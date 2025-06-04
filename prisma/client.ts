// prisma/client.ts - FIXED VERSION
import { PrismaClient } from '@prisma/client'

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ??
    new PrismaClient({
        log: ['query'], // Add logging to see what's happening
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma