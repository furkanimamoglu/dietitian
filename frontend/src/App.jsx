import React from 'react';

// MUI
import {Box, CssBaseline, Grid2 as Grid} from "@mui/material";

// Router
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

// Components
import Header from './Components/Header/Header'
import Footer from './Components/Footer/Footer'
import Sidebar from './Components/Sidebar/Sidebar'

// Routes
import Routing from './routes/Routing'

export default function App() {
    return (
        <Router>
            <Box display="flex" flexDirection="column" minHeight="100vh">
                <CssBaseline />
                <Header />
                <Sidebar />
                <Box flex="1">
                    <Routing />
                </Box>
                <Footer />
            </Box>
        </Router>
    );
}