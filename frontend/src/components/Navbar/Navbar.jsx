import React from 'react';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";


export default function Navbar() {

    const pages = [
        {name: 'Danışan', route: '/danisan'},
        {name: 'Danışanlarım', route: '/danisanlarim'},
        {name: 'Randevularım', route: '/randevularim'},
        {name: 'Beslenme', route: '/beslenme'},
        {name: 'Tarifler', route: '/tarif'},
        {name: 'Egzersizler', route: '/egzersiz'},
        {name: 'Ödemeler', route: '/odeme'}
    ];

    return (
        <AppBar sx={{backgroundColor: 'rgb(238,255,238)', display: {xs: 'none', md: 'flex'}, mt:"5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"}} position="static">
            <Toolbar disableGutters>
                    <Box sx={{flexGrow: 1, ml:"2.5rem", mr: "2.5rem", pd: "2.5rem", gap: "2rem", display: {xs: 'none', md: 'flex'}}}>
                        {/* PC Version */}
                        {
                            pages.map((page) => (
                                <Button
                                    href={page.route}
                                    key={page.name}
                                    sx={{
                                        backgroundColor: 'primary.secondary',
                                        my: 2,
                                        fontWeight: "bold",
                                        color: 'rgb(14,62,10)',
                                        display: 'block',
                                        "&:hover": {
                                            backgroundColor: "rgba(71,145,64,0.39)",
                                        },
                                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                        transition: "box-shadow 0.3s ease",
                                        borderRight: "3px solid rgba(71,145,64,0.39)",
                                        borderRadius: "2.5rem",
                                    }}
                                >
                                    {
                                        page.name
                                    }
                                </Button>
                            ))
                        }
                    </Box>
            </Toolbar>
        </AppBar>
    );
};