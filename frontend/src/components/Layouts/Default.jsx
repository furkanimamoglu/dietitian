import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    IconButton,
    Card,
    CardContent,
    Chip,
    Fade,
    Backdrop,
    Alert,
    AlertTitle
} from '@mui/material';
import {
    Close as CloseIcon,
    Star as StarIcon,
    Check as CheckIcon,
    Rocket as RocketIcon,
    Lock as LockIcon,
    Warning as WarningIcon
} from '@mui/icons-material';

import Header from "../Header/Header.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";
import axios from "axios";
import config from "../../config.js";

const SubscriptionInfoModal = ({ open, onClose, onUpgrade }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            // Modal dışına tıklanarak kapatılamaz
            disableEscapeKeyDown
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                    overflow: 'visible'
                }
            }}
            BackdropComponent={Backdrop}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)'
                }
            }}
        >
            <DialogContent sx={{ p: 0, position: 'relative' }}>
                {/* Close Button */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        zIndex: 1,
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: '1px solid #e0e0e0',
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,1)',
                            transform: 'scale(1.1)'
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* Uyarı Mesajı */}
                <Alert
                    severity="info"
                    sx={{
                        m: 0,
                        borderRadius: 0,
                        backgroundColor: '#e3f2fd',
                        border: 'none',
                        borderBottom: '1px solid #f0f0f0'
                    }}
                    icon={<LockIcon />}
                >
                    <AlertTitle sx={{ fontWeight: 'bold' }}>
                        Paket Gerekli
                    </AlertTitle>
                    Bu özelliği kullanabilmek için paket satın almanız gerekmektedir.
                </Alert>

                {/* Header Section */}
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        p: 4,
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -50,
                            right: -50,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: -30,
                            left: -30,
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                        }}
                    />

                    <RocketIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Paket Satın Alın
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Sistemi kullanabilmek için bir paket seçmeniz gerekiyor
                    </Typography>
                </Box>

                {/* Content Section */}
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography
                        variant="h6"
                        color="text.primary"
                        sx={{
                            mb: 2,
                            fontWeight: 500
                        }}
                    >
                        Devam etmek için paket seçimi yapınız
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 3
                        }}
                    >
                        Size en uygun paketi seçebilir ve hemen kullanmaya başlayabilirsiniz.
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0, gap: 2, flexDirection: 'column' }}>
                {/* Ana CTA Button */}
                <Button
                    onClick={onUpgrade}
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            boxShadow: '0 8px 25px rgba(102,126,234,0.5)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    Paket Seç
                </Button>

                {/* İkincil Button */}
                <Button
                    onClick={onClose}
                    variant="text"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        color: '#666',
                        fontSize: '0.9rem',
                        '&:hover': {
                            backgroundColor: '#f5f5f5'
                        }
                    }}
                >
                    Daha sonra
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default function Default(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const [dietitianInfo, setDietitianInfo] = useState({});
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [isContentBlocked, setIsContentBlocked] = useState(false);

    // /odeme sayfasında kısıtlama uygulanmaz
    const isPaymentPage = location.pathname === '/odeme';
    const isSettingsPage = location.pathname === '/ayarlar';

    const getDietitianInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config[config.environment].apiUrl}/dietitian/getDietitianInfo`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token || ''
                }
            });
            if (response.data) {
                setDietitianInfo(response.data);
            }
        } catch (error) {
            console.error('Diyetisyen bilgisi alınamadı.', error);
        }
    };

    useEffect(() => {
        getDietitianInfo();
    }, []);

    useEffect(() => {
        if (dietitianInfo.subscription_type === "free" && isPaymentPage && isSettingsPage ) {
            setIsContentBlocked(true);
            setShowSubscriptionModal(true);
        } else {
            setIsContentBlocked(false);
        }
    }, [dietitianInfo, isPaymentPage, isSettingsPage]);

    const handleUpgrade = () => {
        setShowSubscriptionModal(false);
        navigate('/odeme');
    };

    const handleCloseModal = () => {
        setShowSubscriptionModal(false);
        // İçerik hala bloklu kalacak, sadece modal kapanacak
    };

    return (
        <>
            <Header />
            <Navbar />
            <Box
                sx={{
                    flex: 1,
                    height: 'calc(100vh - 120px)',
                    overflowY: 'auto',
                    overflowX: 'auto',
                    padding: '1rem',
                    mt: { xs: '3rem', sm: '2rem' },
                    pb: '60px',
                    position: 'relative'
                }}
            >
                {/* İçerik Blokaj Overlay - sadece ödeme sayfası değilse göster */}
                {isContentBlocked && (!isPaymentPage || !isSettingsPage) ? (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(3px)',
                            zIndex: 999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: 3
                        }}
                    >
                        <LockIcon sx={{ fontSize: 64, color: '#ccc' }} />
                        <Typography variant="h5" color="text.secondary" textAlign="center">
                            Bu içeriği görüntülemek için<br />
                            paket satın almanız gerekiyor
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setShowSubscriptionModal(true)}
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            }}
                        >
                            Paket Seç
                        </Button>
                    </Box>
                ) : (
                    props.children
                )}
            </Box>
            <Footer />

            <SubscriptionInfoModal
                open={showSubscriptionModal && !isPaymentPage}
                onClose={handleCloseModal}
                onUpgrade={handleUpgrade}
            />
        </>
    );
}