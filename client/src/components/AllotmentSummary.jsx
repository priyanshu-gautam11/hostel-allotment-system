const AllotmentSummary = ({ rows }) => {
    const allotted = rows.filter(
        (row) => row.outcome === "allotted"
    );

    const waitlisted = rows.filter(
        (row) => row.outcome === "waitlisted"
    );

    const hostelCounts = allotted.reduce((acc, row) => {
        acc[row.hostelId] = (acc[row.hostelId] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">

            <h2 className="text-xl font-bold mb-5 text-gray-800">
                Allotment Summary
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                    <p className="text-gray-500 text-sm">
                        Total Allotted
                    </p>

                    <h3 className="text-3xl font-bold text-green-600">
                        {allotted.length}
                    </h3>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                    <p className="text-gray-500 text-sm">
                        Total Waitlisted
                    </p>

                    <h3 className="text-3xl font-bold text-yellow-600">
                        {waitlisted.length}
                    </h3>
                </div>

            </div>

            <h3 className="font-semibold mt-6 mb-3 text-gray-800">
                Hostel-wise Allotment
            </h3>

            <div className="space-y-3">

                {Object.entries(hostelCounts).map(
                    ([hostelId, count]) => (
                        <div
                            key={hostelId}
                            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                        >
                            <span className="font-medium text-gray-700">
                                Hostel {hostelId}
                            </span>

                            <span className="font-bold text-blue-600">
                                {count} Students
                            </span>
                        </div>
                    )
                )}

                {Object.keys(hostelCounts).length === 0 && (
                    <p className="text-gray-500 text-sm">
                        No hostel allotments available.
                    </p>
                )}

            </div>
        </div>
    );
};

export default AllotmentSummary;