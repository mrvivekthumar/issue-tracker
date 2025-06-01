import { Status } from '@prisma/client'
import Link from 'next/link'

interface Props {
    open: number,
    inProgress: number,
    closed: number
}

const IssueSummary = ({ open, inProgress, closed }: Props) => {
    const containers: {
        label: string,
        value: number,
        status: Status,
        color: string,
        bgColor: string,
        borderColor: string
    }[] = [
            {
                label: 'Open Issues',
                value: open,
                status: 'OPEN',
                color: 'text-red-700',
                bgColor: 'bg-red-50 hover:bg-red-100',
                borderColor: 'border-red-200 hover:border-red-300'
            },
            {
                label: 'In Progress Issues',
                value: inProgress,
                status: 'IN_PROGRESS',
                color: 'text-yellow-700',
                bgColor: 'bg-yellow-50 hover:bg-yellow-100',
                borderColor: 'border-yellow-200 hover:border-yellow-300'
            },
            {
                label: 'Closed Issues',
                value: closed,
                status: 'CLOSED',
                color: 'text-green-700',
                bgColor: 'bg-green-50 hover:bg-green-100',
                borderColor: 'border-green-200 hover:border-green-300'
            },
        ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {containers.map((container, index) =>
                <div
                    key={container.label}
                    className={`
                        ${container.bgColor} 
                        ${container.borderColor} 
                        border-2 rounded-xl p-6 
                        transform hover:-translate-y-1 
                        transition-all duration-300 
                        shadow-sm hover:shadow-lg 
                        group cursor-pointer
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <Link
                        href={`/issues/list?status=${container.status}`}
                        className="block h-full"
                    >
                        <div className="flex flex-col gap-3 h-full">
                            <div className="flex items-center justify-between">
                                <h3 className={`font-semibold text-sm ${container.color} group-hover:scale-105 transition-transform duration-200`}>
                                    {container.label}
                                </h3>
                                <div className={`w-3 h-3 rounded-full ${container.status === 'OPEN' ? 'bg-red-400' :
                                    container.status === 'IN_PROGRESS' ? 'bg-yellow-400' :
                                        'bg-green-400'
                                    } animate-pulse`} />
                            </div>

                            <div className={`text-4xl font-bold ${container.color} group-hover:scale-110 transition-transform duration-200`}>
                                {container.value}
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-xs text-gray-500">
                                    {container.status === 'OPEN' ? 'Need attention' :
                                        container.status === 'IN_PROGRESS' ? 'Being worked on' :
                                            'Completed'}
                                </span>
                                <svg
                                    className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default IssueSummary