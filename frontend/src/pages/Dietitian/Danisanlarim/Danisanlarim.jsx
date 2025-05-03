import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Danisanlarim.css";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid2,
    TextField,
    Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Cancel, CheckCircle, GroupAdd, Visibility, Delete } from "@mui/icons-material";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import { green, red, blue, pink } from "@mui/material/colors";
import Default from "../../../components/Layouts/Default.jsx";
import config from "../../../config.js";
import { useNavigate } from "react-router-dom";

export default function Danisanlarim() {
    const [open, setOpen] = useState(false);
    const [clients, setClients] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

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
        axios
            .get(config[config.environment].apiUrl + "/dietitian/getAllMyClients", {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((response) => {
                setClients(response.data);
            })
            .catch((error) => {
                console.error("Error fetching clients:", error);
            });
    }, []);

    const handleRowUpdate = async (updatedRow, originalRow) => {
        try {
            const response = await axios.put(
                config[config.environment].apiUrl + "/dietitian/updateClient",
                updatedRow,
                {
                    headers: {
                        Authorization: localStorage.getItem("token"),
                    },
                }
            );

            console.log("Güncelleme başarılı:", response.data);

            return response.data;
        } catch (error) {
            console.error("Güncelleme hatası:", error);
            return originalRow;
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(config[config.environment].apiUrl + "/dietitian/deleteClient", {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
                data: {
                    client_id: id,
                },
            });
            setClients((prev) => prev.filter((client) => client.id !== id));
            console.log("Silme işlemi başarılı");
        } catch (error) {
            console.error("Silme işlemi hatası:", error);
        }
    };

    const confirmDelete = (client) => {
        setSelectedClient(client); // Silinecek danışanı kaydet
        setDeleteDialogOpen(true); // Onay penceresini aç
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false); // Onay penceresini kapat
        setSelectedClient(null); // Seçili danışanı temizle
    };

    const confirmDeleteAction = () => {
        if (selectedClient) {
            handleDelete(selectedClient.id);
        }
        setDeleteDialogOpen(false); // Onay penceresini kapat
        setSelectedClient(null); // Seçili danışanı temizle
    };

    const columns = [
        { field: "id", headerName: "ID", width: 50 },
        { field: "name", headerName: "İsim", width: 150, editable: true },
        { field: "surname", headerName: "Soyisim", width: 150, editable: true },
        { field: "email", headerName: "Email", width: 200, editable: true },
        { field: "phoneNumber", headerName: "Telefon No", width: 120, editable: true },
        { field: "height", headerName: "Boy", width: 25, editable: true },
        { field: "weight", headerName: "Kilo", width: 25, editable: true },
        {
            field: "status",
            headerName: "Durum",
            editable: true,
            type: "singleSelect",
            valueOptions: ["aktif", "inaktif"],
            renderCell: (params) =>
                params.value === "aktif" ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <CheckCircle sx={{}} style={{ color: green[500] }} />
                    </Box>
                ) : params.value === "inaktif" ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <Cancel style={{ color: red[500] }} />
                    </Box>
                ) : null,
        },
        {
            field: "gender",
            headerName: "Cinsiyet",
            type: "singleSelect",
            valueOptions: ["Erkek", "Kadın"],
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
                    {params.value === "Erkek" ? (
                        <MaleIcon style={{ color: blue[500] }} />
                    ) : params.value === "Kadın" ? (
                        <FemaleIcon style={{ color: pink[500] }} />
                    ) : null}
                </Box>
            ),
        },
        {
            field: "actions",
            headerName: "İşlemler",
            width: 150,
            renderCell: (params) => {
                const navigate = useNavigate();
                return (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate(`/diyetisyen/danisan/${params.row.id}`)}
                        >
                            <Visibility />
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => confirmDelete(params.row)}
                        >
                            <Delete />
                        </Button>
                    </Box>
                );
            },
        },
    ];

    return (
        <Default>
            <Grid2 container spacing={2}>
                <Grid2 size={12}>
                    <Button
                        sx={{ marginRight: 1 }}
                        variant="outlined"
                        color="primary"
                        startIcon={<GroupAdd />}
                        onClick={openCreatePopup}
                    >
                        Danışan Ekle
                    </Button>
                    <DataGrid
                        rows={clients}
                        columns={columns}
                        pageSize={5}
                        editable
                        processRowUpdate={(updatedRow, originalRow) => handleRowUpdate(updatedRow, originalRow)}
                        onProcessRowUpdateError={(error) => console.error("Hata:", error)}
                    />
                </Grid2>
            </Grid2>
            {/* TODO: Danışanı silerken, name yok olduktan sonra popup kapanıyor. Direkt kapatsın veya ismi ekran kapanana kadar gitmesin. */}
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
                <DialogTitle>Silme Onayı</DialogTitle>
                <DialogContent>
                    <Typography>
                        {selectedClient?.name} danışanınızı silmeyi onaylıyor musunuz?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} color="secondary" variant="outlined">
                        Vazgeç
                    </Button>
                    <Button onClick={confirmDeleteAction} color="error" variant="contained">
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>

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
