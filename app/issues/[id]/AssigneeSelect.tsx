'use client';
import { Skeleton } from "@/app/components";
import { Issue, User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";
import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiUser, FiUserCheck } from 'react-icons/fi';
import Image from "next/image";

const AssigneeSelect = ({ issue }: { issue: Issue }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { data: users, error, isLoading } = useUsers();

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

    if (isLoading) {
        return <Skeleton height="40px" className="w-full" />
    }

    if (error) {
        return (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">Failed to load users</p>
            </div>
        );
    }

    const assignIssue = async (userId: string) => {
        try {
            await axios.patch(`/api/issues/${issue.id}`, {
                assignedToUserId: userId === "unassigned" ? null : userId,
            });
            toast.success("Changes saved successfully", {
                style: {
                    borderRadius: '8px',
                    background: '#10B981',
                    color: '#fff',
                },
            });
            setIsOpen(false);
        } catch (error) {
            toast.error("Changes could not be saved", {
                style: {
                    borderRadius: '8px',
                    background: '#EF4444',
                    color: '#fff',
                },
            });
        }
    }

    const currentAssignee = users?.find(user => user.id === issue.assignedToUserId);
    const displayText = currentAssignee ? currentAssignee.name : 'Unassigned';

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                {/* Trigger Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    <div className="flex items-center gap-3">
                        {currentAssignee ? (
                            <>
                                <Image
                                    src={currentAssignee?.image || "/api/placeholder/32/32"}
                                    alt={currentAssignee?.name || "Assigned user"}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                                    title={`Assigned to ${currentAssignee?.name}`}
                                    unoptimized={!currentAssignee?.image}
                                />
                                <span className="text-gray-900 font-medium">{displayText}</span>
                            </>
                        ) : (
                            <>
                                <FiUser className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-500">{displayText}</span>
                            </>
                        )}
                    </div>
                    <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-slide-up max-h-64 overflow-y-auto">
                        <div className="py-1">
                            {/* Header */}
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Assign to
                                </p>
                            </div>

                            {/* Unassigned Option */}
                            <button
                                onClick={() => assignIssue("unassigned")}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 hover:bg-gray-50 ${!issue.assignedToUserId ? 'bg-violet-50 text-violet-700' : 'text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <FiUser className="w-5 h-5 text-gray-400" />
                                    <span>Unassigned</span>
                                    {!issue.assignedToUserId && (
                                        <FiUserCheck className="w-4 h-4 text-violet-600 ml-auto" />
                                    )}
                                </div>
                            </button>

                            {/* Users List */}
                            {users?.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => assignIssue(user.id)}
                                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 hover:bg-gray-50 ${issue.assignedToUserId === user.id ? 'bg-violet-50 text-violet-700' : 'text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={currentAssignee?.image || "/api/placeholder/32/32"}
                                            alt={currentAssignee?.name || "User"}
                                            width={24}
                                            height={24}
                                            className="w-6 h-6 rounded-full border border-gray-200"
                                            unoptimized={!currentAssignee?.image} // Don't optimize placeholder
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        {issue.assignedToUserId === user.id && (
                                            <FiUserCheck className="w-4 h-4 text-violet-600" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Toaster position="top-right" />
        </>
    )
}

const useUsers = () => useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => axios.get('/api/users').then(res => res.data),
    staleTime: 60 * 1000,
    retry: 3
})

export default AssigneeSelect