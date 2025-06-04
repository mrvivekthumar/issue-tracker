// app/issues/[id]/IssueDetails.tsx - IMPROVED DESIGN
import IssueStatusBadge from '@/app/components/IssueStatusBadge'
import { Issue } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import { FiCalendar, FiClock, FiUser, FiHash } from 'react-icons/fi'

// Server-safe date formatting
function formatDateSafe(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const day = dateObj.getDate();
    return `${month} ${day}, ${year}`;
}

function formatTimeAgo(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDateSafe(date);
}

const IssueDetails = ({ issue }: { issue: Issue }) => {
    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="space-y-4">
                    {/* Issue Number and Status */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <FiHash className="w-4 h-4" />
                            <span className="text-sm font-mono font-medium">#{issue.id}</span>
                        </div>
                        <IssueStatusBadge status={issue.status} />
                        <div className="text-sm text-gray-500">
                            Issue #{issue.id}
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words">
                        {issue.title}
                    </h1>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <FiCalendar className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">Created</span>
                            <span>{formatDateSafe(issue.createdAt)}</span>
                        </div>

                        <div className="hidden sm:block w-px h-4 bg-gray-300"></div>

                        <div className="flex items-center gap-2">
                            <FiClock className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">Updated</span>
                            <span>{formatTimeAgo(issue.updatedAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description Section - FIXED DESIGN */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Description
                    </h2>
                </div>

                {/* FIXED: Better text wrapping and spacing */}
                <div className="p-6">
                    <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-violet-600 prose-code:bg-violet-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:overflow-x-auto prose-a:text-violet-600 prose-a:no-underline hover:prose-a:underline">
                        {/* Custom styles for better text wrapping */}
                        <div className="break-words overflow-wrap-anywhere">
                            <ReactMarkdown
                                components={{
                                    // Custom components for better rendering
                                    p: ({ children }) => (
                                        <p className="mb-4 leading-relaxed break-words">
                                            {children}
                                        </p>
                                    ),
                                    code: ({ children, className }) => {
                                        const isInline = !className;
                                        if (isInline) {
                                            return (
                                                <code className="px-2 py-1 text-sm bg-violet-50 text-violet-700 rounded border break-all">
                                                    {children}
                                                </code>
                                            );
                                        }
                                        return (
                                            <pre className="overflow-x-auto p-4 bg-gray-900 text-gray-100 rounded-lg">
                                                <code className="text-sm">{children}</code>
                                            </pre>
                                        );
                                    },
                                    a: ({ href, children }) => (
                                        <a
                                            href={href}
                                            className="text-violet-600 hover:text-violet-700 underline break-all"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {children}
                                        </a>
                                    ),
                                    h1: ({ children }) => (
                                        <h1 className="text-2xl font-bold text-gray-900 mb-4 break-words">
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className="text-xl font-bold text-gray-900 mb-3 break-words">
                                            {children}
                                        </h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 break-words">
                                            {children}
                                        </h3>
                                    ),
                                    ul: ({ children }) => (
                                        <ul className="list-disc list-inside mb-4 space-y-1">
                                            {children}
                                        </ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="list-decimal list-inside mb-4 space-y-1">
                                            {children}
                                        </ol>
                                    ),
                                    li: ({ children }) => (
                                        <li className="break-words">
                                            {children}
                                        </li>
                                    ),
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-violet-300 pl-4 italic text-gray-700 my-4 break-words">
                                            {children}
                                        </blockquote>
                                    ),
                                }}
                            >
                                {issue.description}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-gray-600" />
                    Issue Activity
                </h3>

                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                Issue created
                            </p>
                            <p className="text-xs text-gray-500 break-words">
                                {formatDateSafe(issue.createdAt)} • Issue was opened and assigned status: {issue.status}
                            </p>
                        </div>
                    </div>

                    {issue.updatedAt !== issue.createdAt && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    Last updated
                                </p>
                                <p className="text-xs text-gray-500 break-words">
                                    {formatTimeAgo(issue.updatedAt)} • Issue details were modified
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default IssueDetails