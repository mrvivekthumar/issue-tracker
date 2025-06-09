// app/issues/[id]/AssigneeSelect.tsx - Better Design + No Placeholder Images
'use client';
import { Skeleton } from "@/app/components";
import { Issue, User } from '@prisma/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";
import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiUser, FiUserCheck, FiLoader, FiRefreshCw, FiLock } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface IssueWithUser extends Issue {
    createdByUser?: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
    assignedToUser?: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
}

// 🎨 COMPONENT: User Avatar with fallback
const UserAvatar = ({ user, size = 40, showStatus = false }: {
    user: { name: string | null; email: string | null; image: string | null; },
    size?: number,
    showStatus?: boolean
}) => {
    const [imageError, setImageError] = useState(false);

    const getInitials = (name: string | null, email: string | null) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        if (email) {
            return email[0].toUpperCase();
        }
        return 'U';
    };

    const getRandomColor = (str: string) => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
            'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const initials = getInitials(user.name, user.email);
    const colorClass = getRandomColor(user.email || user.name || 'user');

    return (
        <div className="relative" style={{ width: size, height: size }}>
            {user.image && !imageError ? (
                <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className={`w-full h-full rounded-full ${colorClass} flex items-center justify-center text-white font-bold border-2 border-white shadow-sm`}
                    style={{ fontSize: size * 0.4 }}>
                    {initials}
                </div>
            )}
            {showStatus && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                    <FiUserCheck className="w-2 h-2 text-white" />
                </div>
            )}
        </div>
    );
};

const AssigneeSelect = ({ issue }: { issue: IssueWithUser }) => {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [localAssignee, setLocalAssignee] = useState(issue.assignedToUser);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: users, error, isLoading, refetch: refetchUsers } = useUsers();

    // Check if current user is the creator
    const isCreator = session?.user?.email === issue.createdByUser?.email;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update local state when issue prop changes
    useEffect(() => {
        setLocalAssignee(issue.assignedToUser);
    }, [issue.assignedToUser]);

    const broadcastUpdate = (eventType: string, data?: any) => {
        window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
        localStorage.setItem(eventType, JSON.stringify({
            timestamp: Date.now(),
            issueId: issue.id,
            ...data
        }));
        localStorage.removeItem(eventType);
    };

    const assignIssue = async (userId: string) => {
        if (!isCreator) {
            toast.error('Only the issue creator can assign this issue', {
                icon: '🔒',
                duration: 5000,
            });
            return;
        }

        try {
            setIsAssigning(true);
            const assignedUserId = userId === "unassigned" ? null : userId;

            const selectedUser = users?.find(user => user.id === assignedUserId) || null;
            setLocalAssignee(selectedUser);

            await axios.patch(`/api/issues/${issue.id}`, {
                assignedToUserId: assignedUserId,
            });

            broadcastUpdate('assignee-changed', {
                issueId: issue.id,
                newAssignee: selectedUser,
                assignedUserId
            });

            queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
            queryClient.invalidateQueries({ queryKey: ['issue-stats'] });

            const successMessage = assignedUserId
                ? `Issue assigned to ${selectedUser?.name || selectedUser?.email || 'user'}`
                : 'Issue unassigned';

            toast.success(successMessage, {
                icon: '👤',
                duration: 3000,
            });

            setIsOpen(false);
            setTimeout(() => router.refresh(), 1000);

        } catch (error) {
            console.error('❌ Assignment failed:', error);
            setLocalAssignee(issue.assignedToUser);

            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data;

                if (error.response?.status === 403) {
                    const message = errorResponse?.details?.reason || 'Permission denied';
                    toast.error(`Cannot assign: ${message}`, { icon: '🔒', duration: 5000 });
                } else {
                    const errorMessage = errorResponse?.error || 'Failed to assign issue';
                    toast.error(errorMessage, { icon: '❌', duration: 5000 });
                }
            } else {
                toast.error('An unexpected error occurred', { icon: '💥' });
            }
        } finally {
            setIsAssigning(false);
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton height="60px" className="w-full" />
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    <FiLoader className="w-3 h-3 animate-spin" />
                    Loading team members...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <FiRefreshCw className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm font-medium text-red-800">Failed to load team members</p>
                </div>
                <button
                    onClick={() => refetchUsers()}
                    className="text-xs text-red-700 hover:text-red-800 underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    const currentAssignee = localAssignee;

    return (
        <>
            <div className="space-y-3">
                {/* 🎨 IMPROVED: Better container design */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => isCreator ? setIsOpen(!isOpen) : null}
                        disabled={isAssigning || !isCreator}
                        className={`w-full flex items-center gap-4 p-4 bg-white border-2 rounded-xl transition-all duration-200 ${isCreator
                            ? 'border-gray-200 hover:border-violet-300 hover:shadow-md cursor-pointer group'
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            } ${isAssigning ? 'opacity-50' : ''}`}
                    >
                        {/* Avatar Section */}
                        <div className="flex-shrink-0">
                            {isAssigning ? (
                                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                                    <FiLoader className="w-6 h-6 text-violet-600 animate-spin" />
                                </div>
                            ) : currentAssignee ? (
                                <UserAvatar user={currentAssignee} size={48} showStatus={true} />
                            ) : (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-dashed transition-colors ${isCreator
                                    ? 'border-gray-300 bg-gray-50 group-hover:border-violet-300 group-hover:bg-violet-50'
                                    : 'border-gray-200 bg-gray-100'
                                    }`}>
                                    <FiUser className={`w-6 h-6 transition-colors ${isCreator ? 'text-gray-400 group-hover:text-violet-600' : 'text-gray-400'
                                        }`} />
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 text-left">
                            {isAssigning ? (
                                <>
                                    <p className="font-medium text-violet-700">Updating assignment...</p>
                                    <p className="text-sm text-violet-600">Please wait</p>
                                </>
                            ) : currentAssignee ? (
                                <>
                                    <p className="font-medium text-gray-900">{currentAssignee.name || 'Unknown User'}</p>
                                    <p className="text-sm text-gray-500">{currentAssignee.email}</p>
                                </>
                            ) : (
                                <>
                                    <p className={`font-medium transition-colors ${isCreator ? 'text-gray-600 group-hover:text-violet-700' : 'text-gray-400'
                                        }`}>
                                        Unassigned
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {isCreator ? 'Click to assign someone' : 'Only creator can assign'}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Arrow/Lock Section */}
                        <div className="flex-shrink-0">
                            {!isAssigning && (
                                <>
                                    {!isCreator ? (
                                        <FiLock className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <FiChevronDown className={`w-5 h-5 text-gray-400 transition-all duration-200 group-hover:text-violet-600 ${isOpen ? 'rotate-180' : ''
                                            }`} />
                                    )}
                                </>
                            )}
                        </div>
                    </button>

                    {/* 🎨 IMPROVED: Better dropdown design with proper scrolling */}
                    {isOpen && !isAssigning && isCreator && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden">

                            {/* Header */}
                            <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-violet-900">Assign to Team Member</p>
                                        <p className="text-xs text-violet-700 mt-1">{users?.length || 0} members available</p>
                                    </div>
                                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                                        <FiUser className="w-4 h-4 text-violet-600" />
                                    </div>
                                </div>
                            </div>

                            {/* 🔧 FIXED: Proper scrollable content */}
                            <div className="max-h-80 overflow-y-auto">
                                {!users || users.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FiUser className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-700">No team members found</p>
                                        <p className="text-sm text-gray-500 mt-1">Users will appear here after they log in</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Unassigned Option */}
                                        <div
                                            onClick={() => assignIssue("unassigned")}
                                            className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-gray-50 ${!currentAssignee ? 'bg-violet-50 border-l-4 border-violet-500' : ''
                                                }`}
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <FiUser className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">Remove Assignment</p>
                                                <p className="text-sm text-gray-500">Make this issue unassigned</p>
                                            </div>
                                            {!currentAssignee && (
                                                <FiUserCheck className="w-5 h-5 text-violet-600" />
                                            )}
                                        </div>

                                        {/* Users List */}
                                        {users.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => assignIssue(user.id)}
                                                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-gray-50 ${currentAssignee?.id === user.id ? 'bg-violet-50 border-l-4 border-violet-500' : ''
                                                    }`}
                                            >
                                                <UserAvatar user={user} size={40} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{user.name || 'Unknown User'}</p>
                                                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                                </div>
                                                {currentAssignee?.id === user.id && (
                                                    <div className="flex items-center gap-2 text-violet-600">
                                                        <FiUserCheck className="w-5 h-5" />
                                                        <span className="text-sm font-medium">Assigned</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    Only assigned users can change issue status
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Messages */}
                {currentAssignee && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-700">
                            Assigned to <strong>{currentAssignee.name || currentAssignee.email}</strong>
                        </span>
                    </div>
                )}

                {!isCreator && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <FiLock className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700">Only the issue creator can assign this issue</span>
                    </div>
                )}

                {!currentAssignee && isCreator && (
                    <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">!</span>
                        </div>
                        <span className="text-sm text-amber-700">Issue is unassigned - assign to enable status changes</span>
                    </div>
                )}
            </div>
            <Toaster position="top-right" />
        </>
    )
}

// Enhanced useUsers hook
const useUsers = () => useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
        const response = await axios.get('/api/users');
        return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    throwOnError: false,
})

export default AssigneeSelect