"use client";
import { Avatar, Box, Container, DropdownMenu, Flex, Text, Button } from '@radix-ui/themes';
import classnames from 'classnames';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBug, FaPlus, FaList, FaChartBar, FaUser, FaSignOutAlt, FaSignInAlt } from "react-icons/fa";
import { Skeleton } from '@/app/components';
import { useState } from 'react';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
            <Container>
                <div className="px-4 sm:px-6 lg:px-8">
                    <Flex justify="between" align="center" className="h-16">
                        {/* Logo and Brand */}
                        <Flex align="center" gap="4">
                            <Link href="/" className="flex items-center space-x-2 text-violet-600 hover:text-violet-700 transition-colors">
                                <FaBug className="h-8 w-8" />
                                <span className="text-xl font-bold hidden sm:block">IssueTracker</span>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden md:block ml-8">
                                <NavLinks />
                            </div>
                        </Flex>

                        {/* Desktop Auth Status */}
                        <div className="hidden md:block">
                            <AuthStatus />
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </Button>
                        </div>
                    </Flex>

                    {/* Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden border-t border-gray-200 pt-4 pb-4">
                            <div className="space-y-1">
                                <MobileNavLinks />
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <AuthStatus />
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </nav>
    );
};

const NavLinks = () => {
    const links = [
        {
            label: "Dashboard",
            href: "/",
            icon: FaChartBar,
            description: "Overview and statistics"
        },
        {
            label: "Issues",
            href: "/issues/list",
            icon: FaList,
            description: "View all issues"
        },
        {
            label: "New Issue",
            href: "/issues/new",
            icon: FaPlus,
            description: "Create new issue"
        },
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
                            "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                            {
                                "bg-violet-100 text-violet-700 shadow-sm": isActive,
                                "text-gray-600 hover:text-violet-600 hover:bg-gray-50": !isActive,
                            }
                        )}
                        title={link.description}
                    >
                        <link.icon className="h-4 w-4" />
                        <span>{link.label}</span>
                    </Link>
                );
            })}
        </div>
    );
};

const MobileNavLinks = () => {
    const links = [
        { label: "Dashboard", href: "/", icon: FaChartBar },
        { label: "Issues", href: "/issues/list", icon: FaList },
        { label: "New Issue", href: "/issues/new", icon: FaPlus },
    ];

    const currentPath = usePathname();

    return (
        <>
            {links.map((link) => {
                const isActive = link.href === currentPath;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={classnames(
                            "flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium",
                            {
                                "bg-violet-100 text-violet-700": isActive,
                                "text-gray-600 hover:text-violet-600 hover:bg-gray-50": !isActive,
                            }
                        )}
                    >
                        <link.icon className="h-5 w-5" />
                        <span>{link.label}</span>
                    </Link>
                );
            })}
        </>
    );
};

const AuthStatus = () => {
    const { status, data: session } = useSession();

    if (status === "loading") {
        return (
            <div className="flex items-center space-x-2">
                <Skeleton width="2rem" height="2rem" className="rounded-full" />
                <Skeleton width="5rem" height="1rem" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <Link href="/api/auth/signin">
                <Button variant="outline" className="flex items-center space-x-2">
                    <FaSignInAlt className="h-4 w-4" />
                    <span>Sign In</span>
                </Button>
            </Link>
        );
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                    <Avatar
                        src={session?.user?.image || ""}
                        fallback={session?.user?.name?.[0] || "?"}
                        size="2"
                        radius="full"
                        className="cursor-pointer border-2 border-gray-200 hover:border-violet-300 transition-colors"
                    />
                    <div className="hidden sm:block text-left">
                        <Text size="2" weight="medium" className="text-gray-900">
                            {session?.user?.name}
                        </Text>
                        <Text size="1" className="text-gray-500 block">
                            {session?.user?.email}
                        </Text>
                    </div>
                </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content align="end" className="w-56">
                <DropdownMenu.Label>
                    <div className="flex flex-col space-y-1">
                        <Text size="2" weight="medium">{session?.user?.name}</Text>
                        <Text size="1" className="text-gray-500">{session?.user?.email}</Text>
                    </div>
                </DropdownMenu.Label>

                <DropdownMenu.Separator />

                <DropdownMenu.Item>
                    <FaUser className="h-4 w-4 mr-2" />
                    Profile
                </DropdownMenu.Item>

                <DropdownMenu.Separator />

                <DropdownMenu.Item>
                    <Link href="/api/auth/signout" className="flex items-center w-full text-red-600">
                        <FaSignOutAlt className="h-4 w-4 mr-2" />
                        Sign Out
                    </Link>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
};

export default Navbar;