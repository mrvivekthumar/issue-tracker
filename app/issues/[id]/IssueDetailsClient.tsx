
'use client';

import { Status } from '@prisma/client';
import AssigneeSelect from './AssigneeSelect';
import DeleteIssueButton from './DeleteIssueButton';
import EditIssueButton from './EditIssueButton';
import IssueDetails from './IssueDetails';
import SecureStatusChanger from '@/app/components/SecureStatusChanger';
import { useSession } from 'next-auth/react';
import { checkIssuePermissions, debugPermissions } from '@/lib/permissions';
import { useEffect, useMemo } from 'react';

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
    status: Status;
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
    const { data: session } = useSession();

    // Convert serialized dates back to Date objects
    const issueWithDates = {
        ...issue,
        createdAt: new Date(issue.createdAt),
        updatedAt: new Date(issue.updatedAt),
        status: issue.status as Status
    };

    // 🔐 SECURITY: Check permissions
    const permissions = checkIssuePermissions(session, issueWithDates);

    const issueForDebugging = useMemo(() => ({
        ...issue,
        createdAt: new Date(issue.createdAt),
        updatedAt: new Date(issue.updatedAt),
        status: issue.status as Status
    }), [issue.id, issue.status, issue.assignedToUserId, issue.title, issue]);

    useEffect(() => {
        debugPermissions(session, issueForDebugging);
    }, [session, issueForDebugging]);


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
                            {/* 🔐 SECURITY: Permission Summary */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Permissions</h3>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span>Edit:</span>
                                        <span className={`px-2 py-1 rounded-full font-medium ${permissions.canEdit
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {permissions.canEdit ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Change Status:</span>
                                        <span className={`px-2 py-1 rounded-full font-medium ${permissions.canChangeStatus
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {permissions.canChangeStatus ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Delete:</span>
                                        <span className={`px-2 py-1 rounded-full font-medium ${permissions.canDelete
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {permissions.canDelete ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>

                                {permissions.reason && (
                                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                                        <strong>Note:</strong> {permissions.reason}
                                    </div>
                                )}
                            </div>

                            {/* 🔐 SECURITY: Secure Status Changer */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <SecureStatusChanger
                                    issueId={issue.id}
                                    currentStatus={issue.status}
                                    assignedUserEmail={issue.assignedToUser?.email}
                                    onStatusChange={() => {
                                        // Refresh the page to show updated status
                                        window.location.reload();
                                    }}
                                />
                            </div>

                            {/* Assignee Section */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Assignee</h3>
                                <AssigneeSelect issue={issueWithDates} />
                            </div>

                            {/* Actions Section */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
                                <div className="space-y-3">
                                    {/* 🔐 SECURITY: Show edit button only if allowed */}
                                    {permissions.canEdit ? (
                                        <EditIssueButton issueId={issue.id} />
                                    ) : (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                                            <span>🔒</span>
                                            <span className="text-sm font-medium">Edit Restricted</span>
                                        </div>
                                    )}

                                    {/* 🔐 SECURITY: Show delete button only if allowed */}
                                    {permissions.canDelete ? (
                                        <DeleteIssueButton
                                            issueId={issue.id}
                                            issueTitle={issue.title}
                                            issueStatus={issue.status}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                                            <span>🔒</span>
                                            <span className="text-sm font-medium">Delete Restricted</span>
                                        </div>
                                    )}
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
                                        <span className="text-gray-600">Assigned:</span>
                                        <span className="text-gray-900 text-xs">
                                            {issue.assignedToUser?.email || 'Unassigned'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Your Role:</span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${permissions.isAssignedUser
                                            ? 'bg-green-100 text-green-700'
                                            : permissions.isUnassigned
                                                ? 'bg-gray-100 text-gray-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {permissions.isAssignedUser ? 'Assignee' :
                                                permissions.isUnassigned ? 'Anyone' : 'Viewer'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 🔐 SECURITY: Help section */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-blue-800 mb-2">Security Info</h3>
                                <div className="text-xs text-blue-700 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <span>🔒</span>
                                        <span>Only assigned users can edit content and change status</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span>👤</span>
                                        <span>Unassigned issues can be edited by anyone</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span>🚫</span>
                                        <span>Issues in progress cannot be deleted</span>
                                    </div>
                                </div>
                            </div>

                            {/* 🔐 SECURITY: Assignment tip for unassigned issues */}
                            {permissions.isUnassigned && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <h3 className="text-sm font-semibold text-yellow-800 mb-2">💡 Tip</h3>
                                    <p className="text-xs text-yellow-700">
                                        This issue is unassigned. Assign it to someone to enable status changes and protect it from unauthorized edits.
                                    </p>
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