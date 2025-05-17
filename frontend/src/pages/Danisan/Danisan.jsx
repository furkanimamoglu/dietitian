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
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

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
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
    const [clientInvoices, setClientInvoices] = useState([]);
    const [clientInvoicesLoading, setClientInvoicesLoading] = useState(false);
    const [currentInvoicePage, setCurrentInvoicePage] = useState(1);
    const invoicesPerPage = 4;

    // Function to find the plan that covers today's date
    const findCurrentPlan = (plans) => {
        if (!plans || plans.length === 0) return 0;
        
        const today = new Date();
        
        // Try to find a plan where today falls between start_date and end_date
        for (let i = 0; i < plans.length; i++) {
            const plan = plans[i];
            if (plan.start_date && plan.end_date) {
                const startDate = new Date(plan.start_date);
                const endDate = new Date(plan.end_date);
                
                if (today >= startDate && today <= endDate) {
                    return i;
                }
            }
        }
        
        // If no matching plan, try to find the most recent plan
        let mostRecentPlanIndex = 0;
        let mostRecentDate = null;
        
        for (let i = 0; i < plans.length; i++) {
            const plan = plans[i];
            if (plan.start_date) {
                const startDate = new Date(plan.start_date);
                
                if (!mostRecentDate || startDate > mostRecentDate) {
                    mostRecentDate = startDate;
                    mostRecentPlanIndex = i;
                }
            }
        }
        
        return mostRecentPlanIndex;
    };

    // First, add a function to check if a plan includes today's date
    const isActivePlan = (plan) => {
        if (!plan.start_date || !plan.end_date) return false;
        
        const today = new Date();
        const startDate = new Date(plan.start_date);
        const endDate = new Date(plan.end_date);
        
        return today >= startDate && today <= endDate;
    };

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
                        config[config.environment].apiUrl + "/dietitian/getNutritionAssignmentPlanByClient",
                        {
                            client_id: id,
                            range: "all"
                        },
                        {
                            headers: {
                                Authorization: localStorage.getItem('token'),
                            }
                        }
                    );
                    
                    setNutritionPlan(response.data);
                    
                    // Set the default selected plan to the one that includes today's date
                    if (response.data && response.data.length > 0) {
                        const currentPlanIndex = findCurrentPlan(response.data);
                        setSelectedPlanIndex(currentPlanIndex);
                    }
                } catch (err) {
                    console.error("Beslenme planı yüklenirken hata:", err.message);
                } finally {
                    setNutritionPlanLoading(false);
                }
            }
        };

        fetchNutritionPlan();
    }, [activeTab, id]);
    
    // Fetch client invoices when odeme tab is activated
    useEffect(() => {
        const fetchClientInvoices = async () => {
            if (activeTab === 'odeme' && id) {
                setClientInvoicesLoading(true);
                try {
                    const response = await axios.get(
                        config[config.environment].apiUrl + "/invoice/getClientInvoices",
                        {
                            headers: {
                                Authorization: localStorage.getItem('token'),
                            },
                            params: {
                                client_id: id,
                            },
                        }
                    );
                    setClientInvoices(response.data);
                } catch (err) {
                    console.error("Ödemeler yüklenirken hata:", err.message);
                    setClientInvoices([]);
                } finally {
                    setClientInvoicesLoading(false);
                }
            }
        };
        fetchClientInvoices();
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

    // Helper function to display meal items (works with both arrays and strings)
    const renderMealItems = (mealItems) => {
        if (!mealItems) return "Öğün girilmemiş.";
        
        // New format with isim and yenildi fields
        if (Array.isArray(mealItems) && mealItems.length > 0 && mealItems[0].hasOwnProperty('isim')) {
            return (
                <>
                    {mealItems.map((item, index) => (
                        <Typography 
                            key={index} 
                            variant="body2" 
                            component="div" 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: index < mealItems.length - 1 ? 0.5 : 0,
                                ...(item.yenildi ? { textDecoration: 'line-through', color: 'text.secondary' } : {})
                            }}
                        >
                            {item.yenildi ? 
                                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} /> : 
                                <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                            }
                            {item.isim}
                        </Typography>
                    ))}
                </>
            );
        }
        
        // Handle old formats
        if (typeof mealItems === 'string') {
            return mealItems;
        }
        
        if (Array.isArray(mealItems)) {
            return mealItems.join(", ");
        }
        
        if (mealItems.main && Array.isArray(mealItems.main)) {
            const mainItems = mealItems.main.join(", ");
            
            // Check if there are alternatives
            if (mealItems.alternatives && Object.keys(mealItems.alternatives).length > 0) {
                let alternativesText = [];
                
                for (const [mainItem, alternatives] of Object.entries(mealItems.alternatives)) {
                    if (alternatives && alternatives.length > 0) {
                        alternativesText.push(`${mainItem} yerine: ${alternatives.join(", ")}`);
                    }
                }
                
                if (alternativesText.length > 0) {
                    return (
                        <>
                            <Typography variant="body2" component="div">{mainItems}</Typography>
                            <Typography variant="body2" component="div" color="text.secondary" sx={{ fontSize: '0.85rem', fontStyle: 'italic', mt: 0.5 }}>
                                {alternativesText.join("; ")}
                            </Typography>
                        </>
                    );
                }
            }
            
            return mainItems;
        }
        
        return "Öğün formatı tanınmıyor.";
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                Anamnez Formu
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<AddIcon />}
                                onClick={() => alert('Yeni anamnez bilgisi ekleme formu açılacak')}
                            >
                                Yeni Anamnez
                            </Button>
                        </Box>
                        
                        {/* Sağlık Bilgileri Akordiyonu */}
                        <Accordion defaultExpanded elevation={3} sx={{ mb: 2 }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    bgcolor: 'primary.light', 
                                    color: 'primary.contrastText',
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Sağlık Bilgileri
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                    <Chip 
                                        label="Son Güncelleme: 15.05.2023" 
                                        size="small" 
                                        color="primary" 
                                        sx={{ mr: 1 }} 
                                    />
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        startIcon={<EditIcon />}
                                        onClick={() => alert('Sağlık bilgileri düzenleme formu açılacak')}
                                    >
                                        Düzenle
                                    </Button>
                                </Box>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Kronik Hastalıklar" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    <Chip label="Hipertansiyon" size="small" color="primary" variant="outlined" />
                                                    <Chip label="Tip 2 Diyabet" size="small" color="primary" variant="outlined" />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Alerjiler" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Laktoz intoleransı, Fındık alerjisi
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="İlaç Kullanımı" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Metformin 500mg (günde 2 kez)
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Geçmiş Ameliyatlar" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Apendektomi (2015)
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Aile Sağlık Geçmişi" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Anne: Hipertansiyon<br />
                                                    Baba: Kalp hastalığı
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Kan Değerleri" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Son kontrol: 10.04.2023<br />
                                                    HbA1c: 6.8%<br />
                                                    Kolesterol: 210 mg/dL
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        
                        {/* Diyet Alışkanlıkları Akordiyonu */}
                        <Accordion elevation={3} sx={{ mb: 2 }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    bgcolor: 'warning.light', 
                                    color: 'warning.contrastText',
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Diyet Alışkanlıkları
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                    <Chip 
                                        label="Son Güncelleme: 12.05.2023" 
                                        size="small" 
                                        color="warning" 
                                        sx={{ mr: 1 }} 
                                    />
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        startIcon={<EditIcon />}
                                        onClick={() => alert('Diyet alışkanlıkları düzenleme formu açılacak')}
                                        color="warning"
                                    >
                                        Düzenle
                                    </Button>
                                </Box>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Günlük Su Tüketimi" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    4-5 bardak (yetersiz)
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Öğün Düzeni" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Sabah: Genellikle atlanıyor<br />
                                                    Öğle: Hafif yemek<br />
                                                    Akşam: Ağır ve geç yemek
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Favori Yiyecekler" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Makarna, beyaz ekmek, şekerli içecekler
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Sevmediği Yiyecekler" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Brokoli, karnabahar, ıspanak
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Atıştırmalık Alışkanlıkları" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Akşam TV izlerken tatlı ve cips tüketimi
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Dışarıda Yemek" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Haftada 3-4 kez fast-food tüketimi
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        
                        {/* Fiziksel Aktivite Akordiyonu */}
                        <Accordion elevation={3} sx={{ mb: 2 }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    bgcolor: 'info.light', 
                                    color: 'info.contrastText',
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Fiziksel Aktivite
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                    <Chip 
                                        label="Son Güncelleme: 10.05.2023" 
                                        size="small" 
                                        color="info" 
                                        sx={{ mr: 1 }} 
                                    />
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        startIcon={<EditIcon />}
                                        onClick={() => alert('Fiziksel aktivite düzenleme formu açılacak')}
                                        color="info"
                                    >
                                        Düzenle
                                    </Button>
                                </Box>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Aktivite Seviyesi" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Sedanter (masa başı çalışma)
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Egzersiz Alışkanlıkları" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Haftada 1 kez yürüyüş (30 dakika)
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Sevdiği Sporlar" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Yüzme, bisiklet
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader 
                                                title="Mesleği ve Aktivite Durumu" 
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Yazılım Geliştirici (8+ saat oturarak çalışma)
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        
                        {/* Uyku ve Stres Yönetimi */}
                        <Accordion elevation={3} sx={{ mb: 2 }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    bgcolor: 'success.light', 
                                    color: 'success.contrastText',
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Uyku ve Stres Yönetimi
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        startIcon={<AddIcon />}
                                        onClick={() => alert('Uyku ve stres bilgileri ekleme formu açılacak')}
                                        color="success"
                                    >
                                        Ekle
                                    </Button>
                                </Box>
                                
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    height: 200, 
                                    border: '1px dashed', 
                                    borderColor: 'grey.400',
                                    borderRadius: 1
                                }}>
                                    <Typography color="text.secondary">
                                        Henüz uyku ve stres bilgisi eklenmemiş.
                                    </Typography>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                        
                        {/* Özel Notlar */}
                        <Accordion elevation={3}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    bgcolor: 'secondary.light', 
                                    color: 'secondary.contrastText',
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Özel Notlar
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        startIcon={<EditIcon />}
                                        onClick={() => alert('Notlar düzenleme formu açılacak')}
                                        color="secondary"
                                    >
                                        Düzenle
                                    </Button>
                                </Box>
                                
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="body2">
                                        Danışan iş hayatında yoğun stres yaşıyor. Akşamları geç saatlerde yemek yeme alışkanlığı var.
                                        Diyetisyen randevularına düzenli geliyor ancak beslenme planına uyumda zaman zaman zorluklar yaşıyor.
                                        Hafta sonları sosyal hayatında beslenme düzenini korumakta zorlanıyor.
                                    </Typography>
                                </Paper>
                            </AccordionDetails>
                        </Accordion>
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
                                            ? nutritionPlan[selectedPlanIndex]?.note || "İsim Girilmemiş Plan"
                                            : "İsim Girilmemiş Plan"}
                                    </Typography>
                                </Box>

                                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                                    <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 1 }} />
                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                        İşaretli ve üzeri çizili öğeler, danışanın mobil uygulamada yedim olarak işaretlediği öğünlerdir.
                                    </Typography>
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
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazartesi?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Salı?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Çarşamba?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Perşembe?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cuma?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cumartesi?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazar?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
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
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazartesi?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Salı?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Çarşamba?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Perşembe?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cuma?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cumartesi?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazar?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
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
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazartesi?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Salı?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Çarşamba?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Perşembe?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cuma?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cumartesi?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazar?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
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
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazartesi?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Salı?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Çarşamba?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Perşembe?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cuma?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cumartesi?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0 
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazar?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Grid>                                        
                                        </Grid>                                        
                                    </Box>
                                </Box>
                                <Divider />
                            </Paper>
                        )}

                        <Card elevation={3} sx={{ mb: 3 }}>
                            <CardHeader 
                                title="Atanmış Planlar" 
                                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                sx={{ 
                                    bgcolor: 'primary.light', 
                                    color: 'primary.contrastText',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider'
                                }}
                            />
                            <List>
                                {nutritionPlanLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : nutritionPlan && nutritionPlan.length > 0 ? (
                                    nutritionPlan.map((plan, index) => {
                                        // Calculate how many meals have been eaten in this plan
                                        let totalMeals = 0;
                                        let eatenMeals = 0;
                                        
                                        if (plan.mealPlan) {
                                            Object.keys(plan.mealPlan).forEach(day => {
                                                if (plan.mealPlan[day]) {
                                                    Object.keys(plan.mealPlan[day]).forEach(mealType => {
                                                        const meals = plan.mealPlan[day][mealType];
                                                        if (Array.isArray(meals) && meals.length > 0) {
                                                            if (meals[0].hasOwnProperty('isim')) {
                                                                // New format with isim and yenildi
                                                                totalMeals += meals.length;
                                                                eatenMeals += meals.filter(meal => meal.yenildi).length;
                                                            } else {
                                                                // Old format
                                                                totalMeals += meals.length;
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        
                                        return (
                                            <React.Fragment key={plan.id || index}>
                                                <ListItem
                                                    onClick={() => setSelectedPlanIndex(index)}
                                                    sx={{ 
                                                        cursor: 'pointer',
                                                        bgcolor: selectedPlanIndex === index ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0, 0, 0, 0.08)'
                                                        }
                                                    }}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                            <EventIcon />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText 
                                                        primary={
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                                {plan.note || "Beslenme Planı"}
                                                                {isActivePlan(plan) && (
                                                                    <Chip 
                                                                        label="Aktif Plan" 
                                                                        size="small" 
                                                                        color="success" 
                                                                        sx={{ ml: 1 }}
                                                                    />
                                                                )}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <>
                                                                <Typography variant="body2" component="span">
                                                                    {plan.start_date && plan.end_date 
                                                                        ? `${new Date(plan.start_date).toLocaleDateString('tr-TR')} - ${new Date(plan.end_date).toLocaleDateString('tr-TR')}` 
                                                                        : "Tarih belirtilmemiş"}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" display="block">
                                                                    Not: {plan.note || "Not eklenmemiş"}
                                                                </Typography>
                                                                {totalMeals > 0 && (
                                                                    <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                                                                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                                                                        {eatenMeals} / {totalMeals} öğün tüketildi
                                                                    </Typography>
                                                                )}
                                                            </>
                                                        }
                                                    />
                                                </ListItem>
                                                {index < nutritionPlan.length - 1 && (
                                                    <Divider variant="inset" component="li" />
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <ListItem>
                                        <ListItemText 
                                            primary="Atanmış beslenme planı bulunamadı"
                                            secondary="Danışana henüz bir beslenme planı atanmamış"
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </Card>
                    </Box>
                );
            case 'randevu':
                return (
                    <Box>
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
                // Aktif invoice'u bul
                const today = new Date();
                const activeInvoice = clientInvoices.find(inv => {
                    if (!inv.issueDate || !inv.dueDate) return false;
                    const start = new Date(inv.issueDate);
                    const end = new Date(inv.dueDate);
                    return today >= start && today <= end;
                });
                // Pagination hesaplamaları
                const totalPages = Math.ceil(clientInvoices.length / invoicesPerPage);
                const paginatedInvoices = clientInvoices.slice(
                    (currentInvoicePage - 1) * invoicesPerPage,
                    currentInvoicePage * invoicesPerPage
                );
                return (
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
                            Ödeme Takip
                        </Typography>
                        {/* Aktif Invoice */}
                        {activeInvoice && (
                            <Card elevation={4} sx={{ mb: 3, border: '2px solid', borderColor: 'success.main', background: '#f6fff6' }}>
                                <CardHeader
                                    avatar={<Avatar sx={{ bgcolor: 'success.main' }}><ReceiptLongIcon /></Avatar>}
                                    title={<Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success.main' }}>Aktif Fatura: {activeInvoice.description || 'Açıklama yok'}</Typography>}
                                    subheader={<Typography variant="body2" color="text.secondary">Fatura No: {activeInvoice.id}</Typography>}
                                    action={<Chip label="Aktif" color="success" size="small" />}
                                    sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.100' }}
                                />
                                <CardContent>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Tutar:</strong> {Number(activeInvoice.amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Düzenleme Tarihi:</strong> {activeInvoice.issueDate ? new Date(activeInvoice.issueDate).toLocaleDateString('tr-TR') : '-'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Son Ödeme Tarihi:</strong> {activeInvoice.dueDate ? new Date(activeInvoice.dueDate).toLocaleDateString('tr-TR') : '-'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Oluşturulma: {activeInvoice.createdAt ? new Date(activeInvoice.createdAt).toLocaleString('tr-TR') : '-'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}
                        {clientInvoicesLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : clientInvoices && clientInvoices.length > 0 ? (
                            <Box>
                                <Grid container spacing={2}>
                                    {paginatedInvoices.map((invoice) => {
                                        let statusColor = 'default';
                                        let statusLabel = '';
                                        if (invoice.status === 'paid') {
                                            statusColor = 'success';
                                            statusLabel = 'Ödendi';
                                        } else if (invoice.status === 'cancelled') {
                                            statusColor = 'error';
                                            statusLabel = 'İptal';
                                        } else {
                                            statusColor = 'warning';
                                            statusLabel = 'Beklemede';
                                        }
                                        return (
                                            <Grid item xs={12} md={6} key={invoice.id}>
                                                <Card elevation={3}>
                                                    <CardHeader
                                                        avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><ReceiptLongIcon /></Avatar>}
                                                        title={<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{invoice.description || 'Açıklama yok'}</Typography>}
                                                        subheader={<Typography variant="body2" color="text.secondary">Fatura No: {invoice.id}</Typography>}
                                                        action={<Chip label={statusLabel} color={statusColor} size="small" />}
                                                        sx={{ bgcolor: 'grey.100', borderBottom: '1px solid', borderColor: 'divider' }}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Tutar:</strong> {Number(invoice.amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Düzenleme Tarihi:</strong> {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('tr-TR') : '-'}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Son Ödeme Tarihi:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('tr-TR') : '-'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Oluşturulma: {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString('tr-TR') : '-'}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setCurrentInvoicePage(p => Math.max(1, p - 1))}
                                            disabled={currentInvoicePage === 1}
                                            sx={{ mr: 1 }}
                                        >
                                            Önceki
                                        </Button>
                                        <Typography variant="body2" sx={{ mx: 2, display: 'flex', alignItems: 'center' }}>
                                            Sayfa {currentInvoicePage} / {totalPages}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setCurrentInvoicePage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentInvoicePage === totalPages}
                                        >
                                            Sonraki
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                Henüz ödeme bilgisi bulunmamaktadır.
                            </Typography>
                        )}
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
