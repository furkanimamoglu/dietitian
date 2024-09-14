import React from 'react';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// Config
import config from '../../config.js'

export default function Footer() {
    return (
        <footer style={{ marginTop: 'auto', padding: '1rem', backgroundColor: '#f5f5f5' }}>
            <Container>
                <Typography variant="body2" color="textSecondary" align="center">
                    &copy; {config[config.environment].footerText}
                </Typography>
            </Container>
        </footer>
    );
};