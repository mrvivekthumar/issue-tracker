import { IssuesStatusBadge } from '@/app/components'
import { Issue, Status } from '@prisma/client'
import { FiArrowUp, FiArrowDown, FiEye, FiEdit, FiClock, FiUser } from 'react-icons/fi'
import Link from 'next/link'

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
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.value}
                                    className={`${column.className} px-6 py-4 text-left`}
                                >
                                    <Link
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
                                            <div className="text-violet-600">
                                                {searchParams.sortOrder === 'desc' ? <FiArrowDown className="w-4 h-4" /> : <FiArrowUp className="w-4 h-4" />}
                                            </div>
                                        )}
                                        {column.value !== searchParams.orderBy && (
                                            <FiArrowUp className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
                                        )}
                                    </Link>
                                </th>
                            ))}
                            <th className="px-6 py-4 text-right">
                                <span className="text-sm font-semibold text-gray-700">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {issues.map((issue, index) => (
                            <tr
                                key={issue.id}
                                className="group hover:bg-gray-50 transition-colors duration-200"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <td className="px-6 py-4">
                                    <div className="space-y-2">
                                        <Link
                                            href={`/issues/${issue.id}`}
                                            className="block font-medium text-gray-900 hover:text-violet-600 transition-colors duration-200 line-clamp-2"
                                            title={issue.title}
                                        >
                                            {issue.title}
                                        </Link>

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
                                </td>

                                <td className='hidden md:table-cell px-6 py-4'>
                                    <IssuesStatusBadge status={issue.status} />
                                </td>

                                <td className='hidden md:table-cell px-6 py-4'>
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
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Link
                                            href={`/issues/${issue.id}`}
                                            className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-100 rounded-lg transition-all duration-200"
                                            title="View issue"
                                        >
                                            <FiEye className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={`/issues/edit/${issue.id}`}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                                            title="Edit issue"
                                        >
                                            <FiEdit className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const IssueTableSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
            <thead className="bg-gray-50">
                <tr>
                    {columns.map((column) => (
                        <th key={column.value} className={`${column.className} px-6 py-4`}>
                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </th>
                    ))}
                    <th className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16 ml-auto" />
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                        <td className="px-6 py-4">
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 md:hidden" />
                            </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4">
                            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
                        </td>
                        <td className="hidden md:table-cell px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex gap-2 justify-end">
                                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const EmptyState = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center animate-fade-in">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FiEye className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
            No issues found
        </h3>
        <p className="text-gray-600 mb-6">
            There are no issues matching your current filters.
        </p>
        <Link
            href="/issues/new"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
            Create your first issue
        </Link>
    </div>
);

export const columns: { label: string, value: keyof Issue, className?: string }[] = [
    { label: 'Issue', value: 'title' },
    { label: 'Status', value: 'status', className: 'hidden md:table-cell' },
    { label: 'Created', value: 'createdAt', className: 'hidden md:table-cell' }
];

export const columnNames = columns.map(column => column.value);

export default IssueTable;