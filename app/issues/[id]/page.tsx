import authOptions from '@/app/auth/authOptions';
import prisma from '@/prisma/client';
import { Box, Flex, Grid } from '@radix-ui/themes';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';
import DeleteIssueButton from './DeleteIssueButton';
import EditIssueButton from './EditIssueButton';
import IssueDetails from './IssueDetails';
import AssigneeSelect from './AssigneeSelect';

interface Props {
    params: { id: string }
}

const IssueDetailPage = async ({ params }: Props) => {

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({}, { status: 401 })
    }

    const issue = await prisma.issue.findUnique({
        where: {
            id: parseInt(params.id)
        }
    });

    if (!issue) {
        notFound();
    }


    return (
        <Grid columns={{ initial: "1", sm: "5" }} gap='5'>
            <Box className='md:col-span-4'>
                <IssueDetails issue={issue} />
            </Box>
            {session && <Box>
                <Flex direction='column' gap='4'>
                    <AssigneeSelect />
                    <EditIssueButton issueId={issue.id} />
                    <DeleteIssueButton issueId={issue.id} />
                </Flex>
            </Box>}
        </Grid>
    )
}

export default IssueDetailPage;