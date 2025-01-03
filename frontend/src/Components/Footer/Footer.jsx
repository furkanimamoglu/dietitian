import React from 'react';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function Footer() {
    return (
        <footer style={{marginTop: 'auto', padding: '0.5rem', backgroundColor: '#3d8a3d'}}>
            <Container>
                <Typography variant="body2" color="white" align="center">
                    &copy; 2024 Diyetisyen Uygulaması
                </Typography>
            </Container>
        </footer>
    );
};