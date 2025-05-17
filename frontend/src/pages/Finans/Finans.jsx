import React, { useState, useEffect } from 'react';
import './Finans.css';
import Default from "../../Components/Layouts/Default.jsx";
import axios from 'axios';
import config from "../../config.js";
import {
    Paper, Typography, Box, Grid, Tab, Tabs, TextField, Button,
    Chip, InputAdornment, MenuItem, Select, FormControl, InputLabel,
    Divider, List, ListItem, ListItemIcon, ListItemText, Pagination
} from '@mui/material';
import { 
    Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, 
    CurrencyLira as CurrencyLiraIcon, MonetizationOn as MonetizationOnIcon,
    Receipt as ReceiptIcon, Payments as PaymentsIcon, Save as SaveIcon,
    ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon,
    CheckCircle as CheckCircleIcon, Pending as PendingIcon,
    Cancel as CancelIcon, Search as SearchIcon, Warning as WarningIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

const CustomModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="custom-modal-overlay" onClick={handleOverlayClick}>
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

// Custom Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, itemName, isLoading }) => {
    if (!isOpen) return null;

    // Handle clicking outside the modal
    const handleOverlayClick = (e) => {
        // Only close if not loading and the click is directly on the overlay
        if (!isLoading && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="custom-modal-overlay" onClick={handleOverlayClick}>
            <div className="custom-modal">
                <div className="custom-modal-header">
                    <h2>{title}</h2>
                    <button className="close-button" onClick={onClose} disabled={isLoading}>&times;</button>
                </div>
                <div className="custom-modal-content">
                    <div className="delete-confirm-modal">
                        <div className="delete-warning">
                            <WarningIcon className="warning-icon" />
                            <p className="warning-text">
                                <strong>{itemName}</strong> {message}
                            </p>
                        </div>
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
    const [invoices, setInvoices] = useState([
        { 
            id: 1, 
            clientName: "Ayşe Yılmaz", 
            packageId: 2, 
            packageName: "Aylık Takip", 
            amount: 1500, 
            status: "Ödendi", 
            issueDate: "2025-05-10", 
            dueDate: "2025-05-17" 
        },
        { 
            id: 2, 
            clientName: "Mehmet Kaya", 
            packageId: 3, 
            packageName: "3 Aylık Program", 
            amount: 3600, 
            status: "Ödenmedi", 
            issueDate: "2025-05-15", 
            dueDate: "2025-02-22" 
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
        services: [],
        serviceItems: []
    });
    
    // Add search state for packages
    const [packageSearchTerm, setPackageSearchTerm] = useState('');
    
    // Fetch packages on component mount
    useEffect(() => {
        fetchPackages();
        fetchClients();
        
        // Initialize newPackage with an empty service
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
                    return { ...pkg, services };
                })
            );
            
            setPackages(packagesWithServices);
        } catch (error) {
            console.error('Error fetching packages:', error);
            toast.error('Paketler yüklenirken bir hata oluştu.');
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
            toast.error('Danışanlar yüklenirken bir hata oluştu.');
        }
    };
    
    // Invoice management state
    const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [newInvoice, setNewInvoice] = useState({
        clientName: "",
        clientId: 0,
        packageId: 0,
        packageName: "",
        amount: 0,
        status: "Beklemede",
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Add these two new states for confirmation dialogs
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        itemId: null,
        itemType: null, // 'invoice' or 'package'
        itemName: ''
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [invoicesPerPage] = useState(6);

    // Add helper function to get package duration in months
    const getPackageDurationInMonths = (packageType) => {
        switch(packageType) {
            case "Seanslık":
                return 1; // Count full amount in the month of the session
            case "Aylık":
                return 1; // 1 month
            case "3 Aylık":
                return 3; // 3 months
            case "6 Aylık":
                return 6; // 6 months
            case "1 Yıllık":
                return 12; // 12 months
            default:
                return 1; // Default to 1 month
        }
    };

    // Helper to determine if a package amount should be prorated
    const shouldProrate = (packageType) => {
        return packageType !== "Seanslık"; // Don't prorate session-based packages
    };

    // Calculate financial statistics
    const currentMonthPaid = invoices
        .filter(invoice => {
            const invoiceDate = new Date(invoice.issueDate);
            const currentDate = new Date();
            return invoiceDate.getMonth() === currentDate.getMonth() && 
                   invoiceDate.getFullYear() === currentDate.getFullYear() && 
                   invoice.status === "Ödendi";
        })
        .reduce((total, invoice) => {
            // Find the package to get its type
            const pkg = packages.find(p => p.id === invoice.packageId);
            if (!pkg) return total + invoice.amount;
            
            // For session-based packages, count the full amount
            // For subscription packages, prorate the amount
            if (shouldProrate(pkg.type)) {
                const durationInMonths = getPackageDurationInMonths(pkg.type);
                const proratedAmount = invoice.amount / durationInMonths;
                return total + proratedAmount;
            } else {
                return total + invoice.amount; // Full amount for sessions
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
            // Find the package to get its type
            const pkg = packages.find(p => p.id === invoice.packageId);
            if (!pkg) return total + invoice.amount;
            
            // For session-based packages, count the full amount
            // For subscription packages, prorate the amount
            if (shouldProrate(pkg.type)) {
                const durationInMonths = getPackageDurationInMonths(pkg.type);
                const proratedAmount = invoice.amount / durationInMonths;
                return total + proratedAmount;
            } else {
                return total + invoice.amount; // Full amount for sessions
            }
        }, 0);

    // Total revenue for the current month (paid + pending)
    const totalRevenue = currentMonthPaid + currentMonthUnpaid;

    // All-time total paid revenue (kept for reference but not displayed)
    const allTimeTotalRevenue = invoices
        .filter(invoice => invoice.status === "Ödendi")
        .reduce((total, invoice) => total + invoice.amount, 0);

    // Filter invoices based on search and filter
    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              invoice.packageName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    // Pagination calculation
    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
    const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);
    
    // Handle page change
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        // Scroll to top of invoice list
        const invoiceSection = document.getElementById('invoice-list');
        if (invoiceSection) {
            invoiceSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Tab change handler
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Calculate monthly comparison
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
                // Find the package to get its type
                const pkg = packages.find(p => p.id === invoice.packageId);
                if (!pkg) return total + invoice.amount;
                
                // For session-based packages, count the full amount
                // For subscription packages, prorate the amount
                if (shouldProrate(pkg.type)) {
                    const durationInMonths = getPackageDurationInMonths(pkg.type);
                    const proratedAmount = invoice.amount / durationInMonths;
                    return total + proratedAmount;
                } else {
                    return total + invoice.amount; // Full amount for sessions
                }
            }, 0);
        
        const lastMonthTotal = invoices
            .filter(invoice => {
                const invoiceDate = new Date(invoice.issueDate);
                return invoiceDate.getMonth() === lastMonth && 
                       invoiceDate.getFullYear() === lastMonthYear;
            })
            .reduce((total, invoice) => {
                // Find the package to get its type
                const pkg = packages.find(p => p.id === invoice.packageId);
                if (!pkg) return total + invoice.amount;
                
                // For session-based packages, count the full amount
                // For subscription packages, prorate the amount
                if (shouldProrate(pkg.type)) {
                    const durationInMonths = getPackageDurationInMonths(pkg.type);
                    const proratedAmount = invoice.amount / durationInMonths;
                    return total + proratedAmount;
                } else {
                    return total + invoice.amount; // Full amount for sessions
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
    const handleOpenPackageDialog = async (pkg = null) => {
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
                
                // If no services, add an empty service
                if (serviceNames.length === 0) {
                    serviceNames.push("");
                }
                
                setNewPackage({
                    ...pkg,
                    services: serviceNames,
                    serviceItems: serviceItems
                });
            } catch (error) {
                console.error('Error fetching package items:', error);
                toast.error('Paket hizmetleri yüklenirken bir hata oluştu.');
                setNewPackage({...pkg, services: [""], serviceItems: []});
            }
        } else {
            setCurrentPackage(null);
            setNewPackage({
                name: "",
                type: "Seanslık",
                price: 0,
                description: "",
                services: [""],
                serviceItems: []
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

    const handleSavePackage = async () => {
        if (!newPackage.name || !newPackage.type || newPackage.price <= 0) {
            toast.error("Lütfen tüm gerekli alanları doldurun.");
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
                
                toast.success(`${newPackage.name} paketi güncellendi.`);
            } else {
                // Create new package
                const packageData = {
                    name: newPackage.name,
                    description: newPackage.description,
                    type: newPackage.type,
                    price: parseInt(newPackage.price, 10) // Ensure price is sent as a number
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
                
                toast.success(`${newPackage.name} paketi oluşturuldu.`);
            }
            
            // Refresh packages after saving
            await fetchPackages();
        } catch (error) {
            console.error('Error saving package:', error);
            toast.error('Paket kaydedilirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
            handleClosePackageDialog();
        }
    };

    const handleDeletePackage = (id) => {
        // Check if package is used in any invoices
        const isUsed = invoices.some(invoice => invoice.packageId === id);
        if (isUsed) {
            toast.error("Bu paket faturalarda kullanıldığı için silinemez.");
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
        const { itemId, itemType, itemName } = deleteConfirmation;
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
                toast.success(`"${itemName}" paketi silindi.`);
                await fetchPackages(); // Refresh packages list
            } else if (itemType === 'invoice') {
                setInvoices(invoices.filter(invoice => invoice.id !== itemId));
                toast.success(`"${itemName}" danışanının faturası silindi.`);
            }
        } catch (error) {
            console.error(`Error deleting ${itemType}:`, error);
            toast.error(`${itemType === 'package' ? 'Paket' : 'Fatura'} silinirken bir hata oluştu.`);
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
            
            switch(packageType) {
                case "Seanslık":
                    dueDate.setDate(dueDate.getDate() + 1); // +1 day
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
        if (invoice) {
            setCurrentInvoice(invoice);
            setNewInvoice({...invoice});
        } else {
            // Get the first package if available
            const firstPackage = packages.length > 0 ? packages[0] : null;
            
            // Format dates safely
            const today = new Date();
            
            // Calculate due date only if a package is selected
            let dueDate;
            if (firstPackage) {
                dueDate = calculateDueDateFromPackageType(today, firstPackage.type);
            } else {
                // If no package, set due date to blank to let user choose
                dueDate = new Date(today);
                dueDate.setDate(dueDate.getDate() + 7); // Default suggestion, but user can change
            }
            
            setCurrentInvoice(null);
            setNewInvoice({
                clientName: clients.length > 0 ? clients[0].name : "",
                clientId: clients.length > 0 ? clients[0].id : 0,
                packageId: firstPackage ? firstPackage.id : 0,
                packageName: firstPackage ? firstPackage.name : "",
                amount: firstPackage ? Number(firstPackage.price) : 0,
                status: "Beklemede",
                issueDate: safelyFormatDate(today),
                dueDate: safelyFormatDate(dueDate)
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

        // Auto-update amount and due date if package changes
        if (field === 'packageId') {
            const selectedPackage = packages.find(pkg => pkg.id === Number(value));
            if (selectedPackage) {
                // Calculate due date based on package type and current issue date
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
                } catch (error) {
                    console.error('Error updating due date:', error);
                    // Still update other fields but use a safe default for dueDate
                    setNewInvoice(prev => ({
                        ...prev,
                        packageId: Number(value),
                        amount: Number(selectedPackage.price),
                        packageName: selectedPackage.name
                    }));
                }
            } else {
                // If no package is selected (or package ID is 0), update packageId but don't auto-set dueDate
                // This allows users to manually select their preferred due date
                setNewInvoice(prev => ({
                    ...prev,
                    packageId: Number(value) || 0,
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

    const handleSaveInvoice = () => {
        if (!newInvoice.clientName || !newInvoice.packageId || newInvoice.amount <= 0) {
            toast.error("Lütfen tüm gerekli alanları doldurun.");
            return;
        }

        const selectedPackage = packages.find(pkg => pkg.id === newInvoice.packageId);
        
        // Check if selectedPackage exists
        if (!selectedPackage) {
            toast.error("Seçilen paket bulunamadı.");
            return;
        }
        
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
        const invoiceToDelete = invoices.find(invoice => invoice.id === id);
        if (!invoiceToDelete) return;
        
        // Open confirmation dialog
        setDeleteConfirmation({
            isOpen: true,
            itemId: id,
            itemType: 'invoice',
            itemName: invoiceToDelete.clientName
        });
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
                // Filter packages based on search term
                const filteredPackages = packages.filter(pkg => 
                    pkg.name.toLowerCase().includes(packageSearchTerm.toLowerCase()) ||
                    pkg.type.toLowerCase().includes(packageSearchTerm.toLowerCase()) ||
                    (pkg.description && pkg.description.toLowerCase().includes(packageSearchTerm.toLowerCase()))
                );
                
                return (
                    <Box className="package-management">
                        <Paper elevation={3} className="filters-section">
                            <Box p={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                                <Box display="flex" alignItems="center" gap={2} className="search-filters" flexGrow={1}>
                                    <TextField
                                        placeholder="Paket ara..."
                                        value={packageSearchTerm}
                                        onChange={(e) => setPackageSearchTerm(e.target.value)}
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
                                </Box>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    startIcon={<AddIcon />}
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
                                                    {Number(pkg.price).toLocaleString()} ₺
                                                </Typography>
                                                
                                                <Divider sx={{ my: 2 }} />
                                                
                                                <Typography variant="subtitle2" className="services-title" gutterBottom>
                                                    Paket İçeriği
                                                </Typography>
                                                
                                                <List dense className="services-list">
                                                    {pkg.services && pkg.services.length > 0 ? pkg.services.map((service, index) => (
                                                        <ListItem key={index} disableGutters className="service-item">
                                                            <ListItemIcon style={{ minWidth: 28 }}>
                                                                <CheckCircleIcon fontSize="small" color="success" />
                                                            </ListItemIcon>
                                                            <ListItemText primary={service} />
                                                        </ListItem>
                                                    )) : (
                                                        <ListItem disableGutters>
                                                            <ListItemText primary="Paket içeriği belirtilmemiş" />
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
                                                        startIcon={<EditIcon />}
                                                        onClick={() => handleOpenPackageDialog(pkg)}
                                                        disabled={isLoading}
                                                    >
                                                        Düzenle
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        startIcon={<DeleteIcon />}
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
                                                    <ReceiptIcon style={{ fontSize: 64, opacity: 0.3 }} />
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
                                                    startIcon={packageSearchTerm ? <SearchIcon /> : <AddIcon />}
                                                    onClick={() => packageSearchTerm ? setPackageSearchTerm('') : handleOpenPackageDialog()}
                                                    sx={{ mt: 3 }}
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
            
            case 2: // Invoice Management
                return (
                    <Box className="invoice-management">
                        <Paper elevation={3} className="filters-section">
                            <Box p={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                                <Box display="flex" alignItems="center" gap={2} className="search-filters" flexGrow={1}>
                                    <TextField
                                        placeholder="Danışan veya paket ara..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1); // Reset to first page on search
                                        }}
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
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                setCurrentPage(1); // Reset to first page on filter change
                                            }}
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
                        
                        <Box mt={4} id="invoice-list">
                            <Grid container spacing={3}>
                                {currentInvoices.length > 0 ? (
                                    currentInvoices.map(invoice => (
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
                                                    
                                                    <Box className="invoice-card-footer-spacer" mt={5}></Box>
                                                </Box>
                                                <Box className="invoice-card-footer">
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
                                                    
                                                    <Box className="invoice-card-actions">
                                                        <Button 
                                                            variant="contained" 
                                                            color="primary" 
                                                            size="small" 
                                                            startIcon={<EditIcon />}
                                                            onClick={() => handleOpenInvoiceDialog(invoice)}
                                                        >
                                                            Düzenle
                                                        </Button>
                                                        <Button 
                                                            variant="contained" 
                                                            color="error" 
                                                            size="small" 
                                                            startIcon={<DeleteIcon />}
                                                            onClick={() => handleDeleteInvoice(invoice.id)}
                                                        >
                                                            Sil
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))
                                ) : (
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
                            
                            {/* Pagination */}
                            {filteredInvoices.length > invoicesPerPage && (
                                <Box display="flex" justifyContent="center" mt={4} mb={2}>
                                    <Pagination 
                                        count={totalPages} 
                                        page={currentPage}
                                        onChange={handlePageChange}
                                        color="primary"
                                        showFirstButton
                                        showLastButton
                                        size="large"
                                    />
                                </Box>
                            )}
                            
                            {/* Invoice count info */}
                            <Box textAlign="center" mt={2} mb={4}>
                                <Typography variant="body2" color="textSecondary">
                                    Toplam {filteredInvoices.length} faturadan {indexOfFirstInvoice + 1}-
                                    {Math.min(indexOfLastInvoice, filteredInvoices.length)} arası gösteriliyor
                                </Typography>
                            </Box>
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
                <Box sx={{ mb: 3 }}>
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
                                    disabled={isLoading}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="package-type">Paket Tipi</label>
                                <select
                                    id="package-type"
                                    value={newPackage.type}
                                    onChange={(e) => handlePackageChange('type', e.target.value)}
                                    disabled={isLoading}
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
                                        disabled={isLoading}
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
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Paket İçeriği</label>
                            
                            <div className="services-list-form">
                                {newPackage.services.map((service, index) => (
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
                                            disabled={newPackage.services.length <= 1 || isLoading}
                                            title="Hizmeti Sil"
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                ))}
                                
                                <button 
                                    type="button"
                                    className="add-button"
                                    onClick={handleAddService}
                                    disabled={isLoading}
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
                                {isLoading ? 'Kaydediliyor...' : <><SaveIcon /> Kaydet</>}
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
                                    <select
                                        id="client-select"
                                        value={newInvoice.clientId || ""}
                                        onChange={(e) => handleInvoiceChange('clientId', e.target.value ? Number(e.target.value) : 0)}
                                        required
                                    >
                                        <option value="">Danışan Seçin</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="package-select">Paket</label>
                                {packages.length > 0 ? (
                                    <select
                                        id="package-select"
                                        value={newInvoice.packageId || ""}
                                        onChange={(e) => handleInvoiceChange('packageId', e.target.value ? Number(e.target.value) : 0)}
                                    >
                                        <option value="">Paket Seçin</option>
                                        {packages.map(pkg => (
                                            <option key={pkg.id} value={pkg.id}>
                                                {pkg.name} - {Number(pkg.price).toLocaleString()} ₺
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="no-packages-warning">
                                        <p>Henüz paket bulunmuyor. Lütfen önce paket ekleyin.</p>
                                    </div>
                                )}
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
                                        value={newInvoice.amount || 0}
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

                {/* Confirmation Dialog */}
                <ConfirmationDialog 
                    isOpen={deleteConfirmation.isOpen}
                    onClose={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
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