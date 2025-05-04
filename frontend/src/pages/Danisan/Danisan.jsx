import React, { useEffect, useState } from 'react';
import './Danisan.css';
import Default from "../../Components/Layouts/Default.jsx";
import Grid2 from '@mui/material/Grid2';
import {Box, Tab, Typography, Avatar, Divider, Paper} from "@mui/material";
import {TabContext, TabList, TabPanel} from '@mui/lab';
import axios from "axios";
import config from "../../config.js";
import {useParams, useNavigate} from "react-router-dom";

export default function Danisan() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [danisan, setDanisan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [value, setValue] = useState('genel');

    useEffect(() => {
        const fetchDanisanInfo = async () => {
            try {
                const response = await axios.get(
                    config[config.environment].apiUrl + "/dietitian/getMyClient",
                    {
                        headers: {
                            Authorization: localStorage.getItem('token'),
                        },
                        params: {
                            client_id: id,
                        },
                    }
                );

                if (!response.data || Object.keys(response.data).length === 0) {
                    throw new Error("Danışan bilgisi bulunamadı");
                }

                const {
                    name,
                    surname,
                    email,
                    phoneNumber,
                    gender,
                    height,
                    weight,
                    status,
                } = response.data;

                setDanisan({ name, surname, email, phoneNumber, gender, height, weight, status });
            } catch (err) {
                console.error("Hata:", err.message);
                navigate('/404');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDanisanInfo();
    }, [id, navigate]);

    //TODO: Geçici çözüm olarak 404 koyduk, arada da loading'e geçiyor. Belki loader yapılabilir ama şimdilik beklemede.
    useEffect(() => {
        if (!isLoading && danisan === null) {
            navigate('/404');
        }
    }, [isLoading, danisan, navigate]);

    if (isLoading) {
        return <Default><Typography>Yükleniyor...</Typography></Default>;
    }

    if (!danisan) {
        return null;
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Default>
            <Grid2 container sx={{ height: '73vh', gap: 2 }}>
                {/* Sol Panel - Danışanın Resmi ve Bilgileri */}
                <Grid2
                    xs={4} sm={4} md={4}
                    sx={{
                        border: '0.01rem solid black',
                        boxShadow: '0px 0.5px 1px',
                        backgroundColor: 'rgba(240,253,240,0.74)',
                        padding: 3
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                        {/* Avatar (Şu an sabit resim kullanabilirsiniz) */}
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Avatar
                                alt={`${danisan.name} ${danisan.surname}`}
                                src={"/placeholder_client.jpg"}
                                sx={{
                                    width: 150,
                                    height: 150,
                                    mb: 2,
                                    border: '2px solid #006E00FF',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            />
                        </Box>
                        <Divider sx={{ width: '100%', mt: "0.5rem", mb: "0.5rem" }} />

                        {/* Danışan Temel Bilgiler */}
                        <Typography variant="h6">
                            {danisan.name} {danisan.surname}
                        </Typography>
                        <Divider sx={{ width: '100%', mt: "0.5rem", mb: "0.5rem" }} />
                        <Typography>E-posta: {danisan.email}</Typography>
                        <Typography>Telefon: {danisan.phoneNumber}</Typography>
                        <Typography>Cinsiyet: {danisan.gender}</Typography>
                        <Typography>Boy: {danisan.height} cm</Typography>
                        <Typography>Kilo: {danisan.weight} kg</Typography>
                        <Typography>Durum: {danisan.status}</Typography>
                    </Box>
                </Grid2>

                {/* Sağ Panel - Tabs ve içerik */}
                <Grid2 xs={6} md={6}>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList
                                onChange={handleChange}
                                aria-label="Danışan Navigasyon"
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                                sx={{
                                    '& .MuiTab-root': {
                                        minWidth: 72,
                                        padding: '6px 12px',
                                        fontSize: '0.875rem',
                                    },
                                }}
                            >
                                <Tab label="Genel" value="genel" />
                                <Tab label="Anamnez" value="anamnez" />
                                <Tab label="Ölçümler" value="olcum" />
                                <Tab label="Beslenme" value="beslenme" />
                                <Tab label="Randevular" value="randevu" />
                                <Tab label="Tarifler" value="tarif" />
                                <Tab label="Egzersizler" value="egzersiz" />
                                <Tab label="Ödemeler" value="odeme" />
                            </TabList>
                        </Box>

                        {/* Genel Sekmesi */}
                        <TabPanel value="genel">
                            <Typography variant="h6" sx={{ fontWeight: 'bold'}}>Genel Bilgiler</Typography>
                            <Box sx={{ padding: 2 }}>
                                <Paper elevation={3} sx={{ padding: 3}}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        Kişisel Bilgiler
                                    </Typography>
                                    <Divider sx={{ marginBottom: 2 }} />
                                    <Grid2 container spacing={2}>
                                        <Grid2 xs={12} sm={6}>
                                            <Typography>
                                                <strong>Adı Soyadı:</strong> {danisan.name} {danisan.surname}
                                            </Typography>
                                            <Typography>
                                                <strong>E-posta:</strong> {danisan.email}
                                            </Typography>
                                            <Typography>
                                                <strong>Telefon:</strong> {danisan.phoneNumber}
                                            </Typography>
                                            <Typography>
                                                <strong>Cinsiyet:</strong> {danisan.gender}
                                            </Typography>
                                            <Typography>
                                                <strong>Boy:</strong> {danisan.height} cm
                                            </Typography>
                                            <Typography>
                                                <strong>Kilo:</strong> {danisan.weight} kg
                                            </Typography>
                                            <Typography>
                                                <strong>Durum:</strong> {danisan.status}
                                            </Typography>
                                        </Grid2>
                                    </Grid2>
                                </Paper>
                            </Box>
                        </TabPanel>

                        {/* Anamnez Sekmesi (Henüz veriniz yoksa boş bırakabilirsiniz) */}
                        <TabPanel value="anamnez">
                            <Typography variant="h6">Anamnez</Typography>
                            <Typography>Henüz anamnez verisi bulunmamaktadır.</Typography>
                        </TabPanel>

                        {/* Ölçüm Takibi Sekmesi */}
                        <TabPanel value="olcum">
                            <Typography variant="h6">Ölçüm Takibi</Typography>
                            <Typography>Ölçümler henüz eklenmemiştir.</Typography>
                        </TabPanel>

                        {/* Beslenme Programı Sekmesi */}
                        <TabPanel value="beslenme">
                            <Typography variant="h6">Beslenme Programı</Typography>
                            <Typography>Henüz beslenme programı eklenmemiştir.</Typography>
                        </TabPanel>

                        {/* Randevular Sekmesi */}
                        <TabPanel value="randevu">
                            <Typography variant="h6">Randevular</Typography>
                            <Typography>Henüz randevu verisi bulunmamaktadır.</Typography>
                        </TabPanel>

                        {/* Tarifler Sekmesi */}
                        <TabPanel value="tarif">
                            <Typography variant="h6">Tarifler</Typography>
                            <Typography>Henüz tarif eklenmemiştir.</Typography>
                        </TabPanel>

                        {/* Egzersiz Takip Sekmesi */}
                        <TabPanel value="egzersiz">
                            <Typography variant="h6">Egzersiz Takip</Typography>
                            <Typography>Henüz egzersiz verisi bulunmamaktadır.</Typography>
                        </TabPanel>

                        {/* Ödeme Takip Sekmesi */}
                        <TabPanel value="odeme">
                            <Typography variant="h6">Ödeme Takip</Typography>
                            <Typography>Henüz ödeme bilgisi bulunmamaktadır.</Typography>
                        </TabPanel>
                    </TabContext>
                </Grid2>
            </Grid2>
        </Default>
    );
}
