import { IssuesStatusBadge, Link } from '@/app/components'
import prisma from '@/prisma/client'
import { Table } from '@radix-ui/themes'
import NewIssueButton from './NewIssue'

const IssuesPage = async () => {

    const issues = await prisma.issue.findMany();
    return (
        <div>
            <NewIssueButton />
            <Table.Root variant='surface'>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>Issues</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className='hidden md:table-cell'>Status</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className='hidden md:table-cell'>Created At</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>

                    {issues.map(issue => (
                        <Table.Row key={issue.id}>
                            <Table.Cell>
                                <Link href={`/issues/${issue.id}`} >
                                    {issue.title}
                                </Link>
                                <div className='block md:hidden'>
                                    <IssuesStatusBadge status={issue.status} />
                                </div>
                            </Table.Cell>

                            <Table.Cell className='hidden md:table-cell'>
                                <IssuesStatusBadge status={issue.status} />
                            </Table.Cell>

                            <Table.Cell className='hidden md:table-cell'>{issue.createdAt.toDateString()}</Table.Cell>
                        </Table.Row>
                    ))
                    }
                </Table.Body>
            </Table.Root>
        </div>
    )
}


//  THIS IS FOR CACHING IMPROVEMENTS

// export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default IssuesPage