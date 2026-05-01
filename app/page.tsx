"use client"

import { useAuth } from "@/context/AuthContext"
import CloseIcon from "@mui/icons-material/Close"
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee"
import TrendingDownIcon from "@mui/icons-material/TrendingDown"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  TextField,
  Typography
} from "@mui/material"
import { useFormik } from "formik"
import Image from "next/image"
import { useState, useMemo } from "react"
import * as Yup from "yup"
import logo from "../public/logo.png"

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
  { value: "other", label: "Other" },
]

const validationSchema = Yup.object({
  amount: Yup.number()
    .typeError("Amount must be a number")
    .positive("Amount must be greater than zero")
    .required("Amount is required"),
  category: Yup.string().required("Category is required"),
  note: Yup.string().max(100, "Note must be under 100 characters"),
})

interface Transaction {
  id: string;
  type: "credit" | "debit" | null;
  amount: number;
  category: string;
  note: string;
  date: string;
  performedBy?: string;
}

interface Member {
  createdBy: string;
  email: string;
  role: string;
  transactions: Transaction[];
}

export default function HomePage() {
  const { user } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [transactionType, setTransactionType] = useState<"credit" | "debit" | null>(null)
  const [successMsg, setSuccessMsg] = useState<string>("")
  const [openSnackBar, setOpenSnackBar] = useState<boolean>(false)

  const openDrawer = (type: "credit" | "debit") => {
    setTransactionType(type)
    setSuccessMsg("")
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    formik.resetForm()
    setSuccessMsg("")
  }

  // Calculate transaction details
  const allMembers: Member[] = JSON.parse(
    localStorage.getItem("famwallet_members") || "[]"
  )

  // Get family key of that user - who is a family_head here
  const familyKey = useMemo(() => {
    if (!user?.email) return null
    if (user.role === "family_head") {
      return user.email;
    }
    const currentMember = allMembers.find(
      (m) => m.email === user.email
    )
    return currentMember?.createdBy || null;
  }, [user, allMembers])

  // Get only those family wallet details
  const familyMembers = useMemo(() => {
    if (!familyKey) return []
    return allMembers.filter(
      (member) => member.email === familyKey || member.createdBy === familyKey
    );
  }, [allMembers, familyKey]);

  // calculate wallet details of that family
  const walletSummary = useMemo(() => {
    let totalCredit = 0
    let totalDebit = 0
    familyMembers.forEach((member) => {
      member.transactions?.forEach((txn) => {
        if (txn.type === "credit") totalCredit += txn.amount
        if (txn.type === "debit") totalDebit += txn.amount
      });
    })
    return {
      totalCredit,
      totalDebit,
      availableBalance: totalCredit - totalDebit,
    };
  }, [familyMembers])

  // formik data and its validation
  const formik = useFormik({
    initialValues: {
      amount: "",
      category: "",
      note: "",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const members = JSON.parse(localStorage.getItem("famwallet_members") || "[]")

      const enteredAmount = parseFloat(values.amount);

      // Insufficient Funds
      if (transactionType === "debit" && enteredAmount > walletSummary.availableBalance) {
        setSuccessMsg("Insufficient funds to debit.");
        setOpenSnackBar(true);
        return;
      }

      // New transaction
      const transaction = {
        id: crypto.randomUUID(),
        type: transactionType,
        amount: parseFloat(values.amount),
        category: values.category,
        note: values.note,
        date: new Date().toISOString(),
        performedBy: user?.email,
      }

      const userExists = members.some((m: Member) => m.email === user?.email)

      const updatedMembers = userExists
        ? members.map((member: Member) =>
          member.email === user?.email
            ? { ...member, transactions: [...(member.transactions || []), transaction] }
            : member
        )
        : [
          ...members,
          {
            email: user?.email,
            role: user?.role,
            transactions: [transaction],
          },
        ]

      setOpenSnackBar(true)
      localStorage.setItem("famwallet_members", JSON.stringify(updatedMembers))
      setSuccessMsg(
        `₹${values.amount} ${transactionType === "credit" ? "credited" : "debited"} successfully!`
      )
      resetForm()
      setDrawerOpen(false)
    },
  })

  const isCredit = transactionType === "credit"

  const dashboardData = [
    { type: "Total Credited", money: walletSummary.totalCredit },
    { type: "Total Debited", money: walletSummary.totalDebit },
    { type: "Available Balance", money: walletSummary.availableBalance }
  ]

  return (
    <Box>
      <Typography>({user?.role} , {user?.email})</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(3,1fr)",
            sm: "repeat(3,1fr)",
            md: "repeat(3,1fr)"
          },
          gap: 2,
          width: "100%",
          mt: 2,
        }}
      >
        {dashboardData.map((each, index) => (
          <Card
            key={index}
            sx={{
              minHeight: { xs: 90, sm: 110, md: 120 },
              borderRadius: "18px",
              px: 2,
              py: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: {
                xs: "0.95rem",
                sm: "1rem",
                md: "1.05rem",
              },
              background:
                "linear-gradient(135deg, #1976D2, #2E7D32)",
              boxShadow:
                "0 4px 14px rgba(25,118,210,0.35)",
              transition: "all 0.25s ease",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #1565C0, #1B5E20)",
                transform: "translateY(-3px)",
              },
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>{each.type}</Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>₹{each.money}</Typography>
            </Box>
          </Card>
        ))}
      </Box>
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
            height: "50px",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "12px",
            background: "linear-gradient(135deg, #1976D2, #2E7D32)",
            boxShadow: "0 6px 14px rgba(46, 125, 50, 0.35)",
            "& .MuiAlert-action": {
              color: "#fff"
            },
            mt: 10
          }}
        >
          {successMsg}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          py: { xs: 3, sm: 4, md: 0 },
          background: "linear-gradient(135deg, #f8fafc, #eef2ff)",
          overflow: "hidden",
          mt: {
            xs: "-15%",
            md: "-10%",
            lg: "-7%"
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "1400px",
            display: "flex",
            flexDirection: { xs: "column", md: "column", lg: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: { xs: 3, sm: 4, md: 5, lg: 8 },
          }}
        >
          <Box
            sx={{
              order: { xs: 1, lg: 2 },
              width: { xs: "100%", lg: "50%" },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: {
                  xs: "none",
                  sm: "none",
                  md: "none",
                  lg: "block"
                }
              }}
            >
              <Image
                src={logo}
                alt="logo"
                width={1200}
                height={1200}
                style={{
                  width: "100%",
                  maxWidth: "520px",
                  height: "auto",
                  objectFit: "contain"
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              order: { xs: 2, lg: 1 },
              width: { xs: "100%", lg: "50%" },
              textAlign: { xs: "center", lg: "left" },
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 1.5,
                fontSize: { xs: "2rem", sm: "2.4rem", md: "3rem", lg: "3.5rem" },
                lineHeight: 1.2,
                background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              FamWallet
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "0.95rem", sm: "1rem", md: "1.05rem", lg: "1.1rem" },
                color: "text.secondary",
                lineHeight: 1.8,
                maxWidth: "600px",
                mx: { xs: "auto", lg: 0 },
                mb: 3,
              }}
            >
              FamWallet is a smart family expense management app designed to track
              shared spending, manage members, and organize household finances in one
              place.
              <br />
              <br />
              Perfect for families, couples, roommates, and anyone managing expenses
              together.
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                justifyContent: { xs: "center", lg: "flex-start" },
                alignItems: "center",
                width: "100%",
              }}
            >
              <Button
                fullWidth
                variant="contained"
                startIcon={<TrendingUpIcon />}
                onClick={() => openDrawer("credit")}
                sx={{
                  maxWidth: { xs: "100%", sm: "220px" },
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "12px",
                  py: 1.2,
                  background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                  boxShadow: "0 4px 10px rgba(25,118,210,0.25)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1565C0, #1B5E20)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Credit Money
              </Button>

              <Button
                fullWidth
                variant="contained"
                startIcon={<TrendingDownIcon />}
                onClick={() => openDrawer("debit")}
                sx={{
                  maxWidth: { xs: "100%", sm: "220px" },
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "12px",
                  py: 1.2,
                  background: "linear-gradient(135deg, #1976D2, #2E7D32)",
                  boxShadow: "0 4px 10px rgba(25,118,210,0.25)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1565C0, #1B5E20)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Debit Money
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100vw", sm: 420 },
            borderRadius: { xs: 0, sm: "20px 0 0 20px" },
            background: "#fff",
            boxShadow: "4px 0 30px rgba(0,0,0,0.12)",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Box
            sx={{
              px: 3,
              pt: 3,
              pb: 2,
              background: isCredit
                ? "linear-gradient(135deg, #1976D2, #2E7D32)"
                : "linear-gradient(135deg, #1976D2, #2E7D32)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {isCredit ? (
                <TrendingUpIcon sx={{ fontSize: 28 }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 28 }} />
              )}
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", lineHeight: 1 }}>
                  {isCredit ? "Credit Money" : "Debit Money"}
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", opacity: 0.85, mt: 0.3 }}>
                  {isCredit ? "Add incoming funds" : "Record an expense"}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={closeDrawer} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{
              flex: 1,
              overflowY: "auto",
              px: { xs: 2.5, sm: 3 },
              py: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: "text.secondary",
                  mb: 0.8,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Amount (₹)
              </Typography>
              <TextField
                fullWidth
                name="amount"
                placeholder="Enter amount"
                value={formik.values.amount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupeeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }
                }
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                  },
                }}
              />
            </Box>

            <Divider />

            <Box>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: "text.secondary",
                  mb: 0.8,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Category
              </Typography>
              <TextField
                fullWidth
                select
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.category && Boolean(formik.errors.category)}
                helperText={formik.touched.category && formik.errors.category}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Select a category
                </MenuItem>
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: "text.secondary",
                  mb: 0.8,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Note{" "}
                <Typography
                  component="span"
                  sx={{ fontWeight: 400, textTransform: "none", fontSize: "0.78rem" }}
                >
                  (optional)
                </Typography>
              </Typography>
              <TextField
                fullWidth
                name="note"
                placeholder="Add a short note..."
                multiline
                rows={3}
                value={formik.values.note}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.note && Boolean(formik.errors.note)}
                helperText={formik.touched.note && formik.errors.note}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />
            </Box>

            <Box sx={{ mt: "auto", pt: 1 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={isCredit ? <TrendingUpIcon /> : <TrendingDownIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  background: isCredit
                    ? "linear-gradient(135deg, #1976D2, #2E7D32)"
                    : "linear-gradient(135deg, #1976D2, #2E7D32)",
                  boxShadow: isCredit
                    ? "0 4px 14px rgba(25,118,210,0.35)"
                    : "0 4px 14px rgba(198,40,40,0.35)",
                  "&:hover": {
                    background: isCredit
                      ? "linear-gradient(135deg, #1565C0, #1B5E20)"
                      : "linear-gradient(135deg, #1565C0, #1B5E20)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.25s ease",
                }}
              >
                {isCredit ? "Add Money" : "Spend Money"}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={closeDrawer}
                sx={{
                  mt: 1,
                  borderRadius: "14px",
                  textTransform: "none",
                  fontWeight: 500,
                  color: "text.secondary",
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}