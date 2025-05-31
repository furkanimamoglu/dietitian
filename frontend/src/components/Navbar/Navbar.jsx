import React, {useState} from "react";
import Box from "@mui/material/Box";
import {useLocation, useNavigate} from "react-router-dom";
import Button from "@mui/material/Button";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import "./Navbar.css";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    const menu_items = [
        {name: "ANA SAYFA", route: "/anasayfa", icon: <HomeIcon/>},
        {name: "DANIŞANLARIM", route: "/danisanlarim", icon: <PeopleIcon/>},
        {name: "RANDEVULARIM", route: "/randevularim", icon: <EventNoteIcon/>},
        {name: "BESLENME", route: "/beslenme", icon: <LocalDiningIcon/>},
        {name: "TARİFLER", route: "/tarif", icon: <RestaurantMenuIcon/>},
        {name: "EGZERSİZLER", route: "/egzersiz", icon: <FitnessCenterIcon/>},
        {name: "FİNANS", route: "/finans", icon: <AccountBalanceWalletIcon/>},
    ];

    return (
        <>
            {/* Desktop navbar */}
            <Box
                className={`desktop-navbar ${scrolled ? "scrolled" : ""}`}
                sx={{
                    backgroundColor: scrolled ? "rgba(238,255,238,0.95)" : "rgb(238,255,238)",
                    display: {xs: "none", md: "flex"},
                    position: 'sticky',
                    top: '65px',
                    mt: "1rem",
                    boxShadow: scrolled ? "0 2px 10px rgba(0,0,0,0.2)" : "0 4px 6px rgba(0,0,0,0.1)",
                    transition: "background-color 0.3s ease, box-shadow 0.3s ease",
                    zIndex: 100,
                    borderRadius: 0,
                    justifyContent: "center",
                    width: "100%"
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        ml: "2.5rem",
                        mr: "2.5rem",
                        justifyContent: "center",
                    }}
                >
                    {menu_items.map((page, idx) => {
                        const isActive = location.pathname === page.route;
                        return (
                            <React.Fragment key={page.name}>
                                <Button
                                    onClick={() => navigate(page.route)}
                                    className={`nav-button ${isActive ? "active" : ""}`}
                                    sx={{
                                        my: 2,
                                        mx: 1.5,
                                        fontWeight: isActive ? "600" : "500",
                                        color: isActive ? "rgb(10,50,8)" : "rgb(14,62,10)",
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "8px 16px",
                                        borderRadius: "30px",
                                        backgroundColor: isActive
                                            ? "rgba(71,145,64,0.2)"
                                            : "transparent",
                                        "&:hover": {
                                            backgroundColor: "rgba(71,145,64,0.1)",
                                            boxShadow: "0 4px 8px rgba(71,145,64,0.15)",
                                        },
                                        transition: "all 0.3s ease",
                                        position: "relative",
                                        overflow: "visible",
                                        zIndex: 0,
                                        "&::after": isActive ? {
                                            content: '""',
                                            position: "absolute",
                                            bottom: "5px",
                                            left: "15%",
                                            width: "70%",
                                            height: "3px",
                                            backgroundColor: "rgb(71,145,64)",
                                            borderRadius: "10px",
                                            zIndex: -1,
                                        } : {},
                                    }}
                                >
                                    <Box sx={{mr: 1, color: isActive ? "rgb(71,145,64)" : "inherit"}}>
                                        {page.icon}
                                    </Box>
                                    <Box sx={{fontWeight: "bold"}}>{page.name}</Box>
                                </Button>
                                {idx !== menu_items.length - 1 && (
                                    <span className="navbar-divider">|</span>
                                )}
                            </React.Fragment>
                        );
                    })}
                </Box>
            </Box>
        </>
    );
}