// app/issues/[id]/IssueDetailsClient.tsx - UPDATED to pass props
'use client';

import { Status } from '@prisma/client';
import AssigneeSelect from './AssigneeSelect';
import DeleteIssueButton from './DeleteIssueButton';
import EditIssueButton from './EditIssueButton';
import IssueDetails from './IssueDetails';

// Define serialized types for Client Component
interface SerializedUser {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
}

interface SerializedIssue {
    id: number;
    title: string;
    description: string;
    status: Status; // Keep as Status enum
    createdAt: string;
    updatedAt: string;
    assignedToUserId: string | null;
    assignedToUser: SerializedUser | null;
}

interface Props {
    issue: SerializedIssue;
    hasSession: boolean;
}

const IssueDetailsClient = ({ issue, hasSession }: Props) => {
    // Convert serialized dates back to Date objects
    // Status is already the correct enum type
    const issueWithDates = {
        ...issue,
        createdAt: new Date(issue.createdAt),
        updatedAt: new Date(issue.updatedAt),
        status: issue.status as Status // Ensure proper typing
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-4">
                    <IssueDetails issue={issueWithDates} />
                </div>

                {/* Sidebar Actions */}
                {hasSession && (
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-4">
                            {/* Assignee Section */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Assignee</h3>
                                <AssigneeSelect issue={issueWithDates} />
                            </div>

                            {/* Actions Section */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
                                <div className="space-y-3">
                                    <EditIssueButton issueId={issue.id} />
                                    {/* 🔧 UPDATED: Pass additional props for better error handling */}
                                    <DeleteIssueButton
                                        issueId={issue.id}
                                        issueTitle={issue.title}
                                        issueStatus={issue.status}
                                    />
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
                                        <span className={`font-medium ${issue.status === 'OPEN' ? 'text-red-600' :
                                            issue.status === 'IN_PROGRESS' ? 'text-yellow-600' :
                                                'text-green-600'
                                            }`}>
                                            {issue.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Priority:</span>
                                        <span className="font-medium text-orange-600">Medium</span>
                                    </div>
                                    {/* 🔧 ADDED: Deletion status indicator */}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Deletable:</span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${issue.status === 'IN_PROGRESS'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {issue.status === 'IN_PROGRESS' ? 'Protected' : 'Yes'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 🔧 ADDED: Status change helper */}
                            {issue.status === 'IN_PROGRESS' && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                    <h3 className="text-sm font-semibold text-orange-800 mb-2">Can't Delete?</h3>
                                    <p className="text-xs text-orange-700 mb-3">
                                        Issues in progress are protected from deletion. Change the status first.
                                    </p>
                                    <div className="text-xs text-orange-600">
                                        <strong>Tip:</strong> Use the Edit button to change status to OPEN or CLOSED
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IssueDetailsClient;