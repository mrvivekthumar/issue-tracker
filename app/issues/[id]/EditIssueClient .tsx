// app/issues/edit/[id]/EditIssueClient.tsx - Fixed with proper Status type
'use client';

import dynamic from 'next/dynamic';
import { Status } from '@prisma/client';
import IssueFormSkeleton from '../_components/IssueFormSkeleton';

// Define the serialized Issue type (plain object only)
interface SerializedIssue {
    id: number;
    title: string;
    description: string;
    status: Status;
    createdAt: string; // Serialized as string
    updatedAt: string; // Serialized as string
    assignedToUserId: string | null;
    createdByUserId: string | null; // Add this line
}

const IssueForm = dynamic(
    () => import('@/app/issues/_components/IssueForm'),
    {
        ssr: false,
        loading: () => <IssueFormSkeleton />
    }
);

interface Props {
    issue: SerializedIssue;
}

const EditIssueClient = ({ issue }: Props) => {
    // Convert serialized dates back to Date objects
    // Status remains as Status enum type
    const issueWithDates = {
        ...issue,
        createdAt: new Date(issue.createdAt),
        updatedAt: new Date(issue.updatedAt),
        status: issue.status as Status, // Ensure it's typed as Status
        createdByUserId: issue.createdByUserId || null // Add missing property
    };

    return (
        <div>
            <IssueForm issue={issueWithDates} />
        </div>
    );
};

export default EditIssueClient;