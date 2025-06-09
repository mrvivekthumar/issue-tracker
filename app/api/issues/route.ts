// app/api/issues/route.ts - Updated to track issue creator
import authOptions from "@/app/auth/authOptions";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { IssueSchema } from "../../validationSchemas";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({}, { status: 401 })
    }

    const body = await request.json()
    const validation = IssueSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(validation.error.errors, { status: 400 });
    }

    try {
        // 🔐 STEP 1: Get the user who is creating the issue
        const creatorUser = await prisma.user.findUnique({
            where: { email: session.user?.email! }
        });

        if (!creatorUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 🔐 STEP 2: Create the issue with creator tracking
        const newIssue = await prisma.issue.create({
            data: {
                title: body.title,
                description: body.description,
                createdByUserId: creatorUser.id, // Track who created the issue
            },
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });

        console.log(`📝 New issue created:`, {
            issueId: newIssue.id,
            title: newIssue.title,
            creator: creatorUser.email,
            createdAt: newIssue.createdAt
        });

        return NextResponse.json(newIssue, { status: 201 });

    } catch (error) {
        console.error('❌ Issue creation error:', error);
        return NextResponse.json({ error: "Failed to create issue" }, { status: 500 });
    }
}