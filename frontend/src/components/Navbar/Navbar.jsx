import React from 'react';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";


export default function Navbar() {

    const pages = [
        {name: 'Danışanlarım', route: '/danisan'},
        {name: 'Randevularım', route: '/randevularim'},
        {name: 'Beslenme', route: '/beslenme'},
        {name: 'Tarifler', route: '/tarif'},
        {name: 'Egzersizler', route: '/egzersiz'},
        {name: 'Muhasebe', route: '/muhasebe'}
    ];

    return (
        <AppBar sx={{backgroundColor: 'rgb(238,255,238)', boxShadow: "0 4px 6px rgba(0,0,0,0.1)"}} position="static">
            <Toolbar disableGutters>
                <Container maxWidth="xl">
                    <Box sx={{flexGrow: 1, gap: 2, display: {xs: 'flex', md: 'flex'}}}>
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
                                        borderRadius: 5,
                                    }}
                                >
                                    {
                                        page.name
                                    }
                                </Button>
                            ))
                        }
                    </Box>
                </Container>
            </Toolbar>
        </AppBar>
    );
};