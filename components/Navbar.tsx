"use client"

import CloseIcon from "@mui/icons-material/Close"
import MenuIcon from "@mui/icons-material/Menu"
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import BarChartIcon from '@mui/icons-material/BarChart';
import {
    AppBar,
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material"
import Image from "next/image"
import { useState } from "react"

import famwalletLogo from '../public/famwallet_logo.png'

import { usePathname } from "next/navigation"

import { useAuth } from "@/context/AuthContext";

const navLinks = [
    { label: "Home", href: "/", icon: <HomeIcon /> },
    { label: "Manage Members", href: "/manage-members", icon: <GroupIcon /> },
    { label: "Expense Tracker", href: "/expenses", icon: < CurrencyRupeeIcon /> },
    { label: "Reports", href: "/reports", icon: <BarChartIcon /> },
]

const authLinks = [
    { label: "Login", href: "/login", variant: "outlined" as const },
    { label: "Sign Up", href: "/signup", variant: "contained" as const },
]

export default function Navbar() {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))

    const toggleDrawer = () => setDrawerOpen((prev) => !prev)

    const pathname = usePathname()

    const { user, logout } = useAuth()

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: "white",
                    borderBottom: "1px solid",
                    borderColor: "grey.100",
                }}
            >
                <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 }, py: 1, mb: -1, mt: -1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mt: -3, ml: -5, mb: -2 }} component="a" href="/">
                        <Image src={famwalletLogo} alt="logo" width={200} height={100} />
                    </Box>
                    {/* Desktop navbar */}
                    {!isMobile && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography>{user?.email}</Typography>
                            {navLinks.map((link) => (
                                <Button
                                    key={link.label}
                                    href={link.href}
                                    sx={{
                                        color: pathname === link.href ? "primary.main" : "grey.700",
                                        fontWeight: pathname === link.href ? 600 : 500,
                                        fontSize: "0.9rem",
                                        textTransform: "none",
                                        px: 2,
                                        borderRadius: "10px",

                                        bgcolor:
                                            pathname === link.href
                                                ? "rgba(25, 118, 210, 0.10)"
                                                : "transparent",

                                        transition: "all 0.25s ease",

                                        "&:hover": {
                                            color: "primary.main",
                                            bgcolor: "rgba(25, 118, 210, 0.08)",
                                        },
                                    }}
                                >
                                    {link.label}
                                </Button>
                            ))}
                        </Box>
                    )}

                    {(!isMobile && !user) && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                            {authLinks.map((link) => (
                                <Button
                                    key={link.label}
                                    href={link.href}
                                    variant={link.variant}
                                    size="small"
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderRadius: "12px",
                                        px: 2.5,
                                        py: 1,

                                        background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                                        color: "#fff",

                                        boxShadow: "0 4px 10px rgba(25, 118, 210, 0.25)",

                                        transition: "all 0.3s ease",

                                        "&:hover": {
                                            background: "linear-gradient(135deg, #1565C0, #1B5E20)",
                                            boxShadow: "0 6px 14px rgba(46, 125, 50, 0.35)",
                                            transform: "translateY(-2px)",
                                        },
                                    }}
                                >
                                    {link.label}
                                </Button>
                            ))}
                        </Box>
                    )}

                    {(user && !isMobile) && (
                        <Button
                            size="small"
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "12px",
                                px: 2.5,
                                py: 1,
                                background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                                color: "#fff",
                                boxShadow: "0 4px 10px rgba(25, 118, 210, 0.25)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #1565C0, #1B5E20)",
                                    boxShadow: "0 6px 14px rgba(46, 125, 50, 0.35)",
                                    transform: "translateY(-2px)",
                                },
                            }}
                            onClick={() => {
                                setDrawerOpen(false)
                                logout()
                            }}
                        >
                            Logout
                        </Button>
                    )}

                    {isMobile && (
                        <IconButton onClick={toggleDrawer} edge="end" sx={{ color: "grey.700" }}>
                            <MenuIcon />
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer} slotProps={{ paper: { sx: { width: 260 } } }}>
                <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", mt: -3, mb: -3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", ml: -5 }}>
                        <Image src={famwalletLogo} alt="logo" width={200} height={100} />
                    </Box>
                    <IconButton onClick={toggleDrawer} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Divider />
                {/* Mobile navbar */}
                <List sx={{ px: 1, pt: 1 }}>
                    <Typography>{user?.email}</Typography>
                    {navLinks.map((link) => (
                        <ListItem key={link.label} disablePadding>
                            <ListItemButton
                                href={link.href}
                                onClick={toggleDrawer}
                                sx={{
                                    color: pathname === link.href ? "primary.main" : "grey.700",
                                    fontWeight: pathname === link.href ? 600 : 500,
                                    fontSize: "0.9rem",
                                    textTransform: "none",
                                    px: 2,
                                    borderRadius: "10px",
                                    bgcolor:
                                        pathname === link.href
                                            ? "rgba(25, 118, 210, 0.10)"
                                            : "transparent",
                                    transition: "all 0.25s ease",
                                    "&:hover": {
                                        color: "primary.main",
                                        bgcolor: "rgba(25, 118, 210, 0.08)",
                                    },
                                }}
                            >
                                <Typography
                                    sx={{ fontWeight: "bold", color: "grey.800" }}
                                >
                                    {link.icon} {link.label}
                                </Typography>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ mx: 2, my: 1 }} />

                <Box sx={{ px: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    {!user &&
                        authLinks.map((link) => (
                            <Button
                                key={link.label}
                                href={link.href}
                                variant={link.variant}
                                size="small"
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: "12px",
                                    px: 2.5,
                                    py: 1,
                                    background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                                    color: "#fff",
                                    boxShadow: "0 4px 10px rgba(25, 118, 210, 0.25)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #1565C0, #1B5E20)",
                                        boxShadow: "0 6px 14px rgba(46, 125, 50, 0.35)",
                                        transform: "translateY(-2px)",
                                    },
                                }}
                            >
                                {link.label}
                            </Button>
                        ))
                    }

                    {user && (
                        <Button
                            size="small"
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "12px",
                                px: 2.5,
                                py: 1,
                                background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                                color: "#fff",
                                boxShadow: "0 4px 10px rgba(25, 118, 210, 0.25)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #1565C0, #1B5E20)",
                                    boxShadow: "0 6px 14px rgba(46, 125, 50, 0.35)",
                                    transform: "translateY(-2px)",
                                },
                            }}
                            onClick={() => {
                                setDrawerOpen(false)
                                logout()
                            }}
                        >
                            Logout
                        </Button>
                    )}
                </Box>
            </Drawer>
        </>
    )
}