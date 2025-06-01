import prisma from '@/prisma/client'
import Link from 'next/link'
import IssueStatusBadge from './components/IssueStatusBadge'

const Latestissues = async () => {
    const issues = await prisma.issue.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
            assignedToUser: true
        }
    })

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Latest Issues</h3>
                        <p className="text-sm text-gray-600 mt-1">Recently created issues</p>
                    </div>
                    <Link
                        href="/issues/list"
                        className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
                    >
                        View All
                    </Link>
                </div>
            </div>

            <div className="divide-y divide-gray-200">
                {issues.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No issues yet</h4>
                        <p className="text-gray-600 mb-4">Get started by creating your first issue.</p>
                        <Link
                            href="/issues/new"
                            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Issue
                        </Link>
                    </div>
                ) : (
                    issues.map((issue, index) => (
                        <div
                            key={issue.id}
                            className="p-4 hover:bg-gray-50 transition-colors group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/issues/${issue.id}`}
                                        className="block"
                                    >
                                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-violet-600 transition-colors truncate">
                                            {issue.title}
                                        </h4>
                                        <div className="mt-2 flex items-center gap-3">
                                            <IssueStatusBadge status={issue.status} />
                                            <span className="text-xs text-gray-500">
                                                {new Date(issue.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </Link>
                                </div>

                                {/* Assignee Avatar */}
                                <div className="flex-shrink-0">
                                    {issue.assignedToUser ? (
                                        <div className="relative">
                                            <img
                                                src={issue.assignedToUser.image || "/api/placeholder/32/32"}
                                                alt={issue.assignedToUser.name || "Assigned user"}
                                                className="w-8 h-8 rounded-full border-2 border-gray-200"
                                                title={`Assigned to ${issue.assignedToUser.name}`}
                                            />
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {issues.length > 0 && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <Link
                        href="/issues/list"
                        className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors"
                    >
                        View all issues
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default Latestissues