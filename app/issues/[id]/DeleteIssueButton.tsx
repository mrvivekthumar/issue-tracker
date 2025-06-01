'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { FiTrash2, FiLoader, FiX, FiAlertTriangle } from 'react-icons/fi';

const DeleteIssueButton = ({ issueId }: { issueId: number }) => {
    const router = useRouter();
    const [error, setError] = useState(false);
    const [isDeleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const deleteIssue = async () => {
        try {
            setDeleting(true);
            await axios.delete('/api/issues/' + issueId)
            router.push('/issues/list')
            router.refresh();
        } catch (error) {
            setDeleting(false);
            setError(true)
        }
    }

    return (
        <>
            {/* Delete Button */}
            <button
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-md hover:shadow-lg disabled:shadow-sm"
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
                                <div className="p-2 bg-red-100 rounded-full">
                                    <FiAlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Confirm Deletion
                                </h3>
                            </div>

                            {/* Content */}
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this issue? This action cannot be undone.
                            </p>

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
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
                                >
                                    Delete Issue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {error && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                        onClick={() => setError(false)}
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
                                    Error
                                </h3>
                            </div>

                            {/* Content */}
                            <p className="text-gray-600 mb-6">
                                This issue cannot be deleted. Please try again later.
                            </p>

                            {/* Action */}
                            <button
                                onClick={() => setError(false)}
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