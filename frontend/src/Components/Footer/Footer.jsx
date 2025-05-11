import React from 'react';
import './Footer.css';
import { Box, Typography, Container, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function Footer() {
    return (
        <Box component="footer" className="footer">
            <Container maxWidth="lg">
                <Box className="footer-bottom">
                    <Typography variant="body2" align="center" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        &copy; {new Date().getFullYear()} Diyetisyen Uygulaması.
                        <FavoriteIcon fontSize="small" color="error" />
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};