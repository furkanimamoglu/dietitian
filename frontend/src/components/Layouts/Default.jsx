import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    Backdrop,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Typography
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security';

import Header from "../Header/Header.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";
import axios from "axios";
import config from "../../config.js";

// KVKK onayı için modal bileşeni
const KvkkApprovalModal = ({open, onClose, onApprove}) => {
    const [kvkkAccepted, setKvkkAccepted] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [communicationAccepted, setCommunicationAccepted] = useState(false);
    const allAccepted = kvkkAccepted && termsAccepted && communicationAccepted;

    const handleAccept = () => {
        if (allAccepted) {
            onApprove();
        }
    };

    const acceptAll = () => {
        setKvkkAccepted(true);
        setTermsAccepted(true);
        setCommunicationAccepted(true);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                    overflow: 'visible',
                    position: 'relative'
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
            {/* Sağ üst çarpı butonu */}
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    zIndex: 1,
                    color: '#757575'
                }}
            >
                <CloseIcon/>
            </IconButton>

            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: '#e3f2fd',
                    color: '#0d47a1',
                    pr: 4
                }}
            >
                <SecurityIcon/>
                KVKK ve Kullanıcı Sözleşmesi
            </DialogTitle>

            <DialogContent sx={{mt: 2}}>
                <DialogContentText sx={{mb: 2}}>
                    Lütfen aşağıdaki KVKK Aydınlatma Metni ve Kullanıcı Sözleşmesini okuyup onaylayın.
                </DialogContentText>

                {/* KVKK Metni */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    KVKK Aydınlatma Metni
                </Typography>

                <Box
                    sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        p: 2,
                        mb: 2,
                        maxHeight: '150px',
                        overflowY: 'auto',
                        bgcolor: 'rgba(249, 249, 249, 0.8)'
                    }}
                >
                    <Typography variant="body2">
                        Kişisel Verilerin Korunması Kanunu kapsamında sizden aldığımız bilgiler, sadece hizmetimizi
                        sunmak ve
                        geliştirmek amacıyla kullanılmaktadır. Hizmetlerimizi kullanmak için verdiğiniz kişisel bilgiler
                        (adınız, soyadınız, e-posta adresiniz, telefon numaranız ve diğer iletişim bilgileri) güvenli
                        bir şekilde saklanmakta ve
                        izniniz olmadan üçüncü kişilerle paylaşılmamaktadır.
                        <br/><br/>
                        Kişisel verileriniz, size daha iyi hizmet verebilmemiz, yasal yükümlülüklerimizi yerine getirmek
                        ve sizinle iletişimde kalmak amacıyla kullanılmaktadır.
                        <br/><br/>
                        6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verilerinizin güvenliği bizim
                        için önemlidir. Verilerinize kimlerin erişebildiği, nasıl kullanıldığı, nasıl korunduğu ve hangi
                        haklara sahip olduğunuz konusunda sizi bilgilendirmek isteriz.
                        <br/><br/>
                        Kişisel verileriniz hakkında her zaman bilgi talep edebilir, verilerinizin düzeltilmesini veya
                        silinmesini isteyebilirsiniz.
                    </Typography>
                </Box>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={kvkkAccepted}
                            onChange={(e) => setKvkkAccepted(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="KVKK aydınlatma metnini okudum ve kabul ediyorum"
                    sx={{mb: 3}}
                />

                {/* Kullanıcı Sözleşmesi */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Kullanıcı Sözleşmesi
                </Typography>

                <Box
                    sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        p: 2,
                        mb: 2,
                        maxHeight: '150px',
                        overflowY: 'auto',
                        bgcolor: 'rgba(249, 249, 249, 0.8)'
                    }}
                >
                    <Typography variant="body2">
                        Bu Kullanıcı Sözleşmesi, dietitian platformunu kullanırken uymanız gereken kuralları ve
                        koşulları belirtir.
                        <br/><br/>
                        1. Hizmet Kullanımı: Platformumuz, diyetisyenlerin müşterileri ile etkileşimde bulunmasına
                        olanak tanır. Platformu kötüye kullanmak, yasadışı faaliyetlerde bulunmak veya başkalarına zarar
                        vermek için kullanamazsınız.
                        <br/><br/>
                        2. Hesap Güvenliği: Hesabınızın güvenliğinden siz sorumlusunuz. Güçlü bir şifre kullanın ve
                        şifrenizi başkalarıyla paylaşmayın.
                        <br/><br/>
                        3. İçerik Sorumluluğu: Platformda paylaştığınız tüm içeriklerden siz sorumlusunuz. Yasa dışı,
                        zararlı, tehditkar, taciz edici, iftira niteliğinde veya başka şekilde uygunsuz içerik
                        paylaşmayın.
                        <br/><br/>
                        4. Telif Hakları: Başkalarının telif haklarını ihlal eden içerik paylaşmayın.
                        <br/><br/>
                        5. Servis Değişiklikleri: Hizmetimizi herhangi bir zamanda değiştirme veya sonlandırma hakkını
                        saklı tutarız.
                        <br/><br/>
                        6. Hesap İptali: Kullanım koşullarını ihlal ettiğinizde hesabınızı askıya alma veya sonlandırma
                        hakkımız vardır.
                        <br/><br/>
                        7. Sorumluluk Sınırlaması: Platformumuzun kullanımı sırasında oluşabilecek doğrudan, dolaylı,
                        özel, arızi veya sonuçsal zararlardan sorumlu değiliz.
                    </Typography>
                </Box>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Kullanıcı sözleşmesini okudum ve kabul ediyorum"
                    sx={{mb: 3}}
                />

                {/* İletişim İzinleri - Kullanıcı Sözleşmesinin altında, belirgin bir şekilde */}
                <Box sx={{pt: 1, pb: 1, borderTop: '1px solid #f0f0f0', mt: 1}}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={communicationAccepted}
                                onChange={(e) => setCommunicationAccepted(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="SMS, e-posta ve bildirim almayı kabul ediyorum"
                        sx={{mb: 2}}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{p: 2, display: 'flex', justifyContent: 'space-between'}}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    color="error"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        py: 1,
                    }}
                >
                    Vazgeç
                </Button>

                <Button
                    onClick={allAccepted ? handleAccept : acceptAll}
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        py: 1,
                        background: allAccepted ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' : 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                    }}
                >
                    {allAccepted ? "Kabul Et" : "Onaylayın"}
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
    const [showKvkkModal, setShowKvkkModal] = useState(false);
    // İçeriğin yüklenip yüklenmediğini takip etmek için yeni state
    const [isLoading, setIsLoading] = useState(true);

    const isPaymentPage = location.pathname === '/odeme';
    const isSettingsPage = location.pathname === '/ayarlar';

    const getDietitianInfo = async () => {
        try {
            setIsLoading(true); // Bilgi yüklenirken loading durumu
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config[config.environment].apiUrl}/dietitian/getDietitianInfo`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token || ''
                }
            });

            if (response.data) {
                setDietitianInfo(response.data);

                const kvkkNotApproved = response.data.hasOwnProperty('kvkkApproval') && response.data.kvkkApproval === false;
                const sozlesmeNotApproved = response.data.hasOwnProperty('kullaniciSozlesmesiApproval') && response.data.kullaniciSozlesmesiApproval === false;

                if (kvkkNotApproved || sozlesmeNotApproved) {
                    setShowKvkkModal(true);
                } else {
                    setShowKvkkModal(false);
                }

                const isFree = response.data.subscription_type === "free";
                if (isFree && !isPaymentPage && !isSettingsPage) {
                    setIsContentBlocked(true);
                } else {
                    setIsContentBlocked(false);
                }

                setShowSubscriptionModal(false);

                // Abonelik süresi kontrolü
                if (response.data.subscription_end_date) {
                    const endDate = new Date(response.data.subscription_end_date);
                    const currentDate = new Date();

                    if (endDate < currentDate) {
                        console.log('Abonelik süresi dolmuş, ücretsiz plana dönüştürülüyor...');
                        await axios.post(`${config[config.environment].apiUrl}/dietitian/changeDietitianSubscriptionToFree`, {}, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': token || ''
                            }
                        });

                        const updatedResponse = await axios.get(`${config[config.environment].apiUrl}/dietitian/getDietitianInfo`, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': token || ''
                            }
                        });

                        if (updatedResponse.data) {
                            setDietitianInfo(updatedResponse.data);

                            const isStillFree = updatedResponse.data.subscription_type === "free";
                            if (isStillFree && !isPaymentPage && !isSettingsPage) {
                                setIsContentBlocked(true);
                            } else {
                                setIsContentBlocked(false);
                            }
                        }
                    }
                }
            }
            setIsLoading(false); // Yükleme tamamlandı
        } catch (error) {
            console.error('Diyetisyen bilgisi alınamadı.', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
            setIsLoading(false); // Hata olsa bile yükleme durumunu sonlandır
        }
    };

    useEffect(() => {
        getDietitianInfo();
    }, []);

    const handleUpgrade = () => {
        setShowSubscriptionModal(false);
        navigate('/odeme');
    };

    const handleCloseModal = () => {
        setShowSubscriptionModal(false);
    };

    const handleKvkkApprove = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${config[config.environment].apiUrl}/dietitian/updateApprovalSettings`,
                {
                    kvkkApproval: true,
                    kullaniciSozlesmesiApproval: true,
                    SMSApproval: true,
                    MailApproval: true,
                    NotificationApproval: true
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token || ''
                    }
                }
            );

            setShowKvkkModal(false);

            const updatedResponse = await axios.get(`${config[config.environment].apiUrl}/dietitian/getDietitianInfo`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token || ''
                }
            });

            if (updatedResponse.data) {
                setDietitianInfo(updatedResponse.data);

                // Onay sonrası içerik bloklanma durumunu güncelle
                const isFree = updatedResponse.data.subscription_type === "free";
                if (isFree && !isPaymentPage && !isSettingsPage) {
                    setIsContentBlocked(true);
                } else {
                    setIsContentBlocked(false);
                }
            }
        } catch (error) {
            console.error('KVKK onayı güncellenemedi:', error);
        }
    };

    // Eğer yükleme devam ediyorsa, yükleme göster
    if (isLoading) {
        return (
            <>
                <Header/>
                <Navbar/>
                <Box
                    sx={{
                        p: 3,
                        minHeight: 'calc(100vh - 64px - 56px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    {/* Basit bir yükleniyor göstergesi */}
                    <Typography variant="h6" color="text.secondary">
                        Yükleniyor...
                    </Typography>
                </Box>
                <Footer/>
            </>
        );
    }

    return (
        <>
            <Header/>
            <Navbar/>

            {/* Ana içerik alanı */}
            <Box sx={{
                p: 3,
                mt: 3,
                bgcolor: isContentBlocked ? '#f9f9f9' : 'inherit',
                minHeight: 'calc(100vh - 64px - 56px)'
            }}>
                {isContentBlocked ? (
                    <Box sx={{textAlign: 'center', py: 5}}>
                        <Typography variant="h6" gutterBottom>
                            İçerik Erişimi Engellendi
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                            Bu içeriği görüntülemek için lütfen bir paket satın alın.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/odeme')}
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                px: 3,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 'medium',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                    boxShadow: '0 8px 25px rgba(102,126,234,0.5)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            Paket Satın Al
                        </Button>
                    </Box>
                ) : (
                    props.children
                )}
            </Box>

            <Footer/>

            {/* KVKK onayı modalı */}
            <KvkkApprovalModal
                open={showKvkkModal}
                onClose={() => setShowKvkkModal(false)}
                onApprove={handleKvkkApprove}
            />
        </>
    );
}
