import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { tokenStorage } from "../services/apiClient";
import { getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            if (!tokenStorage.get()) {
                setAuthLoading(false);
                return;
            }

            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                tokenStorage.clear();
                setUser(null);
            } finally {
                setAuthLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        tokenStorage.clear();
        setUser(null);
    };

    if (authLoading) {
        return (
            <div className="p-8 text-gray-600">
                Checking your session...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}