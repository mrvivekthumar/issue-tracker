"use client";
import { Box } from '@radix-ui/themes';
import classnames from 'classnames';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBug } from "react-icons/fa6";

const links = [
    { label: "dashboard", href: "/" },
    { label: "Issues", href: "/issues/list" },
]
const Navbar = () => {

    const currentPath = usePathname();
    const { status, data: session } = useSession();

    return (
        <nav className='flex space-x-8 mx-5 mb-5 border-b h-14 items-center'>
            <Link href="/" className='text-black'><FaBug /></Link>
            <ul className='flex space-x-8'>
                {links.map((link) =>
                    <li key={link.href}>
                        <Link
                            className={classnames({
                                "text-zinc-900": link.href === currentPath,
                                "text-zinc-500": link.href !== currentPath,
                                "hover:text-zinc-950 transition-colors": true
                            })
                            }
                            href={link.href} > {link.label}
                        </Link>
                    </li>
                )}
            </ul>
            <Box>
                {status === 'authenticated' && <Link href='/api/auth/signout'>Sign out</Link>}
                {status === 'unauthenticated' && <Link href='/api/auth/signin'>Signin</Link>}
            </Box>
        </nav >
    )
}

export default Navbar   