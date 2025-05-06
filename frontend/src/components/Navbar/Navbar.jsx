import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useNavigate, useLocation } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PeopleIcon from "@mui/icons-material/People";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import "./Navbar.css";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const menu_items = [
        { name: "DANIŞANLARIM", route: "/danisanlarim", icon: <PeopleIcon /> },
        { name: "RANDEVULARIM", route: "/randevularim", icon: <EventNoteIcon /> },
        { name: "BESLENME", route: "/beslenme", icon: <LocalDiningIcon /> },
        { name: "TARİFLER", route: "/tarif", icon: <RestaurantMenuIcon /> },
        { name: "EGZERSİZLER", route: "/egzersiz", icon: <FitnessCenterIcon /> },
        { name: "FİNANS", route: "/finans", icon: <AccountBalanceWalletIcon /> },
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box sx={{ width: 250 }} onClick={handleDrawerToggle}>
            <Box sx={{ p: 2, backgroundColor: "rgb(238,255,238)", textAlign: "center" }}>
                <h3 className="drawer-title">Menü</h3>
            </Box>
            <Divider />
            <List>
                {menu_items.map((item) => (
                    <ListItem
                        button
                        key={item.name}
                        onClick={() => navigate(item.route)}
                        className={location.pathname === item.route ? "active-mobile-item" : ""}
                    >
                        <Box sx={{ mr: 2, color: "rgb(14,62,10)" }}>{item.icon}</Box>
                        <ListItemText primary={item.name} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            {/* Mobil görünüm için */}
            <AppBar
                position="fixed"
                className={`mobile-navbar ${scrolled ? "scrolled" : ""}`}
                sx={{
                    display: { xs: "flex", md: "none" },
                    backgroundColor: scrolled ? "rgba(238,255,238,0.95)" : "rgb(255,244,238)",
                    boxShadow: scrolled ? "0 2px 10px rgba(0,0,0,0.2)" : "none"
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ color: "rgb(62,36,10)" }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1, textAlign: "center" }}>
                        <h1 className="mobile-title">Diyetisyen App</h1>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": { width: 250 },
                }}
            >
                {drawer}
            </Drawer>

            {/* Desktop navbar */}
            <AppBar
                position="fixed"
                className={`desktop-navbar ${scrolled ? "scrolled" : ""}`}
                sx={{
                    backgroundColor: scrolled ? "rgba(238,255,238,0.95)" : "rgb(238,255,238)",
                    display: { xs: "none", md: "flex" },
                    mt: scrolled ? 0 : "4rem",
                    boxShadow: scrolled ? "0 2px 10px rgba(0,0,0,0.2)" : "0 4px 6px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    zIndex: 500,
                }}
            >
                <Toolbar disableGutters>
                    <Box
                        sx={{
                            flexGrow: 1,
                            ml: "2.5rem",
                            mr: "2.5rem",
                            justifyContent: "center",
                            display: "flex",
                        }}
                    >
                        {menu_items.map((page) => {
                            const isActive = location.pathname === page.route;
                            return (
                                <Button
                                    key={page.name}
                                    onClick={() => navigate(page.route)}
                                    className={`nav-button ${isActive ? "active" : ""}`}
                                    sx={{
                                        my: 2,
                                        mx: 1,
                                        fontWeight: "bold",
                                        color: "rgb(14,62,10)",
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "8px 16px",
                                        borderRadius: "30px",
                                        backgroundColor: isActive
                                            ? "rgba(71,145,64,0.25)"
                                            : "transparent",
                                        "&:hover": {
                                            backgroundColor: "rgba(71,145,64,0.15)",
                                            transform: "translateY(-2px)",
                                        },
                                        transition: "all 0.3s ease",
                                        position: "relative",
                                        overflow: "hidden",
                                        "&::after": isActive ? {
                                            content: '""',
                                            position: "absolute",
                                            bottom: "5px",
                                            left: "15%",
                                            width: "70%",
                                            height: "3px",
                                            backgroundColor: "rgb(71,145,64)",
                                            borderRadius: "10px",
                                        } : {},
                                    }}
                                >
                                    <Box sx={{ mr: 1 }}>{page.icon}</Box>
                                    {page.name}
                                </Button>
                            );
                        })}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Navbar için boşluk bırakma komponentini kaldırdım */}
        </>
    );
}