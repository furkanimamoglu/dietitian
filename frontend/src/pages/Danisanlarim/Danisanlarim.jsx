import React, {useCallback, useEffect, useMemo, useState} from "react";
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";

import {DataGrid, GridToolbarContainer, GridToolbarQuickFilter} from "@mui/x-data-grid";

import {trTR} from "@mui/x-data-grid/locales";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Cancel from "@mui/icons-material/Cancel";
import CheckCircle from "@mui/icons-material/CheckCircle";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FemaleIcon from "@mui/icons-material/Female";
import GroupIcon from "@mui/icons-material/Group";
import MaleIcon from "@mui/icons-material/Male";
import QrCodeIcon from "@mui/icons-material/QrCode";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import VpnKey from "@mui/icons-material/VpnKey";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import GroupAdd from "@mui/icons-material/GroupAdd";
import NotificationsIcon from "@mui/icons-material/Notifications";

import {blue, green, pink, purple, red} from "@mui/material/colors";
import Default from "../../Components/Layouts/Default.jsx";
import config from "../../config.js";
import PersonIcon from "@mui/icons-material/Person";
import {Document, Font, Image, Page, PDFDownloadLink, StyleSheet, Text, View} from '@react-pdf/renderer';
import Papa from 'papaparse';

Font.register({
    family: 'Open Sans',
    fonts: [
        {src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf'}
    ]
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 30,
        fontSize: 12,
        fontFamily: 'Open Sans',
        backgroundColor: '#f9f9f9',
    },
    instructionText: {
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 10,
        fontFamily: 'Open Sans',
        fontSize: 14,
        color: '#444',
    },
    qrContainer: {
        position: 'relative',
        width: 300,
        height: 350,
        padding: 25,
        display: 'flex',
        border: '5 dashed black',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15
    },
    qrImage: {
        width: 250,
        height: 250,
        borderRadius: 10,
    },
    highlight: {
        color: '#2E7D32',
        fontWeight: 'bold',
    },
    logo: {
        fontSize: 18,
        color: '#2E7D32',
        fontWeight: 'bold',
        marginTop: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        fontSize: 10,
        color: '#888',
        textAlign: 'center',
    },
    header: {
        fontSize: 22,
        color: '#2E7D32',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    ribbon: {
        position: 'absolute',
        top: -10,
        right: -10,
        width: 100,
        height: 100,
        backgroundColor: '#2E7D32',
        transform: 'rotate(45deg)',
    }
});

const QRDocument = ({qrData}) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>Diyetisyen QR Kodu</Text>

            <Text style={styles.instructionText}>
                Bu QR kodu <Text style={styles.highlight}>danışanlarınıza</Text> göstererek, sizi diyetisyen olarak
                uygulamalarına eklemelerini sağlayabilirsiniz.
            </Text>

            <View style={styles.qrContainer}>
                <Image style={styles.qrImage} src={qrData}/>
                <Text style={styles.logo}>Diyetia</Text>
            </View>

            <Text style={styles.footer}>
                Diyetia.com - Sağlıklı beslenme için teknolojik çözümler
            </Text>
        </Page>
    </Document>
);

function QuickSearchToolbar() {
    return (
        <GridToolbarContainer sx={{justifyContent: "space-between", ml: "1rem", py: 1}}>
            <GridToolbarQuickFilter placeholder="Danışan Ara"/>
            <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => document.dispatchEvent(new CustomEvent('deleteInactiveClients'))}
                size="small"
                sx={{ mr: 2 }}
            >
                Pasif Danışanları Temizle
            </Button>
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
    const [activeFilter, setActiveFilter] = useState(null);
    const [deleteInactiveDialogOpen, setDeleteInactiveDialogOpen] = useState(false);

    const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
    const [notificationData, setNotificationData] = useState({
        body: ""
    });
    const [selectedClientForNotification, setSelectedClientForNotification] = useState(null);

    const closeNotificationDialog = () => {
        setNotificationDialogOpen(false);
        setSelectedClientForNotification(null);
        setNotificationData({
            body: ""
        });
    };

    const openNotificationDialog = (client) => {
        setSelectedClientForNotification(client);
        setNotificationDialogOpen(true);
    };

    // CSV Import states
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [csvData, setCsvData] = useState([]);
    const [csvErrors, setCsvErrors] = useState({});
    const [importPreviewOpen, setImportPreviewOpen] = useState(false);

    const [showPdfPreview, setShowPdfPreview] = useState(false);

    const filteredClients = useMemo(() => {
        if (!activeFilter) return clients;

        switch (activeFilter) {
            case 'all':
                return clients;
            case 'active':
                return clients.filter(c => c.status === "Aktif");
            case 'inactive':
                return clients.filter(c => c.status === "Pasif");
            case 'female':
                return clients.filter(c => c.gender === "Kadın");
            case 'male':
                return clients.filter(c => c.gender === "Erkek");
            case 'other':
                return clients.filter(c => c.gender === "Diğer");
            default:
                return clients;
        }
    }, [clients, activeFilter]);

    // Kart seçimini ele alma fonksiyonu
    const handleCardSelect = (filter) => {
        setActiveFilter(activeFilter === filter ? null : filter);
    };

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
    const activeCount = clients.filter(c => c.status === "Aktif").length;
    const inactiveCount = clients.filter(c => c.status === "Pasif").length;
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

        // İnaktif hesapları silme olayı için dinleyici
        const handleDeleteInactive = () => {
            if (clients.filter(c => c.status === "Pasif").length === 0) {
                setSnackbar({
                    open: true,
                    message: "Silinecek inaktif danışan bulunmamaktadır",
                    severity: "info"
                });
                return;
            }
            setDeleteInactiveDialogOpen(true);
        };

        document.addEventListener('deleteInactiveClients', handleDeleteInactive);

        return () => {
            document.removeEventListener('deleteInactiveClients', handleDeleteInactive);
        };
    }, [clients]);

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

    const handleChangeStatus = async (client) => {
        try {
            const newStatus = client.status === "Aktif" ? "Pasif" : "Aktif";

            await axios.post(
                `${config[config.environment].apiUrl}/dietitian/changeClientStatus`,
                {
                    client_id: client.id,
                    status: newStatus
                },
                {headers: {Authorization: localStorage.getItem("token")}}
            );

            setClients(prev => prev.map(c =>
                c.id === client.id ? {...c, status: newStatus} : c
            ));

            setSnackbar({
                open: true,
                message: `${client.name} durumu ${newStatus === "Aktif" ? "aktif" : "pasif"} olarak değiştirildi`,
                severity: "success"
            });

        } catch (error) {
            console.error("Durum değiştirme hatası:", error);
            setSnackbar({
                open: true,
                message: "Danışan durumu değiştirilemedi",
                severity: "error"
            });
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
    };

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

    const handleSendNotification = async () => {
        try {
            if (!selectedClientForNotification) return;

            await axios.post(
                `${config[config.environment].apiUrl}/notification/sendNotificationToClient`,
                {
                    client_id: selectedClientForNotification.id,
                    notificationData: {
                        title: "Diyetisyeninden Haber Var!",
                        body: notificationData.body,
                        data: {}
                }
                },
                { headers: { Authorization: localStorage.getItem("token") } }
            );

            setSnackbar({
                open: true,
                message: "Bildirim başarıyla gönderildi",
                severity: "success"
            });
            closeNotificationDialog();
        } catch (error) {
            console.error("Bildirim gönderme hatası:", error);
            setSnackbar({
                open: true,
                message: "Bildirim gönderilirken bir hata oluştu",
                severity: "error"
            });
        }
    };

    const [bulkNotificationDialogOpen, setBulkNotificationDialogOpen] = useState(false);
    const [bulkNotificationData, setBulkNotificationData] = useState({
        body: ""
    });

    const openBulkNotificationDialog = () => {
        setBulkNotificationDialogOpen(true);
    };

    const closeBulkNotificationDialog = () => {
        setBulkNotificationDialogOpen(false);
        setBulkNotificationData({
            body: ""
        });
    };

    const handleSendBulkNotification = async () => {
        try {
            if (filteredClients.length === 0) {
                setSnackbar({
                    open: true,
                    message: "Bildirim gönderilecek danışan bulunamadı",
                    severity: "warning"
                });
                return;
            }

            await axios.post(
                `${config[config.environment].apiUrl}/notification/sendNotificationToAllMyClients`,
                {
                    notificationData: {
                        title: "Diyetisyeninizden Haber Var!",
                        body: bulkNotificationData.body,
                        data: {}
                    }
                },
                { headers: { Authorization: localStorage.getItem("token") } }
            );

            setSnackbar({
                open: true,
                message: `${filteredClients.length} danışana bildirim başarıyla gönderildi`,
                severity: "success"
            });
            closeBulkNotificationDialog();
        } catch (error) {
            console.error("Toplu bildirim gönderme hatası:", error);
            setSnackbar({
                open: true,
                message: "Bildirimler gönderilirken bir hata oluştu",
                severity: "error"
            });
        }
    };

    const closeQrDialog = () => {
        setQrDialogOpen(false);
        setShowPdfPreview(false);
    };

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

        if (!newClient.name || newClient.name.trim() === "") {
            errors.name = "Adı Soyadı zorunludur";
        } else if (newClient.name.trim().length < 2) {
            errors.name = "Adı Soyadı en az 2 karakter olmalıdır";
        }

        if (!newClient.phoneNumber || newClient.phoneNumber.trim() === "") {
            errors.phoneNumber = "Telefon numarası zorunludur";
        } else if (!/^[0-9]{10}$/.test(newClient.phoneNumber)) {
            errors.phoneNumber = "Geçerli bir telefon numarası giriniz (10 rakam)";
        }

        if (!newClient.password || newClient.password.trim() === "") {
            errors.password = "Şifre zorunludur";
        } else if (newClient.password.length < 6) {
            errors.password = "Şifre en az 6 karakter olmalıdır";
        }

        if (newClient.email && newClient.email.trim() !== "") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newClient.email)) {
                errors.email = "Geçerli bir e-posta adresi giriniz";
            }
        }

        if (!newClient.gender || newClient.gender === "") {
            errors.gender = "Cinsiyet seçimi zorunludur";
        }

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

        if (!validateForm()) {
            const firstErrorField = Object.keys(formErrors)[0];
            if (firstErrorField) {
                const element = document.querySelector(`[name="${firstErrorField}"]`);
                if (element) {
                    element.focus();
                }
            }
            return;
        }

        try {
            const response = await axios.post(
                `${config[config.environment].apiUrl}/dietitian/registerClient`,
                {
                    ...newClient,
                    name: newClient.name.trim(),
                    email: newClient.email.trim()
                },
                {headers: {Authorization: localStorage.getItem("token")}}
            );

            setClients(prev => [...prev, response.data]);

            setSnackbar({
                open: true,
                message: "Danışan başarıyla eklendi",
                severity: "success"
            });

            // Formu temizle
            setNewClient({
                phoneNumber: "",
                password: "",
                name: "",
                gender: "",
                email: ""
            });
            setFormErrors({});
            closeCreateDialog();

        } catch (error) {
            console.error("Danışan eklenirken hata oluştu:", error);

            let errorMessage = "Danışan eklenirken bir hata oluştu";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 400) {
                errorMessage = "Girilen bilgilerde hata var. Lütfen kontrol ediniz.";
            } else if (error.response?.status === 409) {
                errorMessage = "Bu telefon numarası zaten kayıtlı.";
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: "error"
            });
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({...prev, open: false}));
    };

    const columns = [
        {field: "name", headerName: "İsim", flex: 1, editable: false},
        {field: "email", headerName: "Email", flex: 1.2, editable: false},
        {field: "phoneNumber", headerName: "Telefon", flex: 1, editable: false},
        {
            field: "status",
            headerName: "Durum",
            width: 90,
            type: "singleSelect",
            valueOptions: [
                { value: "Aktif", label: "Aktif" },
                { value: "Pasif", label: "Pasif" }
            ],
            editable: false,
            renderCell: (params) => {
                if (params.row.status === "Aktif") {
                    return <CheckCircle sx={{color: green[500]}}/>;
                } else {
                    return <Cancel sx={{color: red[500]}}/>;
                }
            }
        },
        {
            field: "gender",
            headerName: "Cinsiyet",
            width: 90,
            type: "singleSelect",
            valueOptions: ["Erkek", "Kadın", "Diğer"],
            editable: false,
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
            field: "kvkkApproval",
            headerName: "KVKK",
            width: 90,
            type: "boolean",
            editable: false,
            renderCell: (params) =>
                params.value ? (
                    <CheckCircle sx={{color: green[500]}}/>
                ) : (
                    <Cancel sx={{color: red[500]}}/>
                ),
        },
        {
            field: "createdAt",
            headerName: "Kayıt Tarihi",
            width: 180,
            editable: false,
            valueFormatter: (params) => {
                const date = new Date(params);
                if (!params || isNaN(date.getTime())) {
                    return '';
                }
                return date.toLocaleString('tr-TR');
            }
        },
        {
            field: "updatedAt",
            headerName: "Son Güncelleme",
            width: 180,
            editable: false,
            valueFormatter: (params) => {
                const date = new Date(params);
                if (!params || isNaN(date.getTime())) {
                    return '';
                }
                return date.toLocaleString('tr-TR');
            }
        },
        {
            field: "actions",
            headerName: "İşlemler",
            width: 340, // Genişliği arttırdım
            sortable: false,
            editable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/danisan/${params.row.id}`)}
                        title="Detayları Görüntüle"
                    >
                        <Visibility fontSize="small"/>
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => openNotificationDialog(params.row)}
                        title="Bildirim Gönder"
                    >
                        <NotificationsIcon fontSize="small"/>
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color={params.row.status === "Aktif" ? "error" : "success"}
                        onClick={() => handleChangeStatus(params.row)}
                        title={params.row.status === "Aktif" ? "Pasifleştir" : "Aktifleştir"}
                    >
                        {params.row.status === "Aktif" ?
                            <Cancel fontSize="small"/> :
                            <CheckCircle fontSize="small"/>
                        }
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => openDeleteDialog(params.row)}
                        title="Sil"
                    >
                        <DeleteIcon fontSize="small"/>
                    </Button>
                </Stack>
            ),
        },
    ];

    const handleCsvFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                // Check if we have valid data
                if (results.data && results.data.length > 0) {
                    const parsedData = results.data.map((row, index) => {
                        // Clean up phone number - remove non-digits
                        let phoneNumber = row.telefon || "";
                        phoneNumber = phoneNumber.replace(/\D/g, '');
                        if (phoneNumber.startsWith('0')) {
                            phoneNumber = phoneNumber.substring(1);
                        }

                        return {
                            id: `temp_${index}`,
                            name: row.isim || "",
                            phoneNumber: phoneNumber,
                            gender: row.cinsiyet || "",
                            email: row.mail || "",
                            password: generateRandomPassword(),
                            status: "Aktif"
                        };
                    });

                    setCsvData(parsedData);
                    validateCsvData(parsedData);
                    setImportDialogOpen(false);
                    setImportPreviewOpen(true);
                } else {
                    setSnackbar({
                        open: true,
                        message: "CSV dosyası boş veya geçersiz format içeriyor",
                        severity: "error"
                    });
                }
            },
            error: function (error) {
                setSnackbar({
                    open: true,
                    message: `CSV okuma hatası: ${error.message}`,
                    severity: "error"
                });
            }
        });
    };

    const validateCsvData = (data) => {
        const errors = {};

        data.forEach((row, index) => {
            const rowErrors = {};

            // İsim validasyonu
            if (!row.name || row.name.trim() === "") {
                rowErrors.name = "İsim zorunludur";
            }

            // Telefon validasyonu
            if (!row.phoneNumber || row.phoneNumber.trim() === "") {
                rowErrors.phoneNumber = "Telefon numarası zorunludur";
            } else if (!/^[0-9]{10}$/.test(row.phoneNumber.replace(/\D/g, ''))) {
                rowErrors.phoneNumber = "Geçerli bir telefon numarası giriniz";
            }

            // Cinsiyet validasyonu
            if (!row.gender || !["Erkek", "Kadın", "Diğer"].includes(row.gender)) {
                rowErrors.gender = "Geçerli bir cinsiyet seçiniz (Erkek, Kadın, Diğer)";
            }

            // Email validasyonu (opsiyonel)
            if (row.email && row.email.trim() !== "") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(row.email)) {
                    rowErrors.email = "Geçerli bir e-posta adresi giriniz";
                }
            }

            if (Object.keys(rowErrors).length > 0) {
                errors[index] = rowErrors;
            }
        });

        setCsvErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCsvRowChange = (index, field, value) => {
        const updatedData = [...csvData];
        updatedData[index][field] = value;
        setCsvData(updatedData);

        // Validate the updated row
        const rowErrors = {};
        const row = updatedData[index];

        if (field === "name" && (!value || value.trim() === "")) {
            rowErrors.name = "İsim zorunludur";
        }

        if (field === "phoneNumber") {
            if (!value || value.trim() === "") {
                rowErrors.phoneNumber = "Telefon numarası zorunludur";
            } else if (!/^[0-9]{10}$/.test(value.replace(/\D/g, ''))) {
                rowErrors.phoneNumber = "Geçerli bir telefon numarası giriniz";
            }
        }

        if (field === "gender" && (!value || !["Erkek", "Kadın", "Diğer"].includes(value))) {
            rowErrors.gender = "Geçerli bir cinsiyet seçiniz";
        }

        if (field === "email" && value && value.trim() !== "") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                rowErrors.email = "Geçerli bir e-posta adresi giriniz";
            }
        }

        const newErrors = {...csvErrors};
        if (Object.keys(rowErrors).length > 0) {
            newErrors[index] = {...(newErrors[index] || {}), ...rowErrors};
        } else {
            if (newErrors[index]) {
                delete newErrors[index][field];
                if (Object.keys(newErrors[index]).length === 0) {
                    delete newErrors[index];
                }
            }
        }

        setCsvErrors(newErrors);
    };

    const handleCsvRowDelete = (index) => {
        const updatedData = csvData.filter((_, i) => i !== index);
        setCsvData(updatedData);

        // Update errors
        const newErrors = {...csvErrors};
        delete newErrors[index];

        // Reindex errors if necessary
        const reindexedErrors = {};
        Object.keys(newErrors).forEach(key => {
            const numKey = parseInt(key);
            if (numKey > index) {
                reindexedErrors[numKey - 1] = newErrors[key];
            } else {
                reindexedErrors[key] = newErrors[key];
            }
        });

        setCsvErrors(reindexedErrors);
    };

    const handleImportSubmit = async () => {
        if (Object.keys(csvErrors).length > 0) {
            setSnackbar({
                open: true,
                message: "Lütfen tüm hataları düzeltin",
                severity: "error"
            });
            return;
        }

        try {
            let successCount = 0;
            let failCount = 0;

            // Process each client one by one
            for (const client of csvData) {
                try {
                    const response = await axios.post(
                        `${config[config.environment].apiUrl}/dietitian/registerClient`,
                        {
                            name: client.name.trim(),
                            phoneNumber: client.phoneNumber.replace(/\D/g, ''),
                            password: client.password,
                            gender: client.gender,
                            email: client.email ? client.email.trim() : ""
                        },
                        {headers: {Authorization: localStorage.getItem("token")}}
                    );

                    setClients(prev => [...prev, response.data]);
                    successCount++;
                } catch (err) {
                    console.error(`Danışan eklenirken hata: ${client.name}`, err);
                    failCount++;
                }
            }

            setSnackbar({
                open: true,
                message: `${successCount} danışan başarıyla eklendi. ${failCount > 0 ? `${failCount} danışan eklenemedi.` : ''}`,
                severity: failCount > 0 ? "warning" : "success"
            });

            setImportPreviewOpen(false);
            setCsvData([]);

        } catch (error) {
            console.error("Toplu danışan eklenirken hata oluştu:", error);
            setSnackbar({
                open: true,
                message: "Danışanlar eklenirken bir hata oluştu",
                severity: "error"
            });
        }
    };

    const generateRandomPassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let password = "";
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    // Export clients to CSV
    const handleExportCSV = () => {
        // Filter clients based on active filter
        const dataToExport = filteredClients.map(client => ({
            isim: client.name,
            telefon: client.phoneNumber,
            cinsiyet: client.gender,
            mail: client.email || "",
            durum: client.status ? "Aktif" : "Pasif",
        }));

        // Convert to CSV
        const csv = Papa.unparse(dataToExport);

        // Create download link
        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        // Set file name with current date
        const date = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
        const fileName = `danisanlar_${date}.csv`;

        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ---------------------------
    // Render
    // ---------------------------
    return (
        <Default>
            <Stack spacing={2} sx={{mt: "15px"}}>
                {/* İstatistik Kartları */}
                <Box sx={{mb: 4, mt: 2}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={2}>
                            <Paper
                                elevation={0}
                                onClick={() => handleCardSelect('all')}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #6B8DD6 0%, #4B6CB7 100%)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: activeFilter && activeFilter !== 'all' ? 0.6 : 1,
                                    transform: activeFilter === 'all' ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: activeFilter === 'all' ? '0 8px 25px rgba(107, 141, 214, 0.5)' : '0 4px 15px rgba(107, 141, 214, 0.2)',
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
                                onClick={() => handleCardSelect('active')}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #23B6E6 0%, #02A4D3 100%)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: activeFilter && activeFilter !== 'active' ? 0.6 : 1,
                                    transform: activeFilter === 'active' ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: activeFilter === 'active' ? '0 8px 25px rgba(35, 182, 230, 0.5)' : '0 4px 15px rgba(35, 182, 230, 0.2)',
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
                                onClick={() => handleCardSelect('inactive')}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: activeFilter && activeFilter !== 'inactive' ? 0.6 : 1,
                                    transform: activeFilter === 'inactive' ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: activeFilter === 'inactive' ? '0 8px 25px rgba(255, 94, 98, 0.5)' : '0 4px 15px rgba(255, 94, 98, 0.2)',
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
                                onClick={() => handleCardSelect('female')}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #FF5858 0%, #F857A6 100%)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: activeFilter && activeFilter !== 'female' ? 0.6 : 1,
                                    transform: activeFilter === 'female' ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: activeFilter === 'female' ? '0 8px 25px rgba(248, 87, 166, 0.5)' : '0 4px 15px rgba(248, 87, 166, 0.2)',
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
                                onClick={() => handleCardSelect('male')}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: activeFilter && activeFilter !== 'male' ? 0.6 : 1,
                                    transform: activeFilter === 'male' ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: activeFilter === 'male' ? '0 8px 25px rgba(67, 203, 255, 0.5)' : '0 4px 15px rgba(67, 203, 255, 0.2)',
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
                                onClick={() => handleCardSelect('other')}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #A1A1A1 0%, #6C63FF 100%)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: activeFilter && activeFilter !== 'other' ? 0.6 : 1,
                                    transform: activeFilter === 'other' ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: activeFilter === 'other' ? '0 8px 25px rgba(108, 99, 255, 0.5)' : '0 4px 15px rgba(108, 99, 255, 0.2)',
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

                {/* Action Buttons - Add here, aligned to the right */}
                <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 2}}>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            startIcon={<GroupAdd/>}
                            onClick={openCreateDialog}
                            sx={{
                                color: 'white',
                                backgroundColor: '#2d4149',
                                borderRadius: 10,
                                textTransform: "none",
                                boxShadow: 3
                            }}
                        >
                            Danışan Ekle
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<NotificationsIcon/>}
                            onClick={openBulkNotificationDialog}
                            sx={{
                                color: 'white',
                                backgroundColor: '#2d4149',
                                borderRadius: 10,
                                textTransform: "none",
                                boxShadow: 3
                            }}
                        >
                            Toplu Bildirim Gönder
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon/>}
                            onClick={() => setImportDialogOpen(true)}
                            sx={{
                                color: 'white',
                                backgroundColor: '#2d4149',
                                borderRadius: 10,
                                textTransform: "none",
                                boxShadow: 3
                            }}
                        >
                            İçe Aktar
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<UploadIcon/>}
                            onClick={handleExportCSV}
                            sx={{
                                color: 'white',
                                backgroundColor: '#2d4149',
                                borderRadius: 10,
                                textTransform: "none",
                                boxShadow: 3
                            }}
                        >
                            Dışa Aktar
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<QrCodeIcon/>}
                            onClick={fetchQR}
                            sx={{
                                color: 'white',
                                backgroundColor: '#2d4149',
                                borderRadius: 10,
                                textTransform: "none",
                                boxShadow: 3
                            }}
                        >
                            QR'ımı Göster
                        </Button>
                    </Stack>
                </Box>

                {/* Data Grid */}
                <Paper elevation={2} sx={{height: "65vh", width: "100%"}}>
                    <DataGrid
                        localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
                        rows={filteredClients}
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
                            // Hücre seçiminde oluşan çerçeveyi kaldırma
                            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                                outline: "none",
                            },
                            "& .MuiDataGrid-cell.Mui-selected, & .MuiDataGrid-cell.Mui-selected:hover, & .MuiDataGrid-cell.Mui-selected:focus": {
                                outline: "none",
                                border: "none",
                                boxShadow: "none",
                            },
                        }}
                    />
                </Paper>

                {/* Import Dialog */}
                <Dialog
                    open={importDialogOpen}
                    onClose={() => setImportDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{
                        backgroundColor: 'primary.main',
                        color: 'orange',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <DownloadIcon/>
                            <Typography variant="h6" sx={{color: 'green', fontWeight: 'bold'}}>
                                İçe Aktar
                            </Typography>
                        </Box>
                        <IconButton
                            edge="end"
                            onClick={() => setImportDialogOpen(false)}
                            aria-label="close"
                            sx={{color: 'red'}}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Stack spacing={3} sx={{mt: 1}}>
                            <Typography variant="body1">
                                Excel dosyanız aşağıdaki sütunları içermelidir:
                            </Typography>
                            <ul>
                                <li><Typography variant="body2">isim - Danışan Adı Soyadı (zorunlu)</Typography></li>
                                <li><Typography variant="body2">telefon - Telefon Numarası (zorunlu, 10
                                    haneli)</Typography></li>
                                <li><Typography variant="body2">cinsiyet - Cinsiyet (zorunlu, "Erkek", "Kadın" veya
                                    "Diğer")</Typography></li>
                                <li><Typography variant="body2">mail - E-posta Adresi (opsiyonel)</Typography></li>
                            </ul>
                            <Typography variant="body2" color="text.secondary">
                                Not: Şifreler otomatik olarak oluşturulacaktır ve tüm danışanlar aktif olarak
                                eklenecektir.
                            </Typography>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<DownloadIcon/>}
                                sx={{mt: 2}}
                            >
                                Excel Dosyası Seç
                                <input
                                    type="file"
                                    accept=".csv"
                                    hidden
                                    onChange={handleCsvFileUpload}
                                />
                            </Button>
                            <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
                                Örnek Excel formatı:
                            </Typography>
                            <code style={{
                                backgroundColor: '#f5f5f5',
                                padding: '10px',
                                borderRadius: '4px',
                                display: 'block',
                                overflowX: 'auto'
                            }}>
                                isim,telefon,cinsiyet,mail<br/>
                                "Ahmet Yılmaz","5551234567","Erkek","ahmet@example.com"<br/>
                                "Ayşe Demir","5559876543","Kadın","ayse@example.com"
                            </code>
                        </Stack>
                    </DialogContent>
                </Dialog>

                {/* CSV Preview Dialog */}
                <Dialog
                    open={importPreviewOpen}
                    onClose={() => setImportPreviewOpen(false)}
                    maxWidth="lg"
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
                            <GroupAdd sx={{color: 'orange'}}/>
                            <Typography variant="h6" sx={{color: 'green', fontWeight: 'bold'}}>
                                İçe Aktarılacak Danışanlar
                            </Typography>
                        </Box>
                        <IconButton
                            edge="end"
                            onClick={() => setImportPreviewOpen(false)}
                            aria-label="close"
                            sx={{color: 'red'}}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                            {csvData.length} danışan bulundu. Bilgileri kontrol edip düzenleyebilirsiniz.
                            {Object.keys(csvErrors).length > 0 && (
                                <Typography variant="body2" color="error" sx={{mt: 1}}>
                                    Lütfen işaretli hataları düzeltin.
                                </Typography>
                            )}
                        </Typography>
                        <TableContainer component={Paper} sx={{maxHeight: '60vh'}}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>İsim</TableCell>
                                        <TableCell>Telefon</TableCell>
                                        <TableCell>Cinsiyet</TableCell>
                                        <TableCell>E-posta</TableCell>
                                        <TableCell>Şifre</TableCell>
                                        <TableCell>İşlemler</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {csvData.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={row.name || ''}
                                                    onChange={(e) => handleCsvRowChange(index, 'name', e.target.value)}
                                                    error={csvErrors[index]?.name !== undefined}
                                                    helperText={csvErrors[index]?.name}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={row.phoneNumber || ''}
                                                    onChange={(e) => handleCsvRowChange(index, 'phoneNumber', e.target.value)}
                                                    error={csvErrors[index]?.phoneNumber !== undefined}
                                                    helperText={csvErrors[index]?.phoneNumber}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment
                                                            position="start">+90</InputAdornment>,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormControl fullWidth size="small"
                                                             error={csvErrors[index]?.gender !== undefined}>
                                                    <Select
                                                        value={row.gender || ''}
                                                        onChange={(e) => handleCsvRowChange(index, 'gender', e.target.value)}
                                                    >
                                                        <MenuItem value="Erkek">Erkek</MenuItem>
                                                        <MenuItem value="Kadın">Kadın</MenuItem>
                                                        <MenuItem value="Diğer">Diğer</MenuItem>
                                                    </Select>
                                                    {csvErrors[index]?.gender && (
                                                        <Typography variant="caption" color="error">
                                                            {csvErrors[index].gender}
                                                        </Typography>
                                                    )}
                                                </FormControl>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={row.email || ''}
                                                    onChange={(e) => handleCsvRowChange(index, 'email', e.target.value)}
                                                    error={csvErrors[index]?.email !== undefined}
                                                    helperText={csvErrors[index]?.email}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={row.password || ''}
                                                    onChange={(e) => handleCsvRowChange(index, 'password', e.target.value)}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    edge="end"
                                                                    title="Yeni şifre oluştur"
                                                                    onClick={() => {
                                                                        const newPassword = generateRandomPassword();
                                                                        handleCsvRowChange(index, 'password', newPassword);
                                                                    }}
                                                                >
                                                                    <VpnKey fontSize="small"/>
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleCsvRowDelete(index)}
                                                >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                    <DialogActions sx={{p: 2, justifyContent: 'flex-end'}}>
                        <Button
                            onClick={handleImportSubmit}
                            variant="contained"
                            startIcon={<GroupAdd/>}
                            disabled={Object.keys(csvErrors).length > 0 || csvData.length === 0}
                        >
                            {csvData.length} Danışanı Ekle
                        </Button>
                    </DialogActions>
                </Dialog>

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
                <Dialog open={qrDialogOpen} onClose={closeQrDialog}>
                    <DialogTitle sx={{
                        backgroundColor: 'primary.main',
                        color: 'orange',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <QrCodeIcon/>
                            <Typography variant="h6" sx={{color: 'green', fontWeight: 'bold'}}>
                                QR Kodunuz
                            </Typography>
                        </Box>
                        <IconButton
                            edge="end"
                            onClick={() => closeQrDialog(false)}
                            aria-label="close"
                            sx={{color: 'red'}}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers sx={{display: "flex", alignItems: "center"}}>
                        {qrData ? (
                            <img src={qrData} alt="Dietisyen QR" style={{maxWidth: "25rem", margin: "20px 0"}}/>
                        ) : (
                            <Typography>Yükleniyor…</Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeQrDialog} variant="outlined" color="secondary">
                            Kapat
                        </Button>
                        {qrData && (
                            <PDFDownloadLink
                                document={<QRDocument qrData={qrData}/>}
                                fileName="diyetisyen-qr.pdf"
                                style={{textDecoration: 'none'}}
                            >
                                {({blob, url, loading, error}) =>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Yükleniyor...' : 'PDF İndir'}
                                    </Button>
                                }
                            </PDFDownloadLink>
                        )}
                    </DialogActions>
                </Dialog>

                {/* Create Client Dialog */}
                <Dialog
                    open={createDialogOpen}
                    onClose={closeCreateDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'visible'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GroupAdd sx={{ color: 'orange' }} />
                            <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                                Yeni Danışan Ekle
                            </Typography>
                        </Box>
                        <IconButton
                            edge="end"
                            color="primary.secondary"
                            onClick={closeCreateDialog}
                            aria-label="close"
                        >
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>
                    <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
                        <DialogContent dividers sx={{ overflowY: 'auto', flex: '1 1 auto' }}>
                            <Stack spacing={3} sx={{mt: 1, overflowY: 'auto', maxHeight: '60vh'}}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Adı Soyadı"
                                    name="name"
                                    value={newClient.name}
                                    onChange={handleInputChange}
                                    margin="normal"
                                    error={!!formErrors.name}
                                    helperText={formErrors.name || "Danışanın tam adını giriniz"}
                                    autoComplete="name"
                                    inputProps={{maxLength: 50}}
                                />


                                <TextField
                                    fullWidth
                                    required
                                    label="Telefon Numarası"
                                    name="phoneNumber"
                                    value={newClient.phoneNumber}
                                    onChange={handlePhoneChange}
                                    margin="normal"
                                    error={!!formErrors.phoneNumber}
                                    helperText={formErrors.phoneNumber || "10 haneli telefon numarası"}
                                    autoComplete="tel"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">+90</InputAdornment>,
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    required
                                    label="Şifre"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={newClient.password}
                                    onChange={handleInputChange}
                                    margin="normal"
                                    error={!!formErrors.password}
                                    helperText={formErrors.password || "En az 6 karakter olmalıdır"}
                                    autoComplete="new-password"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    title={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                                                >
                                                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                                                </IconButton>
                                                <IconButton
                                                    onClick={generatePassword}
                                                    edge="end"
                                                    title="Otomatik şifre üret"
                                                >
                                                    <VpnKey/>
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />


                                <TextField
                                    fullWidth
                                    label="E-posta (Opsiyonel)"
                                    name="email"
                                    type="email"
                                    value={newClient.email}
                                    onChange={handleInputChange}
                                    margin="normal"
                                    error={!!formErrors.email}
                                    helperText={formErrors.email || "Geçerli bir e-posta adresi giriniz"}
                                    autoComplete="email"
                                />


                                <FormControl fullWidth margin="normal" required error={!!formErrors.gender}>
                                    <InputLabel>Cinsiyet *</InputLabel>
                                    <Select
                                        name="gender"
                                        value={newClient.gender}
                                        onChange={handleInputChange}
                                        label="Cinsiyet *"
                                    >
                                        <MenuItem value="">
                                            <em>Seçiniz...</em>
                                        </MenuItem>
                                        <MenuItem value="Erkek">Erkek</MenuItem>
                                        <MenuItem value="Kadın">Kadın</MenuItem>
                                        <MenuItem value="Diğer">Diğer</MenuItem>
                                    </Select>
                                    {formErrors.gender && (
                                        <Typography color="error" variant="caption" sx={{ml: 2, mt: 0.5}}>
                                            {formErrors.gender}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{p: 2, justifyContent: 'flex-end', flex: '0 0 auto', position: 'sticky', bottom: 0, bgcolor: 'background.paper', borderTop: '1px solid rgba(0, 0, 0, 0.12)'}}>
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

                {/* Delete Inactive Confirmation Dialog */}
                <Dialog open={deleteInactiveDialogOpen} onClose={() => setDeleteInactiveDialogOpen(false)}>
                    <DialogTitle>İnaktif Danışanları Sil</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Tüm inaktif danışanları silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteInactiveDialogOpen(false)} variant="outlined" color="secondary">
                            Vazgeç
                        </Button>
                        <Button
                            onClick={async () => {
                                try {
                                    // İnaktif danışanları filtrele
                                    const inactiveClients = clients.filter(c => c.status === "Pasif");

                                    // Her bir inaktif danışanı sırayla sil
                                    for (const client of inactiveClients) {
                                        await handleDelete(client.id);
                                    }

                                    setSnackbar({
                                        open: true,
                                        message: "Tüm pasif danışanlar başarıyla temizlendi.",
                                        severity: "success"
                                    });
                                } catch (error) {
                                    console.error("Pasif danışanlar temizlenirken hata oluştu:", error);
                                    setSnackbar({
                                        open: true,
                                        message: "Pasif danışanlar temizlenirken bir hata oluştu",
                                        severity: "error"
                                    });
                                } finally {
                                    setDeleteInactiveDialogOpen(false);
                                }
                            }}
                            variant="contained" color="error"
                        >
                            Sil
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Notification Dialog */}
                <Dialog
                    open={notificationDialogOpen}
                    onClose={closeNotificationDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{
                        backgroundColor: 'primary.main',
                        color: 'orange',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <NotificationsIcon />
                            <Typography variant="h6" sx={{color: 'green', fontWeight: 'bold'}}>
                                Bildirim Gönder - {selectedClientForNotification?.name}
                            </Typography>
                        </Box>
                        <IconButton
                            edge="end"
                            onClick={closeNotificationDialog}
                            aria-label="close"
                            sx={{color: 'red'}}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Stack spacing={3} sx={{mt: 1}}>
                            <TextField
                                fullWidth
                                required
                                label="Bildirim İçeriği"
                                value={notificationData.body}
                                onChange={(e) => setNotificationData(prev => ({...prev, body: e.target.value}))}
                                margin="normal"
                                autoComplete="off"
                                inputProps={{maxLength: 500}}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeNotificationDialog} variant="outlined" color="secondary">
                            Vazgeç
                        </Button>
                        <Button
                            onClick={handleSendNotification}
                            variant="contained"
                            color="primary"
                            disabled={!notificationData.body}
                        >
                            Gönder
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Toplu Bildirim Dialog */}
                <Dialog
                    open={bulkNotificationDialogOpen}
                    onClose={closeBulkNotificationDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{
                        backgroundColor: 'primary.main',
                        color: 'orange',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <NotificationsIcon />
                            <Typography variant="h6" sx={{color: 'green', fontWeight: 'bold'}}>
                                Tüm Danışanlara Bildirim Gönder
                            </Typography>
                        </Box>
                        <IconButton
                            edge="end"
                            onClick={closeBulkNotificationDialog}
                            aria-label="close"
                            sx={{color: 'red'}}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Stack spacing={3} sx={{mt: 1}}>
                            <Typography variant="body2" color="text.secondary">
                                {filteredClients.length} danışana bildirim gönderilecektir.
                                {activeFilter && ` (Filtre: ${activeFilter === 'all' ? 'Tümü' :
                                    activeFilter === 'active' ? 'Aktif' :
                                        activeFilter === 'inactive' ? 'Pasif' :
                                            activeFilter === 'female' ? 'Kadın' :
                                                activeFilter === 'male' ? 'Erkek' : 'Diğer'})`}
                            </Typography>
                            <TextField
                                fullWidth
                                required
                                label="Bildirim İçeriği"
                                value={bulkNotificationData.body}
                                onChange={(e) => setBulkNotificationData(prev => ({...prev, body: e.target.value}))}
                                margin="normal"
                                autoComplete="off"
                                inputProps={{maxLength: 500}}
                                placeholder="Değerli danışanlarım, bugün ofisimiz 18:00'de kapanacaktır..."
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeBulkNotificationDialog} variant="outlined" color="secondary">
                            Vazgeç
                        </Button>
                        <Button
                            onClick={handleSendBulkNotification}
                            variant="contained"
                            color="primary"
                            disabled={!bulkNotificationData.body}
                            startIcon={<NotificationsIcon />}
                        >
                            {filteredClients.length} Danışana Gönder
                        </Button>
                    </DialogActions>
                </Dialog>
            </Stack>
        </Default>
    );
}
