import { FiEdit } from 'react-icons/fi'
import Link from 'next/link'

const EditIssueButton = ({ issueId }: { issueId: number }) => {
    return (
        <Link
            href={`/issues/edit/${issueId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
            <FiEdit className="w-4 h-4" />
            Edit Issue
        </Link>
    )
}

export default EditIssueButton