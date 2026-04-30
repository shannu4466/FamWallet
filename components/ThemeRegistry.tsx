"use client";

import * as React from "react";
import {
    ThemeProvider,
    createTheme,
    CssBaseline,
    PaletteMode,
} from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

type ThemeContextType = {
    mode: PaletteMode;
    toggleTheme: () => void;
};

export const ColorModeContext = React.createContext<ThemeContextType>({
    mode: "light",
    toggleTheme: () => { },
});

type Props = {
    children: React.ReactNode;
};

export default function ThemeRegistry({ children }: Props) {
    const [mode, setMode] = React.useState<PaletteMode>("light");

    // Load saved theme from localStorage
    React.useEffect(() => {
        const savedMode = localStorage.getItem("themeMode") as PaletteMode | null;

        if (savedMode === "light" || savedMode === "dark") {
            setMode(savedMode);
        }
    }, []);

    const toggleTheme = () => {
        const newMode = mode === "light" ? "dark" : "light";

        setMode(newMode);
        localStorage.setItem("themeMode", newMode);
    };

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: mode === "light" ? "#1976d2" : "#90caf9",
                    },
                    secondary: {
                        main: mode === "light" ? "#9c27b0" : "#ce93d8",
                    },
                    background: {
                        default: mode === "light" ? "#f5f5f5" : "#121212",
                        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
                    },
                },
                shape: {
                    borderRadius: 10,
                },
                typography: {
                    fontFamily: "Roboto, sans-serif",
                },
            }),
        [mode]
    );

    return (
        <AppRouterCacheProvider>
            <ColorModeContext.Provider value={{ mode, toggleTheme }}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    {children}
                </ThemeProvider>
            </ColorModeContext.Provider>
        </AppRouterCacheProvider>
    );
}