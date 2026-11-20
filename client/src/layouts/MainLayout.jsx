import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MainLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const studentNavItems = [
        { to: "/student", label: "Dashboard", end: true },
        { to: "/student/profile", label: "Profile & Application" },
        { to: "/student/beds", label: "Bed Map" },
        { to: "/student/offer", label: "Allotment Offer" },
        { to: "/student/notifications", label: "Notifications" },
    ];

    const adminNavItems = [
        { to: "/admin", label: "Dashboard", end: true },
        { to: "/admin/applications", label: "Applications" },
        { to: "/admin/verification", label: "Verification" },
        { to: "/admin/allotment", label: "Allotment Engine" },
        { to: "/admin/vacancies", label: "Vacancies & Waitlist" },
        { to: "/admin/audit", label: "Audit Logs" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and Brand */}
                        <div className="flex items-center">
                            <NavLink
                                to={user ? (user.role === "admin" ? "/admin" : "/student") : "/login"}
                                className="flex items-center gap-2.5 text-blue-700 font-extrabold text-lg tracking-tight"
                            >
                                <span className="text-2xl">🏢</span>
                                <span>Hostel Portal</span>
                            </NavLink>
                        </div>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {user && user.role === "student" &&
                                studentNavItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            `px-3 py-2 rounded-lg text-sm font-medium transition ${
                                                isActive
                                                    ? "bg-blue-50 text-blue-700 font-semibold"
                                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                            }`
                                        }
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}

                            {user && user.role === "admin" &&
                                adminNavItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            `px-3 py-2 rounded-lg text-sm font-medium transition ${
                                                isActive
                                                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                            }`
                                        }
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}

                            {!user && (
                                <>
                                    <NavLink
                                        to="/login"
                                        className={({ isActive }) =>
                                            `px-3 py-2 rounded-lg text-sm font-medium transition ${
                                                isActive
                                                    ? "bg-blue-50 text-blue-700 font-semibold"
                                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                            }`
                                        }
                                    >
                                        Login
                                    </NavLink>
                                    <NavLink
                                        to="/register"
                                        className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition"
                                    >
                                        Register
                                    </NavLink>
                                </>
                            )}
                        </nav>

                        {/* User Profile & Logout */}
                        {user && (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex flex-col text-right">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {user.name || user.email}
                                    </span>
                                    <span className="text-xs text-gray-500 capitalize">
                                        {user.role} Account
                                    </span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 transition"
                                >
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Sub-Navigation Bar for Small Screens */}
                {user && (
                    <div className="md:hidden border-t border-gray-100 px-4 py-2 flex overflow-x-auto space-x-2 text-xs">
                        {user.role === "student" &&
                            studentNavItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `px-2.5 py-1.5 rounded-md whitespace-nowrap transition ${
                                            isActive
                                                ? "bg-blue-600 text-white font-semibold"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}

                        {user.role === "admin" &&
                            adminNavItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `px-2.5 py-1.5 rounded-md whitespace-nowrap transition ${
                                            isActive
                                                ? "bg-indigo-600 text-white font-semibold"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
