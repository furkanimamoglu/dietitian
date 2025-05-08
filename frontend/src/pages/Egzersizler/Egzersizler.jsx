import React, { useState, useEffect } from 'react';
import './Egzersizler.css';
import Default from "../../Components/Layouts/Default.jsx";
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Avatar,
    Card,
    CardContent,
    CardMedia,
    CardHeader,
    Divider,
    IconButton,
    Chip,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function Egzersizler() {
    // Sample data - in a real app, this would come from your backend
    const exerciseCategories = [
        "Kardiyo", "Güç Antrenmanı", "Esneklik", "Denge", "HIIT"
    ];

    const [exercises, setExercises] = useState([
        { id: 1, name: "Koşu", category: "Kardiyo", duration: "30 dakika", calories: 300, image: "/api/placeholder/200/150", description: "Orta tempoda koşu" },
        { id: 2, name: "Şınav", category: "Güç Antrenmanı", duration: "15 dakika", calories: 150, image: "/api/placeholder/200/150", description: "3 set, 15 tekrar" },
        { id: 3, name: "Yoga", category: "Esneklik", duration: "45 dakika", calories: 200, image: "/api/placeholder/200/150", description: "Temel yoga hareketleri" },
        { id: 4, name: "Plank", category: "Güç Antrenmanı", duration: "10 dakika", calories: 100, image: "/api/placeholder/200/150", description: "3 set, 60 saniye" },
        { id: 5, name: "Burpee", category: "HIIT", duration: "20 dakika", calories: 250, image: "/api/placeholder/200/150", description: "4 set, 15 tekrar" },
        { id: 6, name: "Bisiklet", category: "Kardiyo", duration: "45 dakika", calories: 400, image: "/api/placeholder/200/150", description: "Orta tempoda bisiklet sürme" },
        { id: 7, name: "Mekik", category: "Güç Antrenmanı", duration: "15 dakika", calories: 120, image: "/api/placeholder/200/150", description: "3 set, 20 tekrar" },
        { id: 8, name: "Jumping Jack", category: "HIIT", duration: "10 dakika", calories: 100, image: "/api/placeholder/200/150", description: "5 set, 30 saniye" },
    ]);

    const [clients, setClients] = useState([
        { id: 1, name: "Ayşe Yılmaz", age: 28, goal: "Kilo Verme", image: "/api/placeholder/100/100", exercises: [2, 5, 7] },
        { id: 2, name: "Mehmet Kaya", age: 35, goal: "Kas Kazanma", image: "/api/placeholder/100/100", exercises: [1, 4] },
        { id: 3, name: "Zeynep Demir", age: 42, goal: "Genel Sağlık", image: "/api/placeholder/100/100", exercises: [3, 6] },
        { id: 4, name: "Ali Öztürk", age: 30, goal: "Dayanıklılık", image: "/api/placeholder/100/100", exercises: [1, 5, 8] },
    ]);

    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [tabValue, setTabValue] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setTabValue(0);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleExerciseDialog = (exercise) => {
        setSelectedExercise(exercise);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const filteredExercises = exercises.filter(exercise => {
        const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || exercise.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getClientExercises = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        if (!client) return [];

        return client.exercises.map(exId => exercises.find(ex => ex.id === exId));
    };

    const handleDragEnd = (result) => {
        if (!result.destination || !selectedClient) return;

        const { source, destination, draggableId } = result;

        // If dropping from exercise library to client's plan
        if (source.droppableId === 'exercise-library' && destination.droppableId === 'client-plan') {
            const exerciseId = parseInt(draggableId.split('-')[1]);

            // Update client's exercises if not already assigned
            if (!selectedClient.exercises.includes(exerciseId)) {
                const updatedClients = clients.map(client => {
                    if (client.id === selectedClient.id) {
                        return {
                            ...client,
                            exercises: [...client.exercises, exerciseId]
                        };
                    }
                    return client;
                });

                setClients(updatedClients);
                setSelectedClient({...selectedClient, exercises: [...selectedClient.exercises, exerciseId]});
            }
        }

        // If reordering within client's plan
        else if (source.droppableId === 'client-plan' && destination.droppableId === 'client-plan') {
            const exerciseId = parseInt(draggableId.split('-')[1]);
            const newExerciseList = Array.from(selectedClient.exercises);
            newExerciseList.splice(source.index, 1);
            newExerciseList.splice(destination.index, 0, exerciseId);

            const updatedClients = clients.map(client => {
                if (client.id === selectedClient.id) {
                    return {
                        ...client,
                        exercises: newExerciseList
                    };
                }
                return client;
            });

            setClients(updatedClients);
            setSelectedClient({...selectedClient, exercises: newExerciseList});
        }
    };

    const removeExerciseFromClient = (exerciseId) => {
        if (!selectedClient) return;

        const updatedExercises = selectedClient.exercises.filter(id => id !== exerciseId);

        const updatedClients = clients.map(client => {
            if (client.id === selectedClient.id) {
                return {
                    ...client,
                    exercises: updatedExercises
                };
            }
            return client;
        });

        setClients(updatedClients);
        setSelectedClient({...selectedClient, exercises: updatedExercises});
    };

    return (
        <Default>
            <div className="egzersizler-container">
                <Typography variant="h4" gutterBottom className="page-title">
                    <FitnessCenterIcon fontSize="large" className="title-icon" />
                    Egzersiz Takibi
                </Typography>

                <Grid container spacing={3}>
                    {/* Left Column - Client List */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper elevation={3} className="client-list-container">
                            <Typography variant="h6" className="section-title">
                                Danışanlar
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Danışan Ara..."
                                variant="outlined"
                                size="small"
                                className="search-field"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <List className="client-list">
                                {clients.map((client) => (
                                    <ListItem
                                        key={client.id}
                                        button
                                        className={`client-item ${selectedClient && selectedClient.id === client.id ? 'selected-client' : ''}`}
                                        onClick={() => handleClientSelect(client)}
                                    >
                                        <ListItemAvatar>
                                            <Avatar src={client.image} alt={client.name}>
                                                <PersonIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={client.name}
                                            secondary={`${client.age} yaş • ${client.goal}`}
                                        />
                                        <Chip
                                            label={`${client.exercises.length} Egzersiz`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Right Column - Client Details and Exercise Assignment */}
                    <Grid item xs={12} md={8} lg={9}>
                        {selectedClient ? (
                            <Box>
                                {/* Client Header */}
                                <Paper elevation={3} className="client-header">
                                    <Box display="flex" alignItems="center">
                                        <Avatar
                                            src={selectedClient.image}
                                            alt={selectedClient.name}
                                            className="client-avatar"
                                        >
                                            <PersonIcon />
                                        </Avatar>
                                        <Box ml={2}>
                                            <Typography variant="h5">{selectedClient.name}</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {selectedClient.age} yaş • {selectedClient.goal} • {selectedClient.exercises.length} Egzersiz Atanmış
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>

                                {/* Tabs for Client Exercises and Library */}
                                <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3, mb: 2 }}>
                                    <Tabs value={tabValue} onChange={handleTabChange}>
                                        <Tab icon={<DirectionsRunIcon />} label="Atanmış Egzersizler" />
                                        <Tab icon={<FitnessCenterIcon />} label="Egzersiz Kütüphanesi" />
                                    </Tabs>
                                </Box>

                                {/* Content based on selected tab */}
                                <Box className="tab-content">
                                    {tabValue === 0 ? (
                                        <DragDropContext onDragEnd={handleDragEnd}>
                                            <Droppable droppableId="client-plan">
                                                {(provided) => (
                                                    <Box
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className="client-exercises-container"
                                                    >
                                                        <Typography variant="subtitle1" gutterBottom>
                                                            Danışana atanmış egzersizleri sürükleyerek yeniden sıralayabilirsiniz.
                                                        </Typography>

                                                        {selectedClient.exercises.length === 0 ? (
                                                            <Box className="empty-exercises">
                                                                <Typography variant="body1" color="textSecondary" textAlign="center">
                                                                    Bu danışana henüz egzersiz atanmamış. Egzersiz Kütüphanesinden egzersiz sürükleyerek atayabilirsiniz.
                                                                </Typography>
                                                            </Box>
                                                        ) : (
                                                            <Grid container spacing={2}>
                                                                {getClientExercises(selectedClient.id).map((exercise, index) => (
                                                                    exercise && (
                                                                        <Draggable
                                                                            key={`assigned-${exercise.id}`}
                                                                            draggableId={`assigned-${exercise.id}`}
                                                                            index={index}
                                                                        >
                                                                            {(provided) => (
                                                                                <Grid item xs={12} sm={6} md={4}
                                                                                      ref={provided.innerRef}
                                                                                      {...provided.draggableProps}
                                                                                      {...provided.dragHandleProps}
                                                                                >
                                                                                    <Card className="exercise-card assigned">
                                                                                        <CardMedia
                                                                                            component="img"
                                                                                            height="140"
                                                                                            image={exercise.image}
                                                                                            alt={exercise.name}
                                                                                        />
                                                                                        <CardContent>
                                                                                            <Typography variant="h6" component="div">
                                                                                                {exercise.name}
                                                                                            </Typography>
                                                                                            <Chip
                                                                                                label={exercise.category}
                                                                                                size="small"
                                                                                                color="primary"
                                                                                                className="category-chip"
                                                                                            />
                                                                                            <Box className="exercise-details">
                                                                                                <Box display="flex" alignItems="center" mt={1}>
                                                                                                    <AccessTimeIcon fontSize="small" />
                                                                                                    <Typography variant="body2" ml={1}>{exercise.duration}</Typography>
                                                                                                </Box>
                                                                                                <Box display="flex" alignItems="center" mt={1}>
                                                                                                    <DirectionsRunIcon fontSize="small" />
                                                                                                    <Typography variant="body2" ml={1}>{exercise.calories} kalori</Typography>
                                                                                                </Box>
                                                                                            </Box>
                                                                                            <Box className="card-actions" mt={2}>
                                                                                                <IconButton size="small" onClick={() => handleExerciseDialog(exercise)}>
                                                                                                    <InfoIcon />
                                                                                                </IconButton>
                                                                                                <IconButton size="small" onClick={() => removeExerciseFromClient(exercise.id)}>
                                                                                                    <DeleteIcon />
                                                                                                </IconButton>
                                                                                            </Box>
                                                                                        </CardContent>
                                                                                    </Card>
                                                                                </Grid>
                                                                            )}
                                                                        </Draggable>
                                                                    )
                                                                ))}
                                                            </Grid>
                                                        )}
                                                        {provided.placeholder}
                                                    </Box>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    ) : (
                                        <Box>
                                            {/* Exercise Library Search & Filter */}
                                            <Box className="library-filters">
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            fullWidth
                                                            placeholder="Egzersiz Ara..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            variant="outlined"
                                                            size="small"
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <SearchIcon />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <FormControl fullWidth size="small" variant="outlined">
                                                            <InputLabel>Kategori</InputLabel>
                                                            <Select
                                                                value={categoryFilter}
                                                                onChange={(e) => setCategoryFilter(e.target.value)}
                                                                label="Kategori"
                                                            >
                                                                <MenuItem value="all">Tüm Kategoriler</MenuItem>
                                                                {exerciseCategories.map((category) => (
                                                                    <MenuItem key={category} value={category}>{category}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                </Grid>
                                            </Box>

                                            {/* Exercise Library Cards */}
                                            <DragDropContext onDragEnd={handleDragEnd}>
                                                <Droppable droppableId="exercise-library">
                                                    {(provided) => (
                                                        <Grid
                                                            container
                                                            spacing={2}
                                                            className="exercise-library"
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                        >
                                                            <Grid item xs={12}>
                                                                <Typography variant="subtitle1" gutterBottom>
                                                                    Egzersizi danışana atamak için sürükleyip bırakın.
                                                                </Typography>
                                                            </Grid>

                                                            {filteredExercises.map((exercise, index) => (
                                                                <Draggable
                                                                    key={`exercise-${exercise.id}`}
                                                                    draggableId={`exercise-${exercise.id}`}
                                                                    index={index}
                                                                >
                                                                    {(provided) => (
                                                                        <Grid item xs={12} sm={6} md={4} lg={3}
                                                                              ref={provided.innerRef}
                                                                              {...provided.draggableProps}
                                                                              {...provided.dragHandleProps}
                                                                        >
                                                                            <Card className={`exercise-card ${selectedClient.exercises.includes(exercise.id) ? 'already-assigned' : ''}`}>
                                                                                {selectedClient.exercises.includes(exercise.id) && (
                                                                                    <Box className="assigned-overlay">
                                                                                        <CheckCircleIcon color="success" />
                                                                                        <Typography variant="caption">Atanmış</Typography>
                                                                                    </Box>
                                                                                )}
                                                                                <CardMedia
                                                                                    component="img"
                                                                                    height="140"
                                                                                    image={exercise.image}
                                                                                    alt={exercise.name}
                                                                                />
                                                                                <CardContent>
                                                                                    <Typography variant="h6" component="div">
                                                                                        {exercise.name}
                                                                                    </Typography>
                                                                                    <Chip
                                                                                        label={exercise.category}
                                                                                        size="small"
                                                                                        color="primary"
                                                                                        className="category-chip"
                                                                                    />
                                                                                    <Box className="exercise-details">
                                                                                        <Box display="flex" alignItems="center" mt={1}>
                                                                                            <AccessTimeIcon fontSize="small" />
                                                                                            <Typography variant="body2" ml={1}>{exercise.duration}</Typography>
                                                                                        </Box>
                                                                                        <Box display="flex" alignItems="center" mt={1}>
                                                                                            <DirectionsRunIcon fontSize="small" />
                                                                                            <Typography variant="body2" ml={1}>{exercise.calories} kalori</Typography>
                                                                                        </Box>
                                                                                    </Box>
                                                                                    <Box className="card-actions" mt={2}>
                                                                                        <IconButton size="small" onClick={() => handleExerciseDialog(exercise)}>
                                                                                            <InfoIcon />
                                                                                        </IconButton>
                                                                                    </Box>
                                                                                </CardContent>
                                                                            </Card>
                                                                        </Grid>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </Grid>
                                                    )}
                                                </Droppable>
                                            </DragDropContext>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ) : (
                            <Paper elevation={3} className="no-client-selected">
                                <Box p={4} textAlign="center">
                                    <PersonIcon style={{ fontSize: 60, opacity: 0.3 }} />
                                    <Typography variant="h6" mt={2}>
                                        Danışan seçilmedi
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Egzersizleri görüntülemek ve atamak için sol menüden bir danışan seçin.
                                    </Typography>
                                </Box>
                            </Paper>
                        )}
                    </Grid>
                </Grid>

                {/* Exercise Detail Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    {selectedExercise && (
                        <>
                            <DialogTitle>
                                <Box display="flex" alignItems="center">
                                    <FitnessCenterIcon sx={{ mr: 1 }} />
                                    {selectedExercise.name}
                                </Box>
                            </DialogTitle>
                            <DialogContent dividers>
                                <Box mb={2}>
                                    <img
                                        src={selectedExercise.image}
                                        alt={selectedExercise.name}
                                        style={{ width: '100%', borderRadius: '8px' }}
                                    />
                                </Box>
                                <Typography variant="subtitle1" gutterBottom>
                                    Detaylar
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            <strong>Kategori:</strong> {selectedExercise.category}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            <strong>Süre:</strong> {selectedExercise.duration}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            <strong>Kalori:</strong> {selectedExercise.calories} kcal
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Typography variant="subtitle1" mt={3} mb={1}>
                                    Açıklama
                                </Typography>
                                <Typography variant="body2">
                                    {selectedExercise.description}
                                </Typography>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseDialog}>Kapat</Button>
                                {selectedClient && !selectedClient.exercises.includes(selectedExercise.id) && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<AddIcon />}
                                        onClick={() => {
                                            const updatedClients = clients.map(client => {
                                                if (client.id === selectedClient.id) {
                                                    return {
                                                        ...client,
                                                        exercises: [...client.exercises, selectedExercise.id]
                                                    };
                                                }
                                                return client;
                                            });

                                            setClients(updatedClients);
                                            setSelectedClient({...selectedClient, exercises: [...selectedClient.exercises, selectedExercise.id]});
                                            handleCloseDialog();
                                        }}
                                    >
                                        Danışana Ata
                                    </Button>
                                )}
                            </DialogActions>
                        </>
                    )}
                </Dialog>
            </div>
        </Default>
    );
}