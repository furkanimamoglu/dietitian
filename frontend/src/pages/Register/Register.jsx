import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './Register.css';
import config from "../../config.js";

import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    Link,
    TextField,
    Typography,
    Card,
    CardContent,
    useTheme,
    useMediaQuery
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SmsIcon from "@mui/icons-material/Sms";
import DefaultWithFooter from "../../Components/Layouts/DefaultWithFooter.jsx";

function Register() {
    const [isim, setIsim] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // SMS Verification states
    const [showVerificationDialog, setShowVerificationDialog] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState('');

    const navigate = useNavigate();

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;
        const digitsOnly = value.replace(/\D/g, '');
        setPhone(digitsOnly);
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleVerificationCodeChange = (e) => {
        const value = e.target.value;
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length <= 6) {
            setVerificationCode(digitsOnly);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate phone number format
        if (!/^\d{10}$/.test(phone)) {
            setMessage('Telefon numarası 10 haneli olmalıdır (5XXXXXXXXX)');
            setLoading(false);
            return;
        }

        fetch(config[config.environment].apiUrl + "/dietitian/register", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: isim,
                email: email,
                password: password,
                phoneNumber: Number(phone)
            }),
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Kayıt işlemi başarısız oldu.');
                }
            })
            .then(data => {
                const token = data.token;
                localStorage.setItem('token', 'Bearer ' + token);
                setMessage('Kayıt işlemi başarılı. Mail doğrulama kodu gönderildi.');
                setLoading(false);
                setShowVerificationDialog(true);
            })
            .catch(error => {
                console.error('Exception:', error);
                setMessage('Hata: Bir sorun oluştu, teknik ekip ile görüşün.');
                setLoading(false);
            });
    };

    const handleVerifyCode = () => {
        if (verificationCode.length !== 6) {
            setVerificationMessage('Doğrulama kodu 6 haneli olmalıdır.');
            return;
        }

        setVerificationLoading(true);
        setVerificationMessage('');

        fetch(config[config.environment].apiUrl + "/dietitian/verifyEmail", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                verificationCode: Number(verificationCode)
            }),
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(data => {
                        throw new Error(data.message || 'Doğrulama işlemi başarısız oldu.');
                    });
                }
            })
            .then(data => {
                setVerificationMessage('E-posta başarıyla doğrulandı. Ana sayfaya yönlendiriliyorsunuz...');
                setTimeout(() => {
                    setShowVerificationDialog(false);
                    navigate('/anasayfa');
                }, 2000);
            })
            .catch(error => {
                console.error('Verification Error:', error);
                setVerificationMessage(error.message);
                setVerificationLoading(false);
            });
    };

    const handleCloseVerificationDialog = () => {
        setShowVerificationDialog(false);
        setVerificationCode('');
        setVerificationMessage('');
    };

    return (
        <DefaultWithFooter>
            <Box className="register-page" sx={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                position: 'relative'
            }}>
                <Box className="header-banner"
                    sx={{
                        background: 'linear-gradient(135deg, #ff7355 0%, #fc9e21 100%)',
                        borderBottomLeftRadius: '15%',
                        borderBottomRightRadius: '15%',
                        boxShadow: '0 4px 20px rgba(252, 158, 33, 0.3)',
                        height: '35vh',
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
                        Sağlıklı Yaşam İçin
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

                <Container component="main" maxWidth="sm" className="register-container" sx={{ zIndex: 10, position: 'relative' }}>
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
                        <Avatar sx={{
                            position: 'absolute',
                            top: '-30px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 80,
                            height: 80,
                            background: "linear-gradient(135deg, #ff7355 0%, #fc9e21 100%)",
                            boxShadow: "0 4px 10px rgba(252, 158, 33, 0.5)",
                            border: "4px solid white"
                        }}>
                            <LockOutlinedIcon sx={{ fontSize: 40 }}/>
                        </Avatar>

                        <CardContent sx={{
                            pt: 7,
                            px: isMobile ? 3 : 5,
                            pb: 4
                        }}>
                            <Typography variant="h4" gutterBottom sx={{fontWeight: "500"}}>
                                Kayıt Ol
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                                Yeni bir diyetisyen hesabı oluşturun
                            </Typography>

                            <Divider flexItem sx={{width: "100%", mb: 3}}/>

                            <form onSubmit={handleSubmit} style={{width: '100%'}}>
                                <TextField
                                    label="İsim Soyisim"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    sx={{mb: 3}}
                                    value={isim}
                                    onChange={(e) => setIsim(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon color="action"/>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <TextField
                                    label="E-Mail"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    type="email"
                                    sx={{mb: 3}}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon color="action"/>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <TextField
                                    label="Telefon Numarası"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    sx={{mb: 3}}
                                    value={phone}
                                    onChange={handlePhoneNumberChange}
                                    placeholder="5XXXXXXXXX"
                                    inputProps={{maxLength: 10}}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PhoneIcon color="action"/>
                                                <Typography variant="body2" color="text.secondary" sx={{ml: 1}}>
                                                    +90
                                                </Typography>
                                            </InputAdornment>
                                        ),
                                    }}
                                    helperText="Örnek: 5075280653"
                                />

                                <TextField
                                    label="Şifre"
                                    type={showPassword ? "text" : "password"}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    sx={{mb: 3}}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={toggleShowPassword} edge="end">
                                                    {showPassword ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={loading}
                                    sx={{
                                        mt: 1,
                                        mb: 3,
                                        py: 1.5,
                                        background: "linear-gradient(135deg, #ff7355 0%, #fc9e21 100%)",
                                        boxShadow: "0 3px 5px 2px rgba(76, 175, 80, .3)",
                                        borderRadius: "30px",
                                        textTransform: "none",
                                        fontSize: "1rem",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit"/> : "Kayıt Ol"}
                                </Button>
                            </form>

                            {message && (
                                <Typography
                                    variant="body2"
                                    color={message.includes('başarılı') ? 'success.main' : 'error.main'}
                                    sx={{my: 2, textAlign: "center", fontWeight: "medium"}}
                                >
                                    {message}
                                </Typography>
                            )}

                            <Typography variant="body2" sx={{mt: 1}}>
                                Zaten hesabınız var mı?{' '}
                                <Link href="/girisyap"
                                      sx={{textDecoration: "none", color: "primary.main", fontWeight: "medium"}}>
                                    Giriş Yap
                                </Link>
                            </Typography>
                        </CardContent>
                    </Card>
                </Container>

                {/* SMS Verification Dialog */}
                <Dialog
                    open={showVerificationDialog}
                    onClose={handleCloseVerificationDialog}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            padding: 2
                        }
                    }}
                >
                    <DialogTitle sx={{textAlign: 'center', pb: 1}}>
                        <Avatar sx={{
                            width: 48,
                            height: 48,
                            mx: 'auto',
                            mb: 2,
                            background: "linear-gradient(135deg, #ff7355 0%, #fc9e21 100%)",
                        }}>
                            <SmsIcon/>
                        </Avatar>
                        <Typography variant="h5" component="div" sx={{fontWeight: 500}}>
                            SMS Doğrulama
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                            Telefon numaranıza gönderilen 6 haneli doğrulama kodunu giriniz
                        </Typography>
                    </DialogTitle>

                    <DialogContent sx={{pt: 2}}>
                        <TextField
                            autoFocus
                            label="Doğrulama Kodu"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={verificationCode}
                            onChange={handleVerificationCodeChange}
                            placeholder="123456"
                            inputProps={{
                                maxLength: 6,
                                style: {
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    letterSpacing: '0.5rem'
                                }
                            }}
                            sx={{
                                mt: 2,
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderWidth: 2,
                                    },
                                }
                            }}
                        />

                        {verificationMessage && (
                            <Typography
                                variant="body2"
                                color={verificationMessage.includes('başarıyla') ? 'success.main' : 'error.main'}
                                sx={{mt: 2, textAlign: 'center', fontWeight: 500}}
                            >
                                {verificationMessage}
                            </Typography>
                        )}
                    </DialogContent>

                    <DialogActions sx={{px: 3, pb: 3, pt: 1, flexDirection: 'column', gap: 1}}>
                        <Button
                            onClick={handleVerifyCode}
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={verificationLoading || verificationCode.length !== 6}
                            sx={{
                                py: 1.5,
                                background: "linear-gradient(135deg, #ff7355 0%, #fc9e21 100%)",
                                borderRadius: "30px",
                                textTransform: "none",
                                fontSize: "1rem",
                                fontWeight: "bold"
                            }}
                        >
                            {verificationLoading ? <CircularProgress size={24} color="inherit"/> : "Doğrula"}
                        </Button>

                        <Button
                            onClick={handleCloseVerificationDialog}
                            color="primary"
                            sx={{textTransform: "none"}}
                        >
                            İptal
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DefaultWithFooter>
    );
}

export default Register;