import { useState } from "react";
import { tokenStorage } from "../services/apiClient";

function ApplicationsTable({ applications }) {
    const [openingId, setOpeningId] = useState(null);
    const [documentError, setDocumentError] = useState("");

    const handleViewMarksheet = async (application) => {
        let newTab = null;
        let objectUrl = null;

        try {
            setOpeningId(application.id);
            setDocumentError("");

            // Get the saved authentication token.
            const token = tokenStorage.get();

            if (!token) {
                throw new Error("Your session has expired. Please log in again.");
            }

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "http://127.0.0.1:5000/api";

            // Open a tab immediately to prevent popup blocking.
            newTab = window.open("about:blank", "_blank");

            if (!newTab) {
                throw new Error("Please allow pop-ups in your browser.");
            }

            newTab.document.write(`
                <html>
                    <head><title>Loading Marksheet</title></head>
                    <body style="font-family:Arial;padding:30px">
                        <h3>Loading marksheet...</h3>
                        <p>Please wait.</p>
                    </body>
                </html>
            `);

            // Fetch marksheet with JWT authentication.
            const response = await fetch(
                `${API_URL}/applications/${application.id}/marksheet`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                let message = `Request failed (${response.status}).`;

                try {
                    const data = await response.json();
                    message = data.message || message;
                } catch {
                    // Keep fallback error.
                }

                throw new Error(message);
            }

            const blob = await response.blob();

            if (!blob.size) {
                throw new Error("The marksheet file is empty.");
            }

            objectUrl = URL.createObjectURL(blob);

            // Display the authenticated document.
            newTab.location.replace(objectUrl);

            // Revoke the temporary URL after five minutes.
            setTimeout(() => {
                URL.revokeObjectURL(objectUrl);
            }, 300000);

        } catch (error) {
            console.error("Marksheet Error:", error);

            if (newTab && !newTab.closed) {
                newTab.close();
            }

            setDocumentError(error.message);

        } finally {
            setOpeningId(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {documentError && (
                <div className="m-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <strong>Marksheet Error:</strong> {documentError}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">

                    <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="py-3 px-4">Student</th>
                            <th className="py-3 px-4">Roll Number</th>
                            <th className="py-3 px-4">Course & Sem</th>
                            <th className="py-3 px-4">CGPA (Claimed / Verified)</th>
                            <th className="py-3 px-4">Preference</th>
                            <th className="py-3 px-4">Accessibility</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Document</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">

                        {applications.length > 0 ? (
                            applications.map((app) => (
                                <tr
                                    key={app.id}
                                    className="hover:bg-gray-50/70 transition"
                                >

                                    <td className="py-3 px-4">
                                        <span className="font-semibold text-gray-900 block">
                                            {app.studentName}
                                        </span>

                                        <span className="text-xs text-gray-400 block font-mono">
                                            {app.studentEmail}
                                        </span>
                                    </td>

                                    <td className="py-3 px-4 font-mono text-xs text-gray-700">
                                        {app.rollNo || "—"}
                                    </td>

                                    <td className="py-3 px-4 text-gray-800">
                                        {app.course || "—"}

                                        {app.semester && (
                                            <span className="text-xs text-gray-500 block">
                                                Sem {app.semester}
                                            </span>
                                        )}
                                    </td>

                                    <td className="py-3 px-4 font-mono">
                                        <span className="text-gray-900 font-bold">
                                            {app.claimedCgpa ?? "—"}
                                        </span>

                                        {" / "}

                                        <span className={
                                            app.verifiedCgpa !== null &&
                                            app.verifiedCgpa !== undefined
                                                ? "text-emerald-600 font-bold"
                                                : "text-gray-400 italic"
                                        }>
                                            {app.verifiedCgpa ?? "Pending"}
                                        </span>
                                    </td>

                                    <td className="py-3 px-4 capitalize text-gray-700">
                                        {app.preferences?.[0]?.hostelType || "Single"} (
                                        {app.preferences?.[0]?.mode || "preferred"})
                                    </td>

                                    <td className="py-3 px-4">
                                        {app.isPhysicallyDisabled ? (
                                            <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                                                Ground Floor Required
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                Standard
                                            </span>
                                        )}
                                    </td>

                                    <td className="py-3 px-4">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                                            app.status === "verified"
                                                ? "bg-green-100 text-green-700"
                                                : app.status === "rejected"
                                                ? "bg-red-100 text-red-700"
                                                : app.status === "allotted"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-yellow-100 text-yellow-700"
                                        }`}>
                                            {app.status}
                                        </span>
                                    </td>

                                    <td className="py-3 px-4">
                                        {app.marksheet ? (
                                            <button
                                                type="button"
                                                onClick={() => handleViewMarksheet(app)}
                                                disabled={openingId === app.id}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline disabled:opacity-50"
                                            >
                                                {openingId === app.id
                                                    ? "Opening..."
                                                    : "View Marksheet ↗"}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                None
                                            </span>
                                        )}
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="py-8 text-center text-gray-500"
                                >
                                    No applications match your selected filters.
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ApplicationsTable;