// app/issues/list/page.tsx - FIXED VERSION
import Pagination from '@/app/components/Pagination'
import prisma from '@/prisma/client'
import { Status } from '@prisma/client'
import IssueTable, { columnNames, IssueQuery } from './IssueTable'
import IssueAction from './IsuueAction'
import { Metadata } from 'next'

interface Props {
    searchParams: Promise<IssueQuery> // Now it's a Promise!
}

const IssuesPage = async ({ searchParams }: Props) => {
    // STEP 1: Await the searchParams first
    const params = await searchParams;

    const statuses = Object.values(Status);
    console.log("statuses is : ", statuses);

    // STEP 2: Now safely access the properties
    const status = statuses.includes(params?.status) ? params.status : undefined;
    console.log("Status is : ", status);

    const where = { status };
    const page = parseInt(params.page) || 1;
    const pageSize = 10;

    const orderBy = columnNames
        .includes(params.orderBy)
        ? { [params.orderBy]: 'asc' }
        : undefined;

    const issues = await prisma.issue.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
    });

    const issueCount = await prisma.issue.count({ where });

    // STEP 3: Create a serializable object for client components
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Issues</h1>
                    <p className="text-gray-600">Track and manage all project issues</p>
                </div>

                {/* Actions */}
                <IssueAction />

                {/* Table - Pass serialized params */}
                <IssueTable searchParams={serializedParams} issues={issues} />

                {/* Pagination */}
                <Pagination itemCount={issueCount} currentPage={page} pageSize={pageSize} />
            </div>
        </div>
    )
}

// Keep the existing cache and metadata exports
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Issue Tracker - Issue List ',
    description: 'View all Project Issues'
}

export default IssuesPage