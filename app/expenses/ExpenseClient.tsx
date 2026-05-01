"use client"

import { useAuth } from "@/context/AuthContext"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import FilterListIcon from "@mui/icons-material/FilterList"
import TrendingDownIcon from "@mui/icons-material/TrendingDown"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import { ArrowUpward, ArrowDownward, UnfoldMore } from "@mui/icons-material"
import {
    Box,
    Chip,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
    IconButton,
} from "@mui/material"
import { useMemo, useState } from "react"

interface Transaction {
    id: string
    type: "credit" | "debit"
    amount: number
    category: string
    note: string
    date: string
    performedBy: string
}

interface Member {
    id?: string
    email: string
    password?: string
    relationship?: string
    createdBy?: string
    role: string
    transactions?: Transaction[]
}

const CATEGORIES = [
    { value: "groceries", label: "Groceries" },
    { value: "salary", label: "Salary" },
    { value: "utilities", label: "Utilities" },
    { value: "rent", label: "Rent" },
    { value: "education", label: "Education" },
    { value: "healthcare", label: "Healthcare" },
    { value: "entertainment", label: "Entertainment" },
    { value: "transport", label: "Transport" },
    { value: "dining", label: "Dining Out" },
    { value: "shopping", label: "Shopping" },
    { value: "electricity", label: "Electricity" },
    { value: "other", label: "Other" },
]

const CATEGORY_MAP: Record<string, string> = {
    groceries: "Groceries",
    salary: "Salary",
    utilities: "Utilities",
    rent: "Rent",
    education: "Education",
    healthcare: "Healthcare",
    entertainment: "Entertainment",
    transport: "Transport",
    dining: "Dining Out",
    shopping: "Shopping",
    electricity: "Elecricity",
    other: "Other",
}

function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export default function ExpenseClient() {
    const { user } = useAuth()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
    const isMd = useMediaQuery(theme.breakpoints.down("md"))

    const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all")
    const [filterCategory, setFilterCategory] = useState("all")
    const [dateSortOrder, setDateSortOrder] = useState("asc");

    const allMembers: Member[] = useMemo(() => {
        return JSON.parse(localStorage.getItem("famwallet_members") || "[]")
    }, [])

    const familyKey = useMemo(() => {
        if (!user?.email) return null
        if (user.role === "family_head") return user.email
        const currentMember = allMembers.find((m) => m.email === user.email)
        return currentMember?.createdBy || null
    }, [user, allMembers])

    const familyMembers = useMemo(() => {
        if (!familyKey) return []
        return allMembers.filter(
            (member) => member.email === familyKey || member.createdBy === familyKey
        )
    }, [allMembers, familyKey])

    const walletSummary = useMemo(() => {
        let totalCredit = 0
        let totalDebit = 0
        familyMembers.forEach((member) => {
            member.transactions?.forEach((txn) => {
                if (txn.type === "credit") totalCredit += txn.amount
                if (txn.type === "debit") totalDebit += txn.amount
            })
        })
        return { totalCredit, totalDebit, availableBalance: totalCredit - totalDebit }
    }, [familyMembers])

    const allTransactions = useMemo(() => {
        const txns: (Transaction & { memberEmail: string })[] = []
        familyMembers.forEach((member) => {
            member.transactions?.forEach((txn) => {
                txns.push({ ...txn, memberEmail: member.email })
            })
        })
        return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }, [familyMembers])

    const handleDateSort = () => {
        setDateSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    }

    const filteredTransactions = useMemo(() => {
        const filtered = allTransactions.filter((txn) => {
            const typeMatch = filterType === "all" || txn.type === filterType
            const catMatch = filterCategory === "all" || txn.category === filterCategory
            return typeMatch && catMatch
        })
        filtered.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateSortOrder === "asc"
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime()
        })

        return filtered;
    }, [allTransactions, filterType, filterCategory, dateSortOrder])

    const summaryCards = [
        {
            label: "Total Credits",
            value: walletSummary.totalCredit,
            bg: "linear-gradient(135deg, #1976D2, #2E7D32)",
            shadow: "0 4px 10px rgba(25, 118, 210, 0.25)",
        },
        {
            label: "Total Debits",
            value: walletSummary.totalDebit,
            bg: "linear-gradient(135deg, #1976D2, #2E7D32)",
            shadow: "0 4px 10px rgba(25, 118, 210, 0.25)",
        },
        {
            label: "Available Balance",
            value: walletSummary.availableBalance,
            bg: "linear-gradient(135deg, #1976D2, #2E7D32)",
            shadow: "0 4px 10px rgba(25, 118, 210, 0.25)",
        },
    ]

    return (
        <Box
            sx={{
                minHeight: "100vh",
                px: { xs: 2, sm: 3, md: 5, lg: 8 },
                py: { xs: 3, sm: 4, md: 5 },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    mb: 4,
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: "1.6rem", sm: "2rem", md: "2.4rem" },
                            background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            letterSpacing: "-0.5px",
                            lineHeight: 1.1,
                        }}
                    >
                        Expense Tracker
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.9rem", mt: 0.5 }}>
                        Family wallet overview & transactions
                    </Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(3,1fr)", sm: "repeat(3, 1fr)" },
                    gap: { xs: 2, sm: 2.5, md: 3 },
                    mb: 4,
                }}
            >
                {summaryCards.map((card) => (
                    <Box
                        key={card.label}
                        sx={{
                            background: card.bg,
                            borderRadius: "20px",
                            boxShadow: card.shadow,
                            p: { xs: 2.5, sm: 3 },
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                            position: "relative",
                            overflow: "hidden",
                            "&::after": {
                                content: '""',
                                position: "absolute",
                                right: -20,
                                top: -20,
                                width: 100,
                                height: 100,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.1)",
                            },
                        }}
                    >
                        <Box>
                            <Typography sx={{ fontSize: "0.78rem", opacity: 0.85, fontWeight: 500, letterSpacing: 0.3 }}>
                                {card.label}
                            </Typography>
                            <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.4rem", sm: "1.6rem" }, lineHeight: 1.1, mt: 0.2 }}>
                                ₹{card.value.toLocaleString("en-IN")}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            <Box
                sx={{
                    background: "#fff",
                    borderRadius: "20px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        px: { xs: 2, sm: 3 },
                        py: 2.5,
                        borderBottom: "1px solid #f0f0f0",
                        display: "flex",
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FilterListIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1a1a2e" }}>
                            Transactions
                        </Typography>
                        <Chip
                            label={filteredTransactions.length}
                            size="small"
                            sx={{
                                height: 20,
                                width: 20,
                                fontSize: "1rem",
                                fontWeight: "bold",
                                background: "#eef2ff",
                                color: "green",
                                borderRadius: "50%",
                                p: 0,
                                "& .MuiChip-label": {
                                    px: 0,
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                },
                            }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", width: { xs: "100%", sm: "auto" } }}>
                        <TextField
                            select
                            size="small"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as "all" | "credit" | "debit")}
                            sx={{
                                minWidth: 120,
                                flex: { xs: 1, sm: "unset" },
                                "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "0.85rem" },
                            }}
                        >
                            <MenuItem value="all">All Types</MenuItem>
                            <MenuItem value="credit">Credit</MenuItem>
                            <MenuItem value="debit">Debit</MenuItem>
                        </TextField>

                        <TextField
                            select
                            size="small"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            sx={{
                                minWidth: 140,
                                flex: { xs: 1, sm: "unset" },
                                "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "0.85rem" },
                            }}
                        >
                            <MenuItem value="all">All Categories</MenuItem>
                            {CATEGORIES.map((c) => (
                                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </Box>

                {filteredTransactions.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: "center" }}>
                        <Typography sx={{ color: "text.secondary", fontWeight: "bold" }}>No transactions found</Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table sx={{ minWidth: { xs: "auto", md: 650 } }}>
                            <TableHead>
                                <TableRow sx={{ background: "#fafbff" }}>
                                    {[
                                        { label: "Date", hide: false },
                                        { label: "Member", hide: false },
                                        { label: "Type", hide: false },
                                        { label: "Category", hide: isMobile },
                                        { label: "Note", hide: isMd },
                                        { label: "Amount", hide: false },
                                    ].map(
                                        (col) =>
                                            !col.hide && (
                                                <TableCell
                                                    key={col.label}
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: "0.78rem",
                                                        color: "#666",
                                                        textTransform: "uppercase",
                                                        letterSpacing: 0.5,
                                                        borderBottom: "2px solid #f0f0f0",
                                                        py: 1.5,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {col.label}
                                                    {col.label === "Date" && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={handleDateSort}
                                                            sx={{ ml: 0.5 }}
                                                        >
                                                            <Typography variant="body2" component="span">({dateSortOrder})</Typography>
                                                            {dateSortOrder === "asc" ? (
                                                                <ArrowUpward fontSize="inherit" />
                                                            ) : (
                                                                <ArrowDownward fontSize="inherit" />
                                                            )}
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            )
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTransactions.map((txn, idx) => (
                                    <TableRow
                                        key={txn.id}
                                        sx={{
                                            "&:hover": { background: "#f8faff" },
                                            background: idx % 2 === 0 ? "#fff" : "#fdfdff",
                                            transition: "background 0.15s",
                                        }}
                                    >
                                        <TableCell sx={{ py: 1.8, fontSize: "0.83rem", color: "#444", whiteSpace: "nowrap" }}>
                                            {formatDate(txn.date)}
                                        </TableCell>

                                        <TableCell sx={{ py: 1.8 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography sx={{ fontSize: "0.83rem", color: "#333", fontWeight: 500 }}>
                                                    {txn.memberEmail.split("@")[0].charAt(0).toUpperCase() + txn.memberEmail.split("@")[0].slice(1,)}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={{ py: 1.8 }}>
                                            <Chip
                                                icon={
                                                    txn.type === "credit"
                                                        ? <TrendingUpIcon style={{ fontSize: 14 }} />
                                                        : <TrendingDownIcon style={{ fontSize: 14 }} />
                                                }
                                                label={txn.type === "credit" ? "Credit" : "Debit"}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: "0.75rem",
                                                    height: 24,
                                                    background: txn.type === "credit" ? "#e3f2fd" : "#ffebee",
                                                    color: txn.type === "credit" ? "#1565C0" : "#c62828",
                                                    border: `1px solid ${txn.type === "credit" ? "#90caf9" : "#ef9a9a"}`,
                                                    "& .MuiChip-icon": { color: txn.type === "credit" ? "#1565C0" : "#c62828" },
                                                }}
                                            />
                                        </TableCell>

                                        {!isMobile && (
                                            <TableCell sx={{ py: 1.8 }}>
                                                <Typography sx={{ fontSize: "0.83rem", color: "#555" }}>
                                                    {CATEGORY_MAP[txn.category] || txn.category}
                                                </Typography>
                                            </TableCell>
                                        )}

                                        {!isMd && (
                                            <TableCell sx={{ py: 1.8, maxWidth: 180 }}>
                                                <Typography
                                                    sx={{ fontSize: "0.83rem", color: "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                                >
                                                    {txn.note || <span style={{ color: "#bbb", fontStyle: "italic" }}>—</span>}
                                                </Typography>
                                            </TableCell>
                                        )}

                                        <TableCell sx={{ py: 1.8 }}>
                                            <Typography
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: "0.95rem",
                                                    color: txn.type === "credit" ? "green" : "red",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {txn.type === "credit" ? "+" : "−"}₹{txn.amount.toLocaleString("en-IN")}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Box>
    )
}