// app/issues/list/page.tsx - FIXED VERSION with proper Prisma types
import Pagination from '@/app/components/Pagination'
import prisma from '@/prisma/client'
import { Status, Prisma } from '@prisma/client' // Import Prisma for types
import IssueTable, { columnNames, IssueQuery } from './IssueTable'
import IssueAction from './IsuueAction'
import { Metadata } from 'next'

interface Props {
    searchParams: Promise<IssueQuery & { search?: string }>
}

const IssuesPage = async ({ searchParams }: Props) => {
    const params = await searchParams;

    const statuses = Object.values(Status);
    const status = statuses.includes(params?.status) ? params.status : undefined;
    const searchQuery = params.search || '';

    // ✅ FIXED: Proper Prisma orderBy with correct types
    const orderBy: Prisma.IssueOrderByWithRelationInput = (() => {
        // Check if the orderBy field is valid
        if (params.orderBy && columnNames.includes(params.orderBy)) {
            // ✅ Use Prisma.SortOrder enum for type safety
            const sortDirection: Prisma.SortOrder = params.sortOrder === 'desc'
                ? Prisma.SortOrder.desc
                : Prisma.SortOrder.asc;

            // ✅ Create properly typed orderBy object
            return { [params.orderBy]: sortDirection } as Prisma.IssueOrderByWithRelationInput;
        }

        // ✅ Default: newest issues first with proper type
        return { createdAt: Prisma.SortOrder.desc };
    })();

    // Build where clause with search support
    const where: Prisma.IssueWhereInput = {};

    if (status) {
        where.status = status;
    }

    if (searchQuery.trim()) {
        where.OR = [
            {
                title: {
                    contains: searchQuery,
                    mode: 'insensitive'
                }
            },
            {
                description: {
                    contains: searchQuery,
                    mode: 'insensitive'
                }
            }
        ];
    }

    const page = parseInt(params.page) || 1;
    const pageSize = 10;

    console.log('OrderBy configuration:', orderBy);
    console.log('Where clause:', where);

    try {
        const [issues, issueCount] = await Promise.all([
            prisma.issue.findMany({
                where,
                orderBy, // ✅ Now properly typed
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    assignedToUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true
                        }
                    }
                }
            }),
            prisma.issue.count({ where })
        ]);

        // Create serializable params for client components
        const serializedParams: IssueQuery = {
            page: params.page || '1',
            status: params.status,
            orderBy: params.orderBy,
            sortOrder: params.sortOrder
        };

        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Issues
                            {searchQuery && (
                                <span className="text-lg font-normal text-gray-600 ml-2">
                                    - Search results for "{searchQuery}"
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-600">
                            {searchQuery
                                ? `Found ${issueCount} issue${issueCount !== 1 ? 's' : ''} matching your search`
                                : 'Track and manage all project issues'
                            }
                        </p>

                        {searchQuery && (
                            <div className="mt-3">
                                <a
                                    href="/issues/list"
                                    className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear search
                                </a>
                            </div>
                        )}
                    </div>

                    <IssueAction />

                    {issueCount === 0 && searchQuery ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No issues found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                No issues match your search for "{searchQuery}". Try different keywords or{' '}
                                <a href="/issues/list" className="text-violet-600 hover:text-violet-700 font-medium">
                                    view all issues
                                </a>
                                .
                            </p>
                        </div>
                    ) : (
                        <>
                            <IssueTable searchParams={serializedParams} issues={issues} />
                            <Pagination itemCount={issueCount} currentPage={page} pageSize={pageSize} />
                        </>
                    )}
                </div>
            </div>
        );

    } catch (error) {
        console.error('Error fetching issues:', error);

        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <h2 className="text-lg font-semibold text-red-900 mb-2">
                        Error Loading Issues
                    </h2>
                    <p className="text-red-700">
                        There was a problem loading the issues. Please try again later.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }
}

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Issue Tracker - Issue List',
    description: 'View and search project issues'
}

export default IssuesPage