'use client';
import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";
import { Button, Flex, Text, Select } from "@radix-ui/themes";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from 'react';

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
        <div
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
        >
            <Flex justify="between" align="center" wrap="wrap" gap="4">
                {/* Results Information */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Text size="2" className="text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
                        <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
                        <span className="font-semibold text-gray-900">{itemCount}</span> results
                    </Text>

                    {/* Page Size Selector */}
                    {showPageSizeSelector && (
                        <Flex align="center" gap="2">
                            <Text size="2" className="text-gray-600 whitespace-nowrap">
                                Items per page:
                            </Text>
                            <Select.Root
                                value={pageSize.toString()}
                                onValueChange={(value) => changePageSize(parseInt(value))}
                                size="1"
                            >
                                <Select.Trigger className="min-w-[70px]" />
                                <Select.Content>
                                    {pageSizeOptions.map((size) => (
                                        <Select.Item key={size} value={size.toString()}>
                                            {size}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>
                        </Flex>
                    )}
                </div>

                {/* Navigation Controls */}
                <Flex align="center" gap="1">
                    {/* First Page */}
                    <Button
                        variant="soft"
                        color="gray"
                        disabled={currentPage === 1}
                        onClick={() => changePage(1)}
                        className="hidden sm:flex transition-all duration-200 hover:scale-105"
                        size="2"
                        title="First page"
                    >
                        <DoubleArrowLeftIcon />
                    </Button>

                    {/* Previous Page */}
                    <Button
                        variant="soft"
                        color="gray"
                        disabled={currentPage === 1}
                        onClick={() => changePage(currentPage - 1)}
                        className="transition-all duration-200 hover:scale-105"
                        size="2"
                        title="Previous page"
                    >
                        <ChevronLeftIcon />
                    </Button>

                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                        {/* Show ellipsis if we're not showing the first page */}
                        {visiblePages[0] > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="2"
                                    onClick={() => changePage(1)}
                                    className="w-8 h-8 p-0 transition-all duration-200 hover:scale-105"
                                >
                                    1
                                </Button>
                                {visiblePages[0] > 2 && (
                                    <Text size="2" className="px-1 text-gray-400">
                                        ...
                                    </Text>
                                )}
                            </>
                        )}

                        {/* Visible page numbers */}
                        {visiblePages.map((page) => (
                            <div
                                key={page}
                            >
                                <Button
                                    variant={currentPage === page ? "solid" : "ghost"}
                                    color={currentPage === page ? "violet" : "gray"}
                                    size="2"
                                    onClick={() => changePage(page)}
                                    className="w-8 h-8 p-0 transition-all duration-200"
                                    disabled={currentPage === page}
                                >
                                    {page}
                                </Button>
                            </div>
                        ))}

                        {/* Show ellipsis if we're not showing the last page */}
                        {visiblePages[visiblePages.length - 1] < pageCount && (
                            <>
                                {visiblePages[visiblePages.length - 1] < pageCount - 1 && (
                                    <Text size="2" className="px-1 text-gray-400">
                                        ...
                                    </Text>
                                )}
                                <Button
                                    variant="ghost"
                                    size="2"
                                    onClick={() => changePage(pageCount)}
                                    className="w-8 h-8 p-0 transition-all duration-200 hover:scale-105"
                                >
                                    {pageCount}
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile page indicator */}
                    <div className="sm:hidden">
                        <Text size="2" className="px-2 py-1 bg-gray-100 rounded-md text-gray-700 font-medium">
                            {currentPage} / {pageCount}
                        </Text>
                    </div>

                    {/* Next Page */}
                    <Button
                        variant="soft"
                        color="gray"
                        disabled={currentPage === pageCount}
                        onClick={() => changePage(currentPage + 1)}
                        className="transition-all duration-200 hover:scale-105"
                        size="2"
                        title="Next page"
                    >
                        <ChevronRightIcon />
                    </Button>

                    {/* Last Page */}
                    <Button
                        variant="soft"
                        color="gray"
                        disabled={currentPage === pageCount}
                        onClick={() => changePage(pageCount)}
                        className="hidden sm:flex transition-all duration-200 hover:scale-105"
                        size="2"
                        title="Last page"
                    >
                        <DoubleArrowRightIcon />
                    </Button>
                </Flex>
            </Flex>
        </div>
    );
};

export default Pagination;