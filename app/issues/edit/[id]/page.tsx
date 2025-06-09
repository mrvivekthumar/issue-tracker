// app/issues/edit/[id]/page.tsx - Fixed with proper status handling
import prisma from '@/prisma/client';
import { notFound } from 'next/navigation';
import { Status } from '@prisma/client';
import EditIssueClient from '../../[id]/EditIssueClient ';


interface Props {
    params: Promise<{ id: string }> // Change this from params: { id: string }

}
const EditIssuePage = async ({ params }: Props) => {
    const { id } = await params; // Await the params first

    const issue = await prisma.issue.findUnique({
        where: { id: parseInt(id) }, // Now safe to use
        include: {
            createdByUser: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            },
            assignedToUser: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            }
        }
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
        assignedToUserId: issue.assignedToUserId,
        createdByUserId: issue.createdByUserId, // Add this field
        createdByUser: issue.createdByUser ? {   // Add creator info
            id: issue.createdByUser.id,
            name: issue.createdByUser.name,
            email: issue.createdByUser.email,
            image: issue.createdByUser.image
        } : null,
        assignedToUser: issue.assignedToUser ? { // Add assignee info
            id: issue.assignedToUser.id,
            name: issue.assignedToUser.name,
            email: issue.assignedToUser.email,
            image: issue.assignedToUser.image
        } : null
    };

    return <EditIssueClient issue={serializedIssue} />;
}

export default EditIssuePage