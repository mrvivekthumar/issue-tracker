// app/issues/edit/[id]/page.tsx - Fixed with proper status handling
import prisma from '@/prisma/client';
import { notFound } from 'next/navigation';
import { Status } from '@prisma/client';
import EditIssueClient from '../../[id]/EditIssueClient ';

interface Props {
    params: { id: string }
}

const EditIssuePage = async ({ params }: Props) => {
    const issue = await prisma.issue.findUnique({
        where: { id: parseInt(params.id) }
    });

    if (!issue) {
        notFound();
    }

    // Serialize the issue object to plain object
    // Keep status as Status enum (it's already a string enum)
    const serializedIssue = {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        status: issue.status as Status, // Explicitly type as Status
        createdAt: issue.createdAt.toISOString(), // Convert Date to string
        updatedAt: issue.updatedAt.toISOString(), // Convert Date to string
        assignedToUserId: issue.assignedToUserId
    };

    return <EditIssueClient issue={serializedIssue} />;
}

export default EditIssuePage