
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, role }) {
    const { user } = useAuth();

    // Check whether the user is logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check whether the user has the required role
    if (role && user.role !== role) {
        return <Navigate to="/student" replace />;
    }

    return children;
}

export default ProtectedRoute;