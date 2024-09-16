import { Status } from '@prisma/client'
import { Badge } from '@radix-ui/themes'
import IssueStatusFileter from '../issues/list/IssueStatusFileter'

const statusMap: Record<Status, { label: string, color: 'red' | 'yellow' | 'green' }> = {
    OPEN: { label: 'Open', color: 'red' },
    IN_PROGRESS: { label: 'In Progress', color: 'yellow' },
    CLOSED: { label: 'Closed', color: 'green' },
}

const IssueStatusBadge = ({ status }: { status: Status }) => {
    return (
        <div>
            <Badge color={statusMap[status].color}>{statusMap[status].label}</Badge>
        </div>
    )
}

export default IssueStatusBadge