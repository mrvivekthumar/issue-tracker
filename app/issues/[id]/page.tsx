import authOptions from '@/app/auth/authOptions';
import prisma from '@/prisma/client';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';
import AssigneeSelect from './AssigneeSelect';
import DeleteIssueButton from './DeleteIssueButton';
import EditIssueButton from './EditIssueButton';
import IssueDetails from './IssueDetails';
import { cache } from 'react';

interface Props {
    params: { id: string }
}

// This fuction will cache the issue details so database load can be removed
const fetchUser = cache((issuedId: number) => prisma.issue.findUnique({ where: { id: issuedId } }))

const IssueDetailPage = async ({ params }: Props) => {

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({}, { status: 401 })
    }

    const issue = await fetchUser(parseInt(params.id));

    if (!issue) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-4">
                    <IssueDetails issue={issue} />
                </div>

                {/* Sidebar Actions */}
                {session && (
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-4">
                            {/* Assignee Section */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Assignee</h3>
                                <AssigneeSelect issue={issue} />
                            </div>

                            {/* Actions Section */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
                                <div className="space-y-3">
                                    <EditIssueButton issueId={issue.id} />
                                    <DeleteIssueButton issueId={issue.id} />
                                </div>
                            </div>

                            {/* Issue Info */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Issue Info</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">ID:</span>
                                        <span className="font-mono text-gray-900">#{issue.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="font-medium text-gray-900">
                                            {issue.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Priority:</span>
                                        <span className="font-medium text-orange-600">Medium</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export async function generateMetadata({ params }: Props) {
    const issue = await fetchUser(parseInt(params.id));

    return {
        title: issue?.title,
        description: "Details of Issue" + issue?.id
    }
}

export default IssueDetailPage;