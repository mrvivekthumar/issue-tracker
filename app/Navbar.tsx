// app/Navbar.tsx - FIXED VERSION with better session handling
"use client";
import classnames from 'classnames';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBug, FaPlus, FaList, FaChartBar, FaUser, FaSignOutAlt, FaSignInAlt, FaBell, FaSearch, FaCog } from "react-icons/fa";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useIssueCount, defaultIssueStats } from '@/hooks/useIssueCount';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    // ✅ FIX 1: Better session handling with immediate updates
    const { data: session, status, update } = useSession();

    // ✅ FIX 2: Force session refresh when needed
    const refreshSession = async () => {
        console.log('🔄 Manually refreshing session...');
        await update();
    };

    // ✅ FIX 3: Listen for authentication events
    useEffect(() => {
        const handleAuthEvent = () => {
            console.log('🔐 Auth event detected, refreshing session...');
            refreshSession();
        };

        // Listen for storage events (from other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'nextauth.message') {
                handleAuthEvent();
            }
        });

        // Listen for custom auth events
        window.addEventListener('auth-changed', handleAuthEvent);

        return () => {
            window.removeEventListener('storage', handleAuthEvent);
            window.removeEventListener('auth-changed', handleAuthEvent);
        };
    }, [refreshSession]);

    // ✅ FIX 4: Enhanced issue stats with session dependency
    const { data: issueStats = defaultIssueStats, refetch: refetchIssueStats } = useIssueCount();

    // Auto-refresh issue stats when session changes
    useEffect(() => {
        if (status === 'authenticated' && session) {
            console.log('🔄 Session authenticated, refreshing issue stats...');
            setTimeout(() => {
                refetchIssueStats();
            }, 500);
        }
    }, [session, status, refetchIssueStats]);

    // Listen for storage events to sync across tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'issue-updated' || e.key === 'assignee-changed') {
                console.log('🔄 Detected issue update, refreshing stats...');
                refetchIssueStats();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [refetchIssueStats]);

    // Listen for custom events for same-tab updates
    useEffect(() => {
        const handleIssueUpdate = () => {
            console.log('🔄 Issue updated, refreshing stats...');
            refetchIssueStats();
        };

        window.addEventListener('issue-updated', handleIssueUpdate);
        window.addEventListener('assignee-changed', handleIssueUpdate);

        return () => {
            window.removeEventListener('issue-updated', handleIssueUpdate);
            window.removeEventListener('assignee-changed', handleIssueUpdate);
        };
    }, [refetchIssueStats]);

    // Prevent hydration issues
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle scroll effect
    useEffect(() => {
        if (!mounted) return;

        const handleScroll = () => {
            if (typeof window !== 'undefined') {
                setIsScrolled(window.scrollY > 0);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [mounted]);

    // Close menus when clicking outside
    useEffect(() => {
        if (!mounted) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearch(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen, mounted]);

    // ✅ FIX 5: Show loading state during hydration and session loading
    if (!mounted || status === 'loading') {
        return (
            <nav className="bg-white backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center space-x-3 text-violet-600">
                                <FaBug className="h-8 w-8" />
                                <div className="hidden sm:block">
                                    <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                        IssueTracker
                                    </span>
                                    <div className="text-xs text-gray-500 -mt-1">Pro</div>
                                </div>
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="hidden sm:block">
                                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className={classnames(
            "bg-white backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300",
            {
                "shadow-lg": isScrolled,
                "shadow-sm": !isScrolled
            }
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center space-x-3 text-violet-600 hover:text-violet-700 transition-colors group">
                            <div className="relative">
                                <FaBug className="h-8 w-8 transition-transform duration-300 group-hover:rotate-12" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                    IssueTracker
                                </span>
                                <div className="text-xs text-gray-500 -mt-1">Pro</div>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:block ml-8">
                            <NavLinks issueCount={issueStats.total} />
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <SearchButton
                            showSearch={showSearch}
                            setShowSearch={setShowSearch}
                            searchRef={searchRef}
                        />
                        <NotificationBell
                            showNotifications={showNotifications}
                            setShowNotifications={setShowNotifications}
                            notificationRef={notificationRef}
                        />
                        <QuickActions />
                        <AuthStatus
                            isProfileMenuOpen={isProfileMenuOpen}
                            setIsProfileMenuOpen={setIsProfileMenuOpen}
                            profileMenuRef={profileMenuRef}
                            session={session}
                            status={status}
                            onRefreshSession={refreshSession}
                        />
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 hover:bg-gray-100 transition-colors duration-200 rounded-lg"
                        >
                            <div className={`transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}>
                                {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-4 py-4 space-y-4">
                            <MobileNavLinks issueCount={issueStats.total} />
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-3">
                                    <SearchButton
                                        showSearch={showSearch}
                                        setShowSearch={setShowSearch}
                                        searchRef={searchRef}
                                    />
                                    <NotificationBell
                                        showNotifications={showNotifications}
                                        setShowNotifications={setShowNotifications}
                                        notificationRef={notificationRef}
                                    />
                                </div>
                                <AuthStatus
                                    isProfileMenuOpen={isProfileMenuOpen}
                                    setIsProfileMenuOpen={setIsProfileMenuOpen}
                                    profileMenuRef={profileMenuRef}
                                    session={session}
                                    status={status}
                                    onRefreshSession={refreshSession}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

// Fixed SearchButton with actual functionality
const SearchButton = ({ showSearch, setShowSearch, searchRef }: {
    showSearch: boolean;
    setShowSearch: (show: boolean) => void;
    searchRef: React.RefObject<HTMLDivElement>;
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/issues/list?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowSearch(false);
            setSearchQuery('');
        }
    };

    return (
        <div className="relative" ref={searchRef}>
            <button
                onClick={() => setShowSearch(!showSearch)}
                className="relative hover:bg-gray-100 transition-all duration-200 p-2 rounded-lg"
                title="Search issues"
            >
                <FaSearch className="h-4 w-4 text-gray-600" />
            </button>

            {showSearch && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl rounded-xl z-50 p-4">
                    <form onSubmit={handleSearch} className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Issues
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter keywords to search..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={!searchQuery.trim()}
                                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowSearch(false)}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

// Fixed NotificationBell with actual functionality
const NotificationBell = ({ showNotifications, setShowNotifications, notificationRef }: {
    showNotifications: boolean;
    setShowNotifications: (show: boolean) => void;
    notificationRef: React.RefObject<HTMLDivElement>;
}) => {
    // Mock notifications - replace with real data
    const notifications = [
        { id: 1, title: "Issue #123 was assigned to you", time: "2 minutes ago", read: false },
        { id: 2, title: "New comment on Issue #456", time: "1 hour ago", read: false },
        { id: 3, title: "Issue #789 was closed", time: "3 hours ago", read: true },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative" ref={notificationRef}>
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative hover:bg-gray-100 transition-all duration-200 p-2 rounded-lg"
                title="Notifications"
            >
                <FaBell className="h-4 w-4 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl rounded-xl z-50 max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            <span className="text-sm text-gray-500">{unreadCount} unread</span>
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <FaBell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'
                                            }`} />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900">{notification.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-200">
                        <button
                            onClick={() => setShowNotifications(false)}
                            className="w-full text-center text-sm text-violet-600 hover:text-violet-700 font-medium"
                        >
                            View All Notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const QuickActions = () => (
    <Link
        href="/issues/new"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
    >
        <FaPlus className="h-4 w-4" />
        <span className="hidden lg:inline">New Issue</span>
    </Link>
);

// Fixed NavLinks with dynamic issue count
const NavLinks = ({ issueCount }: { issueCount: number }) => {
    const links = [
        { label: "Dashboard", href: "/", icon: FaChartBar, badge: null },
        { label: "Issues", href: "/issues/list", icon: FaList, badge: issueCount > 0 ? issueCount.toString() : null },
    ];

    const currentPath = usePathname();

    return (
        <div className="flex space-x-1">
            {links.map((link) => {
                const isActive = link.href === currentPath;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={classnames(
                            "relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                            {
                                "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 shadow-sm": isActive,
                                "text-gray-600 hover:text-violet-600 hover:bg-gray-50": !isActive,
                            }
                        )}
                        title={`Navigate to ${link.label}`}
                    >
                        <link.icon className="h-4 w-4" />
                        <span>{link.label}</span>
                        {link.badge && (
                            <span className="ml-2 bg-violet-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                {link.badge}
                            </span>
                        )}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full" />
                        )}
                    </Link>
                );
            })}
        </div>
    );
};

// Fixed MobileNavLinks with dynamic issue count
const MobileNavLinks = ({ issueCount }: { issueCount: number }) => {
    const links = [
        { label: "Dashboard", href: "/", icon: FaChartBar, badge: null },
        { label: "Issues", href: "/issues/list", icon: FaList, badge: issueCount > 0 ? issueCount.toString() : null },
        { label: "New Issue", href: "/issues/new", icon: FaPlus, badge: null },
    ];

    const currentPath = usePathname();

    return (
        <div className="space-y-1">
            {links.map((link) => {
                const isActive = link.href === currentPath;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={classnames(
                            "flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                            {
                                "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700": isActive,
                                "text-gray-600 hover:text-violet-600 hover:bg-gray-50": !isActive,
                            }
                        )}
                    >
                        <div className="flex items-center space-x-3">
                            <link.icon className="h-5 w-5" />
                            <span>{link.label}</span>
                        </div>
                        {link.badge && (
                            <span className="bg-violet-600 text-white text-xs px-2 py-1 rounded-full">
                                {link.badge}
                            </span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
};

// ✅ FIX 6: Enhanced AuthStatus component with session refresh
interface AuthStatusProps {
    isProfileMenuOpen: boolean;
    setIsProfileMenuOpen: (open: boolean) => void;
    profileMenuRef: React.RefObject<HTMLDivElement>;
    session: any;
    status: string;
    onRefreshSession: () => Promise<void>;
}

const AuthStatus = ({
    isProfileMenuOpen,
    setIsProfileMenuOpen,
    profileMenuRef,
    session,
    status,
    onRefreshSession
}: AuthStatusProps) => {
    const [mounted, setMounted] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset image error when session changes
    useEffect(() => {
        setImageError(false);
    }, [session?.user?.image]);

    if (!mounted || status === "loading") {
        return (
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="hidden sm:block">
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <Link
                href="/api/auth/signin"
                className="inline-flex items-center space-x-2 border border-violet-200 text-violet-600 hover:bg-violet-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
            >
                <FaSignInAlt className="h-4 w-4" />
                <span>Sign In</span>
            </Link>
        );
    }

    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

    // Determine which image to use with error handling
    const imageSource = imageError || !session?.user?.image ? defaultAvatar : session.user.image;

    return (
        <div className="relative" ref={profileMenuRef}>
            <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 transition-all duration-200 rounded-xl"
            >
                <div className="relative w-8 h-8">
                    <Image
                        src={imageSource}
                        alt={session?.user?.name || "User"}
                        fill
                        className="rounded-full border-2 border-gray-200 hover:border-violet-300 transition-colors object-cover"
                        unoptimized={imageError || !session?.user?.image}
                        onError={() => {
                            console.log('Image failed to load, using fallback');
                            setImageError(true);
                        }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                </div>
                <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {session?.user?.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[120px]">
                        {session?.user?.email || 'user@example.com'}
                    </div>
                </div>
                <FiChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-xl z-50">
                    <div className="p-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="relative w-10 h-10">
                                <Image
                                    src={imageSource}
                                    alt={session?.user?.name || "User"}
                                    fill
                                    className="rounded-full border-2 border-gray-200 object-cover"
                                    unoptimized={imageError || !session?.user?.image}
                                    onError={() => setImageError(true)}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                    {session?.user?.name || 'User'}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {session?.user?.email || 'user@example.com'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="py-2">
                        <button className="flex items-center w-full p-3 hover:bg-gray-50 transition-colors text-left">
                            <FaUser className="h-4 w-4 mr-3 text-gray-600" />
                            <span className="text-sm">Profile Settings</span>
                        </button>
                        <button className="flex items-center w-full p-3 hover:bg-gray-50 transition-colors text-left">
                            <FaCog className="h-4 w-4 mr-3 text-gray-600" />
                            <span className="text-sm">Preferences</span>
                        </button>
                        <button
                            onClick={onRefreshSession}
                            className="flex items-center w-full p-3 hover:bg-gray-50 transition-colors text-left"
                        >
                            <FiChevronDown className="h-4 w-4 mr-3 text-gray-600" />
                            <span className="text-sm">Refresh Session</span>
                        </button>
                    </div>

                    <div className="border-t border-gray-200 py-2">
                        <Link
                            href="/api/auth/signout"
                            className="flex items-center w-full p-3 text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <FaSignOutAlt className="h-4 w-4 mr-3" />
                            <span className="text-sm">Sign Out</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;