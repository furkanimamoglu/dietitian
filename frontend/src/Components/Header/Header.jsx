import React from 'react';

import './Header.css';

import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

// Config
import config from '../../config.js'

export default function Header() {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6">
                    {config[config.environment].websiteName}
                </Typography>
            </Toolbar>
        </AppBar>
    );
}