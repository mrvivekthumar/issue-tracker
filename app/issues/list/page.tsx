import Pagination from '@/app/components/Pagination'
import prisma from '@/prisma/client'
import { Status } from '@prisma/client'
import { Flex } from '@radix-ui/themes'
import IssueTable, { columnNames, IssueQuery } from './IssueTable'
import IssueAction from './IsuueAction'
import { Metadata } from 'next'

interface Props {
    searchParams: IssueQuery
}

const IssuesPage = async ({ searchParams }: Props) => {

    const statuses = Object.values(Status);
    console.log("statuses is : ", statuses);
    const status = statuses.includes(searchParams?.status) ? searchParams.status : undefined;
    console.log("Status is : ", status);
    const where = { status };
    const page = parseInt(searchParams.page) || 1;
    const pageSize = 10;

    const orderBy = columnNames
        .includes(searchParams.orderBy)
        ? { [searchParams.orderBy]: 'asc' }
        : undefined;

    const issues = await prisma.issue.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
    });

    const issueCount = await prisma.issue.count({ where });

    return (
        <Flex gap='5' direction='column'>
            <IssueAction />
            <IssueTable searchParams={searchParams} issues={issues} />
            <Pagination itemCount={issueCount} currentPage={page} pageSize={pageSize} />
        </Flex>
    )
}


//  THIS IS FOR CACHING IMPROVEMENTS method 1
// export const revalidate = 0;

//  THIS IS FOR CACHING IMPROVEMENTS method 2
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Issuse Tracker - Issue List ',
    description: 'View all Prohect Issues'
}

export default IssuesPage