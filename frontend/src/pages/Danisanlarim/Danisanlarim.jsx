import React, {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {DataGrid, GridToolbarContainer, GridToolbarExport, GridToolbarQuickFilter} from "@mui/x-data-grid";
import {trTR} from "@mui/x-data-grid/locales";
import {
    ArrowForward,
    Cancel,
    CheckCircle,
    CheckCircleOutline,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Female as FemaleIcon,
    Group as GroupIcon,
    GroupAdd,
    Male as MaleIcon,
    QrCode as QrCodeIcon,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";
import {blue, green, pink, purple, red} from "@mui/material/colors";
import Default from "../../Components/Layouts/Default.jsx";
import config from "../../config.js";
import PersonIcon from "@mui/icons-material/Person";

function QuickSearchToolbar() {
    return (
        <GridToolbarContainer sx={{justifyContent: "space-between", py: 1}}>
            <GridToolbarQuickFilter placeholder="Danışan Ara"/>
            <GridToolbarExport csvOptions={{utf8WithBom: true}}/>
        </GridToolbarContainer>
    );
}

export default function Danisanlarim() {
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [qrData, setQrData] = useState("");
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [pendingEdit, setPendingEdit] = useState(null);

    const [newClient, setNewClient] = useState({
        phoneNumber: "",
        password: "",
        name: "",
        gender: "",
        email: ""
    });
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const totalCount = clients.length;
    const activeCount = clients.filter(c => c.status === true).length;
    const inactiveCount = clients.filter(c => c.status === false).length;
    const maleCount = clients.filter(c => c.gender === "Erkek").length;
    const femaleCount = clients.filter(c => c.gender === "Kadın").length;
    const otherCount = clients.filter(c => c.gender === "Diğer").length;

    useEffect(() => {
        axios
            .get(
                `${config[config.environment].apiUrl}/dietitian/getAllMyClients`,
                {headers: {Authorization: localStorage.getItem("token")}}
            )
            .then((res) => {
                setClients(res.data);
            })
            .catch((err) => console.error("Error fetching clients:", err));
    }, []);

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

        if (Object.keys(changes).length === 0) {
            return originalRow;
        }

        setPendingEdit({updatedRow, originalRow, changes});
        setEditDialogOpen(true);

        return new Promise((resolve) => {
            const unsubscribe = () => {
                const cleanup = () => {
                    setPendingEdit(null);
                    setEditDialogOpen(false);
                };

                window.removeEventListener('editConfirmed', handleConfirm);
                window.removeEventListener('editCancelled', handleCancel);

                return cleanup;
            };

            const handleConfirm = async () => {
                try {
                    const res = await axios.put(
                        `${config[config.environment].apiUrl}/dietitian/updateClient`,
                        updatedRow,
                        {headers: {Authorization: localStorage.getItem("token")}}
                    );
                    setNewClient({
                        phoneNumber: "",
                        password: "",
                        name: "",
                        gender: "",
                        email: ""
                    });

                    setFormErrors({});

                    setShowPassword(false);

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
        setNewClient({
            phoneNumber: "",
            password: "",
            name: "",
            gender: "",
            email: ""
        });

        setFormErrors({});

        setShowPassword(false);

        window.dispatchEvent(new Event('editConfirmed'));
    };

    const handleEditCancel = () => {
        setNewClient({
            phoneNumber: "",
            password: "",
            name: "",
            gender: "",
            email: ""
        });

        setFormErrors({});

        setShowPassword(false);

        setEditDialogOpen(false);
        window.dispatchEvent(new Event('editCancelled'));
    };

    const handleDelete = async (id) => {
        try {
            console.log("Deleting client with ID:", id);
            const requestConfig = {
                headers: {Authorization: localStorage.getItem("token")},
                data: {client_id: id},
            };
            console.log("Request configuration:", requestConfig);

            await axios.delete(
                `${config[config.environment].apiUrl}/dietitian/deleteClient`,
                requestConfig
            );
            setClients((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error("Silme işlemi hatası:", err);
        }
    };

    const openCreateDialog = () => setCreateDialogOpen(true);
    const closeCreateDialog = () => {
        setNewClient({
            phoneNumber: "",
            password: "",
            name: "",
            gender: "",
            email: ""
        });

        setFormErrors({});

        setShowPassword(false);

        setCreateDialogOpen(false);
    }

    const openDeleteDialog = (client) => {
        console.log("Opening delete dialog for client:", client);
        setSelectedClient(client);
        setDeleteDialogOpen(true);
    };
    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedClient(null);
    };
    const confirmDelete = () => {
        if (selectedClient) {
            console.log("Confirming delete for client:", selectedClient);
            console.log("Using ID:", selectedClient.id);
            handleDelete(selectedClient.id);
        }
        closeDeleteDialog();
    };

    const fetchQR = async () => {
        try {
            const {data} = await axios.get(
                `${config[config.environment].apiUrl}/dietitian/getDietitianQR`,
                {headers: {Authorization: localStorage.getItem("token")}}
            );
            setQrData(data.qrData);
            setQrDialogOpen(true);
        } catch (err) {
            console.error("QR fetch hatası:", err);
        }
    };
    const closeQrDialog = () => setQrDialogOpen(false);

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let password = "";
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewClient(prev => ({...prev, password}));
    };

    const validateForm = () => {
        const errors = {};
        if (!newClient.phoneNumber) errors.phoneNumber = "Telefon numarası zorunludur";
        else if (!/^[0-9]{10}$/.test(newClient.phoneNumber)) errors.phoneNumber = "Geçerli bir telefon numarası giriniz (10 rakam)";

        if (!newClient.password) errors.password = "Şifre zorunludur";
        if (!newClient.name) errors.name = "İsim zorunludur";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNewClient(prev => ({...prev, [name]: value}));

        if (formErrors[name]) {
            setFormErrors(prev => ({...prev, [name]: ""}));
        }
    };

    // Handle phone number specific validation
    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.startsWith('0')) {
            value = value.substring(1);
        }
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        setNewClient(prev => ({...prev, phoneNumber: value}));

        if (formErrors.phoneNumber) {
            setFormErrors(prev => ({...prev, phoneNumber: ""}));
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await axios.post(
                `${config[config.environment].apiUrl}/dietitian/registerClient`,
                newClient,
                {headers: {Authorization: localStorage.getItem("token")}}
            );

            setClients(prev => [...prev, response.data]);

            setSnackbar({
                open: true,
                message: "Danışan başarıyla eklendi",
                severity: "success"
            });

            setNewClient({
                phoneNumber: "",
                password: "",
                name: "",
                gender: "",
                email: ""
            });
            closeCreateDialog();
        } catch (error) {
            console.error("Danışan eklenirken hata oluştu:", error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || "Danışan eklenirken bir hata oluştu",
                severity: "error"
            });
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({...prev, open: false}));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const columns = [
        {field: "id", headerName: "ID", width: 70},
        {field: "name", headerName: "İsim", flex: 1, editable: true},
        {field: "email", headerName: "Email", flex: 1.2, editable: true},
        {field: "phoneNumber", headerName: "Telefon", flex: 1, editable: true},
        {
            field: "status",
            headerName: "Durum",
            width: 90,
            type: "singleSelect",
            valueOptions: [true, false],
            editable: true,
            renderCell: (params) =>
                params.row.status ? (
                    <CheckCircle sx={{color: green[500]}}/>
                ) : (
                    <Cancel sx={{color: red[500]}}/>
                ),
        },
        {
            field: "gender",
            headerName: "Cinsiyet",
            width: 90,
            type: "singleSelect",
            valueOptions: ["Erkek", "Kadın", "Diğer"],
            editable: true,
            renderCell: (params) =>
                params.value === "Erkek" ? (
                    <MaleIcon sx={{color: blue[500]}}/>
                ) : params.value === "Kadın" ? (
                    <FemaleIcon sx={{color: pink[500]}}/>
                ) : (
                    <PersonIcon sx={{color: purple[500]}}/>
                ),
        },
        {
            field: "actions",
            headerName: "İşlemler",
            width: 160,
            sortable: false,
            editable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/danisan/${params.row.id}`)}
                    >
                        <Visibility fontSize="small"/>
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => openDeleteDialog(params.row)}
                    >
                        <DeleteIcon fontSize="small"/>
                    </Button>
                </Stack>
            ),
        },
    ];

    // ---------------------------
    // Render
    // ---------------------------
    return (
        <Default>
            <Stack spacing={2} sx={{mt: "15px"}}>
                {/* Action Buttons */}
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        startIcon={<GroupAdd/>}
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
                        startIcon={<QrCodeIcon/>}
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
                <Box sx={{mb: 4, mt: 2}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={2}>
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
                                <Box sx={{position: 'relative', zIndex: 1}}>
                                    <GroupIcon sx={{fontSize: 40, color: 'rgba(255,255,255,0.9)', mb: 2}}/>
                                    <Typography variant="h4" sx={{color: '#fff', fontWeight: 700, mb: 0.5}}>
                                        {totalCount}
                                    </Typography>
                                    <Typography variant="body1" sx={{color: 'rgba(255,255,255,0.9)'}}>
                                        Toplam Danışan
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
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
                                <Box sx={{position: 'relative', zIndex: 1}}>
                                    <CheckCircle sx={{fontSize: 40, color: 'rgba(255,255,255,0.9)', mb: 2}}/>
                                    <Typography variant="h4" sx={{color: '#fff', fontWeight: 700, mb: 0.5}}>
                                        {activeCount}
                                    </Typography>
                                    <Typography variant="body1" sx={{color: 'rgba(255,255,255,0.9)'}}>
                                        Aktif Danışan
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
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
                                <Box sx={{position: 'relative', zIndex: 1}}>
                                    <Cancel sx={{fontSize: 40, color: 'rgba(255,255,255,0.9)', mb: 2}}/>
                                    <Typography variant="h4" sx={{color: '#fff', fontWeight: 700, mb: 0.5}}>
                                        {inactiveCount}
                                    </Typography>
                                    <Typography variant="body1" sx={{color: 'rgba(255,255,255,0.9)'}}>
                                        İnaktif Danışan
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
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
                                <Box sx={{position: 'relative', zIndex: 1}}>
                                    <FemaleIcon sx={{fontSize: 40, color: 'rgba(255,255,255,0.9)', mb: 2}}/>
                                    <Typography variant="h4" sx={{color: '#fff', fontWeight: 700, mb: 0.5}}>
                                        {femaleCount}
                                    </Typography>
                                    <Typography variant="body1" sx={{color: 'rgba(255,255,255,0.9)'}}>
                                        Kadın Danışan
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
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
                                <Box sx={{position: 'relative', zIndex: 1}}>
                                    <MaleIcon sx={{fontSize: 40, color: 'rgba(255,255,255,0.9)', mb: 2}}/>
                                    <Typography variant="h4" sx={{color: '#fff', fontWeight: 700, mb: 0.5}}>
                                        {maleCount}
                                    </Typography>
                                    <Typography variant="body1" sx={{color: 'rgba(255,255,255,0.9)'}}>
                                        Erkek Danışan
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #A1A1A1 0%, #6C63FF 100%)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 25px rgba(108, 99, 255, 0.35)',
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
                                <Box sx={{position: 'relative', zIndex: 1}}>
                                    <PersonIcon sx={{fontSize: 40, color: 'rgba(255,255,255,0.9)', mb: 2}}/>
                                    <Typography variant="h4" sx={{color: '#fff', fontWeight: 700, mb: 0.5}}>
                                        {otherCount}
                                    </Typography>
                                    <Typography variant="body1" sx={{color: 'rgba(255,255,255,0.9)'}}>
                                        Diğer Danışan
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* Data Grid */}
                <Paper elevation={2} sx={{height: "65vh", width: "100%"}}>
                    <DataGrid
                        localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
                        rows={clients}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        disableSelectionOnClick
                        processRowUpdate={handleRowUpdate}
                        onProcessRowUpdateError={(error) => console.error(error)}
                        slots={{toolbar: QuickSearchToolbar}}
                        getRowId={(row) => row.id}
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
                    <EditIcon sx={{fontSize: 28}}/>
                    <Typography variant="h6" component="span">
                        Düzenleme Onayı
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{p: 0}}>
                    <Box sx={{p: 3}}>
                        <Typography variant="subtitle1" sx={{mb: 2, color: 'text.secondary'}}>
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
                                            <ArrowForward sx={{color: 'text.secondary'}}/>
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
                        startIcon={<CloseIcon/>}
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
                        startIcon={<CheckCircleOutline/>}
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
                <DialogContent dividers sx={{display: "flex", justifyContent: "center"}}>
                    {qrData ? (
                        <img src={qrData} alt="Dietisyen QR" style={{maxWidth: "100%"}}/>
                    ) : (
                        <Typography>Yükleniyor…</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeQrDialog} variant="outlined" color="secondary">
                        Kapat
                    </Button>
                    <Button onClick={() => window.print()} variant="contained" color="primary">
                        Yazdır
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Client Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={closeCreateDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <GroupAdd/>
                        <Typography variant="h6" color="primary.main" sx={{color: '#2E7D32', fontWeight: 'bold'}}>
                            Yeni Danışan Ekle
                        </Typography>
                    </Box>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={closeCreateDialog}
                        aria-label="close"
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <form onSubmit={handleCreateSubmit}>
                    <DialogContent dividers>
                        <Stack spacing={3} sx={{mt: 1}}>
                            <TextField
                                fullWidth
                                label="Adı Soyadı"
                                name="name"
                                value={newClient.name}
                                onChange={handleInputChange}
                                margin="normal"
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                            />


                            <TextField
                                fullWidth
                                label="Telefon Numarası"
                                name="phoneNumber"
                                value={newClient.phoneNumber}
                                onChange={handlePhoneChange}
                                margin="normal"
                                error={!!formErrors.phoneNumber}
                                helperText={formErrors.phoneNumber}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">+90</InputAdornment>,
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Şifre"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={newClient.password}
                                onChange={handleInputChange}
                                margin="normal"
                                error={!!formErrors.password}
                                helperText={formErrors.password}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />


                            <TextField
                                fullWidth
                                label="E-posta"
                                name="email"
                                value={newClient.email}
                                onChange={handleInputChange}
                                margin="normal"
                                error={!!formErrors.email}
                                helperText={formErrors.email}
                            />


                            <FormControl fullWidth margin="normal" error={!!formErrors.gender}>
                                <InputLabel>Cinsiyet</InputLabel>
                                <Select
                                    name="gender"
                                    value={newClient.gender}
                                    onChange={handleInputChange}
                                    label="Cinsiyet"
                                >
                                    <MenuItem value="Erkek">Erkek</MenuItem>
                                    <MenuItem value="Kadın">Kadın</MenuItem>
                                    <MenuItem value="Diğer">Diğer</MenuItem>
                                </Select>
                                {formErrors.gender && <Typography color="error" variant="caption">{formErrors.gender}</Typography>}
                            </FormControl>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{p: 2, justifyContent: 'space-between'}}>
                        <Button
                            onClick={closeCreateDialog}
                            variant="outlined"
                            startIcon={<CloseIcon/>}
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<GroupAdd/>}
                        >
                            Danışan Ekle
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Success/Error Notification */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{width: '100%'}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Default>
    );
}
