import { IssuesStatusBadge } from '@/app/components'
import { Issue, Status } from '@prisma/client'
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons'
import { Table, Button, Flex, Text, Badge } from '@radix-ui/themes'
import NextLink from 'next/link'
import { FiEye, FiEdit, FiClock, FiUser } from 'react-icons/fi'

export interface IssueQuery {
    page: string,
    status: Status,
    orderBy: keyof Issue,
    sortOrder?: 'asc' | 'desc'
}

interface Props {
    searchParams: IssueQuery
    issues: Issue[]
    loading?: boolean
}

const IssueTable = ({ searchParams, issues, loading = false }: Props) => {
    if (loading) {
        return <IssueTableSkeleton />;
    }

    if (!issues.length) {
        return <EmptyState />;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Table.Root variant='surface' className="w-full">
                <Table.Header className="bg-gray-50">
                    <Table.Row>
                        {columns.map((column, index) => (
                            <Table.ColumnHeaderCell
                                key={column.value}
                                className={`${column.className} px-6 py-4 border-b border-gray-200`}
                            >
                                <div
                                >
                                    <NextLink
                                        href={{
                                            query: {
                                                ...searchParams,
                                                orderBy: column.value,
                                                sortOrder: searchParams.orderBy === column.value && searchParams.sortOrder === 'asc' ? 'desc' : 'asc'
                                            }
                                        }}
                                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-violet-600 transition-colors duration-200 group"
                                    >
                                        <span>{column.label}</span>
                                        {column.value === searchParams.orderBy && (
                                            <div
                                                className="text-violet-600"
                                            >
                                                {searchParams.sortOrder === 'desc' ? <ArrowDownIcon /> : <ArrowUpIcon />}
                                            </div>
                                        )}
                                        {column.value !== searchParams.orderBy && (
                                            <ArrowUpIcon className="opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
                                        )}
                                    </NextLink>
                                </div>
                            </Table.ColumnHeaderCell>
                        ))}
                        <Table.ColumnHeaderCell className="px-6 py-4 border-b border-gray-200 text-right">
                            <Text size="2" weight="medium" className="text-gray-700">Actions</Text>
                        </Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {issues.map((issue, index) => (
                        <tr
                            key={issue.id}
                            className="group hover:bg-gray-50 transition-colors duration-200"
                        >
                            <Table.Cell className="px-6 py-4 border-b border-gray-100">
                                <div className="space-y-2">
                                    <NextLink
                                        href={`/issues/${issue.id}`}
                                        className="block font-medium text-gray-900 hover:text-violet-600 transition-colors duration-200 line-clamp-2"
                                        title={issue.title}
                                    >
                                        {issue.title}
                                    </NextLink>

                                    {/* Mobile status badge */}
                                    <div className='block md:hidden'>
                                        <IssuesStatusBadge status={issue.status} />
                                    </div>

                                    {/* Additional mobile info */}
                                    <div className="block md:hidden text-sm text-gray-500 space-y-1">
                                        <div className="flex items-center gap-1">
                                            <FiClock className="w-3 h-3" />
                                            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {issue.assignedToUserId && (
                                            <div className="flex items-center gap-1">
                                                <FiUser className="w-3 h-3" />
                                                <span>Assigned</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Table.Cell>

                            <Table.Cell className='hidden md:table-cell px-6 py-4 border-b border-gray-100'>
                                <IssuesStatusBadge status={issue.status} />
                            </Table.Cell>

                            <Table.Cell className='hidden md:table-cell px-6 py-4 border-b border-gray-100'>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <FiClock className="w-4 h-4" />
                                    <span className="text-sm">
                                        {new Date(issue.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </Table.Cell>

                            <Table.Cell className="px-6 py-4 border-b border-gray-100 text-right">
                                <Flex gap="2" justify="end" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Button
                                        size="1"
                                        variant="ghost"
                                        asChild
                                        className="hover:bg-violet-100 hover:text-violet-700 transition-colors duration-200"
                                    >
                                        <NextLink href={`/issues/${issue.id}`} title="View issue">
                                            <FiEye className="w-4 h-4" />
                                        </NextLink>
                                    </Button>
                                    <Button
                                        size="1"
                                        variant="ghost"
                                        asChild
                                        className="hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
                                    >
                                        <NextLink href={`/issues/edit/${issue.id}`} title="Edit issue">
                                            <FiEdit className="w-4 h-4" />
                                        </NextLink>
                                    </Button>
                                </Flex>
                            </Table.Cell>
                        </tr>
                    ))}
                </Table.Body>
            </Table.Root>
        </div>
    );
};

const IssueTableSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table.Root variant='surface'>
            <Table.Header className="bg-gray-50">
                <Table.Row>
                    {columns.map((column) => (
                        <Table.ColumnHeaderCell key={column.value} className={`${column.className} px-6 py-4`}>
                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </Table.ColumnHeaderCell>
                    ))}
                    <Table.ColumnHeaderCell className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16 ml-auto" />
                    </Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {Array.from({ length: 5 }).map((_, index) => (
                    <Table.Row key={index}>
                        <Table.Cell className="px-6 py-4">
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 md:hidden" />
                            </div>
                        </Table.Cell>
                        <Table.Cell className="hidden md:table-cell px-6 py-4">
                            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
                        </Table.Cell>
                        <Table.Cell className="hidden md:table-cell px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4">
                            <div className="flex gap-2 justify-end">
                                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    </div>
);

const EmptyState = () => (
    <div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
    >
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FiEye className="w-12 h-12 text-gray-400" />
        </div>
        <Text size="5" weight="bold" className="text-gray-900 mb-2 block">
            No issues found
        </Text>
        <Text size="3" className="text-gray-600 mb-6 block">
            There are no issues matching your current filters.
        </Text>
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <NextLink href="/issues/new">
                Create your first issue
            </NextLink>
        </Button>
    </div>
);

export const columns: { label: string, value: keyof Issue, className?: string }[] = [
    { label: 'Issue', value: 'title' },
    { label: 'Status', value: 'status', className: 'hidden md:table-cell' },
    { label: 'Created', value: 'createdAt', className: 'hidden md:table-cell' }
];

export const columnNames = columns.map(column => column.value);

export default IssueTable;