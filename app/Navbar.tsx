"use client";
import { Avatar, Box, Container, DropdownMenu, Flex, Text, Button, Badge } from '@radix-ui/themes';
import classnames from 'classnames';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBug, FaPlus, FaList, FaChartBar, FaUser, FaSignOutAlt, FaSignInAlt, FaBell, FaSearch, FaCog } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import { Skeleton } from '@/app/components';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setIsMobileMenuOpen(false);
        };

        if (isMobileMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isMobileMenuOpen]);

    return (
        <nav
            className={classnames(
                "bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 animate-slide-up",
                {
                    "shadow-lg": isScrolled,
                    "shadow-sm": !isScrolled
                }
            )}
        >
            <Container>
                <div className="px-4 sm:px-6 lg:px-8">
                    <Flex justify="between" align="center" className="h-16">
                        {/* Logo and Brand */}
                        <Flex align="center" gap="4">
                            <div className="hover-lift">
                                <Link href="/" className="flex items-center space-x-3 text-violet-600 hover:text-violet-700 transition-colors group">
                                    <div className="relative">
                                        <FaBug className="h-8 w-8 transition-transform duration-300 group-hover:rotate-12" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="hidden sm:block">
                                        <span className="text-xl font-bold gradient-text">
                                            IssueTracker
                                        </span>
                                        <div className="text-xs text-gray-500 -mt-1">Pro</div>
                                    </div>
                                </Link>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden lg:block ml-8">
                                <NavLinks />
                            </div>
                        </Flex>

                        {/* Desktop Actions */}
                        <Flex align="center" gap="3" className="hidden md:flex">
                            <SearchButton />
                            <NotificationBell />
                            <QuickActions />
                            <AuthStatus />
                        </Flex>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMobileMenuOpen(!isMobileMenuOpen);
                                }}
                                className="p-2 hover:bg-gray-100 transition-colors duration-200"
                            >
                                <div className={`transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}>
                                    {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
                                </div>
                            </Button>
                        </div>
                    </Flex>

                    {/* Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <div
                            className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md animate-slide-up"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-4 py-4 space-y-4">
                                <MobileNavLinks />
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <SearchButton />
                                        <NotificationBell />
                                    </div>
                                    <AuthStatus />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </nav>
    );
};

const SearchButton = () => (
    <div className="hover-lift">
        <Button
            variant="ghost"
            size="2"
            className="relative hover:bg-gray-100 transition-all duration-200"
            title="Search issues"
        >
            <FaSearch className="h-4 w-4 text-gray-600" />
        </Button>
    </div>
);

const NotificationBell = () => (
    <div className="hover-lift">
        <Button
            variant="ghost"
            size="2"
            className="relative hover:bg-gray-100 transition-all duration-200"
            title="Notifications"
        >
            <FaBell className="h-4 w-4 text-gray-600" />
            <Badge
                size="1"
                className="absolute -top-1 -right-1 bg-red-500 text-white min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold animate-pulse"
            >
                3
            </Badge>
        </Button>
    </div>
);

const QuickActions = () => (
    <div className="hover-lift">
        <Button
            asChild
            className="btn-animate bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 shadow-md"
            size="2"
        >
            <Link href="/issues/new" className="flex items-center gap-2">
                <FaPlus className="h-4 w-4" />
                <span className="hidden lg:inline">New Issue</span>
            </Link>
        </Button>
    </div>
);

const NavLinks = () => {
    const links = [
        {
            label: "Dashboard",
            href: "/",
            icon: FaChartBar,
            description: "Overview and analytics",
            badge: null
        },
        {
            label: "Issues",
            href: "/issues/list",
            icon: FaList,
            description: "Browse all issues",
            badge: "12"
        },
        {
            label: "Analytics",
            href: "/analytics",
            icon: FaChartBar,
            description: "Detailed reports",
            badge: null
        },
    ];

    const currentPath = usePathname();

    return (
        <div className="flex space-x-1">
            {links.map((link, index) => {
                const isActive = link.href === currentPath;
                return (
                    <div
                        key={link.href}
                    >
                        <Link
                            href={link.href}
                            className={classnames(
                                "relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                                {
                                    "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 shadow-sm": isActive,
                                    "text-gray-600 hover:text-violet-600 hover:bg-gray-50": !isActive,
                                }
                            )}
                            title={link.description}
                        >
                            <link.icon className="h-4 w-4" />
                            <span>{link.label}</span>
                            {link.badge && (
                                <Badge size="1" className="ml-2 bg-violet-600 text-white">
                                    {link.badge}
                                </Badge>
                            )}
                            {isActive && (
                                <div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full"
                                />
                            )}
                        </Link>
                    </div>
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
            {links.map((link, index) => {
                const isActive = link.href === currentPath;
                return (
                    <div
                        key={link.href}
                    >
                        <Link
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
                                <Badge size="1" className="bg-violet-600 text-white">
                                    {link.badge}
                                </Badge>
                            )}
                        </Link>
                    </div>
                );
            })}
        </div>
    );
};

const AuthStatus = () => {
    const { status, data: session } = useSession();

    if (status === "loading") {
        return (
            <div className="flex items-center space-x-3">
                <Skeleton width="2rem" height="2rem" className="rounded-full" />
                <div className="hidden sm:block">
                    <Skeleton width="5rem" height="1rem" />
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div>
                <Link href="/api/auth/signin">
                    <Button
                        variant="outline"
                        className="flex items-center space-x-2 border-violet-200 text-violet-600 hover:bg-violet-50 transition-all duration-200"
                    >
                        <FaSignInAlt className="h-4 w-4" />
                        <span>Sign In</span>
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <div
                >
                    <Button
                        variant="ghost"
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 transition-all duration-200 rounded-xl"
                    >
                        <div className="relative">
                            <Avatar
                                src={session?.user?.image || ""}
                                fallback={session?.user?.name?.[0] || "?"}
                                size="2"
                                radius="full"
                                className="cursor-pointer border-2 border-gray-200 hover:border-violet-300 transition-colors"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        </div>
                        <div className="hidden sm:block text-left">
                            <Text size="2" weight="medium" className="text-gray-900 block">
                                {session?.user?.name}
                            </Text>
                            <Text size="1" className="text-gray-500 block truncate max-w-[120px]">
                                {session?.user?.email}
                            </Text>
                        </div>
                    </Button>
                </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
                align="end"
                className="w-64 p-2 bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl"
            >
                <DropdownMenu.Label className="p-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <Avatar
                            src={session?.user?.image || ""}
                            fallback={session?.user?.name?.[0] || "?"}
                            size="3"
                            radius="full"
                        />
                        <div className="flex-1 min-w-0">
                            <Text size="3" weight="medium" className="text-gray-900 block truncate">
                                {session?.user?.name}
                            </Text>
                            <Text size="2" className="text-gray-500 block truncate">
                                {session?.user?.email}
                            </Text>
                        </div>
                    </div>
                </DropdownMenu.Label>

                <div className="py-2">
                    <DropdownMenu.Item className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                        <FaUser className="h-4 w-4 mr-3 text-gray-600" />
                        <span>Profile Settings</span>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                        <FaCog className="h-4 w-4 mr-3 text-gray-600" />
                        <span>Preferences</span>
                    </DropdownMenu.Item>
                </div>

                <DropdownMenu.Separator className="my-2 border-gray-200" />

                <DropdownMenu.Item className="p-0">
                    <Link
                        href="/api/auth/signout"
                        className="flex items-center w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <FaSignOutAlt className="h-4 w-4 mr-3" />
                        <span>Sign Out</span>
                    </Link>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
};

export default Navbar;