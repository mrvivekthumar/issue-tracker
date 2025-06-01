import { Skeleton } from "@/app/components"

const LoadingIssueDetailPage = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 animate-fade-in">
            {/* Title Skeleton */}
            <div className="mb-6">
                <Skeleton height="40px" width="70%" className="mb-4" />

                {/* Meta info skeleton */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <Skeleton height="24px" width="80px" />
                    <Skeleton height="20px" width="150px" />
                    <Skeleton height="20px" width="120px" />
                </div>
            </div>

            {/* Content Card Skeleton */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <Skeleton height="20px" width="100px" />
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                    <Skeleton height="16px" width="100%" />
                    <Skeleton height="16px" width="95%" />
                    <Skeleton height="16px" width="88%" />
                    <Skeleton height="16px" width="92%" />
                    <Skeleton height="16px" width="85%" />
                    <Skeleton height="16px" width="90%" />
                </div>
            </div>
        </div>
    )
}

export default LoadingIssueDetailPage