// app/issues/[id]/IssueDetails.tsx - FIXED VERSION
import IssueStatusBadge from '@/app/components/IssueStatusBadge'
import { Issue } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import { FiCalendar, FiClock } from 'react-icons/fi'

// 🔧 BEST SOLUTION: Server-safe date formatting
function formatDateSafe(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Use a consistent format that works on both server and client
    const year = dateObj.getFullYear();
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const day = dateObj.getDate();

    return `${month} ${day}, ${year}`;
}

// 🔧 Alternative: Use ISO string formatting for complete consistency
function formatDateISO(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(dateObj);
}

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
                            Created on {formatDateSafe(issue.createdAt)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                        <FiClock className="w-4 h-4" />
                        <span className="text-sm">
                            Updated {formatDateSafe(issue.updatedAt)}
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