"use client"

import {
    Add,
    Delete,
    Edit,
    People,
    Close,
    Person,
    Email,
    Lock,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material"
import {
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Snackbar,
    Alert,
    InputLabel,
    FormControl,
    FormHelperText,
} from "@mui/material"
import ShareIcon from "@mui/icons-material/Share"

import { useEffect, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useAuth } from "@/context/AuthContext"

const RELATIONSHIPS = [
    "Spouse",
    "Parent",
    "Child",
    "Sibling",
    "Grandparent",
    "Grandchild",
    "Uncle / Aunt",
    "Cousin",
    "Other",
]

const RELATION_COLORS: Record<string, string> = {
    Spouse: "#7c3aed",
    Parent: "#0369a1",
    Child: "#15803d",
    Sibling: "#b45309",
    Grandparent: "#be185d",
    Grandchild: "#0e7490",
    "Uncle / Aunt": "#7c2d12",
    Cousin: "#3730a3",
    Other: "#374151",
}

type Member = {
    id: string
    email: string
    password: string
    relationship: string
    createdBy: string
    role: string
}

const validationSchema = Yup.object({
    email: Yup.string().email("Enter a valid email").required("Email is required"),
    password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
    relationship: Yup.string().required("Relationship is required"),
})

export default function ManageMembersClient() {
    const [members, setMembers] = useState<Member[]>([])
    const [open, setOpen] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [serverError, setServerError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [openSnackBar, setOpenSnackBar] = useState<boolean>(false)

    const { user } = useAuth()

    const session = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("famwallet_session") || "{}")
        : {}

    useEffect(() => {
        const allMembers: Member[] = JSON.parse(
            localStorage.getItem("famwallet_members") || "[]"
        )
        if (user?.role === "family_head") {
            const familyMembers = allMembers.filter(
                (m) => m.createdBy === session.email
            )
            const familyHead: Member = {
                id: "head",
                email: session.email,
                password: "",
                relationship: "Family Head",
                createdBy: session.email,
                role: "family_head",
            }
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMembers([familyHead, ...familyMembers])
        } else {
            const myRecord = allMembers.find(
                (m) => m.email === session.email
            )
            if (myRecord) {
                const familyMembers = allMembers.filter(
                    (m) => m.createdBy === myRecord.createdBy
                )
                const familyHead: Member = {
                    id: "head",
                    email: myRecord.createdBy,
                    password: "",
                    relationship: "Family Head",
                    createdBy: myRecord.createdBy,
                    role: "family_head",
                }
                setMembers([familyHead, ...familyMembers])
            }
        }
    }, [session.email, user?.role])

    const saveMembers = (updated: Member[]) => {
        const all: Member[] = JSON.parse(
            localStorage.getItem("famwallet_members") || "[]"
        )

        const others = all.filter(
            (m) => m.createdBy !== session.email
        )

        const uniqueMembers = updated.filter(
            (member, index, self) =>
                index === self.findIndex(
                    (m) => m.email === member.email
                )
        )

        localStorage.setItem(
            "famwallet_members",
            JSON.stringify([...others, ...uniqueMembers])
        )

        setMembers(uniqueMembers)
    }

    const formik = useFormik({
        initialValues: { email: "", password: "", relationship: "" },
        validationSchema,
        onSubmit: (values) => {
            setServerError("")
            const authUsers: { email: string; password: string }[] =
                JSON.parse(localStorage.getItem("famwallet_users") || "[]")

            if (editId) {
                const old = members.find((m) => m.id === editId)
                const updatedAuth = authUsers.map((u) =>
                    u.email === old?.email ? { email: values.email, password: values.password } : u
                )
                localStorage.setItem("famwallet_users", JSON.stringify(updatedAuth))
                saveMembers(members.map((m) => m.id === editId ? { ...m, ...values } : m))
            } else {
                if (authUsers.find((u) => u.email === values.email)) {
                    setServerError("This email is already registered.")
                    return
                }
                const newMember: Member = {
                    id: crypto.randomUUID(),
                    ...values,
                    createdBy: session.email,
                    role: "family_member"
                }
                localStorage.setItem("famwallet_users", JSON.stringify([...authUsers, { email: values.email, password: values.password, role: "family_member" }]))
                saveMembers([...members.filter(m => m.role !== "family_head"), newMember])
            }

            handleClose()
        },
    })

    const handleOpen = (member?: Member) => {
        setServerError("")
        setShowPassword(false)
        if (member) {
            setEditId(member.id)
            formik.setValues({ email: member.email, password: member.password, relationship: member.relationship })
        } else {
            setEditId(null)
            formik.resetForm()
        }
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setDeleteId(null)
        formik.resetForm()
        setServerError("")
    }

    const handleDelete = (id: string) => {
        const member = members.find((m) => m.id === id)
        const authUsers: { email: string; password: string }[] =
            JSON.parse(localStorage.getItem("famwallet_users") || "[]")
        localStorage.setItem("famwallet_users", JSON.stringify(authUsers.filter((u) => u.email !== member?.email)))
        saveMembers(members.filter((m) => m.id !== id))
        setDeleteId(null)
    }

    const initials = (email: string) => email.slice(0, 2).toUpperCase()

    return (
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
            <Snackbar
                open={openSnackBar}
                autoHideDuration={2000}
                onClose={() => setOpenSnackBar(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setOpenSnackBar(false)}
                    variant="filled"
                    icon={false}
                    sx={{
                        width: "100%",
                        color: "#fff",
                        fontWeight: 600,
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                        boxShadow: "0 6px 14px rgba(46, 125, 50, 0.35)",
                        "& .MuiAlert-action": {
                            color: "#fff"
                        }
                    }}
                >
                    Share feature not implemented yet
                </Alert>
            </Snackbar>

            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                    <Typography variant="h6" sx={{
                        fontWeight: 800, color: "grey.900", letterSpacing: "-0.5px",
                        background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}>
                        Family Members
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {members.length} member{members.length !== 1 ? "s" : ""} added
                    </Typography>
                </Box>

                {user?.role === "family_head" && (
                    <Button
                        onClick={() => handleOpen()}
                        startIcon={<Add />}
                        sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: 2.5,
                            px: 2.5,
                            py: 1,
                            color: "white",
                            background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                            boxShadow: "0 4px 12px rgba(25,118,210,0.25)",
                            "&:hover": { background: "linear-gradient(135deg, #1565C0, #1B5E20)" },
                        }}
                    >
                        Add Member
                    </Button>
                )}
            </Stack>

            {members.length === 0 ? (
                <Box
                    sx={{
                        textAlign: "center",
                        py: 8,
                        bgcolor: "white",
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "grey.100",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    }}
                >
                    <People sx={{ fontSize: 52, color: "grey.300", mb: 2 }} />
                    <Typography sx={{ fontWeight: 700, color: "grey.700" }}>No members yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Add your first family member to get started
                    </Typography>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {members.map((member) => (
                        <Box
                            key={member.id}
                            sx={{
                                bgcolor: "white",
                                borderRadius: 3,
                                p: 2,
                                border: "1px solid",
                                borderColor: "grey.100",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <Avatar
                                sx={{
                                    bgcolor: RELATION_COLORS[member.relationship] ?? "#374151",
                                    width: 44,
                                    height: 44,
                                    fontSize: 15,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                }}
                            >
                                {initials(member.email)}
                            </Avatar>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "grey.900" }} noWrap>
                                    {member.email}
                                </Typography>
                                {user?.role === "family_head" && (
                                    <Chip
                                        label={member.relationship}
                                        size="small"
                                        sx={{
                                            mt: 0.5,
                                            height: 20,
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            bgcolor: `${RELATION_COLORS[member.relationship]}18`,
                                            color: RELATION_COLORS[member.relationship] ?? "grey.700",
                                            borderRadius: 1,
                                        }}
                                    />
                                )}
                            </Box>

                            {(user?.role === "family_head" && (member.email !== user?.email)) && (
                                <Stack direction="row" spacing={0.5}>
                                    <IconButton size="small" onClick={() => handleOpen(member)} sx={{ color: "grey.500" }}>
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => setDeleteId(member.id)} sx={{ color: "error.main" }}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => setOpenSnackBar(true)} sx={{ color: "grey.500" }}>
                                        <ShareIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            )}
                            {(user?.email === member.email || member.role === "family_head") && (
                                <Typography sx={{ color: "gray" }}>
                                    {user?.email === member.email ? "(You)" : "Family Head"}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Stack>
            )}

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
                <DialogTitle sx={{ pb: 0 }}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", mb: 2 }}>
                            {editId ? "Edit Member" : "Add Member"}
                        </Typography>
                        <IconButton size="small" onClick={handleClose}>
                            <Close fontSize="small" />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={2.5} sx={{ mt: 1 }} component="form" onSubmit={formik.handleSubmit}>
                        {serverError && <Alert severity="error" sx={{ borderRadius: 2 }}>{serverError}</Alert>}

                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            {...formik.getFieldProps("email")}
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
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            {...formik.getFieldProps("password")}
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

                        <FormControl fullWidth error={formik.touched.relationship && Boolean(formik.errors.relationship)}>
                            <InputLabel>Relationship</InputLabel>
                            <Select
                                label="Relationship"
                                {...formik.getFieldProps("relationship")}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <Person sx={{ color: "grey.400", fontSize: 20 }} />
                                    </InputAdornment>
                                }
                                sx={{ borderRadius: 2.5 }}
                            >
                                {RELATIONSHIPS.map((r) => (
                                    <MenuItem key={r} value={r}>{r}</MenuItem>
                                ))}
                            </Select>
                            {formik.touched.relationship && formik.errors.relationship && (
                                <FormHelperText>{formik.errors.relationship}</FormHelperText>
                            )}
                        </FormControl>

                        <Button
                            type="submit"
                            fullWidth
                            size="large"
                            sx={{
                                py: 1.4,
                                borderRadius: 2.5,
                                fontWeight: 700,
                                textTransform: "none",
                                color: "white",
                                background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                                boxShadow: "0 4px 14px rgba(25,118,210,0.25)",
                                "&:hover": { background: "linear-gradient(135deg, #1565C0, #1B5E20)" },
                            }}
                        >
                            {editId ? "Save Changes" : "Add Member"}
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteId} onClose={handleClose} slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}>
                <DialogTitle>
                    <Typography sx={{ fontWeight: 800 }}>Remove Member?</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        This will remove the member and revoke their login access. This action cannot be undone.
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                        <Button onClick={handleClose} variant="outlined" sx={{ textTransform: "none", borderRadius: 2.5 }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => deleteId && handleDelete(deleteId)}
                            variant="contained"
                            color="error"
                            sx={{ textTransform: "none", borderRadius: 2.5, fontWeight: 700 }}
                        >
                            Remove
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </Box>
    )
}