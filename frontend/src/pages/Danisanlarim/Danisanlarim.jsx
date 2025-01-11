import React, {useEffect, useState} from 'react';
import axios from 'axios';
import './Danisanlarim.css';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2 as Grid, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {Cancel, CheckCircle, Delete, Edit, GroupAdd} from '@mui/icons-material';
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import {green, red, blue, pink} from "@mui/material/colors";
import Default from "../../components/Layouts/Default.jsx";

const rows = [
    {
        id: 1,
        name: "furkimClient",
        surname: "furkimClient",
        email: "furkimClient@gmail.com",
        phoneNumber: "05075280653",
        height: 170,
        weight: 200,
        status: "aktif",
        gender: "K"
    },
    {
        id: 2,
        name: "tester31",
        surname: "furkimClient",
        email: "tester31@gmail.com",
        phoneNumber: "05075280653",
        height: 170,
        weight: 200,
        status: "aktif",
        gender: "E",
    },
    {
        id: 3,
        name: "tester31",
        surname: "furkimClient",
        email: "tester31@gmail.com",
        phoneNumber: "05075280653",
        height: 170,
        weight: 200,
        status: "inaktif",
        gender: "E",
    },
];


const columns = [
    { field: "id", headerName: "ID", width: 50 },
    { field: "name", headerName: "İsim", width: 150, editable: true},
    { field: "surname", headerName: "Soyisim", width: 150, editable: true },
    { field: "email", headerName: "Email", width: 200, editable: true },
    { field: "phoneNumber", headerName: "Telefon No", width: 120, editable: true  },
    { field: "height", headerName: "Boy", editable: true  },
    { field: "weight", headerName: "Kilo", editable: true  },
    {
        field: "status",
        headerName: "Durum",
        editable: true,
        type: 'singleSelect',
        valueOptions: ["aktif", "inaktif"],
        renderCell: (params) => (
            params.value === "aktif" ? (
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                }}>
                    <CheckCircle sx={{}} style={{ color: green[500] }} />
                </Box>
            ) : params.value === "inaktif" ? (
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                }}>
                    <Cancel style={{ color: red[500] }} />
                </Box>
            ) : null
        ),
    },
    {
        field: "gender",
        headerName: "Cinsiyet",
        type: 'singleSelect',
        valueOptions: ['Erkek', 'Kadın'],
        editable: true,
        renderCell: (params) => (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                }}
            >
                {
                    params.value === "E" ? (
                        <MaleIcon style={{ color: blue[500] }} />
                    ) : params.value === "K" ? (
                        <FemaleIcon style={{ color: pink[500] }} />
                    ) : null
                }
            </Box>
        ),
    },
];


export default function Danisanlarim() {
    const [open, setOpen] = useState(false);

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


    useEffect(() => {
        axios.get(  'http://localhost:3000/dietitian/getAllMyClients')
            .then(response => {
                setClients(response.data); // API'den gelen veriyi state'e set ediyoruz
            })
            .catch(error => {
                console.error('Error fetching clients:', error);
            });
    }, []);

    return (
        <Default>
            <Grid container spacing={2}>
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
                    <DataGrid rows={rows} columns={columns} pageSize={5} editable: true />
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
        </Default>
    );
}
