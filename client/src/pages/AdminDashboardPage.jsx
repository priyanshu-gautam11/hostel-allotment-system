import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAdminStats } from "../services/adminService";

import StatCard from "../components/StatCard";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch real admin statistics from MongoDB
    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminStats();
            setStats(data);
        } catch (err) {
            console.error("Admin dashboard error:", err);
            setError(
                import.meta.env.DEV
                    ? `Failed to load statistics: ${err.message}`
                    : "Unable to load dashboard statistics. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return <LoadingState message="Loading live Admin Dashboard statistics..." />;
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <ErrorState message={error} onRetry={fetchStats} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-indigo-900 rounded-2xl p-8 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="inline-block px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full text-xs font-semibold mb-2">
                            SYSTEM ADMINISTRATION
                        </div>
                        <h1 className="text-3xl font-extrabold">Hostel Administration Dashboard</h1>
                        <p className="mt-1 text-slate-300 text-sm">
                            Live system metrics, application verification pipeline, and room allocation engine.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/admin/verification"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-sm"
                        >
                            Review Applications ({stats?.pending ?? 0})
                        </Link>
                        <Link
                            to="/admin/allotment"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-sm"
                        >
                            Allotment Engine →
                        </Link>
                    </div>
                </div>

                {/* Primary Stats Grid */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>📊</span> Real-Time Application Statistics
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard
                            title="Total Applications"
                            value={stats?.totalApplications}
                            subtitle="All Time"
                            color="blue"
                            icon="📝"
                        />
                        <StatCard
                            title="Pending Verification"
                            value={stats?.pending}
                            subtitle="Action Needed"
                            color="yellow"
                            icon="⏳"
                        />
                        <StatCard
                            title="Verified Applications"
                            value={stats?.verified}
                            subtitle="Ready for Allotment"
                            color="green"
                            icon="✅"
                        />
                        <StatCard
                            title="Rejected Applications"
                            value={stats?.rejected}
                            subtitle="Denied"
                            color="red"
                            icon="❌"
                        />
                    </div>
                </div>

                {/* Bed & Hostel Inventory */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>🛏️</span> Bed Inventory & Occupancy
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard
                            title="Total Capacity"
                            value={stats?.totalBeds}
                            subtitle={`${stats?.totalHostels ?? 6} Hostels`}
                            color="indigo"
                            icon="🏢"
                        />
                        <StatCard
                            title="Available (Free) Beds"
                            value={stats?.freeBeds}
                            subtitle="Ready for Allocation"
                            color="green"
                            icon="🟢"
                        />
                        <StatCard
                            title="Occupied Beds"
                            value={stats?.occupiedBeds}
                            subtitle="Currently In Use"
                            color="purple"
                            icon="🛏️"
                        />
                        <StatCard
                            title="Active Waitlist"
                            value={stats?.waitlistCount}
                            subtitle="Awaiting Vacancy"
                            color="yellow"
                            icon="📋"
                        />
                    </div>
                </div>

                {/* Quick Management Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Management Modules</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link
                            to="/admin/verification"
                            className="p-5 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition bg-gradient-to-br from-white to-blue-50/30 group"
                        >
                            <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">🔍</span>
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">
                                Verification Queue
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Review student marksheets, verify claimed CGPA, and approve or reject submissions.
                            </p>
                        </Link>

                        <Link
                            to="/admin/allotment"
                            className="p-5 rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-md transition bg-gradient-to-br from-white to-emerald-50/30 group"
                        >
                            <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">⚙️</span>
                            <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition">
                                Allotment Engine
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Run fair allocation preview, verify tie-breaking and disabled student rules, and publish offers.
                            </p>
                        </Link>

                        <Link
                            to="/admin/vacancies"
                            className="p-5 rounded-xl border border-gray-200 hover:border-purple-500 hover:shadow-md transition bg-gradient-to-br from-white to-purple-50/30 group"
                        >
                            <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">🚪</span>
                            <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition">
                                Vacancy & Waitlist
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Release occupied beds, view the real waitlist queue, and promote waiting students.
                            </p>
                        </Link>

                        <Link
                            to="/admin/audit"
                            className="p-5 rounded-xl border border-gray-200 hover:border-slate-500 hover:shadow-md transition bg-gradient-to-br from-white to-slate-50/30 group"
                        >
                            <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">📜</span>
                            <h3 className="font-bold text-gray-900 group-hover:text-slate-800 transition">
                                Audit History
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Complete append-only audit trail tracking every verification, publish, decline, and bed release.
                            </p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardPage;
