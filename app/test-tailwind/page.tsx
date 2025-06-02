// Create app/test-tailwind/page.tsx

export default function TestTailwindPage() {
    return (
        <div className="p-8 space-y-4">
            <h1 className="text-4xl font-bold text-center mb-8">
                Tailwind CSS Test Page
            </h1>

            {/* Test 1: Custom CSS (should show lime green) */}
            <div className="test-css">
                Test 1: Custom CSS - Should be LIME GREEN with RED BORDER
            </div>

            {/* Test 2: Basic Tailwind Colors */}
            <div className="bg-red-500 text-white p-4 rounded">
                Test 2: bg-red-500 - Should be RED
            </div>

            <div className="bg-blue-500 text-white p-4 rounded">
                Test 3: bg-blue-500 - Should be BLUE
            </div>

            <div className="bg-green-500 text-white p-4 rounded">
                Test 4: bg-green-500 - Should be GREEN
            </div>

            <div className="bg-yellow-500 text-black p-4 rounded">
                Test 5: bg-yellow-500 - Should be YELLOW
            </div>

            <div className="bg-purple-500 text-white p-4 rounded">
                Test 6: bg-purple-500 - Should be PURPLE
            </div>

            {/* Test 3: More Complex Tailwind */}
            <div className="bg-gradient-to-r from-pink-500 to-violet-500 text-white p-6 rounded-lg shadow-lg">
                Test 7: Complex Gradient - Should be PINK to VIOLET gradient
            </div>

            {/* Test 4: Responsive & Hover */}
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transform hover:scale-105 transition-all">
                Test 8: Interactive Button - Should be INDIGO and hover effects
            </button>

            {/* Test 5: Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-orange-400 p-4 rounded text-white text-center">
                    Grid 1: ORANGE
                </div>
                <div className="bg-teal-400 p-4 rounded text-white text-center">
                    Grid 2: TEAL
                </div>
                <div className="bg-rose-400 p-4 rounded text-white text-center">
                    Grid 3: ROSE
                </div>
            </div>

            {/* Debug Information */}
            <div className="mt-8 p-4 border-2 border-gray-400 rounded bg-gray-100">
                <h3 className="font-bold text-lg mb-2">Debug Info:</h3>
                <p><strong>What you should see:</strong></p>
                <ul className="list-disc ml-6 space-y-1">
                    <li>Test 1: Lime green background (custom CSS working)</li>
                    <li>Tests 2-6: Different colored backgrounds (basic Tailwind)</li>
                    <li>Test 7: Pink to violet gradient (advanced Tailwind)</li>
                    <li>Test 8: Blue button with hover effects (interactive Tailwind)</li>
                    <li>Grid: Three colored boxes in responsive layout</li>
                </ul>
            </div>
        </div>
    );
}