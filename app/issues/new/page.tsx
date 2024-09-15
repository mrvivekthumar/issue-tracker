import dynamic from "next/dynamic"
import IssueFormSkeleton from "../_components/IssueFormSkeleton"

const IssueForm = dynamic(
    () => import('@/app/issues/_components/IssueFrom'),
    {
        ssr: false,
        loading: () => <IssueFormSkeleton />
    }
)

const NewIssuePage = async () => {

    return (
        <div><IssueForm /></div>
    )
}

export default NewIssuePage