'use client'
import { Status } from "@prisma/client";
import { Select } from "@radix-ui/themes";

const statuses: { label: string, value?: Status }[] = [
    { label: "All" },
    { label: "Open", value: 'OPEN' },
    { label: "Closed", value: 'CLOSED' },
    { label: "In Progress", value: 'IN_PROGRESS' },
];

const IssueStatusFileter = () => {
    return (
        <Select.Root>
            <Select.Trigger placeholder="Fileter by status..." />
            <Select.Content>
                {statuses.map((status) => (
                    <Select.Item key={status.value} value={status.value || "vivek"}>{status.label}</Select.Item>
                ))}
            </Select.Content>
        </Select.Root>
    )
}

export default IssueStatusFileter