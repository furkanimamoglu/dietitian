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
  useMediaQuery,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress
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
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';

export default function Danisan() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [danisan, setDanisan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('genel');
    const [nutritionPlan, setNutritionPlan] = useState(null);
    const [nutritionPlanLoading, setNutritionPlanLoading] = useState(false);

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

    // Fetch nutrition plan when beslenme tab is activated
    useEffect(() => {
        const fetchNutritionPlan = async () => {
            if (activeTab === 'beslenme' && id) {
                setNutritionPlanLoading(true);
                try {
                    const response = await axios.post(
                        config[config.environment].apiUrl + "/dietitian/getNutritionPlanByClient",
                        {
                            client_id: id,
                            range: "week"
                        },
                        {
                            headers: {
                                Authorization: localStorage.getItem('token'),
                            }
                        }
                    );
                    
                    setNutritionPlan(response.data);
                } catch (err) {
                    console.error("Beslenme planı yüklenirken hata:", err.message);
                } finally {
                    setNutritionPlanLoading(false);
                }
            }
        };

        fetchNutritionPlan();
    }, [activeTab, id]);
    

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
                    <Box>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
                            Anamnez Formu
                        </Typography>
                        
                        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Sağlık Bilgileri
                                </Typography>
                                <Chip label="Son Güncelleme: 15.05.2023" size="small" color="primary" />
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Kronik Hastalıklar</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                            <Chip label="Hipertansiyon" size="small" color="primary" variant="outlined" />
                                            <Chip label="Tip 2 Diyabet" size="small" color="primary" variant="outlined" />
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Alerjiler</Typography>
                                        <Typography variant="body2" color="text.secondary">Laktoz intoleransı, Fındık alerjisi</Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>İlaç Kullanımı</Typography>
                                        <Typography variant="body2" color="text.secondary">Metformin 500mg (günde 2 kez)</Typography>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Geçmiş Ameliyatlar</Typography>
                                        <Typography variant="body2" color="text.secondary">Apendektomi (2015)</Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Aile Sağlık Geçmişi</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Anne: Hipertansiyon<br />
                                            Baba: Kalp hastalığı
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Kan Değerleri</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Son kontrol: 10.04.2023<br />
                                            HbA1c: 6.8%<br />
                                            Kolesterol: 210 mg/dL
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                        
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Diyet Alışkanlıkları
                                </Typography>
                                <IconButton aria-label="düzenle">
                                    <EditIcon />
                                </IconButton>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Günlük Su Tüketimi</Typography>
                                        <Typography variant="body2" color="text.secondary">4-5 bardak (yetersiz)</Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Favori Yiyecekler</Typography>
                                        <Typography variant="body2" color="text.secondary">Makarna, beyaz ekmek, şekerli içecekler</Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Sevmediği Yiyecekler</Typography>
                                        <Typography variant="body2" color="text.secondary">Brokoli, karnabahar, ıspanak</Typography>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Öğün Düzeni</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Sabah: Genellikle atlanıyor<br />
                                            Öğle: Hafif yemek<br />
                                            Akşam: Ağır ve geç yemek
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Atıştırmalık Alışkanlıkları</Typography>
                                        <Typography variant="body2" color="text.secondary">Akşam TV izlerken tatlı ve cips tüketimi</Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Dışarıda Yemek</Typography>
                                        <Typography variant="body2" color="text.secondary">Haftada 3-4 kez fast-food tüketimi</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                );
            case 'olcum':
                return (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
                            Ölçüm Takibi
                        </Typography>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Card elevation={3}>
                                    <CardHeader 
                                        title="Kilo Takibi" 
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        action={
                                            <Button 
                                                variant="contained" 
                                                size="small" 
                                                startIcon={<EditIcon />}
                                                sx={{ bgcolor: theme.palette.primary.main }}
                                            >
                                                Yeni Ölçüm
                                            </Button>
                                        }
                                        sx={{ 
                                            bgcolor: 'primary.light', 
                                            color: 'primary.contrastText',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        <Box sx={{ height: 250, p: 1, position: 'relative' }}>
                                            <Box sx={{ 
                                                position: 'absolute', 
                                                left: 0, 
                                                top: 0, 
                                                bottom: 0, 
                                                width: '60px', 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                justifyContent: 'space-between' 
                                            }}>
                                                <Typography variant="caption">85 kg</Typography>
                                                <Typography variant="caption">80 kg</Typography>
                                                <Typography variant="caption">75 kg</Typography>
                                                <Typography variant="caption">70 kg</Typography>
                                            </Box>
                                            <Box sx={{ pl: '60px', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'flex-end', 
                                                    height: '100%',
                                                    width: '100%',
                                                    position: 'relative'
                                                }}>
                                                    <Box sx={{ 
                                                        width: '15%', 
                                                        position: 'absolute', 
                                                        left: '0%',
                                                        height: '80%', 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end'
                                                    }}>
                                                        <Box sx={{ 
                                                            width: 12, 
                                                            height: 12, 
                                                            borderRadius: '50%', 
                                                            bgcolor: 'primary.main',
                                                            mb: 1
                                                        }} />
                                                        <Typography variant="caption">15 Nisan</Typography>
                                                    </Box>
                                                    <Box sx={{ 
                                                        width: '15%', 
                                                        position: 'absolute', 
                                                        left: '20%',
                                                        height: '75%', 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end'
                                                    }}>
                                                        <Box sx={{ 
                                                            width: 12, 
                                                            height: 12, 
                                                            borderRadius: '50%', 
                                                            bgcolor: 'primary.main',
                                                            mb: 1
                                                        }} />
                                                        <Typography variant="caption">30 Nisan</Typography>
                                                    </Box>
                                                    <Box sx={{ 
                                                        width: '15%', 
                                                        position: 'absolute', 
                                                        left: '40%',
                                                        height: '65%', 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end'
                                                    }}>
                                                        <Box sx={{ 
                                                            width: 12, 
                                                            height: 12, 
                                                            borderRadius: '50%', 
                                                            bgcolor: 'primary.main',
                                                            mb: 1
                                                        }} />
                                                        <Typography variant="caption">15 Mayıs</Typography>
                                                    </Box>
                                                    <Box sx={{ 
                                                        width: '15%', 
                                                        position: 'absolute', 
                                                        left: '60%',
                                                        height: '50%', 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end'
                                                    }}>
                                                        <Box sx={{ 
                                                            width: 12, 
                                                            height: 12, 
                                                            borderRadius: '50%', 
                                                            bgcolor: 'primary.main',
                                                            mb: 1
                                                        }} />
                                                        <Typography variant="caption">31 Mayıs</Typography>
                                                    </Box>
                                                    <Box sx={{ 
                                                        width: '15%', 
                                                        position: 'absolute', 
                                                        left: '80%',
                                                        height: '40%', 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end'
                                                    }}>
                                                        <Box sx={{ 
                                                            width: 12, 
                                                            height: 12, 
                                                            borderRadius: '50%', 
                                                            bgcolor: 'primary.main',
                                                            mb: 1
                                                        }} />
                                                        <Typography variant="caption">15 Haziran</Typography>
                                                    </Box>
                                                    
                                                    <Box sx={{ 
                                                        position: 'absolute',
                                                        top: '80%',
                                                        left: '6px',
                                                        width: '10%',
                                                        height: '2px',
                                                        bgcolor: 'primary.main',
                                                        transform: 'rotate(-10deg)'
                                                    }} />
                                                    <Box sx={{ 
                                                        position: 'absolute',
                                                        top: '75%',
                                                        left: '18%',
                                                        width: '20%',
                                                        height: '2px',
                                                        bgcolor: 'primary.main',
                                                        transform: 'rotate(-15deg)'
                                                    }} />
                                                    <Box sx={{ 
                                                        position: 'absolute',
                                                        top: '65%',
                                                        left: '40%',
                                                        width: '18%',
                                                        height: '2px',
                                                        bgcolor: 'primary.main',
                                                        transform: 'rotate(-20deg)'
                                                    }} />
                                                    <Box sx={{ 
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '60%',
                                                        width: '18%',
                                                        height: '2px',
                                                        bgcolor: 'primary.main',
                                                        transform: 'rotate(-15deg)'
                                                    }} />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Card elevation={3} sx={{ height: '100%' }}>
                                    <CardHeader 
                                        title="Vücut Ölçümleri" 
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        sx={{ 
                                            bgcolor: 'primary.light', 
                                            color: 'primary.contrastText',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                    <th style={{ padding: '8px', textAlign: 'left' }}>Tarih</th>
                                                    <th style={{ padding: '8px', textAlign: 'center' }}>Bel (cm)</th>
                                                    <th style={{ padding: '8px', textAlign: 'center' }}>Kalça (cm)</th>
                                                    <th style={{ padding: '8px', textAlign: 'center' }}>Göğüs (cm)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                    <td style={{ padding: '8px' }}>15 Nisan 2023</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>92</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>108</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>96</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                    <td style={{ padding: '8px' }}>30 Nisan 2023</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>90</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>106</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>95</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                    <td style={{ padding: '8px' }}>15 Mayıs 2023</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>88</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>104</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>94</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                    <td style={{ padding: '8px' }}>31 Mayıs 2023</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>86</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>102</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>93</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px' }}>15 Haziran 2023</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>84</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>100</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>92</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Card elevation={3} sx={{ height: '100%' }}>
                                    <CardHeader 
                                        title="Vücut Analizi" 
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        sx={{ 
                                            bgcolor: 'primary.light', 
                                            color: 'primary.contrastText',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box>
                                                <Typography variant="subtitle1" gutterBottom>Vücut Yağ Oranı</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', height: 10, borderRadius: 5 }}>
                                                        <Box 
                                                            sx={{ 
                                                                width: '32%', 
                                                                bgcolor: theme.palette.primary.main, 
                                                                height: '100%', 
                                                                borderRadius: 5 
                                                            }} 
                                                        />
                                                    </Box>
                                                    <Typography variant="body2">32%</Typography>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Hedef: 25-28% | Standart: 25-31%
                                                </Typography>
                                            </Box>
                                            
                                            <Box>
                                                <Typography variant="subtitle1" gutterBottom>Kas Kütlesi</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', height: 10, borderRadius: 5 }}>
                                                        <Box 
                                                            sx={{ 
                                                                width: '28%', 
                                                                bgcolor: theme.palette.info.main, 
                                                                height: '100%', 
                                                                borderRadius: 5 
                                                            }} 
                                                        />
                                                    </Box>
                                                    <Typography variant="body2">28%</Typography>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Hedef: 30-35% | Standart: 30-35%
                                                </Typography>
                                            </Box>
                                            
                                            <Box>
                                                <Typography variant="subtitle1" gutterBottom>Vücut Suyu</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', height: 10, borderRadius: 5 }}>
                                                        <Box 
                                                            sx={{ 
                                                                width: '45%', 
                                                                bgcolor: theme.palette.info.light, 
                                                                height: '100%', 
                                                                borderRadius: 5 
                                                            }} 
                                                        />
                                                    </Box>
                                                    <Typography variant="body2">45%</Typography>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Hedef: 45-60% | Standart: 45-60%
                                                </Typography>
                                            </Box>
                                            
                                            <Box>
                                                <Typography variant="subtitle1" gutterBottom>BMI</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', height: 10, borderRadius: 5 }}>
                                                        <Box 
                                                            sx={{ 
                                                                width: '80%', 
                                                                bgcolor: theme.palette.warning.main, 
                                                                height: '100%', 
                                                                borderRadius: 5 
                                                            }} 
                                                        />
                                                    </Box>
                                                    <Typography variant="body2">28.4</Typography>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Hedef: 18.5-25 | Şu an: Hafif Obez
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                );
            case 'beslenme':
                return (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                                {/*<Button 
                                    variant="outlined" 
                                    size="small" 
                                    sx={{ mr: 1 }}
                                    startIcon={<PrintIcon />}
                                >
                                    Yazdır
                                </Button>
                                <Button 
                                    variant="contained" 
                                    size="small" 
                                    startIcon={<EditIcon />}
                                >
                                    Düzenle
                                </Button> */}
                            </Box>
                        </Box>
                        
                        {nutritionPlanLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Paper elevation={3} sx={{ mb: 3 }}>
                                <Box sx={{ 
                                    p: 2, 
                                    bgcolor: 'primary.main', 
                                    color: 'white',
                                    borderTopLeftRadius: 4,
                                    borderTopRightRadius: 4,
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {nutritionPlan && nutritionPlan.length > 0 
                                            ? nutritionPlan[0].NutritionPlan.title 
                                            : "İsim Girilmemiş Plan"}
                                    </Typography>
                                    <Chip 
                                        label="Aktif" 
                                        size="small" 
                                        sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}
                                    />
                                </Box>
                                
                                <Divider />
                                
                                <Box sx={{ overflowX: 'auto' }}>
                                    <Box sx={{ minWidth: 900, p: 2 }}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={2}>
                                                <Box sx={{ textAlign: 'center', p: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Öğün</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Grid container>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Pzt</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Sal</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Çar</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Per</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Cum</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Cmt</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Paz</Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        
                                        <Divider sx={{ my: 1 }} />
                                        
                                        {/* Kahvaltı */}
                                        <Grid container spacing={1}>
                                            <Grid item xs={2}>
                                                <Box sx={{ 
                                                    bgcolor: 'primary.light', 
                                                    color: 'primary.contrastText', 
                                                    p: 1, 
                                                    borderRadius: 1,
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Kahvaltı</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Pazartesi?.Kahvaltı || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Salı?.Kahvaltı || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Çarşamba?.Kahvaltı || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Perşembe?.Kahvaltı || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Cuma?.Kahvaltı || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Cumartesi?.Kahvaltı || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Pazar?.Kahvaltı || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        
                                        <Divider sx={{ my: 1 }} />
                                        
                                        {/* Öğle Yemeği */}
                                        <Grid container spacing={1}>
                                            <Grid item xs={2}>
                                                <Box sx={{ 
                                                    bgcolor: 'warning.light', 
                                                    color: 'warning.contrastText', 
                                                    p: 1, 
                                                    borderRadius: 1,
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Öğle</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Pazartesi?.["Öğle Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Salı?.["Öğle Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Çarşamba?.["Öğle Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Perşembe?.["Öğle Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Cuma?.["Öğle Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Cumartesi?.["Öğle Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Pazar?.["Öğle Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        
                                        <Divider sx={{ my: 1 }} />
                                        
                                        {/* Akşam Yemeği */}
                                        <Grid container spacing={1}>
                                            <Grid item xs={2}>
                                                <Box sx={{ 
                                                    bgcolor: 'error.light', 
                                                    color: 'error.contrastText', 
                                                    p: 1, 
                                                    borderRadius: 1,
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Akşam</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Pazartesi?.["Akşam Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Salı?.["Akşam Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Çarşamba?.["Akşam Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Perşembe?.["Akşam Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Cuma?.["Akşam Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Cumartesi?.["Akşam Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Pazar?.["Akşam Yemeği"] || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 1 }} />

                                        {/* Ara Öğün */}
                                        <Grid container spacing={1}>
                                            <Grid item xs={2}>
                                                <Box sx={{ 
                                                    bgcolor: 'info.light', 
                                                    color: 'info.contrastText', 
                                                    p: 1, 
                                                    borderRadius: 1,
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Ara Öğün</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Pazartesi?.Aparatif || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Salı?.Aparatif || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Çarşamba?.Aparatif || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Perşembe?.Aparatif || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Cuma?.Aparatif || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Cumartesi?.Aparatif || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            <Typography variant="body2">
                                                                {nutritionPlan && nutritionPlan.length > 0 && nutritionPlan[0].NutritionPlan.mealPlan?.Pazar?.Aparatif || 
                                                                "Öğün girilmemiş."}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>                                        
                                    </Box>
                                </Box>
                                
                                <Divider />
                                
                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {nutritionPlan && nutritionPlan.length > 0 
                                            ? `Beslenme planı oluşturulma: ${new Date(nutritionPlan[0].createdAt).toLocaleDateString('tr-TR')}`
                                            : "Bu beslenme planı sizin tarafınızdan hazırlanmıştır."
                                        }
                                    </Typography>
                                    <Button 
                                        size="small" 
                                        onClick={() => {
                                            if (nutritionPlan && nutritionPlan.length > 0) {
                                                window.open(`/nutrition-plans/${nutritionPlan[0].nutrition_plan_id}`, '_blank');
                                            }
                                        }}
                                    >
                                        Detaylı Görüntüle
                                    </Button>
                                </Box>
                            </Paper>
                        )}
                        
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Öneriler ve Notlar
                        </Typography>
                        
                        <Card elevation={3} sx={{ mb: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Box sx={{ 
                                            bgcolor: 'primary.main', 
                                            color: 'white', 
                                            borderRadius: '50%', 
                                            width: 24, 
                                            height: 24, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            flexShrink: 0,
                                            mt: 0.2
                                        }}>1</Box>
                                        <Typography variant="body1">
                                            Günde en az <strong>2.5 litre su</strong> içmeye özen gösterin.
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Box sx={{ 
                                            bgcolor: 'primary.main', 
                                            color: 'white', 
                                            borderRadius: '50%', 
                                            width: 24, 
                                            height: 24, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            flexShrink: 0,
                                            mt: 0.2
                                        }}>2</Box>
                                        <Typography variant="body1">
                                            Akşam yemeğini <strong>saat 19:00'dan önce</strong> tüketmeye çalışın.
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Box sx={{ 
                                            bgcolor: 'primary.main', 
                                            color: 'white', 
                                            borderRadius: '50%', 
                                            width: 24, 
                                            height: 24, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            flexShrink: 0,
                                            mt: 0.2
                                        }}>3</Box>
                                        <Typography variant="body1">
                                            Şeker ve beyaz un içeren ürünleri <strong>tamamen kesmemeye</strong> çalışın.
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Box sx={{ 
                                            bgcolor: 'primary.main', 
                                            color: 'white', 
                                            borderRadius: '50%', 
                                            width: 24, 
                                            height: 24, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            flexShrink: 0,
                                            mt: 0.2
                                        }}>4</Box>
                                        <Typography variant="body1">
                                            Egzersiz programınızı düzenli olarak uygulayın. Özellikle kardio egzersizlerine ağırlık verin.
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                );
            case 'randevu':
                return (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
                            Randevular
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Randevu Geçmişi</Typography>
                            <Button 
                                variant="contained" 
                                size="small" 
                                startIcon={<AddIcon />}
                                sx={{ bgcolor: theme.palette.primary.main }}
                            >
                                Yeni Randevu
                            </Button>
                        </Box>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={7}>
                                {/* Yaklaşan Randevular */}
                                <Card elevation={3} sx={{ mb: 3 }}>
                                    <CardHeader 
                                        title="Yaklaşan Randevular" 
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        sx={{ 
                                            bgcolor: 'primary.light', 
                                            color: 'primary.contrastText',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <List>
                                        <ListItem 
                                            secondaryAction={
                                                <Box>
                                                    <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton edge="end" aria-label="delete">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    <EventIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                            Beslenme Danışmanlığı
                                                        </Typography>
                                                        <Chip 
                                                            label="Online" 
                                                            size="small" 
                                                            color="info" 
                                                            sx={{ ml: 1 }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" component="span">
                                                            25 Haziran 2023, Salı - 14:30
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Notlar: 3 aylık takip sonrası değerlendirme randevusu
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        
                                        <Divider variant="inset" component="li" />
                                        
                                        <ListItem 
                                            secondaryAction={
                                                <Box>
                                                    <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton edge="end" aria-label="delete">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    <EventIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                            Vücut Analizi
                                                        </Typography>
                                                        <Chip 
                                                            label="Yüz yüze" 
                                                            size="small" 
                                                            color="success" 
                                                            sx={{ ml: 1 }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" component="span">
                                                            10 Temmuz 2023, Pazartesi - 10:00
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Notlar: Detaylı vücut ölçümleri için gelecek
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    </List>
                                </Card>
                                
                                {/* Geçmiş Randevular */}
                                <Card elevation={3}>
                                    <CardHeader 
                                        title="Geçmiş Randevular" 
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        sx={{ 
                                            bgcolor: 'grey.200', 
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <List>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'grey.500' }}>
                                                    <EventIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                            Beslenme Danışmanlığı
                                                        </Typography>
                                                        <Chip 
                                                            label="Tamamlandı" 
                                                            size="small" 
                                                            color="success" 
                                                            sx={{ ml: 1 }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" component="span">
                                                            15 Mayıs 2023, Pazartesi - 14:30
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        
                                        <Divider variant="inset" component="li" />
                                        
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'grey.500' }}>
                                                    <EventIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                            İlk Değerlendirme
                                                        </Typography>
                                                        <Chip 
                                                            label="Tamamlandı" 
                                                            size="small" 
                                                            color="success" 
                                                            sx={{ ml: 1 }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" component="span">
                                                            15 Nisan 2023, Çarşamba - 10:00
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        
                                        <Divider variant="inset" component="li" />
                                        
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'grey.500' }}>
                                                    <EventIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                            Tanışma Görüşmesi
                                                        </Typography>
                                                        <Chip 
                                                            label="Tamamlandı" 
                                                            size="small" 
                                                            color="success" 
                                                            sx={{ ml: 1 }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" component="span">
                                                            1 Nisan 2023, Cumartesi - 11:30
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    </List>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={5}>
                                {/* Randevu Notları */}
                                <Card elevation={3} sx={{ mb: 3 }}>
                                    <CardHeader 
                                        title="Son Randevu Notları" 
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        subheader="15 Mayıs 2023"
                                        sx={{ 
                                            bgcolor: 'primary.light', 
                                            color: 'primary.contrastText',
                                            '& .MuiCardHeader-subheader': {
                                                color: 'primary.contrastText'
                                            },
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        <Typography variant="body1" paragraph>
                                            Danışan son 1 ayda 3 kg verdi. Ancak yağ oranında istenen düşüş yaşanmadı.
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            Önceki beslenme planında bazı değişiklikler yapıldı. Karbonhidrat miktarı azaltıldı, protein miktarı artırıldı.
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            Danışanın şeker tüketimi hala yüksek. Kendisine bununla ilgili tavsiyeler verildi.
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            Yapılacaklar:
                                        </Typography>
                                        <ul>
                                            <li>Yeni beslenme planı hazırlandı</li>
                                            <li>3 günlük su içme hatırlatıcısı eklendi</li>
                                            <li>Haftalık egzersiz programı güncellendi</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                                
                                {/* İstatistikler */}
                                <Card elevation={3}>
                                    <CardHeader 
                                        title="Randevu İstatistikleri" 
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        sx={{ 
                                            bgcolor: 'grey.200', 
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Box sx={{ 
                                                    p: 2, 
                                                    bgcolor: 'success.light', 
                                                    color: 'success.contrastText',
                                                    borderRadius: 2,
                                                    textAlign: 'center'
                                                }}>
                                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>3</Typography>
                                                    <Typography variant="body2">Tamamlanan</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{ 
                                                    p: 2, 
                                                    bgcolor: 'primary.light', 
                                                    color: 'primary.contrastText',
                                                    borderRadius: 2,
                                                    textAlign: 'center'
                                                }}>
                                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>2</Typography>
                                                    <Typography variant="body2">Yaklaşan</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{ 
                                                    p: 2, 
                                                    bgcolor: 'warning.light', 
                                                    color: 'warning.contrastText',
                                                    borderRadius: 2,
                                                    textAlign: 'center'
                                                }}>
                                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>0</Typography>
                                                    <Typography variant="body2">İptal Edilen</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{ 
                                                    p: 2, 
                                                    bgcolor: 'info.light', 
                                                    color: 'info.contrastText',
                                                    borderRadius: 2,
                                                    textAlign: 'center'
                                                }}>
                                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>5</Typography>
                                                    <Typography variant="body2">Toplam</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
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
