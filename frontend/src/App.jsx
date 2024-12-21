import React from 'react';

// MUI
import {Box, CssBaseline} from "@mui/material";

// Router
import { BrowserRouter as Router} from 'react-router-dom'

// Components
import Footer from './Components/Footer/Footer'

// Routes
import Routing from './routes/Routing'

export default function App() {
    return (
        <Router>
            <Box display="flex" flexDirection="column" minHeight="100vh">
                <CssBaseline />
                    <Routing />
                <Footer />
            </Box>
        </Router>
    );
}