"use client";
import { Avatar, Box, Container, DropdownMenu, Flex, Text } from '@radix-ui/themes';
import classnames from 'classnames';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBug } from "react-icons/fa6";
import { Skeleton } from '@/app/components'


const Navbar = () => {

    return (
        <nav className='mx-4 py-4 mb-6 border-b  items-center'>
            <Container>
                <Flex justify='between'>
                    <Flex align='center' gap='5'>
                        <Link href="/" className='text-black'><FaBug /></Link>
                        <NavLinks />
                    </Flex>
                    <AuthStatus />
                </Flex>
            </Container>
        </nav >
    )
}

export default Navbar


const NavLinks = () => {

    const links = [
        { label: "dashboard", href: "/" },
        { label: "Issues", href: "/issues/list" },
    ];

    const currentPath = usePathname();

    return (
        <ul className='flex space-x-8' >
            {links.map((link) =>
                <li key={link.href}>
                    <Link
                        className={classnames({
                            "nav-link": true,
                            "!text-zinc-900": link.href === currentPath,

                        })}
                        href={link.href} > {link.label}
                    </Link>
                </li>
            )
            }
        </ul >
    )
}

const AuthStatus = () => {
    const { status, data: session } = useSession();

    if (status === "loading") {
        return <Skeleton width='1.5rem' height='1.5rem' />;
    }

    if (status === "unauthenticated") {
        return <Link className='nav-link' href='/api/auth/signin'>Signin</Link>
    }

    return (
        <Box>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Avatar src={session?.user?.image!} fallback='?' className='cursor-pointer' size='2' radius='full' />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    <DropdownMenu.Label>
                        <Text size='2'>
                            {session?.user?.email}
                        </Text>
                    </DropdownMenu.Label>
                    <DropdownMenu.Item>
                        {status === 'authenticated' && <Link href='/api/auth/signout'>Sign out</Link>}
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </Box>
    )
}