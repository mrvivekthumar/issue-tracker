// hooks/useIssueCount.ts - SAFER VERSION with better error handling
'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface IssueStats {
    total: number;
    open: number;
    inProgress: number;
    closed: number;
}

export const useIssueCount = () => {
    return useQuery<IssueStats>({
        queryKey: ['issue-stats'],
        queryFn: async () => {
            try {
                console.log('🔄 Fetching issue stats...');

                const response = await axios.get('/api/issues/stats', {
                    timeout: 10000, // 10 second timeout
                });

                console.log('✅ Issue stats received:', response.data);
                return response.data;
            } catch (error: any) {
                console.error('❌ Failed to fetch issue stats:', error);

                // Return default stats instead of throwing
                console.log('🔄 Using default stats due to error');
                return defaultIssueStats;
            }
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Refetch every minute
        retry: (failureCount, error) => {
            // Don't retry more than 2 times
            if (failureCount >= 2) return false;

            // Don't retry on 404 or other client errors
            if (axios.isAxiosError(error) && error.response?.status && error.response.status < 500) {
                return false;
            }

            return true;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        refetchOnWindowFocus: true,
        throwOnError: false, // Don't throw errors, return default data instead
        initialData: defaultIssueStats, // Start with default data
    });
};

// Default stats for loading state and errors
export const defaultIssueStats: IssueStats = {
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
};