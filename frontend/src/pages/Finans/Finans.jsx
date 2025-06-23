import React, {useEffect, useMemo, useState} from 'react';
import './Finans.css';
import Default from "../../Components/Layouts/Default.jsx";
import axios from 'axios';
import config from "../../config.js";
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PaymentsIcon from '@mui/icons-material/Payments';
import PendingIcon from '@mui/icons-material/Pending';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';

import {DataGrid} from '@mui/x-data-grid';
import Papa from 'papaparse';
import {trTR} from "@mui/x-data-grid/locales";
import {showErrorToast, showSuccessToast} from '../../utils/toastUtil';

const CustomModal = ({isOpen, onClose, title, children}) => {
    const overlayRef = React.useRef(null);
    const [mouseDownTarget, setMouseDownTarget] = useState(null);

    if (!isOpen) return null;

    const handleOverlayMouseDown = (e) => {
        setMouseDownTarget(e.target);
    };
    const handleOverlayMouseUp = (e) => {
        if (e.target === overlayRef.current && mouseDownTarget === overlayRef.current) {
            onClose();
        }
        setMouseDownTarget(null);
    };

    return (
        <div
            className="custom-modal-overlay"
            ref={overlayRef}
            onMouseDown={handleOverlayMouseDown}
            onMouseUp={handleOverlayMouseUp}
        >
            <div className="custom-modal">
                <div className="custom-modal-header">
                    <h2>{title}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="custom-modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ConfirmationDialog = ({isOpen, onClose, onConfirm, title, message, itemName, isLoading}) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (!isLoading && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="custom-modal-overlay" onClick={handleOverlayClick}>
            <div className="custom-modal delete-warning-modal">
                <div className="custom-modal-header warning-header">
                    <h2><WarningIcon className="warning-icon"/> {title}</h2>
                    <button className="close-button" onClick={onClose} disabled={isLoading}>&times;</button>
                </div>
                <div className="custom-modal-content">
                    <div className="delete-confirm-modal">
                        <p className="warning-text">
                            <strong>{itemName}</strong> {message}
                        </p>
                        <p className="delete-note">Bu işlem geri alınamaz.</p>
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn cancel-btn"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Vazgeç
                    </button>
                    <button
                        className="modal-btn delete-confirm-btn"
                        onClick={() => {
                            onConfirm();
                            if (!isLoading) {
                                onClose();
                            }
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Siliniyor...' : 'Sil'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Finans() {
    const [tabValue, setTabValue] = useState(0);

    // Packages state
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Add clients state
    const [clients, setClients] = useState([]);

    // Sample data for invoices
    const [invoices, setInvoices] = useState([]);

    // Package management state
    const [packageDialogOpen, setPackageDialogOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState(null);
    const [newPackage, setNewPackage] = useState({
        name: "",
        type: "Seanslık",
        price: 0,
        description: "",
        services: [],
        serviceItems: []
    });

    const [packageSearchTerm, setPackageSearchTerm] = useState('');
    const [packageFormErrors, setPackageFormErrors] = useState({});

    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [csvData, setCsvData] = useState([]);
    const [csvErrors, setCsvErrors] = useState({});
    const [importPreviewOpen, setImportPreviewOpen] = useState(false);

    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 25);

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 10);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [invoicesPerPage] = useState(6);
    const [reminderDisabledIds, setReminderDisabledIds] = useState({});

    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        itemId: null,
        itemType: null,
        itemName: ''
    });

    // Package management state
    const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [newInvoice, setNewInvoice] = useState({
        clientName: "",
        clientId: 0,
        packageId: 0,
        packageName: "",
        amount: 0,
        status: "Beklemede",
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: ""
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Fetch packages on component mount
    useEffect(() => {
        fetchPackages();
        fetchClients();
        fetchInvoices();
        setNewPackage(prev => ({
            ...prev,
            services: [""]
        }));
    }, []);

    // API Functions
    const fetchPackages = async () => {
        setIsLoading(true);
        try {
            // Ensure config is available and properly structured
            const apiUrl = config && config[config.environment] && config[config.environment].apiUrl
                ? `${config[config.environment].apiUrl}/package/getMyPackages`
                : '/package/getMyPackages';

            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            const packagesData = response.data;

            // Fetch services for each package
            const packagesWithServices = await Promise.all(
                packagesData.map(async (pkg) => {
                    const servicesUrl = config && config[config.environment] && config[config.environment].apiUrl
                        ? `${config[config.environment].apiUrl}/package/getPackageItemsFromPackage?package_id=${pkg.id}`
                        : `/package/getPackageItemsFromPackage?package_id=${pkg.id}`;

                    const servicesResponse = await axios.get(servicesUrl, {
                        headers: {
                            Authorization: localStorage.getItem("token"),
                        },
                    });
                    const services = servicesResponse.data.map(item => item.name);
                    return {...pkg, services};
                })
            );

            setPackages(packagesWithServices);
        } catch (error) {
            console.error('Error fetching packages:', error);
            showErrorToast('Paketler yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    // Add function to fetch clients
    const fetchClients = async () => {
        try {
            // Ensure config is available and properly structured
            const apiUrl = config && config[config.environment] && config[config.environment].apiUrl
                ? `${config[config.environment].apiUrl}/dietitian/getAllMyClients`
                : '/dietitian/getAllMyClients';

            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
            showErrorToast('Danışanlar yüklenirken bir hata oluştu.');
        }
    };

    const sendPaymentReminder = async (invoice) => {
        try {
            // Butonu devre dışı bırak
            setReminderDisabledIds(prev => ({...prev, [invoice.id]: true}));

            const apiUrl = `${config[config.environment].apiUrl}/notification/sendPaymentReminderNotification`;

            let formattedDate = "";
            if (invoice.dueDate) {
                const dateObj = new Date(invoice.dueDate);
                formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getFullYear()}`;
            }

            const reminderData = {
                client_id: invoice.clientId,
                due_date: formattedDate,
                amount: invoice.amount
            };

            await axios.post(apiUrl, reminderData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });

            showSuccessToast(`${invoice.clientName} adlı danışana ödeme hatırlatma bildirimi başarıyla gönderildi.`);

            // 5 saniye sonra butonu tekrar etkinleştir
            setTimeout(() => {
                setReminderDisabledIds(prev => {
                    const newState = {...prev};
                    delete newState[invoice.id];
                    return newState;
                });
            }, 5000);

            return true;
        } catch (error) {
            // Hata durumunda butonu hemen etkinleştir
            setReminderDisabledIds(prev => {
                const newState = {...prev};
                delete newState[invoice.id];
                return newState;
            });

            console.error("Ödeme hatırlatma bildirimi gönderilirken hata oluştu:", error);
            showErrorToast("Ödeme hatırlatma bildirimi gönderilirken bir hata oluştu.");
            return false;
    }
    };

    // Fetch invoices from backend
    const fetchInvoices = async () => {
        setIsLoading(true);
        try {
            const apiUrl = `${config[config.environment].apiUrl}/invoice/getMyInvoices`;
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            const invoicesData = response.data.map(inv => ({
                id: inv.id,
                clientId: inv.client_id,
                clientName: inv.Client?.name || '',
                packageId: inv.package_id,
                packageName: inv.Package?.name || '',
                amount: Number(inv.amount),
                paid_amount: Number(inv.paid_amount),
                status:
                    inv.status === 'paid' ? 'Ödendi' :
                    inv.status === 'partiallypaid' ? 'Kısmi Ödeme' :
                    inv.status === 'unpaid' ? 'Beklemede' :
                    inv.status === 'cancelled' ? 'Ödenmedi' : inv.status,
                issueDate: inv.issueDate ? inv.issueDate.split('T')[0] : '',
                dueDate: inv.dueDate ? inv.dueDate.split('T')[0] : '',
                description: inv.description || '',
            }));
            setInvoices(invoicesData);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            showErrorToast('Faturalar yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const getPackageDurationInMonths = (packageType) => {
        switch (packageType) {
            case "Seanslık":
                return 1;
            case "Aylık":
                return 1;
            case "3 Aylık":
                return 3;
            case "6 Aylık":
                return 6;
            case "1 Yıllık":
                return 12;
            default:
                return 1;
        }
    };

    const shouldProrate = (packageType) => {
        return packageType !== "Seanslık";
    };

    // Filter invoices based on search term and status filter
    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const matchesSearch =
                (invoice?.clientName?.toLowerCase() || '').includes((searchTerm || '').toLowerCase()) ||
                (invoice?.packageName?.toLowerCase() || '').includes((searchTerm || '').toLowerCase());
            const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchTerm, statusFilter]);

    // DataGrid columns for invoices
    const invoiceColumns = [
        {
            field: "clientName",
            headerName: "Danışan",
            flex: 1,
            editable: false
        },
        {
            field: "description",
            headerName: "Açıklama",
            flex: 1,
            editable: false,
        },
        {
            field: "amount",
            headerName: "Tutar",
            editable: false,
            renderCell: (params) => {
                if (params.row.status === "Kısmi Ödeme") {
                    return (
                        <div>{params.row.paid_amount.toLocaleString()} ₺ ödendi</div>
                    );
                }
                return `${params.value.toLocaleString()} ₺`;
            }
        },
        {
            field: "status",
            headerName: "Durum",
            width: 120,
            editable: false,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={
                        params.value === "Ödendi" ? "success" :
                        params.value === "Beklemede" ? "warning" :
                        params.value === "Kısmi Ödeme" ? "info" : "error"
                    }
                    size="small"
                />
            ),
        },
        {
            field: "issueDate",
            headerName: "Fatura Tarihi",
            editable: false,
            valueFormatter: (params) => {
                if (params === undefined || params === null) return '';
                const date = new Date(params);
                if (isNaN(date.getTime())) {
                    return '';
                }
                return date.toLocaleDateString('tr-TR');
            }
        },
        {
            field: "dueDate",
            headerName: "Son Ödeme",
            editable: false,
            valueFormatter: (params) => {
                if (params === undefined || params === null) return '';
                const date = new Date(params);
                if (isNaN(date.getTime())) {
                    return '';
                }
                return date.toLocaleDateString('tr-TR');
            }
        },
        {
            field: "actions",
            headerName: "İşlemler",
            width: 375,
            sortable: false,
            filterable: false,
            editable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <FormControl size="small" sx={{minWidth: 110}}>
                        <Select
                            value={params.row.status}
                            onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
                            size="small"
                            variant="outlined"
                        >
                            <MenuItem value="Ödendi">Ödendi</MenuItem>
                            <MenuItem value="Kısmi Ödeme">Kısmi Ödeme</MenuItem>
                            <MenuItem value="Beklemede">Beklemede</MenuItem>
                            <MenuItem value="Ödenmedi">Ödenmedi</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenInvoiceDialog(params.row)}
                    >
                        <EditIcon fontSize="small"/>
                    </Button>
                    <Button
                        size="medium"
                        variant="contained"
                        color="info"
                        onClick={() => sendPaymentReminder(params.row)}
                        disabled={reminderDisabledIds[params.row.id]}
                    >
                        <NotificationsActiveIcon fontSize="small"/>
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleDeleteInvoice(params.row.id)}
                    >
                        <DeleteIcon fontSize="small"/>
                    </Button>
                </Stack>
            ),
        },
    ];

    const currentMonthPaid = invoices
        .filter(invoice => {
            const invoiceDate = new Date(invoice.issueDate);
            const currentDate = new Date();
            return invoiceDate.getMonth() === currentDate.getMonth() &&
                invoiceDate.getFullYear() === currentDate.getFullYear() &&
                (invoice.status === "Ödendi" || invoice.status === "Kısmi Ödeme");
        })
        .reduce((total, invoice) => {
            const pkg = packages.find(p => p.id === invoice.packageId);
            const amount = invoice.status === "Kısmi Ödeme" ? invoice.paid_amount : invoice.amount;

            if (!pkg) return total + amount;

            if (shouldProrate(pkg.type)) {
                const durationInMonths = getPackageDurationInMonths(pkg.type);
                const proratedAmount = amount / durationInMonths;
                return total + proratedAmount;
            } else {
                return total + amount;
            }
        }, 0);

    const currentMonthUnpaid = invoices
        .filter(invoice => {
            const invoiceDate = new Date(invoice.issueDate);
            const currentDate = new Date();
            return invoiceDate.getMonth() === currentDate.getMonth() &&
                invoiceDate.getFullYear() === currentDate.getFullYear() &&
                invoice.status !== "Ödendi";
        })
        .reduce((total, invoice) => {
            const pkg = packages.find(p => p.id === invoice.packageId);
            if (!pkg) return total + invoice.amount;

            if (shouldProrate(pkg.type)) {
                const durationInMonths = getPackageDurationInMonths(pkg.type);
                const proratedAmount = invoice.amount / durationInMonths;
                return total + proratedAmount;
            } else {
                return total + invoice.amount;
            }
        }, 0);

    const totalRevenue = currentMonthPaid + currentMonthUnpaid;

    const allTimeTotalRevenue = invoices;

    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
    const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        const invoiceSection = document.getElementById('invoice-list');
        if (invoiceSection) {
            invoiceSection.scrollIntoView({behavior: 'smooth'});
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getMonthlyComparison = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthTotal = invoices
            .filter(invoice => {
                const invoiceDate = new Date(invoice.issueDate);
                return invoiceDate.getMonth() === currentMonth &&
                    invoiceDate.getFullYear() === currentYear;
            })
            .reduce((total, invoice) => {
                const pkg = packages.find(p => p.id === invoice.packageId);
                const amount = invoice.status === "Kısmi Ödeme" ? invoice.paid_amount : invoice.amount;

                if (!pkg) return total + amount;

                if (shouldProrate(pkg.type)) {
                    const durationInMonths = getPackageDurationInMonths(pkg.type);
                    const proratedAmount = amount / durationInMonths;
                    return total + proratedAmount;
                } else {
                    return total + amount;
                }
            }, 0);

        const lastMonthTotal = invoices
            .filter(invoice => {
                const invoiceDate = new Date(invoice.issueDate);
                return invoiceDate.getMonth() === lastMonth &&
                    invoiceDate.getFullYear() === lastMonthYear;
            })
            .reduce((total, invoice) => {
                const pkg = packages.find(p => p.id === invoice.packageId);
                const amount = invoice.status === "Kısmi Ödeme" ? invoice.paid_amount : invoice.amount;

                if (!pkg) return total + amount;

                if (shouldProrate(pkg.type)) {
                    const durationInMonths = getPackageDurationInMonths(pkg.type);
                    const proratedAmount = amount / durationInMonths;
                    return total + proratedAmount;
                } else {
                    return total + amount;
                }
            }, 0);

        const difference = currentMonthTotal - lastMonthTotal;
        const percentChange = lastMonthTotal === 0
            ? 100
            : Math.round((difference / lastMonthTotal) * 100);

        return {
            current: currentMonthTotal,
            last: lastMonthTotal,
            difference,
            percentChange,
            increased: difference >= 0
        };
    };

    const getPaymentStatusBreakdown = () => {
        const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

        const paid = invoices
            .filter(invoice => invoice.status === "Ödendi")
            .reduce((sum, invoice) => sum + invoice.amount, 0);

        const partiallyPaid = invoices
            .filter(invoice => invoice.status === "Kısmi Ödeme")
            .reduce((sum, invoice) => sum + invoice.paid_amount, 0);

        const pending = invoices
            .filter(invoice => invoice.status === "Beklemede")
            .reduce((sum, invoice) => sum + invoice.amount, 0);

        const unpaid = invoices
            .filter(invoice => invoice.status === "Ödenmedi")
            .reduce((sum, invoice) => sum + invoice.amount, 0);

        const totalPaid = paid + partiallyPaid;

        return {
            paid: totalPaid,
            pending,
            unpaid,
            paidPercent: totalInvoiceAmount === 0 ? 0 : Math.round((totalPaid / totalInvoiceAmount) * 100),
            pendingPercent: totalInvoiceAmount === 0 ? 0 : Math.round((pending / totalInvoiceAmount) * 100),
            unpaidPercent: totalInvoiceAmount === 0 ? 0 : Math.round((unpaid / totalInvoiceAmount) * 100)
        };
    };

    // Package management handlers
    const handleOpenPackageDialog = async (pkg = null) => {
        // Reset any form errors
        setPackageFormErrors({});

        if (pkg) {
            setCurrentPackage(pkg);

            try {
                // Ensure config is available and properly structured
                const servicesUrl = config && config[config.environment] && config[config.environment].apiUrl
                    ? `${config[config.environment].apiUrl}/package/getPackageItemsFromPackage?package_id=${pkg.id}`
                    : `/package/getPackageItemsFromPackage?package_id=${pkg.id}`;

                const servicesResponse = await axios.get(servicesUrl, {
                    headers: {
                        Authorization: localStorage.getItem("token"),
                    },
                });

                // Get service items and names
                const serviceItems = servicesResponse.data;
                const serviceNames = serviceItems.map(item => item.name);

                // Don't add an empty service if there are no services
                // Let the user add services if they want to

                setNewPackage({
                    ...pkg,
                    services: serviceNames,
                    serviceItems: serviceItems
                });
            } catch (error) {
                console.error('Error fetching package items:', error);
                showErrorToast('Paket hizmetleri yüklenirken bir hata oluştu.');
                setNewPackage({...pkg, services: [], serviceItems: []});
            }
        } else {
            setCurrentPackage(null);
            setNewPackage({
                name: "",
                type: "Seanslık",
                price: "",
                description: "",
                services: [], // Start with no services
                serviceItems: []
            });
        }
        setPackageDialogOpen(true);
    };

    const handleClosePackageDialog = () => {
        setPackageDialogOpen(false);
        setCurrentPackage(null);
        // Reset form errors
        setPackageFormErrors({});
        // Reset the form data when closing
        setNewPackage({
            name: "",
            type: "Seanslık",
            price: "",
            description: "",
            services: [], // No default services
            serviceItems: []
        });
    };

    const handlePackageChange = (field, value) => {
        setNewPackage({
            ...newPackage,
            [field]: value
        });

        // Clear error for this field if it exists
        if (packageFormErrors[field]) {
            setPackageFormErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleServiceChange = (index, value) => {
        const updatedServices = [...newPackage.services];
        updatedServices[index] = value;
        setNewPackage({
            ...newPackage,
            services: updatedServices
        });
    };

    const handleAddService = () => {
        setNewPackage({
            ...newPackage,
            services: [...newPackage.services, ""]
        });
    };

    const handleRemoveService = (index) => {
        const updatedServices = [...newPackage.services];
        updatedServices.splice(index, 1);
        setNewPackage({
            ...newPackage,
            services: updatedServices
        });
    };

    const handleSavePackage = async () => {
        // Reset previous errors
        const errors = {};

        // Validate all required fields
        if (!newPackage.name || newPackage.name.trim() === "") {
            errors.name = "Lütfen paket adını girin";
        }

        if (!newPackage.type) {
            errors.type = "Lütfen paket tipini seçin";
        }

        if (newPackage.price === "" || newPackage.price === null || isNaN(newPackage.price) || newPackage.price <= 0) {
            errors.price = "Lütfen geçerli bir fiyat girin";
        }

        // Note: Paket İçeriği is now optional, so we removed that validation

        // If we have validation errors, show them and stop
        if (Object.keys(errors).length > 0) {
            setPackageFormErrors(errors);
            return;
        }

        setIsLoading(true);
        try {
            let savedPackage;

            // Get base API URL with safe access
            const getApiUrl = (endpoint) => {
                return config && config[config.environment] && config[config.environment].apiUrl
                    ? `${config[config.environment].apiUrl}${endpoint}`
                    : endpoint;
            };

            const authHeaders = {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            };

            if (currentPackage) {
                // Update existing package
                const packageData = {
                    package_id: currentPackage.id,
                    name: newPackage.name,
                    description: newPackage.description,
                    type: newPackage.type,
                    price: parseInt(newPackage.price, 10) // Ensure price is sent as a number
                };

                const response = await axios.put(
                    getApiUrl('/package/updatePackage'),
                    packageData,
                    authHeaders
                );
                savedPackage = response.data;

                // Get existing services for the package
                const existingServicesResponse = await axios.get(
                    getApiUrl(`/package/getPackageItemsFromPackage?package_id=${currentPackage.id}`),
                    authHeaders
                );
                const existingServices = existingServicesResponse.data;

                // Track which services to delete
                const servicesToRemove = existingServices.filter(
                    existing => !newPackage.services.includes(existing.name)
                );

                // Delete services that are no longer in the updated list
                for (const serviceToRemove of servicesToRemove) {
                    await axios.delete(
                        getApiUrl(`/package/deletePackageItem?item_id=${serviceToRemove.id}`),
                        authHeaders
                    );
                }

                // Update or add services
                for (const serviceName of newPackage.services) {
                    if (!serviceName.trim()) continue; // Skip empty services

                    const existingService = existingServices.find(s => s.name === serviceName);

                    if (existingService) {
                        // Service exists but needs to be updated (only if name changed)
                        if (existingService.name !== serviceName) {
                            await axios.put(
                                getApiUrl('/package/updatePackageItem'),
                                {
                                    item_id: existingService.id,
                                    name: serviceName
                                },
                                authHeaders
                            );
                        }
                    } else {
                        // Service is new, add it
                        await axios.post(
                            getApiUrl('/package/addPackageItem'),
                            {
                                package_id: savedPackage.id,
                                name: serviceName
                            },
                            authHeaders
                        );
                    }
                }

                showSuccessToast(
                    `${newPackage.name && newPackage.name.length > 20
                        ? newPackage.name.substring(0, 15) + '...'
                        : newPackage.name
                    } paketi güncellendi.`
                );
            } else {
                // Create new package
                const packageData = {
                    name: newPackage.name,
                    description: newPackage.description,
                    type: newPackage.type,
                    price: parseInt(newPackage.price, 10)
                };

                const response = await axios.post(
                    getApiUrl('/package/addPackage'),
                    packageData,
                    authHeaders
                );
                savedPackage = response.data;

                // Add services for the new package
                for (const serviceName of newPackage.services) {
                    if (serviceName.trim()) {
                        await axios.post(
                            getApiUrl('/package/addPackageItem'),
                            {
                                package_id: savedPackage.id,
                                name: serviceName
                            },
                            authHeaders
                        );
                    }
                }

                showSuccessToast(
                    `${newPackage.name && newPackage.name.length > 20
                        ? newPackage.name.substring(0, 15) + '...'
                        : newPackage.name
                    } paketi oluşturuldu.`
                );
            }

            // Refresh packages after saving
            await fetchPackages();
        } catch (error) {
            console.error('Error saving package:', error);
            showErrorToast('Paket kaydedilirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
            handleClosePackageDialog();
        }
    };

    const handleDeletePackage = (id) => {
        // Check if package is used in any invoices
        const isUsed = invoices.some(invoice => invoice.packageId === id);
        if (isUsed) {
            showErrorToast("Bu paket faturalarda kullanıldığı için silinemez.");
            return;
        }

        // Get the package name for the confirmation message
        const packageToDelete = packages.find(pkg => pkg.id === id);
        if (!packageToDelete) return;

        // Open confirmation dialog
        setDeleteConfirmation({
            isOpen: true,
            itemId: id,
            itemType: 'package',
            itemName: packageToDelete.name
        });
    };

    // Add the actual delete function that will be called after confirmation
    const confirmDelete = async () => {
        const {itemId, itemType, itemName} = deleteConfirmation;
        setIsLoading(true);

        try {
            // Get base API URL with safe access
            const getApiUrl = (endpoint) => {
                return config && config[config.environment] && config[config.environment].apiUrl
                    ? `${config[config.environment].apiUrl}${endpoint}`
                    : endpoint;
            };

            const authHeaders = {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            };

            if (itemType === 'package') {
                await axios.delete(
                    getApiUrl(`/package/deletePackage?package_id=${itemId}`),
                    authHeaders
                );
                showSuccessToast(`"${itemName}" paketi silindi.`);
                showSuccessToast(
                    `${itemName && itemName.length > 20
                        ? itemName.substring(0, 15) + '...'
                        : itemName
                    } paketi silindi.`
                );
                await fetchPackages(); // Refresh packages list
            } else if (itemType === 'invoice') {
                await axios.delete(getApiUrl(`/invoice/deleteInvoice?invoice_id=${itemId}`), authHeaders);
                showSuccessToast(`Fatura silindi.`);
                await fetchInvoices();
            }
        } catch (error) {
            console.error(`Error deleting ${itemType}:`, error);
            showErrorToast(`${itemType === 'package' ? 'Paket' : 'Fatura'} silinirken bir hata oluştu.`);
        } finally {
            setIsLoading(false);
        }
    };

    // Add helper function to validate date strings
    const isValidDateString = (dateStr) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    };

    // Add helper function to safely parse dates
    const safelyParseDate = (dateStr) => {
        try {
            if (!isValidDateString(dateStr)) return new Date();
            return new Date(dateStr);
        } catch (error) {
            console.error('Error parsing date:', error);
            return new Date(); // Return current date as fallback
        }
    };

    // Add helper function to safely format dates to ISO string
    const safelyFormatDate = (date) => {
        try {
            if (!date || isNaN(date.getTime())) {
                return new Date().toISOString().split('T')[0];
            }
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Error formatting date:', error);
            return new Date().toISOString().split('T')[0];
        }
    };

    // Update calculate due date function with better error handling
    const calculateDueDateFromPackageType = (issueDate, packageType) => {
        try {
            // Ensure we have a valid date object
            const dueDate = isValidDateString(issueDate)
                ? new Date(issueDate)
                : new Date();

            switch (packageType) {
                case "Seanslık":
                    dueDate.setDate(dueDate.getDate()); // +1 day
                    break;
                case "Aylık":
                    dueDate.setMonth(dueDate.getMonth() + 1); // +1 month
                    break;
                case "3 Aylık":
                    dueDate.setMonth(dueDate.getMonth() + 3); // +3 months
                    break;
                case "6 Aylık":
                    dueDate.setMonth(dueDate.getMonth() + 6); // +6 months
                    break;
                case "1 Yıllık":
                    dueDate.setFullYear(dueDate.getFullYear() + 1); // +1 year
                    break;
                default:
                    dueDate.setDate(dueDate.getDate() + 7); // Default: +7 days
            }

            return dueDate;
        } catch (error) {
            console.error('Error calculating due date:', error);
            // Return a safe default: current date + 7 days
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 7);
            return defaultDate;
        }
    };

    // Invoice management handlers
    const handleOpenInvoiceDialog = (invoice = null) => {
        // Always reset form first to clear any previous data
        setCurrentInvoice(null);
        // Reset any form errors
        setFormErrors({});

        if (invoice) {
            // If editing an existing invoice
            setCurrentInvoice(invoice);
            setNewInvoice({...invoice});
        } else {
            // If creating a new invoice, set default values
            const firstPackage = packages.length > 0 ? packages[0] : null;
            const today = new Date();
            let dueDate;

            if (firstPackage) {
                dueDate = calculateDueDateFromPackageType(today, firstPackage.type);
            } else {
                dueDate = new Date(today);
                dueDate.setDate(dueDate.getDate() + 7);
            }

            setNewInvoice({
                clientName: "",
                clientId: "",
                packageId: "",
                packageName: "",
                amount: 0,
                status: "Beklemede",
                issueDate: safelyFormatDate(today),
                dueDate: safelyFormatDate(dueDate),
                description: ""
            });
        }

        setInvoiceDialogOpen(true);
    };

    const handleCloseInvoiceDialog = () => {
        setInvoiceDialogOpen(false);
        setCurrentInvoice(null);
        setFormErrors({});
        setNewInvoice({
            clientName: "",
            clientId: "",
            packageId: "",
            packageName: "",
            amount: 0,
            status: "Beklemede",
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: ""
        });
    };

    const handleInvoiceChange = (field, value) => {
        setNewInvoice({
            ...newInvoice,
            [field]: value
        });

        // Clear error for this field if it exists
        if (formErrors[field]) {
            setFormErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[field];
                return newErrors;
            });
        }

        // Auto-update client name if client id changes
        if (field === 'clientId') {
            const selectedClient = clients.find(client => client.id === Number(value));
            if (selectedClient) {
                setNewInvoice(prev => ({
                    ...prev,
                    clientId: Number(value),
                    clientName: selectedClient.name
                }));
            }
        }

        if (field === 'status') {
            const updatedInvoice = {...newInvoice, [field]: value};

            if (value === "Ödendi") {
                updatedInvoice.paid_amount = updatedInvoice.amount;
            }
            else if (value === "Beklemede" || value === "Ödenmedi") {
                updatedInvoice.paid_amount = 0;
            }

            setNewInvoice(updatedInvoice);
        } else {
            setNewInvoice({
                ...newInvoice,
                [field]: value
            });
        }

        if (field === 'packageId') {
            const selectedPackage = packages.find(pkg => String(pkg.id) === String(value));
            if (selectedPackage) {
                try {
                    const issueDate = safelyParseDate(newInvoice.issueDate);
                    const dueDate = calculateDueDateFromPackageType(issueDate, selectedPackage.type);

                    setNewInvoice(prev => ({
                        ...prev,
                        packageId: Number(value),
                        amount: Number(selectedPackage.price),
                        packageName: selectedPackage.name,
                        dueDate: safelyFormatDate(dueDate)
                    }));

                    if (formErrors.amount) {
                        setFormErrors(prev => {
                            const newErrors = {...prev};
                            delete newErrors.amount;
                            return newErrors;
                        });
                    }
                } catch (error) {
                    console.error('Error updating due date:', error);
                    setNewInvoice(prev => ({
                        ...prev,
                        packageId: Number(value),
                        amount: Number(selectedPackage.price),
                        packageName: selectedPackage.name
                    }));
                }
            } else {
                setNewInvoice(prev => ({
                    ...prev,
                    packageId: Number(value) || "",
                    packageName: "",
                    amount: 0
                }));
            }
        }

        // Update due date when issue date changes based on selected package
        if (field === 'issueDate') {
            try {
                const issueDate = safelyParseDate(value);
                const selectedPackage = packages.find(pkg => pkg.id === newInvoice.packageId);

                if (selectedPackage) {
                    // Only auto-calculate due date if a package is selected
                    const dueDate = calculateDueDateFromPackageType(issueDate, selectedPackage.type);
                    setNewInvoice(prev => ({
                        ...prev,
                        issueDate: value,
                        dueDate: safelyFormatDate(dueDate)
                    }));

                    // Clear due date error if it exists since we're setting a valid due date
                    if (formErrors.dueDate) {
                        setFormErrors(prev => {
                            const newErrors = {...prev};
                            delete newErrors.dueDate;
                            return newErrors;
                        });
                    }
                } else {
                    // If no package is selected, don't change the due date
                    // Let user set it manually
                    setNewInvoice(prev => ({
                        ...prev,
                        issueDate: value
                    }));
                }
            } catch (error) {
                console.error('Error updating due date after issue date change:', error);
                // Just update the issue date without changing the due date
                setNewInvoice(prev => ({
                    ...prev,
                    issueDate: value
                }));
            }
        }
    };

    const mapStatusToBackend = (status) => {
        if (status === 'Ödendi') return 'paid';
        if (status === 'Kısmi Ödeme') return 'partiallypaid';
        if (status === 'Beklemede') return 'unpaid';
        if (status === 'Ödenmedi') return 'cancelled';
        return 'unpaid';
    };

    const handleSaveInvoice = async () => {
        const errors = {};

        if (!newInvoice.clientId) {
            errors.clientId = "Lütfen bir danışan seçin";
        }

        if (newInvoice.amount === '' || newInvoice.amount === null || isNaN(newInvoice.amount) || newInvoice.amount <= 0) {
            errors.amount = "Lütfen geçerli bir tutar girin";
        }

        if (!newInvoice.issueDate) {
            errors.issueDate = "Lütfen fatura tarihi seçin";
        }

        if (!newInvoice.dueDate) {
            errors.dueDate = "Lütfen son ödeme tarihi seçin";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsLoading(true);
        try {
            const getApiUrl = (endpoint) => {
                return config && config[config.environment] && config[config.environment].apiUrl
                    ? `${config[config.environment].apiUrl}${endpoint}`
                    : endpoint;
            };
            const authHeaders = {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            };

            const backendStatus = mapStatusToBackend(newInvoice.status);
            const invoiceData = {
                client_id: newInvoice.clientId,
                amount: newInvoice.amount,
                status: backendStatus,
                paid_amount: newInvoice.paid_amount || 0,
                package_id: newInvoice.packageId || null,
                issueDate: newInvoice.issueDate,
                dueDate: newInvoice.dueDate,
                description: newInvoice.description || ""
            };

            if (currentInvoice) {
                const response = await axios.put(getApiUrl('/invoice/updateInvoice'), {
                    invoice_id: currentInvoice.id,
                    ...invoiceData
                }, authHeaders);
                showSuccessToast("Fatura güncellendi.");
            } else {
                await axios.post(getApiUrl('/invoice/addInvoice'), invoiceData, authHeaders);
                showSuccessToast("Yeni fatura oluşturuldu.");
            }

            await fetchInvoices();
            handleCloseInvoiceDialog();
        } catch (error) {
            console.error('Error saving invoice:', error);
            showErrorToast('Fatura kaydedilirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteInvoice = (id) => {
        const invoiceToDelete = invoices.find(invoice => invoice.id === id);
        if (!invoiceToDelete) return;

        setDeleteConfirmation({
            isOpen: true,
            itemId: id,
            itemType: 'invoice',
            itemName: invoiceToDelete.clientName
        });
    };

    const handleStatusChange = async (id, newStatus) => {
        setIsLoading(true);
        try {
            const getApiUrl = (endpoint) => {
                return config && config[config.environment] && config[config.environment].apiUrl
                    ? `${config[config.environment].apiUrl}${endpoint}`
                    : endpoint;
            };
            const authHeaders = {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            };
            const backendStatus = mapStatusToBackend(newStatus);
            const invoice = invoices.find(i => i.id === id);
            if (!invoice) throw new Error('Fatura bulunamadı');
            await axios.put(getApiUrl('/invoice/updateInvoice'), {
                invoice_id: id,
                client_id: invoice.clientId,
                amount: invoice.amount,
                paid_amount: invoice.paid_amount || 0,
                status: backendStatus,
                package_id: invoice.packageId || null,
                issueDate: invoice.issueDate,
                dueDate: invoice.dueDate,
                description: invoice.description || ""
            }, authHeaders);
            showSuccessToast(
                `${invoice.clientName && invoice.clientName.length > 20
                    ? invoice.clientName.substring(0, 15) + '...'
                    : invoice.clientName
                } için ödeme durumu güncellendi.`
            );
            await fetchInvoices();
        } catch (error) {
            console.error('Status update error:', error);
            showErrorToast('Durum güncellenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderTabContent = () => {
        switch (tabValue) {
            case 0:
                const comparison = getMonthlyComparison();
                const statusBreakdown = getPaymentStatusBreakdown();

                return (
                    <Box className="finance-overview">
                        <Grid container spacing={4} className="stats-cards">
                            <Grid item xs={12} md={4}>
                                <Paper elevation={3} className="stat-card paid-income">
                                    <Box p={3} display="flex" flexDirection="column">
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Box className="stat-icon-wrapper">
                                                <CheckCircleIcon/>
                                            </Box>
                                            <Typography variant="h6" ml={2}>Bu Ay Ödenen</Typography>
                                        </Box>
                                        <Typography variant="h3" className="stat-amount" gutterBottom>
                                            {currentMonthPaid.toLocaleString()} ₺
                                        </Typography>
                                        <Typography variant="body2" className="stat-description">
                                            Tahsil edilen gelir
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper elevation={3} className="stat-card unpaid-income">
                                    <Box p={3} display="flex" flexDirection="column">
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Box className="stat-icon-wrapper">
                                                <PendingIcon/>
                                            </Box>
                                            <Typography variant="h6" ml={2}>Bu Ay Bekleyen</Typography>
                                        </Box>
                                        <Typography variant="h3" className="stat-amount" gutterBottom>
                                            {currentMonthUnpaid.toLocaleString()} ₺
                                        </Typography>
                                        <Typography variant="body2" className="stat-description">
                                            Tahsil edilmemiş gelir
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper elevation={3} className="stat-card total-revenue">
                                    <Box p={3} display="flex" flexDirection="column">
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Box className="stat-icon-wrapper">
                                                <MonetizationOnIcon/>
                                            </Box>
                                            <Typography variant="h6" ml={2}>Toplam Gelir</Typography>
                                        </Box>
                                        <Typography variant="h3" className="stat-amount" gutterBottom>
                                            {totalRevenue.toLocaleString()} ₺
                                        </Typography>
                                        <Typography variant="body2" className="stat-description">
                                            Bu ay toplam gelir
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>

                        <Grid container spacing={4} mt={3}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={3} className="report-section">
                                    <Box p={3}>
                                        <Typography variant="h6" gutterBottom className="section-title">
                                            Aylık Karşılaştırma
                                        </Typography>

                                        <Box className="monthly-comparison">
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-end"
                                                 mb={2}>
                                                <Box>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Bu Ay
                                                    </Typography>
                                                    <Typography variant="h4" className="current-month-value">
                                                        {comparison.current.toLocaleString()} ₺
                                                    </Typography>
                                                </Box>

                                                <Box>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Geçen Ay
                                                    </Typography>
                                                    <Typography variant="h5" className="last-month-value">
                                                        {comparison.last.toLocaleString()} ₺
                                                    </Typography>
                                                </Box>

                                                <Chip
                                                    icon={comparison.increased ? <ArrowUpwardIcon/> :
                                                        <ArrowDownwardIcon/>}
                                                    label={`${comparison.increased ? '+' : ''}${comparison.percentChange}%`}
                                                    color={comparison.increased ? "success" : "error"}
                                                    className="comparison-chip"
                                                />
                                            </Box>

                                            <Box className="comparison-progress" mt={3}>
                                                <Typography variant="body2" color="textSecondary" mb={1}>
                                                    Büyüme Eğilimi
                                                </Typography>

                                                <Box className="progress-wrapper" position="relative" height={8}
                                                     bgcolor="#edf2f7" borderRadius={4}>
                                                    <Box
                                                        className="progress-bar"
                                                        position="absolute"
                                                        height="100%"
                                                        width={`${Math.min(Math.max(50 + comparison.percentChange / 2, 5), 100)}%`}
                                                        borderRadius={4}
                                                        bgcolor={comparison.increased ? "#2ecc71" : "#e74c3c"}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper elevation={3} className="report-section">
                                    <Box p={3}>
                                        <Typography variant="h6" gutterBottom className="section-title">
                                            Ödeme Durumu Dağılımı
                                        </Typography>

                                        <Box className="payment-status-breakdown">
                                            <Box className="status-bars">
                                                <Box mb={3}>
                                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                                        <Typography variant="body2">Ödendi</Typography>
                                                        <Typography variant="body2"
                                                                    fontWeight="bold">{statusBreakdown.paidPercent}%</Typography>
                                                    </Box>
                                                    <Box className="progress-wrapper" position="relative" height={10}
                                                         bgcolor="#edf2f7" borderRadius={4}>
                                                        <Box
                                                            className="progress-bar"
                                                            position="absolute"
                                                            height="100%"
                                                            width={`${statusBreakdown.paidPercent}%`}
                                                            borderRadius={4}
                                                            bgcolor="#2ecc71"
                                                        />
                                                    </Box>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {statusBreakdown.paid.toLocaleString()} ₺
                                                    </Typography>
                                                </Box>

                                                <Box mb={3}>
                                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                                        <Typography variant="body2">Beklemede</Typography>
                                                        <Typography variant="body2"
                                                                    fontWeight="bold">{statusBreakdown.pendingPercent}%</Typography>
                                                    </Box>
                                                    <Box className="progress-wrapper" position="relative" height={10}
                                                         bgcolor="#edf2f7" borderRadius={4}>
                                                        <Box
                                                            className="progress-bar"
                                                            position="absolute"
                                                            height="100%"
                                                            width={`${statusBreakdown.pendingPercent}%`}
                                                            borderRadius={4}
                                                            bgcolor="#f39c12"
                                                        />
                                                    </Box>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {statusBreakdown.pending.toLocaleString()} ₺
                                                    </Typography>
                                                </Box>

                                                <Box>
                                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                                        <Typography variant="body2">Ödenmedi</Typography>
                                                        <Typography variant="body2"
                                                                    fontWeight="bold">{statusBreakdown.unpaidPercent}%</Typography>
                                                    </Box>
                                                    <Box className="progress-wrapper" position="relative" height={10}
                                                         bgcolor="#edf2f7" borderRadius={4}>
                                                        <Box
                                                            className="progress-bar"
                                                            position="absolute"
                                                            height="100%"
                                                            width={`${statusBreakdown.unpaidPercent}%`}
                                                            borderRadius={4}
                                                            bgcolor="#e74c3c"
                                                        />
                                                    </Box>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {statusBreakdown.unpaid.toLocaleString()} ₺
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 1:
                const filteredPackages = packages.filter(pkg =>
                    pkg.name.toLowerCase().includes(packageSearchTerm.toLowerCase()) ||
                    pkg.type.toLowerCase().includes(packageSearchTerm.toLowerCase()) ||
                    (pkg.description && pkg.description.toLowerCase().includes(packageSearchTerm.toLowerCase()))
                );

                return (
                    <Box className="package-management">
                        <Paper elevation={3} className="filters-section">
                            <Box p={3} display="flex" justifyContent="space-between" alignItems="center"
                                 flexWrap="wrap">
                                <Box display="flex" alignItems="center" gap={2} className="search-filters" flexGrow={1}>
                                    <TextField
                                        placeholder="Paket ara..."
                                        value={packageSearchTerm}
                                        onChange={(e) => setPackageSearchTerm(e.target.value)}
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon/>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{minWidth: 250}}
                                    />
                                </Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddIcon/>}
                                    onClick={() => handleOpenPackageDialog()}
                                    className="add-package-btn"
                                    disabled={isLoading}
                                >
                                    Yeni Paket Ekle
                                </Button>
                            </Box>
                        </Paper>

                        <Box mt={4}>
                            {isLoading ? (
                                <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                                    <Typography variant="h6" color="textSecondary">
                                        Paketler yükleniyor...
                                    </Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={3}>
                                    {filteredPackages.map(pkg => (
                                        <Grid item xs={6} md={4} lg={2} key={pkg.id}>
                                            <Paper elevation={3} className="package-card">
                                                <Box p={3}>
                                                    <Box display="flex" justifyContent="space-between"
                                                         alignItems="flex-start" mb={1}>
                                                        <Typography variant="h6" className="package-name">
                                                            {pkg.name && pkg.name.length > 15 ? `${pkg.name.substring(0, 15)}...` : pkg.name}
                                                        </Typography>
                                                        <Chip
                                                            label={pkg.type}
                                                            color="primary"
                                                            size="small"
                                                            className="package-type-chip"
                                                        />
                                                    </Box>

                                                    <Typography variant="body2" color="textSecondary" paragraph>
                                                        {pkg.description}
                                                    </Typography>

                                                    <Typography variant="h4" className="package-price" mt={3}>
                                                        {Number(pkg.price).toLocaleString()} ₺
                                                    </Typography>

                                                    <Divider sx={{my: 2}}/>

                                                    <Typography variant="subtitle2" className="services-title"
                                                                gutterBottom>
                                                        Paket İçeriği
                                                    </Typography>

                                                    <List dense className="services-list">
                                                        {pkg.services && pkg.services.length > 0 ? pkg.services.map((service, index) => (
                                                            <ListItem key={index} disableGutters
                                                                      className="service-item">
                                                                <ListItemIcon style={{minWidth: 28}}>
                                                                    <CheckCircleIcon fontSize="small" color="success"/>
                                                                </ListItemIcon>
                                                                <ListItemText primary={service}/>
                                                            </ListItem>
                                                        )) : (
                                                            <ListItem disableGutters>
                                                                <ListItemText primary="Paket içeriği belirtilmemiş"/>
                                                            </ListItem>
                                                        )}
                                                    </List>

                                                    <Box className="package-card-footer-spacer" mt={5}></Box>
                                                </Box>
                                                <Box className="package-card-footer">
                                                    <Box className="package-card-actions">
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={<EditIcon/>}
                                                            onClick={() => handleOpenPackageDialog(pkg)}
                                                            disabled={isLoading}
                                                        >
                                                            Düzenle
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            size="small"
                                                            startIcon={<DeleteIcon/>}
                                                            onClick={() => handleDeletePackage(pkg.id)}
                                                            disabled={isLoading}
                                                        >
                                                            Sil
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}

                                    {filteredPackages.length === 0 && !isLoading && (
                                        <Grid item xs={12}>
                                            <Paper elevation={3} className="empty-state">
                                                <Box p={4} textAlign="center">
                                                    <Box className="empty-icon">
                                                        <ReceiptIcon style={{fontSize: 64, opacity: 0.3}}/>
                                                    </Box>
                                                    <Typography variant="h6" color="textSecondary" gutterBottom>
                                                        {packageSearchTerm ? "Arama kriterinizle eşleşen paket bulunamadı" : "Henüz Paket Bulunmuyor"}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {packageSearchTerm
                                                            ? "Farklı anahtar kelimelerle tekrar arama yapmayı deneyin."
                                                            : "İlk paketinizi oluşturarak başlayın. Paketleriniz danışanlarınza sunabileceğiniz hizmetleri tanımlar."
                                                        }
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        startIcon={packageSearchTerm ? <SearchIcon/> : <AddIcon/>}
                                                        onClick={() => packageSearchTerm ? setPackageSearchTerm('') : handleOpenPackageDialog()}
                                                        sx={{mt: 3}}
                                                        disabled={isLoading}
                                                    >
                                                        {packageSearchTerm ? "Aramayı Temizle" : "Paket Oluştur"}
                                                    </Button>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            )}
                        </Box>
                    </Box>
                );

            case 2:
                return (
                    <Box className="invoice-management">
                        <Paper elevation={3} className="filters-section">
                            <Box p={3} display="flex" justifyContent="space-between" alignItems="center"
                                 flexWrap="wrap">
                                <Box display="flex" alignItems="center" gap={2} className="search-filters" flexGrow={1}>
                                    <TextField
                                        placeholder="Fatura Ara..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon/>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{minWidth: 250}}
                                    />

                                    <FormControl size="small" sx={{minWidth: 150}}>
                                        <InputLabel>Durum</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            label="Durum"
                                        >
                                            <MenuItem value="all">Tüm Durumlar</MenuItem>
                                            <MenuItem value="Ödendi">Ödendi</MenuItem>
                                            <MenuItem value="Kısmi Ödeme">Kısmi Ödeme</MenuItem>
                                            <MenuItem value="Beklemede">Beklemede</MenuItem>
                                            <MenuItem value="Ödenmedi">Ödenmedi</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<AddIcon/>}
                                        onClick={() => handleOpenInvoiceDialog()}
                                        sx={{
                                            color: 'white',
                                            backgroundColor: '#2d4149',
                                            borderRadius: 10,
                                            textTransform: "none",
                                            boxShadow: 3
                                        }}
                                    >
                                        Yeni Fatura
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<NotificationsActiveIcon/>}
                                        onClick={async () => {
                                            const unpaidInvoices = invoices.filter(invoice =>
                                                invoice.status === "Beklemede" || invoice.status === "Ödenmedi" || invoice.status === "Kısmi Ödeme"
                                            );

                                            if (unpaidInvoices.length === 0) {
                                                showErrorToast("Hatırlatma gönderilecek bekleyen fatura bulunmuyor.");
                                                return;
                                            }

                                            setIsLoading(true);
                                            let successCount = 0;

                                            for (const invoice of unpaidInvoices) {
                                                const success = await sendPaymentReminder(invoice);
                                                if (success) successCount++;
                                            }

                                            setIsLoading(false);
                                        }}
                                        disabled={isLoading}
                                        sx={{
                                            color: 'white',
                                            backgroundColor: '#2d4149',
                                            borderRadius: 10,
                                            textTransform: "none",
                                            boxShadow: 3
                                        }}
                                    >
                                        Tüm Ödemeleri Hatırlat
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
                                </Stack>
                            </Box>
                        </Paper>

                        <Box mt={4} id="invoice-list" sx={{height: "65vh", width: "100%"}}>
                            <DataGrid
                                localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
                                rows={filteredInvoices}
                                columns={invoiceColumns}
                                pageSize={10}
                                rowsPerPageOptions={[5, 10, 25]}
                                disableSelectionOnClick
                                getRowId={(row) => row.id}
                                sx={{
                                    "& .MuiDataGrid-columnHeaders": {
                                        bgcolor: "background.default",
                                    },
                                    "& .MuiDataGrid-footerContainer": {
                                        bgcolor: "background.default",
                                    },
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
                        </Box>

                        {/* CSV Import Dialog */}
                        <Dialog
                            open={importDialogOpen}
                            onClose={() => setImportDialogOpen(false)}
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
                                    <DownloadIcon/>
                                    <Typography variant="h6" sx={{color: 'white', fontWeight: 'bold'}}>
                                        Excel dosyasından Fatura İçe Aktar
                                    </Typography>
                                </Box>
                                <IconButton
                                    edge="end"
                                    onClick={() => setImportDialogOpen(false)}
                                    aria-label="close"
                                    sx={{color: 'white'}}
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
                                        <li><Typography variant="body2">danisan - Danışan Adı (zorunlu)</Typography>
                                        </li>
                                        <li><Typography variant="body2">paket - Paket Adı (opsiyonel)</Typography></li>
                                        <li><Typography variant="body2">tutar - Fatura Tutarı (zorunlu)</Typography>
                                        </li>
                                        <li><Typography variant="body2">durum - Fatura Durumu (opsiyonel, "Ödendi",
                                            "Beklemede" veya "Ödenmedi")</Typography></li>
                                        <li><Typography variant="body2">fatura_tarihi - Fatura Tarihi (opsiyonel,
                                            YYYY-MM-DD formatında)</Typography></li>
                                        <li><Typography variant="body2">son_odeme - Son Ödeme Tarihi (opsiyonel,
                                            YYYY-MM-DD formatında)</Typography></li>
                                        <li><Typography variant="body2">aciklama - Açıklama (opsiyonel)</Typography>
                                        </li>
                                    </ul>
                                    <Typography variant="body2" color="text.secondary">
                                        Not: Danışan adı sistemde kayıtlı olmalıdır.
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
                                        danisan,paket,tutar,durum,fatura_tarihi,son_odeme,aciklama<br/>
                                        "Furkan İmamoğlu","Aylık Paket","500","Ödendi","2023-05-01","2023-05-31","Mayıs ayı
                                        ödemesi"<br/>
                                        "Furkan İmamoğlu","Seanslık","250","Beklemede","2023-05-15","2023-05-22","İlk seans"
                                    </code>
                                </Stack>
                            </DialogContent>
                            <DialogActions sx={{p: 2, justifyContent: 'space-between'}}>
                                <Button
                                    onClick={() => setImportDialogOpen(false)}
                                    variant="outlined"
                                    startIcon={<CloseIcon/>}
                                >
                                    İptal
                                </Button>
                            </DialogActions>
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
                                    <ReceiptIcon/>
                                    <Typography variant="h6" sx={{color: 'white', fontWeight: 'bold'}}>
                                        İçe Aktarılacak Faturalar
                                    </Typography>
                                </Box>
                                <IconButton
                                    edge="end"
                                    onClick={() => setImportPreviewOpen(false)}
                                    aria-label="close"
                                    sx={{color: 'white'}}
                                >
                                    <CloseIcon/>
                                </IconButton>
                            </DialogTitle>
                            <DialogContent dividers>
                                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                    {csvData.length} fatura bulundu. Bilgileri kontrol edip düzenleyebilirsiniz.
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
                                                <TableCell>Danışan</TableCell>
                                                <TableCell>Paket</TableCell>
                                                <TableCell>Tutar</TableCell>
                                                <TableCell>Durum</TableCell>
                                                <TableCell>Fatura Tarihi</TableCell>
                                                <TableCell>Son Ödeme</TableCell>
                                                <TableCell>İşlemler</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {csvData.map((row, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <FormControl fullWidth size="small"
                                                                     error={csvErrors[index]?.clientName !== undefined}>
                                                            <Select
                                                                value={row.clientName || ''}
                                                                onChange={(e) => handleCsvRowChange(index, 'clientName', e.target.value)}
                                                            >
                                                                <MenuItem value="">
                                                                    <em>Seçiniz...</em>
                                                                </MenuItem>
                                                                {clients.map(client => (
                                                                    <MenuItem key={client.id} value={client.name}>
                                                                        {client.name}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                            {csvErrors[index]?.clientName && (
                                                                <Typography variant="caption" color="error">
                                                                    {csvErrors[index].clientName}
                                                                </Typography>
                                                            )}
                                                        </FormControl>
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormControl fullWidth size="small">
                                                            <Select
                                                                value={row.packageName || ''}
                                                                onChange={(e) => handleCsvRowChange(index, 'packageName', e.target.value)}
                                                            >
                                                                <MenuItem value="">
                                                                    <em>Paket Seçiniz</em>
                                                                </MenuItem>
                                                                {packages.map(pkg => (
                                                                    <MenuItem key={pkg.id} value={pkg.name}>
                                                                        {pkg.name} - {Number(pkg.price).toLocaleString()} ₺
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            type="number"
                                                            value={row.amount || 0}
                                                            onChange={(e) => handleCsvRowChange(index, 'amount', Number(e.target.value))}
                                                            error={csvErrors[index]?.amount !== undefined}
                                                            helperText={csvErrors[index]?.amount}
                                                            InputProps={{
                                                                endAdornment: <InputAdornment
                                                                    position="end">₺</InputAdornment>,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormControl fullWidth size="small">
                                                            <Select
                                                                value={row.status || 'Beklemede'}
                                                                onChange={(e) => handleCsvRowChange(index, 'status', e.target.value)}
                                                            >
                                                                <MenuItem value="Ödendi">Ödendi</MenuItem>
                                                                <MenuItem value="Kısmi Ödeme">Kısmi Ödeme</MenuItem>
                                                                <MenuItem value="Beklemede">Beklemede</MenuItem>
                                                                <MenuItem value="Ödenmedi">Ödenmedi</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            type="date"
                                                            value={row.issueDate || ''}
                                                            onChange={(e) => handleCsvRowChange(index, 'issueDate', e.target.value)}
                                                            error={csvErrors[index]?.issueDate !== undefined}
                                                            helperText={csvErrors[index]?.issueDate}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            type="date"
                                                            value={row.dueDate || ''}
                                                            onChange={(e) => handleCsvRowChange(index, 'dueDate', e.target.value)}
                                                            error={csvErrors[index]?.dueDate !== undefined}
                                                            helperText={csvErrors[index]?.dueDate}
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
                            <DialogActions sx={{p: 2, justifyContent: 'space-between'}}>
                                <Button
                                    onClick={() => setImportPreviewOpen(false)}
                                    variant="outlined"
                                    startIcon={<CloseIcon/>}
                                >
                                    İptal
                                </Button>
                                <Button
                                    onClick={handleImportSubmit}
                                    variant="contained"
                                    startIcon={<ReceiptIcon/>}
                                    disabled={Object.keys(csvErrors).length > 0 || csvData.length === 0}
                                >
                                    {csvData.length} Faturayı Ekle
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Snackbar for notifications */}
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
                    </Box>
                );

            default:
                return null;
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar(prev => ({...prev, open: false}));
    };

    const handleCsvFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                if (results.data && results.data.length > 0) {
                    const parsedData = results.data.map((row, index) => {
                        const client = clients.find(c => c.name && c.name.toLowerCase() === (row.danisan || "").toLowerCase());
                        const pkg = packages.find(p => p.name && p.name.toLowerCase() === (row.paket || "").toLowerCase());

                        return {
                            id: `temp_${index}`,
                            clientId: client ? client.id : null,
                            clientName: row.danisan || "",
                            packageId: pkg ? pkg.id : null,
                            packageName: row.paket || "",
                            amount: parseFloat(row.tutar || 0) || 0,
                            status: row.durum === "Ödendi" || row.durum === "Kısmi Ödeme" || row.durum === "Beklemede" || row.durum === "Ödenmedi"
                                ? row.durum
                                : "Beklemede",
                            issueDate: row.fatura_tarihi || new Date().toISOString().split('T')[0],
                            dueDate: row.son_odeme || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            description: row.aciklama || ""
                        };
                    });

                    setCsvData(parsedData);
                    validateCsvData(parsedData);
                    setImportDialogOpen(false);
                    setImportPreviewOpen(true);
                } else {
                    showErrorToast('CSV dosyası boş veya geçersiz format içeriyor.');
                }
            },
            error: function (error) {
                showErrorToast(`CSV okuma hatası: ${error.message}`);
            }
        });
    };

    const validateCsvData = (data) => {
        const errors = {};

        data.forEach((row, index) => {
            const rowErrors = {};

            // Client validation
            if (!row.clientName || row.clientName.trim() === "") {
                rowErrors.clientName = "Danışan adı zorunludur";
            } else if (!row.clientId) {
                rowErrors.clientName = "Danışan sistemde bulunamadı";
            }

            // Amount validation
            if (isNaN(row.amount) || row.amount <= 0) {
                rowErrors.amount = "Geçerli bir tutar giriniz";
            }

            // Date validation
            if (!row.issueDate || !isValidDateString(row.issueDate)) {
                rowErrors.issueDate = "Geçerli bir fatura tarihi giriniz";
            }

            if (!row.dueDate || !isValidDateString(row.dueDate)) {
                rowErrors.dueDate = "Geçerli bir son ödeme tarihi giriniz";
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

        // If changing client, update clientId
        if (field === 'clientName') {
            const client = clients.find(c => c.name === value);
            updatedData[index].clientId = client ? client.id : null;
        }

        // If changing package, update packageId and amount
        if (field === 'packageName') {
            const pkg = packages.find(p => p.name === value);
            updatedData[index].packageId = pkg ? pkg.id : null;
            if (pkg) {
                updatedData[index].amount = Number(pkg.price);
            }
        }

        setCsvData(updatedData);

        // Validate the updated row
        const rowErrors = {};
        const row = updatedData[index];

        if (field === "clientName") {
            if (!value || value.trim() === "") {
                rowErrors.clientName = "Danışan adı zorunludur";
            } else if (!row.clientId) {
                rowErrors.clientName = "Danışan sistemde bulunamadı";
            }
        }

        if (field === "amount") {
            if (isNaN(value) || value <= 0) {
                rowErrors.amount = "Geçerli bir tutar giriniz";
            }
        }

        if (field === "issueDate") {
            if (!value || !isValidDateString(value)) {
                rowErrors.issueDate = "Geçerli bir fatura tarihi giriniz";
            }
        }

        if (field === "dueDate") {
            if (!value || !isValidDateString(value)) {
                rowErrors.dueDate = "Geçerli bir son ödeme tarihi giriniz";
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

            // Process each invoice one by one
            for (const invoice of csvData) {
                try {
                    const getApiUrl = (endpoint) => {
                        return config && config[config.environment] && config[config.environment].apiUrl
                            ? `${config[config.environment].apiUrl}${endpoint}`
                            : endpoint;
                    };

                    const authHeaders = {
                        headers: {
                            Authorization: localStorage.getItem("token"),
                        },
                    };

                    // Map status to backend format
                    const backendStatus = mapStatusToBackend(invoice.status);

                    const invoiceData = {
                        client_id: invoice.clientId,
                        amount: invoice.amount,
                        paid_amount: invoice.paid_amount,
                        status: backendStatus,
                        package_id: invoice.packageId || null,
                        issueDate: invoice.issueDate,
                        dueDate: invoice.dueDate,
                        description: invoice.description || ""
                    };

                    await axios.post(getApiUrl('/invoice/addInvoice'), invoiceData, authHeaders);
                    successCount++;
                } catch (err) {
                    console.error(`Fatura eklenirken hata: ${invoice.clientName}`, err);
                    failCount++;
                }
            }

            showSuccessToast(
                `${successCount} fatura başarıyla eklendi. ${failCount > 0 ? `${failCount} fatura eklenemedi.` : ''}`
            );

            setImportPreviewOpen(false);
            setCsvData([]);
            await fetchInvoices();

        } catch (error) {
            console.error("Toplu fatura eklenirken hata oluştu:", error);
            showErrorToast(
                "Faturalar eklenirken bir hata oluştu"
            );
        }
    };

    const handleExportCSV = () => {
        // Filter invoices based on active filter
        const filteredInvoices = invoices.filter(invoice => {
            const matchesSearch =
                (invoice?.clientName?.toLowerCase() || '').includes((searchTerm || '').toLowerCase()) ||
                (invoice?.packageName?.toLowerCase() || '').includes((searchTerm || '').toLowerCase());
            const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        // Prepare data for export
        const dataToExport = filteredInvoices.map(invoice => ({
            danisan: invoice.clientName || "",
            paket: invoice.packageName || "",
            tutar: invoice.amount,
            durum: invoice.status,
            fatura_tarihi: invoice.issueDate,
            son_odeme: invoice.dueDate,
            aciklama: invoice.description || ""
        }));

        // Convert to CSV
        const csv = Papa.unparse(dataToExport);

        // Create download link
        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        // Set file name with current date
        const date = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
        const fileName = `faturalar_${date}.csv`;

        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Default>
            <div className="finans-container">
                <Box sx={{mb: 3}}>
                    <Tabs value={tabValue} onChange={handleTabChange}
                          variant="scrollable" scrollButtons="auto">
                        <Tab icon={<MonetizationOnIcon/>} iconPosition="start" label="Genel Bakış"/>
                        <Tab icon={<ReceiptIcon/>} iconPosition="start" label="Paket Yönetimi"/>
                        <Tab icon={<PaymentsIcon/>} iconPosition="start" label="Fatura Yönetimi"/>
                    </Tabs>
                </Box>

                {renderTabContent()}

                {/* Custom Package Modal */}
                <CustomModal
                    isOpen={packageDialogOpen}
                    onClose={handleClosePackageDialog}
                    title={currentPackage ? "Paketi Düzenle" : "Yeni Paket Oluştur"}
                >
                    <div className="custom-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="package-name">Paket Adı</label>
                                <input
                                    id="package-name"
                                    type="text"
                                    value={newPackage.name}
                                    onChange={(e) => handlePackageChange('name', e.target.value)}
                                    className={packageFormErrors.name ? "error-input" : ""}
                                    placeholder="Paket Adı"
                                    disabled={isLoading}
                                />
                                {packageFormErrors.name &&
                                    <div className="error-message">{packageFormErrors.name}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="package-type">Paket Tipi</label>
                                <select
                                    id="package-type"
                                    value={newPackage.type}
                                    onChange={(e) => handlePackageChange('type', e.target.value)}
                                    className={packageFormErrors.type ? "error-input" : ""}
                                    disabled={isLoading}
                                >
                                    <option value="">Paket Tipi Seçin</option>
                                    <option value="Seanslık">Seanslık</option>
                                    <option value="Aylık">Aylık</option>
                                    <option value="3 Aylık">3 Aylık</option>
                                    <option value="6 Aylık">6 Aylık</option>
                                    <option value="1 Yıllık">1 Yıllık</option>
                                </select>
                                {packageFormErrors.type &&
                                    <div className="error-message">{packageFormErrors.type}</div>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="package-price">Fiyat (₺)</label>
                                <div className="input-with-icon">
                                    <i className="icon">₺</i>
                                    <input
                                        id="package-price"
                                        type="number"
                                        max={9223372036854775807}
                                        min={0}
                                        value={newPackage.price || ""}
                                        onChange={(e) => handlePackageChange('price', Number(e.target.value))}
                                        className={packageFormErrors.price ? "error-input" : ""}
                                        placeholder="0"
                                        disabled={isLoading}
                                    />
                                    {packageFormErrors.price &&
                                        <div className="error-message">{packageFormErrors.price}</div>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="package-description">Açıklama</label>
                                <input
                                    id="package-description"
                                    type="text"
                                    value={newPackage.description}
                                    onChange={(e) => handlePackageChange('description', e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Paket İçeriği <span className="optional-label">(Opsiyonel)</span></label>

                            <div className="services-list-form">
                                {newPackage.services.length > 0 ? (
                                    newPackage.services.map((service, index) => (
                                        <div key={index} className="service-item-input">
                                            <span className="service-item-number">{index + 1}.</span>
                                            <input
                                                type="text"
                                                placeholder={`Hizmet ${index + 1}`}
                                                value={service}
                                                onChange={(e) => handleServiceChange(index, e.target.value)}
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                className="remove-button"
                                                onClick={() => handleRemoveService(index)}
                                                disabled={isLoading}
                                                title="Hizmeti Sil"
                                            >
                                                <DeleteIcon/>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-services-message">
                                        Henüz hizmet eklenmedi. Paket içeriğini belirtmek için "Hizmet Ekle" butonunu
                                        kullanabilirsiniz.
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="add-button"
                                    onClick={handleAddService}
                                    disabled={isLoading}
                                >
                                    <AddIcon/> Hizmet Ekle
                                </button>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={handleClosePackageDialog}
                                disabled={isLoading}
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                className="save-button"
                                onClick={handleSavePackage}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Kaydediliyor...' : <><SaveIcon/> Kaydet</>}
                            </button>
                        </div>
                    </div>
                </CustomModal>

                {/* Custom Invoice Modal */}
                <CustomModal
                    isOpen={invoiceDialogOpen}
                    onClose={handleCloseInvoiceDialog}
                    title={currentInvoice ? "Faturayı Düzenle" : "Yeni Fatura Oluştur"}
                >
                    <div className="custom-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="client-name">Danışan Adı</label>
                                {currentInvoice ? (
                                    <input
                                        id="client-name"
                                        type="text"
                                        value={newInvoice.clientName}
                                        readOnly
                                        className="readonly-input"
                                    />
                                ) : (
                                    <>
                                        <select
                                            id="client-select"
                                            value={newInvoice.clientId || ""}
                                            onChange={(e) => handleInvoiceChange('clientId', e.target.value ? Number(e.target.value) : "")}
                                            className={formErrors.clientId ? "error-input" : ""}
                                        >
                                            <option value="">Danışan Seçin</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>
                                                    {client.name}
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.clientId &&
                                            <div className="error-message">{formErrors.clientId}</div>}
                                    </>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="package-select">Paket</label>
                                <select
                                    id="package-select"
                                    value={newInvoice.packageId || ""}
                                    onChange={(e) => handleInvoiceChange('packageId', e.target.value ? Number(e.target.value) : "")}
                                >
                                    <option value="">Paket Seçin</option>
                                    {packages.length > 0 && packages.map(pkg => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.name} - {Number(pkg.price).toLocaleString()} ₺
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            {newInvoice.status !== "Kısmi Ödeme" && (
                                <div className="form-group">
                                    <label htmlFor="invoice-amount">Tutar (₺)</label>
                                    <div className="input-with-icon">
                                        <i className="icon">₺</i>
                                        <input
                                            id="invoice-amount"
                                            type="number"
                                            max={9223372036854775807}
                                            min={0}
                                            value={newInvoice.amount || ""}
                                            onChange={(e) => handleInvoiceChange('amount', Number(e.target.value))}
                                            className={formErrors.amount ? "error-input" : ""}
                                        />
                                    </div>
                                    {formErrors.amount && <div className="error-message">{formErrors.amount}</div>}
                                </div>
                            )}

                            {newInvoice.status === "Kısmi Ödeme" && (
                                <div className="form-group">
                                    <label htmlFor="paid-amount">Ödenen Tutar (₺)</label>
                                    <div className="input-with-icon">
                                        <i className="icon">₺</i>
                                        <input
                                            id="paid-amount"
                                            type="number"
                                            max={newInvoice.amount || 0}
                                            min={0}
                                            value={newInvoice.paid_amount || ""}
                                            onChange={(e) => handleInvoiceChange('paid_amount', Number(e.target.value))}
                                            className={formErrors.paid_amount ? "error-input" : ""}
                                        />
                                    </div>
                                    {formErrors.paid_amount && <div className="error-message">{formErrors.paid_amount}</div>}
                                </div>
                            )}

                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                                <div className="form-group">
                                    <label htmlFor="invoice-amount">Fatura Tarihi</label>
                                    <DatePicker
                                        value={newInvoice.issueDate ? new Date(newInvoice.issueDate) : null}
                                        onChange={(newValue) => {
                                            handleInvoiceChange('issueDate', newValue ? newValue.toISOString().split('T')[0] : '');
                                        }}
                                        format="dd/MM/yyyy"
                                        minDate={minDate}
                                        maxDate={maxDate}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!formErrors.issueDate,
                                                helperText: formErrors.issueDate
                                            }
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="invoice-amount">Son Ödeme Tarihi</label>
                                    <DatePicker
                                        value={newInvoice.dueDate ? new Date(newInvoice.dueDate) : null}
                                        onChange={(newValue) => {
                                            handleInvoiceChange('dueDate', newValue ? newValue.toISOString().split('T')[0] : '');
                                        }}
                                        format="dd/MM/yyyy"
                                        minDate={minDate}
                                        maxDate={maxDate}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!formErrors.dueDate,
                                                helperText: formErrors.dueDate
                                            }
                                        }}
                                    />
                                </div>
                            </LocalizationProvider>
                        </div>

                        <div className="form-row">
                            <div className="form-group full-width">
                                <label htmlFor="invoice-description">Açıklama</label>
                                <input
                                    id="invoice-description"
                                    type="text"
                                    value={newInvoice.description || ''}
                                    onChange={(e) => handleInvoiceChange('description', e.target.value)}
                                    placeholder="Açıklama girin (isteğe bağlı)"
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="payment-status">Ödeme Durumu</label>
                            <div className="status-select-wrapper">
                                <select
                                    id="payment-status"
                                    value={newInvoice.status}
                                    onChange={(e) => handleInvoiceChange('status', e.target.value)}
                                    className={`status-select status-${newInvoice.status.toLowerCase()}`}
                                >
                                    <option value="Ödendi">Ödendi</option>
                                    <option value="Kısmi Ödeme">Kısmi Ödeme</option>
                                    <option value="Beklemede">Beklemede</option>
                                    <option value="Ödenmedi">Ödenmedi</option>
                                </select>
                                <span className="status-indicator"></span>
                            </div>
                        </div>

                        {(() => {
                            const selectedPackage = packages.find(pkg => pkg.id === newInvoice.packageId);
                            if (selectedPackage && selectedPackage.services && selectedPackage.services.length > 0) {
                                return (
                                    <div className="form-group full-width" style={{marginTop: 8}}>
                                        <label>Paket Hizmetleri</label>
                                        <ul style={{margin: 0, paddingLeft: 20}}>
                                            {selectedPackage.services.map((service, idx) => (
                                                <li key={idx}>{service}</li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={handleCloseInvoiceDialog}
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                className="save-button"
                                onClick={handleSaveInvoice}
                            >
                                <SaveIcon/> Kaydet
                            </button>
                        </div>
                    </div>
                </CustomModal>

                {/* Confirmation Dialog */}
                <ConfirmationDialog
                    isOpen={deleteConfirmation.isOpen}
                    onClose={() => setDeleteConfirmation(prev => ({...prev, isOpen: false}))}
                    onConfirm={confirmDelete}
                    title="Silme İşlemi"
                    itemName={deleteConfirmation.itemName}
                    message={
                        deleteConfirmation.itemType === 'package'
                            ? `paketini silmek istediğinize emin misiniz?`
                            : `danışanının faturasını silmek istediğinize emin misiniz?`
                    }
                    isLoading={isLoading}
                />
            </div>
        </Default>
    );
}