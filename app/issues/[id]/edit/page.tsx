import prisma from '@/prisma/client';
import { notFound } from 'next/navigation';
import IssueForm from '../../_components/IssueFrom';
interface Props {
    params: { id: string }
}

const EditIssuePage = async ({ params }: Props) => {

    const issue = await prisma.issue.findUnique({
        where: { id: parseInt(params.id) }
    });

    if (!issue) {
        notFound();
    }
    return (
        <div><IssueForm issue={issue} /></div>
    )
}

export default EditIssuePage