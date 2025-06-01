import React, {useState} from 'react';
import './ForgotPassword.css';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    InputAdornment,
    Link,
    Paper,
    TextField,
    Typography
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

        // Implement password reset functionality here
        setTimeout(() => {
            setMessage('Şifre sıfırlama bağlantısı telefonunuza gönderildi.');
            setLoading(false);
        }, 1500);
    };

    return (
        <DefaultWithFooter>
            <Box className="forgot-password-page">
                <Box className="header-banner">
                    <Typography variant="h3" className="header-title">
                        Şifrenizi mi Unuttunuz?
                    </Typography>
                    <Typography variant="h4" className="header-subtitle">
                        Endişelenmeyin, Yardımcı Oluyoruz
                    </Typography>
                </Box>

                <Container component="main" maxWidth="xs" className="forgot-password-container">
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
                            mt: 4,
                            mb: 8,
                            position: "relative",
                            zIndex: 1
                        }}
                    >
                        <Avatar sx={{
                            width: 56,
                            height: 56,
                            mb: 2,
                            background: "linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)",
                            boxShadow: "0 3px 5px 2px rgba(76, 175, 80, .3)"
                        }}>
                            <LockResetIcon fontSize="large"/>
                        </Avatar>

                        <Typography variant="h4" gutterBottom sx={{fontWeight: "500"}}>
                            Şifremi Unuttum
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{mb: 3, textAlign: "center"}}>
                            Şifrenizi sıfırlamak için telefon numaranızı girin
                        </Typography>

                        <Divider flexItem sx={{width: "100%", mb: 3}}/>

                        <form onSubmit={handleSubmit} style={{width: '100%'}}>
                            <TextField
                                label="Telefon Numarası"
                                variant="outlined"
                                fullWidth
                                required
                                sx={{mb: 3}}
                                value={phoneNumber}
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
                                {loading ? <CircularProgress size={24} color="inherit"/> : "Şifremi Sıfırla"}
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
                            <Link href="/app/girisyap"
                                  sx={{textDecoration: "none", color: "primary.main", fontWeight: "medium"}}>
                                Giriş sayfasına dön
                            </Link>
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        </DefaultWithFooter>
    );
}

export default ForgotPassword;