import { Status } from '@prisma/client'

const statusMap: Record<Status, { label: string, className: string }> = {
    OPEN: {
        label: 'Open',
        className: 'bg-red-100 text-red-700 border-red-200'
    },
    IN_PROGRESS: {
        label: 'In Progress',
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    },
    CLOSED: {
        label: 'Closed',
        className: 'bg-green-100 text-green-700 border-green-200'
    },
}

const IssueStatusBadge = ({ status }: { status: Status }) => {
    const statusInfo = statusMap[status];

    return (
        <span
            className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 
                rounded-full text-xs font-medium border
                ${statusInfo.className}
                transition-all duration-200 hover:scale-105
            `}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${status === 'OPEN' ? 'bg-red-500' :
                    status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                        'bg-green-500'
                    } animate-pulse`}
            />
            {statusInfo.label}
        </span>
    )
}

export default IssueStatusBadge