import React from 'react';
import './ExceptionPage.css';
import green from "@mui/material/colors/green";
import {Box, Button, Paper, Typography} from "@mui/material";
import DefaultExcept from "../../Components/Layouts/DefaultExcept.jsx";

const errorMessages = {
    400: {
        title: "400 - Kötü İstek",
        message: "Yapmak istediğiniz işlem anlaşılamadı ya da eksik parametreler gönderildi. Lütfen tekrar deneyin.",
    },
    401: {
        title: "401 - Yetkisiz Erişim",
        message: "Bu kaynağa erişim yetkiniz yok. Lütfen giriş yapın ve tekrar deneyin.",
    },
    403: {
        title: "403 - Yasaklı Erişim",
        message: "Bu kaynağa erişiminiz yasaklandı. Lütfen ilgili izinlere sahip olduğunuzdan emin olun.",
        isBackButton: true,
    },
    404: {
        title: "404 - Sanırım kayboldun!",
        message: "Aradığınız sayfa ne yazık ki bulunamadı. Aşağıda ki buton sizi buradan kurtaracak.",
        isBackButton: true,
    },
    500: {
        title: "500 - İç Sunucu Hatası",
        message: "Bir hata oluştu. Sunucu üzerinde beklenmedik bir durum meydana geldi. Lütfen birazdan tekrar deneyin.",
    },
    502: {
        title: "502 - Geçersiz Ağ Geçidi",
        message: "Sunucu, üst sunucudan geçerli bir yanıt alamadı. Lütfen daha sonra tekrar deneyin.",
    },
    503: {
        title: "503 - Hizmet Kullanılamıyor",
        message: "Sunucu şu anda meşgul ya da kapalı. Lütfen biraz sonra tekrar deneyin, sağlıklı bir şekilde hizmet almak için çalışıyoruz.",
    },
    504: {
        title: "504 - Ağ Geçidi Zaman Aşımı",
        message: "Sunucu zamanında yanıt alamadı. Lütfen tekrar deneyin, bir aksaklık olmuş olabilir.",
    },
};

export default function ExceptionPage(statusCode) {
    const error = errorMessages[statusCode] || {
        title: `${statusCode} Error`,
        message: "An unexpected error occurred. Please try again later.",
    };

    return (
        <DefaultExcept>
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
                        width: 600,
                        padding: 4,
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        backgroundColor: green[100],
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h4" sx={{textAlign: "center", fontWeight: "bold", color: green[600], mb: 2}}>
                        {error.title}
                    </Typography>
                    <Typography sx={{textAlign: "center", color: "gray", mb: 4}}>
                        {error.message}
                    </Typography>
                    {error.isBackButton && (
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{
                                padding: "10px 20px",
                                borderRadius: 5,
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: green[600],
                                },
                            }}
                            onClick={() => window.history.back()}
                        >
                            Geri Dön
                        </Button>
                    )}
                </Paper>
            </Box>
        </DefaultExcept>
    );
}
