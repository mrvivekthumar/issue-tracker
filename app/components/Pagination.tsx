'use client';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiChevronDown } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useRef, useEffect } from 'react';

interface PaginationProps {
    itemCount: number;
    pageSize: number;
    currentPage: number;
    showPageSizeSelector?: boolean;
    pageSizeOptions?: number[];
    onPageSizeChange?: (pageSize: number) => void;
    maxVisiblePages?: number;
}

const Pagination = ({
    itemCount,
    pageSize,
    currentPage,
    showPageSizeSelector = true,
    pageSizeOptions = [5, 10, 20, 50],
    onPageSizeChange,
    maxVisiblePages = 5
}: PaginationProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pageCount = Math.ceil(itemCount / pageSize);
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsPageSizeOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changePage = useCallback((page: number) => {
        const params = new URLSearchParams();
        // Copy existing search params
        searchParams.forEach((value, key) => {
            params.set(key, value);
        });
        params.set('page', page.toString());
        router.push("?" + params.toString());
    }, [router, searchParams]);

    const changePageSize = useCallback((newPageSize: number) => {
        const params = new URLSearchParams();
        // Copy existing search params
        searchParams.forEach((value, key) => {
            params.set(key, value);
        });
        params.set('pageSize', newPageSize.toString());
        params.set('page', '1'); // Reset to first page when changing page size
        router.push("?" + params.toString());
        onPageSizeChange?.(newPageSize);
        setIsPageSizeOpen(false);
    }, [router, searchParams, onPageSizeChange]);

    // Calculate visible page numbers
    const visiblePages = useMemo(() => {
        if (pageCount <= maxVisiblePages) {
            return Array.from({ length: pageCount }, (_, i) => i + 1);
        }

        const halfVisible = Math.floor(maxVisiblePages / 2);
        let start = Math.max(1, currentPage - halfVisible);
        let end = Math.min(pageCount, start + maxVisiblePages - 1);

        // Adjust start if we're near the end
        if (end === pageCount) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [currentPage, pageCount, maxVisiblePages]);

    // Calculate display information
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, itemCount);

    if (pageCount <= 1) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 animate-fade-in">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                {/* Results Information */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
                        <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
                        <span className="font-semibold text-gray-900">{itemCount}</span> results
                    </p>

                    {/* Page Size Selector */}
                    {showPageSizeSelector && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                                Items per page:
                            </span>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                                    className="inline-flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors duration-200 min-w-[70px] justify-between"
                                >
                                    <span>{pageSize}</span>
                                    <FiChevronDown className={`w-3 h-3 transition-transform duration-200 ${isPageSizeOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isPageSizeOpen && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[70px] animate-slide-up">
                                        <div className="py-1">
                                            {pageSizeOptions.map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => changePageSize(size)}
                                                    className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${pageSize === size
                                                        ? 'bg-violet-50 text-violet-700 font-medium'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center gap-1">
                    {/* First Page */}
                    <button
                        disabled={currentPage === 1}
                        onClick={() => changePage(1)}
                        className="hidden sm:flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                        title="First page"
                    >
                        <FiChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Previous Page */}
                    <button
                        disabled={currentPage === 1}
                        onClick={() => changePage(currentPage - 1)}
                        className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                        title="Previous page"
                    >
                        <FiChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                        {/* Show ellipsis if we're not showing the first page */}
                        {visiblePages[0] > 1 && (
                            <>
                                <button
                                    onClick={() => changePage(1)}
                                    className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                                >
                                    1
                                </button>
                                {visiblePages[0] > 2 && (
                                    <span className="px-1 text-gray-400 text-sm">...</span>
                                )}
                            </>
                        )}

                        {/* Visible page numbers */}
                        {visiblePages.map((page) => (
                            <button
                                key={page}
                                onClick={() => changePage(page)}
                                disabled={currentPage === page}
                                className={`flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-all duration-200 ${currentPage === page
                                    ? 'bg-violet-600 text-white shadow-lg'
                                    : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:scale-105'
                                    } disabled:cursor-default disabled:hover:scale-100`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Show ellipsis if we're not showing the last page */}
                        {visiblePages[visiblePages.length - 1] < pageCount && (
                            <>
                                {visiblePages[visiblePages.length - 1] < pageCount - 1 && (
                                    <span className="px-1 text-gray-400 text-sm">...</span>
                                )}
                                <button
                                    onClick={() => changePage(pageCount)}
                                    className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                                >
                                    {pageCount}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile page indicator */}
                    <div className="sm:hidden">
                        <span className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700 font-medium">
                            {currentPage} / {pageCount}
                        </span>
                    </div>

                    {/* Next Page */}
                    <button
                        disabled={currentPage === pageCount}
                        onClick={() => changePage(currentPage + 1)}
                        className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                        title="Next page"
                    >
                        <FiChevronRight className="w-4 h-4" />
                    </button>

                    {/* Last Page */}
                    <button
                        disabled={currentPage === pageCount}
                        onClick={() => changePage(pageCount)}
                        className="hidden sm:flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                        title="Last page"
                    >
                        <FiChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;