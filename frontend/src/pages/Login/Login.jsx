import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import config from "../../config.js";
import {
  Avatar,
  Box,
  Button,
  Link,
  Paper,
  TextField,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress
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
    const navigate = useNavigate();

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;
        // Remove non-digit characters
        const digitsOnly = value.replace(/\D/g, '');
        setPhoneNumber(digitsOnly);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Validate phone number format
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
                setTimeout(() => navigate('/dashboard'), 2000);
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
            <Container component="main" maxWidth="xs" className="login-container">
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
                        Giriş Yap
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Hesabınıza erişim için giriş yapın
                    </Typography>
                    
                    <Divider flexItem sx={{ width: "100%", mb: 3 }} />
                    
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <TextField
                            label="Telefon Numarası"
                            variant="outlined"
                            fullWidth
                            required
                            sx={{ mb: 3 }}
                            value={phoneNumber}
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
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Giriş Yap"}
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
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", mt: 1 }}>
                        <Typography variant="body2">
                            <Link href="/forgotpassword" sx={{ textDecoration: "none", color: "primary.main" }}>
                                Şifremi Unuttum
                            </Link>
                        </Typography>
                        
                        <Typography variant="body2">
                            <Link href="/register" sx={{ textDecoration: "none", color: "primary.main" }}>
                                Hesap Oluştur
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </DefaultWithFooter>
    );
}

export default Login;