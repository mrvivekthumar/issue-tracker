'use client';

import IssueSummary from "../IssueSummary";
import IssueChart from "../IssueChart";
import Latestissues from "../Latestissues";
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                                            Issues Analytics
                                        </h2>
                                        <p className="text-gray-600">
                                            Track issue trends and patterns over time
                                        </p>
                                    </div>
                                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200 font-medium">
                                        View Details
                                    </button>
                                </div>
                                <Suspense fallback={<ChartSkeleton />}>
                                    <IssueChart
                                        open={issueStats.open}
                                        closed={issueStats.closed}
                                        inProgress={issueStats.inProgress}
                                    />
                                </Suspense>
                            </div>
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
                </div>
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
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bgClasses[color]} transform hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-6 w-6 ${iconColorClasses[color]}`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    <span>{change}</span>
                </div>
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                    {value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                    {title}
                </div>
            </div>
        </div>
    );
};

const PerformanceMetricsCard = ({ metrics }: { metrics: any }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
            Performance Metrics
        </h3>

        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Resolution Time</span>
                <span className="text-lg font-bold text-gray-900">
                    {metrics.avgResolutionTime} days
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full w-3/4 transform origin-left animate-scale-x"></div>
            </div>

            <div className="flex justify-between items-center">
                <span className="text-gray-600">Team Efficiency</span>
                <span className="text-lg font-bold text-green-600">85%</span>
            </div>

            <div className="flex justify-between items-center">
                <span className="text-gray-600">Customer Satisfaction</span>
                <span className="text-lg font-bold text-blue-600">4.8/5</span>
            </div>
        </div>
    </div>
);

const RecentActivityCard = ({ activity }: { activity: any[] }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
                Recent Activity
            </h3>
            <button className="text-sm text-violet-600 hover:text-violet-700 font-medium hover:scale-105 transition-all duration-200">
                View All
            </button>
        </div>

        <div className="space-y-4">
            {activity.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                        </div>
                        <div className="text-xs text-gray-500">
                            {item.assignedUser ? `Assigned to ${item.assignedUser}` : 'Unassigned'}
                        </div>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const QuickActionsCard = () => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
        </h3>

        <div className="space-y-3">
            <Link
                href="/issues/new"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
            >
                <FiTarget className="w-4 h-4" />
                Create New Issue
            </Link>

            <Link
                href="/issues/list"
                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg hover:scale-105 transition-all duration-200"
            >
                <FiClock className="w-4 h-4" />
                View All Issues
            </Link>

            <Link
                href="/reports"
                className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg hover:scale-105 transition-all duration-200"
            >
                <FiTrendingUp className="w-4 h-4" />
                Generate Report
            </Link>
        </div>
    </div>
);

// Skeleton components
const SummaryCardsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        ))}
    </div>
);

const ChartSkeleton = () => (
    <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
);

const LatestIssuesSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
            </div>
        </div>
    </div>
);

export default DashboardClient;