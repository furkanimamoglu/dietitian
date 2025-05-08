import React, { useEffect, useState } from 'react';
import './Danisan.css';
import Default from "../../Components/Layouts/Default.jsx";
import axios from "axios";
import config from "../../config.js";
import { useParams, useNavigate } from "react-router-dom";

// Material UI imports
import { 
  Box, 
  Typography, 
  Avatar, 
  Divider, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery
} from "@mui/material";

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HeightIcon from '@mui/icons-material/Height';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import WcIcon from '@mui/icons-material/Wc';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';

export default function Danisan() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [danisan, setDanisan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('genel');

    useEffect(() => {
        const fetchDanisanInfo = async () => {
            try {
                const response = await axios.get(
                    config[config.environment].apiUrl + "/dietitian/getMyClient",
                    {
                        headers: {
                            Authorization: localStorage.getItem('token'),
                        },
                        params: {
                            client_id: id,
                        },
                    }
                );

                if (!response.data || Object.keys(response.data).length === 0) {
                    throw new Error("Danışan bilgisi bulunamadı");
                }

                const {
                    name,
                    surname,
                    email,
                    phoneNumber,
                    gender,
                    height,
                    weight,
                    status,
                } = response.data;

                setDanisan({ name, surname, email, phoneNumber, gender, height, weight, status });
            } catch (err) {
                console.error("Hata:", err.message);
                navigate('/404');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDanisanInfo();
    }, [id, navigate]);

    useEffect(() => {
        if (!isLoading && danisan === null) {
            navigate('/404');
        }
    }, [isLoading, danisan, navigate]);

    if (isLoading) {
        return (
            <Default>
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Skeleton variant="rectangular" height={200} />
                    <Skeleton variant="text" height={50} width="40%" />
                    <Skeleton variant="text" height={30} width="60%" />
                    <Skeleton variant="text" height={30} width="70%" />
                </Box>
            </Default>
        );
    }

    if (!danisan) {
        return null;
    }

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Status chip color based on status
    const getStatusColor = (status) => {
        const allowedColors = ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'];
        if (!status || typeof status !== 'string') {
            return 'default';
        }
        switch(status.toLowerCase()) {
            case 'aktif':
                return 'success';
            case 'pasif':
                return 'error';
            case 'beklemede':
                return 'warning';
            default:
                return 'default';
        }
    };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'genel':
                return (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
                            Genel Bilgiler
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card elevation={3} sx={{ height: '100%' }}>
                                    <CardHeader 
                                        title="Kişisel Bilgiler" 
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        action={
                                            <IconButton aria-label="düzenle">
                                                <EditIcon />
                                            </IconButton>
                                        }
                                        sx={{ 
                                            bgcolor: 'primary.light', 
                                            color: 'primary.contrastText',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <WcIcon color="primary" />
                                                <Typography><strong>Cinsiyet:</strong> {danisan.gender}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <HeightIcon color="primary" />
                                                <Typography><strong>Boy:</strong> {danisan.height} cm</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <MonitorWeightIcon color="primary" />
                                                <Typography><strong>Kilo:</strong> {danisan.weight} kg</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <InfoIcon color="primary" />
                                                <Typography>
                                                    <strong>BMI:</strong> {(danisan.weight / ((danisan.height/100) * (danisan.height/100))).toFixed(1)} kg/m²
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card elevation={3} sx={{ height: '100%' }}>
                                    <CardHeader 
                                        title="İletişim Bilgileri" 
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        action={
                                            <IconButton aria-label="düzenle">
                                                <EditIcon />
                                            </IconButton>
                                        }
                                        sx={{ 
                                            bgcolor: 'primary.light', 
                                            color: 'primary.contrastText',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <EmailIcon color="primary" />
                                                <Typography><strong>E-posta:</strong> {danisan.email}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PhoneIcon color="primary" />
                                                <Typography><strong>Telefon:</strong> {danisan.phoneNumber}</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                );
            case 'anamnez':
                return (
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
                            Anamnez
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Henüz anamnez verisi bulunmamaktadır.
                        </Typography>
                    </Paper>
                );
            case 'olcum':
                return (
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
                            Ölçüm Takibi
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Ölçümler henüz eklenmemiştir.
                        </Typography>
                    </Paper>
                );
            case 'beslenme':
                return (
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
                            Beslenme Programı
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Henüz beslenme programı eklenmemiştir.
                        </Typography>
                    </Paper>
                );
            case 'randevu':
                return (
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
                            Randevular
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Henüz randevu verisi bulunmamaktadır.
                        </Typography>
                    </Paper>
                );
            case 'tarif':
                return (
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
                            Tarifler
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Henüz tarif eklenmemiştir.
                        </Typography>
                    </Paper>
                );
            case 'egzersiz':
                return (
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
                            Egzersiz Takip
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Henüz egzersiz verisi bulunmamaktadır.
                        </Typography>
                    </Paper>
                );
            case 'odeme':
                return (
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
                            Ödeme Takip
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Henüz ödeme bilgisi bulunmamaktadır.
                        </Typography>
                    </Paper>
                );
            default:
                return null;
        }
    };

    return (
        <Default>
            <Box sx={{ p: 2 }}>
                <Grid container spacing={3}>
                {/* Sol Panel - Danışanın Resmi ve Bilgileri */}
                    <Grid item xs={12} md={4}>
                        <Card elevation={4} sx={{ 
                            height: '100%',
                            borderRadius: 2,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: 8
                            }
                        }}>
                            <Box sx={{ 
                                bgcolor: 'primary.main', 
                                p: 2, 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    Danışan Bilgileri
                                </Typography>
                                <Chip 
                                label={danisan.status === true ? "Aktif" : danisan.status === false ? "Pasif" : "-"}
                                color={getStatusColor(danisan.status)}
                                size="small"
                                icon={
                                    danisan.status === true ? (
                                    <CheckCircleIcon style={{ color: 'orange' }} />
                                    ) : danisan.status === false ? (
                                    <CancelIcon style={{ color: 'red' }} />
                                    ) : null
                                }
                                sx={{ fontWeight: 'bold' }}
                                />
                            </Box>
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                p: 3,
                                bgcolor: 'background.paper'
                            }}>
                            <Avatar
                                alt={`${danisan.name} ${danisan.surname}`}
                                    src="/placeholder_client.jpg"
                                sx={{
                                    width: 150,
                                    height: 150,
                                    mb: 2,
                                        border: '4px solid',
                                        borderColor: 'primary.light',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            />
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {danisan.name} {danisan.surname}
                        </Typography>
                                
                                <Divider sx={{ width: '100%', my: 2 }} />
                                
                                <Box sx={{ width: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <EmailIcon color="primary" fontSize="small" />
                                        <Typography variant="body2">{danisan.email}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <PhoneIcon color="primary" fontSize="small" />
                                        <Typography variant="body2">{danisan.phoneNumber}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <WcIcon color="primary" fontSize="small" />
                                        <Typography variant="body2">{danisan.gender}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <HeightIcon color="primary" fontSize="small" />
                                        <Typography variant="body2">{danisan.height} cm</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <MonitorWeightIcon color="primary" fontSize="small" />
                                        <Typography variant="body2">{danisan.weight} kg</Typography>
                                    </Box>
                                </Box>
                    </Box>
                        </Card>
                    </Grid>

                {/* Sağ Panel - Tabs ve içerik */}
                    <Grid item xs={12} md={8}>
                        <Card elevation={4} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs 
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    variant={isMobile ? "scrollable" : "fullWidth"}
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                                    textColor="primary"
                                    indicatorColor="primary"
                                    aria-label="danışan sekmeler"
                                sx={{
                                        bgcolor: 'background.paper',
                                    '& .MuiTab-root': {
                                            fontWeight: 'medium',
                                            textTransform: 'none',
                                            fontSize: '0.95rem',
                                            py: 1.5
                                        }
                                }}
                            >
                                <Tab label="Genel" value="genel" />
                                <Tab label="Anamnez" value="anamnez" />
                                <Tab label="Ölçümler" value="olcum" />
                                <Tab label="Beslenme" value="beslenme" />
                                <Tab label="Randevular" value="randevu" />
                                <Tab label="Tarifler" value="tarif" />
                                <Tab label="Egzersizler" value="egzersiz" />
                                <Tab label="Ödemeler" value="odeme" />
                                </Tabs>
                        </Box>
                            <Box sx={{ p: 3, minHeight: '50vh' }}>
                                {renderTabContent()}
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Default>
    );
}
