import React from 'react';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";


export default function Navbar() {

    const pages = [
        {name: 'Danışanlarım', route: '/danisan'},
        {name: 'Randevularım', route: '/anamnez'},
        {name: 'Beslenme', route: '/beslenme'},
        {name: 'Tarifler', route: '/tarif'},
        {name: 'Muhasebe', route: '/muhasebe'}
    ];

    return (
        <AppBar sx={{backgroundColor: 'rgb(238,255,238)'}} position="static">
            <Toolbar disableGutters>
                <Container maxWidth="xl">
                    <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'flex'}}}>
                        {/* PC Version */}
                        {
                            pages.map((page) => (
                                <Button
                                    href={page.route}
                                    key={page.name}
                                    sx={{backgroundColor: 'primary.secondary', my: 2, color: 'black', display: 'block'}}
                                >
                                    {page.name}
                                </Button>
                            ))
                        }
                    </Box>
                </Container>
            </Toolbar>
        </AppBar>
    );
};