"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Box, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";


type Props = {
    children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
    const pathname = usePathname();
    const router = useRouter();

    const { user, loading } = useAuth();

    const publicRoutes = ["/login", "/signup"];
    const isPublic = publicRoutes.includes(pathname);

    useEffect(() => {
        if (loading) return;

        if (user && isPublic) {
            router.replace("/");
            return;
        }

        if (!user && !isPublic) {
            router.replace("/login");
            return;
        }
    }, [loading, user, isPublic, router]);

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "#f8fafc",
                }}
            >
                <Box sx={{ textAlign: "center" }}>
                    <Box
                        sx={{
                            width: 65,
                            height: 65,
                            border: "5px solid #e5e7eb",
                            borderTop: "5px solid #1976D2",
                            borderRight: "5px solid #2E7D32",
                            borderRadius: "50%",
                            mx: "auto",
                            animation: "spin 1s linear infinite",
                            "@keyframes spin": {
                                from: { transform: "rotate(0deg)" },
                                to: { transform: "rotate(360deg)" },
                            },
                        }}
                    />
                    <Typography
                        sx={{
                            mt: 3,
                            fontWeight: 700,
                            fontSize: "1rem",
                            background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Loading...
                    </Typography>
                </Box>
            </Box>
        );
    }


    return (
        <>
            {!isPublic && <Navbar />}
            <main style={{ minHeight: "100vh", padding: "24px" }}>
                {children}
            </main>
        </>
    );
}