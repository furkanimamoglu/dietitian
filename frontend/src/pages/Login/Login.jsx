import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './Login.css';
import config from "../../config.js";
import {Avatar, Box, Button, Link, Paper, TextField, Typography} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {green} from "@mui/material/colors";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch(config[config.environment].apiUrl + "/dietitian/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Kullanıcı adı veya şifre yanlış.');
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
            });
    };

    return (
        <Box
            sx={{
                height: "94vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: green[50],
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    width: 300,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Avatar sx={{bgcolor: green[500], mb: 2}}>
                    <LockOutlinedIcon/>
                </Avatar>
                <Typography variant="h5" gutterBottom>
                    Diyetisyen Girişi
                </Typography>
                <form onSubmit={handleSubmit} style={{width: '100%'}}>
                    <TextField
                        label="Kullanıcı adı"
                        variant="outlined"
                        fullWidth
                        sx={{mb: 2}}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Şifre"
                        type="password"
                        variant="outlined"
                        fullWidth
                        sx={{mb: 2}}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                            backgroundColor: green[500],
                            "&:hover": {backgroundColor: green[700]},
                        }}
                    >
                        Giriş Yap
                    </Button>
                </form>
                {message && (
                    <Typography
                        variant="body2"
                        color={message.includes('başarılı') ? 'green' : 'red'}
                        sx={{mt: 2}}
                    >
                        {message}
                    </Typography>
                )}
                <Typography variant="body2" sx={{mt: 2}}>
                    <Link href="/forgotpassword">
                        Şifrenizi mi unuttunuz?
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
}

export default Login;