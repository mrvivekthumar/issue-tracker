import prisma from "@/prisma/client";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
    // Handle different URLs in different environments
    ...(process.env.NODE_ENV === 'production' && {
        cookies: {
            sessionToken: {
                name: 'next-auth.session-token',
                options: {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    secure: true
                }
            }
        }
    })
}

export default authOptions;