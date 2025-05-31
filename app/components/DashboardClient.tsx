'use client';

import IssueSummary from "./IssueSummary";
import IssueChart from "./IssueChart";
import { Flex, Grid, Card, Text, Button } from "@radix-ui/themes";
import Latestissues from "./Latestissues";
import { Suspense } from "react";
import { FiTrendingUp, FiUsers, FiClock, FiTarget } from "react-icons/fi";
import Link from "next/link";

interface DashboardClientProps {
    issueStats: {
        open: number;
        closed: number;
        inProgress: number;
        total: number;
    };
    recentActivity: any[];
    performanceMetrics: {
        resolvedToday: number;
        activeUsers: number;
        avgResolutionTime: number;
    };
}

const DashboardClient = ({ issueStats, recentActivity, performanceMetrics }: DashboardClientProps) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-4 mb-12 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Dashboard Overview
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Track, manage, and resolve issues with powerful insights and analytics
                    </p>
                </div>

                {/* Quick Stats Cards */}
                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <Grid columns={{ initial: '1', sm: '2', lg: '4' }} gap="6" className="mb-8">
                        <QuickStatCard
                            title="Total Issues"
                            value={issueStats.total}
                            change="+12%"
                            trend="up"
                            icon={FiTarget}
                            color="violet"
                        />
                        <QuickStatCard
                            title="Open Issues"
                            value={issueStats.open}
                            change="-5%"
                            trend="down"
                            icon={FiClock}
                            color="red"
                        />
                        <QuickStatCard
                            title="Resolved Today"
                            value={performanceMetrics.resolvedToday}
                            change="+25%"
                            trend="up"
                            icon={FiTrendingUp}
                            color="green"
                        />
                        <QuickStatCard
                            title="Active Users"
                            value={performanceMetrics.activeUsers}
                            change="+8%"
                            trend="up"
                            icon={FiUsers}
                            color="blue"
                        />
                    </Grid>
                </div>

                {/* Main Content Grid */}
                <Grid columns={{ initial: '1', lg: '3' }} gap="8">
                    {/* Left Column - Charts and Summary */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Issue Summary Cards */}
                        <div className="animate-slide-left" style={{ animationDelay: '0.2s' }}>
                            <Suspense fallback={<SummaryCardsSkeleton />}>
                                <IssueSummary
                                    open={issueStats.open}
                                    closed={issueStats.closed}
                                    inProgress={issueStats.inProgress}
                                />
                            </Suspense>
                        </div>

                        {/* Enhanced Chart Section */}
                        <div className="animate-slide-left" style={{ animationDelay: '0.3s' }}>
                            <Card className="p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <Text size="5" weight="bold" className="text-gray-900 mb-2 block">
                                            Issues Analytics
                                        </Text>
                                        <Text size="3" className="text-gray-600">
                                            Track issue trends and patterns over time
                                        </Text>
                                    </div>
                                    <Button variant="outline" size="2" className="hover:scale-105 transition-transform duration-200">
                                        View Details
                                    </Button>
                                </div>
                                <Suspense fallback={<ChartSkeleton />}>
                                    <IssueChart
                                        open={issueStats.open}
                                        closed={issueStats.closed}
                                        inProgress={issueStats.inProgress}
                                    />
                                </Suspense>
                            </Card>
                        </div>

                        {/* Performance Metrics */}
                        <div className="animate-slide-left" style={{ animationDelay: '0.4s' }}>
                            <PerformanceMetricsCard metrics={performanceMetrics} />
                        </div>
                    </div>

                    {/* Right Column - Latest Issues and Activity */}
                    <div className="space-y-8">
                        <div className="animate-slide-right" style={{ animationDelay: '0.5s' }}>
                            <Suspense fallback={<LatestIssuesSkeleton />}>
                                <Latestissues />
                            </Suspense>
                        </div>

                        {/* Recent Activity */}
                        <div className="animate-slide-right" style={{ animationDelay: '0.6s' }}>
                            <RecentActivityCard activity={recentActivity} />
                        </div>

                        {/* Quick Actions */}
                        <div className="animate-slide-right" style={{ animationDelay: '0.7s' }}>
                            <QuickActionsCard />
                        </div>
                    </div>
                </Grid>
            </div>
        </div>
    );
};

// Component definitions
interface QuickStatCardProps {
    title: string;
    value: number;
    change: string;
    trend: 'up' | 'down';
    icon: React.ComponentType<any>;
    color: 'violet' | 'red' | 'green' | 'blue';
}

const QuickStatCard = ({ title, value, change, trend, icon: Icon, color }: QuickStatCardProps) => {
    const colorClasses = {
        violet: 'from-violet-500 to-purple-600',
        red: 'from-red-500 to-pink-600',
        green: 'from-green-500 to-emerald-600',
        blue: 'from-blue-500 to-cyan-600'
    };

    const bgClasses = {
        violet: 'bg-violet-100',
        red: 'bg-red-100',
        green: 'bg-green-100',
        blue: 'bg-blue-100'
    };

    const iconColorClasses = {
        violet: 'text-violet-600',
        red: 'text-red-600',
        green: 'text-green-600',
        blue: 'text-blue-600'
    };

    return (
        <Card className="p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <Flex justify="between" align="start" className="mb-4">
                <div className={`p-3 rounded-xl ${bgClasses[color]} transform hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-6 w-6 ${iconColorClasses[color]}`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    <span>{change}</span>
                </div>
            </Flex>
            <div>
                <Text size="6" weight="bold" className="text-gray-900 block mb-1">
                    {value.toLocaleString()}
                </Text>
                <Text size="3" className="text-gray-600">
                    {title}
                </Text>
            </div>
        </Card>
    );
};

const PerformanceMetricsCard = ({ metrics }: { metrics: any }) => (
    <Card className="p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <Text size="5" weight="bold" className="text-gray-900 mb-6 block">
            Performance Metrics
        </Text>

        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Text size="3" className="text-gray-600">Average Resolution Time</Text>
                <Text size="4" weight="bold" className="text-gray-900">
                    {metrics.avgResolutionTime} days
                </Text>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full w-3/4 transform origin-left animate-scale-x"></div>
            </div>

            <div className="flex justify-between items-center">
                <Text size="3" className="text-gray-600">Team Efficiency</Text>
                <Text size="4" weight="bold" className="text-green-600">85%</Text>
            </div>

            <div className="flex justify-between items-center">
                <Text size="3" className="text-gray-600">Customer Satisfaction</Text>
                <Text size="4" weight="bold" className="text-blue-600">4.8/5</Text>
            </div>
        </div>
    </Card>
);

const RecentActivityCard = ({ activity }: { activity: any[] }) => (
    <Card className="p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
            <Text size="5" weight="bold" className="text-gray-900">
                Recent Activity
            </Text>
            <Button variant="ghost" size="2" className="hover:scale-105 transition-transform duration-200">
                View All
            </Button>
        </div>

        <div className="space-y-4">
            {activity.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                    <div className="flex-1 min-w-0">
                        <Text size="2" weight="medium" className="text-gray-900 truncate block">
                            {item.title}
                        </Text>
                        <Text size="1" className="text-gray-500">
                            {item.assignedUser ? `Assigned to ${item.assignedUser}` : 'Unassigned'}
                        </Text>
                    </div>
                    <Text size="1" className="text-gray-400 whitespace-nowrap">
                        {new Date(item.updatedAt).toLocaleDateString()}
                    </Text>
                </div>
            ))}
        </div>
    </Card>
);

const QuickActionsCard = () => (
    <Card className="p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <Text size="5" weight="bold" className="text-gray-900 mb-6 block">
            Quick Actions
        </Text>

        <div className="space-y-3">
            <Button asChild className="w-full justify-start bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 hover:scale-105 transition-all duration-200">
                <Link href="/issues/new">
                    <FiTarget className="mr-2 h-4 w-4" />
                    Create New Issue
                </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start hover:scale-105 transition-all duration-200">
                <Link href="/issues/list">
                    <FiClock className="mr-2 h-4 w-4" />
                    View All Issues
                </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start hover:scale-105 transition-all duration-200">
                <Link href="/reports">
                    <FiTrendingUp className="mr-2 h-4 w-4" />
                    Generate Report
                </Link>
            </Button>
        </div>
    </Card>
);

// Skeleton components
const SummaryCardsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
            </Card>
        ))}
    </div>
);

const ChartSkeleton = () => (
    <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
);

const LatestIssuesSkeleton = () => (
    <Card className="p-6">
        <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
            </div>
        </div>
    </Card>
);

export default DashboardClient;