import { Routes, Route, Navigate } from "react-router-dom";

// Layout and Route Protection
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// Authentication Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

// Student Pages
import StudentDashboardPage from "./pages/StudentDashboardPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import BedMapPage from "./pages/BedMapPage";
import NotificationsPage from "./pages/NotificationsPage";
import StudentOfferPage from "./pages/StudentOfferPage";

// Admin Pages
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import VerificationPage from "./pages/VerificationPage";
import AllotmentPage from "./pages/AllotmentPage";
import VacancyPage from "./pages/VacancyPage";
import AuditPage from "./pages/AuditPage";

function App() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* Default Route */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Student Routes */}
                <Route
                    path="/student"
                    element={
                        <ProtectedRoute role="student">
                            <StudentDashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/student/profile"
                    element={
                        <ProtectedRoute role="student">
                            <StudentProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/student/beds"
                    element={
                        <ProtectedRoute role="student">
                            <BedMapPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/student/notifications"
                    element={
                        <ProtectedRoute role="student">
                            <NotificationsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/student/offer"
                    element={
                        <ProtectedRoute role="student">
                            <StudentOfferPage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminDashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/applications"
                    element={
                        <ProtectedRoute role="admin">
                            <ApplicationsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/verification"
                    element={
                        <ProtectedRoute role="admin">
                            <VerificationPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/allotment"
                    element={
                        <ProtectedRoute role="admin">
                            <AllotmentPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/vacancies"
                    element={
                        <ProtectedRoute role="admin">
                            <VacancyPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/audit"
                    element={
                        <ProtectedRoute role="admin">
                            <AuditPage />
                        </ProtectedRoute>
                    }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;
