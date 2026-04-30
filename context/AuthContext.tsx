// src/context/AuthContext.tsx

"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

import { useRouter } from "next/navigation"

type User = {
    name: string;
    email: string;
    role: string;
};

type LoginValues = {
    email: string;
    password: string;
    role: string
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (values: LoginValues) => { success: boolean; message?: string };
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter()

    useEffect(() => {
        const session = localStorage.getItem("famwallet_session");

        if (session) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser(JSON.parse(session));
        }

        setLoading(false);
    }, []);

    const login = (values: LoginValues) => {
        const users: {
            name: string;
            email: string;
            password: string;
            role: string;
        }[] = JSON.parse(
            localStorage.getItem("famwallet_users") || "[]"
        );

        const existingUser = users.find((u) =>
            u.email === values.email.toLowerCase() &&
            u.password === values.password &&
            u.role === values.role
        );

        if (!existingUser) {
            return {
                success: false,
                message: "Invalid email or password",
            };
        }

        const loggedInUser = {
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
        };

        localStorage.setItem(
            "famwallet_session",
            JSON.stringify(loggedInUser)
        );

        setUser(loggedInUser);

        return { success: true };
    };

    const logout = () => {
        localStorage.removeItem("famwallet_session");
        router.replace("/login")
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}