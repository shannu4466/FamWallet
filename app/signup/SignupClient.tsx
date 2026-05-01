"use client"

import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material"
import {
    Alert,
    Box,
    Button,
    Container,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material"
import { useFormik } from "formik"
import { useRouter } from "next/navigation"
import { useState } from "react"
import * as Yup from "yup"

import Image from 'next/image'
import logo from '../../public/logo.png'

export default function SignupClient() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState("")

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Enter a valid email")
            .required("Email is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                "Password must contain uppercase, lowercase, number and special character"
            )
            .required("Password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password")], "Passwords do not match")
            .required("Please confirm your password")
    })

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const users: { email: string; password: string }[] =
                JSON.parse(localStorage.getItem("famwallet_users") || "[]")

            if (users.find((u) => u.email === values.email)) {
                setError("An account with this email already exists.")
                return
            }

            const newUser = { email: values.email, password: values.password, role: "family_head" }
            localStorage.setItem("famwallet_users", JSON.stringify([...users, newUser]))
            localStorage.setItem("famwallet_session", JSON.stringify(newUser))
            router.replace("/")
        }
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
                left: 0,
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
                                width: 70,
                                height: 70,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 2,
                            }}
                        >
                            <Image src={logo} alt="logo" height={70} width={70} />
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.5px", color: "grey.900" }}>
                            FamWallet
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Create your account
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

                        <TextField
                            fullWidth
                            id="confirmPassword"
                            name="confirmPassword"
                            label="Confirm Password"
                            type={showConfirm ? "text" : "password"}
                            value={formik.values.confirmPassword}
                            onChange={(e) => {
                                formik.handleChange(e)
                                setError("")
                            }}
                            onBlur={formik.handleBlur}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ color: "grey.400", fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" size="small">
                                                {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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
                            Create Account
                        </Button>

                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                            Already have an account?{" "}
                            <Box
                                component="span"
                                onClick={() => router.push("/login")}
                                sx={{ color: "primary.main", fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                            >
                                Sign In
                            </Box>
                        </Typography>
                    </Stack>
                </Box>
            </Container>
        </Box>
    )
}