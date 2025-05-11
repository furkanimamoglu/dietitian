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
                        &copy; {new Date().getFullYear()} Diyetisyen Uygulaması. Sevgiyle hazırlandı 
                        <FavoriteIcon fontSize="small" color="error" sx={{ mx: 0.5, animation: 'pulse 1.5s infinite' }} />
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};