import React from 'react';
import './ForgotPassword.css'
import {Box, Paper, Avatar, Typography, Button, Link, TextField} from "@mui/material";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { green } from "@mui/material/colors";

function ForgotPassword() {
    return (
        <>
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
                    <Avatar sx={{ bgcolor: green[500], mb: 2 }}>
                        <QuestionMarkIcon />
                    </Avatar>
                    <Typography variant="h5" gutterBottom>
                        Şifremi Unuttum?
                    </Typography>
                    <TextField
                        label="E-posta"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{
                            backgroundColor: green[500],
                            "&:hover": { backgroundColor: green[700] },
                        }}
                    >
                        Parolamı Sıfırla
                    </Button>
                </Paper>
            </Box>
        </>
    );
}

export default ForgotPassword;