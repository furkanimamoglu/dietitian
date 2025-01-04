import React from 'react';
import './Danisan.css';
import Default from "../../components/Layouts/Default.jsx";
import Grid2 from '@mui/material/Grid2';
import {Box, Tab, Typography, Avatar, Divider, Paper} from "@mui/material";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

const DanisanInfo = {
    id: 1,
    name: "Ahmet Yılmaz",
    age: 30,
    gender: "Erkek",
    height: 175,
    weight: 75,
    notes: "Düşük karbonhidrat diyeti uyguluyor.",
    imageUrl: "/placeholder_client.jpg"
};

const DanisanAnamnez = {
    id: 1,
    name: "Ahmet Yılmaz",
    age: 30,
    gender: "Erkek",
    height: 175,
    weight: 75,
    notes: "Düşük karbonhidrat diyeti uyguluyor.",
    imageUrl: "/placeholder_client.jpg",
    anamnez: {
        smoking: "Hayır",
        alcoholConsumption: "Bazen",
        physicalActivity: "Orta seviyede",
        medicalHistory: "Yüksek tansiyon geçmişi var",
        currentMedications: "Hiçbir ilaç kullanmıyor",
        allergies: "Hiçbir alerjisi yok",
        surgeries: "Apandisit ameliyatı oldu",
        familyMedicalHistory: "Babasının kalp rahatsızlığı var",
        stressLevel: "Orta",
        sleepPattern: "Günde 7 saat uyuyor",
        dietHistory: "Daha önce vejetaryen diyeti uygulamış"
    }
};


export default function Danisan() {
    const [value, setValue] = React.useState('genel');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Default>
            <Grid2 container sx={{ height: '73vh', gap: 2 }}>
                {/* Sol Panel - Danışanın Resmi ve Bilgileri */}
                <Grid2 xs={4} sm={4} md={4} sx={{ border: '0.01rem solid black', boxShadow: '0px 0.5px 1px', backgroundColor: 'rgba(240,253,240,0.74)', padding: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                        {/* Avatar centered */}
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Avatar alt={DanisanInfo.name} src={DanisanInfo.imageUrl} sx={{
                                width: 150,
                                height: 150,
                                mb: 2,
                                border: '2px solid #006E00FF',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(1.05)' // Hover efekti
                                }
                            }}
                            />
                        </Box>
                        <Divider sx={{ width: '100%', mt: "0.5rem", mb: "0.5rem" }} />
                        {/* Rest of the content aligned to the left */}
                        <Typography variant="h6">{DanisanInfo.name}</Typography>
                        <Divider sx={{ width: '100%', mt: "0.5rem", mb: "0.5rem" }} />
                        <Typography>Yaş: {DanisanInfo.age}</Typography>
                        <Typography>Cinsiyet: {DanisanInfo.gender}</Typography>
                        <Typography>Boy: {DanisanInfo.height} cm</Typography>
                        <Typography>Kilo: {DanisanInfo.weight} kg</Typography>
                        <Typography>Notlar: {DanisanInfo.notes}</Typography>
                    </Box>
                </Grid2>



                {/* Sağ Panel - Tabs ve içerik */}
                <Grid2 xs={6} md={6}> {/* TODO: Grid2 için ayarlamasını yap */}
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="Danışan Navigasyon">
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
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Kişisel Bilgiler</Typography>
                                    <Divider sx={{ marginBottom: 2 }} />
                                    <Grid2 container spacing={2}>
                                        <Grid2 xs={12} sm={6}>
                                            <Typography><strong>Adı:</strong> {DanisanAnamnez.name}</Typography>
                                            <Typography><strong>Yaş:</strong> {DanisanAnamnez.age}</Typography>
                                            <Typography><strong>Cinsiyet:</strong> {DanisanAnamnez.gender}</Typography>
                                            <Typography><strong>Boy:</strong> {DanisanAnamnez.height} cm</Typography>
                                            <Typography><strong>Kilo:</strong> {DanisanAnamnez.weight} kg</Typography>
                                            <Typography><strong>Notlar:</strong> {DanisanAnamnez.notes}</Typography>
                                        </Grid2>
                                    </Grid2>
                                </Paper>

                                <Paper elevation={3} sx={{ padding: 3}}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Sağlık Durumu</Typography>
                                    <Divider sx={{ marginBottom: 2 }} />
                                    <Grid2 container spacing={2}>
                                        <Grid2 xs={12} sm={6}>
                                            <Typography><strong>Sigaraya Başlama Durumu:</strong> {DanisanAnamnez.anamnez.smoking}</Typography>
                                            <Typography><strong>Alkol Tüketimi:</strong> {DanisanAnamnez.anamnez.alcoholConsumption}</Typography>
                                            <Typography><strong>Fiziksel Aktivite:</strong> {DanisanAnamnez.anamnez.physicalActivity}</Typography>
                                            <Typography><strong>Tıbbi Geçmiş:</strong> {DanisanAnamnez.anamnez.medicalHistory}</Typography>
                                            <Typography><strong>Mevcut İlaç Kullanımı:</strong> {DanisanAnamnez.anamnez.currentMedications}</Typography>
                                            <Typography><strong>Alerjiler:</strong> {DanisanAnamnez.anamnez.allergies}</Typography>
                                        </Grid2>
                                        <Grid2 xs={12} sm={6}>
                                            <Typography><strong>Geçirilmiş Ameliyatlar:</strong> {DanisanAnamnez.anamnez.surgeries}</Typography>
                                            <Typography><strong>Aile Tıbbi Geçmişi:</strong> {DanisanAnamnez.anamnez.familyMedicalHistory}</Typography>
                                            <Typography><strong>Stres Seviyesi:</strong> {DanisanAnamnez.anamnez.stressLevel}</Typography>
                                            <Typography><strong>Uyku Düzeni:</strong> {DanisanAnamnez.anamnez.sleepPattern}</Typography>
                                            <Typography><strong>Beslenme Geçmişi:</strong> {DanisanAnamnez.anamnez.dietHistory}</Typography>
                                        </Grid2>
                                    </Grid2>
                                </Paper>
                            </Box>
                        </TabPanel>

                        {/* Anamnez Sekmesi */}
                        <TabPanel value="anamnez">
                            <Typography variant="h6">Anamnez</Typography>
                        </TabPanel>

                        {/* Ölçüm Takibi Sekmesi */}
                        <TabPanel value="olcum">
                            <Typography variant="h6">Ölçüm Takibi</Typography>
                            <Typography>Ölçümler henüz eklenmemiştir.</Typography>
                        </TabPanel>

                        {/* Beslenme Programı Sekmesi */}
                        <TabPanel value="beslenme">
                            <Typography variant="h6">Beslenme Programı</Typography>
                        </TabPanel>

                        {/* Randevular Sekmesi */}
                        <TabPanel value="randevu">
                            <Typography variant="h6">Randevular</Typography>
                        </TabPanel>

                        {/* Tarifler Sekmesi */}
                        <TabPanel value="tarif">
                            <Typography variant="h6">Tarifler</Typography>
                        </TabPanel>

                        {/* Egzersiz Takip Sekmesi */}
                        <TabPanel value="egzersiz">
                            <Typography variant="h6">Egzersiz Takip</Typography>
                        </TabPanel>

                        {/* Ödeme Takip Sekmesi */}
                        <TabPanel value="odeme">
                            <Typography variant="h6">Ödeme Takip</Typography>
                        </TabPanel>
                    </TabContext>
                </Grid2>
            </Grid2>
        </Default>
    );
}
