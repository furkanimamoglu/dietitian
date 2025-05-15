import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import config from "../../config.js";
import {
    Avatar,
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    Container,
    InputAdornment,
    IconButton,
    Divider,
    CircularProgress,
    Tab,
    Tabs,
    Link
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DefaultWithFooter from "../../Components/Layouts/DefaultWithFooter.jsx";

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('danisan');
    const navigate = useNavigate();

    const handleUserTypeChange = (event, newValue) => {
        if (newValue !== null) {
            setUserType(newValue);
        }
    };

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;
        // Remove non-digit characters
        const digitsOnly = value.replace(/\D/g, '');
        setPhone(digitsOnly);
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
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
        
        fetch(config[config.environment].apiUrl + "dietitian/register", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
                setMessage('Kayıt işlemi başarılı. Giriş sayfasına yönlendiriliyorsunuz...');
                setTimeout(() => navigate('/login'), 2000);
            })
            .catch(error => {
                console.error('Exception:', error);
                setMessage('Hata: Bir sorun oluştu, teknik ekip ile görüşün.');
                setLoading(false);
            });
    };

    return (
        <DefaultWithFooter>
            <Container component="main" maxWidth="xs" className="register-container">
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "linear-gradient(to right bottom, #ffffff, #f9f9f9)",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                        mt: 8,
                        mb: 8
                    }}
                >
                    <Avatar sx={{ 
                        width: 56, 
                        height: 56, 
                        mb: 2, 
                        background: "linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)",
                        boxShadow: "0 3px 5px 2px rgba(76, 175, 80, .3)" 
                    }}>
                        <LockOutlinedIcon fontSize="large" />
                    </Avatar>
                    
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: "500" }}>
                        Kayıt Ol
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Yeni bir hesap oluşturun
                    </Typography>
                    
                    <Tabs
                        value={userType}
                        onChange={handleUserTypeChange}
                        variant="fullWidth"
                        sx={{ 
                            mb: 3, 
                            width: '100%',
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#2E7D32',
                            },
                        }}
                    >
                        <Tab 
                            value="danisan" 
                            label="Danışan" 
                            sx={{
                                '&.Mui-selected': {
                                    color: '#2E7D32',
                                    fontWeight: 'bold',
                                }
                            }}
                        />
                        <Tab 
                            value="diyetisyen" 
                            label="Diyetisyen"
                            sx={{
                                '&.Mui-selected': {
                                    color: '#2E7D32',
                                    fontWeight: 'bold',
                                }
                            }}
                        />
                    </Tabs>
                    
                    <Divider flexItem sx={{ width: "100%", mb: 3 }} />
                    
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <TextField
                            label="Kullanıcı Adı"
                            variant="outlined"
                            fullWidth
                            required
                            sx={{ mb: 3 }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon color="action" />
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
                            sx={{ mb: 3 }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        
                        <TextField
                            label="Telefon Numarası"
                            variant="outlined"
                            fullWidth
                            required
                            sx={{ mb: 3 }}
                            value={phone}
                            onChange={handlePhoneNumberChange}
                            placeholder="5XXXXXXXXX"
                            inputProps={{ maxLength: 10 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIcon color="action" />
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
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
                            sx={{ mb: 3 }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={toggleShowPassword} edge="end">
                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                                background: "linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)",
                                boxShadow: "0 3px 5px 2px rgba(76, 175, 80, .3)",
                                borderRadius: "30px",
                                textTransform: "none",
                                fontSize: "1rem",
                                fontWeight: "bold"
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Kayıt Ol"}
                        </Button>
                    </form>
                    
                    {message && (
                        <Typography
                            variant="body2"
                            color={message.includes('başarılı') ? 'success.main' : 'error.main'}
                            sx={{ my: 2, textAlign: "center", fontWeight: "medium" }}
                        >
                            {message}
                        </Typography>
                    )}
                    
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Zaten hesabınız var mı?{' '}
                        <Link href="/login" sx={{ textDecoration: "none", color: "primary.main", fontWeight: "medium" }}>
                            Giriş Yap
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </DefaultWithFooter>
    );
}

export default Register;