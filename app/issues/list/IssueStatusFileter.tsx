'use client'
import { Status } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiFilter } from "react-icons/fi";

const statuses: { label: string, value: string }[] = [
    { label: "All", value: 'ALL' },
    { label: "Open", value: 'OPEN' },
    { label: "In Progress", value: 'IN_PROGRESS' },
    { label: "Closed", value: 'CLOSED' },
];

type ExtendedStatus = Status | 'ALL';

const IssueStatusFileter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentStatus = searchParams.get('status') || 'ALL';
    const currentLabel = statuses.find(s => s.value === currentStatus)?.label || 'Filter by status...';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusChange = (status: ExtendedStatus) => {
        const params = new URLSearchParams();

        if (status && status !== 'ALL') {
            params.append('status', status);
        }

        if (searchParams.get('orderBy')) {
            params.append('orderBy', searchParams.get('orderBy')!)
        }

        const query = params.size ? '?' + params.toString() : "";
        router.push('/issues/list' + query);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 shadow-sm hover:shadow-md min-w-[200px] justify-between"
            >
                <div className="flex items-center gap-2">
                    <FiFilter className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 font-medium">{currentLabel}</span>
                </div>
                <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-slide-up">
                    <div className="py-1">
                        {statuses.map((status) => (
                            <button
                                key={status.value}
                                onClick={() => handleStatusChange(status.value as ExtendedStatus)}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${currentStatus === status.value
                                    ? 'bg-violet-50 text-violet-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    {status.value !== 'ALL' && (
                                        <div className={`w-2 h-2 rounded-full ${status.value === 'OPEN' ? 'bg-red-500' :
                                            status.value === 'IN_PROGRESS' ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`} />
                                    )}
                                    <span>{status.label}</span>
                                    {currentStatus === status.value && (
                                        <div className="ml-auto w-2 h-2 bg-violet-600 rounded-full" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default IssueStatusFileter