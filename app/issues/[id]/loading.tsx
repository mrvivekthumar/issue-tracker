import { Box, Card, Flex } from '@radix-ui/themes'
import { Skeleton } from "@/app/components"

const LoadingIsuueDetailPage = () => {
    return (
        <Box className='max-w-lg'>
            <Skeleton />
            <Flex my='3' gap='4'>
                <Skeleton width="5rem" />
                <Skeleton width="8rem" />
            </Flex>
            <Card className='prose' mt='4'>
                <Skeleton />
            </Card>
        </Box>
    )
}

export default LoadingIsuueDetailPage