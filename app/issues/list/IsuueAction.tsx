import Link from 'next/link'
import IssueStatusFileter from './IssueStatusFileter'
import { FiPlus } from 'react-icons/fi'

const IssueAction = () => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <IssueStatusFileter />
            <Link
                href="/issues/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
                <FiPlus className="w-4 h-4" />
                New Issue
            </Link>
        </div>
    )
}

export default IssueAction