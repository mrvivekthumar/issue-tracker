
import { Button, Flex } from '@radix-ui/themes'
import Link from 'next/link'
import IssueStatusFileter from './IssueStatusFileter'

const IssueAction = () => {
    return (
        <Flex justify='between' >
            <IssueStatusFileter />
            <Button><Link href="/issues/new">New Issue</Link></Button>
        </Flex>
    )
}

export default IssueAction