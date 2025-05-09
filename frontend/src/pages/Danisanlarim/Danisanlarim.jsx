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
    Grid,
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
    Group as GroupIcon,
    CheckCircleOutline,
    Edit as EditIcon,
    ArrowForward,
    Close as CloseIcon,
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
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [pendingEdit, setPendingEdit] = useState(null);

    // ---------------------------
    // İstatistikler
    // ---------------------------
    const totalCount = clients.length;
    const activeCount = clients.filter(c => c.status === true).length;
    const inactiveCount = clients.filter(c => c.status === false).length;
    const maleCount = clients.filter(c => c.gender === "Erkek").length;
    const femaleCount = clients.filter(c => c.gender === "Kadın").length;

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
        // Değişiklikleri karşılaştır
        const changes = Object.keys(updatedRow).reduce((acc, key) => {
            if (updatedRow[key] !== originalRow[key]) {
                acc[key] = {
                    old: originalRow[key],
                    new: updatedRow[key]
                };
            }
            return acc;
        }, {});

        // Eğer değişiklik yoksa direkt orijinal satırı döndür
        if (Object.keys(changes).length === 0) {
            return originalRow;
        }

        // Değişiklikleri ve satırı sakla
        setPendingEdit({ updatedRow, originalRow, changes });
        setEditDialogOpen(true);

        // Promise'i beklet
        return new Promise((resolve) => {
            const unsubscribe = () => {
                const cleanup = () => {
                    setPendingEdit(null);
                    setEditDialogOpen(false);
                };

                // Onay event listener'ını kaldır
                window.removeEventListener('editConfirmed', handleConfirm);
                window.removeEventListener('editCancelled', handleCancel);

                return cleanup;
            };

            // Onay event listener'larını ekle
            const handleConfirm = async () => {
                try {
                    const res = await axios.put(
                        `${config[config.environment].apiUrl}/dietitian/updateClient`,
                        updatedRow,
                        { headers: { Authorization: localStorage.getItem("token") } }
                    );
                    setEditDialogOpen(false);
                    resolve(res.data);
                    unsubscribe();
                } catch (err) {
                    console.error("Güncelleme hatası:", err);
                    setEditDialogOpen(false);
                    resolve(originalRow);
                    unsubscribe();
                }
            };

            const handleCancel = () => {
                setEditDialogOpen(false);
                resolve(originalRow);
                unsubscribe();
            };

            window.addEventListener('editConfirmed', handleConfirm);
            window.addEventListener('editCancelled', handleCancel);
        });
    }, []);

    const handleEditConfirm = () => {
        window.dispatchEvent(new Event('editConfirmed'));
    };

    const handleEditCancel = () => {
        setEditDialogOpen(false);
        window.dispatchEvent(new Event('editCancelled'));
    };

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
        { field: "email", headerName: "Email", flex: 1.2, editable: true },
        { field: "phoneNumber", headerName: "Telefon", flex: 1, editable: true },
        {
            field: "status",
            headerName: "Durum",
            width: 90,
            type: "singleSelect",
            valueOptions: [true, false],
            editable: true,
            renderCell: (params) =>
                params.row.status ? (
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
                        QR'ımı Göster
                    </Button>
                </Stack>

                {/* İstatistik Kartları */}
                <Box sx={{ mb: 4, mt: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #6B8DD6 0%, #4B6CB7 100%)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 25px rgba(107, 141, 214, 0.35)',
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
                                    }
                                }}
                            >
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    <GroupIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.9)', mb: 2 }} />
                                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                                        {totalCount}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Toplam Danışan
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2.4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #23B6E6 0%, #02A4D3 100%)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 25px rgba(35, 182, 230, 0.35)',
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
                                    }
                                }}
                            >
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    <CheckCircle sx={{ fontSize: 40, color: 'rgba(255,255,255,0.9)', mb: 2 }} />
                                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                                        {activeCount}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Aktif Danışan
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2.4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 25px rgba(255, 94, 98, 0.35)',
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
                                    }
                                }}
                            >
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    <Cancel sx={{ fontSize: 40, color: 'rgba(255,255,255,0.9)', mb: 2 }} />
                                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                                        {inactiveCount}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        İnaktif Danışan
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2.4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #FF5858 0%, #F857A6 100%)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 25px rgba(248, 87, 166, 0.35)',
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
                                    }
                                }}
                            >
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    <FemaleIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.9)', mb: 2 }} />
                                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                                        {femaleCount}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Kadın Danışan
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2.4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 25px rgba(67, 203, 255, 0.35)',
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
                                    }
                                }}
                            >
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    <MaleIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.9)', mb: 2 }} />
                                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                                        {maleCount}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        Erkek Danışan
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* Data Grid */}
                <Paper elevation={2} sx={{ height: "65vh", width: "100%" }}>
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

            {/* Edit Confirmation Dialog */}
            <Dialog 
                open={editDialogOpen} 
                onClose={handleEditCancel}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '100%'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(135deg, #6B8DD6 0%, #4B6CB7 100%)',
                    color: 'white',
                    py: 2,
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <EditIcon sx={{ fontSize: 28 }} />
                    <Typography variant="h6" component="span">
                        Düzenleme Onayı
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
                            Aşağıdaki değişiklikleri onaylıyor musunuz?
                        </Typography>
                        {pendingEdit && (
                            <Box sx={{ 
                                mt: 2,
                                '& > :not(:last-child)': {
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    pb: 2,
                                    mb: 2
                                }
                            }}>
                                {Object.entries(pendingEdit.changes).map(([field, values]) => (
                                    <Box key={field}>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: 'text.secondary',
                                                fontWeight: 500,
                                                mb: 1
                                            }}
                                        >
                                            {field}
                                        </Typography>
                                        <Box sx={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2
                                        }}>
                                            <Paper 
                                                sx={{ 
                                                    flex: 1,
                                                    p: 1.5,
                                                    background: '#fff5f5',
                                                    border: '1px solid #ffcdd2',
                                                    borderRadius: 1
                                                }}
                                            >
                                                <Typography variant="body2" color="error.main">
                                                    {values.old || '(boş)'}
                                                </Typography>
                                            </Paper>
                                            <ArrowForward sx={{ color: 'text.secondary' }} />
                                            <Paper 
                                                sx={{ 
                                                    flex: 1,
                                                    p: 1.5,
                                                    background: '#f0f7f0',
                                                    border: '1px solid #c8e6c9',
                                                    borderRadius: 1
                                                }}
                                            >
                                                <Typography variant="body2" color="success.main">
                                                    {values.new || '(boş)'}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ 
                    p: 3,
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Button 
                        onClick={handleEditCancel}
                        variant="outlined"
                        color="inherit"
                        startIcon={<CloseIcon />}
                        sx={{ 
                            borderRadius: 2,
                            px: 3
                        }}
                    >
                        Vazgeç
                    </Button>
                    <Button 
                        onClick={handleEditConfirm}
                        variant="contained"
                        startIcon={<CheckCircleOutline />}
                        sx={{ 
                            borderRadius: 2,
                            px: 3,
                            background: 'linear-gradient(135deg, #23B6E6 0%, #02A4D3 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #02A4D3 0%, #23B6E6 100%)'
                            }
                        }}
                    >
                        Onayla
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
