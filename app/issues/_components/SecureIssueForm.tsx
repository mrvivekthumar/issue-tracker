// app/issues/_components/SecureIssueForm.tsx - UI with Role-Based Access Control
"use client";
import ErrorMessage from '@/app/components/ErrorMessage';
import { IssueSchema } from '@/app/validationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Issue, Status } from '@prisma/client';
import axios from 'axios';
import "easymde/dist/easymde.min.css";
import { useRouter } from 'next/navigation';
import { useState, useCallback, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import SimpleMDE from "react-simplemde-editor";
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import { FiSave, FiX, FiRefreshCw, FiCheck, FiAlertCircle, FiLock, FiInfo } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

type IssueFormData = z.infer<typeof IssueSchema>

interface IssueFormProps {
    issue?: Issue & {
        assignedToUser?: {
            id: string;
            name: string | null;
            email: string | null;
            image: string | null;
        } | null;
    };
}

const SecureIssueForm = ({ issue }: IssueFormProps) => {
    const { data: session } = useSession();
    const router = useRouter();

    // 🔐 SECURITY: Check user permissions
    const userPermissions = useMemo(() => {
        if (!session?.user?.email) {
            return {
                canEdit: false,
                canChangeStatus: false,
                canDelete: false,
                reason: 'Not authenticated'
            };
        }

        const currentUserEmail = session.user.email;
        const assignedUserEmail = issue?.assignedToUser?.email;
        const isAssignedUser = currentUserEmail === assignedUserEmail;
        const isUnassigned = !assignedUserEmail;

        return {
            canEdit: isAssignedUser || isUnassigned || !issue, // New issues or assigned/unassigned
            canChangeStatus: isAssignedUser && !!assignedUserEmail, // Only assigned user
            canDelete: (isAssignedUser || isUnassigned) && issue?.status !== 'IN_PROGRESS',
            isAssignedUser,
            isUnassigned,
            assignedUserEmail,
            currentUserEmail,
            reason: !isAssignedUser && assignedUserEmail ?
                `Only ${assignedUserEmail} can modify this issue` :
                undefined
        };
    }, [session, issue]);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        reset,
        watch
    } = useForm<IssueFormData>({
        resolver: zodResolver(IssueSchema),
        defaultValues: {
            title: issue?.title || '',
            description: issue?.description || ''
        },
        mode: 'onChange'
    });

    const [isSubmitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [statusChangeAttempt, setStatusChangeAttempt] = useState<Status | null>(null);

    // Watch for form changes
    const titleValue = watch('title');
    const descriptionValue = watch('description');

    const completionPercentage = useMemo(() => {
        const fields = ['title', 'description'] as const;
        const filledFields = fields.filter(field => {
            const value = field === 'title' ? titleValue : descriptionValue;
            return value?.toString().trim();
        });
        return (filledFields.length / fields.length) * 100;
    }, [titleValue, descriptionValue]);

    const onSubmit = useCallback(async (data: IssueFormData) => {
        try {
            setSubmitting(true);
            setError('');

            // 🔐 CLIENT-SIDE: Basic permission check (server will validate too)
            if (issue && !userPermissions.canEdit) {
                throw new Error(userPermissions.reason || 'Insufficient permissions');
            }

            if (issue) {
                await axios.patch(`/api/issues/${issue.id}`, data);
                toast.success('Issue updated successfully!', {
                    icon: '✅',
                    style: {
                        borderRadius: '10px',
                        background: '#10B981',
                        color: '#fff',
                    },
                });
            } else {
                await axios.post("/api/issues", data);
                toast.success('Issue created successfully!', {
                    icon: '🎉',
                    style: {
                        borderRadius: '10px',
                        background: '#10B981',
                        color: '#fff',
                    },
                });
            }

            setShowSuccess(true);
            setTimeout(() => {
                router.push("/issues/list");
                router.refresh();
            }, 1500);

        } catch (error) {
            setSubmitting(false);
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data;

                if (error.response?.status === 403) {
                    // Permission denied
                    const message = errorResponse?.details?.reason || errorResponse?.error || 'Access denied';
                    setError(`Permission denied: ${message}`);
                    toast.error(`Permission denied: ${message}`, {
                        icon: '🔒',
                        style: {
                            borderRadius: '10px',
                            background: '#EF4444',
                            color: '#fff',
                        },
                        duration: 5000
                    });
                } else {
                    const errorMsg = errorResponse?.error || 'An error occurred';
                    setError(errorMsg);
                    toast.error(errorMsg, {
                        icon: '❌',
                        style: {
                            borderRadius: '10px',
                            background: '#EF4444',
                            color: '#fff',
                        },
                    });
                }
            } else {
                const errorMsg = 'An unexpected error occurred';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        }
    }, [issue, router, userPermissions]);

    const handleStatusChange = useCallback(async (newStatus: Status) => {
        if (!userPermissions.canChangeStatus) {
            setStatusChangeAttempt(newStatus);
            return;
        }

        try {
            setSubmitting(true);
            await axios.patch(`/api/issues/${issue!.id}`, { status: newStatus });
            toast.success(`Status changed to ${newStatus}`, {
                icon: '🔄',
                style: {
                    borderRadius: '10px',
                    background: '#10B981',
                    color: '#fff',
                },
            });
            router.refresh();
        } catch (error) {
            setSubmitting(false);
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                const message = error.response.data?.details?.reason || 'Permission denied';
                toast.error(`Cannot change status: ${message}`, {
                    icon: '🔒',
                    style: {
                        borderRadius: '10px',
                        background: '#EF4444',
                        color: '#fff',
                    },
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
        }
    }, [issue, userPermissions.canChangeStatus, router]);

    const handleReset = useCallback(() => {
        reset();
        setError('');
        toast.success('Form reset successfully');
    }, [reset]);

    const handleCancel = useCallback(() => {
        if (isDirty) {
            const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
            if (!confirmLeave) return;
        }
        router.back();
    }, [isDirty, router]);

    if (showSuccess) {
        return (
            <div className="min-h-[400px] flex items-center justify-center animate-fade-in">
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 text-center max-w-md mx-4">
                    <div className="animate-bounce mb-4">
                        <FiCheck className="w-16 h-16 text-green-500 mx-auto" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {issue ? 'Issue Updated!' : 'Issue Created!'}
                    </h2>
                    <p className="text-gray-600">
                        Redirecting to issues list...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 animate-fade-in">
            <Toaster position="top-right" />

            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {issue ? 'Edit Issue' : 'Create New Issue'}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {issue ? 'Update the issue details below.' : 'Fill in the details to create a new issue.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700">
                            {Math.round(completionPercentage)}% Complete
                        </span>
                    </div>
                </div>

                {/* 🔐 SECURITY: Permission status display */}
                {issue && (
                    <div className="mb-6">
                        {userPermissions.canEdit ? (
                            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                                <FiCheck className="w-4 h-4" />
                                <span>You have permission to edit this issue</span>
                                {userPermissions.isAssignedUser && (
                                    <span className="text-xs bg-green-200 px-2 py-1 rounded-full">Assigned to you</span>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">
                                <FiLock className="w-4 h-4" />
                                <span>{userPermissions.reason}</span>
                                {userPermissions.assignedUserEmail && (
                                    <span className="text-xs bg-red-200 px-2 py-1 rounded-full">
                                        Assigned to: {userPermissions.assignedUserEmail}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>
            </div>

            {/* 🔐 SECURITY: Status change section for existing issues */}
            {issue && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Status</h3>

                    <div className="flex flex-wrap gap-3">
                        {(['OPEN', 'IN_PROGRESS', 'CLOSED'] as Status[]).map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                disabled={!userPermissions.canChangeStatus || isSubmitting}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${issue.status === status
                                    ? 'bg-violet-600 text-white'
                                    : userPermissions.canChangeStatus
                                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                                {!userPermissions.canChangeStatus && (
                                    <FiLock className="w-3 h-3 ml-1 inline" />
                                )}
                            </button>
                        ))}
                    </div>

                    {!userPermissions.canChangeStatus && (
                        <div className="mt-3 flex items-start gap-2 text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
                            <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Status change restricted</p>
                                <p>Only the assigned user can change the issue status.</p>
                                {userPermissions.isUnassigned && (
                                    <p className="mt-1">Assign this issue to someone first.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
                {error && (
                    <div className="mb-6 animate-slide-up">
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                    {/* Title Field */}
                    <div className="space-y-3 animate-slide-left" style={{ animationDelay: '0.1s' }}>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                            Issue Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            {...register('title')}
                            disabled={issue && !userPermissions.canEdit}
                            placeholder="Enter a clear, descriptive title..."
                            className={`w-full px-4 py-3 text-lg border-2 rounded-lg transition-all duration-200 focus:outline-none ${issue && !userPermissions.canEdit
                                ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                                : errors.title
                                    ? 'border-red-300 focus:border-red-500 bg-red-50'
                                    : 'border-gray-300 focus:border-violet-500 focus:bg-white'
                                } placeholder-gray-400`}
                        />
                        {errors.title && (
                            <div className="animate-slide-up">
                                <ErrorMessage>{errors.title?.message}</ErrorMessage>
                            </div>
                        )}
                        {issue && !userPermissions.canEdit && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FiLock className="w-3 h-3" />
                                <span>Field is locked - only assigned user can edit</span>
                            </div>
                        )}
                    </div>

                    {/* Description Field */}
                    <div className="space-y-3 animate-slide-left" style={{ animationDelay: '0.2s' }}>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <div className={`border-2 rounded-lg transition-all duration-200 ${issue && !userPermissions.canEdit
                            ? 'bg-gray-50 border-gray-200'
                            : errors.description
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 focus-within:border-violet-500'
                            }`}>
                            <Controller
                                control={control}
                                name="description"
                                render={({ field }) => (
                                    <SimpleMDE
                                        {...field}
                                        placeholder="Describe the issue in detail. Include steps to reproduce, expected behavior, and any relevant context..."
                                        options={{
                                            minHeight: '250px',
                                            maxHeight: '500px',
                                            toolbar: issue && !userPermissions.canEdit ? false : [
                                                'bold', 'italic', 'heading', 'strikethrough', '|',
                                                'quote', 'unordered-list', 'ordered-list', '|',
                                                'link', 'image', 'table', '|',
                                                'preview', 'side-by-side', 'fullscreen', '|',
                                                'guide'
                                            ],
                                            status: issue && !userPermissions.canEdit ? false : ['lines', 'words', 'cursor'],
                                            spellChecker: false,
                                            styleSelectedText: false,
                                            autofocus: false,
                                            placeholder: issue && !userPermissions.canEdit ?
                                                "This field is read-only - only the assigned user can edit" :
                                                "Describe the issue in detail...",
                                            autosave: {
                                                enabled: false,
                                                uniqueId: issue ? `issue-${issue.id}` : 'new-issue'
                                            }
                                        }}
                                    />
                                )}
                            />
                        </div>
                        {errors.description && (
                            <div className="animate-slide-up">
                                <ErrorMessage>{errors.description?.message}</ErrorMessage>
                            </div>
                        )}
                        {issue && !userPermissions.canEdit && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FiLock className="w-3 h-3" />
                                <span>Field is locked - only assigned user can edit</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        {/* 🔐 SECURITY: Only show submit button if user has permissions */}
                        {(!issue || userPermissions.canEdit) ? (
                            <button
                                type="submit"
                                disabled={isSubmitting || !isValid}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FiRefreshCw className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="w-5 h-5" />
                                        {issue ? 'Update Issue' : 'Create Issue'}
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-gray-500 font-semibold py-3 px-6 rounded-lg cursor-not-allowed">
                                <FiLock className="w-5 h-5" />
                                <span>Update Restricted</span>
                            </div>
                        )}

                        {(!issue || userPermissions.canEdit) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={isSubmitting || !isDirty}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 font-semibold rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FiRefreshCw className="w-4 h-4" />
                                    Reset
                                </div>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100 hover:bg-gray-50"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FiX className="w-4 h-4" />
                                {issue && !userPermissions.canEdit ? 'Close' : 'Cancel'}
                            </div>
                        </button>
                    </div>

                    {/* 🔐 SECURITY: Permission explanation */}
                    {issue && !userPermissions.canEdit && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Why can't I edit this issue?</h4>
                            <div className="text-sm text-blue-800 space-y-2">
                                <p>This issue tracking system uses role-based security:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><strong>Only assigned users</strong> can edit issue content and change status</li>
                                    <li><strong>Unassigned issues</strong> can be edited by anyone</li>
                                    <li><strong>Status changes</strong> are restricted to the assigned user only</li>
                                </ul>
                                {userPermissions.assignedUserEmail && (
                                    <p className="mt-3 font-medium">
                                        This issue is assigned to: <code className="bg-blue-100 px-2 py-1 rounded text-blue-900">{userPermissions.assignedUserEmail}</code>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* 🔐 SECURITY: Status change permission modal */}
            {statusChangeAttempt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                        onClick={() => setStatusChangeAttempt(null)}
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
                            <p className="text-gray-600 mb-4">
                                You cannot change the status to <strong>{statusChangeAttempt}</strong> because you are not assigned to this issue.
                            </p>
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-700">
                                    <strong>Current assignment:</strong> {userPermissions.assignedUserEmail || 'Unassigned'}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Your email:</strong> {userPermissions.currentUserEmail}
                                </p>
                            </div>
                            <button
                                onClick={() => setStatusChangeAttempt(null)}
                                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecureIssueForm;