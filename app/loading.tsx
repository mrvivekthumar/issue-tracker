export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50 flex items-center justify-center">
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-200 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
                <p className="text-gray-600">Please wait while we load your content</p>
            </div>
        </div>
    );
}