import React, { useState, useEffect } from 'react';
import './Finans.css';
import Default from "../../Components/Layouts/Default.jsx";
import {
    Paper, Typography, Box, Grid, Tab, Tabs, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton,
    InputAdornment, MenuItem, Select, FormControl, InputLabel, Card,
    CardContent, Divider, List, ListItem, ListItemIcon, ListItemText,
    OutlinedInput
} from '@mui/material';
import { 
    Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, 
    CurrencyLira as CurrencyLiraIcon, MonetizationOn as MonetizationOnIcon,
    Receipt as ReceiptIcon, Payments as PaymentsIcon, Save as SaveIcon,
    ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon,
    CheckCircle as CheckCircleIcon, Pending as PendingIcon,
    Cancel as CancelIcon, Search as SearchIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

// Custom Modal Component
const CustomModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="custom-modal-overlay" onClick={onClose}>
            <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
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

export default function Finans() {
    const [tabValue, setTabValue] = useState(0);
    
    // Sample data for packages
    const [packages, setPackages] = useState([
        { 
            id: 1, 
            name: "Seanslık Paket", 
            type: "Seanslık", 
            price: 600, 
            description: "Tek seans diyetisyen danışmanlığı", 
            services: ["Bireysel beslenme planı", "1 görüşme", "1 adet takip"] 
        },
        { 
            id: 2, 
            name: "Aylık Takip", 
            type: "Aylık", 
            price: 1500, 
            description: "1 aylık diyetisyen danışmanlık paketi", 
            services: ["Kişiselleştirilmiş beslenme planı", "4 haftalık menü", "Haftalık takip", "Sınırsız WhatsApp desteği"] 
        },
        { 
            id: 3, 
            name: "3 Aylık Program", 
            type: "3 Aylık", 
            price: 3600, 
            description: "3 aylık diyetisyen danışmanlık paketi", 
            services: ["Kişiselleştirilmiş beslenme planı", "12 haftalık menü", "Haftalık takip", "Sınırsız WhatsApp desteği", "Vücut analizi"] 
        },
        { 
            id: 4, 
            name: "6 Aylık Program", 
            type: "6 Aylık", 
            price: 6000, 
            description: "6 aylık diyetisyen danışmanlık paketi", 
            services: ["Kişiselleştirilmiş beslenme planı", "24 haftalık menü", "Haftalık takip", "Sınırsız WhatsApp desteği", "Vücut analizi", "Tahlil yorumlama"] 
        },
        { 
            id: 5, 
            name: "Yıllık Program", 
            type: "1 Yıllık", 
            price: 10000, 
            description: "1 yıllık diyetisyen danışmanlık paketi", 
            services: ["Kişiselleştirilmiş beslenme planı", "52 haftalık menü", "Haftalık takip", "Sınırsız WhatsApp desteği", "Vücut analizi", "Tahlil yorumlama", "Yılsonu raporu"] 
        }
    ]);

    // Sample data for invoices
    const [invoices, setInvoices] = useState([
        { 
            id: 1, 
            clientName: "Ayşe Yılmaz", 
            packageId: 2, 
            packageName: "Aylık Takip", 
            amount: 1500, 
            status: "Ödendi", 
            issueDate: "2023-05-10", 
            dueDate: "2023-05-17" 
        },
        { 
            id: 2, 
            clientName: "Mehmet Kaya", 
            packageId: 3, 
            packageName: "3 Aylık Program", 
            amount: 3600, 
            status: "Ödenmedi", 
            issueDate: "2023-05-15", 
            dueDate: "2023-05-22" 
        },
        { 
            id: 3, 
            clientName: "Zeynep Demir", 
            packageId: 1, 
            packageName: "Seanslık Paket", 
            amount: 600, 
            status: "Ödendi", 
            issueDate: "2023-05-03", 
            dueDate: "2023-05-10" 
        },
        { 
            id: 4, 
            clientName: "Ali Can", 
            packageId: 4, 
            packageName: "6 Aylık Program", 
            amount: 6000, 
            status: "Beklemede", 
            issueDate: "2023-05-18", 
            dueDate: "2023-05-25" 
        }
    ]);

    // Package management state
    const [packageDialogOpen, setPackageDialogOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState(null);
    const [newPackage, setNewPackage] = useState({
        name: "",
        type: "Seanslık",
        price: 0,
        description: "",
        services: [""]
    });
    
    // Invoice management state
    const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [newInvoice, setNewInvoice] = useState({
        clientName: "",
        packageId: 0,
        amount: 0,
        status: "Beklemede",
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Calculate financial statistics
    const currentMonthPaid = invoices
        .filter(invoice => {
            const invoiceMonth = new Date(invoice.issueDate).getMonth();
            const currentMonth = new Date().getMonth();
            return invoiceMonth === currentMonth && invoice.status === "Ödendi";
        })
        .reduce((total, invoice) => total + invoice.amount, 0);

    const currentMonthUnpaid = invoices
        .filter(invoice => {
            const invoiceMonth = new Date(invoice.issueDate).getMonth();
            const currentMonth = new Date().getMonth();
            return invoiceMonth === currentMonth && invoice.status !== "Ödendi";
        })
        .reduce((total, invoice) => total + invoice.amount, 0);

    const totalRevenue = invoices
        .filter(invoice => invoice.status === "Ödendi")
        .reduce((total, invoice) => total + invoice.amount, 0);

    // Filter invoices based on search and filter
    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              invoice.packageName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Tab change handler
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Calculate monthly comparison
    const getMonthlyComparison = () => {
        const currentMonth = new Date().getMonth();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        
        const currentMonthTotal = invoices
            .filter(invoice => new Date(invoice.issueDate).getMonth() === currentMonth)
            .reduce((total, invoice) => total + invoice.amount, 0);
        
        const lastMonthTotal = invoices
            .filter(invoice => new Date(invoice.issueDate).getMonth() === lastMonth)
            .reduce((total, invoice) => total + invoice.amount, 0);
        
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

    // Get payment status breakdown 
    const getPaymentStatusBreakdown = () => {
        const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
        
        const paid = invoices
            .filter(invoice => invoice.status === "Ödendi")
            .reduce((sum, invoice) => sum + invoice.amount, 0);
        
        const pending = invoices
            .filter(invoice => invoice.status === "Beklemede")
            .reduce((sum, invoice) => sum + invoice.amount, 0);
        
        const unpaid = invoices
            .filter(invoice => invoice.status === "Ödenmedi")
            .reduce((sum, invoice) => sum + invoice.amount, 0);
        
        return {
            paid,
            pending,
            unpaid,
            paidPercent: total === 0 ? 0 : Math.round((paid / total) * 100),
            pendingPercent: total === 0 ? 0 : Math.round((pending / total) * 100),
            unpaidPercent: total === 0 ? 0 : Math.round((unpaid / total) * 100)
        };
    };

    // Package management handlers
    const handleOpenPackageDialog = (pkg = null) => {
        if (pkg) {
            setCurrentPackage(pkg);
            setNewPackage({...pkg});
        } else {
            setCurrentPackage(null);
            setNewPackage({
                name: "",
                type: "Seanslık",
                price: 0,
                description: "",
                services: [""]
            });
        }
        setPackageDialogOpen(true);
    };

    const handleClosePackageDialog = () => {
        setPackageDialogOpen(false);
        setCurrentPackage(null);
    };

    const handlePackageChange = (field, value) => {
        setNewPackage({
            ...newPackage,
            [field]: value
        });
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

    const handleSavePackage = () => {
        if (!newPackage.name || !newPackage.type || newPackage.price <= 0) {
            toast.error("Lütfen tüm gerekli alanları doldurun.");
            return;
        }

        if (currentPackage) {
            // Update existing package
            setPackages(packages.map(pkg => 
                pkg.id === currentPackage.id ? {...newPackage, id: pkg.id} : pkg
            ));
            toast.success(`${newPackage.name} paketi güncellendi.`);
        } else {
            // Create new package
            const newId = Math.max(...packages.map(pkg => pkg.id), 0) + 1;
            setPackages([...packages, {...newPackage, id: newId}]);
            toast.success(`${newPackage.name} paketi oluşturuldu.`);
        }
        
        handleClosePackageDialog();
    };

    const handleDeletePackage = (id) => {
        // Check if package is used in any invoices
        const isUsed = invoices.some(invoice => invoice.packageId === id);
        if (isUsed) {
            toast.error("Bu paket faturalarda kullanıldığı için silinemez.");
            return;
        }

        setPackages(packages.filter(pkg => pkg.id !== id));
        toast.success("Paket silindi.");
    };

    // Invoice management handlers
    const handleOpenInvoiceDialog = (invoice = null) => {
        if (invoice) {
            setCurrentInvoice(invoice);
            setNewInvoice({...invoice});
        } else {
            setCurrentInvoice(null);
            setNewInvoice({
                clientName: "",
                packageId: packages[0]?.id || 0,
                amount: packages[0]?.price || 0,
                status: "Beklemede",
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
        }
        setInvoiceDialogOpen(true);
    };

    const handleCloseInvoiceDialog = () => {
        setInvoiceDialogOpen(false);
        setCurrentInvoice(null);
    };

    const handleInvoiceChange = (field, value) => {
        setNewInvoice({
            ...newInvoice,
            [field]: value
        });

        // Auto-update amount if package changes
        if (field === 'packageId') {
            const selectedPackage = packages.find(pkg => pkg.id === value);
            if (selectedPackage) {
                setNewInvoice(prev => ({
                    ...prev,
                    packageId: value,
                    amount: selectedPackage.price,
                    packageName: selectedPackage.name
                }));
            }
        }
    };

    const handleSaveInvoice = () => {
        if (!newInvoice.clientName || !newInvoice.packageId || newInvoice.amount <= 0) {
            toast.error("Lütfen tüm gerekli alanları doldurun.");
            return;
        }

        const selectedPackage = packages.find(pkg => pkg.id === newInvoice.packageId);
        const invoiceData = {
            ...newInvoice,
            packageName: selectedPackage.name
        };

        if (currentInvoice) {
            // Update existing invoice
            setInvoices(invoices.map(invoice => 
                invoice.id === currentInvoice.id ? {...invoiceData, id: invoice.id} : invoice
            ));
            toast.success(`${invoiceData.clientName} için fatura güncellendi.`);
        } else {
            // Create new invoice
            const newId = Math.max(...invoices.map(invoice => invoice.id), 0) + 1;
            setInvoices([...invoices, {...invoiceData, id: newId}]);
            toast.success(`${invoiceData.clientName} için yeni fatura oluşturuldu.`);
        }
        
        handleCloseInvoiceDialog();
    };

    const handleDeleteInvoice = (id) => {
        setInvoices(invoices.filter(invoice => invoice.id !== id));
        toast.success("Fatura silindi.");
    };

    const handleStatusChange = (id, newStatus) => {
        setInvoices(invoices.map(invoice =>
            invoice.id === id ? {...invoice, status: newStatus} : invoice
        ));
        
        const invoice = invoices.find(i => i.id === id);
        toast.success(`${invoice.clientName} için ödeme durumu "${newStatus}" olarak güncellendi.`);
    };

    // Render the appropriate tab content
    const renderTabContent = () => {
        switch(tabValue) {
            case 0: // Financial Overview
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
                                                <CheckCircleIcon />
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
                                                <PendingIcon />
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
                                                <MonetizationOnIcon />
                                </Box>
                                            <Typography variant="h6" ml={2}>Toplam Gelir</Typography>
                                        </Box>
                                        <Typography variant="h3" className="stat-amount" gutterBottom>
                                            {totalRevenue.toLocaleString()} ₺
                                        </Typography>
                                        <Typography variant="body2" className="stat-description">
                                            Tüm zamanlar
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
                                            <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={2}>
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
                                                    icon={comparison.increased ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                                                    label={`${comparison.increased ? '+' : ''}${comparison.percentChange}%`}
                                                    color={comparison.increased ? "success" : "error"}
                                                    className="comparison-chip"
                                                />
                                            </Box>
                                            
                                            <Box className="comparison-progress" mt={3}>
                                                <Typography variant="body2" color="textSecondary" mb={1}>
                                                    Büyüme Eğilimi
                                                </Typography>
                                                
                                                <Box className="progress-wrapper" position="relative" height={8} bgcolor="#edf2f7" borderRadius={4}>
                                                    <Box 
                                                        className="progress-bar"
                                                        position="absolute"
                                                        height="100%"
                                                        width={`${Math.min(Math.max(50 + comparison.percentChange/2, 5), 100)}%`}
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
                                                        <Typography variant="body2" fontWeight="bold">{statusBreakdown.paidPercent}%</Typography>
                                                    </Box>
                                                    <Box className="progress-wrapper" position="relative" height={10} bgcolor="#edf2f7" borderRadius={4}>
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
                                                        <Typography variant="body2" fontWeight="bold">{statusBreakdown.pendingPercent}%</Typography>
                                                    </Box>
                                                    <Box className="progress-wrapper" position="relative" height={10} bgcolor="#edf2f7" borderRadius={4}>
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
                                                        <Typography variant="body2" fontWeight="bold">{statusBreakdown.unpaidPercent}%</Typography>
                                                    </Box>
                                                    <Box className="progress-wrapper" position="relative" height={10} bgcolor="#edf2f7" borderRadius={4}>
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
            
            case 1: // Package Management
                return (
                    <Box className="package-management">
                        <Paper elevation={3} className="filters-section">
                            <Box p={3} display="flex" justifyContent="flex-end">
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenPackageDialog()}
                                    className="add-package-btn"
                                >
                                    Yeni Paket Ekle
                                </Button>
                            </Box>
                        </Paper>
                        
                        <Box mt={4}>
                            <Grid container spacing={3}>
                                {packages.map(pkg => (
                                    <Grid item xs={12} md={6} lg={4} key={pkg.id}>
                                        <Paper elevation={3} className="package-card">
                                            <Box p={3}>
                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                                    <Typography variant="h6" className="package-name">
                                                        {pkg.name}
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
                                                    {pkg.price.toLocaleString()} ₺
                                                </Typography>
                                                
                                                <Divider sx={{ my: 2 }} />
                                                
                                                <Typography variant="subtitle2" className="services-title" gutterBottom>
                                                    Paket İçeriği
                                                </Typography>
                                                
                                                <List dense className="services-list">
                                                    {pkg.services.map((service, index) => (
                                                        <ListItem key={index} disableGutters className="service-item">
                                                            <ListItemIcon style={{ minWidth: 28 }}>
                                                                <CheckCircleIcon fontSize="small" color="success" />
                                                            </ListItemIcon>
                                                            <ListItemText primary={service} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                                
                                                <Box display="flex" justifyContent="flex-end" mt={2}>
                                                    <Button
                                                        startIcon={<EditIcon />}
                                                        color="primary"
                                                        onClick={() => handleOpenPackageDialog(pkg)}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Düzenle
                                                    </Button>
                                                    <Button
                                                        startIcon={<DeleteIcon />}
                                                        color="error"
                                                        onClick={() => handleDeletePackage(pkg.id)}
                                                        size="small"
                                                        variant="outlined"
                                                    >
                                                        Sil
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                                
                                {packages.length === 0 && (
                                    <Grid item xs={12}>
                                        <Paper elevation={3} className="empty-state">
                                            <Box p={4} textAlign="center">
                                                <Box className="empty-icon">
                                                    <ReceiptIcon style={{ fontSize: 64, opacity: 0.3 }} />
                                                </Box>
                                                <Typography variant="h6" color="textSecondary" gutterBottom>
                                                    Henüz Paket Bulunmuyor
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    İlk paketinizi oluşturarak başlayın. Paketleriniz danışanlarınıza sunabileceğiniz hizmetleri tanımlar.
                                                </Typography>
                                                <Button 
                                                    variant="contained" 
                                                    color="primary" 
                                                    startIcon={<AddIcon />}
                                                    onClick={() => handleOpenPackageDialog()}
                                                    sx={{ mt: 3 }}
                                                >
                                                    Paket Oluştur
                                                </Button>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    </Box>
                );
            
            case 2: // Invoice Management
                return (
                    <Box className="invoice-management">
                        <Paper elevation={3} className="filters-section">
                            <Box p={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                                <Box display="flex" alignItems="center" gap={2} className="search-filters" flexGrow={1}>
                            <TextField
                                        placeholder="Danışan veya paket ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                        size="small"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                        sx={{ minWidth: 250 }}
                                    />
                                    
                                    <FormControl size="small" sx={{ minWidth: 150 }}>
                                        <InputLabel>Durum</InputLabel>
                                    <Select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            label="Durum"
                                    >
                                        <MenuItem value="all">Tüm Durumlar</MenuItem>
                                        <MenuItem value="Ödendi">Ödendi</MenuItem>
                                        <MenuItem value="Beklemede">Beklemede</MenuItem>
                                        <MenuItem value="Ödenmedi">Ödenmedi</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                                
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenInvoiceDialog()}
                                    className="add-invoice-btn"
                                    sx={{ mt: { xs: 2, md: 0 } }}
                                >
                                    Yeni Fatura
                                </Button>
                </Box>
                        </Paper>
                        
                        <Box mt={4}>
                            <Grid container spacing={3}>
                                {filteredInvoices.map(invoice => (
                                    <Grid item xs={12} md={6} lg={4} key={invoice.id}>
                                        <Paper elevation={3} className={`invoice-card status-${invoice.status.toLowerCase()}`}>
                                            <Box position="relative" p={3}>
                                                <Box className="invoice-header" mb={2} display="flex" justifyContent="space-between" alignItems="flex-start">
                                                    <Box>
                                                        <Typography variant="h6" className="client-name">{invoice.clientName}</Typography>
                                                        <Typography variant="body2" color="textSecondary">{invoice.packageName}</Typography>
                                                    </Box>

                                        <Chip
                                                        label={invoice.status} 
                                            color={
                                                            invoice.status === "Ödendi" ? "success" :
                                                            invoice.status === "Beklemede" ? "warning" : "error"
                                            }
                                            size="small"
                                                        className="status-chip"
                                                    />
                                                </Box>
                                                
                                                <Typography variant="h5" className="invoice-amount" gutterBottom>
                                                    {invoice.amount.toLocaleString()} ₺
                                                </Typography>
                                                
                                                <Divider sx={{ my: 2 }} />
                                                
                                                <Grid container spacing={2} className="invoice-dates">
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="textSecondary">
                                                            Fatura Tarihi
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {new Date(invoice.issueDate).toLocaleDateString('tr-TR')}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="textSecondary">
                                                            Son Ödeme
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                                
                                                <Divider sx={{ my: 2 }} />
                                                
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <FormControl size="small" sx={{ minWidth: 130 }}>
                                                        <InputLabel>Durum</InputLabel>
                                                        <Select
                                                            value={invoice.status}
                                                            onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                                                            label="Durum"
                                                        >
                                                            <MenuItem value="Ödendi">Ödendi</MenuItem>
                                                            <MenuItem value="Beklemede">Beklemede</MenuItem>
                                                            <MenuItem value="Ödenmedi">Ödenmedi</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                    
                                                    <Box>
                                            <IconButton 
                                                            color="primary" 
                                                size="small" 
                                                            onClick={() => handleOpenInvoiceDialog(invoice)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton 
                                                color="error" 
                                                            size="small" 
                                                            onClick={() => handleDeleteInvoice(invoice.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                                
                                {filteredInvoices.length === 0 && (
                                    <Grid item xs={12}>
                                        <Paper elevation={3} className="empty-state">
                                            <Box p={4} textAlign="center">
                                                <Box className="empty-icon">
                                                    <ReceiptIcon style={{ fontSize: 64, opacity: 0.3 }} />
                        </Box>
                                                <Typography variant="h6" color="textSecondary" gutterBottom>
                                                    Fatura Bulunamadı
                            </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Arama kriterlerinize uygun fatura bulunmuyor. Filtrelerinizi değiştirmeyi veya yeni fatura oluşturmayı deneyebilirsiniz.
                            </Typography>
                        <Button 
                            variant="contained" 
                                                    color="primary" 
                                                    startIcon={<AddIcon />}
                                                    onClick={() => handleOpenInvoiceDialog()}
                                                    sx={{ mt: 3 }}
                        >
                                                    Yeni Fatura Oluştur
                        </Button>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    </Box>
                );
            
            default:
                return null;
        }
    };

    return (
        <Default>
            <div className="finans-container">
                <Typography variant="h4" className="page-title">
                    Finansal Yönetim
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} 
                          variant="scrollable" scrollButtons="auto">
                        <Tab icon={<MonetizationOnIcon />} iconPosition="start" label="Genel Bakış" />
                        <Tab icon={<ReceiptIcon />} iconPosition="start" label="Paket Yönetimi" />
                        <Tab icon={<PaymentsIcon />} iconPosition="start" label="Fatura Yönetimi" />
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
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="package-type">Paket Tipi</label>
                                <select
                                    id="package-type"
                                    value={newPackage.type}
                                    onChange={(e) => handlePackageChange('type', e.target.value)}
                                >
                                    <option value="Seanslık">Seanslık</option>
                                    <option value="Aylık">Aylık</option>
                                    <option value="3 Aylık">3 Aylık</option>
                                    <option value="6 Aylık">6 Aylık</option>
                                    <option value="1 Yıllık">1 Yıllık</option>
                                </select>
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
                                        value={newPackage.price}
                                        onChange={(e) => handlePackageChange('price', Number(e.target.value))}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="package-description">Açıklama</label>
                                <input
                                    id="package-description"
                                    type="text"
                                    value={newPackage.description}
                                    onChange={(e) => handlePackageChange('description', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Paket İçeriği</label>
                            
                            <div className="services-list-form">
                                {newPackage.services.map((service, index) => (
                                    <div key={index} className="service-item-input">
                                        <input
                                            type="text"
                                            placeholder={`Hizmet ${index + 1}`}
                                            value={service}
                                            onChange={(e) => handleServiceChange(index, e.target.value)}
                                        />
                                        <button 
                                            type="button"
                                            className="remove-button"
                                            onClick={() => handleRemoveService(index)}
                                            disabled={newPackage.services.length <= 1}
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                ))}
                                
                                <button 
                                    type="button"
                                    className="add-button"
                                    onClick={handleAddService}
                                >
                                    <AddIcon /> Hizmet Ekle
                                </button>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={handleClosePackageDialog}
                            >
                                İptal
                            </button>
                            <button 
                                type="button" 
                                className="save-button"
                                onClick={handleSavePackage}
                            >
                                <SaveIcon /> Kaydet
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
                                <input
                                    id="client-name"
                                    type="text"
                                    value={newInvoice.clientName}
                                    onChange={(e) => handleInvoiceChange('clientName', e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="package-select">Paket</label>
                                <select
                                    id="package-select"
                                    value={newInvoice.packageId}
                                    onChange={(e) => handleInvoiceChange('packageId', Number(e.target.value))}
                                >
                                    {packages.map(pkg => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.name} - {pkg.price.toLocaleString()} ₺
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="invoice-amount">Tutar (₺)</label>
                                <div className="input-with-icon">
                                    <i className="icon">₺</i>
                                    <input
                                        id="invoice-amount"
                                        type="number"
                                        value={newInvoice.amount}
                                        onChange={(e) => handleInvoiceChange('amount', Number(e.target.value))}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="issue-date">Fatura Tarihi</label>
                                <input
                                    id="issue-date"
                                    type="date"
                                    value={newInvoice.issueDate}
                                    onChange={(e) => handleInvoiceChange('issueDate', e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="due-date">Son Ödeme Tarihi</label>
                                <input
                                    id="due-date"
                                    type="date"
                                    value={newInvoice.dueDate}
                                    onChange={(e) => handleInvoiceChange('dueDate', e.target.value)}
                                    required
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
                                    <option value="Beklemede">Beklemede</option>
                                    <option value="Ödenmedi">Ödenmedi</option>
                                </select>
                                <span className="status-indicator"></span>
                            </div>
                        </div>
                        
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
                                <SaveIcon /> Kaydet
                            </button>
                        </div>
                    </div>
                </CustomModal>
            </div>
        </Default>
    );
}