import React from 'react';

import {Box, CssBaseline} from "@mui/material";
import {BrowserRouter as Router} from 'react-router-dom'
import Routing from './routes/Routing'
import {Toaster} from 'react-hot-toast';

export default function App() {
    return (
        <Router>
            <Box display="flex" flexDirection="column" minHeight="100vh">
                <CssBaseline/>
                <Routing/>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        success: {
                            style: {
                                background: '#4CAF50',
                                color: 'white',
                            },
                        },
                        error: {
                            style: {
                                background: '#F44336',
                                color: 'white',
                            },
                        },
                        duration: 3000,
                    }}
                    containerStyle={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        marginBottom: '5rem',
                        marginRight: '2.5rem',
                    }}
                />
            </Box>
        </Router>
    );
}