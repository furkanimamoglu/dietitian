import React from 'react';

import Header from "../Header/Header.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";
import {Box} from "@mui/material";

export default function Default(props) {
    return (
        <>
            <Header/>
            <Navbar/>
            <Box
                sx={{
                    flex: 1,
                    height: 'calc(100vh - 120px)',
                    overflowY: 'auto',
                    overflowX: 'auto',
                    padding: '1rem',
                    mt: { xs: '3rem', sm: '2rem' },
                }}
            >
                {props.children}
            </Box>
            <Footer/>
        </>
    );
};