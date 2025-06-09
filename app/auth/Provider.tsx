// app/auth/Provider.tsx - Enhanced session management
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';

interface AuthProviderProps {
    children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    useEffect(() => {
        // 🔐 FIX: Listen for authentication events across the app
        const handleAuthChange = (event: CustomEvent) => {
            console.log('🔐 Auth event detected:', event.type);
            // Trigger a page refresh for immediate UI updates
            if (event.type === 'auth-success') {
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        };

        // Listen for custom auth events
        window.addEventListener('auth-success' as any, handleAuthChange);
        window.addEventListener('auth-error' as any, handleAuthChange);

        return () => {
            window.removeEventListener('auth-success' as any, handleAuthChange);
            window.removeEventListener('auth-error' as any, handleAuthChange);
        };
    }, []);

    return (
        <SessionProvider
            // 🔐 FIX: Configure session provider for better updates
            refetchInterval={5 * 60} // Refetch session every 5 minutes
            refetchOnWindowFocus={true} // Refetch when window gains focus
            refetchWhenOffline={false} // Don't refetch when offline
        >
            {children}
        </SessionProvider>
    );
}