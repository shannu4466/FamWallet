"use client"

import { Email, Lock, Visibility, VisibilityOff, AccountBalanceWallet } from "@mui/icons-material"
import {
    Box,
    Button,
    Container,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
    Alert,
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"

import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")

    const { login } = useAuth()

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Enter a valid email")
            .required("Email is required"),
        password: Yup.string()
            .required("Password is required")
    })

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const users: { email: string; role: string }[] = JSON.parse(
                localStorage.getItem("famwallet_users") || "[]"
            );
            const userRecord = users.find((u) => u.email.toLowerCase() === values.email.toLowerCase());
            
            const result = login({
                ...values,
                role: userRecord?.role || "family_member"
            })
            if (!result.success) {
                setError(result.message || "Login failed");
                return;
            }
            router.push("/")
        },  
    })

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f8fafc",
                overflow: "hidden",
                position: "fixed",
                top: 0,
                left: 0
            }}
        >
            <Container maxWidth="xs">
                <Box
                    component="form"
                    onSubmit={formik.handleSubmit}
                    sx={{
                        bgcolor: "white",
                        borderRadius: 4,
                        p: { xs: 3, sm: 4 },
                        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                        border: "1px solid",
                        borderColor: "grey.100",
                    }}
                >
                    <Stack sx={{ alignItems: "center", mb: 4 }}>
                        <Box
                            sx={{
                                width: 52,
                                height: 52,
                                borderRadius: 3,
                                background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 2,
                            }}
                        >
                            <AccountBalanceWallet sx={{ color: "white", fontSize: 26 }} />
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.5px", color: "grey.900" }}>
                            FamWallet
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Sign in to your account
                        </Typography>
                    </Stack>

                    <Stack spacing={2.5}>
                        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="Email Address"
                            value={formik.values.email}
                            onChange={(e) => {
                                formik.handleChange(e)
                                setError("")
                            }}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{ color: "grey.400", fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                        />

                        <TextField
                            fullWidth
                            id="password"
                            name="password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            value={formik.values.password}
                            onChange={(e) => {
                                formik.handleChange(e)
                                setError("")
                            }}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ color: "grey.400", fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                        />

                        <Button
                            fullWidth
                            type="submit"
                            size="large"
                            sx={{
                                py: 1.5,
                                borderRadius: 2.5,
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                textTransform: "none",
                                color: "white",
                                background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                                boxShadow: "0 4px 14px rgba(25,118,210,0.3)",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #1565C0, #1B5E20)",
                                    boxShadow: "0 6px 18px rgba(25,118,210,0.35)",
                                },
                            }}
                        >
                            Sign In
                        </Button>

                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                            Don&apos;t have an account?{" "}
                            <Box
                                component="span"
                                onClick={() => router.push("/signup")}
                                sx={{ color: "primary.main", fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                            >
                                Sign Up
                            </Box>
                        </Typography>
                    </Stack>
                </Box>
            </Container>
        </Box>
    )
}