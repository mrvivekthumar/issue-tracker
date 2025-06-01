import NextLink from "next/link";
import { ReactNode } from "react";

interface Props {
    href: string;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

const Link = ({ href, children, className = "", onClick }: Props) => {
    return (
        <NextLink 
            href={href} 
            onClick={onClick}
            className={`text-violet-600 hover:text-violet-700 transition-colors duration-200 font-medium hover:underline ${className}`}
        >
            {children}
        </NextLink>
    )
}

export default Link