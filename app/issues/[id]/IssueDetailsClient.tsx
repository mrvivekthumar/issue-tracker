// app/issues/[id]/IssueDetailsClient.tsx - COMPLETE VERSION with proper layout
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

    // Security: Check permissions
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* ✅ FIXED: Better responsive grid layout */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                    {/* Main Content - Takes more space on larger screens */}
                    <div className="xl:col-span-3 space-y-6">
                        <IssueDetails issue={issueWithDates} />
                    </div>

                    {/* Sidebar - Better organization and mobile-friendly */}
                    {hasSession && (
                        <div className="xl:col-span-1">
                            {/* ✅ FIXED: Remove sticky positioning that was causing layout issues */}
                            <div className="space-y-4">

                                {/* ✅ FIXED: Assignee Section - Most Important, Moved to Top */}
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
                                        <h3 className="text-sm font-semibold text-violet-900 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Assignee
                                        </h3>
                                        <p className="text-xs text-violet-700 mt-1">
                                            Who is working on this issue?
                                        </p>
                                    </div>
                                    <div className="p-4">
                                        <AssigneeSelect issue={issueWithDates} />
                                    </div>
                                </div>

                                {/* Status Control Section */}
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                        <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Status Control
                                        </h3>
                                        <p className="text-xs text-blue-700 mt-1">
                                            Update the issue progress
                                        </p>
                                    </div>
                                    <div className="p-4">
                                        <SecureStatusChanger
                                            issueId={issue.id}
                                            currentStatus={issue.status}
                                            assignedUserEmail={issue.assignedToUser?.email}
                                            onStatusChange={() => {
                                                // Broadcast status change event
                                                window.dispatchEvent(new CustomEvent('issue-updated', {
                                                    detail: { issueId: issue.id, type: 'status' }
                                                }));
                                                setTimeout(() => window.location.reload(), 1000);
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Actions Section */}
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                                        <h3 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                            Actions
                                        </h3>
                                        <p className="text-xs text-emerald-700 mt-1">
                                            Manage this issue
                                        </p>
                                    </div>
                                    <div className="p-4">
                                        <div className="space-y-3">
                                            {/* Edit Button */}
                                            {permissions.canEdit ? (
                                                <EditIssueButton issueId={issue.id} />
                                            ) : (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">Edit Restricted</span>
                                                </div>
                                            )}

                                            {/* Delete Button */}
                                            {permissions.canDelete ? (
                                                <DeleteIssueButton
                                                    issueId={issue.id}
                                                    issueTitle={issue.title}
                                                    issueStatus={issue.status}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-lg border border-gray-200">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">Delete Restricted</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Issue Metadata */}
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Issue Information
                                        </h4>
                                    </div>
                                    <div className="p-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 font-medium">ID:</span>
                                                <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">#{issue.id}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 font-medium">Status:</span>
                                                <span className={`font-medium px-2 py-1 rounded-full text-xs ${issue.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                                                    issue.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {issue.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-start text-sm">
                                                <span className="text-gray-600 font-medium">Assigned:</span>
                                                <div className="text-right">
                                                    {issue.assignedToUser?.email ? (
                                                        <div>
                                                            <div className="font-medium text-gray-900 text-xs truncate max-w-[120px]" title={issue.assignedToUser.name || ''}>
                                                                {issue.assignedToUser.name || 'Unknown'}
                                                            </div>
                                                            <div className="text-gray-500 text-xs truncate max-w-[120px]" title={issue.assignedToUser.email}>
                                                                {issue.assignedToUser.email}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 text-xs">Unassigned</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Permissions Info - Compact */}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Your Access Level
                                    </h4>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-blue-700 font-medium">Edit Content:</span>
                                            <span className={`px-2 py-1 rounded-full font-medium ${permissions.canEdit
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {permissions.canEdit ? 'Allowed' : 'Restricted'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-blue-700 font-medium">Change Status:</span>
                                            <span className={`px-2 py-1 rounded-full font-medium ${permissions.canChangeStatus
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {permissions.canChangeStatus ? 'Allowed' : 'Restricted'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-blue-700 font-medium">Delete Issue:</span>
                                            <span className={`px-2 py-1 rounded-full font-medium ${permissions.canDelete
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {permissions.canDelete ? 'Allowed' : 'Restricted'}
                                            </span>
                                        </div>
                                    </div>

                                    {permissions.reason && (
                                        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                                            <div className="flex items-start gap-1">
                                                <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                                <span><strong>Note:</strong> {permissions.reason}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Help for unassigned issues */}
                                {permissions.isUnassigned && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                        <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            💡 Quick Tip
                                        </h4>
                                        <p className="text-xs text-yellow-700 leading-relaxed">
                                            This issue is currently unassigned. Assign it to someone above to enable status changes and secure the editing permissions.
                                        </p>
                                    </div>
                                )}

                                {/* Security Info */}
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Security Features
                                    </h4>
                                    <div className="text-xs text-indigo-700 space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-600">✓</span>
                                            <span><strong>Role-based access:</strong> Only assigned users can modify content</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-600">✓</span>
                                            <span><strong>Status protection:</strong> Assignment required for status changes</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-600">✓</span>
                                            <span><strong>Delete protection:</strong> In-progress issues cannot be deleted</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IssueDetailsClient;