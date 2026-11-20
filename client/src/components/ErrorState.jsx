const ErrorState = ({ message = "Something went wrong.", onRetry }) => {
    return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="mb-2 text-lg font-semibold text-red-700">
                Something went wrong
            </div>

            <p className="text-red-600">
                {message}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 rounded-lg bg-red-600 px-5 py-2 font-medium text-white transition hover:bg-red-700"
                >
                    Try again
                </button>
            )}
        </div>
    );
};

export default ErrorState;