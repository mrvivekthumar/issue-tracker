"use client";
import classnames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBug } from "react-icons/fa6";

const links = [
    { label: "dashboard", href: "/" },
    { label: "Issues", href: "/issues" },
]
const Navbar = () => {

    const currentPath = usePathname();
    return (
        <nav className='flex space-x-8 mx-5 mb-5 border-b h-14 items-center'>
            <Link href="/" className='text-black'><FaBug /></Link>
            <ul className='flex space-x-8'>
                {links.map((link) =>
                    <Link key={link.href}
                        className={classnames({
                            "text-zinc-900": link.href === currentPath,
                            "text-zinc-500": link.href !== currentPath,
                            "hover:text-zinc-950 transition-colors": true
                        })
                        }
                        href={link.href} > {link.label}
                    </Link>
                )}
            </ul>
        </nav >
    )
}

export default Navbar   