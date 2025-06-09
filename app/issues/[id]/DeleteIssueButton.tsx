// app/issues/[id]/DeleteIssueButton.tsx - Updated to match new design
'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { FiTrash2, FiLoader, FiX, FiAlertTriangle } from 'react-icons/fi';
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

            const response = await axios.delete(`/api/issues/${issueId}`);

            toast.success(response.data.message || 'Issue deleted successfully!', {
                icon: '🗑️',
                duration: 3000
            });

            router.push('/issues/list');
            router.refresh();

        } catch (error) {
            setDeleting(false);

            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data;

                if (error.response?.status === 403) {
                    const errorMessage = errorResponse?.details?.reason || errorResponse?.error || 'Permission denied';
                    setError(`Access denied: ${errorMessage}`);
                    toast.error(`Permission denied: ${errorMessage}`, {
                        icon: '🔒',
                        duration: 5000
                    });
                } else if (error.response?.status === 400) {
                    const errorMessage = errorResponse?.error || 'Cannot delete this issue';
                    setError(errorMessage);
                    toast.error(errorMessage, {
                        icon: '⚠️',
                        duration: 5000
                    });
                } else if (error.response?.status === 404) {
                    setError('Issue not found. It may have already been deleted.');
                    toast.error('Issue not found', { icon: '🔍' });
                } else {
                    const genericMessage = errorResponse?.error || 'Failed to delete issue';
                    setError(genericMessage);
                    toast.error(genericMessage, { icon: '❌' });
                }
            } else {
                const unexpectedError = 'An unexpected error occurred';
                setError(unexpectedError);
                toast.error(unexpectedError, { icon: '💥' });
            }
        }
    }

    const isDeletionRisky = issueStatus === 'IN_PROGRESS';

    return (
        <>
            {/* 🎨 UPDATED: Better delete button design */}
            <button
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-200 shadow-sm ${isDeletionRisky
                    ? 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300'
                    : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                    } disabled:cursor-not-allowed`}
            >
                {isDeleting ? (
                    <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Deleting...
                    </>
                ) : (
                    <>
                        <FiTrash2 className="w-4 h-4" />
                        Delete
                    </>
                )}
            </button>

            {/* 🎨 UPDATED: Better confirmation modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowConfirm(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${isDeletionRisky ? 'bg-orange-100' : 'bg-red-100'
                                    }`}>
                                    <FiAlertTriangle className={`w-6 h-6 ${isDeletionRisky ? 'text-orange-600' : 'text-red-600'
                                        }`} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Delete Issue
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        This action cannot be undone
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <p className="text-gray-700">
                                Are you sure you want to delete this issue?
                            </p>

                            {issueTitle && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-mono text-gray-600">#{issueId}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {issueTitle}
                                            </h4>
                                            {issueStatus && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500">Status:</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${issueStatus === 'OPEN' ? 'bg-red-100 text-red-700' :
                                                        issueStatus === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                        {issueStatus.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isDeletionRisky && (
                                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <FiAlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-orange-800">
                                            <p className="font-medium">Warning: Issue in Progress</p>
                                            <p className="mt-1">
                                                This issue is currently being worked on. Consider changing its status before deleting.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirm(false);
                                    deleteIssue();
                                }}
                                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${isDeletionRisky
                                    ? 'bg-orange-600 hover:bg-orange-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                Delete Issue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🎨 UPDATED: Better error modal */}
            {error && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setError('')}
                    />

                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <FiX className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Deletion Failed
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Unable to delete the issue
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800 font-medium">
                                    {error}
                                </p>
                            </div>

                            <div className="text-sm text-gray-600 space-y-2">
                                <p className="font-medium">Possible solutions:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>Check if you have permission to delete this issue</li>
                                    <li>Change the issue status before deleting</li>
                                    <li>Contact an administrator if the problem persists</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <button
                                onClick={() => setError('')}
                                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default DeleteIssueButton