import React, {useState, useEffect} from "react";
import Default from "../../Components/Layouts/Default.jsx";
import "./Odeme.css";
import {
    Alert,
    AlertTitle,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Modal,
    Paper,
    Select,
    Stepper,
    Step,
    StepLabel,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";
import CreditCard from "@mui/icons-material/CreditCard";
import EditIcon from "@mui/icons-material/Edit";
import ReceiptLong from "@mui/icons-material/ReceiptLong";
import Check from "@mui/icons-material/Check";
import CheckCircle from "@mui/icons-material/CheckCircle";
import CurrencyLira from "@mui/icons-material/CurrencyLira";
import Download from "@mui/icons-material/Download";
import AccountBalance from "@mui/icons-material/AccountBalance";
import Compare from "@mui/icons-material/Compare";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import School from "@mui/icons-material/School";
import Diamond from "@mui/icons-material/Diamond";
import Cancel from "@mui/icons-material/Cancel";

import axios from "axios";

export default function Odeme() {
    const [activeTab, setActiveTab] = useState(0);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [openChangeModal, setOpenChangeModal] = useState(false);
    const [openUpgradeModal, setOpenUpgradeModal] = useState(false);
    const [openBillingAddressModal, setOpenBillingAddressModal] = useState(false);
    const [openCancelModal, setOpenCancelModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [newCardInfo, setNewCardInfo] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });

    const [dietitianInfo, setDietitianInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // This initial state will be overwritten by the fetch result
    const [subscriptionInfo, setSubscriptionInfo] = useState({
        currentPlan: "Yükleniyor...",
        price: 0,
        billingCycle: "N/A",
        nextPaymentDate: "N/A",
        autoRenew: true, // Assuming default to true until data loads
        features: [] // Will be populated by fetch
    });

    // Payment methods (static for now, can be fetched later)
    const [paymentMethods] = useState([
        {
            id: 1,
            type: "VISA",
            lastFour: "4242",
            expiryDate: "06/24",
            isDefault: true,
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
        }
    ]);

    // Fatura geçmişi (static for now, can be fetched later)
    const [invoiceHistory] = useState([
        {date: '15 Mart 2023', amount: '₺599', status: 'Ödendi', invoice: 'INV-20230315'},
        {date: '15 Şubat 2023', amount: '₺599', status: 'Ödendi', invoice: 'INV-20230215'},
        {date: '15 Ocak 2023', amount: '₺599', status: 'Ödendi', invoice: 'INV-20230115'},
        {date: '15 Aralık 2022', amount: '₺599', status: 'Ödendi', invoice: 'INV-20221215'},
        {date: '15 Kasım 2022', amount: '₺599', status: 'Ödendi', invoice: 'INV-20221115'}
    ]);

    // Plan karşılaştırma (static for now)
    const [plans] = useState([
        {
            name: "Başlangıç",
            type: "starter",
            price: 500,
            features: [
                { name: "25 danışan", included: true },
                { name: "Gelişmiş raporlar", included: true },
                { name: "E-posta desteği", included: true },
                { name: "Çevrimiçi randevu", included: true },
                { name: "Özelleştirilmiş diyet planları", included: true },
                { name: "SMS gönderme", included: false }
            ]
        },
        {
            name: "Öğrenci",
            type: "student",
            price: 500, // Student price
            originalPrice: 1000, // Standard price before discount
            discount: "50%",
            features: [
                { name: "Sınırsız danışan", included: true },
                { name: "Gelişmiş raporlar", included: true },
                { name: "7/24 destek", included: true },
                { name: "Çevrimiçi randevu", included: true },
                { name: "Özelleştirilmiş diyet planları", included: true },
                { name: "Gelişmiş grafikler ve analiz", included: true }
            ]
        },
        {
            name: "Premium",
            type: "premium",
            price: 1000,
            popular: true,
            features: [
                { name: "Sınırsız danışan", included: true },
                { name: "Gelişmiş raporlar", included: true },
                { name: "7/24 öncelikli destek", included: true },
                { name: "Çevrimiçi randevu", included: true },
                { name: "Özelleştirilmiş diyet planları", included: true },
                { name: "SMS gönderme", included: true }
            ]
        }
    ]);

    // Fatura adresi (static for now, can be fetched/saved later)
    const [billingAddress, setBillingAddress] = useState({
        name: "Dr. Furkan İmamoğlu",
        company: "İstanbul Beslenme Kliniği",
        address: "Bağdat Caddesi No: 123",
        city: "Kadıköy",
        state: "İstanbul",
        zipCode: "34000",
        country: "Türkiye"
    });

    const [editedBillingAddress, setEditedBillingAddress] = useState({...billingAddress});

    // Fetch dietitian info
    useEffect(() => {
        const fetchDietitianInfo = async () => {
            try {
                setLoading(true);
                // Mock API response structure if needed for testing
                // const mockResponse = {
                //     data: {
                //         subscription_type: "free", // or "starter", "student", "premium"
                //         // other dietitian info...
                //     }
                // };
                // const response = mockResponse; // Use mock data
                const response = await axios.get('/dietitian/getDietitianInfo'); // Use actual API call

                setDietitianInfo(response.data);

                // Update subscription info based on the API response
                if (response.data && response.data.subscription_type) {
                    let planName = "";
                    let planPrice = 0;
                    let planFeatures = [];
                    let billingCycle = "Aylık"; // Assuming monthly for paid plans

                    switch(response.data.subscription_type) {
                        case "starter":
                            planName = "Başlangıç Diyetisyen Paketi";
                            planPrice = 500;
                            planFeatures = plans.find(p => p.type === 'starter')?.features.filter(f => f.included).map(f => f.name) || [];
                            break;
                        case "student":
                            planName = "Öğrenci Diyetisyen Paketi";
                            planPrice = 500; // Assuming student price is 500
                            planFeatures = plans.find(p => p.type === 'student')?.features.filter(f => f.included).map(f => f.name) || [];
                            break;
                        case "premium":
                            planName = "Premium Diyetisyen Paketi";
                            planPrice = 1000;
                            planFeatures = plans.find(p => p.type === 'premium')?.features.filter(f => f.included).map(f => f.name) || [];
                            break;
                        case "free":
                        default:
                            planName = "Aktif paketiniz bulunmamaktadır.";
                            planPrice = 0;
                            billingCycle = "N/A";
                            planFeatures = [];
                            break;
                    }

                    setSubscriptionInfo(prev => ({
                        ...prev,
                        currentPlan: planName,
                        price: planPrice,
                        features: planFeatures,
                        billingCycle: billingCycle, // Update billing cycle based on plan type
                        nextPaymentDate: response.data.subscription_type === "free" ? "N/A" : "15 Nisan 2023",
                        autoRenew: response.data.subscription_type !== "free",
                    }));
                } else {
                    setSubscriptionInfo({
                        currentPlan: "Aktif paketiniz bulunmamaktadır.",
                        price: 0,
                        billingCycle: "N/A",
                        nextPaymentDate: "N/A",
                        autoRenew: false,
                        features: []
                    });
                }


                setLoading(false);
            } catch (error) {
                console.error("Error fetching dietitian info:", error);
                setLoading(false);
                // Fallback to free plan on error
                setSubscriptionInfo({
                    currentPlan: "Aktif paketiniz bulunmamaktadır.",
                    price: 0,
                    billingCycle: "N/A",
                    nextPaymentDate: "N/A",
                    autoRenew: false,
                    features: ["Diyetia\'yı kullanmak için, paket satın almanız gerekmektedir."]
                });
            }
        };

        fetchDietitianInfo();
    }, []);

    // Get subscription type from dietitian info
    const getCurrentSubscriptionType = () => {
        // Check dietitianInfo and subscriptionInfo for the type
        // dietitianInfo.subscription_type is the source of truth from API
        // subscriptionInfo is the state derived from it for display
        return dietitianInfo?.subscription_type || "free";
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSaveSettings = () => {
        setTimeout(() => {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 500);
        // In a real app, you would send data to your backend here
        console.log("Saving settings...");
    };

    const handleOpenChangeModal = () => {
        setOpenChangeModal(true);
    };

    const handleCloseChangeModal = () => {
        setOpenChangeModal(false);
    };

    const handleOpenUpgradeModal = (plan) => {
        setSelectedPlan(plan);
        setOpenUpgradeModal(true);
    };

    const handleCloseUpgradeModal = () => {
        setSelectedPlan(null); // Clear selected plan on close
        setOpenUpgradeModal(false);
    };

    const handleCardInputChange = (e) => {
        setNewCardInfo({
            ...newCardInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleAutoRenewChange = (e) => {
        const isChecked = e.target.checked;
        // In a real app, send this update to the backend
        console.log("Auto renew changed", isChecked);
        // Optimistically update state (or wait for API response)
        setSubscriptionInfo(prev => ({ ...prev, autoRenew: isChecked }));
        handleSaveSettings(); // Indicate settings were saved
    };

    const handleOpenBillingAddressModal = () => {
        setEditedBillingAddress({...billingAddress});
        setOpenBillingAddressModal(true);
    };

    const handleCloseBillingAddressModal = () => {
        setOpenBillingAddressModal(false);
    };

    const handleBillingAddressChange = (e) => {
        setEditedBillingAddress({
            ...editedBillingAddress,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveBillingAddress = () => {
        // In a real app, send editedBillingAddress to the backend
        console.log("Saving billing address:", editedBillingAddress);
        setBillingAddress({...editedBillingAddress}); // Optimistic update
        handleSaveSettings(); // Indicate settings were saved
        handleCloseBillingAddressModal();
    };

    // Removed handleSaveBillingAddressModal as handleSaveBillingAddress does both now

    const handleOpenCancelModal = () => {
        // Only allow canceling if NOT on the free plan
        if (getCurrentSubscriptionType() !== "free") {
            setOpenCancelModal(true);
        }
    };

    const handleCloseCancelModal = () => {
        setOpenCancelModal(false);
    };

    const handleCancelSubscription = () => {
        // In a real app, send cancellation request to the backend
        console.log("Cancelling subscription...");
        handleSaveSettings(); // Indicate cancellation process started/completed
        handleCloseCancelModal();
        // Potentially update subscriptionInfo to reflect pending cancellation or switch to free immediately
        // For this example, we'll just show the success message
    };

    const isFreePlan = getCurrentSubscriptionType() === "free";
    const planTabLabel = isFreePlan ? "Plan Seçin" : "Plan Karşılaştırma";
    const invoiceTabDisabled = isFreePlan; // Disable invoice tab if free

    return (
        <Default>
            <Box className="odeme-container">
                <Typography variant="h4" component="h1" className="odeme-title">
                    Abonelik ve Ödemeler
                </Typography>

                {saveSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        İşleminiz başarıyla tamamlandı!
                    </Alert>
                )}

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        aria-label="payment tabs"
                        variant="fullWidth"
                        className="payment-tabs"
                    >
                        <Tab icon={<CreditCard />} iconPosition="start" label="Abonelik Detayları" />
                        <Tab
                            icon={<ReceiptLong />}
                            iconPosition="start"
                            label="Faturalar ve Ödeme Geçmişi"
                            disabled={invoiceTabDisabled} // Disable if free plan
                            sx={invoiceTabDisabled ? { opacity: 0.5 } : {}} // Visually indicate disabled
                        />
                        <Tab
                            icon={<Compare />}
                            iconPosition="start"
                            label={planTabLabel}
                            className={isFreePlan ? 'highlighted-tab' : ''} // Apply class for highlighting
                        />
                    </Tabs>
                </Box>

                {/* Abonelik Detayları Tab */}
                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} lg={8}>
                            <Card variant="outlined" className="payment-card current-plan-card">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Mevcut Abonelik Planınız
                                    </Typography>
                                    <Divider sx={{mb: 3}}/>

                                    {loading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : isFreePlan ? ( // Check isFreePlan here
                                        <Paper elevation={0} variant="outlined" sx={{
                                            p: 4,
                                            mb: 4,
                                            borderRadius: 2,
                                            background: 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)',
                                            minHeight: '300px'
                                        }}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} md={8}>
                                                    <Box sx={{color: 'white'}}>
                                                        <Typography variant="h3" gutterBottom fontWeight="bold">
                                                            Aktif Paketiniz Bulunmamaktadır.
                                                        </Typography>
                                                        <Typography variant="body1" sx={{opacity: 0.9, mb: 2}}>
                                                            Diyetia'yı kullanmak için, paket satın almanız gerekmektedir.
                                                        </Typography>
                                                        <Box sx={{mt: 4, display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                                                            {subscriptionInfo.features.map((feature, index) => (
                                                                <Chip
                                                                    key={index}
                                                                    label={feature}
                                                                    size="small"
                                                                    icon={<Check sx={{color: 'white !important'}} />}
                                                                    sx={{
                                                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                                                        color: 'white',
                                                                        '& .MuiChip-icon': {
                                                                            color: 'white'
                                                                        },
                                                                        mb: 1
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: {xs: 'flex-start', md: 'flex-end'},
                                                        color: 'white',
                                                        height: '100%',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: {xs: 'flex-start', md: 'flex-end'},
                                                            width: '100%'
                                                        }}>
                                                            <CurrencyLira sx={{fontSize: 40}} />
                                                            <Typography variant="h2" fontWeight="bold">
                                                                0
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{mt: 3, textAlign: {xs: 'left', md: 'right'}}}>
                                                            <Typography variant="body2" sx={{mb: 1}}>
                                                                Hemen premium özelliklere erişin!
                                                            </Typography>
                                                            {/* Button to go to Plan Comparison tab */}
                                                            <Button
                                                                variant="contained"
                                                                color="primary" // Use primary color for better visibility
                                                                sx={{mt: 2}}
                                                                onClick={() => handleTabChange(null, 2)} // Change tab to Plan Comparison (index 2)
                                                                startIcon={<Compare />}
                                                            >
                                                                Premium Planları Keşfedin
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ) : ( // Display paid plan info
                                        <Paper elevation={0} variant="outlined" sx={{
                                            p: 4,
                                            mb: 4,
                                            borderRadius: 2,
                                            background: getCurrentSubscriptionType() === "premium"
                                                ? 'linear-gradient(45deg, #1a237e 30%, #303f9f 90%)'
                                                : getCurrentSubscriptionType() === "student"
                                                    ? 'linear-gradient(45deg, #004d40 30%, #00796b 90%)'
                                                    : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                            minHeight: '300px'
                                        }}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={12} md={8}>
                                                    <Box sx={{color: 'white'}}>
                                                        <Typography variant="subtitle1" gutterBottom>
                                                            Aktif Plan
                                                        </Typography>
                                                        <Typography variant="h3" gutterBottom fontWeight="bold">
                                                            {subscriptionInfo.currentPlan}
                                                        </Typography>
                                                        <Typography variant="body1" sx={{opacity: 0.9, mb: 2}}>
                                                            {/* Dynamic description based on plan? */}
                                                            {getCurrentSubscriptionType() === "premium" ? "Tüm özelliklere sınırsız erişim ile işinizi daha verimli yönetin"
                                                                : getCurrentSubscriptionType() === "student" ? "Öğrenciye özel fiyatlarla tüm profesyonel özelliklere erişin"
                                                                    : "İşletmenizi büyütmek için temel özelliklere erişin"}
                                                        </Typography>
                                                        <Box sx={{mt: 4, display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                                                            {subscriptionInfo.features.map((feature, index) => (
                                                                <Chip
                                                                    key={index}
                                                                    label={feature}
                                                                    size="small"
                                                                    icon={<Check sx={{color: 'white !important'}} />}
                                                                    sx={{
                                                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                                                        color: 'white',
                                                                        '& .MuiChip-icon': {
                                                                            color: 'white'
                                                                        },
                                                                        mb: 1
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>

                                                        <Box sx={{mt: 4}}>
                                                            <Typography variant="body2" sx={{mb: 1}}>
                                                                Abonelik Başlangıç: <b>15 Ocak 2023</b> {/* Mock date */}
                                                            </Typography>
                                                            {/* Only show client count if applicable or not unlimited */}
                                                            {getCurrentSubscriptionType() === 'starter' && (
                                                                <Typography variant="body2" sx={{mb: 1}}>
                                                                    Toplam Danışan Sayınız: <b>{dietitianInfo?.current_clients || 0} / 25</b> {/* Mock client count */}
                                                                </Typography>
                                                            )}
                                                            <Typography variant="body2">
                                                                Kullanım Durumu: <b>%{getCurrentSubscriptionType() === 'starter' ? Math.round((dietitianInfo?.current_clients || 0) / 25 * 100) : 'N/A'}</b> {/* Mock usage % */}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: {xs: 'flex-start', md: 'flex-end'},
                                                        color: 'white',
                                                        height: '100%',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: {xs: 'flex-start', md: 'flex-end'},
                                                            width: '100%'
                                                        }}>
                                                            <CurrencyLira sx={{fontSize: 40}} />
                                                            <Typography variant="h2" fontWeight="bold">
                                                                {subscriptionInfo.price}
                                                                <Typography component="span" variant="h6" sx={{opacity: 0.8, ml: 1}}>
                                                                    /{subscriptionInfo.billingCycle.toLowerCase()}
                                                                </Typography>
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{mt: 3, textAlign: {xs: 'left', md: 'right'}}}>
                                                            <Typography variant="body2" sx={{mb: 1}}>
                                                                Sonraki ödeme tarihi: <b>{subscriptionInfo.nextPaymentDate}</b>
                                                            </Typography>
                                                            {/* Calculate remaining days based on nextPaymentDate (requires parsing date strings) */}
                                                            <Typography variant="body2" sx={{mb: 1}}>
                                                                Kalan gün: <b>12 gün</b> {/* Mock remaining days */}
                                                            </Typography>
                                                            {/* Button to go to Plan Comparison tab for upgrading/changing */}
                                                            <Button
                                                                variant="outlined"
                                                                color="inherit" // Use inherit to get color from parent (white)
                                                                sx={{
                                                                    mt: 2,
                                                                    color: 'white',
                                                                    borderColor: 'white',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                                                    }
                                                                }}
                                                                onClick={() => handleTabChange(null, 2)} // Change tab to Plan Comparison (index 2)
                                                                startIcon={<Compare />}
                                                            >
                                                                Planları Keşfedin
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    )}

                                    {/* Auto Renew and Cancel only visible for PAID plans */}
                                    {!loading && !isFreePlan && (
                                        <Grid container spacing={3} alignItems="center">
                                            <Grid item xs={12} sm={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={subscriptionInfo.autoRenew}
                                                            onChange={handleAutoRenewChange}
                                                            name="autoRenew"
                                                            color="primary"
                                                        />
                                                    }
                                                    label="Otomatik Yenileme"
                                                />
                                                <FormHelperText>
                                                    Aboneliğiniz her dönem sonunda otomatik olarak yenilenecektir.
                                                </FormHelperText>
                                            </Grid>
                                            <Grid item xs={12} sm={6} sx={{textAlign: {xs: 'left', sm: 'right'}}}>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={handleOpenCancelModal}
                                                    startIcon={<Cancel />}
                                                    sx={{
                                                        borderWidth: '2px',
                                                        '&:hover': {
                                                            borderWidth: '2px',
                                                            backgroundColor: 'rgba(211, 47, 47, 0.04)'
                                                        }
                                                    }}
                                                >
                                                    Aboneliği İptal Et
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Ödeme Yöntemleri Kartı - Şimdilik yorum satırı yapıldı */}
                            {/* Add this back and conditionally hide/show based on isFreePlan */}
                            {/*
                            {!loading && !isFreePlan && ( // Only show payment methods for paid plans
                                <Card variant="outlined" className="payment-card" sx={{mt: 3}}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Ödeme Yöntemleri
                                        </Typography>
                                        <Divider sx={{mb: 3}}/>

                                        {paymentMethods.length === 0 && (
                                             <Box sx={{textAlign: 'center', py: 2}}>
                                                 <Typography variant="body2" color="text.secondary">Henüz kayıtlı bir ödeme yönteminiz yok.</Typography>
                                             </Box>
                                        )}

                                        {paymentMethods.map((method) => (
                                            <Box key={method.id} sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mb: 2,
                                                p: 2,
                                                border: '1px solid #eee',
                                                borderRadius: 1,
                                                '&:hover': { backgroundColor: '#f9f9f9' }
                                            }}>
                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                    <Box
                                                        component="img"
                                                        src={method.logo}
                                                        alt={method.type}
                                                        sx={{width: 60, mr: 2}}
                                                    />
                                                    <Box>
                                                        <Typography variant="body1">
                                                            **** **** **** {method.lastFour}
                                                            {method.isDefault && (
                                                                <Chip
                                                                    label="Varsayılan"
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    sx={{ml: 1, height: 20}}
                                                                />
                                                            )}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Son Kullanma: {method.expiryDate}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <IconButton color="primary" onClick={handleOpenChangeModal}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Box>
                                        ))}

                                        <Button
                                            variant="outlined"
                                            startIcon={<AddCard />}
                                            sx={{mt: 2}}
                                            onClick={handleOpenChangeModal}
                                        >
                                            Yeni Ödeme Yöntemi Ekle
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                            */}
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Card variant="outlined" className="payment-card">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Fatura Adresi
                                    </Typography>
                                    <Divider sx={{mb: 3}}/>

                                    <Box sx={{mb: 2}}>
                                        <Typography variant="body1" fontWeight="500">
                                            {billingAddress.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {billingAddress.company}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {billingAddress.address}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {billingAddress.country}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<EditIcon/>}
                                        onClick={handleOpenBillingAddressModal}
                                    >
                                        Fatura Bilgilerini Düzenle
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card variant="outlined" className="payment-card" sx={{mt: 3}}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Ödeme Özeti
                                    </Typography>
                                    <Divider sx={{mb: 3}}/>

                                    {loading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : isFreePlan ? ( // Check isFreePlan here
                                        <Box>
                                            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', p: 3}}>
                                                <Typography variant="body1" align="center" paragraph>
                                                    Şu anda ücretsiz paketi kullanıyorsunuz.
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" align="center" paragraph>
                                                    Daha fazla özelliğe erişmek için premium paketlerimizden birini seçin.
                                                </Typography>
                                                {/* Button to go to Plan Comparison tab */}
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleTabChange(null, 2)} // Change tab to Plan Comparison (index 2)
                                                    sx={{mt: 2}}
                                                    startIcon={<Compare />}
                                                >
                                                    Paket Seç
                                                </Button>
                                            </Box>
                                        </Box>
                                    ) : ( // Display paid summary
                                        <>
                                            <Box sx={{mb: 3}}>
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                    <Typography variant="body2" fontWeight="500">Mevcut Plan</Typography>
                                                    <Typography variant="body2">{subscriptionInfo.currentPlan}</Typography>
                                                </Box>
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                    <Typography variant="body2" fontWeight="500">Fatura Dönemi</Typography>
                                                    <Typography variant="body2">{subscriptionInfo.billingCycle}</Typography>
                                                </Box>
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                    <Typography variant="body2" fontWeight="500">Sonraki Ödeme</Typography>
                                                    <Typography variant="body2">{subscriptionInfo.nextPaymentDate}</Typography>
                                                </Box>
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                    <Typography variant="body2" fontWeight="500">Ödeme Yöntemi</Typography>
                                                    {/* Conditionally show payment method only if available */}
                                                    <Typography variant="body2">{paymentMethods.length > 0 ? `VISA **** ${paymentMethods[0].lastFour}` : 'Belirtilmemiş'}</Typography>
                                                </Box>
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                    <Typography variant="body2" fontWeight="500">Otomatik Yenileme</Typography>
                                                    <Typography variant="body2">{subscriptionInfo.autoRenew ? 'Aktif' : 'Pasif'}</Typography>
                                                </Box>
                                            </Box>

                                            <Divider sx={{my: 2}} />

                                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                                <Typography variant="body1" fontWeight="500">Aylık Ücret</Typography>
                                                <Typography variant="body1" fontWeight="500">₺{subscriptionInfo.price}</Typography>
                                            </Box>

                                            {/* Calculate and display VAT */}
                                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                                <Typography variant="body2" color="text.secondary">KDV (%18)</Typography>
                                                <Typography variant="body2" color="text.secondary">₺{Math.round(subscriptionInfo.price * 0.18)}</Typography>
                                            </Box>

                                            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2, backgroundColor: '#f5f5f5', p: 2, borderRadius: 1}}>
                                                <Typography variant="subtitle1" fontWeight="bold">Toplam</Typography>
                                                {/* Include VAT in Total? Usually prices shown are inclusive, clarify if needed */}
                                                <Typography variant="subtitle1" fontWeight="bold">₺{subscriptionInfo.price + Math.round(subscriptionInfo.price * 0.18)}</Typography>
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
                                                Tüm fiyatlara KDV dahildir. Faturanız her ayın 15'inde otomatik olarak oluşturulacaktır. {/* Update date if fetch provides it */}
                                            </Typography>

                                            {/* Only show download button if invoices exist */}
                                            {invoiceHistory.length > 0 && (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    fullWidth
                                                    sx={{mt: 3}}
                                                    startIcon={<Download />}
                                                >
                                                    Son Faturayı İndir
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Faturalar ve Ödeme Geçmişi Tab */}
                {activeTab === 1 && (
                    // Conditionally show content or disabled message
                    <Card variant="outlined" className="payment-card">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Geçmiş İşlemler ve Faturalar
                            </Typography>
                            <Divider sx={{mb: 3}}/>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : isFreePlan || invoiceHistory.length === 0 ? ( // Check isFreePlan or empty history
                                <Box sx={{textAlign: 'center', py: 4}}>
                                    <ReceiptLong sx={{fontSize: 60, color: '#bdbdbd', mb: 2}} />
                                    <Typography variant="h6" gutterBottom>
                                        Fatura Geçmişi Bulunamadı
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" paragraph>
                                        {isFreePlan ?
                                            "Ücretsiz paketi kullandığınız için henüz fatura oluşturulmamıştır."
                                            : "Henüz bir fatura kaydı bulunmamaktadır." // Message for paid but no invoices yet
                                        }
                                    </Typography>
                                    {isFreePlan && ( // Only show button for free plan
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleTabChange(null, 2)} // Go to Plan Comparison
                                            sx={{mt: 2}}
                                            startIcon={<Compare />}
                                        >
                                            Premium Paketleri İncele
                                        </Button>
                                    )}
                                </Box>
                            ) : ( // Display invoice history for paid plans with history
                                <Grid container spacing={3}>
                                    <Grid item xs={12} lg={8}>
                                        <Paper variant="outlined" sx={{mb: 3}}>
                                            <Box sx={{width: '100%', overflowX: 'auto'}}>
                                                <Box sx={{minWidth: 650, p: 2}}>
                                                    <Grid container sx={{
                                                        fontWeight: 'bold',
                                                        p: 1.5,
                                                        borderBottom: '2px solid #f0f0f0'
                                                    }}>
                                                        <Grid item xs={3}>
                                                            <Typography variant="subtitle2">Tarih</Typography>
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <Typography variant="subtitle2">Tutar</Typography>
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <Typography variant="subtitle2">Durum</Typography>
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <Typography variant="subtitle2">İşlemler</Typography>
                                                        </Grid>
                                                    </Grid>

                                                    {invoiceHistory.map((invoice, index) => (
                                                        <Grid container key={index} sx={{
                                                            p: 1.5,
                                                            borderBottom: '1px solid #f0f0f0',
                                                            '&:hover': {backgroundColor: '#f9f9f9'}
                                                        }}>
                                                            <Grid item xs={3}>
                                                                <Typography variant="body2">{invoice.date}</Typography>
                                                            </Grid>
                                                            <Grid item xs={3}>
                                                                <Typography variant="body2">{invoice.amount}</Typography>
                                                            </Grid>
                                                            <Grid item xs={3}>
                                                                <Chip
                                                                    label={invoice.status}
                                                                    size="small"
                                                                    color="success"
                                                                    sx={{height: 24}}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={3}>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    startIcon={<Download fontSize="small" />}
                                                                    sx={{fontSize: '0.75rem'}}
                                                                >
                                                                    İndir
                                                                </Button>
                                                            </Grid>
                                                        </Grid>
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} lg={4}>
                                        <Card variant="outlined" sx={{height: '100%'}}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Fatura Özeti
                                                </Typography>
                                                <Divider sx={{mb: 3}}/>

                                                <Box sx={{mb: 3}}>
                                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                        <Typography variant="body2" color="text.secondary">Toplam Fatura</Typography>
                                                        <Typography variant="body2" fontWeight="500">{invoiceHistory.length}</Typography>
                                                    </Box>
                                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                        <Typography variant="body2" color="text.secondary">Toplam Ödenen</Typography>
                                                        {/* Calculate total based on history */}
                                                        <Typography variant="body2" fontWeight="500">₺{invoiceHistory.reduce((sum, item) => sum + parseFloat(item.amount.replace('₺', '')), 0)}</Typography>
                                                    </Box>
                                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                        <Typography variant="body2" color="text.secondary">Son Ödeme</Typography>
                                                        <Typography variant="body2" fontWeight="500">{invoiceHistory[0]?.date || 'N/A'}</Typography>
                                                    </Box>
                                                </Box>

                                                {invoiceHistory.length > 0 && (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        fullWidth
                                                        startIcon={<Download />}
                                                    >
                                                        Tüm Faturaları İndir
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Plan Karşılaştırma Tab */}
                {activeTab === 2 && (
                    <Card variant="outlined" className="payment-card">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {planTabLabel} {/* Use the dynamic label */}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                İhtiyaçlarınıza en uygun planı seçin ve Diyetia'nın tüm potansiyelini kullanın.
                            </Typography>
                            <Divider sx={{mb: 4}}/>

                            <Grid container spacing={3}>
                                {plans.map((plan, index) => (
                                    <Grid item xs={12} md={4} key={index}>
                                        <Paper
                                            elevation={0}
                                            variant="outlined"
                                            sx={{
                                                p: 3,
                                                borderRadius: 2,
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                position: 'relative',
                                                border: plan.popular ? '2px solid #2196F3' : '1px solid #e0e0e0',
                                                background: plan.type === "premium"
                                                    ? 'linear-gradient(135deg, #1a237e 0%, #303f9f 100%)'
                                                    : plan.type === "student"
                                                        ? 'linear-gradient(135deg, #004d40 0%, #00796b 100%)'
                                                        : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                                                color: plan.type === "premium" || plan.type === "student" ? 'white' : 'inherit',
                                                boxShadow: plan.popular ? '0 8px 16px rgba(33, 150, 243, 0.3)' : 'none',
                                                transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-5px)',
                                                    boxShadow: plan.type === "premium"
                                                        ? '0 12px 20px rgba(26, 35, 126, 0.4)'
                                                        : plan.type === "student"
                                                            ? '0 12px 20px rgba(0, 77, 64, 0.4)'
                                                            : '0 12px 20px rgba(0, 0, 0, 0.1)'
                                                }
                                            }}
                                        >
                                            {plan.popular && (
                                                <Chip
                                                    label="Popüler"
                                                    color="primary"
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -10,
                                                        right: 20,
                                                        fontWeight: 'bold',
                                                        backgroundColor: '#ff9800',
                                                        color: 'white'
                                                    }}
                                                />
                                            )}

                                            {/* Icons for plans */}
                                            {plan.type === "premium" && (
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 10,
                                                    left: 10,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    animation: 'pulse 2s infinite'
                                                }}>
                                                    <Diamond sx={{
                                                        color: '#8c9eff',
                                                        fontSize: '28px',
                                                        filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.7))'
                                                    }} />
                                                </Box>
                                            )}

                                            {plan.type === "student" && (
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 10,
                                                    left: 10,
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    <School fontSize="small" sx={{ mr: 0.5, color: 'white' }} />
                                                </Box>
                                            )}

                                            {plan.type === "starter" && (
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 10,
                                                    left: 10,
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    <Star sx={{ color: '#757575', fontSize: '22px' }} />
                                                </Box>
                                            )}

                                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                                {plan.name}
                                            </Typography>

                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                mb: 3
                                            }}>
                                                {plan.originalPrice ? (
                                                    <>
                                                        <Typography variant="h3" fontWeight="bold">
                                                            ₺{plan.price}
                                                        </Typography>
                                                        <Typography variant="subtitle1" sx={{mb: 0.8, ml: 1}}>
                                                            /ay
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                ml: 2,
                                                                textDecoration: 'line-through',
                                                                color: plan.type === "student" ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                                                            }}
                                                        >
                                                            ₺{plan.originalPrice}
                                                        </Typography>
                                                        <Chip
                                                            label={plan.discount}
                                                            color="error"
                                                            size="small"
                                                            sx={{ml: 1}}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <Typography variant="h3" fontWeight="bold">
                                                            ₺{plan.price}
                                                        </Typography>
                                                        <Typography variant="subtitle1" sx={{mb: 0.8, ml: 1}}>
                                                            /ay
                                                        </Typography>
                                                    </>
                                                )}
                                            </Box>

                                            <Divider sx={{
                                                mb: 2,
                                                borderColor: plan.type === "premium" || plan.type === "student"
                                                    ? 'rgba(255,255,255,0.2)'
                                                    : 'rgba(0,0,0,0.12)'
                                            }} />

                                            <Box sx={{flexGrow: 1}}>
                                                {plan.features.map((feature, featureIndex) => (
                                                    <Box
                                                        key={featureIndex}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            mb: 1.5
                                                        }}
                                                    >
                                                        {feature.included ? (
                                                            <CheckCircle
                                                                fontSize="small"
                                                                color={plan.type === "premium" || plan.type === "student" ? "inherit" : "primary"}
                                                                sx={{
                                                                    mr: 1,
                                                                    color: plan.type === "premium"
                                                                        ? '#8c9eff'
                                                                        : plan.type === "student"
                                                                            ? '#80cbc4'
                                                                            : undefined
                                                                }}
                                                            />
                                                        ) : (
                                                            <StarBorder // Or another icon for not included?
                                                                fontSize="small"
                                                                color="disabled"
                                                                sx={{
                                                                    mr: 1,
                                                                    // Make it visible but indicate not included
                                                                    color: plan.type === "premium" || plan.type === "student"
                                                                        ? 'rgba(255,255,255,0.5)'
                                                                        : 'rgba(0,0,0,0.3)' // Use a different color for light background
                                                                }}
                                                            />
                                                        )}
                                                        <Typography
                                                            variant="body2"
                                                            color={
                                                                (plan.type === "premium" || plan.type === "student")
                                                                    ? feature.included ? 'white' : 'rgba(255,255,255,0.7)'
                                                                    : feature.included ? 'text.primary' : 'text.secondary'
                                                            }
                                                        >
                                                            {feature.name}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>

                                            <Button
                                                variant={plan.popular ? "contained" : "outlined"}
                                                color={
                                                    plan.type === "premium"
                                                        ? "secondary" // Secondary for Premium to stand out on dark bg
                                                        : plan.type === "student"
                                                            ? "secondary" // Secondary for Student
                                                            : "primary"
                                                }
                                                fullWidth
                                                sx={{
                                                    mt: 3,
                                                    backgroundColor: plan.type === "premium"
                                                        ? '#8c9eff'
                                                        : plan.type === "student"
                                                            ? '#80cbc4'
                                                            : plan.popular ? undefined : 'white', // Let primary contained handle default popular color
                                                    color: plan.type === "premium" || plan.type === "student"
                                                        ? 'white' // Ensure white text on dark custom backgrounds
                                                        : undefined,
                                                    borderColor: plan.type === "premium"
                                                        ? '#8c9eff'
                                                        : plan.type === "student"
                                                            ? '#80cbc4'
                                                            : undefined,
                                                    '&:hover': {
                                                        backgroundColor: plan.type === "premium"
                                                            ? '#536dfe'
                                                            : plan.type === "student"
                                                                ? '#4db6ac'
                                                                : undefined
                                                    },
                                                    fontWeight: plan.popular ? 'bold' : 'normal',
                                                    fontSize: plan.popular ? '1rem' : '0.875rem',
                                                    padding: plan.popular ? '10px 0' : '8px 0'
                                                }}
                                                disabled={
                                                    plan.type === getCurrentSubscriptionType()
                                                }
                                                onClick={() => handleOpenUpgradeModal(plan)}
                                            >
                                                {plan.type === getCurrentSubscriptionType()
                                                    ? 'Mevcut Plan'
                                                    : 'Bu Planı Seç'
                                                }
                                            </Button>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            <Box sx={{mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1}}>
                                <Typography variant="body2" align="center">
                                    Özel fiyatlandırma ve kurumsal planlar için bizimle iletişime geçin.
                                </Typography>
                                <Box sx={{display: 'flex', justifyContent: 'center', mt: 1}}>
                                    <Button
                                        variant="text"
                                        color="primary"
                                        component="a"
                                        href="mailto:destek@diyetia.com"
                                    >
                                        Bizimle İletişime Geçin
                                    </Button>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Ödeme Yöntemi Değiştirme/Ekleme Modal */}
                <Modal
                    open={openChangeModal}
                    onClose={handleCloseChangeModal}
                    aria-labelledby="payment-method-modal"
                >
                    <Box className="payment-modal">
                        <Typography id="payment-method-modal" variant="h6" component="h2" gutterBottom>
                            Ödeme Yöntemi {paymentMethods.length > 0 ? 'Değiştir' : 'Ekle'}
                        </Typography>
                        <Divider sx={{mb: 3}} />

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Kart Numarası"
                                    name="cardNumber"
                                    value={newCardInfo.cardNumber}
                                    onChange={handleCardInputChange}
                                    placeholder="1234 5678 9012 3456"
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CreditCard />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Kart Sahibi"
                                    name="cardHolder"
                                    value={newCardInfo.cardHolder}
                                    onChange={handleCardInputChange}
                                    placeholder="Ad Soyad"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Son Kullanma Tarihi"
                                    name="expiryDate"
                                    value={newCardInfo.expiryDate}
                                    onChange={handleCardInputChange}
                                    placeholder="AA/YY"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="CVV/CVC"
                                    name="cvv"
                                    value={newCardInfo.cvv}
                                    onChange={handleCardInputChange}
                                    placeholder="123"
                                    variant="outlined"
                                    type="password"
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 2
                        }}>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <AccountBalance color="primary" sx={{mr: 1}} />
                                <Typography variant="caption">
                                    Bilgileriniz güvenli şekilde saklanır
                                </Typography>
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                gap: 1
                            }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCloseChangeModal}
                                >
                                    İptal
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        handleSaveSettings(); // Indicate saving payment method
                                        handleCloseChangeModal();
                                    }}
                                >
                                    Kaydet
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Modal>

                {/* Plan Değiştirme Modal */}
                <Modal
                    open={openUpgradeModal}
                    onClose={handleCloseUpgradeModal}
                    aria-labelledby="upgrade-plan-modal"
                >
                    <Box className="payment-modal upgrade-modal">
                        <Typography id="upgrade-plan-modal" variant="h6" component="h2" gutterBottom>
                            Plan Değiştirme
                        </Typography>
                        <Divider sx={{mb: 3}} />

                        {selectedPlan && (
                            <>
                                <Box sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    mb: 3,
                                    background: selectedPlan.type === "premium"
                                        ? 'linear-gradient(135deg, #1a237e 0%, #303f9f 100%)'
                                        : selectedPlan.type === "student"
                                            ? 'linear-gradient(135deg, #004d40 0%, #00796b 100%)'
                                            : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                                    color: selectedPlan.type === "premium" || selectedPlan.type === "student" ? 'white' : 'inherit',
                                }}>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                                        {selectedPlan.name} Planı
                                    </Typography>

                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2
                                    }}>
                                        <Typography variant="h4" fontWeight="bold">
                                            ₺{selectedPlan.price}
                                        </Typography>
                                        <Typography variant="body1" sx={{ml: 1}}>
                                            /ay
                                        </Typography>

                                        {selectedPlan.originalPrice && (
                                            <>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        ml: 2,
                                                        textDecoration: 'line-through',
                                                        color: selectedPlan.type === "student" ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                                                    }}
                                                >
                                                    ₺{selectedPlan.originalPrice}
                                                </Typography>
                                                <Chip
                                                    label={selectedPlan.discount}
                                                    color="error"
                                                    size="small"
                                                    sx={{ml: 1}}
                                                />
                                            </>
                                        )}
                                    </Box>

                                    <Typography variant="body2" sx={{mb: 2, opacity: 0.9}}>
                                        Bu plana dahil olan özellikler:
                                    </Typography>

                                    <Box sx={{mb: 2}}>
                                        {selectedPlan.features.map((feature, featureIndex) => (
                                            <Box
                                                key={featureIndex}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mb: 1
                                                }}
                                            >
                                                {feature.included ? (
                                                    <CheckCircle
                                                        fontSize="small"
                                                        sx={{
                                                            mr: 1,
                                                            color: selectedPlan.type === "premium"
                                                                ? '#8c9eff'
                                                                : selectedPlan.type === "student"
                                                                    ? '#80cbc4'
                                                                    : '#2196F3' // Primary color for light backgrounds
                                                        }}
                                                    />
                                                ) : (
                                                    <StarBorder // Or another icon for not included?
                                                        fontSize="small"
                                                        sx={{
                                                            mr: 1,
                                                            // Make it visible but indicate not included
                                                            color: selectedPlan.type === "premium" || selectedPlan.type === "student"
                                                                ? 'rgba(255,255,255,0.5)'
                                                                : 'rgba(0,0,0,0.3)' // Use a different color for light background
                                                        }}
                                                    />
                                                )}
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: (selectedPlan.type === "premium" || selectedPlan.type === "student")
                                                            ? feature.included ? 'white' : 'rgba(255,255,255,0.7)'
                                                            : feature.included ? 'text.primary' : 'text.secondary'
                                                    }}
                                                >
                                                    {feature.name}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>

                                <Stepper activeStep={1} alternativeLabel sx={{mb: 4}}>
                                    <Step>
                                        <StepLabel>Plan Seçimi</StepLabel>
                                    </Step>
                                    <Step>
                                        <StepLabel>Onay</StepLabel>
                                    </Step>
                                    <Step>
                                        <StepLabel>Tamamlandı</StepLabel>
                                    </Step>
                                </Stepper>

                                {/* Summary section */}
                                {!loading && ( // Only show if not loading
                                    <Box sx={{p: 2, bgcolor: '#e3f2fd', borderRadius: 1, mb: 3, border: '1px dashed #1976d2'}}> {/* Added border */}
                                        <Typography variant="body2" paragraph fontWeight="bold" color="primary">
                                            Plan Değişikliği Özeti:
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Mevcut Plan:</Typography>
                                                <Typography variant="body2" fontWeight="bold">{subscriptionInfo.currentPlan}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Yeni Plan:</Typography>
                                                <Typography variant="body2" fontWeight="bold">{selectedPlan.name} Diyetisyen Paketi</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Mevcut Fiyat:</Typography>
                                                <Typography variant="body2">₺{subscriptionInfo.price}/ay</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Yeni Fiyat:</Typography>
                                                <Typography variant="body2" fontWeight="bold">₺{selectedPlan.price}/ay</Typography>
                                            </Grid>
                                            {/* Conditionally show change date if applicable (e.g., upgrading from paid to paid) */}
                                            {!isFreePlan && (
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" color="text.secondary">Değişiklik Tarihi:</Typography>
                                                    <Typography variant="body2" fontWeight="bold">{subscriptionInfo.nextPaymentDate} (Sonraki fatura döneminde)</Typography>
                                                </Grid>
                                            )}
                                            {/* Add info about immediate change if upgrading from FREE */}
                                            {isFreePlan && (
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" color="text.secondary">Değişiklik Tarihi:</Typography>
                                                    <Typography variant="body2" fontWeight="bold">Hemen geçerli olacaktır.</Typography> {/* Or specify trial end / immediate payment */}
                                                    <Typography variant="caption" color="text.secondary">
                                                        Bu planı seçtiğinizde ödeme alınacaktır ve premium özelliklere anında erişim sağlayacaksınız.
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                )}

                                {/* === START: STUDENT PLAN INSTRUCTION === */}
                                {selectedPlan?.type === 'student' && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: '#e8f5e9', // Light green background for info
                                            borderRadius: 1,
                                            mb: 3, // Spacing before buttons
                                            border: '1px dashed #4caf50', // Green dashed border
                                        }}
                                    >
                                        <Typography variant="body2" paragraph fontWeight="bold" color="success">
                                            Önemli Not: Öğrenci Planı Kaydı
                                        </Typography>
                                        <Typography variant="body2">
                                            Öğrenci indiriminden faydalanabilmek için, lütfen güncel öğrenci belgenizin bir kopyasını, Diyetia'ya kayıtlı telefon numaranızı ve e-posta adresinizi
                                            {' '}
                                            <a href="mailto:destek@diyetia.com" style={{ color: '#1b5e20', fontWeight: 'bold' }}>
                                                destek@diyetia.com
                                            </a>
                                            {' '}
                                            adresine gönderin. Belgeniz incelendikten sonra kaydınız onaylanacaktır.
                                        </Typography>
                                    </Box>
                                )}
                                {/* === END: STUDENT PLAN INSTRUCTION === */}


                            </>
                        )}

                        {/* Action buttons */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 1
                        }}>
                            <Button
                                variant="outlined"
                                onClick={handleCloseUpgradeModal}
                            >
                                Vazgeç
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    // In a real app: Send request to change plan
                                    console.log("Confirming plan change to:", selectedPlan?.name);
                                    handleSaveSettings(); // Indicate change process started/completed
                                    handleCloseUpgradeModal();
                                    // Potentially update subscriptionInfo after successful API call
                                }}
                                // Disable button if no plan is selected (shouldn't happen based on flow, but good practice)
                                disabled={!selectedPlan}
                            >
                                Planı Onayla
                            </Button>
                        </Box>
                    </Box>
                </Modal>

                {/* Fatura Adresi Düzenleme Modal */}
                <Modal
                    open={openBillingAddressModal}
                    onClose={handleCloseBillingAddressModal}
                    aria-labelledby="billing-address-modal"
                >
                    <Box className="payment-modal">
                        <Typography id="billing-address-modal" variant="h6" component="h2" gutterBottom>
                            Fatura Bilgilerini Düzenle
                        </Typography>
                        <Divider sx={{mb: 3}} />

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Ad Soyad / Firma Adı"
                                    name="name"
                                    value={editedBillingAddress.name}
                                    onChange={handleBillingAddressChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Kurum / Şirket (İsteğe Bağlı)"
                                    name="company"
                                    value={editedBillingAddress.company}
                                    onChange={handleBillingAddressChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Adres"
                                    name="address"
                                    value={editedBillingAddress.address}
                                    onChange={handleBillingAddressChange}
                                    variant="outlined"
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Şehir"
                                    name="city"
                                    value={editedBillingAddress.city}
                                    onChange={handleBillingAddressChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="İlçe/Eyalet"
                                    name="state"
                                    value={editedBillingAddress.state}
                                    onChange={handleBillingAddressChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Posta Kodu"
                                    name="zipCode"
                                    value={editedBillingAddress.zipCode}
                                    onChange={handleBillingAddressChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Ülke"
                                    name="country"
                                    value={editedBillingAddress.country}
                                    onChange={handleBillingAddressChange}
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 1,
                            mt: 3
                        }}>
                            <Button
                                variant="outlined"
                                onClick={handleCloseBillingAddressModal}
                            >
                                İptal
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSaveBillingAddress}
                            >
                                Kaydet
                            </Button>
                        </Box>
                    </Box>
                </Modal>

                {/* Abonelik İptal Etme Modal */}
                <Modal
                    open={openCancelModal}
                    onClose={handleCloseCancelModal}
                    aria-labelledby="cancel-subscription-modal"
                >
                    <Box className="payment-modal">
                        <Typography id="cancel-subscription-modal" variant="h6" component="h2" gutterBottom>
                            Aboneliği İptal Et
                        </Typography>
                        <Divider sx={{mb: 3}} />

                        <Box sx={{mb: 3}}>
                            <Alert severity="warning" sx={{mb: 3}}>
                                <AlertTitle>Dikkat</AlertTitle>
                                Aboneliğinizi iptal etmek üzeresiniz. Bu işlem geri alınamaz.
                            </Alert>

                            <Typography variant="body1" paragraph>
                                <strong>{subscriptionInfo.currentPlan}</strong> aboneliğinizi iptal etmek istediğinize emin misiniz?
                            </Typography>

                            <Typography variant="body2" color="text.secondary" paragraph>
                                İptal işlemi onaylandığında:
                            </Typography>

                            <Box component="ul" sx={{pl: 2, mb: 2}}>
                                <Typography component="li" variant="body2" color="text.secondary">
                                    Aboneliğiniz <strong>{subscriptionInfo.nextPaymentDate}</strong> tarihine kadar aktif kalacaktır.
                                </Typography>
                                <Typography component="li" variant="body2" color="text.secondary">
                                    Bu tarihten sonra yenileme yapılmayacak ve hesabınız ücretsiz plana geçecektir.
                                </Typography>
                                <Typography component="li" variant="body2" color="text.secondary">
                                    Ücretsiz planda danışan sayınız 5 ile sınırlı olacaktır.
                                </Typography>
                                {/* Add plan-specific cancellation consequences if needed */}
                                {getCurrentSubscriptionType() === 'student' && (
                                    <Typography component="li" variant="body2" color="text.secondary">
                                        Öğrenci indirimi sonlanacaktır.
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{
                                p: 2,
                                bgcolor: '#fff3e0', // Light orange background
                                borderRadius: 1,
                                mb: 3,
                                border: '1px dashed #ff9800' // Orange dashed border
                            }}>
                                <Typography variant="body2">
                                    İptal etmek yerine planınızı değiştirmek isterseniz, <strong>"{planTabLabel}"</strong> sekmesine giderek farklı bir plan seçebilirsiniz.
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 1
                        }}>
                            <Button
                                variant="outlined"
                                onClick={handleCloseCancelModal}
                                sx={{flex: 1}}
                            >
                                Vazgeç
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleCancelSubscription}
                                sx={{flex: 1}}
                            >
                                Aboneliği İptal Et
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </Box>
        </Default>
    );
}