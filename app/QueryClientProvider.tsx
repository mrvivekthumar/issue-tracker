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

    // Create QueryClient inside component to avoid SSR issues
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
                        retry: (failureCount, error: any) => {
                            // Don't retry on 4xx errors
                            if (error?.status >= 400 && error?.status < 500) {
                                return false;
                            }
                            return failureCount < 3;
                        },
                        // Prevent automatic refetching on window focus during hydration
                        refetchOnWindowFocus: false,
                        refetchOnMount: true,
                        refetchOnReconnect: true,
                    },
                    mutations: {
                        retry: (failureCount, error: any) => {
                            // Don't retry mutations on client errors
                            if (error?.status >= 400 && error?.status < 500) {
                                return false;
                            }
                            return failureCount < 2;
                        },
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
            {/* Only show devtools after mounting to prevent hydration issues */}
            {mounted && process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                // position="bottomRight"
                />
            )}
        </TanStackQueryClientProvider>
    );
}