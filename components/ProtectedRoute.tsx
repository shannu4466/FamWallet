"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

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

    if (loading) return <p>Loading...</p>;

    return (
        <>
            {!isPublic && <Navbar />}
            <main style={{ minHeight: "100vh", padding: "24px" }}>
                {children}
            </main>
        </>
    );
}