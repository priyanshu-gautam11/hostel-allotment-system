import { useCallback, useEffect, useState } from "react";

import ApplicationFilters from "../components/ApplicationFilters";
import ApplicationsTable from "../components/ApplicationsTable";

import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

import { getApplications } from "../services/adminService";

function ApplicationsPage() {
    const [applications, setApplications] = useState([]);

    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getApplications();
            setApplications(data || []);
        } catch (err) {
            console.error("Applications loading error:", err);
            setError(
                import.meta.env.DEV
                    ? `Failed to load applications: ${err.message}`
                    : "Unable to load applications. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const filteredApplications = applications.filter((application) => {
        const matchesStatus =
            statusFilter === "all" ||
            application.status === statusFilter;

        const searchLower = search.trim().toLowerCase();
        const matchesSearch =
            !searchLower ||
            String(application.studentName || "").toLowerCase().includes(searchLower) ||
            String(application.studentEmail || "").toLowerCase().includes(searchLower) ||
            String(application.rollNo || "").toLowerCase().includes(searchLower);

        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return <LoadingState message="Loading applications database..." />;
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <ErrorState message={error} onRetry={fetchApplications} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Manage Student Applications
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Search, filter, and inspect student admission applications across all statuses.
                        </p>
                    </div>

                    <button
                        onClick={fetchApplications}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm transition shadow-sm"
                    >
                        ↻ Refresh Applications
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <ApplicationFilters
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                        search={search}
                        onSearchChange={setSearch}
                    />
                </div>

                {filteredApplications.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
                        <EmptyState
                            title={
                                applications.length === 0
                                    ? "No Applications Found"
                                    : "No Matching Applications"
                            }
                            description={
                                applications.length === 0
                                    ? "There are currently no student applications in the database."
                                    : "Try changing your search term or status filter."
                            }
                        />
                    </div>
                ) : (
                    <ApplicationsTable applications={filteredApplications} />
                )}
            </div>
        </div>
    );
}

export default ApplicationsPage;
