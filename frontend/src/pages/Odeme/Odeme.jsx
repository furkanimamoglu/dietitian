import React, {useState} from "react";
import Default from "../../Components/Layouts/Default.jsx";
import "./Odeme.css";
import {
    Alert,
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
    Typography
} from "@mui/material";
import {
    CreditCard,
    Edit as EditIcon,
    ReceiptLong,
    Check,
    CheckCircle,
    CurrencyLira,
    Payments,
    FileCopy,
    History,
    Download,
    AccountBalance,
    AddCard,
    Compare,
    Star,
    StarBorder
} from "@mui/icons-material";

export default function Odeme() {
    const [activeTab, setActiveTab] = useState(0);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [openChangeModal, setOpenChangeModal] = useState(false);
    const [openUpgradeModal, setOpenUpgradeModal] = useState(false);
    const [newCardInfo, setNewCardInfo] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });

    // Mevcut abonelik ve faturalama bilgileri
    const [subscriptionInfo] = useState({
        currentPlan: "Premium Diyetisyen Paketi",
        price: 599,
        billingCycle: "Aylık",
        nextPaymentDate: "15 Nisan 2023",
        autoRenew: true,
        features: ["Sınırsız Danışan", "Gelişmiş Raporlar", "7/24 Destek", "Çevrimiçi Randevu", "Gelişmiş İstatistikler"]
    });

    // Ödeme yöntemleri
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

    // Fatura geçmişi
    const [invoiceHistory] = useState([
        {date: '15 Mart 2023', amount: '₺599', status: 'Ödendi', invoice: 'INV-20230315'},
        {date: '15 Şubat 2023', amount: '₺599', status: 'Ödendi', invoice: 'INV-20230215'},
        {date: '15 Ocak 2023', amount: '₺599', status: 'Ödendi', invoice: 'INV-20230115'},
        {date: '15 Aralık 2022', amount: '₺599', status: 'Ödendi', invoice: 'INV-20221215'},
        {date: '15 Kasım 2022', amount: '₺599', status: 'Ödendi', invoice: 'INV-20221115'}
    ]);

    // Plan karşılaştırma
    const [plans] = useState([
        {
            name: "Başlangıç",
            price: 299,
            features: [
                { name: "Aylık 20 danışan", included: true },
                { name: "Temel raporlar", included: true },
                { name: "E-posta desteği", included: true },
                { name: "Çevrimiçi randevu", included: false },
                { name: "Özelleştirilmiş diyet planları", included: false },
                { name: "Gelişmiş grafikler ve analiz", included: false }
            ]
        },
        {
            name: "Premium",
            price: 599,
            popular: true,
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
            name: "Kurumsal",
            price: 999,
            features: [
                { name: "Sınırsız danışan", included: true },
                { name: "Gelişmiş raporlar", included: true },
                { name: "7/24 öncelikli destek", included: true },
                { name: "Çevrimiçi randevu", included: true },
                { name: "Özelleştirilmiş diyet planları", included: true },
                { name: "API erişimi", included: true }
            ]
        }
    ]);

    // Fatura adresi
    const [billingAddress] = useState({
        name: "Dr. Furkan İmamoğlu",
        company: "İstanbul Beslenme Kliniği",
        address: "Bağdat Caddesi No: 123",
        city: "Kadıköy",
        state: "İstanbul",
        zipCode: "34000",
        country: "Türkiye"
    });

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSaveSettings = () => {
        // Simulating API call to save settings
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
    
    const handleOpenUpgradeModal = () => {
        setOpenUpgradeModal(true);
    };
    
    const handleCloseUpgradeModal = () => {
        setOpenUpgradeModal(false);
    };
    
    const handleCardInputChange = (e) => {
        setNewCardInfo({
            ...newCardInfo,
            [e.target.name]: e.target.value
        });
    };
    
    const handleAutoRenewChange = (e) => {
        // Burada API çağrısı yapılarak auto-renew durumu değiştirilebilir
        console.log("Auto renew changed", e.target.checked);
    };

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
                        <Tab icon={<ReceiptLong />} iconPosition="start" label="Faturalar ve Ödeme Geçmişi" />
                        <Tab icon={<Compare />} iconPosition="start" label="Plan Karşılaştırma" />
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
                                    
                                    <Paper elevation={0} variant="outlined" sx={{
                                        p: 3,
                                        mb: 4,
                                        borderRadius: 2,
                                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                                    }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={8}>
                                                <Box sx={{color: 'white'}}>
                                                    <Typography variant="subtitle1" gutterBottom>
                                                        Aktif Plan
                                                    </Typography>
                                                    <Typography variant="h3" gutterBottom fontWeight="bold">
                                                        {subscriptionInfo.currentPlan}
                                                    </Typography>
                                                    <Typography variant="body1" sx={{opacity: 0.9}}>
                                                        Tüm özelliklere sınırsız erişim
                                                    </Typography>
                                                    <Box sx={{mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap'}}>
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
                                                                    }
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
                                                            {subscriptionInfo.price}
                                                            <Typography component="span" variant="h6" sx={{opacity: 0.8, ml: 1}}>
                                                                /{subscriptionInfo.billingCycle.toLowerCase()}
                                                            </Typography>
                                                        </Typography>
                                                    </Box>
                                                    
                                                    <Typography variant="body2" sx={{mt: {xs: 2, md: 0}}}>
                                                        Sonraki ödeme tarihi: <b>{subscriptionInfo.nextPaymentDate}</b>
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                    
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
                                                color="primary" 
                                                onClick={handleOpenUpgradeModal} 
                                                startIcon={<Star />}
                                                sx={{mr: 1}}
                                            >
                                                Plan Değiştir
                                            </Button>
                                            <Button 
                                                variant="outlined" 
                                                color="secondary"
                                            >
                                                İptal Et
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                            
                            <Card variant="outlined" className="payment-card" sx={{mt: 3}}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Ödeme Yöntemleri
                                    </Typography>
                                    <Divider sx={{mb: 3}}/>
                                    
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
                                    >
                                        Fatura Bilgilerini Düzenle
                                    </Button>
                                </CardContent>
                            </Card>
                            
                            <Card variant="outlined" className="payment-card" sx={{mt: 3}}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Özet
                                    </Typography>
                                    <Divider sx={{mb: 3}}/>
                                    
                                    <Box sx={{mb: 3}}>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                            <Typography variant="body2">Mevcut Plan</Typography>
                                            <Typography variant="body2">{subscriptionInfo.currentPlan}</Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                            <Typography variant="body2">Fatura Dönemi</Typography>
                                            <Typography variant="body2">{subscriptionInfo.billingCycle}</Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                            <Typography variant="body2">Sonraki Ödeme</Typography>
                                            <Typography variant="body2">{subscriptionInfo.nextPaymentDate}</Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Divider sx={{my: 2}} />
                                    
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                        <Typography variant="body1" fontWeight="500">Toplam</Typography>
                                        <Typography variant="body1" fontWeight="500">₺{subscriptionInfo.price}</Typography>
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
                                        Tüm fiyatlara KDV dahildir.
                                    </Typography>
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
                                                    <IconButton size="small" color="primary" title="Faturayı İndir">
                                                        <Download fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" color="primary" title="Faturayı Kopyala">
                                                        <FileCopy fontSize="small" />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        ))}
                                    </Box>
                                </Box>
                            </Paper>
                            
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 4}}>
                                <Button
                                    variant="outlined"
                                    startIcon={<History />}
                                >
                                    Eski Faturalar
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Download />}
                                >
                                    Tüm Faturaları İndir
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                )}
                
                {/* Plan Karşılaştırma Tab */}
                {activeTab === 2 && (
                    <Card variant="outlined" className="payment-card">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Plan Karşılaştırma
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                İhtiyaçlarınıza en uygun planı seçin.
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
                                                border: plan.popular ? '2px solid #2196F3' : '1px solid #e0e0e0'
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
                                                        right: 20
                                                    }}
                                                />
                                            )}
                                            
                                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                                {plan.name}
                                            </Typography>
                                            
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                mb: 3
                                            }}>
                                                <Typography variant="h3" fontWeight="bold">
                                                    ₺{plan.price}
                                                </Typography>
                                                <Typography variant="subtitle1" sx={{mb: 0.8, ml: 1}}>
                                                    /ay
                                                </Typography>
                                            </Box>
                                            
                                            <Divider sx={{mb: 2}} />
                                            
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
                                                            <CheckCircle fontSize="small" color="primary" sx={{mr: 1}} />
                                                        ) : (
                                                            <StarBorder fontSize="small" color="disabled" sx={{mr: 1}} />
                                                        )}
                                                        <Typography
                                                            variant="body2"
                                                            color={feature.included ? 'text.primary' : 'text.secondary'}
                                                        >
                                                            {feature.name}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                            
                                            <Button
                                                variant={plan.popular ? "contained" : "outlined"}
                                                color="primary"
                                                fullWidth
                                                sx={{mt: 3}}
                                                disabled={plan.name === subscriptionInfo.currentPlan.split(" ")[0]}
                                            >
                                                {plan.name === subscriptionInfo.currentPlan.split(" ")[0] ? 'Mevcut Plan' : 'Planı Seç'}
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
                                    <Button variant="text" color="primary">
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
                        <Divider sx={{mb: 3}} />
                        
                        <Typography variant="body2" paragraph>
                            Plan değişikliği bir sonraki fatura döneminden itibaren geçerli olacaktır.
                        </Typography>
                        
                        <Box sx={{mb: 3}}>
                            <FormControl fullWidth>
                                <InputLabel id="plan-select-label">Yeni Plan</InputLabel>
                                <Select
                                    labelId="plan-select-label"
                                    id="plan-select"
                                    value="premium"
                                    label="Yeni Plan"
                                >
                                    <MenuItem value="baslangic">Başlangıç - ₺299/ay</MenuItem>
                                    <MenuItem value="premium">Premium - ₺599/ay</MenuItem>
                                    <MenuItem value="kurumsal">Kurumsal - ₺999/ay</MenuItem>
                                </Select>
                            </FormControl>
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
                        
                        <Box sx={{p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 3}}>
                            <Typography variant="body2" paragraph>
                                <strong>Değişiklik Özeti:</strong>
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Mevcut Plan:</Typography>
                                    <Typography variant="body2">Premium Diyetisyen Paketi</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Yeni Plan:</Typography>
                                    <Typography variant="body2">Premium Diyetisyen Paketi</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Mevcut Fiyat:</Typography>
                                    <Typography variant="body2">₺599/ay</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Yeni Fiyat:</Typography>
                                    <Typography variant="body2">₺599/ay</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">Değişiklik Tarihi:</Typography>
                                    <Typography variant="body2">15 Nisan 2023 (Sonraki fatura döneminde)</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                        
                        <Box sx={{
                            display: 'flex', 
                            justifyContent: 'flex-end',
                            gap: 1
                        }}>
                            <Button 
                                variant="outlined"
                                onClick={handleCloseUpgradeModal}
                            >
                                İptal
                            </Button>
                            <Button 
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    handleSaveSettings();
                                    handleCloseUpgradeModal();
                                }}
                            >
                                Onayla
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </Box>
        </Default>
    );
}