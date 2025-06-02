// 🚀 ALTERNATIVE: Even More Optimized Version
"use client";
import ErrorMessage from '@/app/components/ErrorMessage';
import { IssueSchema } from '@/app/validationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Issue } from '@prisma/client';
import axios from 'axios';
import "easymde/dist/easymde.min.css";
import { useRouter } from 'next/navigation';
import { useState, useCallback, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import SimpleMDE from "react-simplemde-editor";
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import { FiSave, FiX, FiRefreshCw, FiCheck, FiAlertCircle } from 'react-icons/fi';

type IssueFormData = z.infer<typeof IssueSchema>

interface IssueFormProps {
    issue?: Issue;
}

const IssueForm = ({ issue }: IssueFormProps) => {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isValid, isDirty },
        reset,
        getValues // 🔧 FIX: Use getValues instead of watch for progress calculation
    } = useForm<IssueFormData>({
        resolver: zodResolver(IssueSchema),
        defaultValues: {
            title: issue?.title || '',
            description: issue?.description || ''
        },
        mode: 'onChange'
    });

    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // 🔧 FIX: Use ref to track progress updates without causing re-renders
    const [progress, setProgress] = useState(0);
    const progressUpdateRef = useRef<NodeJS.Timeout>();

    // 🔧 FIX: Debounced progress calculation
    const updateProgress = useCallback(() => {
        if (progressUpdateRef.current) {
            clearTimeout(progressUpdateRef.current);
        }

        progressUpdateRef.current = setTimeout(() => {
            const values = getValues();
            const fields = ['title', 'description'] as const;
            const filledFields = fields.filter(field => values[field]?.toString().trim());
            setProgress((filledFields.length / fields.length) * 100);
        }, 300); // Debounce for 300ms
    }, [getValues]);

    // 🔧 FIX: Memoized SimpleMDE options to prevent re-initialization
    const simpleMDEOptions = useMemo(() => ({
        minHeight: '250px',
        maxHeight: '500px',
        toolbar: [
            'bold', 'italic', 'heading', 'strikethrough', '|',
            'quote', 'unordered-list', 'ordered-list', '|',
            'link', 'image', 'table', '|',
            'preview', 'side-by-side', 'fullscreen', '|',
            'guide'
        ],
        status: ['lines', 'words', 'cursor'],
        spellChecker: false,
        styleSelectedText: false,
        autofocus: false,
        placeholder: "Describe the issue in detail...",
        autosave: {
            enabled: false
        },
        // 🔧 FIX: Key options to prevent re-renders
        forceSync: true,
        hideIcons: [],
        shortcuts: {}
    }), []);

    const onSubmit = useCallback(async (data: IssueFormData) => {
        try {
            setSubmitting(true);
            setError('');

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
                const errorMsg = error.response?.data?.message || 'An error occurred';
                setError(errorMsg);
                toast.error(errorMsg, {
                    icon: '❌',
                    style: {
                        borderRadius: '10px',
                        background: '#EF4444',
                        color: '#fff',
                    },
                });
            } else {
                const errorMsg = 'An unexpected error occurred';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        }
    }, [issue, router]);

    const handleReset = useCallback(() => {
        reset();
        setError('');
        setProgress(0);
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
                            {Math.round(progress)}% Complete
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

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
                            {...register('title', {
                                onChange: updateProgress // 🔧 FIX: Only update progress on change
                            })}
                            placeholder="Enter a clear, descriptive title..."
                            className={`w-full px-4 py-3 text-lg border-2 rounded-lg transition-all duration-200 focus:outline-none ${errors.title
                                ? 'border-red-300 focus:border-red-500 bg-red-50'
                                : 'border-gray-300 focus:border-violet-500 focus:bg-white'
                                } placeholder-gray-400`}
                        />
                        {errors.title && (
                            <div className="animate-slide-up">
                                <ErrorMessage>{errors.title?.message}</ErrorMessage>
                            </div>
                        )}
                    </div>

                    {/* Description Field */}
                    <div className="space-y-3 animate-slide-left" style={{ animationDelay: '0.2s' }}>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <div className={`border-2 rounded-lg transition-all duration-200 ${errors.description
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 focus-within:border-violet-500'
                            }`}>
                            <Controller
                                control={control}
                                name="description"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <SimpleMDE
                                        {...field}
                                        value={value}
                                        onChange={(val) => {
                                            onChange(val);
                                            updateProgress(); // 🔧 FIX: Debounced progress update
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
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 animate-slide-up" style={{ animationDelay: '0.3s' }}>
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

                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100 hover:bg-gray-50"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FiX className="w-4 h-4" />
                                Cancel
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IssueForm;