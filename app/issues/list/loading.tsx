import { Skeleton } from "@/app/components";
import { Table, Card, Flex, Text } from '@radix-ui/themes';

// Enhanced loading page for issues list
const LoadingIssuesPage = () => {
    const skeletonItems = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <div className="space-y-6">
            {/* Action Bar Skeleton */}
            <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 animate-fade-in">
                <Skeleton height="40px" width="200px" />
                <Skeleton height="40px" width="120px" />
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <Table.Root variant='surface'>
                    <Table.Header className="bg-gray-50">
                        <Table.Row>
                            <Table.ColumnHeaderCell className="px-6 py-4">
                                <Skeleton height="16px" width="60px" />
                            </Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell className='hidden md:table-cell px-6 py-4'>
                                <Skeleton height="16px" width="50px" />
                            </Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell className='hidden md:table-cell px-6 py-4'>
                                <Skeleton height="16px" width="70px" />
                            </Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell className="px-6 py-4 text-right">
                                <Skeleton height="16px" width="60px" className="ml-auto" />
                            </Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {skeletonItems.map((item, index) => (
                            <tr
                                key={item}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <Table.Cell className="px-6 py-4 border-b border-gray-100">
                                    <div className="space-y-3">
                                        <Skeleton height="20px" width="80%" />
                                        <div className='block md:hidden space-y-2'>
                                            <Skeleton height="24px" width="80px" />
                                            <Skeleton height="14px" width="120px" />
                                        </div>
                                    </div>
                                </Table.Cell>

                                <Table.Cell className='hidden md:table-cell px-6 py-4 border-b border-gray-100'>
                                    <Skeleton height="24px" width="80px" />
                                </Table.Cell>

                                <Table.Cell className='hidden md:table-cell px-6 py-4 border-b border-gray-100'>
                                    <Skeleton height="16px" width="100px" />
                                </Table.Cell>

                                <Table.Cell className="px-6 py-4 border-b border-gray-100">
                                    <Flex gap="2" justify="end">
                                        <Skeleton height="32px" width="32px" />
                                        <Skeleton height="32px" width="32px" />
                                    </Flex>
                                </Table.Cell>
                            </tr>
                        ))}
                    </Table.Body>
                </Table.Root>
            </div>

            {/* Pagination Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <Flex justify="between" align="center">
                    <Skeleton height="16px" width="200px" />
                    <Flex gap="2">
                        <Skeleton height="32px" width="32px" />
                        <Skeleton height="32px" width="32px" />
                        <Skeleton height="32px" width="32px" />
                        <Skeleton height="32px" width="32px" />
                        <Skeleton height="32px" width="32px" />
                    </Flex>
                </Flex>
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
                <Flex justify="between" align="center" className="mb-4">
                    <div className="space-y-2">
                        <Skeleton height="32px" width="300px" />
                        <Skeleton height="20px" width="400px" />
                    </div>
                    <Skeleton height="24px" width="100px" />
                </Flex>
                <Skeleton height="8px" width="100%" />
            </div>

            <Card className="p-8 shadow-lg border border-gray-200">
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
            </Card>
        </div>
    );
};

// Enhanced Issue Detail Loading
const LoadingIssueDetailPage = () => {
    return (
        <div
            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
        >
            {/* Main Content Skeleton */}
            <div className="lg:col-span-4 space-y-6">
                {/* Title Skeleton */}
                <div
                >
                    <Skeleton height="40px" width="70%" className="mb-4" />
                </div>

                {/* Meta Information Skeleton */}
                <div
                >
                    <Flex gap="4" className="mb-6">
                        <Skeleton height="24px" width="80px" />
                        <Skeleton height="20px" width="120px" />
                    </Flex>
                </div>

                {/* Content Skeleton */}
                <div
                >
                    <Card className="p-6">
                        <div className="space-y-4">
                            <Skeleton height="16px" width="100%" />
                            <Skeleton height="16px" width="95%" />
                            <Skeleton height="16px" width="88%" />
                            <Skeleton height="16px" width="92%" />
                            <Skeleton height="16px" width="85%" />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Sidebar Skeleton */}
            <div
                className="space-y-4"
            >
                <Skeleton height="48px" width="100%" />
                <Skeleton height="48px" width="100%" />
                <Skeleton height="48px" width="100%" />
            </div>
        </div>
    );
};

// Enhanced Dashboard Skeleton
const DashboardSkeleton = () => (
    <div className="space-y-8">
        {/* Header Skeleton */}
        <div
            className="text-center space-y-4"
        >
            <Skeleton height="48px" width="400px" className="mx-auto" />
            <Skeleton height="24px" width="600px" className="mx-auto" />
        </div>

        {/* Stats Cards Skeleton */}
        <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-6">
                    <div className="space-y-4">
                        <Flex justify="between">
                            <Skeleton height="40px" width="40px" />
                            <Skeleton height="24px" width="60px" />
                        </Flex>
                        <div className="space-y-2">
                            <Skeleton height="32px" width="80px" />
                            <Skeleton height="16px" width="120px" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
                {/* Summary Cards */}
                <div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                >
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="p-6">
                            <div className="space-y-4">
                                <Skeleton height="20px" width="100px" />
                                <Skeleton height="40px" width="60px" />
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Chart Skeleton */}
                <div
                >
                    <Card className="p-6">
                        <div className="space-y-6">
                            <Flex justify="between">
                                <div className="space-y-2">
                                    <Skeleton height="24px" width="200px" />
                                    <Skeleton height="16px" width="300px" />
                                </div>
                                <Skeleton height="36px" width="100px" />
                            </Flex>
                            <Skeleton height="300px" width="100%" />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
                {/* Latest Issues Skeleton */}
                <div
                >
                    <Card className="p-6">
                        <div className="space-y-6">
                            <Flex justify="between">
                                <Skeleton height="24px" width="150px" />
                                <Skeleton height="32px" width="80px" />
                            </Flex>
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton height="16px" width="90%" />
                                        <Skeleton height="14px" width="60%" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Activity Skeleton */}
                <div
                >
                    <Card className="p-6">
                        <div className="space-y-6">
                            <Skeleton height="24px" width="150px" />
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Flex key={i} gap="3" align="center">
                                        <Skeleton height="8px" width="8px" />
                                        <div className="flex-1 space-y-1">
                                            <Skeleton height="14px" width="80%" />
                                            <Skeleton height="12px" width="50%" />
                                        </div>
                                        <Skeleton height="12px" width="60px" />
                                    </Flex>
                                ))}
                            </div>
                        </div>
                    </Card>
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