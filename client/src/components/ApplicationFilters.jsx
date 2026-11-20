function ApplicationFilters({
    statusFilter,
    onStatusChange,
    search,
    onSearchChange,
}) {
    return (
        <div className="application-filters">
            <select
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value)}
            >
                <option value="all">All</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
            </select>

            <input
                type="text"
                placeholder="Search student by name..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    );
}

export default ApplicationFilters;