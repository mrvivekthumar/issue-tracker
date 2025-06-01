import { Skeleton } from "@/app/components";

// Enhanced loading page for issues list
const LoadingIssuesPage = () => {
    const skeletonItems = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header Skeleton */}
            <div className="mb-8">
                <Skeleton height="36px" width="200px" className="mb-2" />
                <Skeleton height="20px" width="300px" />
            </div>

            {/* Action Bar Skeleton */}
            <div className="flex justify-between items-center p-6 bg-white rounded-xl border border-gray-200 animate-fade-in">
                <Skeleton height="40px" width="200px" />
                <Skeleton height="40px" width="120px" />
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left">
                                <Skeleton height="16px" width="60px" />
                            </th>
                            <th className='hidden md:table-cell px-6 py-4 text-left'>
                                <Skeleton height="16px" width="50px" />
                            </th>
                            <th className='hidden md:table-cell px-6 py-4 text-left'>
                                <Skeleton height="16px" width="70px" />
                            </th>
                            <th className="px-6 py-4 text-right">
                                <Skeleton height="16px" width="60px" className="ml-auto" />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {skeletonItems.map((item, index) => (
                            <tr
                                key={item}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <td className="px-6 py-4">
                                    <div className="space-y-3">
                                        <Skeleton height="20px" width="80%" />
                                        <div className='block md:hidden space-y-2'>
                                            <Skeleton height="24px" width="80px" />
                                            <Skeleton height="14px" width="120px" />
                                        </div>
                                    </div>
                                </td>

                                <td className='hidden md:table-cell px-6 py-4'>
                                    <Skeleton height="24px" width="80px" />
                                </td>

                                <td className='hidden md:table-cell px-6 py-4'>
                                    <Skeleton height="16px" width="100px" />
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex gap-2 justify-end">
                                        <Skeleton height="32px" width="32px" />
                                        <Skeleton height="32px" width="32px" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex justify-between items-center">
                    <Skeleton height="16px" width="200px" />
                    <div className="flex gap-2">
                        <Skeleton height="32px" width="32px" />
                        <Skeleton height="32px" width="32px" />
                        <Skeleton height="32px" width="32px" />
                        <Skeleton height="32px" width="32px" />
                        <Skeleton height="32px" width="32px" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Issue Form Skeleton
const IssueFormSkeleton = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 animate-fade-in">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="space-y-2">
                        <Skeleton height="32px" width="300px" />
                        <Skeleton height="20px" width="400px" />
                    </div>
                    <Skeleton height="24px" width="100px" />
                </div>
                <Skeleton height="8px" width="100%" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
                <div className="space-y-8">
                    {/* Title Field Skeleton */}
                    <div className="space-y-3 animate-slide-left" style={{ animationDelay: '0.1s' }}>
                        <Skeleton height="16px" width="100px" />
                        <Skeleton height="48px" width="100%" />
                    </div>

                    {/* Description Field Skeleton */}
                    <div className="space-y-3 animate-slide-left" style={{ animationDelay: '0.2s' }}>
                        <Skeleton height="16px" width="120px" />
                        <Skeleton height="250px" width="100%" />
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <Skeleton height="48px" className="flex-1" />
                        <Skeleton height="48px" width="100px" />
                        <Skeleton height="48px" width="100px" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Issue Detail Loading
const LoadingIssueDetailPage = () => {
    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Main Content Skeleton */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Title Skeleton */}
                    <div>
                        <Skeleton height="40px" width="70%" className="mb-4" />
                    </div>

                    {/* Meta Information Skeleton */}
                    <div>
                        <div className="flex gap-4 mb-6">
                            <Skeleton height="24px" width="80px" />
                            <Skeleton height="20px" width="120px" />
                        </div>
                    </div>

                    {/* Content Skeleton */}
                    <div>
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="space-y-4">
                                <Skeleton height="16px" width="100%" />
                                <Skeleton height="16px" width="95%" />
                                <Skeleton height="16px" width="88%" />
                                <Skeleton height="16px" width="92%" />
                                <Skeleton height="16px" width="85%" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Skeleton */}
                <div className="lg:col-span-1 space-y-4">
                    <Skeleton height="48px" width="100%" />
                    <Skeleton height="48px" width="100%" />
                    <Skeleton height="48px" width="100%" />
                </div>
            </div>
        </div>
    );
};

// Enhanced Dashboard Skeleton
const DashboardSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-4 mb-12">
                <Skeleton height="48px" width="400px" className="mx-auto" />
                <Skeleton height="24px" width="600px" className="mx-auto" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Skeleton height="40px" width="40px" />
                                <Skeleton height="24px" width="60px" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton height="32px" width="80px" />
                                <Skeleton height="16px" width="120px" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
                                <div className="space-y-4">
                                    <Skeleton height="20px" width="100px" />
                                    <Skeleton height="40px" width="60px" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart Skeleton */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="space-y-6">
                            <div className="flex justify-between">
                                <div className="space-y-2">
                                    <Skeleton height="24px" width="200px" />
                                    <Skeleton height="16px" width="300px" />
                                </div>
                                <Skeleton height="36px" width="100px" />
                            </div>
                            <Skeleton height="300px" width="100%" />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Latest Issues Skeleton */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="space-y-6">
                            <div className="flex justify-between">
                                <Skeleton height="24px" width="150px" />
                                <Skeleton height="32px" width="80px" />
                            </div>
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton height="16px" width="90%" />
                                        <Skeleton height="14px" width="60%" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Activity Skeleton */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="space-y-6">
                            <Skeleton height="24px" width="150px" />
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton height="8px" width="8px" />
                                        <div className="flex-1 space-y-1">
                                            <Skeleton height="14px" width="80%" />
                                            <Skeleton height="12px" width="50%" />
                                        </div>
                                        <Skeleton height="12px" width="60px" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export {
    LoadingIssuesPage,
    IssueFormSkeleton,
    LoadingIssueDetailPage,
    DashboardSkeleton
};

export default LoadingIssuesPage;