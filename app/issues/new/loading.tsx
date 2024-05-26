import { Box } from '@radix-ui/themes'
import { Skeleton } from "@/app/components"

const NewIssueLoading = () => {
    return (

        <Box className='max-w-xl'>
            <Skeleton height='3rem' />
            <Skeleton height='17rem' />
        </Box>
    )
}

export default NewIssueLoading