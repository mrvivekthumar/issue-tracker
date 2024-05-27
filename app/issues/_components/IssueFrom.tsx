"use client";
import ErrorMessage from '@/app/components/ErrorMessage';
import { IssueSchema } from '@/app/validationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Issue } from '@prisma/client';
import { Button, Spinner, TextField } from '@radix-ui/themes';
import axios from 'axios';
import "easymde/dist/easymde.min.css";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import SimpleMDE from "react-simplemde-editor";
import { z } from 'zod';
type IssueFormData = z.infer<typeof IssueSchema>

const IssueForm = ({ issue }: { issue?: Issue }) => {
    const { register, control, handleSubmit, formState: { errors } } = useForm<IssueFormData>({
        resolver: zodResolver(IssueSchema)
    });
    const router = useRouter();

    const [isSubmitting, setSubmitting] = useState(false);

    const onSubmit = async (data: IssueFormData) => {
        try {
            setSubmitting(true);
            if (issue) {
                await axios.patch("/api/issues/" + issue?.id, data);
            } else {
                await axios.post("/api/issues", data);
            }
            router.push("/issues/list");
            router.refresh();
        } catch (error) {
            setSubmitting(false);
            if (axios.isAxiosError(error)) {
                console.error('Axios error:', error.response?.data);
            } else {
                console.error('Unknown error:', error);
            }
        }
    };

    return (
        <form className='max-w-xl space-y-6' onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col space-y-1'>
                <TextField.Root defaultValue={issue?.title}{...register('title', { required: "Title is required" })} placeholder="Title" />
                <ErrorMessage>
                    {errors.title?.message}
                </ErrorMessage>
            </div>
            <div className='flex flex-col space-y-1'>
                <Controller
                    control={control}
                    name='description'
                    defaultValue={issue?.description}
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => <SimpleMDE {...field} placeholder="Description" />}
                />
                <ErrorMessage>
                    {errors.description?.message}
                </ErrorMessage>
            </div>
            <Button disabled={isSubmitting} type="submit">
                {issue ? "Update Issue" : 'Submit New Issue'}
                {isSubmitting && <Spinner />}   </Button>
        </form>
    );
};

export default IssueForm;

