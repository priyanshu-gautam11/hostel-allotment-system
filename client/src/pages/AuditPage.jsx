import { useCallback, useEffect, useState } from "react";
import { getAuditLogs } from "../services/adminService";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

function AuditPage() {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionFilter, setActionFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getAuditLogs(1, 100);
            setLogs(response.data || []);
            setTotal(response.total || 0);
        } catch (err) {
            console.error("Audit log error:", err);
            setError(err.message || "Failed to load audit history.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const filteredLogs = logs.filter((log) => {
        const matchesAction =
            actionFilter === "all" || log.action === actionFilter;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            !searchTerm.trim() ||
            log.action.toLowerCase().includes(searchLower) ||
            log.actorName.toLowerCase().includes(searchLower) ||
            log.entityId.toLowerCase().includes(searchLower);
        return matchesAction && matchesSearch;
    });

    const uniqueActions = Array.from(new Set(logs.map((l) => l.action))).sort();

    if (loading) {
        return <LoadingState message="Loading system audit log history..." />;
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <ErrorState message={error} onRetry={fetchLogs} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            System Audit History
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Immutable, append-only log of all system and administrative transactions ({total} records total).
                        </p>
                    </div>

                    <button
                        onClick={fetchLogs}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm transition shadow-sm"
                    >
                        ↻ Refresh Logs
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Search by action, actor, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                            Action Filter:
                        </label>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Actions ({logs.length})</option>
                            {uniqueActions.map((action) => (
                                <option key={action} value={action}>
                                    {action}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Audit Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredLogs.length === 0 ? (
                        <div className="p-12">
                            <EmptyState
                                title="No Audit Records Found"
                                description="No transactions match your current search or action filter."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="py-3 px-4">Timestamp</th>
                                        <th className="py-3 px-4">Action</th>
                                        <th className="py-3 px-4">Actor</th>
                                        <th className="py-3 px-4">Entity</th>
                                        <th className="py-3 px-4">Details / Changes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/70 transition">
                                            <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>

                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        log.action.includes("VERIF")
                                                            ? "bg-green-100 text-green-800"
                                                            : log.action.includes("REJECT") || log.action.includes("DENIED")
                                                            ? "bg-red-100 text-red-800"
                                                            : log.action.includes("PUBLISH") || log.action.includes("ALLOT")
                                                            ? "bg-purple-100 text-purple-800"
                                                            : log.action.includes("RELEASE")
                                                            ? "bg-amber-100 text-amber-800"
                                                            : "bg-blue-100 text-blue-800"
                                                    }`}
                                                >
                                                    {log.action}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4 text-gray-800">
                                                <span className="font-medium block">{log.actorName}</span>
                                                <span className="text-xs text-gray-500">{log.actorType}</span>
                                            </td>

                                            <td className="py-3 px-4">
                                                <span className="font-medium text-gray-900 block">{log.entityType}</span>
                                                <span className="text-xs text-gray-400 font-mono">#{log.entityId}</span>
                                            </td>

                                            <td className="py-3 px-4 text-xs font-mono text-gray-700 max-w-md truncate">
                                                {log.after ? (
                                                    <pre className="bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto text-xs font-mono whitespace-pre-wrap max-h-24">
                                                        {JSON.stringify(log.after, null, 2)}
                                                    </pre>
                                                ) : log.before ? (
                                                    <pre className="bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto text-xs font-mono whitespace-pre-wrap max-h-24">
                                                        {JSON.stringify(log.before, null, 2)}
                                                    </pre>
                                                ) : (
                                                    <span className="text-gray-400 italic">No state delta</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuditPage;
