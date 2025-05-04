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
import {
    Cancel,
    CheckCircle,
    GroupAdd,
    Visibility,
    Delete,
} from "@mui/icons-material";
import QrCodeIcon from "@mui/icons-material/QrCode";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import { green, red, blue, pink } from "@mui/material/colors";
import Default from "../../Components/Layouts/Default.jsx";
import config from "../../config.js";
import { useNavigate } from "react-router-dom";

export default function Danisanlarim() {
    const [open, setOpen] = useState(false);
    const [clients, setClients] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    // QR dialog state
    const [qrOpen, setQrOpen] = useState(false);
    const [qrData, setQrData] = useState(null);

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
                headers: { Authorization: localStorage.getItem("token") },
            })
            .then((res) => setClients(res.data))
            .catch((err) => console.error("Error fetching clients:", err));
    }, []);

    const handleRowUpdate = async (updatedRow, originalRow) => {
        try {
            const res = await axios.put(
                config[config.environment].apiUrl + "/dietitian/updateClient",
                updatedRow,
                { headers: { Authorization: localStorage.getItem("token") } }
            );
            console.log("Güncelleme başarılı:", res.data);
            return res.data;
        } catch (err) {
            console.error("Güncelleme hatası:", err);
            return originalRow;
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(
                config[config.environment].apiUrl + "/dietitian/deleteClient",
                {
                    headers: { Authorization: localStorage.getItem("token") },
                    data: { client_id: id },
                }
            );
            setClients((prev) => prev.filter((c) => c.id !== id));
            console.log("Silme işlemi başarılı");
        } catch (err) {
            console.error("Silme işlemi hatası:", err);
        }
    };

    const confirmDelete = (client) => {
        setSelectedClient(client);
        setDeleteDialogOpen(true);
    };
    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setSelectedClient(null);
    };
    const confirmDeleteAction = () => {
        if (selectedClient) handleDelete(selectedClient.id);
        setDeleteDialogOpen(false);
        setSelectedClient(null);
    };

    // Fetch QR and open dialog
    const showQR = async () => {
        try {
            const { data } = await axios.get(
                config[config.environment].apiUrl + "/dietitian/getDietitianQR",
                { headers: { Authorization: localStorage.getItem("token") } }
            );
            setQrData(data.qrData);
            setQrOpen(true);
        } catch (err) {
            console.error("QR fetch hatası:", err);
        }
    };
    const closeQR = () => {
        setQrOpen(false);
        setQrData(null);
    };

    // Print only the QR
    const handlePrint = () => {
        if (!qrData) return;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
      <html>
        <head><title>QR Yazdır</title></head>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">
          <img src="${qrData}" alt="QR Kod"/>
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
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
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
                        <CheckCircle style={{ color: green[500] }} />
                    </Box>
                ) : params.value === "inaktif" ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
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
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
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
                        <Button variant="outlined" color="error" onClick={() => confirmDelete(params.row)}>
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
                <Grid2 xs={12}>
                    <Button
                        sx={{ marginRight: 1 }}
                        variant="outlined"
                        color="primary"
                        startIcon={<GroupAdd />}
                        onClick={openCreatePopup}
                    >
                        Danışan Ekle
                    </Button>
                    <Button
                        sx={{ marginRight: 1 }}
                        variant="outlined"
                        color="primary"
                        startIcon={<QrCodeIcon />}
                        onClick={showQR}
                    >
                        QR’ımı Göster
                    </Button>
                    <DataGrid
                        rows={clients}
                        columns={columns}
                        pageSize={5}
                        editable
                        processRowUpdate={handleRowUpdate}
                        onProcessRowUpdateError={(error) => console.error("Hata:", error)}
                    />
                </Grid2>
            </Grid2>

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

            {/* QR Code Dialog */}
            <Dialog open={qrOpen} onClose={closeQR} maxWidth="xs" fullWidth>
                <DialogTitle>QR Kodunuz</DialogTitle>
                <DialogContent dividers sx={{ display: "flex", justifyContent: "center" }}>
                    {qrData ? (
                        <img src={qrData} alt="Dietisyen QR" style={{ maxWidth: "100%", height: "auto" }} />
                    ) : (
                        <Typography>Yükleniyor...</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePrint} variant="outlined">
                        Yazdır
                    </Button>
                    <Button onClick={closeQR} variant="contained" color="primary">
                        Kapat
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
