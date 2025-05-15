import React, { useState } from 'react';
import './Finans.css';
import Default from "../../Components/Layouts/Default.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CurrencyLiraIcon from '@mui/icons-material/CurrencyLira';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'react-hot-toast';

export default function Finans() {
    // Sample data - in a real app, this would come from your backend
    const [clients, setClients] = useState([
        { id: 1, name: "Ayşe Yılmaz", status: "Ödendi", amount: 1200, issueDate: "2025-04-01", dueDate: "2025-05-01", description: "Beslenme Danışmanlığı" },
        { id: 2, name: "Mehmet Kaya", status: "Beklemede", amount: 800, issueDate: "2025-04-10", dueDate: "2025-05-10", description: "Kişisel Beslenme Planı" },
        { id: 3, name: "Zeynep Demir", status: "Ödendi", amount: 1500, issueDate: "2025-03-28", dueDate: "2025-04-28", description: "Detox Programı" },
        { id: 4, name: "Ali Öztürk", status: "Ödenmedi", amount: 1200, issueDate: "2025-03-15", dueDate: "2025-04-15", description: "Kilo Verme Programı" },
        { id: 5, name: "Fatma Çelik", status: "Ödendi", amount: 500, issueDate: "2025-04-03", dueDate: "2025-05-03", description: "Beslenme Danışmanlığı" },
        { id: 6, name: "Ahmet Şahin", status: "Ödenmedi", amount: 1500, issueDate: "2025-03-20", dueDate: "2025-04-20", description: "Sporcu Beslenmesi" },
        { id: 7, name: "Selin Arslan", status: "Beklemede", amount: 800, issueDate: "2025-04-12", dueDate: "2025-05-12", description: "Kişisel Beslenme Planı" },
        { id: 8, name: "Burak Yıldız", status: "Ödendi", amount: 1200, issueDate: "2025-03-25", dueDate: "2025-04-25", description: "Kilo Alma Programı" },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    
    // Date range filter
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    
    // Delete confirmation dialog
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);

    // Edit invoice dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [editedValues, setEditedValues] = useState({
        name: '',
        description: '',
        amount: 0,
        issueDate: '',
        dueDate: '',
        status: ''
    });

    // Calculate financial stats
    const currentMonthRevenue = clients
        .filter(client => client.status === "Ödendi" && 
            (new Date(client.dueDate).getMonth() === new Date().getMonth() || 
             new Date(client.issueDate).getMonth() === new Date().getMonth()))
        .reduce((total, client) => total + client.amount, 0);

    const potentialMonthlyRevenue = clients
        .reduce((total, client) => total + client.amount, 0);

    const remainingToCollect = clients
        .filter(client => client.status !== "Ödendi")
        .reduce((total, client) => total + client.amount, 0);

    // Filter clients based on search, filter options, and date range
    const filteredClients = clients.filter(client => {
        // Search filter
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              client.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Status filter
        const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
        
        // Date range filter
        const matchesDateRange = (!startDate || !endDate) ? true : 
            (new Date(client.issueDate) >= startDate && 
             new Date(client.issueDate) <= endDate);
        
        return matchesSearch && matchesFilter && matchesDateRange;
    });

    // Handle payment status change
    const handleStatusChange = (id, newStatus) => {
        setClients(clients.map(client =>
            client.id === id ? { ...client, status: newStatus } : client
        ));
        
        const client = clients.find(c => c.id === id);
        toast.success(`${client.name} için ödeme durumu "${newStatus}" olarak güncellendi.`);
    };

    // Handle action buttons
    const handlePrintInvoice = (client) => {
        console.log("Printing invoice for:", client.name);
        // Implement invoice printing logic
        toast.success(`${client.name} için fatura yazdırılıyor...`);
    };

    const handleEditInvoice = (client) => {
        setEditingClient(client);
        setEditedValues({
            name: client.name,
            description: client.description,
            amount: client.amount,
            issueDate: client.issueDate,
            dueDate: client.dueDate,
            status: client.status
        });
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setEditingClient(null);
    };

    const handleSaveEdit = () => {
        if (!editingClient) return;
        
        // Update client data
        setClients(clients.map(client => 
            client.id === editingClient.id 
                ? { ...client, ...editedValues } 
                : client
        ));
        
        toast.success(`${editedValues.name} için fatura bilgileri güncellendi.`);
        handleCloseEditDialog();
    };

    const handleEditFieldChange = (field, value) => {
        setEditedValues({
            ...editedValues,
            [field]: value
        });
    };

    const handleOpenDeleteConfirm = (client) => {
        setClientToDelete(client);
        setDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setClientToDelete(null);
    };

    const handleDeleteInvoice = () => {
        if (!clientToDelete) return;
        
        // Implement delete functionality
        setClients(clients.filter(c => c.id !== clientToDelete.id));
        toast.success(`${clientToDelete.name} için fatura silindi.`);
        handleCloseDeleteConfirm();
    };

    // Reset date filter
    const resetDateFilter = () => {
        setDateRange([null, null]);
        toast.success('Tarih filtresi sıfırlandı.');
    };

    return (
        <Default>
            <div className="finans-container">
                <Typography variant="h4" gutterBottom className="page-title">
                    Finansal Takip
                </Typography>

                {/* Stats Cards */}
                <Box className="stats-container">
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={3} className="stat-card current-revenue">
                                <Box className="stat-icon">
                                    <CurrencyLiraIcon fontSize="large" />
                                </Box>
                                <Box className="stat-content">
                                    <Typography variant="subtitle1">Aylık Mevcut Gelir</Typography>
                                    <Typography variant="h4">{currentMonthRevenue} TL</Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Paper elevation={3} className="stat-card potential-revenue">
                                <Box className="stat-icon">
                                    <TrendingUpIcon fontSize="large" />
                                </Box>
                                <Box className="stat-content">
                                    <Typography variant="subtitle1">Aylık Potansiyel Gelir</Typography>
                                    <Typography variant="h4">{potentialMonthlyRevenue} TL</Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Paper elevation={3} className="stat-card remaining-revenue">
                                <Box className="stat-icon">
                                    <CurrencyLiraIcon fontSize="large" />
                                </Box>
                                <Box className="stat-content">
                                    <Typography variant="subtitle1">Toplanacak Tutar</Typography>
                                    <Typography variant="h4">{remainingToCollect} TL</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* Search and Filter */}
                <Box className="filters-container" mb={3} mt={4}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                placeholder="Danışan Ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <div className="date-range-wrapper">
                                    <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                    <DatePicker
                                        selectsRange={true}
                                        startDate={startDate}
                                        endDate={endDate}
                                        onChange={(update) => {
                                            setDateRange(update);
                                        }}
                                        isClearable={false}
                                        placeholderText="Tarih Aralığı Seçin"
                                        dateFormat="dd/MM/yyyy"
                                        className="date-range-picker"
                                    />
                                    {(startDate || endDate) && (
                                        <IconButton
                                            size="small"
                                            onClick={resetDateFilter}
                                            sx={{ ml: 1 }}
                                        >
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </div>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box display="flex" alignItems="center">
                                <FilterListIcon sx={{ mr: 1 }} />
                                <FormControl variant="outlined" size="small" fullWidth>
                                    <Select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        displayEmpty
                                    >
                                        <MenuItem value="all">Tüm Durumlar</MenuItem>
                                        <MenuItem value="Ödendi">Ödendi</MenuItem>
                                        <MenuItem value="Beklemede">Beklemede</MenuItem>
                                        <MenuItem value="Ödenmedi">Ödenmedi</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Clients Table */}
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow className="table-header">
                                <TableCell>Danışan Adı</TableCell>
                                <TableCell>Açıklama</TableCell>
                                <TableCell>Fatura Tarihi</TableCell>
                                <TableCell>Son Ödeme Tarihi</TableCell>
                                <TableCell>Tutar</TableCell>
                                <TableCell>Durum</TableCell>
                                <TableCell>İşlemler</TableCell>
                                <TableCell>Ödeme Durumu</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredClients.map((client) => (
                                <TableRow key={client.id} className={`status-${client.status.toLowerCase()}`}>
                                    <TableCell>{client.name}</TableCell>
                                    <TableCell>{client.description}</TableCell>
                                    <TableCell>{client.issueDate}</TableCell>
                                    <TableCell>{client.dueDate}</TableCell>
                                    <TableCell>{client.amount} TL</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={client.status}
                                            color={
                                                client.status === "Ödendi" ? "success" :
                                                    client.status === "Beklemede" ? "warning" : "error"
                                            }
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <IconButton 
                                                size="small" 
                                                color="primary" 
                                                onClick={() => handlePrintInvoice(client)}
                                                title="Fatura Yazdır"
                                            >
                                                <PrintIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton 
                                                size="small" 
                                                color="info" 
                                                onClick={() => handleEditInvoice(client)}
                                                title="Düzenle"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                onClick={() => handleOpenDeleteConfirm(client)}
                                                title="Sil"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <FormControl variant="outlined" size="small">
                                            <Select
                                                value={client.status}
                                                onChange={(e) => handleStatusChange(client.id, e.target.value)}
                                                displayEmpty
                                                size="small"
                                            >
                                                <MenuItem value="Ödendi">Ödendi</MenuItem>
                                                <MenuItem value="Beklemede">Beklemede</MenuItem>
                                                <MenuItem value="Ödenmedi">Ödenmedi</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteConfirmOpen}
                    onClose={handleCloseDeleteConfirm}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        <Box display="flex" alignItems="center" gap={1}>
                            <WarningIcon color="warning" />
                            <Typography variant="h6">Fatura Sil</Typography>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <Typography variant="body1" fontWeight="bold">
                                {clientToDelete?.name} adlı danışanın faturasını silmek istediğinize emin misiniz?
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                Bu işlem geri alınamaz.
                            </Typography>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteConfirm} color="primary">
                            Vazgeç
                        </Button>
                        <Button 
                            onClick={handleDeleteInvoice} 
                            color="error" 
                            variant="contained" 
                            autoFocus
                        >
                            Sil
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Invoice Dialog */}
                <Dialog
                    open={editDialogOpen}
                    onClose={handleCloseEditDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <Box display="flex" alignItems="center" gap={1}>
                            <EditIcon color="info" />
                            <Typography variant="h6">Fatura Düzenle</Typography>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    disabled
                                    fullWidth
                                    label="Danışan Adı"
                                    value={editedValues.name}
                                    onChange={(e) => handleEditFieldChange('name', e.target.value)}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Tutar (TL)"
                                    type="number"
                                    value={editedValues.amount}
                                    onChange={(e) => handleEditFieldChange('amount', parseFloat(e.target.value))}
                                    margin="normal"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CurrencyLiraIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Açıklama"
                                    value={editedValues.description}
                                    onChange={(e) => handleEditFieldChange('description', e.target.value)}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Fatura Tarihi"
                                    type="date"
                                    value={editedValues.issueDate}
                                    onChange={(e) => handleEditFieldChange('issueDate', e.target.value)}
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Son Ödeme Tarihi"
                                    type="date"
                                    value={editedValues.dueDate}
                                    onChange={(e) => handleEditFieldChange('dueDate', e.target.value)}
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth margin="normal">
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        Ödeme Durumu
                                    </Typography>
                                    <Select
                                        value={editedValues.status}
                                        onChange={(e) => handleEditFieldChange('status', e.target.value)}
                                    >
                                        <MenuItem value="Ödendi">Ödendi</MenuItem>
                                        <MenuItem value="Beklemede">Beklemede</MenuItem>
                                        <MenuItem value="Ödenmedi">Ödenmedi</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditDialog} color="inherit">
                            İptal
                        </Button>
                        <Button 
                            onClick={handleSaveEdit} 
                            color="primary" 
                            variant="contained"
                            startIcon={<SaveIcon />}
                        >
                            Kaydet
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </Default>
    );
}