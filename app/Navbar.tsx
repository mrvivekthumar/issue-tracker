import Link from 'next/link'
import React from 'react'
import { FaBug } from "react-icons/fa6";

const links = [
    { label: "dashboard", href: "/" },
    { label: "Issues", href: "/issues" },
]

const Navbar = () => {
    return (
        <nav className='flex space-x-8 mx-5 mb-5 border-b h-14 items-center'>
            <Link href="/" className='text-black'><FaBug /></Link>
            <ul className='flex space-x-8'>
                {links.map((link) => <li>
                    <Link key={link.href}
                        className=' text-zinc-500 hover:text-zinc-950 transition-colors'
                        href={link.href}>{link.label}</Link></li>)
                }
            </ul>
        </nav>
    )
}

export default Navbar   