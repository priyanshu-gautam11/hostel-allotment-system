import { useCallback, useEffect, useState } from "react";

import { getHostels } from "../services/hostelService";
import { getBeds } from "../services/bedService";

import HostelMap from "../components/HostelMap";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import "../styles/bedMap.css";

function BedMapPage() {
    const [hostels, setHostels] = useState([]);
    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadBedMap = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [hostelData, bedData] = await Promise.all([
                getHostels(),
                getBeds(),
            ]);

            setHostels(hostelData);
            setBeds(bedData);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load hostel bed map.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBedMap();
    }, [loadBedMap]);

    if (loading) {
        return <LoadingState message="Loading interactive bed and room occupancy map..." />;
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <ErrorState message={error} onRetry={loadBedMap} />
            </div>
        );
    }

    const freeBeds = beds.filter((bed) => bed.status === "available").length;
    const offeredBeds = beds.filter((bed) => bed.status === "offered").length;
    const occupiedBeds = beds.filter((bed) => bed.status === "occupied").length;
    const blockedBeds = beds.filter((bed) => bed.status === "blocked").length;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Campus Hostel Bed Map
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Real-time room and bed availability visualizer across all floors.
                        </p>
                    </div>

                    <button
                        onClick={loadBedMap}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm transition shadow-sm"
                    >
                        ↻ Refresh Map
                    </button>
                </div>

                {/* Stat Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs">
                        <span className="text-xs text-gray-500 font-bold uppercase block">Total Beds</span>
                        <span className="text-2xl font-extrabold text-gray-900">{beds.length}</span>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4 border border-green-200 shadow-xs">
                        <span className="text-xs text-green-700 font-bold uppercase block">Available Beds</span>
                        <span className="text-2xl font-extrabold text-green-700">{freeBeds}</span>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 shadow-xs">
                        <span className="text-xs text-amber-700 font-bold uppercase block">Offered Beds</span>
                        <span className="text-2xl font-extrabold text-amber-700">{offeredBeds}</span>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 shadow-xs">
                        <span className="text-xs text-purple-700 font-bold uppercase block">Occupied Beds</span>
                        <span className="text-2xl font-extrabold text-purple-700">{occupiedBeds}</span>
                    </div>

                    <div className="bg-gray-100 rounded-xl p-4 border border-gray-300 shadow-xs">
                        <span className="text-xs text-gray-600 font-bold uppercase block">Blocked Beds</span>
                        <span className="text-2xl font-extrabold text-gray-800">{blockedBeds}</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-white rounded-xl p-3 border border-gray-200 flex flex-wrap items-center gap-6 text-xs font-semibold text-gray-700">
                    <span className="text-gray-400 uppercase tracking-wider text-[11px]">Legend:</span>
                    <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block"></span> Available
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block"></span> Offer Pending
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded bg-purple-600 inline-block"></span> Occupied
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded bg-gray-400 inline-block"></span> Blocked
                    </span>
                </div>

                {/* Hostels Grids */}
                <div className="space-y-8">
                    {hostels
                        .filter((hostel) => hostel.active)
                        .sort((a, b) => a.fillOrder - b.fillOrder)
                        .map((hostel) => (
                            <div key={hostel._id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <HostelMap
                                    hostel={hostel}
                                    beds={beds.filter(
                                        (bed) =>
                                            String(bed.hostelId?._id || bed.hostelId) ===
                                            String(hostel._id)
                                    )}
                                />
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

export default BedMapPage;
