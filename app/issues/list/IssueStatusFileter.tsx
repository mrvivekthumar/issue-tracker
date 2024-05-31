'use client'
import { Status } from "@prisma/client";
import { Select } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

const statuses: { label: string, value: string }[] = [
    { label: "Open", value: 'OPEN' },
    { label: "Closed", value: 'CLOSED' },
    { label: "In Progress", value: 'IN_PROGRESS' },
    { label: "All", value: 'ALL' }
];


type ExtendedStatus = Status | 'ALL';

const IssueStatusFileter = () => {
    const router = useRouter();
    return (
        <Select.Root onValueChange={(status: ExtendedStatus) => {
            const query = status === 'ALL' ? '' : `?status=${status}`;
            router.push('/issues/list' + query);
        }}>
            <Select.Trigger placeholder="Fileter by status..." />
            <Select.Content>
                {statuses.map((status) => (
                    <Select.Item key={status.value} value={status.value || ""}>{status.label}</Select.Item>
                ))}
            </Select.Content>
        </Select.Root>
    )
}

export default IssueStatusFileter