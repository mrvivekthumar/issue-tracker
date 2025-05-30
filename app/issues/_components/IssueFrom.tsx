"use client";
import ErrorMessage from '@/app/components/ErrorMessage';
import { IssueSchema } from '@/app/validationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Issue } from '@prisma/client';
import { Button, Callout, TextField } from '@radix-ui/themes';
import axios from 'axios';
import "easymde/dist/easymde.min.css";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import SimpleMDE from "react-simplemde-editor";
import { z } from 'zod';
import toast from 'react-hot-toast';

type IssueFormData = z.infer<typeof IssueSchema>

interface IssueFormProps {
    issue?: Issue;
}

const IssueForm = ({ issue }: IssueFormProps) => {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isValid },
        reset
    } = useForm<IssueFormData>({
        resolver: zodResolver(IssueSchema),
        defaultValues: {
            title: issue?.title || '',
            description: issue?.description || ''
        }
    });

    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const onSubmit = async (data: IssueFormData) => {
        try {
            setSubmitting(true);
            setError('');

            if (issue) {
                await axios.patch(`/api/issues/${issue.id}`, data);
                toast.success('Issue updated successfully!');
            } else {
                await axios.post("/api/issues", data);
                toast.success('Issue created successfully!');
            }

            router.push("/issues/list");
            router.refresh();
        } catch (error) {
            setSubmitting(false);
            if (axios.isAxiosError(error)) {
                const errorMsg = error.response?.data?.message || 'An error occurred';
                setError(errorMsg);
                toast.error(errorMsg);
            } else {
                const errorMsg = 'An unexpected error occurred';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        }
    };

    const handleReset = () => {
        reset();
        setError('');
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {issue ? 'Edit Issue' : 'Create New Issue'}
                </h1>
                <p className="text-gray-600">
                    {issue ? 'Update the issue details below.' : 'Fill in the details to create a new issue.'}
                </p>
            </div>

            {error && (
                <Callout.Root color="red" className="mb-6">
                    <Callout.Text>{error}</Callout.Text>
                </Callout.Root>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <TextField.Root>
                        <TextField.Input
                            id="title"
                            {...register('title')}
                            placeholder="Enter issue title..."
                            className={errors.title ? 'border-red-500' : ''}
                        />
                    </TextField.Root>
                    <ErrorMessage>{errors.title?.message}</ErrorMessage>
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        control={control}
                        name="description"
                        render={({ field }) => (
                            <SimpleMDE
                                {...field}
                                placeholder="Describe the issue in detail..."
                                options={{
                                    minHeight: '200px',
                                    maxHeight: '400px',
                                    toolbar: [
                                        'bold', 'italic', 'heading', '|',
                                        'quote', 'unordered-list', 'ordered-list', '|',
                                        'link', 'image', '|',
                                        'preview', 'side-by-side', 'fullscreen'
                                    ],
                                    status: false,
                                    spellChecker: false
                                }}
                            />
                        )}
                    />
                    <ErrorMessage>{errors.description?.message}</ErrorMessage>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting || !isValid}
                        className="flex-1"
                        size="3"
                    >
                        {isSubmitting && (
                            <span className="inline-block w-4 h-4 mr-2 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></span>
                        )}
                        {issue ? 'Update Issue' : 'Create Issue'}
                    </Button>

                    <Button
                        type="button"
                        variant="soft"
                        color="gray"
                        onClick={handleReset}
                        disabled={isSubmitting}
                        size="3"
                    >
                        Reset
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        size="3"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default IssueForm;