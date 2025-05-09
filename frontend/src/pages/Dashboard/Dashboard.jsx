import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Default from "../../Components/Layouts/Default.jsx";
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Avatar, 
  IconButton, 
  TextField,
  Stack
} from '@mui/material';
import { 
  People as PeopleIcon, 
  Event as EventIcon, 
  Notifications as NotificationsIcon, 
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import axios from 'axios';
import config from "../../config.js";

export default function Dashboard() {
    const [noteText, setNoteText] = useState('');
    const [notes, setNotes] = useState([
        'Ahmet Yılmaz için yeni diyet planı hazırla',
        'Aylık ilerleme raporlarını hazırla',
        'Yeni danışan formlarını güncelle',
        'Haftalık beslenme bülteni gönder',
        'Yeni sağlıklı tarifler araştır'
    ]);
    const [todayAppointments, setTodayAppointments] = useState(0);
    const [remainingAppointments, setRemainingAppointments] = useState(0);
    const [pendingRequests, setPendingRequests] = useState(0);
    const [activeClients, setActiveClients] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchTodayAppointments(),
                    fetchRemainingAppointments(),
                    fetchPendingRequests(),
                    fetchActiveClients()
                ]);
            } catch (error) {
                console.error("Dashboard verileri çekilirken bir hata oluştu:", error);
            } finally {
                setLoading(false);
            }
        };
        
        const fetchTodayAppointments = async () => {
            try {
                const response = await axios.get(
                    config[config.environment].apiUrl + "/appointment/getTodayAppointmentCount",
                    {
                        headers: {
                            Authorization: localStorage.getItem('token')
                        }
                    }
                );
                setTodayAppointments(response.data.count);
            } catch (error) {
                console.error("Bugünkü randevu sayısı çekilirken bir hata oluştu:", error);
                setTodayAppointments(0);
            }
        };

        const fetchRemainingAppointments = async () => {
            try {
                const response = await axios.get(
                    config[config.environment].apiUrl + "/appointment/getRemainingTodayAppointmentCount",
                    {
                        headers: {
                            Authorization: localStorage.getItem('token')
                        }
                    }
                );
                setRemainingAppointments(response.data.count);
            } catch (error) {
                console.error("Kalan randevu sayısı çekilirken bir hata oluştu:", error);
                setRemainingAppointments(0);
            }
        };

        const fetchPendingRequests = async () => {
            try {
                const response = await axios.get(
                    config[config.environment].apiUrl + "/appointment/getPendingAppointmentCount",
                    {
                        headers: {
                            Authorization: localStorage.getItem('token')
                        }
                    }
                );
                setPendingRequests(response.data.count);
            } catch (error) {
                console.error("Bekleyen talep sayısı çekilirken bir hata oluştu:", error);
                setPendingRequests(0);
            }
        };

        const fetchActiveClients = async () => {
            try {
                const response = await axios.get(
                    config[config.environment].apiUrl + "/dietitian/getMyActiveClientCount",
                    {
                        headers: {
                            Authorization: localStorage.getItem('token')
                        }
                    }
                );
                setActiveClients(response.data.count);
            } catch (error) {
                console.error("Aktif danışan sayısı çekilirken bir hata oluştu:", error);
                setActiveClients(0);
            }
        };

        fetchDashboardData();
    }, []);

    const handleAddNote = (e) => {
        e.preventDefault();
        if (noteText.trim()) {
            setNotes([...notes, noteText]);
            setNoteText('');
        }
    };

    const handleDeleteNote = (index) => {
        const newNotes = [...notes];
        newNotes.splice(index, 1);
        setNotes(newNotes);
    };

    const statCards = [
        {
            icon: <PeopleIcon />,
            value: loading ? '...' : activeClients,
            label: 'Aktif Danışan',
            color: '#8884d8',
            bgColor: '#f5f5ff'
        },
        {
            icon: <EventIcon />,
            value: loading ? '...' : todayAppointments,
            label: 'Bugünkü Randevu',
            color: '#82ca9d',
            bgColor: '#f0fff4'
        },
        {
            icon: <NotificationsIcon />,
            value: loading ? '...' : pendingRequests,
            label: 'Bekleyen Talep',
            color: '#ffc658',
            bgColor: '#fff9e6'
        },
        {
            icon: <EventIcon />,
            value: loading ? '...' : remainingAppointments,
            label: 'Kalan Randevu',
            color: '#ff8042',
            bgColor: '#fff1ec'
        }
    ];

    return (
        <Default>
            <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#f8f9fa', minHeight: '70vh' }}>
                {/* Stats Section */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {statCards.map((card, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    bgcolor: card.bgColor,
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: 'rgba(0, 0, 0, 0.05)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 20px -10px rgba(0,0,0,0.1)',
                                        '& .stat-icon': {
                                            transform: 'scale(1.1) rotate(10deg)',
                                        }
                                    }
                                }}
                            >
                                <Box sx={{ position: 'relative' }}>
                                    <Box sx={{ mb: 3 }}>
                                        <Avatar
                                            className="stat-icon"
                                            sx={{
                                                bgcolor: 'transparent',
                                                color: card.color,
                                                width: 48,
                                                height: 48,
                                                transition: 'transform 0.3s ease',
                                                '& svg': {
                                                    fontSize: 28
                                                }
                                            }}
                                        >
                                            {card.icon}
                                        </Avatar>
                                    </Box>
                                    <Typography 
                                        variant="h3" 
                                        sx={{ 
                                            fontWeight: 700,
                                            color: card.color,
                                            mb: 1,
                                            fontSize: '2.5rem',
                                            opacity: loading ? 0.7 : 1
                                        }}
                                    >
                                        {card.value}
                                    </Typography>
                                    <Typography 
                                        variant="subtitle1" 
                                        sx={{ 
                                            color: 'text.secondary',
                                            fontWeight: 500,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        {card.label}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* Main Content */}
                <Grid container spacing={3}>
                    {/* Appointments Card */}
                    <Grid item xs={12} md={6}>
                        <Card 
                            elevation={2} 
                            sx={{ 
                                borderRadius: 2, 
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: 3
                                }
                            }}
                        >
                            <CardHeader
                                title="Bugünkü Randevular"
                                action={
                                    <Button color="primary" size="small">Tümünü Gör</Button>
                                }
                                sx={{ pb: 1 }}
                            />
                            <Divider />
                            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                                <List>
                                    <ListItem 
                                        secondaryAction={
                                            <Chip 
                                                label="Yeni" 
                                                size="small" 
                                                sx={{ bgcolor: '#3498db', color: 'white' }} 
                                            />
                                        }
                                    >
                                        <Box sx={{ 
                                            bgcolor: '#f8f9fa', 
                                            borderRadius: 1, 
                                            p: '6px 10px', 
                                            mr: 2, 
                                            minWidth: 60, 
                                            textAlign: 'center' 
                                        }}>
                                            <Typography variant="body2" fontWeight="bold">09:00</Typography>
                                        </Box>
                                        <ListItemText 
                                            primary="Ahmet Yılmaz" 
                                            secondary="İlk Değerlendirme • 45 dakika" 
                                        />
                                    </ListItem>
                                    <Divider component="li" variant="inset" />
                                    
                                    <ListItem 
                                        secondaryAction={
                                            <Chip 
                                                label="Düzenli" 
                                                size="small" 
                                                sx={{ bgcolor: '#2ecc71', color: 'white' }} 
                                            />
                                        }
                                    >
                                        <Box sx={{ 
                                            bgcolor: '#f8f9fa', 
                                            borderRadius: 1, 
                                            p: '6px 10px', 
                                            mr: 2, 
                                            minWidth: 60, 
                                            textAlign: 'center' 
                                        }}>
                                            <Typography variant="body2" fontWeight="bold">11:30</Typography>
                                        </Box>
                                        <ListItemText 
                                            primary="Ayşe Kara" 
                                            secondary="Kontrol • 30 dakika" 
                                        />
                                    </ListItem>
                                    <Divider component="li" variant="inset" />
                                    
                                    <ListItem 
                                        secondaryAction={
                                            <Chip 
                                                label="Düzenli" 
                                                size="small" 
                                                sx={{ bgcolor: '#2ecc71', color: 'white' }} 
                                            />
                                        }
                                    >
                                        <Box sx={{ 
                                            bgcolor: '#f8f9fa', 
                                            borderRadius: 1, 
                                            p: '6px 10px', 
                                            mr: 2, 
                                            minWidth: 60, 
                                            textAlign: 'center' 
                                        }}>
                                            <Typography variant="body2" fontWeight="bold">14:15</Typography>
                                        </Box>
                                        <ListItemText 
                                            primary="Mehmet Demir" 
                                            secondary="İlerleme Değerlendirmesi • 30 dakika" 
                                        />
                                    </ListItem>
                                    <Divider component="li" variant="inset" />
                                    
                                    <ListItem 
                                        secondaryAction={
                                            <Chip 
                                                label="Acil" 
                                                size="small" 
                                                sx={{ bgcolor: '#e74c3c', color: 'white' }} 
                                            />
                                        }
                                    >
                                        <Box sx={{ 
                                            bgcolor: '#f8f9fa', 
                                            borderRadius: 1, 
                                            p: '6px 10px', 
                                            mr: 2, 
                                            minWidth: 60, 
                                            textAlign: 'center' 
                                        }}>
                                            <Typography variant="body2" fontWeight="bold">16:45</Typography>
                                        </Box>
                                        <ListItemText 
                                            primary="Zeynep Aydın" 
                                            secondary="Diyet Planı Güncelleme • 45 dakika" 
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Requests Card */}
                    <Grid item xs={12} md={6}>
                        <Card 
                            elevation={2} 
                            sx={{ 
                                borderRadius: 2, 
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: 3
                                }
                            }}
                        >
                            <CardHeader
                                title="Randevu Talepleri"
                                action={
                                    <Button color="primary" size="small">Tümünü Gör</Button>
                                }
                                sx={{ pb: 1 }}
                            />
                            <Divider />
                            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, maxHeight: 360, overflow: 'auto' }}>
                                <List>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Ali Veli" 
                                            secondary="16:00 - Pazartesi • İlk Görüşme" 
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button variant="contained" color="success" size="small">Onayla</Button>
                                            <Button variant="contained" color="error" size="small">Reddet</Button>
                                        </Box>
                                    </ListItem>
                                    <Divider component="li" />
                                    
                                    <ListItem>
                                        <ListItemText 
                                            primary="Fatma Nur" 
                                            secondary="12:00 - Salı • Kontrol Randevusu" 
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button variant="contained" color="success" size="small">Onayla</Button>
                                            <Button variant="contained" color="error" size="small">Reddet</Button>
                                        </Box>
                                    </ListItem>
                                    <Divider component="li" />
                                    
                                    <ListItem>
                                        <ListItemText 
                                            primary="Emre Can" 
                                            secondary="14:30 - Çarşamba • Diyet Planı" 
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button variant="contained" color="success" size="small">Onayla</Button>
                                            <Button variant="contained" color="error" size="small">Reddet</Button>
                                        </Box>
                                    </ListItem>
                                    <Divider component="li" />
                                    
                                    <ListItem>
                                        <ListItemText 
                                            primary="Selin Yıldız" 
                                            secondary="10:15 - Perşembe • İlk Görüşme" 
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button variant="contained" color="success" size="small">Onayla</Button>
                                            <Button variant="contained" color="error" size="small">Reddet</Button>
                                        </Box>
                                    </ListItem>
                                    <Divider component="li" />
                                    
                                    <ListItem>
                                        <ListItemText 
                                            primary="Burak Şahin" 
                                            secondary="15:45 - Cuma • Kontrol Randevusu" 
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button variant="contained" color="success" size="small">Onayla</Button>
                                            <Button variant="contained" color="error" size="small">Reddet</Button>
                                        </Box>
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Clients Card */}
                    <Grid item xs={12} md={6}>
                        <Card 
                            elevation={2} 
                            sx={{ 
                                borderRadius: 2, 
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: 3
                                }
                            }}
                        >
                            <CardHeader
                                title="Son Danışanlar"
                                action={
                                    <Button color="primary" size="small">Tüm Danışanlar</Button>
                                }
                                sx={{ pb: 1 }}
                            />
                            <Divider />
                            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                                <List>
                                    <ListItem>
                                        <Avatar sx={{ bgcolor: '#3498db', mr: 2 }}>AY</Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1">Ahmet Yılmaz</Typography>
                                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                                <Chip 
                                                    icon={<CheckCircleIcon fontSize="small" />}
                                                    label="Kahvaltı" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#d5f5e3', color: '#27ae60', fontSize: '0.75rem' }} 
                                                />
                                                <Chip 
                                                    icon={<CheckCircleIcon fontSize="small" />}
                                                    label="Öğle" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#d5f5e3', color: '#27ae60', fontSize: '0.75rem' }} 
                                                />
                                                <Chip 
                                                    icon={<RadioButtonUncheckedIcon fontSize="small" />}
                                                    label="Akşam" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#f1f2f6', color: '#7f8c8d', fontSize: '0.75rem' }} 
                                                />
                                                <Chip 
                                                    label="Su (4/8)" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#f1f2f6', color: '#7f8c8d', fontSize: '0.75rem' }} 
                                                />
                                            </Stack>
                                        </Box>
                                    </ListItem>
                                    <Divider component="li" />
                                    
                                    <ListItem>
                                        <Avatar sx={{ bgcolor: '#9b59b6', mr: 2 }}>MK</Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1">Merve Koç</Typography>
                                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                                <Chip 
                                                    icon={<CheckCircleIcon fontSize="small" />}
                                                    label="Kahvaltı" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#d5f5e3', color: '#27ae60', fontSize: '0.75rem' }} 
                                                />
                                                <Chip 
                                                    icon={<CheckCircleIcon fontSize="small" />}
                                                    label="Öğle" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#d5f5e3', color: '#27ae60', fontSize: '0.75rem' }} 
                                                />
                                                <Chip 
                                                    icon={<CheckCircleIcon fontSize="small" />}
                                                    label="Akşam" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#d5f5e3', color: '#27ae60', fontSize: '0.75rem' }} 
                                                />
                                                <Chip 
                                                    label="Su (7/8)" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#f1f2f6', color: '#7f8c8d', fontSize: '0.75rem' }} 
                                                />
                                            </Stack>
                                        </Box>
                                    </ListItem>
                                    <Divider component="li" />
                                    
                                    <ListItem>
                                        <Avatar sx={{ bgcolor: '#e74c3c', mr: 2 }}>SD</Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1">Serkan Demir</Typography>
                                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                                <Chip 
                                                    icon={<CheckCircleIcon fontSize="small" />}
                                                    label="Kahvaltı" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#d5f5e3', color: '#27ae60', fontSize: '0.75rem' }} 
                                                />
                                                <Chip 
                                                    icon={<RadioButtonUncheckedIcon fontSize="small" />}
                                                    label="Öğle" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#f1f2f6', color: '#7f8c8d', fontSize: '0.75rem' }} 
                                                />
                                                <Chip 
                                                    icon={<RadioButtonUncheckedIcon fontSize="small" />}
                                                    label="Akşam" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#f1f2f6', color: '#7f8c8d', fontSize: '0.75rem' }} 
                                                />
                                                <Chip 
                                                    label="Su (2/8)" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#f1f2f6', color: '#7f8c8d', fontSize: '0.75rem' }} 
                                                />
                                            </Stack>
                                        </Box>
                                    </ListItem>
                                    <Divider component="li" />
                                    
                                    <ListItem>
                                        <Avatar sx={{ bgcolor: '#2ecc71', mr: 2 }}>EA</Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1">Elif Arslan</Typography>
                                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                                <Chip 
                                                    icon={<CheckCircleIcon fontSize="small" />}
                                                    label="Kahvaltı" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#d5f5e3', color: '#27ae60', fontSize: '0.75rem' }} 
                                                />
                                                <Chip 
                                                    icon={<CheckCircleIcon fontSize="small" />}
                                                    label="Öğle" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#d5f5e3', color: '#27ae60', fontSize: '0.75rem' }} 
                                                />
                                                <Chip 
                                                    icon={<RadioButtonUncheckedIcon fontSize="small" />}
                                                    label="Akşam" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#f1f2f6', color: '#7f8c8d', fontSize: '0.75rem' }} 
                                                />
                                                <Chip 
                                                    label="Su (6/8)" 
                                                    size="small" 
                                                    sx={{ bgcolor: '#f1f2f6', color: '#7f8c8d', fontSize: '0.75rem' }} 
                                                />
                                            </Stack>
                                        </Box>
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Notes Card */}
                    <Grid item xs={12} md={6}>
                        <Card 
                            elevation={2} 
                            sx={{ 
                                borderRadius: 2, 
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: 3
                                }
                            }}
                        >
                            <CardHeader
                                title="Notlarım"
                                sx={{ pb: 1 }}
                            />
                            <Divider />
                            <CardContent>
                                <Box component="form" onSubmit={handleAddNote} sx={{ mb: 2, display: 'flex' }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Yeni not ekle..."
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        sx={{ mr: 1 }}
                                    />
                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        startIcon={<AddIcon />}
                                    >
                                        Ekle
                                    </Button>
                                </Box>
                                
                                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    {notes.map((note, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem
                                                secondaryAction={
                                                    <IconButton 
                                                        edge="end" 
                                                        aria-label="delete"
                                                        onClick={() => handleDeleteNote(index)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                }
                                                sx={{ 
                                                    bgcolor: '#f8f9fa', 
                                                    borderRadius: 1, 
                                                    mb: 1,
                                                    borderLeft: '3px solid #3498db'
                                                }}
                                            >
                                                <ListItemText primary={note} />
                                            </ListItem>
                                            {index < notes.length - 1 && <Box sx={{ mb: 1 }} />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Default>
    );
};
