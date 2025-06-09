// app/issues/[id]/IssueDetailsClient.tsx - Completely Redesigned
'use client';

import { Status } from '@prisma/client';
import AssigneeSelect from './AssigneeSelect';
import DeleteIssueButton from './DeleteIssueButton';
import EditIssueButton from './EditIssueButton';
import IssueDetails from './IssueDetails';
import SecureStatusChanger from '@/app/components/SecureStatusChanger';
import { useSession } from 'next-auth/react';
import { checkIssuePermissions } from '@/lib/permissions';
import { useEffect, useMemo } from 'react';
import {
    FiUser, FiCalendar, FiClock, FiTag, FiEdit3, FiTrash2,
    FiArrowLeft, FiShare2, FiBookmark, FiEye
} from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

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
    createdByUserId: string | null;
    createdByUser: SerializedUser | null;
    assignedToUserId: string | null;
    assignedToUser: SerializedUser | null;
}

interface Props {
    issue: SerializedIssue;
    hasSession: boolean;
}

// 🎨 User Avatar Component (same as before)
const UserAvatar = ({ user, size = 32, className = "" }: {
    user: SerializedUser | null,
    size?: number,
    className?: string
}) => {
    if (!user) {
        return (
            <div className={`rounded-full bg-gray-200 flex items-center justify-center ${className}`}
                style={{ width: size, height: size }}>
                <FiUser className="text-gray-400" style={{ width: size * 0.5, height: size * 0.5 }} />
            </div>
        );
    }

    const getInitials = (name: string | null, email: string | null) => {
        if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        if (email) return email[0].toUpperCase();
        return 'U';
    };

    const getRandomColor = (str: string) => {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const initials = getInitials(user.name, user.email);
    const colorClass = getRandomColor(user.email || user.name || 'user');

    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            {user.image ? (
                <Image
                    src={user.image}
                    alt={user.name || 'User'}
                    width={size}
                    height={size}
                    className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
                    unoptimized={true}
                />
            ) : (
                <div className={`w-full h-full rounded-full ${colorClass} flex items-center justify-center text-white font-bold border-2 border-white shadow-sm`}
                    style={{ fontSize: size * 0.35 }}>
                    {initials}
                </div>
            )}
        </div>
    );
};

// 🎨 Status Badge Component
const StatusBadge = ({ status }: { status: Status }) => {
    const statusConfig = {
        OPEN: { label: 'Open', className: 'bg-red-100 text-red-800 border-red-200', icon: '🔴' },
        IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🟡' },
        CLOSED: { label: 'Closed', className: 'bg-green-100 text-green-800 border-green-200', icon: '🟢' }
    };

    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}>
            <span>{config.icon}</span>
            {config.label}
        </span>
    );
};

const IssueDetailsClient = ({ issue, hasSession }: Props) => {
    const { data: session } = useSession();

    const issueWithDates = {
        ...issue,
        createdAt: new Date(issue.createdAt),
        updatedAt: new Date(issue.updatedAt),
        status: issue.status as Status
    };

    const permissions = checkIssuePermissions(session, issueWithDates);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return formatDate(date);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 🎨 Header Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/issues/list"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <FiArrowLeft className="w-5 h-5" />
                                <span className="font-medium">Back to Issues</span>
                            </Link>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Issue</span>
                                <span className="font-mono text-lg font-bold text-gray-900">#{issue.id}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <FiBookmark className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <FiShare2 className="w-5 h-5" />
                            </button>
                            <StatusBadge status={issue.status} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 🎨 Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Main Content Column */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Issue Header */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                        {issue.title}
                                    </h1>

                                    {/* Meta Information */}
                                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <FiUser className="w-4 h-4" />
                                            <span>Created by</span>
                                            <div className="flex items-center gap-2">
                                                <UserAvatar user={issue.createdByUser} size={20} />
                                                <span className="font-medium">
                                                    {issue.createdByUser?.name || issue.createdByUser?.email || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <FiCalendar className="w-4 h-4" />
                                            <span>{formatDate(issueWithDates.createdAt)}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <FiClock className="w-4 h-4" />
                                            <span>Updated {getTimeAgo(issueWithDates.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {hasSession && (
                                    <div className="flex items-center gap-2">
                                        {permissions.canEdit && (
                                            <Link
                                                href={`/issues/edit/${issue.id}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                                            >
                                                <FiEdit3 className="w-4 h-4" />
                                                Edit
                                            </Link>
                                        )}

                                        {permissions.canDelete && (
                                            <DeleteIssueButton
                                                issueId={issue.id}
                                                issueTitle={issue.title}
                                                issueStatus={issue.status}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Issue Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FiEye className="w-5 h-5 text-gray-600" />
                                    Description
                                </h2>
                            </div>
                            <div className="p-6">
                                <IssueDetails issue={issueWithDates} />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    {hasSession && (
                        <div className="lg:col-span-1 space-y-6">

                            {/* Status Control */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <FiTag className="w-4 h-4 text-gray-600" />
                                        Status
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <SecureStatusChanger
                                        issueId={issue.id}
                                        currentStatus={issue.status}
                                        assignedUserEmail={issue.assignedToUser?.email}
                                        onStatusChange={() => {
                                            window.dispatchEvent(new CustomEvent('issue-updated', {
                                                detail: { issueId: issue.id, type: 'status' }
                                            }));
                                            setTimeout(() => window.location.reload(), 1000);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Assignee */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <FiUser className="w-4 h-4 text-gray-600" />
                                        Assignee
                                        {!permissions.canAssign && (
                                            <div className="ml-auto">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                    Read-only
                                                </span>
                                            </div>
                                        )}
                                    </h3>
                                </div>
                                <div className="p-4">
                                    <AssigneeSelect issue={issueWithDates} />
                                </div>
                            </div>

                            {/* Issue Information */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-900">Information</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm text-gray-600">ID</span>
                                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                            #{issue.id}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-start">
                                        <span className="text-sm text-gray-600">Creator</span>
                                        <div className="flex items-center gap-2">
                                            <UserAvatar user={issue.createdByUser} size={24} />
                                            <div className="text-right">
                                                <div className="text-sm font-medium">
                                                    {issue.createdByUser?.name || 'Unknown'}
                                                </div>
                                                {permissions.isCreator && (
                                                    <div className="text-xs text-green-600">You</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-start">
                                        <span className="text-sm text-gray-600">Created</span>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                {formatDate(issueWithDates.createdAt).split(',')[0]}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {getTimeAgo(issueWithDates.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-start">
                                        <span className="text-sm text-gray-600">Updated</span>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                {formatDate(issueWithDates.updatedAt).split(',')[0]}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {getTimeAgo(issueWithDates.updatedAt)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Your Permissions */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
                                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <FiUser className="w-3 h-3 text-white" />
                                    </div>
                                    Your Access
                                </h3>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-700">Role:</span>
                                        <span className="font-medium text-blue-900">
                                            {permissions.isCreator ? 'Creator' :
                                                permissions.isAssignee ? 'Assignee' : 'Viewer'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-700">Can Edit:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${permissions.canEdit
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {permissions.canEdit ? 'Yes' : 'No'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-700">Can Change Status:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${permissions.canChangeStatus
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {permissions.canChangeStatus ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>

                                {permissions.reason && (
                                    <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded text-xs text-orange-700">
                                        <strong>Note:</strong> {permissions.reason}
                                    </div>
                                )}
                            </div>

                            {/* Permission Rules */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
                                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    Permission System
                                </h3>

                                <div className="space-y-2 text-xs text-green-700">
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span><strong>Creator:</strong> Can edit content, assign people, and delete</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span><strong>Assignee:</strong> Can change status (Open, In Progress, Closed)</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span><strong>Others:</strong> Can view but not modify</span>
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