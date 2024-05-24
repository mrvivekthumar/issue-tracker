"use client";
import { Button, TextField } from '@radix-ui/themes';
import dynamic from "next/dynamic";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false })
import "easymde/dist/easymde.min.css";
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createIssueSchema } from '@/app/validationSchemas';

type IssueForm = z.infer<typeof createIssueSchema>

const NewIssuePage = () => {
    const { register, control, handleSubmit, formState: { errors } } = useForm<IssueForm>({
        resolver: zodResolver(createIssueSchema)
    });
    const router = useRouter();

    const onSubmit = async (data: IssueForm) => {
        console.log(data); // Log data to check its structure
        try {
            const response = await axios.post("/api/issues", data);
            console.log('Response:', response.data); // Log server response
            router.push("/issues");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Axios error:', error.response?.data);
            } else {
                console.error('Unknown error:', error);
            }
        }
    };

    return (
        <form className='max-w-lg space-y-6' onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col space-y-1'>
                <TextField.Root placeholder="Title" {...register('title', { required: true })} />
                {errors.title && <span className='text-red-700'>Title is required</span>}
            </div>
            <div className='flex flex-col space-y-1'>
                <Controller
                    control={control}
                    name='description'
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => <SimpleMDE {...field} placeholder="Description" />}
                />
                {errors.description && <span className='text-red-700'>Description is required</span>}
            </div>
            <Button type="submit">Submit New Issue</Button>
        </form>
    );
};

export default NewIssuePage;

