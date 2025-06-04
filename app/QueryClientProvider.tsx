'use client';

import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';

export default function QueryClientProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);

    // Create QueryClient with optimized settings for better performance
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000, // 5 minutes (increased from 1 minute)
                        gcTime: 30 * 60 * 1000, // 30 minutes (increased from 10 minutes)
                        retry: (failureCount, error: any) => {
                            // Don't retry on 4xx errors
                            if (error?.status >= 400 && error?.status < 500) {
                                return false;
                            }
                            return failureCount < 2; // Reduced retries for faster failures
                        },
                        // Optimize for faster navigation
                        refetchOnWindowFocus: false,
                        refetchOnMount: true,
                        refetchOnReconnect: true,
                        // suspense is not a valid option here and has been removed
                    },
                    mutations: {
                        retry: (failureCount, error: any) => {
                            // Don't retry mutations on client errors
                            if (error?.status >= 400 && error?.status < 500) {
                                return false;
                            }
                            return failureCount < 1; // Reduced mutation retries
                        },
                        // Faster mutation timeouts
                        networkMode: 'online',
                    },
                },
            })
    );

    // Ensure component is mounted before showing devtools
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <TanStackQueryClientProvider client={queryClient}>
            {children}
            {/* Only show devtools in development and after mounting */}
            {mounted && process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                    // Use a valid position value: 'bottom-left' is not allowed, use 'bottom' or 'right'
                    position="bottom"
                />
            )}
        </TanStackQueryClientProvider>
    );
}