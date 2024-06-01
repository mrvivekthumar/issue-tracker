'use client';
import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";
import { Button, Flex, Text } from "@radix-ui/themes";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
    itemCount: number;
    pageSize: number;
    currentPage: number;
}

const Pagination = ({ itemCount, pageSize, currentPage }: Props) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pageCount = Math.ceil(itemCount / pageSize);

    const chagePage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push("?" + params.toString());
    }

    if (pageCount <= 1) {
        return null;
    }

    return (

        <Flex gap='2' align='center'>
            <Text size='2'>{currentPage} of {pageCount}</Text>
            <Button variant="soft" color="gray" disabled={currentPage === 1} onClick={() => chagePage(1)}>
                <DoubleArrowLeftIcon />
            </Button>
            <Button variant="soft" color="gray" disabled={currentPage === 1} onClick={() => chagePage(currentPage - 1)}>
                <ChevronLeftIcon />
            </Button>
            <Button variant="soft" color="gray" disabled={currentPage === pageCount} onClick={() => chagePage(currentPage + 1)}>
                <ChevronRightIcon />
            </Button>
            <Button variant="soft" color="gray" disabled={currentPage === pageCount} onClick={() => chagePage(pageCount)}>
                <DoubleArrowRightIcon />
            </Button>
        </Flex >
    )
}

export default Pagination