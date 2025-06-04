// app/issues/[id]/AssigneeSelect.tsx - ENHANCED VERSION with event broadcasting
'use client';
import { Skeleton } from "@/app/components";
import { Issue, User } from '@prisma/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";
import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiUser, FiUserCheck, FiLoader, FiRefreshCw } from 'react-icons/fi';
import Image from "next/image";
import { useRouter } from 'next/navigation';

interface IssueWithUser extends Issue {
    assignedToUser?: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
}

const AssigneeSelect = ({ issue }: { issue: IssueWithUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [localAssignee, setLocalAssignee] = useState(issue.assignedToUser);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: users, error, isLoading, refetch: refetchUsers } = useUsers();

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

    // ✅ HELPER: Broadcast events for real-time updates
    const broadcastUpdate = (eventType: string, data?: any) => {
        // Custom event for same-tab updates
        window.dispatchEvent(new CustomEvent(eventType, { detail: data }));

        // Storage event for cross-tab updates
        localStorage.setItem(eventType, JSON.stringify({
            timestamp: Date.now(),
            issueId: issue.id,
            ...data
        }));
        localStorage.removeItem(eventType); // Trigger storage event
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton height="48px" className="w-full" />
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    <FiLoader className="w-3 h-3 animate-spin" />
                    Loading team members...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-red-800">Failed to load team members</p>
                </div>
                <button
                    onClick={() => refetchUsers()}
                    className="text-xs text-red-700 hover:text-red-800 underline flex items-center gap-1"
                >
                    <FiRefreshCw className="w-3 h-3" />
                    Try again
                </button>
            </div>
        );
    }

    const assignIssue = async (userId: string) => {
        try {
            setIsAssigning(true);
            const assignedUserId = userId === "unassigned" ? null : userId;

            console.log('🔄 Assigning issue to:', assignedUserId);

            // Optimistic update - update UI immediately
            const selectedUser = users?.find(user => user.id === assignedUserId) || null;
            setLocalAssignee(selectedUser);

            // Make API call
            const response = await axios.patch(`/api/issues/${issue.id}`, {
                assignedToUserId: assignedUserId,
            });

            console.log('✅ Assignment successful:', response.data);

            // ✅ BROADCAST: Notify other components about the change
            broadcastUpdate('assignee-changed', {
                issueId: issue.id,
                newAssignee: selectedUser,
                assignedUserId
            });

            // Update React Query cache
            queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
            queryClient.invalidateQueries({ queryKey: ['issue-stats'] });

            // Show success toast with user info
            const successMessage = assignedUserId
                ? `Issue assigned to ${selectedUser?.name || selectedUser?.email || 'user'}`
                : 'Issue unassigned';

            toast.success(successMessage, {
                icon: '👤',
                style: {
                    borderRadius: '10px',
                    background: '#10B981',
                    color: '#fff',
                },
                duration: 3000,
            });

            setIsOpen(false);

            // ✅ FIX: Force refresh the page data after successful assignment
            setTimeout(() => {
                router.refresh();
            }, 1000);

        } catch (error) {
            console.error('❌ Assignment failed:', error);

            // Revert optimistic update on error
            setLocalAssignee(issue.assignedToUser);

            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.error || 'Failed to assign issue';
                toast.error(errorMessage, {
                    icon: '❌',
                    style: {
                        borderRadius: '10px',
                        background: '#EF4444',
                        color: '#fff',
                    },
                    duration: 5000,
                });
            } else {
                toast.error('An unexpected error occurred', {
                    icon: '💥',
                    style: {
                        borderRadius: '10px',
                        background: '#EF4444',
                        color: '#fff',
                    },
                });
            }
        } finally {
            setIsAssigning(false);
        }
    }

    // Use local assignee state for display
    const currentAssignee = localAssignee;
    const displayText = currentAssignee?.name || currentAssignee?.email || 'Unassigned';

    return (
        <>
            <div className="space-y-2">
                <div className="relative" ref={dropdownRef}>
                    {/* ✅ IMPROVED: Better trigger button design */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        disabled={isAssigning}
                        className={`w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 shadow-sm hover:shadow-md group ${isAssigning ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {isAssigning ? (
                                <>
                                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FiLoader className="w-4 h-4 text-violet-600 animate-spin" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-violet-700 font-medium text-sm">Updating assignment...</p>
                                        <p className="text-violet-600 text-xs">Please wait</p>
                                    </div>
                                </>
                            ) : currentAssignee ? (
                                <>
                                    <div className="relative flex-shrink-0">
                                        <Image
                                            src={currentAssignee.image || "/api/placeholder/32/32"}
                                            alt={currentAssignee.name || "Assigned user"}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                            title={`Assigned to ${currentAssignee.name || currentAssignee.email}`}
                                            unoptimized={!currentAssignee.image}
                                        />
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-gray-900 font-medium truncate text-sm">
                                            {currentAssignee.name || 'Unknown User'}
                                        </p>
                                        <p className="text-gray-500 text-xs truncate">
                                            {currentAssignee.email}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
                                        <FiUser className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-gray-500 font-medium text-sm group-hover:text-violet-600 transition-colors">Unassigned</p>
                                        <p className="text-gray-400 text-xs">Click to assign someone</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {!isAssigning && (
                            <FiChevronDown className={`w-4 h-4 text-gray-500 transition-all duration-200 flex-shrink-0 group-hover:text-violet-600 ${isOpen ? 'rotate-180' : ''}`} />
                        )}
                    </button>

                    {/* ✅ IMPROVED: Enhanced dropdown menu */}
                    {isOpen && !isAssigning && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-slide-up max-h-80 overflow-hidden">
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
                                <div className="flex items-center gap-2">
                                    <FiUser className="w-4 h-4 text-violet-600" />
                                    <p className="text-sm font-semibold text-violet-900">
                                        Assign to Team Member
                                    </p>
                                </div>
                                <p className="text-xs text-violet-700 mt-1">
                                    Select who should work on this issue
                                </p>
                            </div>

                            <div className="max-h-64 overflow-y-auto">
                                {/* Unassigned Option */}
                                <button
                                    onClick={() => assignIssue("unassigned")}
                                    className={`w-full text-left px-4 py-3 text-sm transition-all duration-150 hover:bg-gray-50 border-b border-gray-100 ${!currentAssignee ? 'bg-violet-50 text-violet-700 border-violet-200' : 'text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                            <FiUser className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">Remove Assignment</p>
                                            <p className="text-xs text-gray-500">Make this issue unassigned</p>
                                        </div>
                                        {!currentAssignee && (
                                            <FiUserCheck className="w-4 h-4 text-violet-600" />
                                        )}
                                    </div>
                                </button>

                                {/* Users List */}
                                {users?.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => assignIssue(user.id)}
                                        className={`w-full text-left px-4 py-3 text-sm transition-all duration-150 hover:bg-gray-50 ${currentAssignee?.id === user.id ? 'bg-violet-50 text-violet-700' : 'text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Image
                                                    src={user.image || "/api/placeholder/32/32"}
                                                    alt={user.name || "User"}
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                                                    unoptimized={!user.image}
                                                />
                                                {currentAssignee?.id === user.id && (
                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{user.name || 'Unknown User'}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            {currentAssignee?.id === user.id && (
                                                <FiUserCheck className="w-4 h-4 text-violet-600" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Only assigned users can change issue status
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ✅ NEW: Status indicator */}
                {currentAssignee && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Assigned to {currentAssignee.name || currentAssignee.email}</span>
                    </div>
                )}

                {/* ✅ NEW: Assignment help text */}
                {!currentAssignee && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span>Issue is unassigned - assign to enable status changes</span>
                    </div>
                )}
            </div>
            <Toaster position="top-right" />
        </>
    )
}

// Enhanced useUsers hook with better error handling
const useUsers = () => useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
        console.log('🔄 Fetching users...');
        const response = await axios.get('/api/users');
        console.log('✅ Users fetched:', response.data?.length || 0);
        return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: false,
})

export default AssigneeSelect