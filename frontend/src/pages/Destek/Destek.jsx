import React, { useState } from 'react';
import './Destek.css';
import {
    Box,
    Card,
    CardContent,
    Container,
    Typography,
    useMediaQuery,
    useTheme,
    TextField,
    Button,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import DefaultWithFooter from "../../Components/Layouts/DefaultWithFooter.jsx";

function Destek() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [showAlert, setShowAlert] = useState(false);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Form gönderme işlemi burada yapılacak
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const faqData = [
        {
            question: "Diyetia.com nasıl çalışır?",
            answer: "Diyetia.com, kişiselleştirilmiş beslenme planları oluşturmak için gelişmiş algoritmaları kullanır. Önce sağlık durumunuz, hedefleriniz ve beslenme tercihleriniz hakkında bilgi toplarız, ardından size özel bir diyet planı hazırlarız."
        },
        {
            question: "Diyet planlarım ne kadar sürede hazırlanır?",
            answer: "Kişiselleştirilmiş diyet planınız genellikle kayıt olduktan sonra 24-48 saat içinde hazırlanır. Acil durumlar için hızlandırılmış hizmet seçeneğimiz de mevcuttur."
        },
        {
            question: "Özel beslenme ihtiyaçlarım destekleniyor mu?",
            answer: "Evet! Vejetaryen, vegan, glutensiz, ketojenik, diyabetik ve diğer özel beslenme ihtiyaçlarınız için planlar oluşturabiliyoruz. Alerjilerinizi ve intoleranslarınızı da dikkate alıyoruz."
        },
        {
            question: "Planımı değiştirebilir miyim?",
            answer: "Tabii ki! Beslenme planınızı istediğiniz zaman revize edebilir, yeni hedefler ekleyebilir veya tercihlerinizi güncelleyebilirsiniz. Uzman diyetisyenlerimiz size yardımcı olacaktır."
        },
        {
            question: "Mobile uygulamanız var mı?",
            answer: "Evet! iOS ve Android uyumlu mobile uygulamamızla diyet planınızı takip edebilir, yemek kayıtları tutabilir ve uzman diyetisyenlerinizle iletişim kurabilirsiniz."
        },
        {
            question: "Ücretlendirme nasıl çalışır?",
            answer: "Farklı ihtiyaçlara yönelik çeşitli paketlerimiz bulunmaktadır. Temel plan, premium plan ve VIP plan seçeneklerimizle size en uygun hizmeti sunuyoruz. Detaylar için fiyatlandırma sayfamızı ziyaret edebilirsiniz."
        }
    ];

    return (
        <DefaultWithFooter>
            <Box className="destek-page" sx={{
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
                        Destek Merkezi
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
                        Size nasıl yardımcı olabiliriz?
                    </Typography>
                </Box>

                <Container component="main" maxWidth="lg" className="destek-container"
                           sx={{zIndex: 10, position: 'relative'}}>

                    {showAlert && (
                        <Alert severity="success" sx={{ mb: 3, mt: -8 }}>
                            Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
                        </Alert>
                    )}

                    <Grid container spacing={4} sx={{ mt: -10, mb: 8 }}>
                        {/* İletişim Formu */}
                        <Grid item xs={12} md={6}>
                            <Card
                                elevation={10}
                                sx={{
                                    borderRadius: 4,
                                    overflow: 'visible',
                                    background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                                    boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 12px 20px rgba(252, 158, 33, 0.15)',
                                    position: 'relative'
                                }}
                            >
                                <CardContent sx={{ p: 4 }}>
                                    <Typography
                                        variant="h5"
                                        align="center"
                                        gutterBottom
                                        sx={{
                                            fontWeight: "600",
                                            color: '#ff7355',
                                            mb: 3
                                        }}
                                    >
                                        Bize Ulaşın
                                    </Typography>

                                    <Box component="form" onSubmit={handleSubmit}>
                                        <TextField
                                            fullWidth
                                            label="Adınız Soyadınız"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            sx={{ mb: 3 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="E-posta Adresiniz"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            sx={{ mb: 3 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Konu"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            required
                                            sx={{ mb: 3 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Mesajınız"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={4}
                                            required
                                            sx={{ mb: 3 }}
                                        />
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            fullWidth
                                            endIcon={<SendIcon />}
                                            sx={{
                                                background: 'linear-gradient(135deg, #ff7355 0%, #fc9e21 100%)',
                                                py: 1.5,
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #e85a3f 0%, #e8930e 100%)',
                                                }
                                            }}
                                        >
                                            Mesaj Gönder
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* İletişim Bilgileri */}
                        <Grid item xs={12} md={6}>
                            <Card
                                elevation={10}
                                sx={{
                                    borderRadius: 4,
                                    overflow: 'visible',
                                    background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                                    boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 12px 20px rgba(252, 158, 33, 0.15)',
                                    position: 'relative'
                                }}
                            >
                                <CardContent sx={{ p: 4 }}>
                                    <Typography
                                        variant="h5"
                                        align="center"
                                        gutterBottom
                                        sx={{
                                            fontWeight: "600",
                                            color: '#ff7355',
                                            mb: 3
                                        }}
                                    >
                                        İletişim Bilgileri
                                    </Typography>

                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <EmailIcon sx={{ color: '#ff7355', mr: 2 }} />
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    E-posta
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    info@diyetia.com
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    destek@diyetia.com
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <PhoneIcon sx={{ color: '#ff7355', mr: 2 }} />
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    Telefon
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    0212 XXX XX XX
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Pazartesi - Cuma: 09:00 - 18:00
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <LocationOnIcon sx={{ color: '#ff7355', mr: 2 }} />
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    Adres
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Merkez Mahallesi, Diyetia Sokak No:1
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Kadıköy / İstanbul
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #ff7355 0%, #fc9e21 100%)',
                                        borderRadius: 2,
                                        p: 3,
                                        color: 'white',
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            7/24 Destek
                                        </Typography>
                                        <Typography variant="body2">
                                            Acil durumlar için mobil uygulamamızdaki canlı destek özelliğini kullanabilirsiniz.
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* SSS Bölümü */}
                    <Card
                        elevation={10}
                        sx={{
                            borderRadius: 4,
                            overflow: 'visible',
                            mb: 8,
                            background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 12px 20px rgba(252, 158, 33, 0.15)',
                            position: 'relative'
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            <Typography
                                variant="h4"
                                align="center"
                                gutterBottom
                                sx={{
                                    fontWeight: "600",
                                    color: '#333',
                                    mb: 4
                                }}
                            >
                                Sıkça Sorulan Sorular
                            </Typography>

                            {faqData.map((faq, index) => (
                                <Accordion
                                    key={index}
                                    sx={{
                                        mb: 2,
                                        '&:before': {
                                            display: 'none',
                                        },
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        borderRadius: '8px !important',
                                        '&.Mui-expanded': {
                                            margin: '0 0 16px 0',
                                        }
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: '#ff7355' }} />}
                                        sx={{
                                            '& .MuiAccordionSummary-content': {
                                                margin: '12px 0',
                                            }
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                                            {faq.question}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body1" color="text.secondary">
                                            {faq.answer}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        </DefaultWithFooter>
    );
}

export default Destek;
