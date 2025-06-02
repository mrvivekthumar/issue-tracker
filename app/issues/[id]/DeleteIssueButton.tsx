'use client';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { FiTrash2, FiLoader, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface DeleteIssueButtonProps {
    issueId: number;
    issueTitle?: string;
    issueStatus?: string;
}

const DeleteIssueButton = ({ issueId, issueTitle, issueStatus }: DeleteIssueButtonProps) => {
    const router = useRouter();
    const [error, setError] = useState<string>('');
    const [isDeleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const deleteIssue = async () => {
        try {
            setDeleting(true);
            setError('');

            console.log(`🗑️ Attempting to delete issue ${issueId}`); // Debug log

            const response = await axios.delete(`/api/issues/${issueId}`);

            console.log(`✅ Delete response:`, response.data); // Debug log

            // Show success message
            toast.success(response.data.message || 'Issue deleted successfully!', {
                icon: '🗑️',
                style: {
                    borderRadius: '10px',
                    background: '#10B981',
                    color: '#fff',
                },
                duration: 3000
            });

            // Redirect after successful deletion
            router.push('/issues/list');
            router.refresh();

        } catch (error) {
            console.error(`❌ Delete error:`, error); // Debug log
            setDeleting(false);

            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data;
                console.log(`📋 Error details:`, errorResponse); // Debug log

                if (error.response?.status === 400 && errorResponse?.details?.currentStatus) {
                    // Business rule violation (e.g., trying to delete IN_PROGRESS issue)
                    const errorMessage = errorResponse.error || 'Cannot delete this issue';
                    const currentStatus = errorResponse.details.currentStatus;
                    const allowedStatuses = errorResponse.details.allowedStatuses || [];

                    setError(`${errorMessage}\n\nCurrent status: ${currentStatus}\nAllowed statuses for deletion: ${allowedStatuses.join(', ')}`);

                    toast.error(errorMessage, {
                        icon: '⚠️',
                        style: {
                            borderRadius: '10px',
                            background: '#EF4444',
                            color: '#fff',
                        },
                        duration: 5000
                    });
                } else if (error.response?.status === 404) {
                    setError('Issue not found. It may have already been deleted.');
                    toast.error('Issue not found', {
                        icon: '🔍',
                        style: {
                            borderRadius: '10px',
                            background: '#EF4444',
                            color: '#fff',
                        }
                    });
                } else if (error.response?.status === 401) {
                    setError('You are not authorized to delete this issue.');
                    toast.error('Unauthorized', {
                        icon: '🔒',
                        style: {
                            borderRadius: '10px',
                            background: '#EF4444',
                            color: '#fff',
                        }
                    });
                } else {
                    const genericMessage = errorResponse?.error || 'Failed to delete issue';
                    setError(genericMessage);
                    toast.error(genericMessage, {
                        icon: '❌',
                        style: {
                            borderRadius: '10px',
                            background: '#EF4444',
                            color: '#fff',
                        }
                    });
                }
            } else {
                const unexpectedError = 'An unexpected error occurred';
                setError(unexpectedError);
                toast.error(unexpectedError, {
                    icon: '💥',
                    style: {
                        borderRadius: '10px',
                        background: '#EF4444',
                        color: '#fff',
                    }
                });
            }
        }
    }

    // Check if deletion might be blocked
    const isDeletionLikelyBlocked = issueStatus === 'IN_PROGRESS';
    const warningMessage = isDeletionLikelyBlocked ?
        'This issue is currently IN_PROGRESS and may not be deletable. Consider changing its status first.' : '';

    return (
        <>
            {/* Delete Button */}
            <button
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className={`inline-flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-md hover:shadow-lg disabled:shadow-sm ${isDeletionLikelyBlocked
                    ? 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300'
                    : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                    }`}
            >
                {isDeleting ? (
                    <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Deleting...
                    </>
                ) : (
                    <>
                        <FiTrash2 className="w-4 h-4" />
                        Delete Issue
                    </>
                )}
            </button>

            {/* Warning for likely blocked deletions */}
            {isDeletionLikelyBlocked && (
                <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <FiInfo className="w-3 h-3" />
                    Status: {issueStatus}
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                        onClick={() => setShowConfirm(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-slide-up">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-full ${isDeletionLikelyBlocked ? 'bg-orange-100' : 'bg-red-100'}`}>
                                    <FiAlertTriangle className={`w-5 h-5 ${isDeletionLikelyBlocked ? 'text-orange-600' : 'text-red-600'}`} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Confirm Deletion
                                </h3>
                            </div>

                            {/* Content */}
                            <div className="mb-6">
                                <p className="text-gray-600 mb-3">
                                    Are you sure you want to delete this issue?
                                </p>

                                {issueTitle && (
                                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            "{issueTitle}"
                                        </p>
                                        {issueStatus && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Status: {issueStatus}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {warningMessage && (
                                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-3">
                                        <div className="flex items-start gap-2">
                                            <FiInfo className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-orange-700">
                                                {warningMessage}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <p className="text-sm text-gray-500">
                                    This action cannot be undone.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowConfirm(false);
                                        deleteIssue();
                                    }}
                                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 font-medium ${isDeletionLikelyBlocked
                                        ? 'bg-orange-600 hover:bg-orange-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    Delete Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Error Modal */}
            {error && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                        onClick={() => setError('')}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-slide-up">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <FiX className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Deletion Failed
                                </h3>
                            </div>

                            {/* Content */}
                            <div className="mb-6">
                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                    <pre className="text-sm text-red-700 whitespace-pre-wrap font-medium">
                                        {error}
                                    </pre>
                                </div>

                                <div className="mt-4 text-sm text-gray-600">
                                    <p className="font-medium mb-2">Possible solutions:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Change the issue status to OPEN before deleting</li>
                                        <li>Check if you have permission to delete this issue</li>
                                        <li>Contact an administrator if the problem persists</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Action */}
                            <button
                                onClick={() => setError('')}
                                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default DeleteIssueButton