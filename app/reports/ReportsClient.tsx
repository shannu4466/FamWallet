"use client"

import { useAuth } from "@/context/AuthContext"
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material"
import { BarChart } from "@mui/x-charts/BarChart"
import { LineChart } from "@mui/x-charts/LineChart"
import { PieChart } from "@mui/x-charts/PieChart"
import { useMemo } from "react"

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

const CATEGORY_LABELS: Record<string, string> = {
    groceries: "Groceries",
    salary: "Salary",
    utilities: "Utilities",
    rent: "Rent",
    education: "Education",
    healthcare: "Healthcare",
    entertainment: "Entertainment",
    transport: "Transport",
    dining: "Dining",
    shopping: "Shopping",
    electricity: "Electricity",
    other: "Other",
}

const PALETTE = [
    "#1976D2",
    "#2E7D32",
    "#c62828",
    "#f57c00",
    "#6a1b9a",
    "#00695c",
    "#283593",
    "#ad1457",
    "#558b2f",
    "#4e342e",
]

function formatINR(val: number) {
    return `₹${val.toLocaleString("en-IN")}`
}

export default function ReportsClient() {
    const { user } = useAuth()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
    const isMd = useMediaQuery(theme.breakpoints.down("md"))

    const allMembers: Member[] = useMemo(
        () => JSON.parse(localStorage.getItem("famwallet_members") || "[]"),
        []
    )

    const familyKey = useMemo(() => {
        if (!user?.email) return null
        if (user.role === "family_head") return user.email
        const current = allMembers.find((m) => m.email === user.email)
        return current?.createdBy || null
    }, [user, allMembers])

    const familyMembers = useMemo(() => {
        if (!familyKey) return []
        return allMembers.filter(
            (m) => m.email === familyKey || m.createdBy === familyKey
        )
    }, [allMembers, familyKey])

    const allTransactions = useMemo(() => {
        const txns: (Transaction & { memberEmail: string })[] = []
        familyMembers.forEach((m) => {
            m.transactions?.forEach((t) => txns.push({ ...t, memberEmail: m.email }))
        })
        return txns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }, [familyMembers])

    const categorySpendData = useMemo(() => {
        const map: Record<string, number> = {}
        allTransactions
            .filter((t) => t.type === "debit")
            .forEach((t) => {
                map[t.category] = (map[t.category] || 0) + t.amount
            })
        return Object.entries(map)
            .map(([cat, val], i) => ({
                id: i,
                value: val,
                label: CATEGORY_LABELS[cat] || cat,
                color: PALETTE[i % PALETTE.length],
            }))
            .sort((a, b) => b.value - a.value)
    }, [allTransactions])

    const memberContributionData = useMemo(() => {
        return familyMembers.map((m, i) => {
            const credit = m.transactions?.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0) || 0
            const debit = m.transactions?.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0) || 0
            return {
                member: m.email.split("@")[0],
                credit,
                debit,
                color: PALETTE[i % PALETTE.length],
            }
        })
    }, [familyMembers])

    const timelineData = useMemo(() => {
        const map: Record<string, { credit: number; debit: number }> = {}
        allTransactions.forEach((t) => {
            const dateKey = new Date(t.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
            })
            if (!map[dateKey]) map[dateKey] = { credit: 0, debit: 0 }
            if (t.type === "credit") map[dateKey].credit += t.amount
            else map[dateKey].debit += t.amount
        })
        const labels = Object.keys(map)
        return {
            labels,
            credits: labels.map((l) => map[l].credit),
            debits: labels.map((l) => map[l].debit),
        }
    }, [allTransactions])

    const creditIncomePie = useMemo(() => {
        const map: Record<string, number> = {}
        allTransactions
            .filter((t) => t.type === "credit")
            .forEach((t) => {
                map[t.category] = (map[t.category] || 0) + t.amount
            })
        return Object.entries(map).map(([cat, val], i) => ({
            id: i,
            value: val,
            label: CATEGORY_LABELS[cat] || cat,
            color: PALETTE[i % PALETTE.length],
        }))
    }, [allTransactions])

    const chartCardSx = {
        background: "#fff",
        borderRadius: "22px",
        boxShadow: "0 4px 28px rgba(0,0,0,0.07)",
        p: { xs: 2.5, sm: 3.5 },
        overflow: "hidden",
    }

    const chartTitleSx = {
        fontWeight: 800,
        fontSize: { xs: "1rem", sm: "1.1rem" },
        color: "#1a1a2e",
        mb: 0.5,
        letterSpacing: "-0.3px",
    }

    const chartSubSx = {
        fontSize: "0.8rem",
        color: "#888",
        mb: 2.5,
    }

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
                    Financial Reports
                </Typography>
                <Typography sx={{ color: "#888", fontSize: "0.92rem", mt: 0.6 }}>
                    Family wallet analytics &amp; insights
                </Typography>
            </Box>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: { xs: 2.5, md: 3 },
                    mb: { xs: 2.5, md: 3 },
                }}
            >
                <Box sx={chartCardSx}>
                    <Typography sx={chartTitleSx}>Spending by Category</Typography>
                    <Typography sx={chartSubSx}>Where the family money goes</Typography>
                    {categorySpendData.length === 0 ? (
                        <Box sx={{ py: 5, textAlign: "center" }}>
                            <Typography sx={{ color: "#bbb" }}>No debit data yet</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <PieChart
                                series={[
                                    {
                                        data: categorySpendData,
                                        highlightScope: { fade: "global", highlight: "item" },
                                        faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
                                        valueFormatter: (v: { value: number }) => formatINR(v.value),
                                        innerRadius: isMobile ? 40 : 55,
                                        outerRadius: isMobile ? 90 : 120,
                                        paddingAngle: 2,
                                        cornerRadius: 4,
                                    },
                                ]}
                                width={isMobile ? 300 : 460}
                                height={isMobile ? 240 : 300}
                                slotProps={{
                                    legend: {
                                        direction: "horizontal",
                                        position: { vertical: "middle", horizontal: "end" },
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Box>

                <Box sx={chartCardSx}>
                    <Typography sx={chartTitleSx}>Income Sources</Typography>
                    <Typography sx={chartSubSx}>Credit breakdown by category</Typography>
                    {creditIncomePie.length === 0 ? (
                        <Box sx={{ py: 5, textAlign: "center" }}>
                            <Typography sx={{ color: "#bbb" }}>No credit data yet</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <PieChart
                                series={[
                                    {
                                        data: creditIncomePie,
                                        highlightScope: { fade: "global", highlight: "item" },
                                        faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
                                        valueFormatter: (v: { value: number }) => formatINR(v.value),
                                        outerRadius: isMobile ? 90 : 120,
                                        paddingAngle: 2,
                                        cornerRadius: 4,
                                    },
                                ]}
                                width={isMobile ? 300 : 460}
                                height={isMobile ? 240 : 300}
                                slotProps={{
                                    legend: {
                                        direction: "horizontal",
                                        position: { vertical: "middle", horizontal: "end" },
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Box>
            </Box>

            <Box sx={{ ...chartCardSx, mb: { xs: 2.5, md: 3 } }}>
                <Typography sx={chartTitleSx}>Member-wise Contribution</Typography>
                <Typography sx={chartSubSx}>Credit vs debit per family member</Typography>
                {memberContributionData.length === 0 ? (
                    <Box sx={{ py: 5, textAlign: "center" }}>
                        <Typography sx={{ color: "#bbb" }}>No member data yet</Typography>
                    </Box>
                ) : (
                    <Box sx={{ overflowX: "auto" }}>
                        <BarChart
                            xAxis={[
                                {
                                    scaleType: "band",
                                    data: memberContributionData.map((m) => m.member),
                                    tickLabelStyle: { fontSize: isMobile ? 10 : 12 },
                                },
                            ]}
                            series={[
                                {
                                    data: memberContributionData.map((m) => m.credit),
                                    label: "Credit",
                                    color: "#1976D2",
                                    valueFormatter: (v: number | null) => formatINR(v ?? 0),
                                },
                                {
                                    data: memberContributionData.map((m) => m.debit),
                                    label: "Debit",
                                    color: "#c62828",
                                    valueFormatter: (v: number | null) => formatINR(v ?? 0),
                                },
                            ]}
                            width={isMobile ? 340 : isMd ? 620 : 900}
                            height={isMobile ? 220 : 300}
                            borderRadius={8}
                            slotProps={{
                                legend: {
                                    direction: "horizontal",
                                    position: { vertical: "top", horizontal: "end" },
                                },
                            }}
                        />
                    </Box>
                )}
            </Box>

            <Box sx={chartCardSx}>
                <Typography sx={chartTitleSx}>Cash Flow Timeline</Typography>
                <Typography sx={chartSubSx}>Credits and debits over time</Typography>
                {timelineData.labels.length === 0 ? (
                    <Box sx={{ py: 5, textAlign: "center" }}>
                        <Typography sx={{ color: "#bbb" }}>No timeline data yet</Typography>
                    </Box>
                ) : (
                    <Box sx={{ overflowX: "auto" }}>
                        <LineChart
                            xAxis={[
                                {
                                    scaleType: "point",
                                    data: timelineData.labels,
                                    tickLabelStyle: { fontSize: isMobile ? 10 : 12 },
                                },
                            ]}
                            series={[
                                {
                                    data: timelineData.credits,
                                    label: "Credits",
                                    color: "#1976D2",
                                    area: true,
                                    showMark: true,
                                    valueFormatter: (v: number | null) => formatINR(v ?? 0),
                                },
                                {
                                    data: timelineData.debits,
                                    label: "Debits",
                                    color: "#c62828",
                                    area: true,
                                    showMark: true,
                                    valueFormatter: (v: number | null) => formatINR(v ?? 0),
                                },
                            ]}
                            width={isMobile ? 340 : isMd ? 620 : 900}
                            height={isMobile ? 220 : 300}
                            sx={{
                                "& .MuiAreaElement-series-Credits": {
                                    fill: "url(#blueGrad)",
                                    opacity: 0.15,
                                },
                                "& .MuiAreaElement-series-Debits": {
                                    fill: "url(#redGrad)",
                                    opacity: 0.15,
                                },
                            }}
                            slotProps={{
                                legend: {
                                    direction: "horizontal",
                                    position: { vertical: "top", horizontal: "end" },
                                },
                            }}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    )
}