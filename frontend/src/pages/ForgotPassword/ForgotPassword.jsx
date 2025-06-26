import React, {useState} from 'react';
import './ForgotPassword.css';

import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    InputAdornment,
    Link,
    TextField,
    Typography,
    Card,
    CardContent,
    useTheme,
    useMediaQuery
} from "@mui/material";

import LockResetIcon from "@mui/icons-material/LockReset";
import PhoneIcon from "@mui/icons-material/Phone";
import DefaultWithFooter from "../../Components/Layouts/DefaultWithFooter.jsx";

function ForgotPassword() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;
        const digitsOnly = value.replace(/\D/g, '');
        setPhoneNumber(digitsOnly);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (!/^\d{10}$/.test(phoneNumber)) {
            setMessage('Telefon numarası 10 haneli olmalıdır (5XXXXXXXXX)');
            setLoading(false);
            return;
        }

        setTimeout(() => {
            setMessage('Şifre sıfırlama bağlantısı telefonunuza gönderildi.');
            setLoading(false);
        }, 1500);
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <DefaultWithFooter>
            <Box className="forgot-password-page" sx={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                position: 'relative',
                minHeight: '100vh'
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
                            animation: 'fadeIn 1s ease-in-out',
                            textAlign: 'center'
                        }}
                    >
                        Şifrenizi mi Unuttunuz?
                    </Typography>
                    <Typography
                        variant={isMobile ? "h5" : "h4"}
                        className="header-subtitle"
                        sx={{
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                            animation: 'slideUp 1s ease-in-out',
                            textAlign: 'center'
                        }}
                    >
                        Endişelenmeyin, Yardımcı Oluyoruz
                    </Typography>
                </Box>

                <Container component="main" maxWidth="sm" className="forgot-password-container" sx={{ zIndex: 10, position: 'relative' }}>
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
                            <LockResetIcon sx={{ fontSize: 40 }}/>
                        </Avatar>

                        <CardContent sx={{
                            pt: 7,
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
                                    mb: 1
                                }}
                            >
                                Şifremi Unuttum
                            </Typography>

                            <Typography
                                variant="body1"
                                color="text.secondary"
                                align="center"
                                sx={{
                                    mb: 4,
                                    fontWeight: "400",
                                    opacity: 0.8
                                }}
                            >
                                Şifrenizi sıfırlamak için telefon numaranızı girin
                            </Typography>

                            <form onSubmit={handleSubmit} style={{width: '100%'}}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                        sx={{
                                            mb: 1,
                                            fontWeight: 600,
                                            color: '#424242'
                                        }}
                                    >
                                        Telefon Numarası
                                    </Typography>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        required
                                        value={phoneNumber}
                                        onChange={handlePhoneNumberChange}
                                        placeholder="5XXXXXXXXX"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                '&:hover fieldset': {
                                                    borderColor: '#fc9e21',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#fc9e21',
                                                    borderWidth: '2px',
                                                },
                                            },
                                            '& .MuiInputBase-root': {
                                                backgroundColor: '#f8f9fa',
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PhoneIcon sx={{ color: '#ff7355' }} />
                                                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 500, color: '#666' }}>
                                                        +90
                                                    </Typography>
                                                </InputAdornment>
                                            )
                                        }}
                                        inputProps={{
                                            maxLength: 10
                                        }}
                                    />
                                </Box>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={loading}
                                    sx={{
                                        mt: 3,
                                        mb: 3,
                                        py: 1.8,
                                        background: "linear-gradient(135deg, #ff7355 0%, #fc9e21 100%)",
                                        boxShadow: "0 6px 15px rgba(252, 158, 33, 0.4)",
                                        borderRadius: "12px",
                                        textTransform: "none",
                                        fontSize: "1.1rem",
                                        fontWeight: "bold",
                                        letterSpacing: "0.5px",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #ff6347 0%, #ff9e25 100%)",
                                            boxShadow: "0 8px 20px rgba(252, 158, 33, 0.5)",
                                            transform: "translateY(-2px)"
                                        }
                                    }}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} color="inherit"/>
                                    ) : (
                                        "Şifremi Sıfırla"
                                    )}
                                </Button>
                            </form>

                            {message && (
                                <Typography
                                    variant="body2"
                                    color={message.includes('gönderildi') ? 'success.main' : 'error.main'}
                                    sx={{my: 2, textAlign: "center", fontWeight: "medium"}}
                                >
                                    {message}
                                </Typography>
                            )}

                            <Typography variant="body2" sx={{mt: 1}}>
                                <Link href="/girisyap"
                                      sx={{textDecoration: "none", color: "primary.main", fontWeight: "medium"}}>
                                    Giriş sayfasına dön
                                </Link>
                            </Typography>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        </DefaultWithFooter>
    );
}

export default ForgotPassword;
