"use client";
import ErrorMessage from '@/app/components/ErrorMessage';
import { createIssueSchema } from '@/app/validationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Spinner, TextField } from '@radix-ui/themes';
import axios from 'axios';
import "easymde/dist/easymde.min.css";
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false })
type IssueForm = z.infer<typeof createIssueSchema>

const NewIssuePage = () => {
    const { register, control, handleSubmit, formState: { errors } } = useForm<IssueForm>({
        resolver: zodResolver(createIssueSchema)
    });
    const router = useRouter();

    const [isSubmitting, setSubmitting] = useState(false);

    const onSubmit = async (data: IssueForm) => {
        console.log(data); // Log data to check its structure
        try {
            setSubmitting(true);
            const response = await axios.post("/api/issues", data);
            console.log('Response:', response.data); // Log server response
            router.push("/issues");
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
                <TextField.Root {...register('title', { required: "Title is required" })} placeholder="Title" />
                <ErrorMessage>
                    {errors.title?.message}
                </ErrorMessage>
            </div>
            <div className='flex flex-col space-y-1'>
                <Controller
                    control={control}
                    name='description'
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => <SimpleMDE {...field} placeholder="Description" />}
                />
                <ErrorMessage>
                    {errors.description?.message}
                </ErrorMessage>
            </div>
            <Button disabled={isSubmitting} type="submit"> Submit New Issue {isSubmitting && <Spinner />}   </Button>
        </form>
    );
};

export default NewIssuePage;

