// app/issues/[id]/page.tsx - Updated with creator-based permissions
import authOptions from '@/app/auth/authOptions';
import prisma from '@/prisma/client';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';
import { Status } from '@prisma/client';
import IssueDetailsClient from './IssueDetailsClient';
import { cache } from 'react';

interface Props {
    params: Promise<{ id: string }>
}

// Cache the issue details so database load can be reduced
const fetchIssue = cache((issueId: number) =>
    prisma.issue.findUnique({
        where: { id: issueId },
        include: {
            // 🔐 NEW: Include creator information
            createdByUser: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            },
            // Existing: Include assignee information
            assignedToUser: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            }
        }
    })
);

const IssueDetailPage = async ({ params }: Props) => {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({}, { status: 401 })
    }

    const issue = await fetchIssue(parseInt(id));

    if (!issue) {
        notFound();
    }

    // 🔐 NEW: Serialize the issue object with creator info for Client Component
    const serializedIssue = {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        status: issue.status as Status,
        createdAt: issue.createdAt.toISOString(),
        updatedAt: issue.updatedAt.toISOString(),

        // 🔐 NEW: Creator information
        createdByUserId: issue.createdByUserId,
        createdByUser: issue.createdByUser ? {
            id: issue.createdByUser.id,
            name: issue.createdByUser.name,
            email: issue.createdByUser.email,
            image: issue.createdByUser.image
        } : null,

        // Existing: Assignee information
        assignedToUserId: issue.assignedToUserId,
        assignedToUser: issue.assignedToUser ? {
            id: issue.assignedToUser.id,
            name: issue.assignedToUser.name,
            email: issue.assignedToUser.email,
            image: issue.assignedToUser.image
        } : null
    };

    return <IssueDetailsClient issue={serializedIssue} hasSession={!!session} />;
}

export async function generateMetadata({ params }: Props) {
    const { id } = await params;
    const issue = await fetchIssue(parseInt(id));

    return {
        title: issue?.title,
        description: "Details of Issue " + issue?.id
    }
}

export default IssueDetailPage;