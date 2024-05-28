
import { Button, Flex } from '@radix-ui/themes'
import Link from 'next/link'
import IssueStatusFileter from './IssueStatusFileter'

const NewIssueButton = () => {
    return (
        <Flex mb='5' justify='between' >
            <IssueStatusFileter />
            <Button><Link href="/issues/new">New Issue</Link></Button>
        </Flex>
    )
}

export default NewIssueButton