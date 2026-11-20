const EmptyState = ({
    title = "Nothing here yet",
    description = "There is no data to display.",
}) => {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
            <div className="mb-2 text-lg font-semibold text-gray-700">
                {title}
            </div>

            <p className="text-gray-500">
                {description}
            </p>
        </div>
    );
};

export default EmptyState;