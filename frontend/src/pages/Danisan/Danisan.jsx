import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Header from "../../components/Header/Header.jsx";
import Navbar from "../../components/Navbar/Navbar.jsx";
import { PieChart } from '@mui/x-charts/PieChart';
import {
    Grid2 as Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    TextField
} from '@mui/material';
import {CheckCircle, Cancel, Edit, Delete, GroupAdd} from '@mui/icons-material';


export default function Danisan() {
    const [clients, setClients] = useState([]);

    const [open, setOpen] = useState(false);

    // Yeni Danışan
    const openCreatePopup = () => {
        setOpen(true);
    };

    const closeCreatePopup = () => {
        setOpen(false);
    };

    const submitCreatePopup = (e) => {
        e.preventDefault();
        console.log("Form submitted");
        closeCreatePopup();
    };

    // API'den veri çekme
    useEffect(() => {
        axios.get('http://localhost:3000/dietitian/getAllMyClients')
            .then(response => {
                setClients(response.data); // API'den gelen veriyi state'e set ediyoruz
            })
            .catch(error => {
                console.error('Error fetching clients:', error);
            });
    }, []);

    return (
        <>
            <Header/>
            <Navbar/>
            <Grid container spacing={2}>
                <Grid sx={{ display: "flex" }} size={12}>
                    <Grid size={3}>
                        <PieChart
                            series={[
                                {
                                    data: [
                                        { id: 0, value: 10, label: 'Erkek' },
                                        { id: 1, value: 15, label: 'Kadın' },
                                        { id: 2, value: 20, label: 'Belirsiz' },
                                    ],
                                },
                            ]}
                        />
                    </Grid>
                    <Grid size={3}>
                        <PieChart
                            colors={['red', 'blue', 'green']}
                            series={[
                                {
                                    data: [
                                        { id: 0, value: 10, label: 'Erkek' },
                                        { id: 1, value: 15, label: 'Kadın' },
                                        { id: 2, value: 20, label: 'Belirsiz' },
                                    ],

                                    highlightScope: { fade: 'global', highlight: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                },
                            ]}
                        />
                    </Grid>
                    <Grid size={3}>
                        <PieChart
                            colors={['blue', 'pink', 'green']}
                            series={[
                                {
                                    data: [
                                        { id: 0, value: 10, label: 'Erkek' },
                                        { id: 1, value: 15, label: 'Kadın' },
                                        { id: 2, value: 20, label: 'Belirsiz' },
                                    ],

                                    highlightScope: { fade: 'global', highlight: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                },
                            ]}
                        />
                    </Grid>
                    <Grid size={3}>
                        <PieChart
                            series={[
                                {
                                    data: [
                                        { id: 0, value: 10, label: 'Erkek' },
                                        { id: 1, value: 15, label: 'Kadın' },
                                        { id: 2, value: 20, label: 'Belirsiz' },
                                    ],
                                },
                            ]}
                            width={400}
                            height={200}
                        />
                    </Grid>
                </Grid>
                    <Grid size={12}>
                        <Button
                            sx={{marginRight: 1}}
                            variant="outlined"
                            color="primary"
                            startIcon={<GroupAdd/>}
                            onClick={openCreatePopup}
                        >
                            Danışan Ekle
                        </Button>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#000'}}>İsim</TableCell>
                                        <TableCell sx={{fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#000'}}>Soyad</TableCell>
                                        <TableCell sx={{fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#000'}}>Yaş</TableCell>
                                        <TableCell sx={{fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#000'}}>Mail</TableCell>
                                        <TableCell sx={{fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#000'}}>Telefon Numarası</TableCell>
                                        <TableCell sx={{fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#000'}}>Durum</TableCell>
                                        <TableCell sx={{fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#000'}}>İşlemler</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        clients.map(client =>
                                            (
                                                <TableRow key={client.id}>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>-</TableCell>
                                                    <TableCell>{client.email}</TableCell>
                                                    <TableCell>{client.phoneNumber}</TableCell>
                                                    <TableCell>
                                                        {
                                                            client.status === "true" ? (
                                                                <CheckCircle style={{color: 'green'}}/>
                                                            ) : (
                                                                <Cancel style={{color: 'red'}}/>
                                                            )
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            sx={{marginRight: 1}}
                                                            variant="outlined"
                                                            color="primary"
                                                            startIcon={<Edit/>}
                                                        >
                                                            Düzenle
                                                        </Button>
                                                        <Button
                                                            sx={{marginRight: 1}}
                                                            variant="outlined"
                                                            color="warning"
                                                            startIcon={<Cancel/>}
                                                        >
                                                            Inaktif Yap
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            startIcon={<Delete/>}
                                                        >
                                                            Sil
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
            </Grid>

            {/* Create Popup */}
            <Dialog open={open} onClose={closeCreatePopup}>
                <DialogTitle>Yeni Danışan Oluştur</DialogTitle>
                <form onSubmit={submitCreatePopup}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Adınız"
                            type="text"
                            fullWidth
                            variant="outlined"
                            required
                        />
                        <TextField
                            margin="dense"
                            id="email"
                            label="E-posta"
                            type="email"
                            fullWidth
                            variant="outlined"
                            required
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button type="submit" color="primary" variant="contained">
                            Oluştur
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}
