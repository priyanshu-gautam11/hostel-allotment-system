import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import profileSchema from "../validators/profileSchema";
import { submitApplication, getMyApplication } from "../services/applicationService";
import LoadingState from "../components/LoadingState";

function StudentProfilePage() {
    const [existingApplication, setExistingApplication] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            isPhysicallyDisabled: false,
        },
    });

    useEffect(() => {
        const fetchCurrent = async () => {
            try {
                const app = await getMyApplication();
                setExistingApplication(app);
            } catch (err) {
                // No existing application is fine
            } finally {
                setInitialLoading(false);
            }
        };

        fetchCurrent();
    }, []);

    const onSubmit = async (data) => {
        setLoading(true);
        setSuccess("");
        setServerError("");

        try {
            const applicationData = {
                ...data,
                marksheet: data.marksheet[0],
            };

            const result = await submitApplication(applicationData);

            setSuccess(
                "Application submitted successfully! Your application is now under review."
            );
            setExistingApplication(result);
            reset();
        } catch (error) {
            setServerError(error.message || "Application submission failed.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <LoadingState message="Loading your profile details..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
                        <h1 className="text-2xl font-bold">Student Profile & Application</h1>
                        <p className="mt-1 text-blue-100 text-sm">
                            Manage your hostel admission application and room preferences.
                        </p>
                    </div>

                    <div className="p-8">
                        {success && (
                            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 flex items-start">
                                <span className="text-xl mr-3">✓</span>
                                <div>
                                    <p className="font-medium">{success}</p>
                                    <Link
                                        to="/student"
                                        className="mt-2 inline-block text-sm font-semibold text-green-700 underline hover:text-green-900"
                                    >
                                        Go to Student Dashboard →
                                    </Link>
                                </div>
                            </div>
                        )}

                        {serverError && (
                            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 flex items-start">
                                <span className="text-xl mr-3">⚠</span>
                                <div>
                                    <p className="font-medium">Submission Failed</p>
                                    <p className="text-sm mt-0.5">{serverError}</p>
                                </div>
                            </div>
                        )}

                        {/* Existing Application Banner */}
                        {existingApplication && (
                            <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-blue-900">
                                        Active Application on Record
                                    </h2>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                                            existingApplication.status === "verified"
                                                ? "bg-green-200 text-green-800"
                                                : existingApplication.status === "rejected"
                                                ? "bg-red-200 text-red-800"
                                                : existingApplication.status === "allotted"
                                                ? "bg-purple-200 text-purple-800"
                                                : "bg-yellow-200 text-yellow-800"
                                        }`}
                                    >
                                        {existingApplication.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Claimed CGPA</p>
                                        <p className="font-medium text-base text-gray-900">
                                            {existingApplication.claimedCgpa ?? "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Verified CGPA</p>
                                        <p className="font-medium text-base text-gray-900">
                                            {existingApplication.verifiedCgpa ?? "Pending Verification"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Preference</p>
                                        <p className="font-medium capitalize text-gray-900">
                                            {existingApplication.preferences?.[0]?.hostelType}{" "}
                                            seater ({existingApplication.preferences?.[0]?.mode})
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Accessibility Accommodation</p>
                                        <p className="font-medium text-gray-900">
                                            {existingApplication.isPhysicallyDisabled
                                                ? "Yes (Ground Floor Required)"
                                                : "Standard"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-blue-200 flex flex-wrap gap-4 items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="mr-2">📄</span>
                                        <span>
                                            Uploaded Marksheet:{" "}
                                            <strong>
                                                {existingApplication.marksheetOriginalName || existingApplication.marksheet || "Uploaded"}
                                            </strong>
                                        </span>
                                    </div>

                                    {existingApplication._id && (
                                        <a
                                            href={`http://127.0.0.1:5000/api/applications/${existingApplication._id}/marksheet`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-md text-xs font-semibold hover:bg-blue-600 hover:text-white transition"
                                        >
                                            View Marksheet Document ↗
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Submission Form */}
                        {!existingApplication ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Priyanshu Gautam"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        {...register("fullName")}
                                    />
                                    {errors.fullName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Roll Number *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 2400520100059"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            {...register("rollNo")}
                                        />
                                        {errors.rollNo && (
                                            <p className="mt-1 text-sm text-red-600">{errors.rollNo.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Course / Department *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. B.Tech Computer Science"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            {...register("course")}
                                        />
                                        {errors.course && (
                                            <p className="mt-1 text-sm text-red-600">{errors.course.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Current Semester (1-8) *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="8"
                                            placeholder="4"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            {...register("semester", { valueAsNumber: true })}
                                        />
                                        {errors.semester && (
                                            <p className="mt-1 text-sm text-red-600">{errors.semester.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            CGPA (0 - 10) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="10"
                                            placeholder="8.50"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            {...register("cgpa", { valueAsNumber: true })}
                                        />
                                        {errors.cgpa && (
                                            <p className="mt-1 text-sm text-red-600">{errors.cgpa.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Home Distance (KM) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            placeholder="150"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            {...register("distanceKm", { valueAsNumber: true })}
                                        />
                                        {errors.distanceKm && (
                                            <p className="mt-1 text-sm text-red-600">{errors.distanceKm.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Room Allocation Preference *
                                    </label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                                        {...register("preference")}
                                    >
                                        <option value="">Select Room Preference</option>
                                        <option value="single-only">
                                            Single Seater Only (Will not fall back to triple; waitlisted if full)
                                        </option>
                                        <option value="single-preferred">
                                            Single Seater Preferred (Falls back to Triple Seater if Single is full)
                                        </option>
                                        <option value="triple">
                                            Triple Seater (3 students per room)
                                        </option>
                                    </select>
                                    {errors.preference && (
                                        <p className="mt-1 text-sm text-red-600">{errors.preference.message}</p>
                                    )}
                                </div>

                                {/* Physically Disabled Checkbox */}
                                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
                                    <label className="flex items-start cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            {...register("isPhysicallyDisabled")}
                                        />
                                        <div className="ml-3">
                                            <span className="text-sm font-semibold text-gray-900">
                                                Physically Disabled / Require Ground Floor Room
                                            </span>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                Selecting this ensures allocation only in ground-floor rooms (Floor 0) with barrier-free accessibility.
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Upload Marksheet * (PDF, JPG or PNG up to 2 MB)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-lg p-2"
                                        {...register("marksheet")}
                                    />
                                    {errors.marksheet && (
                                        <p className="mt-1 text-sm text-red-600">{errors.marksheet.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {loading ? "Submitting Application..." : "Submit Application"}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-600 text-sm">
                                    You have already submitted an application. If you need modifications, please reach out to the hostel administration.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentProfilePage;
