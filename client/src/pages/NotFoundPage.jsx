import { Link } from "react-router-dom";

function NotFoundPage() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
            <span className="text-6xl font-extrabold text-blue-600 mb-2">404</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-500 max-w-sm mb-6">
                The page you are looking for doesn't exist or has been moved to another location.
            </p>
            <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm shadow-sm transition"
            >
                Return to Dashboard
            </Link>
        </div>
    );
}

export default NotFoundPage;
