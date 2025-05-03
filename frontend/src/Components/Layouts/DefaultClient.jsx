import React from 'react';

import ClientHeader from "../Client/ClientHeader/ClientHeader.jsx";
import ClientNavbar from "../Client/ClientNavbar/ClientNavbar.jsx";
import Footer from "../Footer/Footer.jsx";
import {Box} from "@mui/material";

export default function ClientHeader(props) {
    return (
        <>
            <ClientHeader/>
            <ClientNavbar/>
            <Box
                sx={{
                    flex: 1,
                    height: 'calc(100vh - 120px)',
                    overflowY: 'auto',
                    overflowX: 'auto',
                    padding: '1rem',
                    mt: { xs: '3rem', sm: '8rem' },
                }}
            >
                {props.children}
            </Box>
            <Footer/>
        </>
    );
};