"use client";
import classnames from 'classnames';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBug, FaPlus, FaList, FaChartBar, FaUser, FaSignOutAlt, FaSignInAlt, FaBell, FaSearch, FaCog } from "react-icons/fa";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Prevent hydration issues
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle scroll effect - only after component mounts
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
            if (isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen, mounted]);

    // Show consistent loading state during hydration
    if (!mounted) {
        return (
            <nav className="bg-white backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and Brand */}
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

                        {/* Loading skeleton for auth */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="hidden sm:block w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
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
                            <NavLinks />
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <SearchButton />
                        <NotificationBell />
                        <QuickActions />
                        <AuthStatus
                            isProfileMenuOpen={isProfileMenuOpen}
                            setIsProfileMenuOpen={setIsProfileMenuOpen}
                            profileMenuRef={profileMenuRef}
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
                            <MobileNavLinks />
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-3">
                                    <SearchButton />
                                    <NotificationBell />
                                </div>
                                <AuthStatus
                                    isProfileMenuOpen={isProfileMenuOpen}
                                    setIsProfileMenuOpen={setIsProfileMenuOpen}
                                    profileMenuRef={profileMenuRef}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

const SearchButton = () => (
    <button className="relative hover:bg-gray-100 transition-all duration-200 p-2 rounded-lg" title="Search issues">
        <FaSearch className="h-4 w-4 text-gray-600" />
    </button>
);

const NotificationBell = () => (
    <button className="relative hover:bg-gray-100 transition-all duration-200 p-2 rounded-lg" title="Notifications">
        <FaBell className="h-4 w-4 text-gray-600" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
            3
        </span>
    </button>
);

const QuickActions = () => (
    <Link
        href="/issues/new"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
    >
        <FaPlus className="h-4 w-4" />
        <span className="hidden lg:inline">New Issue</span>
    </Link>
);

const NavLinks = () => {
    const links = [
        { label: "Dashboard", href: "/", icon: FaChartBar, badge: null },
        { label: "Issues", href: "/issues/list", icon: FaList, badge: "12" },
        { label: "Analytics", href: "/analytics", icon: FaChartBar, badge: null },
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
                            <span className="ml-2 bg-violet-600 text-white text-xs px-2 py-1 rounded-full">
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

const MobileNavLinks = () => {
    const links = [
        { label: "Dashboard", href: "/", icon: FaChartBar, badge: null },
        { label: "Issues", href: "/issues/list", icon: FaList, badge: "12" },
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

interface AuthStatusProps {
    isProfileMenuOpen: boolean;
    setIsProfileMenuOpen: (open: boolean) => void;
    profileMenuRef: React.RefObject<HTMLDivElement>;
}

const AuthStatus = ({ isProfileMenuOpen, setIsProfileMenuOpen, profileMenuRef }: AuthStatusProps) => {
    const { status, data: session } = useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by showing consistent loading state
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

    return (
        <div className="relative" ref={profileMenuRef}>
            <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 transition-all duration-200 rounded-xl"
            >
                <div className="relative w-8 h-8">
                    <Image
                        src={session?.user?.image || defaultAvatar}
                        alt={session?.user?.name || "User"}
                        fill
                        className="rounded-full border-2 border-gray-200 hover:border-violet-300 transition-colors object-cover"
                        unoptimized={!session?.user?.image}
                        onError={() => {
                            // Handle error by falling back to default avatar
                            // Note: Next.js Image component handles this differently
                        }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
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
                            <Image
                                src={session?.user?.image || defaultAvatar}
                                alt={session?.user?.name || "User"}
                                fill
                                className="rounded-full border-2 border-gray-200 hover:border-violet-300 transition-colors object-cover"
                                unoptimized={!session?.user?.image}
                                onError={() => {
                                    // Handle error by falling back to default avatar
                                    // Note: Next.js Image component handles this differently
                                }}
                            />
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