import React, {useEffect, useState} from "react";
import Default from "../../Components/Layouts/Default.jsx";
import "./Odeme.css";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    FormControlLabel,
    FormHelperText,
    Grid,
    InputAdornment,
    Modal,
    Paper,
    Step,
    StepLabel,
    Stepper,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography,
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
import Diamond from "@mui/icons-material/Diamond";
import Cancel from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";

import axios from "axios";
import config from "../../config.js";

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

    const [subscriptionInfo, setSubscriptionInfo] = useState({
        currentPlan: "Yükleniyor...",
        price: 0,
        billingCycle: "N/A",
        nextPaymentDate: "N/A",
        autoRenew: true,
        features: []
    });

    const [paymentMethods] = useState([
        {
            id: 1,
            type: "VISA",
            lastFour: "****",
            expiryDate: "06/24",
            isDefault: true,
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
        }
    ]);

    const [invoiceHistory] = useState([
        {date: '01 Ocak 2025', amount: '₺1000', status: 'Ödendi', invoice: 'INV-20230315'},
    ]);

    const [plans] = useState([
        {
            name: "Başlangıç",
            type: "starter",
            price: 500,
            features: [
                {name: "25 danışan", included: true},
                {name: "Gelişmiş raporlar", included: true},
                {name: "E-posta desteği", included: true},
                {name: "Çevrimiçi randevu", included: true},
                {name: "Özelleştirilmiş diyet planları", included: true},
                {name: "SMS gönderme", included: false}
            ]
        },
        {
            name: "Premium",
            type: "premium",
            price: 1000,
            popular: true,
            features: [
                {name: "Sınırsız danışan", included: true},
                {name: "Gelişmiş raporlar", included: true},
                {name: "7/24 öncelikli destek", included: true},
                {name: "Çevrimiçi randevu", included: true},
                {name: "Özelleştirilmiş diyet planları", included: true},
                {name: "SMS gönderme", included: true}
            ]
        }
    ]);

    const [billingAddress, setBillingAddress] = useState({
        name: "Belirtilmedi",
        company: "Belirtilmedi",
        address: "Belirtilmedi",
        city: "Belirtilmedi",
        state: "Belirtilmedi",
        zipCode: "Belirtilmedi",
        country: "Türkiye"
    });

    const [editedBillingAddress, setEditedBillingAddress] = useState({...billingAddress});

    useEffect(() => {
        const fetchDietitianInfo = async () => {
                setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${config[config.environment].apiUrl}/dietitian/getDietitianInfo`,
                    {
                    headers: {
                        Authorization: token,
                        'Content-Type': 'application/json',
                    },
                    }
                );

                const { data } = response;
                setDietitianInfo(data);

                const defaultSubscription = {
                        currentPlan: "Aktif paketiniz bulunmamaktadır.",
                        price: 0,
                        billingCycle: "N/A",
                        nextPaymentDate: "N/A",
                        autoRenew: false,
                        features: []
                };

                if (data?.subscription_type) {
                    const subscriptionType = data.subscription_type;
                    const isPaidPlan = subscriptionType !== "free";
                    const planInfo = {
                        starter: {
                            name: "Başlangıç Diyetisyen Paketi",
                            price: 500
                        },
                        student: {
                            name: "Öğrenci Diyetisyen Paketi",
                            price: 500
                        },
                        premium: {
                            name: "Premium Diyetisyen Paketi",
                            price: 1000
                        },
                        free: defaultSubscription
                    };

                    const plan = planInfo[subscriptionType] || defaultSubscription;

                    const planFeatures = isPaidPlan
                        ? plans.find(p => p.type === subscriptionType)?.features
                              .filter(f => f.included)
                              .map(f => f.name) || []
                        : ["Diyetia'yı kullanmak için, paket satın almanız gerekmektedir."];

                    setSubscriptionInfo({
                        currentPlan: plan.name || defaultSubscription.currentPlan,
                        price: plan.price || 0,
                        features: planFeatures,
                        billingCycle: isPaidPlan ? "Aylık" : "N/A",
                        nextPaymentDate: isPaidPlan ? " - " : "N/A",
                        autoRenew: isPaidPlan
                    });
                } else {
                    setSubscriptionInfo({
                        ...defaultSubscription,
                        features: ["Diyetia'yı kullanmak için, paket satın almanız gerekmektedir."]
                    });
                }
            } catch (error) {
                console.error("Error fetching dietitian info:", error);
                setSubscriptionInfo({
                    currentPlan: "Aktif paketiniz bulunmamaktadır.",
                    price: 0,
                    billingCycle: "N/A",
                    nextPaymentDate: "N/A",
                    autoRenew: false,
                    features: ["Diyetia'yı kullanmak için, paket satın almanız gerekmektedir."]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDietitianInfo();
    }, [plans]);

    const getCurrentSubscriptionType = () => {
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
        setSelectedPlan(null);
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
        console.log("Auto renew changed", isChecked);
        setSubscriptionInfo(prev => ({...prev, autoRenew: isChecked}));
        handleSaveSettings();
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
        console.log("Saving billing address:", editedBillingAddress);
        setBillingAddress({...editedBillingAddress});
        handleSaveSettings();
        handleCloseBillingAddressModal();
    };

    const handleOpenCancelModal = () => {
        if (getCurrentSubscriptionType() !== "free") {
            setOpenCancelModal(true);
        }
    };

    const handleCloseCancelModal = () => {
        setOpenCancelModal(false);
    };

    const handleCancelSubscription = () => {
        console.log("Cancelling subscription...");
        handleSaveSettings();
        handleCloseCancelModal();
    };

    const isFreePlan = getCurrentSubscriptionType() === "free";
    const planTabLabel = isFreePlan ? "Plan Seçin" : "Plan Karşılaştırma";
    const invoiceTabDisabled = isFreePlan;

    return (
        <Default>
            <Box className="odeme-container">
                <Typography variant="h4" component="h1" className="odeme-title">
                    Abonelik ve Ödemeler
                </Typography>

                {saveSuccess && (
                    <Alert
                        severity="success"
                        sx={{mb: 2}}
                        className="success-alert"
                        icon={<CheckCircle fontSize="inherit" />}
                        action={
                            <Button color="inherit" size="small" onClick={() => setSaveSuccess(false)}>
                                KAPAT
                            </Button>
                        }
                    >
                        <AlertTitle>İşlem Başarılı</AlertTitle>
                        Değişiklikleriniz başarıyla kaydedildi!
                    </Alert>
                )}

                <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        aria-label="payment tabs"
                        variant="fullWidth"
                        className="payment-tabs"
                    >
                        <Tab icon={<CreditCard/>} iconPosition="start" label="Abonelik Detayları"/>
                        <Tab
                            icon={<ReceiptLong/>}
                            iconPosition="start"
                            label="Faturalar ve Ödeme Geçmişi"
                            disabled={invoiceTabDisabled}
                            sx={invoiceTabDisabled ? {opacity: 0.5} : {}}
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
                                        <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                                            <CircularProgress/>
                                        </Box>
                                    ) : isFreePlan ? (
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
                                                            Aktif Paketiniz Bulunmamaktadır
                                                        </Typography>
                                                        <Box sx={{
                                                            p: 2.5,
                                                            mb: 3,
                                                            borderRadius: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            background: 'linear-gradient(to right, rgba(255,255,255,0.15), rgba(255,255,255,0.25))',
                                                            borderLeft: '4px solid #ffeb3b',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                        }}>
                                                            <WarningIcon sx={{
                                                                color: '#ffeb3b',
                                                                fontSize: 24,
                                                                mr: 1.5,
                                                                filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))'
                                                            }} />
                                                            <Typography
                                                                variant="subtitle1"
                                                                fontWeight="medium"
                                                                sx={{
                                                                    color: 'white',
                                                                    letterSpacing: '0.2px',
                                                                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                                }}
                                                            >
                                                                Diyetia'yı kullanmak için, paket satın almanız gerekmektedir.
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
                                                            <CurrencyLira sx={{fontSize: 40}}/>
                                                            <Typography variant="h2" fontWeight="bold">
                                                                0
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{mt: 3, textAlign: {xs: 'left', md: 'right'}}}>
                                                            <Typography variant="body2" sx={{mb: 1}}>
                                                                Hemen premium özelliklere erişin!
                                                            </Typography>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                sx={{mt: 2}}
                                                                onClick={() => handleTabChange(null, 2)}
                                                                startIcon={<Compare/>}
                                                            >
                                                                Premium Planları Keşfedin
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ) : (
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
                                                                    icon={<Check sx={{color: 'white !important'}}/>}
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
                                                                Abonelik Başlangıç: <b> - </b>
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
                                                            <CurrencyLira sx={{fontSize: 40}}/>
                                                            <Typography variant="h2" fontWeight="bold">
                                                                {subscriptionInfo.price}
                                                                <Typography component="span" variant="h6"
                                                                            sx={{opacity: 0.8, ml: 1}}>
                                                                    /{subscriptionInfo.billingCycle.toLowerCase()}
                                                                </Typography>
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{mt: 3, textAlign: {xs: 'left', md: 'right'}}}>
                                                            <Typography variant="body2" sx={{mb: 1}}>
                                                                Sonraki ödeme
                                                                tarihi: <b>{subscriptionInfo.nextPaymentDate}</b>
                                                            </Typography>
                                                            <Typography variant="body2" sx={{mb: 1}}>
                                                                Kalan gün: <b> - </b>
                                                            </Typography>
                                                            <Button
                                                                variant="outlined"
                                                                color="inherit"
                                                                sx={{
                                                                    mt: 2,
                                                                    color: 'white',
                                                                    borderColor: 'white',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                                                    }
                                                                }}
                                                                onClick={() => handleTabChange(null, 2)}
                                                                startIcon={<Compare/>}
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
                                                    startIcon={<Cancel/>}
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
                                        <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
                                            <CircularProgress size={24}/>
                                        </Box>
                                    ) : isFreePlan ? (
                                        <Box>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'column',
                                                p: 3
                                            }}>
                                                <Typography variant="body1" align="center" paragraph>
                                                    Şu anda ücretsiz paketi kullanıyorsunuz.
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" align="center"
                                                            paragraph>
                                                    Daha fazla özelliğe erişmek için premium paketlerimizden birini
                                                    seçin.
                                                </Typography>
                                                {/* Button to go to Plan Comparison tab */}
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleTabChange(null, 2)}
                                                    sx={{mt: 2}}
                                                    startIcon={<Compare/>}
                                                >
                                                    Paket Seç
                                                </Button>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <>
                                            <Box sx={{mb: 3}}>
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                    <Typography variant="body2" fontWeight="500">Mevcut
                                                        Plan</Typography>
                                                    <Typography
                                                        variant="body2">{subscriptionInfo.currentPlan}</Typography>
                                                </Box>
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                    <Typography variant="body2" fontWeight="500">Fatura
                                                        Dönemi</Typography>
                                                    <Typography
                                                        variant="body2">{subscriptionInfo.billingCycle}</Typography>
                                                </Box>
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                    <Typography variant="body2" fontWeight="500">Sonraki
                                                        Ödeme</Typography>
                                                    <Typography
                                                        variant="body2">{subscriptionInfo.nextPaymentDate}</Typography>
                                                </Box>
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                                    <Typography variant="body2" fontWeight="500">Ödeme
                                                        Yöntemi</Typography>
                                                    <Typography
                                                        variant="body2">{paymentMethods.length > 0 ? `**** ${paymentMethods[0].lastFour}` : 'Belirtilmemiş'}</Typography>
                                                </Box>
                                            </Box>

                                            <Divider sx={{my: 2}}/>

                                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                                <Typography variant="body1" fontWeight="500">Aylık Ücret</Typography>
                                                <Typography variant="body1"
                                                            fontWeight="500">{subscriptionInfo.price}₺</Typography>
                                            </Box>

                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mt: 2,
                                                backgroundColor: '#f5f5f5',
                                                p: 2,
                                                borderRadius: 1
                                            }}>
                                                <Typography variant="subtitle1" fontWeight="bold">Toplam</Typography>
                                                <Typography variant="subtitle1"
                                                            fontWeight="bold">{subscriptionInfo.price}₺</Typography>
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
                                                Tüm fiyatlara KDV dahildir. Faturanız her ayın 15'inde otomatik olarak
                                                oluşturulacaktır.
                                            </Typography>

                                            {invoiceHistory.length > 0 && (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    fullWidth
                                                    sx={{mt: 3}}
                                                    startIcon={<Download/>}
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
                    <Card variant="outlined" className="payment-card">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Geçmiş İşlemler ve Faturalar
                            </Typography>
                            <Divider sx={{mb: 3}}/>

                            {loading ? (
                                <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                                    <CircularProgress/>
                                </Box>
                            ) : isFreePlan || invoiceHistory.length === 0 ? (
                                <Box sx={{textAlign: 'center', py: 4}}>
                                    <ReceiptLong sx={{fontSize: 60, color: '#bdbdbd', mb: 2}}/>
                                    <Typography variant="h6" gutterBottom>
                                        Fatura Geçmişi Bulunamadı
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" paragraph>
                                        {isFreePlan ?
                                            "Ücretsiz paketi kullandığınız için henüz fatura oluşturulmamıştır."
                                            : "Henüz bir fatura kaydı bulunmamaktadır."
                                        }
                                    </Typography>
                                    {isFreePlan && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleTabChange(null, 2)}
                                            sx={{mt: 2}}
                                            startIcon={<Compare/>}
                                        >
                                            Premium Paketleri İncele
                                        </Button>
                                    )}
                                </Box>
                            ) : (
                                <Grid container spacing={3}>
                                    <Grid item xs={12} lg={8}>
                                        <Paper variant="outlined" sx={{
                                            mb: 3,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                        }}>
                                            <Box sx={{width: '100%', overflowX: 'auto'}}>
                                                <Box sx={{minWidth: 650}}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        bgcolor: '#f5f5f5',
                                                        p: 2,
                                                        fontWeight: 'bold',
                                                        borderBottom: '2px solid #e0e0e0'
                                                    }}>
                                                        <Box sx={{ width: '25%' }}>
                                                            <Typography variant="subtitle2">Tarih</Typography>
                                                        </Box>
                                                        <Box sx={{ width: '25%' }}>
                                                            <Typography variant="subtitle2">Tutar</Typography>
                                                        </Box>
                                                        <Box sx={{ width: '25%' }}>
                                                            <Typography variant="subtitle2">Durum</Typography>
                                                        </Box>
                                                        <Box sx={{ width: '25%' }}>
                                                            <Typography variant="subtitle2">İşlemler</Typography>
                                                        </Box>
                                                    </Box>

                                                    {invoiceHistory.map((invoice, index) => (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                display: 'flex',
                                                                p: 2,
                                                                borderBottom: '1px solid #f0f0f0',
                                                                '&:hover': {
                                                                    backgroundColor: '#f9f9f9',
                                                                    transform: 'translateY(-2px)',
                                                                    transition: 'all 0.2s ease'
                                                                },
                                                                '&:last-child': {
                                                                    borderBottom: 'none'
                                                                }
                                                            }}
                                                            className="invoice-item"
                                                        >
                                                            <Box sx={{ width: '25%', display: 'flex', alignItems: 'center' }}>
                                                                <Typography variant="body2">{invoice.date}</Typography>
                                                            </Box>
                                                            <Box sx={{ width: '25%', display: 'flex', alignItems: 'center' }}>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontWeight: 'medium',
                                                                        color: '#1976d2'
                                                                    }}
                                                                >
                                                                    {invoice.amount}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ width: '25%', display: 'flex', alignItems: 'center' }}>
                                                                <Chip
                                                                    label={invoice.status}
                                                                    size="small"
                                                                    color="success"
                                                                    sx={{
                                                                        height: 24,
                                                                        borderRadius: '6px',
                                                                        fontWeight: 500
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Box sx={{ width: '25%', display: 'flex', alignItems: 'center' }}>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    startIcon={<Download fontSize="small"/>}
                                                                    sx={{
                                                                        fontSize: '0.75rem',
                                                                        borderRadius: '8px',
                                                                        textTransform: 'none'
                                                                    }}
                                                                >
                                                                    Fatura İndir
                                                                </Button>
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} lg={4}>
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                height: '100%',
                                                borderRadius: 2,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                                                    transform: 'translateY(-4px)'
                                                }
                                            }}
                                            className="payment-card"
                                        >
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Fatura Özeti
                                                </Typography>
                                                <Divider sx={{mb: 3}}/>

                                                <Box sx={{mb: 3}}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        mb: 2,
                                                        p: 1.5,
                                                        borderRadius: 1,
                                                        bgcolor: 'rgba(0,0,0,0.02)'
                                                    }}>
                                                        <Typography variant="body2" color="text.secondary">Toplam Fatura</Typography>
                                                        <Typography variant="body1" fontWeight="500">{invoiceHistory.length}</Typography>
                                                    </Box>

                                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2, p: 1.5}}>
                                                        <Typography variant="body2" color="text.secondary">Toplam Ödenen</Typography>
                                                        <Typography variant="body1" fontWeight="500" color="primary">
                                                            ₺{invoiceHistory.reduce((sum, item) => sum + parseFloat(item.amount.replace('₺', '')), 0)}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        mb: 2,
                                                        p: 1.5,
                                                        borderRadius: 1,
                                                        bgcolor: 'rgba(0,0,0,0.02)'
                                                    }}>
                                                        <Typography variant="body2" color="text.secondary">Son Ödeme</Typography>
                                                        <Typography variant="body1" fontWeight="500">{invoiceHistory[0]?.date || 'N/A'}</Typography>
                                                    </Box>

                                                    <Box sx={{
                                                        mt: 3,
                                                        p: 2,
                                                        bgcolor: '#e3f2fd',
                                                        borderRadius: 2,
                                                        border: '1px dashed #1976d2'
                                                    }}>
                                                        <Typography variant="body2" color="primary" fontWeight="medium">
                                                            Faturalarınızı buradan indirebilir ve muhasebe işlemleriniz için kullanabilirsiniz.
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {invoiceHistory.length > 0 && (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        fullWidth
                                                        size="large"
                                                        startIcon={<Download/>}
                                                        sx={{
                                                            mt: 2,
                                                            py: 1.5,
                                                            borderRadius: 2,
                                                            boxShadow: '0 4px 12px rgba(25,118,210,0.2)',
                                                            '&:hover': {
                                                                boxShadow: '0 6px 16px rgba(25,118,210,0.3)'
                                                            }
                                                        }}
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
                        <Divider sx={{mb: 3}}/>

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
                                                <CreditCard/>
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
                                <AccountBalance color="primary" sx={{mr: 1}}/>
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
                                        handleSaveSettings();
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
                        <Divider sx={{mb: 3}}/>

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
                                                                    : '#2196F3'
                                                        }}
                                                    />
                                                ) : (
                                                    <StarBorder
                                                        fontSize="small"
                                                        sx={{
                                                            mr: 1,
                                                            color: selectedPlan.type === "premium" || selectedPlan.type === "student"
                                                                ? 'rgba(255,255,255,0.5)'
                                                                : 'rgba(0,0,0,0.3)'
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
                                {!loading && (
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: '#e3f2fd',
                                        borderRadius: 1,
                                        mb: 3,
                                        border: '1px dashed #1976d2'
                                    }}> {/* Added border */}
                                        <Typography variant="body2" paragraph fontWeight="bold" color="primary">
                                            Plan Değişikliği Özeti:
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Mevcut
                                                    Plan:</Typography>
                                                <Typography variant="body2"
                                                            fontWeight="bold">{subscriptionInfo.currentPlan}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Yeni
                                                    Plan:</Typography>
                                                <Typography variant="body2"
                                                            fontWeight="bold">{selectedPlan.name} Diyetisyen
                                                    Paketi</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Mevcut
                                                    Fiyat:</Typography>
                                                <Typography variant="body2">₺{subscriptionInfo.price}/ay</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Yeni
                                                    Fiyat:</Typography>
                                                <Typography variant="body2"
                                                            fontWeight="bold">₺{selectedPlan.price}/ay</Typography>
                                            </Grid>
                                            {/* Conditionally show change date if applicable (e.g., upgrading from paid to paid) */}
                                            {!isFreePlan && (
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" color="text.secondary">Değişiklik
                                                        Tarihi:</Typography>
                                                    <Typography variant="body2"
                                                                fontWeight="bold">{subscriptionInfo.nextPaymentDate} (Sonraki
                                                        fatura döneminde)</Typography>
                                                </Grid>
                                            )}
                                            {/* Add info about immediate change if upgrading from FREE */}
                                            {isFreePlan && (
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" color="text.secondary">Değişiklik
                                                        Tarihi:</Typography>
                                                    <Typography variant="body2" fontWeight="bold">Hemen geçerli
                                                        olacaktır.</Typography> {/* Or specify trial end / immediate payment */}
                                                    <Typography variant="caption" color="text.secondary">
                                                        Bu planı seçtiğinizde ödeme alınacaktır ve premium özelliklere
                                                        anında erişim sağlayacaksınız.
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                )}

                                {selectedPlan?.type === 'student' && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: '#e8f5e9',
                                            borderRadius: 1,
                                            mb: 3,
                                            border: '1px dashed #4caf50',
                                        }}
                                    >
                                        <Typography variant="body2" paragraph fontWeight="bold" color="success">
                                            Önemli Not: Öğrenci Planı Kaydı
                                        </Typography>
                                        <Typography variant="body2">
                                            Öğrenci indiriminden faydalanabilmek için, lütfen güncel öğrenci belgenizin
                                            bir kopyasını, Diyetia'ya kayıtlı telefon numaranızı ve e-posta adresinizi
                                            {' '}
                                            <a href="mailto:destek@diyetia.com"
                                               style={{color: '#1b5e20', fontWeight: 'bold'}}>
                                                destek@diyetia.com
                                            </a>
                                            {' '}
                                            adresine gönderin. Belgeniz incelendikten sonra kaydınız onaylanacaktır.
                                        </Typography>
                                    </Box>
                                )}
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
                                    console.log("Confirming plan change to:", selectedPlan?.name);
                                    handleSaveSettings();
                                    handleCloseUpgradeModal();
                                }}
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
                        <Typography id="billing-address-modal" variant="h6" component="h2" gutterBottom
                            sx={{
                                position: 'relative',
                                '&:after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: '-8px',
                                    left: 0,
                                    width: '40px',
                                    height: '3px',
                                    backgroundColor: '#1976d2',
                                    borderRadius: '2px'
                                }
                            }}
                        >
                            Fatura Bilgilerini Düzenle
                        </Typography>
                        <Divider sx={{mb: 3, mt: 2}}/>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Ad Soyad / Firma Adı"
                                    name="name"
                                    value={editedBillingAddress.name}
                                    onChange={handleBillingAddressChange}
                                    variant="outlined"
                                    autoComplete="name"
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
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
                                    autoComplete="organization"
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
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
                                    autoComplete="street-address"
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Şehir"
                                    name="city"
                                    value={editedBillingAddress.city}
                                    onChange={handleBillingAddressChange}
                                    variant="outlined"
                                    autoComplete="address-level2"
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="İlçe/Eyalet"
                                    name="state"
                                    value={editedBillingAddress.state}
                                    onChange={handleBillingAddressChange}
                                    variant="outlined"
                                    autoComplete="address-level1"
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Posta Kodu"
                                    name="zipCode"
                                    value={editedBillingAddress.zipCode}
                                    onChange={handleBillingAddressChange}
                                    variant="outlined"
                                    autoComplete="postal-code"
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Ülke"
                                    name="country"
                                    value={editedBillingAddress.country}
                                    onChange={handleBillingAddressChange}
                                    variant="outlined"
                                    autoComplete="country-name"
                                    InputProps={{
                                        sx: { borderRadius: 2 }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2,
                            mt: 4
                        }}>
                            <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="caption">
                                    Fatura bilgileriniz faturalandırma amaçlı kullanılacaktır
                                </Typography>
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                gap: 1,
                            }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCloseBillingAddressModal}
                                    sx={{ borderRadius: 2 }}
                                >
                                    İptal
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSaveBillingAddress}
                                    sx={{
                                        borderRadius: 2,
                                        px: 3,
                                        boxShadow: '0 4px 8px rgba(25, 118, 210, 0.25)'
                                    }}
                                >
                                    Kaydet
                                </Button>
                            </Box>
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
                        <Divider sx={{mb: 3}}/>

                        <Box sx={{mb: 3}}>
                            <Alert severity="warning" sx={{mb: 3}}>
                                <AlertTitle>Dikkat</AlertTitle>
                                Aboneliğinizi iptal etmek üzeresiniz. Bu işlem geri alınamaz.
                            </Alert>

                            <Typography variant="body1" paragraph>
                                <strong>{subscriptionInfo.currentPlan}</strong> aboneliğinizi iptal etmek istediğinize
                                emin misiniz?
                            </Typography>

                            <Typography variant="body2" color="text.secondary" paragraph>
                                İptal işlemi onaylandığında:
                            </Typography>

                            <Box component="ul" sx={{pl: 2, mb: 2}}>
                                <Typography component="li" variant="body2" color="text.secondary">
                                    Aboneliğiniz <strong>{subscriptionInfo.nextPaymentDate}</strong> tarihine kadar
                                    aktif kalacaktır.
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
                                bgcolor: '#fff3e0',
                                borderRadius: 1,
                                mb: 3,
                                border: '1px dashed #ff9800'
                            }}>
                                <Typography variant="body2">
                                    İptal etmek yerine planınızı değiştirmek
                                    isterseniz, <strong>"{planTabLabel}"</strong> sekmesine giderek farklı bir plan
                                    seçebilirsiniz.
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
