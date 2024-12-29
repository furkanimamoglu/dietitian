import React from 'react';
import './Danisan.css';
import Default from "../../components/Layouts/Default.jsx";
import Grid2 from '@mui/material/Grid2'; // Grid2 import edildi
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';

const DanisanInfo = {
    id: 1,
    name: "Ahmet Yılmaz",
    age: 30,
    gender: "Erkek",
    height: 175, // cm
    weight: 75,  // kg
    notes: "Düşük karbonhidrat diyeti uyguluyor."
};

export default function Danisan() {
    return (
        <Default>
            <Grid2 container sx={{ height: '100vh', gap: 2 }}>
                {/* İlk Parça */}
                <Grid2 xs={3}>
                    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            {/* Fotoğraf */}
                            <Avatar
                                src="/images/placeholder.jpg"
                                alt="Danışan Fotoğrafı"
                                sx={{
                                    width: '100px',
                                    height: '100px',
                                    border: '2px solid #ccc',
                                    borderRadius: '50%'
                                }}
                            />
                            {/* Kullanıcı Bilgileri Kartı */}
                            <Card sx={{ width: '100%', boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {DanisanInfo.name}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body1"><strong>Yaş:</strong> {DanisanInfo.age}</Typography>
                                    <Typography variant="body1"><strong>Cinsiyet:</strong> {DanisanInfo.gender}</Typography>
                                    <Typography variant="body1"><strong>Boy:</strong> {DanisanInfo.height} cm</Typography>
                                    <Typography variant="body1"><strong>Kilo:</strong> {DanisanInfo.weight} kg</Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        <strong>Notlar:</strong> {DanisanInfo.notes}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </Paper>
                </Grid2>

                {/* İkinci Parça */}
                <Grid2 xs={4}>
                    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                            Mevcut Diyet Programı
                        </Typography>
                        <Typography variant="body1">
                            Buraya diyet programı bilgileri eklenecek.
                        </Typography>
                    </Paper>
                </Grid2>

                {/* Üçüncü Parça */}
                <Grid2 xs={4}>
                    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                            Ölçüm Takibi
                        </Typography>
                        <Typography variant="body1">
                            Buraya ölçüm takibi bilgileri eklenecek.
                        </Typography>
                    </Paper>
                </Grid2>
            </Grid2>
        </Default>
    );
}
