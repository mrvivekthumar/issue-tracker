'use client';
import { Skeleton } from "@/app/components";
import { Issue, User } from '@prisma/client';
import { Select } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast"

const AssigneeSelect = ({ issue }: { issue: Issue }) => {

    const { data: users, error, isLoading } = useUsers();

    if (isLoading) {
        return <Skeleton />
    }

    if (error) {
        return null;
    }

    const assignIssue = (userId: string) => {
        axios.patch("/api/issues/" + issue.id, {
            assignedToUserId: userId || null,
        }).catch(() => {
            toast.error("changes could not be saved")
        })
    }

    return (
        <>
            <Select.Root
                defaultValue={issue.assignedToUserId || ""}
                onValueChange={assignIssue}
            >
                <Select.Trigger placeholder='Assignee...' />
                <Select.Content>
                    <Select.Group>
                        <Select.Label>Suggestions</Select.Label>
                        {users?.map(user => (
                            <Select.Item key={user.id} value={user.id}>
                                {user.name}
                            </Select.Item>
                        ))}
                    </Select.Group>
                </Select.Content>
            </Select.Root >
            <Toaster />
        </>
    )
}

const useUsers = () => useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => axios.get('/api/users').then(res => res.data),
    staleTime: 60 * 1000,
    retry: 3
})


export default AssigneeSelect