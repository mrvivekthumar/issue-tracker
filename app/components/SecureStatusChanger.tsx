// app/components/SecureStatusChanger.tsx - Reusable status change component
'use client';

import { Status } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useState, useMemo } from 'react';
import { FiLock, FiCheck, FiClock, FiX, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

interface SecureStatusChangerProps {
    issueId: number;
    currentStatus: Status;
    assignedUserEmail?: string | null;
    onStatusChange?: (newStatus: Status) => void;
    className?: string;
    showTooltip?: boolean;
}

const STATUS_CONFIG = {
    OPEN: {
        label: 'Open',
        icon: FiAlertCircle,
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        description: 'Issue needs attention'
    },
    IN_PROGRESS: {
        label: 'In Progress',
        icon: FiClock,
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
        description: 'Currently being worked on'
    },
    CLOSED: {
        label: 'Closed',
        icon: FiCheck,
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        description: 'Issue resolved'
    }
} as const;

const SecureStatusChanger = ({
    issueId,
    currentStatus,
    assignedUserEmail,
    onStatusChange,
    className = '',
    showTooltip = true
}: SecureStatusChangerProps) => {
    const { data: session } = useSession();
    const [isChanging, setIsChanging] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [attemptedStatus, setAttemptedStatus] = useState<Status | null>(null);

    // 🔐 SECURITY: Calculate permissions
    const permissions = useMemo(() => {
        if (!session?.user?.email) {
            return {
                canChangeStatus: false,
                reason: 'Not authenticated',
                isAuthenticated: false
            };
        }

        const currentUserEmail = session.user.email;
        const isAssignedUser = currentUserEmail === assignedUserEmail;
        const isUnassigned = !assignedUserEmail;

        if (isUnassigned) {
            return {
                canChangeStatus: false,
                reason: 'Issue must be assigned before status can be changed',
                isAuthenticated: true,
                isUnassigned: true
            };
        }

        if (!isAssignedUser) {
            return {
                canChangeStatus: false,
                reason: `Only ${assignedUserEmail} can change the status`,
                isAuthenticated: true,
                assignedUser: assignedUserEmail,
                currentUser: currentUserEmail
            };
        }

        return {
            canChangeStatus: true,
            reason: 'You are assigned to this issue',
            isAuthenticated: true,
            isAssignedUser: true
        };
    }, [session, assignedUserEmail]);

    const handleStatusClick = async (newStatus: Status) => {
        if (newStatus === currentStatus) return; // No change needed

        if (!permissions.canChangeStatus) {
            setAttemptedStatus(newStatus);
            setShowPermissionModal(true);
            return;
        }

        try {
            setIsChanging(true);

            const response = await axios.patch(`/api/issues/${issueId}`, {
                status: newStatus
            });

            toast.success(`Status changed to ${STATUS_CONFIG[newStatus].label}`, {
                icon: '🔄',
                style: {
                    borderRadius: '10px',
                    background: '#10B981',
                    color: '#fff',
                },
            });

            // Call the callback if provided
            onStatusChange?.(newStatus);

        } catch (error) {
            console.error('Status change error:', error);

            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data;

                if (error.response?.status === 403) {
                    const message = errorResponse?.details?.reason || 'Permission denied';
                    toast.error(`Cannot change status: ${message}`, {
                        icon: '🔒',
                        style: {
                            borderRadius: '10px',
                            background: '#EF4444',
                            color: '#fff',
                        },
                        duration: 5000
                    });
                } else {
                    toast.error('Failed to change status', {
                        icon: '❌',
                        style: {
                            borderRadius: '10px',
                            background: '#EF4444',
                            color: '#fff',
                        },
                    });
                }
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
            setIsChanging(false);
        }
    };

    return (
        <div className={className}>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Status</h4>
                    {!permissions.canChangeStatus && showTooltip && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FiLock className="w-3 h-3" />
                            <span>Restricted</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(STATUS_CONFIG) as Status[]).map((status) => {
                        const config = STATUS_CONFIG[status];
                        const isCurrentStatus = currentStatus === status;
                        const canClick = permissions.canChangeStatus && !isChanging;
                        const IconComponent = config.icon;

                        return (
                            <button
                                key={status}
                                onClick={() => handleStatusClick(status)}
                                disabled={!canClick || isCurrentStatus}
                                className={`
                                    w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200
                                    ${isCurrentStatus
                                        ? `${config.bgColor} ${config.borderColor} ${config.textColor} ring-2 ring-offset-1 ring-${config.color}-300`
                                        : canClick
                                            ? `border-gray-200 hover:${config.bgColor} hover:${config.borderColor} hover:${config.textColor} hover:scale-105`
                                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                    }
                                `}
                                title={
                                    isCurrentStatus
                                        ? 'Current status'
                                        : !permissions.canChangeStatus
                                            ? permissions.reason
                                            : `Change status to ${config.label}`
                                }
                            >
                                <div className={`p-2 rounded-full ${isCurrentStatus ? 'bg-white' : canClick ? 'bg-gray-100' : 'bg-gray-200'
                                    }`}>
                                    <IconComponent className={`w-4 h-4 ${isCurrentStatus ? config.textColor : canClick ? 'text-gray-600' : 'text-gray-400'
                                        }`} />
                                </div>

                                <div className="flex-1 text-left">
                                    <div className={`font-medium ${isCurrentStatus ? config.textColor : canClick ? 'text-gray-900' : 'text-gray-400'
                                        }`}>
                                        {config.label}
                                    </div>
                                    <div className={`text-xs ${isCurrentStatus ? config.textColor.replace('700', '600') : 'text-gray-500'
                                        }`}>
                                        {config.description}
                                    </div>
                                </div>

                                {isCurrentStatus && (
                                    <div className={`px-2 py-1 text-xs font-medium rounded-full bg-white ${config.textColor}`}>
                                        Current
                                    </div>
                                )}

                                {!permissions.canChangeStatus && !isCurrentStatus && (
                                    <FiLock className="w-4 h-4 text-gray-400" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* 🔐 SECURITY: Permission explanation */}
                {!permissions.canChangeStatus && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <FiLock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="font-medium text-orange-800">Status changes restricted</p>
                                <p className="text-orange-700 mt-1">{permissions.reason}</p>

                                {permissions.isUnassigned && (
                                    <p className="text-orange-600 mt-2 text-xs">
                                        💡 <strong>Tip:</strong> Assign this issue to someone first to enable status changes.
                                    </p>
                                )}

                                {permissions.assignedUser && (
                                    <div className="mt-2 text-xs">
                                        <p className="text-orange-600">
                                            <strong>Assigned to:</strong> <code className="bg-orange-100 px-1 rounded">{permissions.assignedUser}</code>
                                        </p>
                                        <p className="text-orange-600">
                                            <strong>Your email:</strong> <code className="bg-orange-100 px-1 rounded">{permissions.currentUser}</code>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 🔐 SECURITY: Permission denial modal */}
            {showPermissionModal && attemptedStatus && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                        onClick={() => setShowPermissionModal(false)}
                    />
                    <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-slide-up">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <FiLock className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Permission Required
                                </h3>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-600 mb-3">
                                    You cannot change the status to <strong>{STATUS_CONFIG[attemptedStatus].label}</strong>.
                                </p>

                                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reason:</span>
                                        <span className="text-gray-900 font-medium">{permissions.reason}</span>
                                    </div>

                                    {permissions.assignedUser && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Assigned to:</span>
                                                <span className="text-gray-900 font-mono text-xs">{permissions.assignedUser}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Your email:</span>
                                                <span className="text-gray-900 font-mono text-xs">{permissions.currentUser}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {permissions.isUnassigned && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            💡 <strong>Solution:</strong> Ask someone to assign this issue to you first, then you can change its status.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowPermissionModal(false)}
                                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
                            >
                                OK, I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecureStatusChanger;