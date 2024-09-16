import { IssuesStatusBadge } from '@/app/components'
import { Issue, Status } from '@prisma/client'
import { ArrowUpIcon } from '@radix-ui/react-icons'
import { Table } from '@radix-ui/themes'
import NextLink from 'next/link'

export interface IssueQuery {
    page: string,
    status: Status,
    orderBy: keyof Issue
}

interface Props {
    searchParams: IssueQuery
    issues: Issue[]
}


const IssueTable = ({ searchParams, issues }: Props) => {
    return (
        <Table.Root variant='surface'>
            <Table.Header>
                <Table.Row>
                    {columns.map((column) =>
                        <Table.ColumnHeaderCell key={column.value} className={column.className}>
                            <NextLink href={{
                                query: { ...searchParams, orderBy: column.value }
                            }}>{column.label}</NextLink>
                            {column.value === searchParams.orderBy && <ArrowUpIcon className='inline' />}
                        </Table.ColumnHeaderCell>
                    )}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {issues.map(issue => (
                    <Table.Row key={issue.id}>
                        <Table.Cell>
                            <NextLink href={`/issues/${issue.id}`} >
                                {issue.title}
                            </NextLink>
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
    )
}

export const columns: { label: string, value: keyof Issue, className?: string }[] = [
    { label: 'Issues', value: 'title' },
    { label: 'Status', value: 'status', className: 'hidden md:table-cell' },
    { label: 'Created', value: 'createdAt', className: 'hidden md:table-cell' }
]

export const columnNames = columns.map(column => column.value)

export default IssueTable