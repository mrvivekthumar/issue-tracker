import { Skeleton } from '@/app/components'

const IssueFormSkeleton = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 animate-fade-in">
            {/* Header Section Skeleton */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="space-y-2">
                        <Skeleton height="32px" width="300px" />
                        <Skeleton height="20px" width="400px" />
                    </div>
                    <Skeleton height="24px" width="120px" />
                </div>

                {/* Progress bar skeleton */}
                <Skeleton height="8px" width="100%" className="rounded-full" />
            </div>

            {/* Form Card Skeleton */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
                <div className="space-y-8">
                    {/* Title Field Skeleton */}
                    <div className="space-y-3">
                        <Skeleton height="16px" width="100px" />
                        <Skeleton height="48px" width="100%" />
                    </div>

                    {/* Description Field Skeleton */}
                    <div className="space-y-3">
                        <Skeleton height="16px" width="120px" />
                        <Skeleton height="300px" width="100%" />
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                        <Skeleton height="48px" className="flex-1" />
                        <Skeleton height="48px" width="100px" />
                        <Skeleton height="48px" width="100px" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IssueFormSkeleton