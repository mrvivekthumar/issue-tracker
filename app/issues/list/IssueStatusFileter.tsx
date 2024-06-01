'use client'
import { Status } from "@prisma/client";
import { Select } from "@radix-ui/themes";
import { useRouter, useSearchParams } from "next/navigation";

const statuses: { label: string, value: string }[] = [
    { label: "Open", value: 'OPEN' },
    { label: "Closed", value: 'CLOSED' },
    { label: "In Progress", value: 'IN_PROGRESS' },
    { label: "All", value: 'ALL' }
];


type ExtendedStatus = Status | 'ALL';

const IssueStatusFileter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    return (
        <Select.Root
            defaultValue={searchParams.get('orderBy') || ""}
            onValueChange={(status: ExtendedStatus) => {
                const params = new URLSearchParams();
                if (status) {
                    params.append('status', status);
                }

                if (searchParams.get('orderBy')) {
                    params.append('orderBy', searchParams.get('orderBy')!)
                }

                const query = params.size ? '?' + params.toString() : "";

                // const query = status === 'ALL' ? '' : `?status=${status}`;
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