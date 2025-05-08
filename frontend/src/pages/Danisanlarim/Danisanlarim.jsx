import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
    Paper,
} from "@mui/material";
import {
    DataGrid,
    GridToolbarQuickFilter,
    GridToolbarContainer,
    GridToolbarExport
} from "@mui/x-data-grid";
import { trTR } from "@mui/x-data-grid/locales";
import {
    Cancel,
    CheckCircle,
    GroupAdd,
    Visibility,
    Delete as DeleteIcon,
    QrCode as QrCodeIcon,
    Male as MaleIcon,
    Female as FemaleIcon,
} from "@mui/icons-material";
import { green, red, blue, pink } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import Default from "../../Components/Layouts/Default.jsx";
import config from "../../config.js";

// ---------------------------
// Custom Toolbar with Search & Export
// ---------------------------
function QuickSearchToolbar() {
    return (
        <GridToolbarContainer sx={{ justifyContent: "space-between", py: 1 }}>
            <GridToolbarQuickFilter placeholder="Danışan Ara" />
            <GridToolbarExport csvOptions={{ utf8WithBom: true }} />
        </GridToolbarContainer>
    );
}

export default function Danisanlarim() {
    const navigate = useNavigate();

    // ---------------------------
    // State
    // ---------------------------
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [qrData, setQrData] = useState("");

    // ---------------------------
    // Data Fetch
    // ---------------------------
    useEffect(() => {
        axios
            .get(
                `${config[config.environment].apiUrl}/dietitian/getAllMyClients`,
                { headers: { Authorization: localStorage.getItem("token") } }
            )
            .then((res) => setClients(res.data))
            .catch((err) => console.error("Error fetching clients:", err));
    }, []);

    // ---------------------------
    // CRUD Helpers
    // ---------------------------
    const handleRowUpdate = useCallback(async (updatedRow, originalRow) => {
        try {
            const res = await axios.put(
                `${config[config.environment].apiUrl}/dietitian/updateClient`,
                updatedRow,
                { headers: { Authorization: localStorage.getItem("token") } }
            );
            return { ...updatedRow, ...res.data };
        } catch (err) {
            console.error("Güncelleme hatası:", err);
            return originalRow; // revert on error
        }
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(
                `${config[config.environment].apiUrl}/dietitian/deleteClient`,
                {
                    headers: { Authorization: localStorage.getItem("token") },
                    data: { client_id: id },
                }
            );
            setClients((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error("Silme işlemi hatası:", err);
        }
    };

    // ---------------------------
    // Dialog Handlers
    // ---------------------------
    const openCreateDialog = () => setCreateDialogOpen(true);
    const closeCreateDialog = () => setCreateDialogOpen(false);

    const openDeleteDialog = (client) => {
        setSelectedClient(client);
        setDeleteDialogOpen(true);
    };
    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedClient(null);
    };
    const confirmDelete = () => {
        if (selectedClient) handleDelete(selectedClient.id);
        closeDeleteDialog();
    };

    const fetchQR = async () => {
        try {
            const { data } = await axios.get(
                `${config[config.environment].apiUrl}/dietitian/getDietitianQR`,
                { headers: { Authorization: localStorage.getItem("token") } }
            );
            setQrData(data.qrData);
            setQrDialogOpen(true);
        } catch (err) {
            console.error("QR fetch hatası:", err);
        }
    };
    const closeQrDialog = () => setQrDialogOpen(false);

    // ---------------------------
    // DataGrid Column Definitions
    // ---------------------------
    const columns = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "name", headerName: "İsim", flex: 1, editable: true },
        { field: "surname", headerName: "Soyisim", flex: 1, editable: true },
        { field: "email", headerName: "Email", flex: 1.2, editable: true },
        { field: "phoneNumber", headerName: "Telefon", flex: 1, editable: true },
        { field: "height", headerName: "Boy (cm)", width: 90, editable: true, type: "number" },
        { field: "weight", headerName: "Kilo (kg)", width: 90, editable: true, type: "number" },
        {
            field: "status",
            headerName: "Durum",
            width: 90,
            type: "singleSelect",
            valueOptions: ["aktif", "inaktif"],
            editable: true,
            renderCell: (params) =>
                params.value === "aktif" ? (
                    <CheckCircle sx={{ color: green[500] }} />
                ) : (
                    <Cancel sx={{ color: red[500] }} />
                ),
        },
        {
            field: "gender",
            headerName: "Cinsiyet",
            width: 90,
            type: "singleSelect",
            valueOptions: ["Erkek", "Kadın"],
            editable: true,
            renderCell: (params) =>
                params.value === "Erkek" ? (
                    <MaleIcon sx={{ color: blue[500] }} />
                ) : (
                    <FemaleIcon sx={{ color: pink[500] }} />
                ),
        },
        {
            field: "actions",
            headerName: "İşlemler",
            width: 140,
            sortable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/danisan/${params.row.id}`)}
                    >
                        <Visibility fontSize="small" />
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => openDeleteDialog(params.row)}
                    >
                        <DeleteIcon fontSize="small" />
                    </Button>
                </Stack>
            ),
        },
    ];

    // ---------------------------
    // Create Client Submit (placeholder – integrate with API)
    // ---------------------------
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        // TODO: Post new client → refresh list
        closeCreateDialog();
    };

    // ---------------------------
    // Render
    // ---------------------------
    return (
        <Default>
            <Stack spacing={2} sx={{ mt: "15px" }}>
                {/* Action Buttons */}
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        startIcon={<GroupAdd />}
                        onClick={openCreateDialog}
                        sx={{
                            borderRadius: 10,
                            textTransform: "none",
                            boxShadow: 3
                        }}
                    >
                        Danışan Ekle
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<QrCodeIcon />}
                        onClick={fetchQR}
                        sx={{
                            borderRadius: 10,
                            textTransform: "none",
                            boxShadow: 3
                        }}
                    >
                        QR’ımı Göster
                    </Button>
                </Stack>

                {/* Data Grid */}
                <Paper elevation={2} sx={{ height: "calc(100vh - 300px)", width: "100%" }}>
                    <DataGrid
                        localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
                        rows={clients}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        disableSelectionOnClick
                        processRowUpdate={handleRowUpdate}
                        onProcessRowUpdateError={(error) => console.error(error)}
                        slots={{ toolbar: QuickSearchToolbar }}
                        sx={{
                            "& .MuiDataGrid-columnHeaders": {
                                bgcolor: "background.default",
                            },
                            "& .MuiDataGrid-footerContainer": {
                                bgcolor: "background.default",
                            },
                        }}
                    />
                </Paper>
            </Stack>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle>Silme Onayı</DialogTitle>
                <DialogContent>
                    <Typography>
                        {selectedClient?.name} danışanınızı silmeyi onaylıyor musunuz?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} variant="outlined" color="secondary">
                        Vazgeç
                    </Button>
                    <Button onClick={confirmDelete} variant="contained" color="error">
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>

            {/* QR Dialog */}
            <Dialog open={qrDialogOpen} onClose={closeQrDialog} maxWidth="xs" fullWidth>
                <DialogTitle>QR Kodunuz</DialogTitle>
                <DialogContent dividers sx={{ display: "flex", justifyContent: "center" }}>
                    {qrData ? (
                        <img src={qrData} alt="Dietisyen QR" style={{ maxWidth: "100%" }} />
                    ) : (
                        <Typography>Yükleniyor…</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => window.print()} variant="outlined">
                        Yazdır
                    </Button>
                    <Button onClick={closeQrDialog} variant="contained">
                        Kapat
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Client Dialog */}
            <Dialog open={createDialogOpen} onClose={closeCreateDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Yeni Danışan Oluştur</DialogTitle>
                <form onSubmit={handleCreateSubmit}>
                    <DialogContent sx={{ pt: 2 }}>
                        <Stack spacing={2}>
                            <TextField label="Adınız" name="name" required fullWidth />
                            <TextField label="E-posta" name="email" type="email" required fullWidth />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeCreateDialog}>İptal</Button>
                        <Button type="submit" variant="contained">
                            Oluştur
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Default>
    );
}
