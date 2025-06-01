import IssueStatusBadge from '@/app/components/IssueStatusBadge'
import { Issue } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import { FiCalendar, FiClock } from 'react-icons/fi'

const IssueDetails = ({ issue }: { issue: Issue }) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                    {issue.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4">
                    <IssueStatusBadge status={issue.status} />
                    <div className="flex items-center gap-2 text-gray-600">
                        <FiCalendar className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            Created on {issue.createdAt.toDateString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <FiClock className="w-4 h-4" />
                        <span className="text-sm">
                            Updated {new Date(issue.updatedAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Description Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                </div>
                <div className="p-6">
                    <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-violet-600 prose-code:bg-violet-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100">
                        <ReactMarkdown>{issue.description}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IssueDetails