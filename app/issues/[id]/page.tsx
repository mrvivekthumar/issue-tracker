// app/issues/[id]/page.tsx - Fixed with proper Status handling
import authOptions from '@/app/auth/authOptions';
import prisma from '@/prisma/client';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';
import { Status } from '@prisma/client';
import IssueDetailsClient from './IssueDetailsClient';
import { cache } from 'react';

interface Props {
    params: { id: string }
}

// Cache the issue details so database load can be reduced
const fetchUser = cache((issueId: number) =>
    prisma.issue.findUnique({
        where: { id: issueId },
        include: {
            assignedToUser: true
        }
    })
);

const IssueDetailPage = async ({ params }: Props) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({}, { status: 401 })
    }

    const issue = await fetchUser(parseInt(params.id));

    if (!issue) {
        notFound();
    }

    // Serialize the issue object for Client Component
    // Status enum values are already strings, so they're serializable
    const serializedIssue = {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        status: issue.status as Status, // Keep as Status enum type
        createdAt: issue.createdAt.toISOString(),
        updatedAt: issue.updatedAt.toISOString(),
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
    const issue = await fetchUser(parseInt(params.id));

    return {
        title: issue?.title,
        description: "Details of Issue " + issue?.id
    }
}

export default IssueDetailPage;