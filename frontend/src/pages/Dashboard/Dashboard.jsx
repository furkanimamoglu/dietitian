import React from 'react';
import './Dashboard.css';
import Default from "../../components/Layouts/Default.jsx";
import { Grid2, Paper, Typography } from '@mui/material';

export default function Dashboard() {

    return (
        <Default>
            <Grid2 container spacing={3}>
                <Grid2 item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">Yaklaşan Randevular</Typography>
                        <Typography>Buraya yaklasan randevular gelecek.</Typography>
                    </Paper>
                </Grid2>

                <Grid2 item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">Randevu İstekleri</Typography>
                        <Typography>Buraya randevu istekleri gelecek.</Typography>
                    </Paper>
                </Grid2>

                <Grid2 item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">Kendi Notlarım</Typography>
                        <Typography>Buraya kendi notlarınız gelecek.</Typography>
                    </Paper>
                </Grid2>

                <Grid2 item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">Hareketler</Typography>
                        <Typography>Buraya hareketler gelecek.</Typography>
                    </Paper>
                </Grid2>
            </Grid2>
        </Default>
    );
};
