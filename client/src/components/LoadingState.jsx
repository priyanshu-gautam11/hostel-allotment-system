const LoadingState = ({ message = "Loading..." }) => {
    return (
        <div className="flex min-h-50 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>

                <p className="text-base font-medium text-blue-600">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingState;