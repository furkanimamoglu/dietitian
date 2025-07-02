import React, {useEffect, useRef, useState} from 'react';
import './Dashboard.css';
import Default from "../../Components/Layouts/Default.jsx";
import { useNavigate } from 'react-router-dom';

import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    TextField,
    Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';

import axios from 'axios';
import config from "../../config.js";

export default function Dashboard() {
    const [noteText, setNoteText] = useState('');
    const [notes, setNotes] = useState([]);
    const [todayAppointments, setTodayAppointments] = useState(0);
    const [remainingAppointments, setRemainingAppointments] = useState(0);
    const [pendingRequests, setPendingRequests] = useState(0);
    const [activeClients, setActiveClients] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [approvedAppointments, setApprovedAppointments] = useState([]);

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [approvedLimit, setApprovedLimit] = useState(5);
    const [pendingLimit, setPendingLimit] = useState(5);

    const [searchNoteText, setSearchNoteText] = useState('');

    const [currentTime, setCurrentTime] = useState(new Date());
    const timerRef = useRef(null);

    const navigate = useNavigate();

    const filteredNotes = notes.filter(note =>
        note.noteContent.toLowerCase().includes(searchNoteText.toLowerCase())
    );

    const weeklyStats = [
        {
            icon: <CheckCircleIcon sx={{color: '#27ae60', fontSize: 32}}/>,
            label: 'Onaylanan Randevu',
            value: "-",
            color: '#27ae60',
        },
        {
            icon: <PeopleIcon sx={{color: '#1976d2', fontSize: 32}}/>,
            label: 'Yeni Danışan',
            value: "-",
            color: '#1976d2',
        },
        {
            icon: <EventIcon sx={{color: '#ff9800', fontSize: 32}}/>,
            label: 'Tamamlanan Görüşme',
            value: "-",
            color: '#ff9800',
        },
    ];

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchTodayAppointments(),
                    fetchRemainingAppointments(),
                    fetchPendingRequests(),
                    fetchActiveClients(),
                    fetchPendingAppointments(),
                    fetchTodayApprovedAppointments(),
                    fetchNotes()
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

        const fetchPendingAppointments = async () => {
            try {
                const response = await axios.get(
                    config[config.environment].apiUrl + "/appointment/getPendingAppointments",
                    {
                        headers: {
                            Authorization: localStorage.getItem('token')
                        }
                    }
                );
                setPendingAppointments(response.data || []);
            } catch (error) {
                console.error("Bekleyen randevular çekilirken bir hata oluştu:", error);
                setPendingAppointments([]);
            }
        };

        const fetchTodayApprovedAppointments = async () => {
            try {
                const response = await axios.get(
                    config[config.environment].apiUrl + "/appointment/getTodayApprovedAppointments",
                    {
                        headers: {
                            Authorization: localStorage.getItem('token')
                        }
                    }
                );

                const now = new Date();
                const futureAppointments = (response.data || []).filter(appointment => {
                    const appointmentEndTime = new Date(appointment.end);
                    return appointmentEndTime > now;
                });

                setApprovedAppointments(futureAppointments);
            } catch (error) {
                console.error("Bugünkü onaylanmış randevular çekilirken bir hata oluştu:", error);
                setApprovedAppointments([]);
            }
        };

        const fetchNotes = async () => {
            try {
                const response = await axios.get(
                    config[config.environment].apiUrl + "/dietitian/getMyNotes",
                    {
                        headers: {
                            Authorization: localStorage.getItem('token')
                        }
                    }
                );
                setNotes(response.data || []);
            } catch (error) {
                console.error("Notlar çekilirken bir hata oluştu:", error);
                setNotes([]);
            }
        };

        fetchDashboardData();
    }, []);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setCurrentTime(new Date());

            const now = new Date();
            setApprovedAppointments(prev => prev.filter(appointment => {
                const appointmentEndTime = new Date(appointment.end);
                return appointmentEndTime > now;
            }));
        }, 30000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (showSuccessPopup) {
            const timer = setTimeout(() => {
                setShowSuccessPopup(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showSuccessPopup]);

    const handleAppointmentAction = async (appointmentId, action) => {
        try {
            await axios.put(
                config[config.environment].apiUrl + "/appointment/updateAppointmentStatus",
                {
                    appointment_id: appointmentId,
                    action: action
                },
                {
                    headers: {
                        Authorization: localStorage.getItem('token')
                    }
                }
            );

            const appointment = pendingAppointments.find(app => app.id === appointmentId);
            const clientName = appointment ? `${appointment.Client.name}` : 'Danışan';

            const actionText = action === 'approved' ? 'onaylandı' : 'reddedildi';
            setSuccessMessage(`${clientName} için randevu talebi başarıyla ${actionText}.`);
            setShowSuccessPopup(true);

            // Bildirim gönderme işlemi
            try {
                if (appointment) {
                    const startDate = new Date(appointment.start);
                    const date = startDate.toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });

                    const time = startDate.toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });

                    let notificationEndpoint = '';
                    if (action === 'approved') {
                        notificationEndpoint = '/notification/sendAppointmentNotification';
                    } else if (action === 'cancelled') {
                        notificationEndpoint = '/notification/sendAppointmentCancellationNotification';
                    }

                    if (notificationEndpoint) {
                        const notificationData = {
                            client_id: appointment.client_id,
                            appointmentDetails: {
                                date: date,
                                time: time
                            }
                        };

                        const notificationResponse = await axios.post(
                            config[config.environment].apiUrl + notificationEndpoint,
                            notificationData,
                            {
                                headers: {
                                    Authorization: localStorage.getItem('token'),
                                },
                            }
                        );

                        console.log(`Randevu ${action} bildirimi gönderildi:`, notificationResponse.data);
                    }
                }
            } catch (notificationError) {
                console.error("Randevu bildirimi gönderilirken bir hata oluştu:", notificationError);
            }

            if (action === 'approved' && appointment) {
                setApprovedAppointments(prev => [...prev, appointment]);
            }

            setPendingAppointments(pendingAppointments.filter(app => app.id !== appointmentId));

            setPendingRequests(prev => Math.max(0, prev - 1));

        } catch (error) {
            console.error(`Randevu ${action === 'approved' ? 'onaylanırken' : 'reddedilirken'} bir hata oluştu:`, error);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (noteText.trim()) {
            try {
                await axios.post(
                    config[config.environment].apiUrl + "/dietitian/addNote",
                    {note: noteText},
                    {
                        headers: {
                            Authorization: localStorage.getItem('token')
                        }
                    }
                );

                const response = await axios.get(
                    config[config.environment].apiUrl + "/dietitian/getMyNotes",
                    {
                        headers: {
                            Authorization: localStorage.getItem('token')
                        }
                    }
                );
                setNotes(response.data || []);

                setNoteText('');

                setSuccessMessage('Not başarıyla eklendi.');
                setShowSuccessPopup(true);
            } catch (error) {
                console.error("Not eklenirken bir hata oluştu:", error);
            }
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await axios.delete(
                `${config[config.environment].apiUrl}/dietitian/deleteNote`,
                {
                    headers: {
                        Authorization: localStorage.getItem('token')
                    },
                    params: {
                        note_id: noteId
                    }
                }
            );

            setNotes(notes.filter(note => note.id !== noteId));

            setSuccessMessage('Not başarıyla silindi.');
            setShowSuccessPopup(true);
        } catch (error) {
            console.error("Not silinirken bir hata oluştu:", error);
        }
    };

    const statCards = [
        {
            icon: <PeopleIcon/>,
            value: loading ? '...' : activeClients,
            label: 'Aktif Danışan',
            color: '#8884d8',
            bgColor: '#f5f5ff'
        },
        {
            icon: <EventIcon/>,
            value: loading ? '...' : todayAppointments,
            label: 'Bugünkü Randevu',
            color: '#82ca9d',
            bgColor: '#f0fff4'
        },
        {
            icon: <NotificationsIcon/>,
            value: loading ? '...' : pendingRequests,
            label: 'Bekleyen Talep',
            color: '#ffc658',
            bgColor: '#fff9e6'
        },
        {
            icon: <EventIcon/>,
            value: loading ? '...' : remainingAppointments,
            label: 'Kalan Randevu',
            color: '#ff8042',
            bgColor: '#fff1ec'
        }
    ];

    const formatTimeRange = (startDate, endDate) => {
        const format = (date) => {
            const d = new Date(date);
            const h = String(d.getUTCHours()).padStart(2, '0');
            const m = String(d.getUTCMinutes()).padStart(2, '0');
            return `${h}:${m}`;
        };

        return `${format(startDate)}-${format(endDate)}`;
    };

    const calculateTimeRemaining = (appointmentTime) => {
        const now = new Date();
        const appointmentDate = new Date(appointmentTime);
        appointmentDate.setHours(appointmentDate.getHours() - 3);
        if (appointmentDate < now) {
            return "Başladı";
        }

        const diffMs = appointmentDate - now;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) {
            return `${diffMins} dk`;
        } else {
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            return `${hours} sa ${mins > 0 ? mins + ' dk' : ''}`;
        }
    };


    const getCountdownColor = (appointmentTime) => {
        const now = new Date();
        const appointmentDate = new Date(appointmentTime);

        if (appointmentDate < now) {
            return "error";
        }

        const diffMs = appointmentDate - now;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 30) {
            return "warning";
        } else if (diffMins < 60) {
            return "info";
        } else {
            return "success";
        }
    };

    const handleLoadMoreApproved = () => {
        setApprovedLimit(prev => prev + 5);
    };

    const handleLoadMorePending = () => {
        setPendingLimit(prev => prev + 5);
    };

    const handleCardClick = (path) => {
        navigate(path);
    };

    return (
        <Default>
            <Box sx={{flexGrow: 1, p: 3, bgcolor: '#f8f9fa', minHeight: '70vh'}}>
                {/* Stats Section */}
                <Grid container spacing={3} sx={{mb: 3}}>
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
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 20px -10px rgba(0,0,0,0.1)',
                                        '& .stat-icon': {
                                            transform: 'scale(1.1) rotate(10deg)',
                                        }
                                    }
                                }}
                                onClick={() => {
                                    if (card.label === 'Aktif Danışan') {
                                        handleCardClick('/danisanlarim');
                                    } else if (card.label === 'Bugünkü Randevu' || card.label === 'Kalan Randevu' || card.label === 'Bekleyen Talep') {
                                        handleCardClick('/randevularim');
                                    }
                                }}
                            >
                                <Box sx={{position: 'relative'}}>
                                    <Box sx={{mb: 3}}>
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
                                sx={{ pb: 1, bgcolor: '#2d4149', color: 'white'}}
                            />
                            <Divider/>
                            <CardContent sx={{p: 0, '&:last-child': {pb: 0}, maxHeight: 360, overflow: 'auto'}}>
                                <List>
                                    {loading ? (
                                        <ListItem>
                                            <ListItemText primary="Yükleniyor..."/>
                                        </ListItem>
                                    ) : approvedAppointments.length > 0 ? (
                                        approvedAppointments.slice(0, approvedLimit).map((appointment) => (
                                            <React.Fragment key={appointment.id}>
                                                <ListItem>
                                                    <Box sx={{
                                                        bgcolor: '#f8f9fa',
                                                        borderRadius: 1,
                                                        p: '6px 10px',
                                                        mr: 2,
                                                        minWidth: 60,
                                                        textAlign: 'center'
                                                    }}>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {formatTimeRange(appointment.start, appointment.end)}
                                                        </Typography>
                                                    </Box>
                                                    <ListItemText
                                                        primary={`${appointment.Client.name}`}
                                                        secondary={`${appointment.title}`}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        color={getCountdownColor(appointment.start)}
                                                        label={calculateTimeRemaining(appointment.start)}
                                                        sx={{ml: 1}}
                                                    />
                                                </ListItem>
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <ListItem>
                                            <ListItemText primary="Bugün için randevu bulunmamaktadır."/>
                                        </ListItem>
                                    )}
                                </List>
                                {approvedAppointments.length > approvedLimit && (
                                    <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
                                        <Button
                                            variant="text"
                                            color="primary"
                                            size="small"
                                            onClick={handleLoadMoreApproved}
                                            sx={{fontSize: '0.85rem'}}
                                        >
                                            Daha Fazla Yükle
                                        </Button>
                                    </Box>
                                )}
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
                                sx={{ pb: 1, bgcolor: '#2d4149', color: 'white'}}
                            />
                            <Divider/>
                            <CardContent sx={{p: 0, '&:last-child': {pb: 0}, maxHeight: 360, overflow: 'auto'}}>
                                <List>
                                    {loading ? (
                                        <ListItem>
                                            <ListItemText primary="Yükleniyor..."/>
                                        </ListItem>
                                    ) : pendingAppointments.length > 0 ? (
                                        pendingAppointments.slice(0, pendingLimit).map((appointment) => (
                                            <React.Fragment key={appointment.id}>
                                                <ListItem>
                                                    <Box sx={{
                                                        bgcolor: '#f8f9fa',
                                                        borderRadius: 1,
                                                        p: '6px 10px',
                                                        mr: 2,
                                                        minWidth: 60,
                                                        textAlign: 'center'
                                                    }}>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {formatTimeRange(appointment.start, appointment.end)}
                                                        </Typography>
                                                    </Box>
                                                    <ListItemText
                                                        primary={`${appointment.Client.name}`}
                                                        secondary={
                                                            <React.Fragment>
                                                                <Typography variant="body2" component="span"
                                                                            sx={{display: 'block'}}>
                                                                    {appointment.title}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary"
                                                                            sx={{fontSize: '0.8rem'}}>
                                                                    📞 {appointment.Client.phoneNumber}
                                                                </Typography>
                                                            </React.Fragment>
                                                        }
                                                    />
                                                    <Box sx={{display: 'flex', gap: 1}}>
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            size="small"
                                                            onClick={() => handleAppointmentAction(appointment.id, 'approved')}
                                                        >
                                                            Onayla
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleAppointmentAction(appointment.id, 'cancelled')}
                                                        >
                                                            Reddet
                                                        </Button>
                                                    </Box>
                                                </ListItem>
                                                <Divider component="li"/>
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <ListItem>
                                            <ListItemText primary="Bekleyen randevu talebi bulunmamaktadır."/>
                                        </ListItem>
                                    )}
                                </List>
                                {pendingAppointments.length > pendingLimit && (
                                    <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
                                        <Button
                                            variant="text"
                                            color="primary"
                                            size="small"
                                            onClick={handleLoadMorePending}
                                            sx={{fontSize: '0.85rem'}}
                                        >
                                            Daha Fazla Yükle
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Weekly Achievements Card (Bu Haftanın Başarıları) */}
                    <Grid item xs={12} md={6}>
                        <Card
                            elevation={2}
                            sx={{
                                borderRadius: 2,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                bgcolor: '#f5f5ff',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: 3
                                }
                            }}
                        >
                            <CardHeader
                                title="Bu Haftanın Başarıları"
                                sx={{pb: 1, color: '#1976d2', fontWeight: 700, textAlign: 'center'}}
                            />
                            <Divider/>
                            <CardContent sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%'
                            }}>
                                <Grid container spacing={2} justifyContent="center" alignItems="center">
                                    {weeklyStats.map((stat, idx) => (
                                        <Grid item xs={12} sm={4} key={idx}>
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                p: 1
                                            }}>
                                                {stat.icon}
                                                <Typography variant="h5"
                                                            sx={{fontWeight: 700, color: stat.color, mt: 1}}>
                                                    {stat.value}
                                                </Typography>
                                                <Typography variant="body2"
                                                            sx={{color: 'text.secondary', fontWeight: 500}}>
                                                    {stat.label}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
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
                                action={
                                    <TextField
                                        size="small"
                                        placeholder="Ara..."
                                        value={searchNoteText}
                                        onChange={(e) => setSearchNoteText(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <Box component="span" sx={{color: 'action.active', mr: 0.5}}>
                                                    🔍
                                                </Box>
                                            ),
                                        }}
                                    />
                                }
                                sx={{pb: 1, display: 'flex', alignItems: 'center'}}
                            />
                            <Divider/>
                            <CardContent>
                                <Box component="form" onSubmit={handleAddNote} sx={{mb: 2, display: 'flex'}}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Yeni not ekle..."
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        sx={{mr: 1}}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<AddIcon/>}
                                        onClick={handleAddNote}
                                    >
                                        Ekle
                                    </Button>
                                </Box>

                                <List sx={{maxHeight: 300, overflow: 'auto'}}>
                                    {filteredNotes.length > 0 ? (
                                        filteredNotes.map((note) => (
                                            <React.Fragment key={note.id}>
                                                <ListItem
                                                    secondaryAction={
                                                        <IconButton
                                                            edge="end"
                                                            aria-label="delete"
                                                            onClick={() => handleDeleteNote(note.id)}
                                                        >
                                                            <DeleteIcon/>
                                                        </IconButton>
                                                    }
                                                    sx={{
                                                        bgcolor: '#f8f9fa',
                                                        borderRadius: 1,
                                                        mb: 1,
                                                        borderLeft: '3px solid #3498db'
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={note.noteContent}
                                                        secondary={new Date(note.createdAt).toLocaleString()}
                                                    />
                                                </ListItem>
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <ListItem>
                                            <ListItemText primary={
                                                searchNoteText
                                                    ? "Arama kriterine uygun not bulunamadı."
                                                    : "Henüz not bulunmamaktadır."
                                            }/>
                                        </ListItem>
                                    )}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Success Popup */}
                {showSuccessPopup && (
                    <div className="success-popup">
                        <div className="success-popup-content">
                            <CheckCircleIcon className="success-icon"/>
                            <p>{successMessage}</p>
                        </div>
                    </div>
                )}
            </Box>
        </Default>
    );
};
