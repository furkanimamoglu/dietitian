import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    const pages = [
        { name: "DANIŞANLARIM", route: "/danisanlarim" },
        { name: "RANDEVULARIM", route: "/randevularim" },
        { name: "BESLENME", route: "/beslenme" },
        { name: "TARİFLER", route: "/tarif" },
        { name: "EGZERSİZLER", route: "/egzersiz" },
        { name: "FİNANS", route: "/finans" },
    ];

    return (
        <AppBar
            sx={{
                backgroundColor: "rgb(238,255,238)",
                display: { xs: "none", md: "flex" },
                mt: "4rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            }}
            position="fixed"
        >
            <Toolbar disableGutters>
                <Box
                    sx={{
                        flexGrow: 1,
                        ml: "2.5rem",
                        mr: "2.5rem",
                        pd: "2.5rem",
                        gap: "4rem",
                        justifyContent: "center",
                        display: { xs: "none", md: "flex" },
                    }}
                >
                    {/* PC Version */}
                    {pages.map((page) => (
                        <Button
                            key={page.name}
                            onClick={() => navigate(page.route)}
                            sx={{
                                backgroundColor: "primary.secondary",
                                my: 2,
                                fontWeight: "bold",
                                color: "rgb(14,62,10)",
                                display: "block",
                                "&:hover": {
                                    backgroundColor: "rgba(71,145,64,0.39)",
                                },
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                transition: "box-shadow 0.3s ease",
                                borderRight: "3px solid rgba(71,145,64,0.39)",
                                borderRadius: "2.5rem",
                            }}
                        >
                            {page.name}
                        </Button>
                    ))}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
