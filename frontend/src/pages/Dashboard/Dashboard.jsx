import React from 'react';
import './Dashboard.css';
import Default from "../../components/Layouts/Default.jsx";
import { Grid2, Paper, Typography, Box, List, ListItem, ListItemText, Button, Divider } from '@mui/material';
import { Event, Notes, Notifications, TrendingUp } from '@mui/icons-material';

export default function Dashboard() {
    return (
        <Default>
            <Grid2 container spacing={3}>
                {/* Yaklaşan Randevular */}
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={3} sx={{ minHeight: '35vh', padding: 2, backgroundColor: '#bbdefb' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Event fontSize="large" />
                            <Typography variant="h6">Yaklaşan Randevular</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <List>
                            <ListItem>
                                <ListItemText primary="13:00 - Dr. Ahmet Yılmaz" secondary="Diyet planı kontrolü" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="15:30 - Dr. Ayşe Kara" secondary="Yeniden değerlendirme" />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid2>

                {/* Notlarım */}
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={3} sx={{ minHeight: '35vh', padding: 2, backgroundColor: '#fff9c4' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Notes fontSize="large" />
                            <Typography variant="h6">Notlarım</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" sx={{ color: 'gray' }}>
                            - Yeni diyet planı oluşturulacak
                            <br />
                            - Su içmeyi unutmamalısın!
                            <br />
                            - Egzersiz rutini oluşturulacak.
                        </Typography>
                    </Paper>
                </Grid2>

                {/* Randevu Talepleri */}
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={3} sx={{ minHeight: '35vh', padding: 2, backgroundColor: '#ffccbc' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Notifications fontSize="large" />
                            <Typography variant="h6">Randevu Talepleri</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <List>
                            <ListItem>
                                <ListItemText primary="Ali Veli" secondary="16:00 - Randevu talebi" />
                                <Box display="flex" gap={1}>
                                    <Button variant="contained" color="success" size="small">
                                        Onayla
                                    </Button>
                                    <Button variant="contained" color="error" size="small">
                                        Reddet
                                    </Button>
                                </Box>
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="Fatma Nur" secondary="12:00 - Randevu talebi" />
                                <Box display="flex" gap={1}>
                                    <Button variant="contained" color="success" size="small">
                                        Onayla
                                    </Button>
                                    <Button variant="contained" color="error" size="small">
                                        Reddet
                                    </Button>
                                </Box>
                            </ListItem>
                        </List>
                    </Paper>
                </Grid2>

                {/* Hareketler */}
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper elevation={3} sx={{ minHeight: '35vh', padding: 2, backgroundColor: '#c8e6c9' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <TrendingUp fontSize="large" />
                            <Typography variant="h6">Hareketler</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2">
                            - 15 dakika yürüyüş
                            <br />
                            - 10 dakika meditasyon
                            <br />
                            - 1 litre su içildi
                        </Typography>
                    </Paper>
                </Grid2>
            </Grid2>
        </Default>
    );
};
