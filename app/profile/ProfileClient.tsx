"use client"

import { useAuth } from '@/context/AuthContext'
import { Box, Typography } from '@mui/material'

export default function ProfileClient() {
    const { user } = useAuth()
    
    const userFirstTwoLetters = user?.email?.slice(0, 2).toUpperCase() || "??"
    const userEmail = user?.email ? (user.email.charAt(0).toUpperCase() + user.email.slice(1)) : "Guest User"

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(160deg, #f0f4ff 0%, #fafafa 55%, #f0fff4 100%)",
                px: { xs: 2, sm: 3, md: 5, lg: 8 },
                py: { xs: 3, sm: 4, md: 5 },
            }}
        >
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
                <Typography
                    sx={{
                        fontWeight: 800,
                        fontSize: { xs: "1.6rem", sm: "2rem", md: "2.4rem" },
                        background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "inline-block",
                        letterSpacing: "-0.5px",
                        lineHeight: 1.1,
                    }}
                >
                    My Profile
                </Typography>
                <Typography sx={{ color: "#888", fontSize: "0.92rem", mt: 0.6 }}>
                    Access your profile in one step
                </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "center", md: "flex-start" } }}>
                <Box sx={{
                    p: 5, border: 1, borderRadius: "50%",
                    width: "100px", height: "100px",
                    display: "flex", justifyContent: "center",
                    alignItems: "center"
                }}>
                    <Typography sx={{
                        fontWeight: 800,
                        fontSize: { xs: "1.6rem", sm: "2rem", md: "2.4rem" },
                        background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "inline-block",
                        letterSpacing: "-0.5px",
                        lineHeight: 1.1,
                    }}>
                        {userFirstTwoLetters}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: { xs: "center", md: "left" }}}>
                    <Typography sx={{
                        fontWeight: 800,
                        fontSize: { xs: "0.6rem", sm: "1rem", md: "1.2rem" },
                    }}>
                        {userEmail}
                    </Typography>
                    <Typography sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.6rem", sm: "1rem", md: "1.2rem" },
                    }}>
                        {user?.role}
                    </Typography>
                </Box>
            </Box>
        </Box>

    )
}