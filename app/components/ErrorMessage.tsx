import { PropsWithChildren } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const ErrorMessage = ({ children }: PropsWithChildren) => {
    if (!children) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-slide-up">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{children}</span>
        </div>
    )
}

export default ErrorMessage