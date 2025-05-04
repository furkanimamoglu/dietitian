import React, {useState} from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import './Register.css'
import config from "../../config.js";
import {Avatar, Box, Button, Paper, TextField, Typography} from "@mui/material";
import {green} from "@mui/material/colors";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DefaultWithFooter from "../../Components/Layouts/DefaultWithFooter.jsx";

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [alignment, setAlignment] = React.useState('danisan');

    const handleChange = (event, newAlignment) => {
        setAlignment(newAlignment);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(config[config.environment].apiUrl + "dietitian/register", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                email: email,
                phone: phone
            }),
        })
            .then(data => {
                if (data) {
                    setMessage('Kayıt olma işlemi başarılı.');
                } else {
                    setMessage('Kullanıcı adı veya şifre yanlış.');
                }
            })
            .catch(error => {
                console.error('Exception:', error);
                setMessage('Hata: Bir sorun oluştu, teknik ekip ile görüşün.');
            });
    };

    return (
        <DefaultWithFooter>
            <Box
                sx={{
                    height: "100vh",
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
                    <Avatar sx={{bgcolor: green[500], justifyContent: "center", mb: 2}}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography variant="h5" gutterBottom>
                        Kayıt Ol
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <ToggleButtonGroup
                            color="primary"
                            value={alignment}
                            exclusive
                            onChange={handleChange}
                            aria-label="Üye Tipi:"
                        >
                            <ToggleButton value="danisan">Danışan</ToggleButton>
                            <ToggleButton value="diyetisyen">Diyetisyen</ToggleButton>
                        </ToggleButtonGroup>
                        <TextField
                            label="Kullanıcı adı"
                            variant="outlined"
                            fullWidth
                            sx={{mb: 2}}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            label="E-Mail"
                            variant="outlined"
                            fullWidth
                            sx={{mb: 2}}
                            value={username}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            label="Telefon:"
                            variant="outlined"
                            fullWidth
                            sx={{mb: 2}}
                            value={username}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <TextField
                            label="Şifre"
                            variant="outlined"
                            fullWidth
                            sx={{mb: 2}}
                            value={username}
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
                            Kayıt Ol
                        </Button>
                    </form>
                </Paper>
            </Box>
        </DefaultWithFooter>
    );
}

export default Register;