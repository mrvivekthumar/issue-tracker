"use client";
import ErrorMessage from '@/app/components/ErrorMessage';
import { IssueSchema } from '@/app/validationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Issue } from '@prisma/client';
import { Button, Callout, TextField, Card, Flex, Text, Badge } from '@radix-ui/themes';
import axios from 'axios';
import "easymde/dist/easymde.min.css";
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
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
        watch
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

    // Watch form values for auto-save functionality
    const watchedValues = watch();

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
        toast.success('Form reset successfully');
    }, [reset]);

    const handleCancel = useCallback(() => {
        if (isDirty) {
            const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
            if (!confirmLeave) return;
        }
        router.back();
    }, [isDirty, router]);

    // Calculate form completion percentage
    const completionPercentage = () => {
        const fields = ['title', 'description'];
        const filledFields = fields.filter(field => watchedValues[field as keyof IssueFormData]?.toString().trim());
        return (filledFields.length / fields.length) * 100;
    };

    if (showSuccess) {
        return (
            <div
                className="min-h-[400px] flex items-center justify-center"
            >
                <Card className="p-8 text-center max-w-md mx-auto">
                    <div
                    >
                        <FiCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    </div>
                    <Text size="6" weight="bold" className="text-gray-900 mb-2">
                        {issue ? 'Issue Updated!' : 'Issue Created!'}
                    </Text>
                    <Text size="3" className="text-gray-600">
                        Redirecting to issues list...
                    </Text>
                </Card>
            </div>
        );
    }

    return (
        <div
            className="max-w-4xl mx-auto p-6"
        >
            <Toaster position="top-right" />

            {/* Header Section */}
            <div className="mb-8">
                <Flex justify="between" align="center" className="mb-4">
                    <div>
                        <Text size="8" weight="bold" className="text-gray-900 mb-2 block">
                            {issue ? 'Edit Issue' : 'Create New Issue'}
                        </Text>
                        <Text size="4" className="text-gray-600">
                            {issue ? 'Update the issue details below.' : 'Fill in the details to create a new issue.'}
                        </Text>
                    </div>
                    <Badge
                        color={completionPercentage() === 100 ? "green" : "gray"}
                        size="2"
                        className="px-3 py-1"
                    >
                        {Math.round(completionPercentage())}% Complete
                    </Badge>
                </Flex>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div
                        className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full"
                    />
                </div>
            </div>

            <Card className="p-8 shadow-lg border border-gray-200">
                {error && (
                    <div
                        className="mb-6"
                    >
                        <Callout.Root color="red" className="border border-red-200 bg-red-50">
                            <Callout.Icon>
                                <FiAlertCircle />
                            </Callout.Icon>
                            <Callout.Text>{error}</Callout.Text>
                        </Callout.Root>
                    </div>
                )}

                <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                    {/* Title Field */}
                    <div
                        className="space-y-3"
                    >
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                            Issue Title <span className="text-red-500">*</span>
                        </label>
                        <TextField.Root
                            size="3"
                            className={`transition-all duration-200 ${errors.title ? 'ring-2 ring-red-500' : 'focus-within:ring-2 focus-within:ring-violet-500'}`}
                        >
                            <TextField.Input
                                id="title"
                                {...register('title')}
                                placeholder="Enter a clear, descriptive title..."
                                className="text-lg"
                            />
                        </TextField.Root>
                        {errors.title && (
                            <div
                            >
                                <ErrorMessage>{errors.title?.message}</ErrorMessage>
                            </div>
                        )}
                    </div>

                    {/* Description Field */}
                    <div
                        className="space-y-3"
                    >
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <div className={`rounded-lg border-2 transition-all duration-200 ${errors.description ? 'border-red-500' : 'border-gray-200 focus-within:border-violet-500'}`}>
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
                                        }}
                                    />
                                )}
                            />
                        </div>
                        {errors.description && (
                            <div
                            >
                                <ErrorMessage>{errors.description?.message}</ErrorMessage>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div
                        className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200"
                    >
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isValid}
                            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                            size="3"
                        >
                            {isSubmitting ? (
                                <Flex align="center" gap="2">
                                    <div
                                    >
                                        <FiRefreshCw className="w-4 h-4" />
                                    </div>
                                    Processing...
                                </Flex>
                            ) : (
                                <Flex align="center" gap="2">
                                    <FiSave className="w-4 h-4" />
                                    {issue ? 'Update Issue' : 'Create Issue'}
                                </Flex>
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="soft"
                            color="gray"
                            onClick={handleReset}
                            disabled={isSubmitting || !isDirty}
                            size="3"
                            className="px-6 py-3 font-semibold transition-all duration-200 hover:scale-105"
                        >
                            <Flex align="center" gap="2">
                                <FiRefreshCw className="w-4 h-4" />
                                Reset
                            </Flex>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            size="3"
                            className="px-6 py-3 font-semibold transition-all duration-200 hover:scale-105 border-gray-300 hover:border-gray-400"
                        >
                            <Flex align="center" gap="2">
                                <FiX className="w-4 h-4" />
                                Cancel
                            </Flex>
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default IssueForm;