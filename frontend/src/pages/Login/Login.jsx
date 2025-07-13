import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './Login.css';
import config from "../../config.js";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    InputAdornment,
    Link,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PhoneIcon from "@mui/icons-material/Phone";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DefaultWithFooter from "../../Components/Layouts/DefaultWithFooter.jsx";

function Login() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

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

        fetch(config[config.environment].apiUrl + "/dietitian/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumber: Number(phoneNumber),
                password: password,
            }),
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Telefon numarası veya şifre yanlış.');
                }
            })
            .then((data) => {
                const token = data.token;
                localStorage.setItem('token', 'Bearer ' + token);
                setMessage('Giriş başarılı! Yönlendiriliyor...');
                setTimeout(() => navigate('/anasayfa'), 2000);
            })
            .catch((error) => {
                console.error('Exception:', error);
                setMessage(error.message || 'Bir sorun oluştu, teknik ekip ile görüşün.');
                setLoading(false);
            });
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <DefaultWithFooter>
            <Box className="login-page" sx={{
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

                <Container component="main" maxWidth="sm" className="login-container"
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
                            <LockOutlinedIcon sx={{fontSize: 40}}/>
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
                                Giriş Yap
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
                                Hesabınıza erişim için giriş yapın
                            </Typography>

                            <form onSubmit={handleSubmit} style={{width: '100%'}}>
                                <Box sx={{mb: 3}}>
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
                                                    <PhoneIcon sx={{color: '#ff7355'}}/>
                                                    <Typography variant="body2"
                                                                sx={{ml: 1, fontWeight: 500, color: '#666'}}>
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

                                <Box sx={{mb: 4}}>
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                        sx={{
                                            mb: 1,
                                            fontWeight: 600,
                                            color: '#424242'
                                        }}
                                    >
                                        Şifre
                                    </Typography>
                                    <TextField
                                        type={showPassword ? "text" : "password"}
                                        variant="outlined"
                                        required
                                        fullWidth
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={toggleShowPassword}
                                                        edge="end"
                                                        sx={{color: '#666'}}
                                                    >
                                                        {showPassword ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
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
                                        mt: 1,
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
                                        "Giriş Yap"
                                    )}
                                </Button>
                            </form>

                            {message && (
                                <Typography
                                    variant="body2"
                                    color={message.includes('başarılı') ? 'success.main' : 'error.main'}
                                    sx={{
                                        my: 2,
                                        textAlign: "center",
                                        fontWeight: 500,
                                        padding: "8px",
                                        borderRadius: "8px",
                                        backgroundColor: message.includes('başarılı') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
                                    }}
                                >
                                    {message}
                                </Typography>
                            )}

                            <Divider sx={{my: 3, opacity: 0.6}}/>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    flexDirection: isMobile ? "column" : "row",
                                    alignItems: "center",
                                    gap: 2
                                }}
                            >
                                <Typography
                                    variant="body1"
                                    sx={{
                                        textAlign: isMobile ? "center" : "left",
                                        width: isMobile ? "100%" : "auto"
                                    }}
                                >
                                    <Link
                                        href="/sifremiunuttum"
                                        sx={{
                                            textDecoration: "none",
                                            color: "#ff7355",
                                            fontWeight: 500,
                                            transition: "color 0.2s ease",
                                            "&:hover": {
                                                color: "#fc9e21",
                                                textDecoration: "underline"
                                            }
                                        }}
                                    >
                                        Şifremi Unuttum
                                    </Link>
                                </Typography>

                                <Typography
                                    variant="body1"
                                    sx={{
                                        textAlign: isMobile ? "center" : "right",
                                        width: isMobile ? "100%" : "auto"
                                    }}
                                >
                                    <Link
                                        href="/kayitol"
                                        sx={{
                                            textDecoration: "none",
                                            color: "#ff7355",
                                            fontWeight: 500,
                                            transition: "color 0.2s ease",
                                            "&:hover": {
                                                color: "#fc9e21",
                                                textDecoration: "underline"
                                            }
                                        }}
                                    >
                                        Hesap Oluştur
                                    </Link>
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        </DefaultWithFooter>
    );
}

export default Login;

