import React, { useState } from 'react';
import './Finans.css';
import Default from "../../Components/Layouts/Default.jsx";
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
    Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function Finans() {
    // Sample data - in a real app, this would come from your backend
    const [clients, setClients] = useState([
        { id: 1, name: "Ayşe Yılmaz", status: "Ödendi", amount: 1200, date: "2025-05-01", package: "3 Aylık Program" },
        { id: 2, name: "Mehmet Kaya", status: "Beklemede", amount: 800, date: "2025-05-10", package: "1 Aylık Program" },
        { id: 3, name: "Zeynep Demir", status: "Ödendi", amount: 1500, date: "2025-04-28", package: "6 Aylık Program" },
        { id: 4, name: "Ali Öztürk", status: "Ödenmedi", amount: 1200, date: "2025-04-15", package: "3 Aylık Program" },
        { id: 5, name: "Fatma Çelik", status: "Ödendi", amount: 500, date: "2025-05-03", package: "1 Aylık Program" },
        { id: 6, name: "Ahmet Şahin", status: "Ödenmedi", amount: 1500, date: "2025-04-20", package: "6 Aylık Program" },
        { id: 7, name: "Selin Arslan", status: "Beklemede", amount: 800, date: "2025-05-12", package: "1 Aylık Program" },
        { id: 8, name: "Burak Yıldız", status: "Ödendi", amount: 1200, date: "2025-04-25", package: "3 Aylık Program" },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Calculate financial stats
    const currentMonthRevenue = clients
        .filter(client => client.status === "Ödendi" && new Date(client.date).getMonth() === new Date().getMonth())
        .reduce((total, client) => total + client.amount, 0);

    const potentialMonthlyRevenue = clients
        .reduce((total, client) => total + client.amount, 0);

    const remainingToCollect = clients
        .filter(client => client.status !== "Ödendi")
        .reduce((total, client) => total + client.amount, 0);

    // Filter clients based on search and filter options
    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Handle payment status change
    const handleStatusChange = (id, newStatus) => {
        setClients(clients.map(client =>
            client.id === id ? { ...client, status: newStatus } : client
        ));
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
                                    <AttachMoneyIcon fontSize="large" />
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
                                    <MoneyOffIcon fontSize="large" />
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
                        <Grid item xs={12} md={6}>
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
                                <TableCell>Program</TableCell>
                                <TableCell>Tarih</TableCell>
                                <TableCell>Tutar</TableCell>
                                <TableCell>Durum</TableCell>
                                <TableCell>İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredClients.map((client) => (
                                <TableRow key={client.id} className={`status-${client.status.toLowerCase()}`}>
                                    <TableCell>{client.name}</TableCell>
                                    <TableCell>{client.package}</TableCell>
                                    <TableCell>{client.date}</TableCell>
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
            </div>
        </Default>
    );
}