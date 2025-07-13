import React, {useState} from 'react';
import './HesabimiSil.css';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    Container,
    FormControlLabel,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InfoIcon from '@mui/icons-material/Info';
import DefaultWithFooter from "../../Components/Layouts/DefaultWithFooter.jsx";
import emailjs from '@emailjs/browser';

export default function HesabimiSil() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        reason: '',
        confirmDelete: false
    });

    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({
        success: false,
        error: false,
        message: ''
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        setFormData(prev => ({
            ...prev,
            confirmDelete: e.target.checked
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.confirmDelete) {
            setSubmitStatus({
                success: false,
                error: true,
                message: 'Hesap silme onayını işaretlemelisiniz.'
            });
            return;
        }

        setLoading(true);

        const templateParams = {
            from_name: formData.fullName,
            from_email: formData.email,
            from_phone: formData.phone,
            message: formData.reason,
            to_email: 'diyetia.app@gmail.com',
            subject: 'Hesap Silme Talebi'
        };

        try {
            await emailjs.send(
                'YOUR_SERVICE_ID',
                'YOUR_TEMPLATE_ID',
                templateParams,
                'YOUR_USER_ID'
            );

            setSubmitStatus({
                success: true,
                error: false,
                message: 'Hesap silme talebiniz başarıyla alınmıştır. En kısa sürede işleme alınacaktır.'
            });

            setFormData({
                fullName: '',
                email: '',
                phone: '',
                reason: '',
                confirmDelete: false
            });

        } catch (error) {
            console.error('EmailJS Error:', error);
            setSubmitStatus({
                success: false,
                error: true,
                message: 'Talebiniz gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.'
            });
        } finally {
            setLoading(false);

            setTimeout(() => {
                setSubmitStatus({
                    success: false,
                    error: false,
                    message: ''
                });
            }, 5000);
        }
    };

    return (
        <DefaultWithFooter>
            <Box className="hesabimi-sil-page" sx={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                position: 'relative'
            }}>
                <Box className="header-banner"
                     sx={{
                         background: 'linear-gradient(135deg, #ff7355 0%, #fc9e21 100%)',
                         borderBottomLeftRadius: '15%',
                         borderBottomRightRadius: '15%',
                         boxShadow: '0 4px 20px rgba(252, 158, 33, 0.3)',
                         height: '25vh',
                         display: 'flex',
                         flexDirection: 'column',
                         justifyContent: 'center',
                         position: 'relative',
                         overflow: 'hidden',
                         '&::after': {
                             content: '""',
                             position: 'absolute',
                             bottom: '-10px',
                             left: 0,
                             width: '100%',
                             height: '50px',
                             background: 'white',
                             borderRadius: '50%',
                             transform: 'scale(2)',
                             boxShadow: '0px -15px 20px rgba(0,0,0,0.1)'
                         }
                     }}
                >
                    <Typography
                        variant={isMobile ? "h4" : "h3"}
                        className="header-title"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                            animation: 'fadeIn 1s ease-in-out'
                        }}
                    >
                        Hesabımı Sil
                    </Typography>
                    <Typography
                        variant={isMobile ? "h5" : "h4"}
                        className="header-subtitle"
                        sx={{
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                            animation: 'slideUp 1s ease-in-out'
                        }}
                    >
                        Diyetia.com
                    </Typography>
                </Box>

                <Container component="main" maxWidth="md" className="hesabimi-sil-container"
                           sx={{zIndex: 10, position: 'relative'}}>
                    <Card
                        elevation={10}
                        sx={{
                            borderRadius: 4,
                            overflow: 'visible',
                            mt: -10,
                            mb: 8,
                            background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 12px 20px rgba(252, 158, 33, 0.15)',
                            position: 'relative'
                        }}
                    >
                        <CardContent sx={{
                            pt: 4,
                            px: isMobile ? 3 : 5,
                            pb: 4
                        }}>
                            <Typography
                                variant="h4"
                                align="center"
                                gutterBottom
                                sx={{
                                    fontWeight: "600",
                                    color: '#333',
                                    mb: 4,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1
                                }}
                            >
                                <DeleteForeverIcon color="error" fontSize="large"/>
                                Hesap Silme Talebi
                            </Typography>

                            <Box className="form-info" sx={{mb: 4}}>
                                <Typography
                                    variant="body1"
                                    paragraph
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1
                                    }}
                                >
                                    <InfoIcon color="warning" sx={{mt: 0.3}}/>
                                    Hesabınızı silme işlemi geri alınamaz ve tüm verileriniz kalıcı olarak silinir. Bu
                                    işlemi gerçekleştirmek istediğinizden emin misiniz?
                                </Typography>
                                <Typography variant="body2" sx={{pl: 4}}>
                                    Hesap silme talebiniz alındıktan sonra, ekibimiz tarafından incelenecek ve en kısa
                                    sürede işleme alınacaktır. İşlem ile ilgili size bilgilendirme e-postası
                                    gönderilecektir.
                                </Typography>
                            </Box>

                            {(submitStatus.success || submitStatus.error) && (
                                <Alert
                                    severity={submitStatus.success ? "success" : "error"}
                                    sx={{mb: 3}}
                                >
                                    {submitStatus.message}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="delete-form">
                                <TextField
                                    required
                                    fullWidth
                                    id="fullName"
                                    name="fullName"
                                    label="Ad Soyad"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    variant="outlined"
                                />

                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    name="email"
                                    label="E-posta Adresiniz"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    variant="outlined"
                                />

                                <TextField
                                    fullWidth
                                    id="phone"
                                    name="phone"
                                    label="Telefon Numaranız"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    variant="outlined"
                                />

                                <TextField
                                    required
                                    fullWidth
                                    id="reason"
                                    name="reason"
                                    label="Hesabınızı silme nedeniniz"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    helperText="Hesabınızı silme nedeninizi belirtmeniz, hizmetlerimizi iyileştirmemize yardımcı olacaktır."
                                />

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.confirmDelete}
                                            onChange={handleCheckboxChange}
                                            name="confirmDelete"
                                            color="primary"
                                        />
                                    }
                                    label="Hesabımın kalıcı olarak silinmesini istiyorum ve bu işlemin geri alınamayacağını anlıyorum."
                                />

                                <Box className="form-footer">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="error"
                                        size="large"
                                        disabled={loading || !formData.confirmDelete}
                                        className="submit-btn"
                                        startIcon={loading ? <CircularProgress size={20} color="inherit"/> :
                                            <DeleteForeverIcon/>}
                                        sx={{
                                            mt: 2,
                                            py: 1.5,
                                            px: 4,
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            boxShadow: '0 4px 6px rgba(255, 115, 85, 0.3)',
                                            '&:hover': {
                                                boxShadow: '0 6px 10px rgba(255, 115, 85, 0.4)',
                                            }
                                        }}
                                    >
                                        {loading ? 'İşleniyor...' : 'Hesabımı Sil'}
                                    </Button>

                                    <Typography variant="body2"
                                                sx={{mt: 3, color: 'text.secondary', textAlign: 'center'}}>
                                        Hesap silme işlemiyle ilgili herhangi bir sorunuz varsa, lütfen bizimle <a
                                        href="mailto:info@diyetia.com"
                                        style={{color: theme.palette.primary.main}}>info@diyetia.com</a> adresinden
                                        iletişime geçin.
                                    </Typography>
                                </Box>
                            </form>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        </DefaultWithFooter>
    );
}