import IssueStatusBadge from '@/app/components/IssueStatusBadge'
import { Issue } from '@prisma/client'
import { Card, Flex, Heading, Text } from '@radix-ui/themes'
import ReactMarkdown from 'react-markdown'

const IssueDetails = ({ issue }: { issue: Issue }) => {
    return (
        <div>
            <Heading>{issue.title}</Heading>
            <Flex my='3' gap='4'>
                <IssueStatusBadge status={issue.status} />
                <Text>{issue.createdAt.toDateString()}</Text>
            </Flex>
            <Card className='prose max-w-full' mt='4'>
                <ReactMarkdown>{issue.description}</ReactMarkdown>
            </Card>
        </div>
    )
}

export default IssueDetails