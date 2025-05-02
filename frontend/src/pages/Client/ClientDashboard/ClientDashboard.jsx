import React from 'react';
import './ClientDashboard.css';
import { Grid2 } from '@mui/material';
import Default from "../../../Components/Layouts/Default.jsx";

export default function Dashboard() {
    return (
        <Default>
            <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>

                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>

                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>

                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>

                </Grid2>
            </Grid2>
        </Default>
    );
};
