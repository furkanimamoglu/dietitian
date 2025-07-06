import React, {useEffect, useMemo, useState} from 'react';
import './Danisan.css';
import Default from "../../Components/Layouts/Default.jsx";
import axios from "axios";
import config from "../../config.js";
import {useNavigate, useParams} from "react-router-dom";
import NutritionPlanAssignModal from "./NutritionPlanAssignModal.jsx";

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    MenuItem,
    Paper,
    Skeleton,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";

import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {tr} from "date-fns/locale";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ErrorIcon from "@mui/icons-material/Error";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import Person from '@mui/icons-material/Person';
import Email from '@mui/icons-material/Email';
import Phone from '@mui/icons-material/Phone';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Cake from '@mui/icons-material/Cake';

import {showErrorToast, showSuccessToast} from '../../utils/toastUtil';
import RestaurantIcon from "@mui/icons-material/Restaurant";

const initialWaterTrackingData = {
    dailyGoal: 2500,
    weeklyData: [
        {day: 'Pazartesi', consumed: 0, completed: false},
        {day: 'Salı', consumed: 0, completed: false},
        {day: 'Çarşamba', consumed: 0, completed: false},
        {day: 'Perşembe', consumed: 0, completed: false},
        {day: 'Cuma', consumed: 0, completed: false},
        {day: 'Cumartesi', consumed: 0, completed: false},
        {day: 'Pazar', consumed: 0, completed: false},
    ]
};

const WaterTrackingCard = ({data, clientId}) => {
    const [waterData, setWaterData] = useState(data);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);

    const [isEditGoalDialogOpen, setIsEditGoalDialogOpen] = useState(false);
    const [newDailyGoal, setNewDailyGoal] = useState(data.dailyGoal || 2500);
    const [updateGoalLoading, setUpdateGoalLoading] = useState(false);

    const currentDay = new Date().getDay();
    const mappedDay = currentDay === 0 ? 6 : currentDay - 1;

    const handleOpenEditGoalDialog = () => {
        setNewDailyGoal(waterData.dailyGoal);
        setIsEditGoalDialogOpen(true);
    };

    const handleCloseEditGoalDialog = () => {
        setIsEditGoalDialog(false);
    };

    const handleUpdateDailyGoal = async () => {
        if (!newDailyGoal || newDailyGoal < 100) {
            showErrorToast("Lütfen geçerli bir hedef giriniz (en az 100 ml).");
            return;
        }

        setUpdateGoalLoading(true);
        try {
            await axios.put(
                `${config[config.environment].apiUrl}/nutrition/updateClientWaterGoal`,
                {
                    client_id: clientId,
                    daily_goal: newDailyGoal
                },
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }
            );

            setWaterData(prevData => ({
                ...prevData,
                dailyGoal: newDailyGoal
            }));

            setIsEditGoalDialogOpen(false);
            showSuccessToast("Günlük su hedefi başarıyla güncellendi.");
        } catch (err) {
            console.error("Hedef güncellenirken hata:", err);
            showErrorToast("Günlük su hedefi güncellenirken bir hata oluştu.");
        } finally {
            setUpdateGoalLoading(false);
        }
    };

    useEffect(() => {
        const fetchWaterData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const today = new Date();
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - 6);

                const formatDate = (date) => {
                    return date.toISOString().split('T')[0];
                };

                const response = await axios.get(
                    `${config[config.environment].apiUrl}/nutrition/getClientWater`,
                    {
                        headers: {
                            Authorization: localStorage.getItem('token'),
                        },
                        params: {
                            client_id: clientId,
                            start_date: formatDate(weekStart),
                            end_date: formatDate(today)
                        }
                    }
                );

                setApiResponse(response.data);

                if (response.data) {
                    const processedData = processWaterData(response.data);
                    setWaterData(prevData => ({
                        ...prevData,
                        weeklyData: processedData
                    }));
                }
            } catch (err) {
                console.error("Error fetching water data:", err);
                setError("Su tüketim verileri yüklenirken bir hata oluştu.");
            } finally {
                setIsLoading(false);
            }
        };

        const processWaterData = (apiData) => {
            const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
            const dailyGoal = data.dailyGoal;

            const processedData = dayNames.map(day => ({
                day,
                consumed: 0,
                completed: false
            }));

            if (Array.isArray(apiData)) {
                const groupedByDate = {};

                apiData.forEach(item => {
                    if (item.date) {
                        if (!groupedByDate[item.date]) {
                            groupedByDate[item.date] = 0;
                        }
                        const amount = item.amount || item.consumed || item.amount_ml || 0;
                        groupedByDate[item.date] += parseInt(amount, 10);
                    }
                });

                Object.entries(groupedByDate).forEach(([dateStr, totalAmount]) => {
                    const date = new Date(dateStr);
                    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;

                    if (dayIndex >= 0 && dayIndex < 7) {
                        processedData[dayIndex].consumed = totalAmount;
                        processedData[dayIndex].completed = totalAmount >= dailyGoal;
                    }
                });
            } else if (apiData && typeof apiData === 'object') {
                Object.entries(apiData).forEach(([dateKey, value]) => {
                    try {
                        const date = new Date(dateKey);
                        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;

                        if (dayIndex >= 0 && dayIndex < 7) {
                            let amount = 0;
                            if (typeof value === 'number') {
                                amount = value;
                            } else if (typeof value === 'object') {
                                amount = value.amount || value.consumed || value.amount_ml || 0;
                            }

                            processedData[dayIndex].consumed = parseInt(amount, 10);
                            processedData[dayIndex].completed = parseInt(amount, 10) >= dailyGoal;
                        }
                    } catch (err) {
                        console.error("Error processing date:", dateKey, err);
                    }
                });
            }

            return processedData;
        };

        if (clientId) {
            fetchWaterData();
        }
    }, [clientId, data.dailyGoal]);

    const totalConsumed = waterData.weeklyData.reduce((sum, day) => sum + day.consumed, 0);
    const totalGoal = waterData.dailyGoal * 7;
    const weeklyCompletionPercentage = Math.min(Math.round((totalConsumed / totalGoal) * 100), 100);

    if (isLoading) {
        return (
            <Card elevation={3} sx={{mb: 3}}>
                <CardHeader
                    title="Su Takibi"
                    titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
                    avatar={
                        <Avatar sx={{bgcolor: 'info.main'}}>
                            <WaterDropIcon/>
                        </Avatar>
                    }
                    sx={{
                        bgcolor: 'info.light',
                        color: 'info.contrastText',
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                    }}
                />
                <CardContent>
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4}}>
                        <CircularProgress/>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card elevation={3} sx={{mb: 3}}>
                <CardHeader
                    title="Su Takibi"
                    titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
                    avatar={
                        <Avatar sx={{bgcolor: 'error.main'}}>
                            <ErrorIcon/>
                        </Avatar>
                    }
                    sx={{
                        bgcolor: 'error.light',
                        color: 'error.contrastText',
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                    }}
                />
                <CardContent>
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2}}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card elevation={3} sx={{mb: 3}}>
            <CardHeader
                title="Su Takibi"
                titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
                avatar={
                    <Avatar sx={{bgcolor: 'info.main'}}>
                        <WaterDropIcon/>
                    </Avatar>
                }
                sx={{
                    bgcolor: 'info.light',
                    color: 'info.contrastText',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            />
            <CardContent>
                <Box sx={{mb: 3}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Haftalık Su Tüketimi
                        </Typography>
                        <Typography variant="subtitle1" color="info.main" fontWeight="bold">
                            {weeklyCompletionPercentage}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={weeklyCompletionPercentage}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: 'info.lighter',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: 'info.main',
                                borderRadius: 5
                            }
                        }}
                    />
                    <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 0.5}}>
                        <Typography variant="caption" color="text.secondary">
                            {totalConsumed} ml
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Hedef: {totalGoal} ml
                        </Typography>
                    </Box>
                </Box>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Günlük Takip
                </Typography>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                    flexWrap: {xs: 'wrap', sm: 'nowrap'},
                    gap: 1
                }}>
                    {waterData.weeklyData.map((day, index) => (
                        <Tooltip key={index} title={`${day.day}: ${day.consumed} ml / ${waterData.dailyGoal} ml`}>
                            <Box
                                sx={{
                                    flex: '1 1 auto',
                                    minWidth: {xs: '30%', sm: 'auto'},
                                    mb: {xs: 2, sm: 0},
                                    p: 1,
                                    bgcolor: index === mappedDay ? 'rgba(41, 182, 246, 0.08)' : 'transparent',
                                    borderRadius: 2,
                                    boxShadow: index === mappedDay ? '0 2px 8px rgba(41, 182, 246, 0.15)' : 'none',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                    }
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: index === mappedDay ? 'bold' : 'normal',
                                        color: index === mappedDay ? 'info.main' : 'text.secondary',
                                        mb: 0.5
                                    }}
                                >
                                    {day.day.substring(0, 3)}
                                </Typography>

                                {/* Su şişesi görünümü */}
                                <Box sx={{
                                    position: 'relative',
                                    width: 30,
                                    height: 60,
                                    mb: 1,
                                    borderRadius: '4px 4px 12px 12px',
                                    border: '2px solid',
                                    borderColor: day.completed ? 'info.main' : 'grey.300',
                                    overflow: 'hidden',
                                    boxShadow: day.completed ? '0 2px 8px rgba(41, 182, 246, 0.2)' : 'none'
                                }}>
                                    {/* Su seviyesi */}
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: `${Math.min(Math.round((day.consumed / waterData.dailyGoal) * 100), 100)}%`,
                                        bgcolor: day.completed ? 'info.main' : 'info.light',
                                        transition: 'height 0.5s ease'
                                    }}/>

                                    {/* Su dalgası efekti */}
                                    {day.consumed > 0 && (
                                        <Box sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: '4px',
                                            bgcolor: 'rgba(255, 255, 255, 0.5)',
                                            borderRadius: '50%',
                                            transform: 'scale(1.5)',
                                            opacity: 0.7
                                        }}/>
                                    )}
                                </Box>

                                {/* Tamamlanma işareti */}
                                {day.completed && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 18,
                                        right: 8,
                                        bgcolor: 'success.main',
                                        color: 'white',
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <CheckCircleIcon sx={{fontSize: 12}}/>
                                    </Box>
                                )}

                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: day.completed ? 'success.main' : (
                                            day.consumed > 0 ? 'info.main' : 'text.secondary'
                                        )
                                    }}
                                >
                                    {day.consumed} ml
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {Math.round((day.consumed / waterData.dailyGoal) * 100)}%
                                </Typography>
                            </Box>
                        </Tooltip>
                    ))}
                </Box>

                <Box sx={{p: 2, bgcolor: 'info.lighter', borderRadius: 2, mt: 2}}>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                        <LocalDrinkIcon sx={{color: 'info.main', mr: 1}}/>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Günlük Su İhtiyacı
                        </Typography>
                        <Tooltip title="Günlük hedefi düzenle" arrow>
                            <IconButton
                                size="small"
                                sx={{
                                    bgcolor: 'info.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'info.dark',
                                    },
                                    width: 30,
                                    height: 30,
                                    ml: 1,
                                }}
                                onClick={handleOpenEditGoalDialog}
                            >
                                <EditIcon fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Typography variant="body2" sx={{mb: 1}}>
                        Günlük hedef: <strong>{waterData.dailyGoal} ml</strong> ({waterData.dailyGoal / 1000} litre)
                    </Typography>
                    <Typography variant="body2">
                        Bugün
                        tüketilen: <strong>{waterData.weeklyData[mappedDay].consumed} ml</strong> ({Math.round((waterData.weeklyData[mappedDay].consumed / waterData.dailyGoal) * 100)}%)
                    </Typography>
                </Box>
            </CardContent>
            <Dialog
                open={isEditGoalDialogOpen}
                onClose={handleCloseEditGoalDialog}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    Günlük Su Hedefini Düzenle
                </DialogTitle>
                <DialogContent>
                    <Box sx={{my: 2}}>
                        <TextField
                            fullWidth
                            label="Günlük Su Hedefi (ml)"
                            value={newDailyGoal}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setNewDailyGoal(parseInt(value, 10) || 0);
                            }}
                            InputProps={{
                                inputMode: 'numeric',
                                endAdornment: <InputAdornment position="end">ml</InputAdornment>,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocalDrinkIcon color="primary"/>
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{
                                min: 100,
                                step: 100,
                                pattern: '[0-9]*'
                            }}
                            error={newDailyGoal < 100}
                            helperText={newDailyGoal < 100 ? "Minimum 100 ml olmalıdır" : ""}
                        />
                        <Box sx={{mt: 2, display: 'flex', alignItems: 'center'}}>
                            <Typography variant="body2" color="text.secondary" sx={{mr: 1}}>
                                ≈ <strong>{(newDailyGoal / 1000).toFixed(1)}</strong> litre
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(newDailyGoal / 50, 100)}
                                sx={{flexGrow: 1, height: 8, borderRadius: 4}}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditGoalDialog}>
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateDailyGoal}
                        disabled={updateGoalLoading}
                    >
                        {updateGoalLoading ? <CircularProgress size={24}/> : "Kaydet"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

function Danisan() {
    const navigate = useNavigate();
    const {id} = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [danisan, setDanisan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('anamnez');
    const [nutritionPlan, setNutritionPlan] = useState(null);
    const [nutritionPlanLoading, setNutritionPlanLoading] = useState(false);
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
    const [clientInvoices, setClientInvoices] = useState([]);
    const [clientInvoicesLoading, setClientInvoicesLoading] = useState(false);
    const [currentInvoicePage, setCurrentInvoicePage] = useState(1);
    const invoicesPerPage = 4;

    const [waterTrackingData, setWaterTrackingData] = useState(initialWaterTrackingData);

    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);

    const [isAssignNutritionPlanDialogOpen, setIsAssignNutritionPlanDialogOpen] = useState(false);

    const [anamnezData, setAnamnezData] = useState(null);
    const [anamnezLoading, setAnamnezLoading] = useState(false);

    const [assignedExercises, setAssignedExercises] = useState([]);
    const [assignedExercisesLoading, setAssignedExercisesLoading] = useState(false);
    const [assignForm, setAssignForm] = useState({
        exercise_id: '',
        start_date: '',
        end_date: '',
        note: ''
    });
    const [assignLoading, setAssignLoading] = useState(false);
    const [isAssignExerciseDialogOpen, setIsAssignExerciseDialogOpen] = useState(false);
    const [activeExercise, setActiveExercise] = useState(null);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [availableExercisesLoading, setAvailableExercisesLoading] = useState(false);

    const [exerciseHistory, setExerciseHistory] = useState([]);
    const [loadingExerciseHistory, setLoadingExerciseHistory] = useState(false);
    const [historyStartDate, setHistoryStartDate] = useState('');
    const [historyEndDate, setHistoryEndDate] = useState('');

    const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);
    const [appointmentForm, setAppointmentForm] = useState({title: '', start: '', end: ''});

    const [measurements, setMeasurements] = useState([]);
    const [measurementsLoading, setMeasurementsLoading] = useState(false);

    const [isDeleteMeasurementDialogOpen, setIsDeleteMeasurementDialogOpen] = useState(false);
    const [measurementToDelete, setMeasurementToDelete] = useState(null);

    const handleCloseDeleteMeasurementDialog = () => {
        setIsDeleteMeasurementDialogOpen(false);
    };

    const handleOpenDeleteMeasurementDialog = (measurement) => {
        setMeasurementToDelete(measurement);
        setIsDeleteMeasurementDialogOpen(true);
    };

    const [bloodTestFiles, setBloodTestFiles] = useState([]);

    const handleViewBloodTestFile = (file) => {
        setSelectedFile(file);
    };

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState(null);

    const handleDeleteAppointmentConfirmation = (appointment) => {
        setAppointmentToDelete(appointment);
        setDeleteConfirmDialogOpen(true);
    };

    const handleDeleteAppointment = async () => {
        if (!appointmentToDelete) return;

        try {
            await axios.delete(
                `${config[config.environment].apiUrl}/appointment/deleteAppointmentAsDietitian`,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                    params: {
                        appointment_id: appointmentToDelete.id
                    }
                }
            );

            setAppointments(prevAppointments =>
                prevAppointments.filter(appointment => appointment.id !== appointmentToDelete.id)
            );

            setDeleteConfirmDialogOpen(false);

            showSuccessToast("Randevu başarıyla silindi.");
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Randevu silinirken bir hata oluştu.");
            setShowErrorPopup(true);
        } finally {
            setAppointmentToDelete(null);
        }
    };

    const handleBloodTestFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setErrorMessage("Lütfen sadece PDF dosyaları yükleyin.");
            setShowErrorPopup(true);
            return;
        }

        const newFile = {
            file: file,
            fileName: file.name,
            fileSize: file.size,
            uploadDate: new Date().toISOString(),
            fileUrl: URL.createObjectURL(file)
        };

        setBloodTestFiles(prevFiles => [newFile, ...prevFiles]);
        showSuccessToast("Kan tahlili dosyası başarıyla yüklendi.");

    };

    const handleDeleteBloodTestFile = (index) => {
        const updatedFiles = [...bloodTestFiles];
        if (updatedFiles[index].fileUrl) {
            URL.revokeObjectURL(updatedFiles[index].fileUrl);
        }

        const fileToDelete = updatedFiles[index];
        updatedFiles.splice(index, 1);

        setBloodTestFiles(updatedFiles);


        showSuccessToast("Kan tahlili dosyası başarıyla silindi.");
    };

    const [isAnamnezDialogOpen, setIsAnamnezDialogOpen] = useState(false);
    const [anamnezForm, setAnamnezForm] = useState({
        saglik_bilgileri: {
            kronik_hastaliklar: "",
            alerjiler: "",
            ilac_kullanimi: "",
            gecmis_ameliyatlar: "",
            aile_saglik_gecmisi: "",
            uyku: ""
        },
        diyet_aliskanliklari: {
            gunluk_su_tuketimi: "",
            ogun_duzeni: "",
            favori_yiyecekler: "",
            sevilmeyen_yiyecekler: "",
            atistirmalik_aliskanliklari: "",
            disarida_yemek: ""
        },
        fiziksel_aktivite: {
            aktivite_seviyesi: "",
            egzersiz_aliskanliklari: "",
            sevdigi_sporlar: "",
            meslek_ve_aktivite_durumu: ""
        },
        ozel_notlar: ""
    });

    const handleOpenAnamnezDialog = () => {
        if (anamnezData) {
            setAnamnezForm(anamnezData);
        }
        setIsAnamnezDialogOpen(true);
    };

    const handleAnamnezFormChange = (e) => {
        const {name, value} = e.target;
        setAnamnezForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleNestedAnamnezFormChange = (category, field, value) => {
        setAnamnezForm(prevForm => ({
            ...prevForm,
            [category]: {
                ...prevForm[category],
                [field]: value
            }
        }));
    };

    const fetchAnamnezData = async () => {
        try {
            setAnamnezLoading(true);
            const response = await axios.get(
                `${config[config.environment].apiUrl}/anamnes/getAnamnes`,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                    params: {
                        client_id: id
                    }
                }
            );
            setAnamnezData(response.data);
        } catch (error) {
            console.error("Anamnez verileri yüklenirken hata oluştu:", error);
            setErrorMessage("Anamnez verileri yüklenirken bir hata oluştu.");
            setShowErrorPopup(true);
        } finally {
            setAnamnezLoading(false);
        }
    };

    const handleSaveAnamnez = async () => {
        try {
            const response = await axios.put(
                `${config[config.environment].apiUrl}/anamnes/updateAnamnes?client_id=${id}`,
                {
                    ...anamnezForm
                },
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }
            );

            fetchAnamnezData();
            setIsAnamnezDialogOpen(false);

            showSuccessToast("Anamnez bilgileri başarıyla kaydedildi.");
        } catch (error) {
            console.error("Anamnez kaydedilirken hata oluştu:", error);
            setErrorMessage(error.response?.data?.message || "Anamnez kaydedilirken bir hata oluştu.");
            setShowErrorPopup(true);
        }
    };

    useEffect(() => {
        if (activeTab === 'anamnez' && id) {
            fetchAnamnezData();
        }
    }, [activeTab, id]);

    useEffect(() => {
        // Burada API'den kan tahlili verilerini çekebilirsiniz
        // Örnek: 
        // const fetchBloodTests = async () => {
        //     try {
        //         const response = await axios.get(`${config[config.environment].apiUrl}/bloodtests/${id}`, {
        //             headers: { Authorization: localStorage.getItem('token') }
        //         });
        //         setBloodTestFiles(response.data);
        //     } catch (error) {
        //         console.error("Kan tahlili dosyaları yüklenirken hata oluştu:", error);
        //     }
        // };
        // fetchBloodTests();
    }, [id]);

    useEffect(() => {
        let timer;
        if (showSuccessPopup) {
            timer = setTimeout(() => {
                setShowSuccessPopup(false);
            }, 3000);
        } else if (showErrorPopup) {
            timer = setTimeout(() => {
                setShowErrorPopup(false);
            }, 5000);
        }
        return () => timer && clearTimeout(timer);
    }, [showSuccessPopup, showErrorPopup]);

    const [measurementForm, setMeasurementForm] = useState({
        boy: '',
        kilo: '',
        bel: '',
        kalca: '',
        gogus: '',
        digerbel: '',
        kol: '',
        bacak: '',
        yag: '',
        kas: '',
        su: ''
    });
    const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);
    const [createMeasurementLoading, setCreateMeasurementLoading] = useState(false);

    const handleMeasurementFormChange = (e) => {
        const {name, value} = e.target;
        setMeasurementForm(prev => ({...prev, [name]: value}));
    };

    const handleOpenMeasurementDialog = () => {
        setIsMeasurementDialogOpen(true);
    };

    const handleCloseMeasurementDialog = () => {
        setIsMeasurementDialogOpen(false);
        setMeasurementForm({
            boy: '',
            kilo: '',
            bel: '',
            kalca: '',
            gogus: '',
            diger: '',
            kol: '',
            bacak: '',
            yag: '',
            kas: '',
            su: ''
        });
    };

    const deleteMeasurement = async (measurement) => {
        try {
            await axios.delete(
                `${config[config.environment].apiUrl}/measurement/deleteMeasurement`,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                    params: {
                        measurement_id: measurement.id
                    }
                }
            );

            handleCloseDeleteMeasurementDialog();

            setMeasurementsLoading(true);
            const response = await axios.get(
                `${config[config.environment].apiUrl}/measurement/getClientMeasurement`,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                    params: {
                        client_id: id,
                    },
                }
            );
            setMeasurements(response.data);
            setMeasurementsLoading(false);

            showSuccessToast("Ölçüm başarıyla silindi.");
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Ölçüm silinirken bir hata oluştu.");
            setShowErrorPopup(true);
        }
    }

    const handleCreateMeasurement = async (e) => {
        e.preventDefault();
        setCreateMeasurementLoading(true);

        try {
            await axios.post(
                config[config.environment].apiUrl + "/measurement/createMeasurement",
                {
                    client_id: id,
                    ...measurementForm
                },
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }
            );

            handleCloseMeasurementDialog();

            setMeasurementsLoading(true);
            const response = await axios.get(
                config[config.environment].apiUrl + "/measurement/getClientMeasurement",
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                    params: {
                        client_id: id,
                    },
                }
            );
            setMeasurements(response.data);
            setMeasurementsLoading(false);

            showSuccessToast("Yeni ölçüm başarıyla eklendi.");
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Ölçüm eklenirken bir hata oluştu.");
            setShowErrorPopup(true);
        } finally {
            setCreateMeasurementLoading(false);
        }
    };

    const [isEditMeasurementDialogOpen, setIsEditMeasurementDialogOpen] = useState(false);
    const [editMeasurementForm, setEditMeasurementForm] = useState({
        boy: '',
        kilo: '',
        bel: '',
        digerbel: '',
        kalca: '',
        gogus: '',
        kol: '',
        bacak: '',
        yag: '',
        kas: '',
        su: ''
    });
    const [selectedMeasurementId, setSelectedMeasurementId] = useState(null);
    const [updateMeasurementLoading, setUpdateMeasurementLoading] = useState(false);

    const [clientNote, setClientNote] = useState("");

    useEffect(() => {
        if (danisan && typeof danisan.dietitianNotes === "string") {
            setClientNote(danisan.dietitianNotes);
        }
    }, [danisan]);

    const handleSaveClientNote = async (danisanId, note) => {
        try {
            await axios.put(
                `${config[config.environment].apiUrl}/dietitian/updateClientNote`,
                {note},
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                    params: {
                        client_id: danisanId
                    }
                }
            );
            showSuccessToast("Not başarıyla kaydedildi.");
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Not kaydedilirken bir hata oluştu.");
            setShowErrorPopup(true);
        }
    }

    const handleEditMeasurementFormChange = (e) => {
        const {name, value} = e.target;
        setEditMeasurementForm(prev => ({...prev, [name]: value}));
    };

    const handleOpenEditMeasurementDialog = (measurement) => {
        setSelectedMeasurementId(measurement.id);
        setEditMeasurementForm({
            boy: measurement.boy || '',
            kilo: measurement.kilo || '',
            bel: measurement.bel || '',
            digerbel: measurement.digerbel || '',
            kalca: measurement.kalca || '',
            gogus: measurement.gogus || '',
            kol: measurement.kol || '',
            bacak: measurement.bacak || '',
            yag: measurement.yag || '',
            kas: measurement.kas || '',
            su: measurement.su || ''
        });
        setIsEditMeasurementDialogOpen(true);
    };

    const handleCloseEditMeasurementDialog = () => {
        setIsEditMeasurementDialogOpen(false);
        setSelectedMeasurementId(null);
    };

    const handleUpdateMeasurement = async (e) => {
        e.preventDefault();

        const yag = parseFloat(editMeasurementForm.yag) || 0;
        const kas = parseFloat(editMeasurementForm.kas) || 0;
        const su = parseFloat(editMeasurementForm.su) || 0;
        const toplam = yag + kas + su;

        if (yag > 100 || kas > 100 || su > 100 || toplam > 100) {
            setErrorMessage("Yağ, kas ve su yüzdelerinin toplamı %100'ü geçemez.");
            setShowErrorPopup(true);
            return;
        }

        setUpdateMeasurementLoading(true);

        try {
            await axios.put(
                config[config.environment].apiUrl + "/measurement/updateMeasurement",
                {
                    measurement_id: selectedMeasurementId,
                    client_id: id,
                    ...editMeasurementForm
                },
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }
            );

            handleCloseEditMeasurementDialog();

            setMeasurementsLoading(true);
            const response = await axios.get(
                config[config.environment].apiUrl + "/measurement/getClientMeasurement",
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                    params: {
                        client_id: id,
                    },
                }
            );
            setMeasurements(response.data);
            setMeasurementsLoading(false);

            showSuccessToast("Ölçüm başarıyla güncellendi.");
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Ölçüm güncellenirken bir hata oluştu.");
            setShowErrorPopup(true);
        } finally {
            setUpdateMeasurementLoading(false);
        }
    };

    const findCurrentPlan = (plans) => {
        if (!plans || plans.length === 0) return 0;

        const today = new Date();

        for (let i = 0; i < plans.length; i++) {
            const plan = plans[i];
            if (plan.start_date && plan.end_date) {
                const startDate = new Date(plan.start_date);
                const endDate = new Date(plan.end_date);

                if (today >= startDate && today <= endDate) {
                    return i;
                }
            }
        }

        let mostRecentPlanIndex = 0;
        let mostRecentDate = null;

        for (let i = 0; i < plans.length; i++) {
            const plan = plans[i];
            if (plan.start_date) {
                const startDate = new Date(plan.start_date);

                if (!mostRecentDate || startDate > mostRecentDate) {
                    mostRecentDate = startDate;
                    mostRecentPlanIndex = i;
                }
            }
        }

        return mostRecentPlanIndex;
    };

    const isActivePlan = (plan) => {
        if (!plan.start_date || !plan.end_date) return false;

        const today = new Date();
        const startDate = new Date(plan.start_date);
        const endDate = new Date(plan.end_date);

        return today >= startDate && today <= endDate;
    };

    const isActiveExercise = (exercise) => {
        if (!exercise.start_date || !exercise.end_date) return false;

        const today = new Date();
        const startDate = new Date(exercise.start_date);
        const endDate = new Date(exercise.end_date);

        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        return today >= startDate && today <= endDate;
    };

    const calculateBMI = useMemo(() => {
        if (!measurements || measurements.length === 0) return null;

        const height = measurements[0].boy || danisan?.boy;
        const weight = measurements[0].kilo;

        if (!height || !weight) return null;

        const heightInM = height / 100;
        const bmi = (weight / (heightInM * heightInM)).toFixed(1);

        let category = '';
        let color = '';

        if (bmi < 18.5) {
            category = 'Zayıf';
            color = 'info.main';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal Kilo';
            color = 'success.main';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Fazla Kilolu';
            color = 'warning.main';
        } else if (bmi >= 30 && bmi < 35) {
            category = 'Hafif Obez';
            color = 'orange';
        } else {
            category = 'Obez';
            color = 'error.main';
        }

        return {value: bmi, category, color};
    }, [measurements, danisan]);

    useEffect(() => {
        if (danisan && danisan.dailyWaterIntake) {
            setWaterTrackingData(prevData => ({
                ...prevData,
                dailyGoal: danisan.dailyWaterIntake
            }));
        }
    }, [danisan]);

    useEffect(() => {
        const fetchDanisanInfo = async () => {
            try {
                const response = await axios.get(
                    config[config.environment].apiUrl + "/dietitian/getMyClient",
                    {
                        headers: {
                            Authorization: localStorage.getItem('token'),
                        },
                        params: {
                            client_id: id,
                        },
                    }
                );

                if (!response.data || Object.keys(response.data).length === 0) {
                    throw new Error("Danışan bilgisi bulunamadı");
                }

                setDanisan(response.data);
            } catch (err) {
                console.error("Hata:", err.message);
                navigate('/404');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDanisanInfo();
    }, [id, navigate]);

    useEffect(() => {
        if (!isLoading && danisan === null) {
            navigate('/404');
        }
    }, [isLoading, danisan, navigate]);

    useEffect(() => {
        const fetchNutritionPlan = async () => {
            if (activeTab === 'beslenme' && id) {
                setNutritionPlanLoading(true);
                try {
                    const response = await axios.post(
                        config[config.environment].apiUrl + "/nutrition/getNutritionAssignmentPlanByClient",
                        {
                            client_id: id,
                            range: "all"
                        },
                        {
                            headers: {
                                Authorization: localStorage.getItem('token'),
                            }
                        }
                    );

                    setNutritionPlan(response.data);

                    if (response.data && response.data.length > 0) {
                        const currentPlanIndex = findCurrentPlan(response.data);
                        setSelectedPlanIndex(currentPlanIndex);
                    }
                } catch (err) {
                    console.error("Beslenme planı yüklenirken hata:", err.message);
                } finally {
                    setNutritionPlanLoading(false);
                }
            }
        };

        fetchNutritionPlan();
    }, [activeTab, id]);

    useEffect(() => {
        const fetchClientInvoices = async () => {
            if (activeTab === 'odeme' && id) {
                setClientInvoicesLoading(true);
                try {
                    const response = await axios.get(
                        config[config.environment].apiUrl + "/invoice/getClientInvoices",
                        {
                            headers: {
                                Authorization: localStorage.getItem('token'),
                            },
                            params: {
                                client_id: id,
                            },
                        }
                    );
                    setClientInvoices(response.data);
                } catch (err) {
                    console.error("Ödemeler yüklenirken hata:", err.message);
                    setClientInvoices([]);
                } finally {
                    setClientInvoicesLoading(false);
                }
            }
        };
        fetchClientInvoices();
    }, [activeTab, id]);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (activeTab === 'randevu' && id) {
                setAppointmentsLoading(true);
                try {
                    const response = await axios.get(
                        config[config.environment].apiUrl + "/appointment/fetchClientAppointmentAsDietitian",
                        {
                            headers: {
                                Authorization: localStorage.getItem('token'),
                            },
                            params: {
                                client_id: id,
                            },
                        }
                    );
                    setAppointments(response.data);
                } catch (err) {
                    console.error("Randevular yüklenirken hata:", err.message);
                    setAppointments([]);
                } finally {
                    setAppointmentsLoading(false);
                }
            }
        };
        fetchAppointments();
    }, [activeTab, id]);

    useEffect(() => {
        const fetchAssignedExercises = async () => {
            if (activeTab === 'egzersiz' && id) {
                setAssignedExercisesLoading(true);
                try {
                    const response = await axios.get(
                        config[config.environment].apiUrl + "/exercise/getAssignedExercisesByClient",
                        {
                            headers: {
                                Authorization: localStorage.getItem('token'),
                            },
                            params: {
                                client_id: id,
                            },
                        }
                    );
                    setAssignedExercises(response.data);

                    const currentActiveExercise = response.data.find(isActiveExercise);
                    setActiveExercise(currentActiveExercise || null);

                } catch (err) {
                    console.error("Egzersizler yüklenirken hata:", err.message);
                    setAssignedExercises([]);
                    setActiveExercise(null);
                } finally {
                    setAssignedExercisesLoading(false);
                }
            }
        };
        fetchAssignedExercises();
    }, [activeTab, id]);

    useEffect(() => {
        const fetchAvailableExercises = async () => {
            if (isAssignExerciseDialogOpen) {
                setAvailableExercisesLoading(true);
                try {
                    const response = await axios.get(
                        config[config.environment].apiUrl + "/exercise/getMyExercises",
                        {
                            headers: {
                                Authorization: localStorage.getItem('token'),
                            }
                        }
                    );
                    setAvailableExercises(response.data);
                } catch (err) {
                    console.error("Egzersizler yüklenirken hata:", err.message);
                    setAvailableExercises([]);
                } finally {
                    setAvailableExercisesLoading(false);
                }
            }
        };

        fetchAvailableExercises();
    }, [isAssignExerciseDialogOpen]);

    useEffect(() => {
        const fetchMeasurements = async () => {
            if (activeTab === 'olcum' && id) {
                setMeasurementsLoading(true);
                try {
                    const response = await axios.get(
                        config[config.environment].apiUrl + "/measurement/getClientMeasurement",
                        {
                            headers: {
                                Authorization: localStorage.getItem('token'),
                            },
                            params: {
                                client_id: id,
                            },
                        }
                    );
                    setMeasurements(response.data);
                } catch (err) {
                    setMeasurements([]);
                } finally {
                    setMeasurementsLoading(false);
                }
            }
        };
        fetchMeasurements();
    }, [activeTab, id]);

    useEffect(() => {
        if (activeTab === 'egzersiz' && id && !historyStartDate && !historyEndDate) {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 30);

            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);

            setHistoryStartDate(formattedStartDate);
            setHistoryEndDate(formattedEndDate);

            fetchExerciseHistory(formattedStartDate, formattedEndDate);
        }
    }, [activeTab, id, historyStartDate, historyEndDate]);

    const [selectedImage, setSelectedImage] = useState(null);
    const [imageModalOpen, setImageModalOpen] = useState(false);

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setImageModalOpen(true);
    };

    const handleCloseImageModal = () => {
        setImageModalOpen(false);
    };

    if (isLoading) {
        return (
            <Default>
                <Box sx={{p: 3, display: 'flex', flexDirection: 'column', gap: 2}}>
                    <Skeleton variant="rectangular" height={200}/>
                    <Skeleton variant="text" height={50} width="40%"/>
                    <Skeleton variant="text" height={30} width="60%"/>
                    <Skeleton variant="text" height={30} width="70%"/>
                </Box>
            </Default>
        );
    }

    if (!danisan) {
        return null;
    }

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const getTextColorByAddedBy = (addedBy, isEaten) => {
        if (isEaten) {
            switch (addedBy) {
                case 'dietitian':
                    return 'primary.light';
                case 'client':
                    return 'warning.light';
                case 'system':
                default:
                    return 'text.secondary';
            }
        }

        switch (addedBy) {
            case 'dietitian':
                return 'primary.main';
            case 'client':
                return 'warning.main';
            case 'system':
                return 'text.primary';
            default:
                return 'text.primary';
        }
    };

    const renderMealItems = (mealItems) => {
        if (!mealItems) return null;

        if (mealItems.info || Object.keys(mealItems).some(key => key.includes('Alternatif'))) {
            const info = mealItems.info || {};
            const alternativeKeys = Object.keys(mealItems).filter(key => key !== 'info');

            return (
                <Box>
                    {/* Görsel varsa göster */}
                    {info.image && info.image !== "" && (
                        <Box sx={{mb: 1}}>
                            <Box
                                component="img"
                                src={info.image}
                                alt="Yemek görseli"
                                sx={{
                                    width: '100%',
                                    height: 60,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    mb: 0.5,
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleImageClick(info.image)}
                            />
                        </Box>
                    )}

                    {/* Alternatifler */}
                    {alternativeKeys.map((altKey, altIndex) => {
                        const items = mealItems[altKey];
                        if (!Array.isArray(items) || items.length === 0) return null;

                        return (
                            <Box key={`alt-${altIndex}`} sx={{mb: altIndex < alternativeKeys.length - 1 ? 1 : 0}}>
                                {alternativeKeys.length > 1 && (
                                    <Typography variant="caption"
                                                sx={{fontWeight: 'bold', display: 'block', color: 'text.secondary'}}>
                                        {altKey}:
                                    </Typography>
                                )}

                                {items.map((item, itemIndex) => (
                                    <Typography
                                        key={`item-${itemIndex}`}
                                        variant="body2"
                                        sx={{
                                            textDecoration: item.eaten ? 'line-through' : 'none',
                                            color: getTextColorByAddedBy(item.addedBy, item.eaten),
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {item.eaten ? (
                                            <CheckCircleIcon sx={{fontSize: 14, mr: 0.5, color: 'success.main'}}/>
                                        ) : (
                                            <RadioButtonUncheckedIcon
                                                sx={{fontSize: 14, mr: 0.5, color: 'text.secondary'}}/>
                                        )}
                                        {item.name}
                                        {item.portion && ` (${item.portion})`}
                                    </Typography>
                                ))}
                            </Box>
                        );
                    })}
                </Box>
            );
        }

        if (Array.isArray(mealItems)) {
            return mealItems.map((item, index) => (
                <Typography
                    key={index}
                    variant="body2"
                    sx={{
                        textDecoration: item.yenildi ? 'line-through' : 'none',
                        color: getTextColorByAddedBy(item.addedBy, item.yenildi),
                        mb: index < mealItems.length - 1 ? 0.5 : 0,
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    {item.yenildi ? (
                        <CheckCircleIcon sx={{fontSize: 14, mr: 0.5, color: 'success.main'}}/>
                    ) : (
                        <RadioButtonUncheckedIcon sx={{fontSize: 14, mr: 0.5, color: 'text.secondary'}}/>
                    )}
                    {item.isim || item.name}
                    {(item.porsiyon || item.portion) && ` (${item.porsiyon || item.portion})`}
                </Typography>
            ));
        }

        return <Typography variant="body2">Öğün girilmemiş.</Typography>;
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'anamnez':
                return (
                    <Box>
                        {anamnezLoading ? (
                            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                                <CircularProgress/>
                            </Box>
                        ) : anamnezData ? (
                            <>
                                <Box sx={{display: 'justify-end', alignItems: 'center', gap: 1}}>
                                    <Chip
                                        label={`Son Güncelleme: ${new Date(anamnezData.updatedAt).toLocaleDateString('tr-TR')}`}
                                        size="small"
                                        sx={{mr: 1, fontWeight: 'bold', bgcolor: '#9575cd', color: '#fff'}}
                                    />
                                </Box>
                                {/* Sağlık Bilgileri Akordiyonu */}
                                <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 1}}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleOpenAnamnezDialog}
                                    >
                                        Anamnez Düzenle
                                    </Button>
                                </Box>
                                <Accordion elevation={3} sx={{mb: 2}} defaultExpanded>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon/>}
                                        sx={{
                                            bgcolor: 'primary.light',
                                            color: 'primary.contrastText',
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            width: '100%'
                                        }}>
                                            <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                                                Sağlık Bilgileri
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Kronik Hastalıklar"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.saglik_bilgileri.kronik_hastaliklar || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Alerjiler"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.saglik_bilgileri.alerjiler || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="İlaç Kullanımı"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.saglik_bilgileri.ilac_kullanimi || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Geçmiş Ameliyatlar"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.saglik_bilgileri.gecmis_ameliyatlar || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Aile Sağlık Geçmişi"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.saglik_bilgileri.aile_saglik_gecmisi || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Uyku"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.saglik_bilgileri.uyku || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Diyet Alışkanlıkları Akordiyonu */}
                                <Accordion elevation={3} sx={{mb: 2}}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon/>}
                                        sx={{
                                            bgcolor: 'warning.light',
                                            color: 'warning.contrastText',
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            width: '100%'
                                        }}>
                                            <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                                                Diyet Alışkanlıkları
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Günlük Su Tüketimi"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.diyet_aliskanliklari.gunluk_su_tuketimi || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Öğün Düzeni"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2" sx={{whiteSpace: 'pre-line'}}>
                                                            {anamnezData.diyet_aliskanliklari.ogun_duzeni || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Favori Yiyecekler"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.diyet_aliskanliklari.favori_yiyecekler || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Sevmediği Yiyecekler"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.diyet_aliskanliklari.sevilmeyen_yiyecekler || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Atıştırmalık Alışkanlıkları"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.diyet_aliskanliklari.atistirmalik_aliskanliklari || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Dışarıda Yemek"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.diyet_aliskanliklari.disarida_yemek || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Fiziksel Aktivite Akordiyonu */}
                                <Accordion elevation={3} sx={{mb: 2}}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon/>}
                                        sx={{
                                            bgcolor: 'info.light',
                                            color: 'info.contrastText',
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            width: '100%'
                                        }}>
                                            <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                                                Fiziksel Aktivite
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Aktivite Seviyesi"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.fiziksel_aktivite.aktivite_seviyesi || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Egzersiz Alışkanlıkları"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.fiziksel_aktivite.egzersiz_aliskanliklari || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Sevdiği Sporlar"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.fiziksel_aktivite.sevdigi_sporlar || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <Card variant="outlined" sx={{height: '100%'}}>
                                                    <CardHeader
                                                        title="Mesleği ve Aktivite Durumu"
                                                        titleTypographyProps={{
                                                            variant: 'subtitle1',
                                                            fontWeight: 'bold'
                                                        }}
                                                        sx={{pb: 1, bgcolor: '#2d4149', color: 'white'}}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            {anamnezData.fiziksel_aktivite.meslek_ve_aktivite_durumu || "Belirtilmemiş"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Özel Notlar */}
                                <Accordion elevation={3} sx={{mb: 2}}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon/>}
                                        sx={{
                                            bgcolor: '#7c4dff',
                                            color: '#fff',
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            width: '100%'
                                        }}>
                                            <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                                                Özel Notlar
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Paper variant="outlined" sx={{p: 2}}>
                                            <Typography variant="body2">
                                                {anamnezData.ozel_notlar || "Özel not bulunmuyor."}
                                            </Typography>
                                        </Paper>
                                    </AccordionDetails>
                                </Accordion>
                                {/* Kan Tahlili Akordiyonu */}
                                <Accordion elevation={3} sx={{mb: 2}}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon/>}
                                        sx={{
                                            bgcolor: 'error.light',
                                            color: 'error.contrastText',
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            width: '100%'
                                        }}>
                                            <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                                                Kan Tahlili
                                            </Typography>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                {bloodTestFiles && bloodTestFiles.length > 0 && (
                                                    <Chip
                                                        label={`Son Yükleme: ${new Date(bloodTestFiles[0].uploadDate).toLocaleDateString('tr-TR')}`}
                                                        size="small"
                                                        color="error"
                                                        sx={{mr: 1, fontWeight: 'bold'}}
                                                    />
                                                )}
                                                <Button
                                                    component="label"
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<AddIcon/>}
                                                    onClick={(e) => e.stopPropagation()}
                                                    color="error"
                                                    sx={{fontWeight: 'bold', color: 'white', boxShadow: 1}}
                                                >
                                                    Yükle
                                                    <input
                                                        type="file"
                                                        accept="application/pdf"
                                                        hidden
                                                        onChange={handleBloodTestFileUpload}
                                                    />
                                                </Button>
                                            </Box>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {bloodTestFiles && bloodTestFiles.length > 0 ? (
                                            <Box sx={{mt: 2}}>
                                                <List>
                                                    {bloodTestFiles.map((file, index) => (
                                                        <Paper
                                                            key={index}
                                                            elevation={1}
                                                            sx={{
                                                                mb: 2,
                                                                p: 2,
                                                                borderLeft: '4px solid',
                                                                borderColor: 'error.main'
                                                            }}
                                                        >
                                                            <Box sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            }}>
                                                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                                    <ReceiptLongIcon sx={{color: 'error.main', mr: 2}}/>
                                                                    <Box>
                                                                        <Typography variant="subtitle1"
                                                                                    sx={{fontWeight: 'bold'}}>
                                                                            Kan Tahlili
                                                                            - {new Date(file.uploadDate).toLocaleDateString('tr-TR')}
                                                                        </Typography>
                                                                        <Typography variant="caption"
                                                                                    color="text.secondary">
                                                                            {file.fileName || 'Tahlil Dosyası'}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                                <Box>
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={() => handleViewBloodTestFile(file)}
                                                                        size="small"
                                                                    >
                                                                        <Visibility/>
                                                                    </IconButton>
                                                                    <IconButton
                                                                        color="error"
                                                                        onClick={() => handleDeleteBloodTestFile(index)}
                                                                        size="small"
                                                                    >
                                                                        <DeleteIcon/>
                                                                    </IconButton>
                                                                </Box>
                                                            </Box>
                                                        </Paper>
                                                    ))}
                                                </List>
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: 120,
                                                border: '1px dashed',
                                                borderColor: 'error.main',
                                                borderRadius: 1
                                            }}>
                                                <Typography color="text.secondary">
                                                    Henüz kan tahlili dosyası eklenmemiş.
                                                </Typography>
                                            </Box>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            </>
                        ) : (
                            <Box sx={{textAlign: 'center', mt: 4}}>
                                <Typography variant="h6" color="text.secondary">
                                    Bu danışan için anamnez verisi bulunmadı.
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{mt: 2}}
                                    onClick={handleOpenAnamnezDialog}
                                >
                                    <AddIcon sx={{mr: 1}}/>
                                    Anamnez Ekle
                                </Button>
                            </Box>
                        )}
                    </Box>
                );
            case 'olcum':
                return (
                    <Box>
                        <Typography variant="h5" sx={{mb: 3, fontWeight: 'bold', color: theme.palette.primary.main}}>
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Card elevation={3} sx={{height: '100%'}}>
                                    <CardHeader
                                        title="Vücut Ölçümleri"
                                        titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
                                        action={
                                            <Box sx={{display: 'flex', gap: 1}}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    color="secondary"
                                                    startIcon={<AddIcon/>}
                                                    onClick={handleOpenMeasurementDialog}
                                                    sx={{color: "#fff", fontWeight: "bold"}}
                                                >
                                                    Yeni Ölçüm
                                                </Button>
                                            </Box>
                                        }
                                        sx={{
                                            pb: 1,
                                            bgcolor: '#2d4149',
                                            color: 'white',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        <Box sx={{
                                            maxHeight: 350, overflowY: 'auto', pr: 1,
                                            '&::-webkit-scrollbar': {background: '#e8f5e9', width: 8},
                                            '&::-webkit-scrollbar-thumb': {background: '#81c784', borderRadius: 4},
                                            scrollbarColor: '#81c784 #e8f5e9',
                                            scrollbarWidth: 'thin'
                                        }}>
                                            <TableContainer component={Paper} sx={{mb: 4, mt: 2}}>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Tarih</TableCell>
                                                            <TableCell align="right">Boy (cm)</TableCell>
                                                            <TableCell align="right">Kilo (kg)</TableCell>
                                                            <TableCell align="right">Bel (cm)</TableCell>
                                                            <TableCell align="right">Bel (cm)</TableCell>
                                                            <TableCell align="right">Kalça (cm)</TableCell>
                                                            <TableCell align="right">Göğüs (cm)</TableCell>
                                                            <TableCell align="right">Kol (cm)</TableCell>
                                                            <TableCell align="right">Bacak (cm)</TableCell>
                                                            <TableCell align="right">Yağ (%)</TableCell>
                                                            <TableCell align="right">Kas (%)</TableCell>
                                                            <TableCell align="right">Su (%)</TableCell>
                                                            <TableCell align="center">İşlemler</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {measurements.map((measurement) => (
                                                            <TableRow key={measurement.id}>
                                                                <TableCell>
                                                                    {new Date(measurement.createdAt).toLocaleDateString('tr-TR')}
                                                                </TableCell>
                                                                <TableCell
                                                                    align="right">{measurement.boy || '-'}</TableCell>
                                                                <TableCell
                                                                    align="right">{measurement.kilo || '-'}</TableCell>
                                                                <TableCell
                                                                    align="right">{measurement.bel || '-'}</TableCell>
                                                                <TableCell
                                                                    align="right">{measurement.digerbel || '-'}</TableCell>
                                                                <TableCell
                                                                    align="right">{measurement.kalca || '-'}</TableCell>
                                                                <TableCell
                                                                    align="right">{measurement.gogus || '-'}</TableCell>
                                                                <TableCell
                                                                    align="right">{measurement.kol || '-'}</TableCell>
                                                                <TableCell
                                                                    align="right">{measurement.bacak || '-'}</TableCell>
                                                                <TableCell
                                                                    align="right">{measurement.yag || '-'}</TableCell>
                                                                <TableCell
                                                                    align="right">{measurement.kas || '-'}</TableCell>
                                                                <TableCell
                                                                    align="right">{measurement.su || '-'}</TableCell>
                                                                <TableCell
                                                                    sx={{display: 'flex', justifyContent: 'center'}}
                                                                    align="center">
                                                                    <IconButton
                                                                        color="primary"
                                                                        size="small"
                                                                        onClick={() => handleOpenEditMeasurementDialog(measurement)}
                                                                    >
                                                                        <EditIcon/>
                                                                    </IconButton>
                                                                    <IconButton
                                                                        color="secondary"
                                                                        sx={{color: 'red'}}
                                                                        onClick={() => handleOpenDeleteMeasurementDialog(measurement)}
                                                                    >
                                                                        <DeleteIcon/>
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card elevation={3} sx={{height: '100%'}}>
                                    <CardHeader
                                        title="Vücut Analizi"
                                        titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
                                        sx={{
                                            bgcolor: '#2d4149',
                                            color: 'white',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                            {measurements && measurements.length > 0 ? (
                                                <>
                                                    <Box>
                                                        <Typography variant="subtitle1" gutterBottom>Vücut Yağ
                                                            Oranı</Typography>
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <Box sx={{
                                                                flexGrow: 1,
                                                                bgcolor: '#f5f5f5',
                                                                height: 10,
                                                                borderRadius: 5
                                                            }}>
                                                                <Box
                                                                    sx={{
                                                                        width: `${measurements[0].yag || 0}%`,
                                                                        bgcolor: theme.palette.primary.main,
                                                                        height: '100%',
                                                                        borderRadius: 5
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography
                                                                variant="body2">{measurements[0].yag || 0}%</Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Hedef: 25-28% | Standart: 25-31%
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" gutterBottom>Kas
                                                            Kütlesi</Typography>
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <Box sx={{
                                                                flexGrow: 1,
                                                                bgcolor: '#f5f5f5',
                                                                height: 10,
                                                                borderRadius: 5
                                                            }}>
                                                                <Box
                                                                    sx={{
                                                                        width: `${measurements[0].kas || 0}%`,
                                                                        bgcolor: theme.palette.info.main,
                                                                        height: '100%',
                                                                        borderRadius: 5
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography
                                                                variant="body2">{measurements[0].kas || 0}%</Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Hedef: 30-35% | Standart: 30-35%
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" gutterBottom>Vücut
                                                            Suyu</Typography>
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <Box sx={{
                                                                flexGrow: 1,
                                                                bgcolor: '#f5f5f5',
                                                                height: 10,
                                                                borderRadius: 5
                                                            }}>
                                                                <Box
                                                                    sx={{
                                                                        width: `${measurements[0].su || 0}%`,
                                                                        bgcolor: theme.palette.info.light,
                                                                        height: '100%',
                                                                        borderRadius: 5
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography
                                                                variant="body2">{measurements[0].su || 0}%</Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Hedef: 45-60% | Standart: 45-60%
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" gutterBottom>BMI</Typography>
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <Box sx={{
                                                                flexGrow: 1,
                                                                bgcolor: '#f5f5f5',
                                                                height: 10,
                                                                borderRadius: 5
                                                            }}>
                                                                <Box
                                                                    sx={{
                                                                        width: `${calculateBMI?.value ?? 0}%`,
                                                                        bgcolor: calculateBMI?.color || theme.palette.warning.main,
                                                                        height: '100%',
                                                                        borderRadius: 5
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography
                                                                variant="body2">{calculateBMI?.value || '-'}</Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {calculateBMI?.category || 'Hedef: 18.5-25'}
                                                        </Typography>
                                                    </Box>
                                                </>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Analiz verisi bulunamadı.
                                                </Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                );
            case 'beslenme':
                return (
                    <Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                            <Box>
                                {/*<Button
                                    variant="outlined"
                                    size="small"
                                    sx={{ mr: 1 }}
                                    startIcon={<PrintIcon />}
                                >
                                    Yazdır
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<EditIcon />}
                                >
                                    Düzenle
                                </Button> */}
                            </Box>
                            <Box sx={{display: 'flex', gap: 1}}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<AddIcon/>}
                                    onClick={handleOpenAssignNutritionPlanDialog}
                                    sx={{color: "white", borderColor: theme.palette.primary.main}}
                                >
                                    Plan Ata
                                </Button>
                            </Box>
                        </Box>

                        {nutritionPlanLoading ? (
                            <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                                <CircularProgress/>
                            </Box>
                        ) : (
                            <Paper elevation={3} sx={{mb: 3}}>
                                <Box sx={{
                                    p: 2,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    borderTopLeftRadius: 4,
                                    borderTopRightRadius: 4,
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <Typography variant="h5" sx={{fontWeight: 'bold'}}>
                                        {nutritionPlan && nutritionPlan.length > 0
                                            ? nutritionPlan[selectedPlanIndex]?.note || "İsim Girilmemiş Plan"
                                            : "İsim Girilmemiş Plan"}
                                    </Typography>
                                </Box>

                                <Box sx={{
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: '#f5f5f5',
                                    borderBottom: '1px solid #e0e0e0'
                                }}>
                                    <CheckCircleIcon sx={{fontSize: 16, color: 'success.main', mr: 1}}/>
                                    <Typography variant="body2" sx={{fontStyle: 'italic', mr: 3}}>
                                        İşaretli ve üzeri çizili öğeler, danışanın mobil uygulamada yedim olarak
                                        işaretlediği öğünlerdir.
                                    </Typography>

                                    {/* Renk açıklaması */}
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto'}}>
                                        <Typography variant="caption" sx={{fontWeight: 'bold', mr: 1}}>
                                            Renk Haritası:
                                        </Typography>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                            <Box sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main'
                                            }}/>
                                            <Typography variant="caption">Diyetisyen</Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                            <Box sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                bgcolor: 'warning.main'
                                            }}/>
                                            <Typography variant="caption">Danışan</Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Divider/>

                                <Box sx={{overflowX: 'auto'}}>
                                    <Box sx={{minWidth: 900, p: 2}}>
                                        {nutritionPlan && nutritionPlan.length > 0 && (
                                            <>
                                                {/* Gün başlıkları satırı */}
                                                <Grid container spacing={1}>
                                                    <Grid item xs={2}>
                                                        <Box sx={{textAlign: 'center', p: 1}}>
                                                            <Typography variant="subtitle1"
                                                                        sx={{fontWeight: 'bold'}}>Öğün</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={10}>
                                                        <Grid container>
                                                            {Object.keys(nutritionPlan[selectedPlanIndex]?.mealPlan || {}).map((day, index) => (
                                                                <Grid item xs={1.7} key={`day-${index}`}>
                                                                    <Box sx={{textAlign: 'center', p: 1}}>
                                                                        <Typography variant="subtitle1"
                                                                                    sx={{fontWeight: 'bold'}}>
                                                                            {day.substr(0, 3)}
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>
                                                            ))}
                                                        </Grid>
                                                    </Grid>
                                                </Grid>

                                                <Divider sx={{my: 1}}/>

                                                {/* Öğün satırları - dinamik olarak mealPlan'den alınıyor */}
                                                {nutritionPlan[selectedPlanIndex]?.mealPlan &&
                                                    Object.keys(nutritionPlan[selectedPlanIndex]?.mealPlan || {}).length > 0 &&
                                                    (() => {
                                                        const firstDay = Object.keys(nutritionPlan[selectedPlanIndex]?.mealPlan)[0];
                                                        const meals = Object.keys(nutritionPlan[selectedPlanIndex]?.mealPlan[firstDay] || {});

                                                        const mealColors = {
                                                            'Kahvaltı': 'primary.light',
                                                            'Öğle Yemeği': 'warning.light',
                                                            'Akşam Yemeği': 'error.light',
                                                            'Aparatif': 'info.light',
                                                            'default': 'secondary.light'
                                                        };

                                                        const mealDisplayNames = {
                                                            'Kahvaltı': 'Kahvaltı',
                                                            'Öğle Yemeği': 'Öğle',
                                                            'Akşam Yemeği': 'Akşam',
                                                            'Aparatif': 'Ara Öğün'
                                                        };

                                                        return meals.map((meal, mealIndex) => {
                                                            const firstDay = Object.keys(nutritionPlan[selectedPlanIndex]?.mealPlan)[0];
                                                            const mealInfo = nutritionPlan[selectedPlanIndex]?.mealPlan[firstDay]?.[meal]?.info || {};
                                                            const mealTime = mealInfo.time;

                                                            return (
                                                                <React.Fragment key={`meal-row-${mealIndex}`}>
                                                                    <Grid container spacing={1}>
                                                                        <Grid item xs={2}>
                                                                            <Box sx={{
                                                                                bgcolor: mealColors[meal] || mealColors.default,
                                                                                color: meal === 'Aparatif' ? 'info.contrastText' :
                                                                                    meal === 'Akşam Yemeği' ? 'error.contrastText' :
                                                                                        meal === 'Öğle Yemeği' ? 'warning.contrastText' : 'primary.contrastText',
                                                                                p: 1,
                                                                                borderRadius: 1,
                                                                                height: '100%',
                                                                                display: 'flex',
                                                                                flexDirection: 'column',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            }}>
                                                                                <Typography variant="subtitle1"
                                                                                            sx={{fontWeight: 'bold'}}>
                                                                                    {mealDisplayNames[meal] || meal}
                                                                                </Typography>
                                                                                {mealTime && (
                                                                                    <Box sx={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        mt: 1
                                                                                    }}>
                                                                                        <AccessTimeIcon sx={{
                                                                                            fontSize: 14,
                                                                                            mr: 0.5,
                                                                                            color: 'inherit',
                                                                                            opacity: 0.9
                                                                                        }}/>
                                                                                        <Typography variant="caption"
                                                                                                    sx={{
                                                                                                        fontWeight: 'medium',
                                                                                                        color: 'inherit'
                                                                                                    }}>
                                                                                            {mealTime}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                )}
                                                                            </Box>
                                                                        </Grid>
                                                                        <Grid item xs={10}>
                                                                            <Grid container spacing={1}>
                                                                                {Object.keys(nutritionPlan[selectedPlanIndex]?.mealPlan || {}).map((day, dayIndex) => (
                                                                                    <Grid item xs={1.7}
                                                                                          key={`${meal}-${day}-${dayIndex}`}>
                                                                                        <Paper elevation={1} sx={{
                                                                                            p: 1,
                                                                                            height: '100%'
                                                                                        }}>
                                                                                            {renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.[day]?.[meal]) ||
                                                                                                <Typography
                                                                                                    variant="body2">Öğün
                                                                                                    girilmemiş.</Typography>}
                                                                                        </Paper>
                                                                                    </Grid>
                                                                                ))}
                                                                            </Grid>
                                                                        </Grid>
                                                                    </Grid>
                                                                    {mealIndex < meals.length - 1 &&
                                                                        <Divider sx={{my: 1}}/>}
                                                                </React.Fragment>
                                                            );
                                                        });
                                                    })()
                                                }
                                            </>
                                        )}

                                        {(!nutritionPlan || nutritionPlan.length === 0) && (
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: 200,
                                                border: '1px dashed',
                                                borderColor: 'grey.400',
                                                borderRadius: 1
                                            }}>
                                                <Typography color="text.secondary">
                                                    Beslenme planı bulunamadı.
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                                <Divider/>
                            </Paper>
                        )}

                        {/* Atanmış Planlar Kartı */}
                        <Card elevation={3} sx={{mb: 3}}>
                            <CardHeader
                                title="Atanmış Planlar"
                                titleTypographyProps={{variant: 'h5', fontWeight: 'bold'}}
                                action={
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<AddIcon/>}
                                        onClick={handleOpenAssignNutritionPlanDialog}
                                        sx={{bgcolor: theme.palette.primary.main, color: 'white'}}
                                    >
                                        Plan Ata
                                    </Button>
                                }
                                sx={{
                                    bgcolor: '#2d4149',
                                    color: 'white',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider'
                                }}
                            />
                            <CardContent>
                                {nutritionPlanLoading ? (
                                    <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                                        <CircularProgress/>
                                    </Box>
                                ) : nutritionPlan && nutritionPlan.length > 0 ? (
                                    <Grid container spacing={2}>
                                        {nutritionPlan.map((plan, index) => {
                                            let totalMeals = 0;
                                            let eatenMeals = 0;

                                            if (plan.mealPlan) {
                                                Object.keys(plan.mealPlan).forEach(day => {
                                                    if (plan.mealPlan[day]) {
                                                        Object.keys(plan.mealPlan[day]).forEach(mealType => {
                                                            const meals = plan.mealPlan[day][mealType];
                                                            if (Array.isArray(meals) && meals.length > 0) {
                                                                if (meals[0].hasOwnProperty('isim')) {
                                                                    totalMeals += meals.length;
                                                                    eatenMeals += meals.filter(meal => meal.yenildi).length;
                                                                } else {
                                                                    totalMeals += meals.length;
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                            }

                                            return (
                                                <Grid item xs={12} md={6} key={plan.id}>
                                                    <Card elevation={3}>
                                                        <CardHeader
                                                            avatar={<Avatar
                                                                sx={{bgcolor: 'primary.main'}}><RestaurantIcon/></Avatar>}
                                                            title={<Typography variant="subtitle1"
                                                                               sx={{fontWeight: 'bold'}}>{plan.note || 'Beslenme Planı'}</Typography>}
                                                            action={<Chip
                                                                label={isActivePlan(plan) ? "Aktif Plan" : "Pasif Plan"}
                                                                color={isActivePlan(plan) ? "success" : "default"}
                                                                size="small"/>}
                                                            sx={{
                                                                bgcolor: '#2d4149',
                                                                color: 'white',
                                                                borderBottom: '1px solid',
                                                                borderColor: 'divider'
                                                            }}
                                                        />
                                                        <CardContent>
                                                            <Typography variant="body2" sx={{mb: 1}}>
                                                                <strong>Başlangıç
                                                                    Tarihi:</strong> {plan.startDate ? new Date(plan.startDate).toLocaleDateString('tr-TR') : '-'}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{mb: 1}}>
                                                                <strong>Bitiş
                                                                    Tarihi:</strong> {plan.endDate ? new Date(plan.endDate).toLocaleDateString('tr-TR') : '-'}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{mb: 1}}>
                                                                <strong>Oluşturulma
                                                                    Tarihi:</strong> {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('tr-TR') : '-'}
                                                            </Typography>
                                                            <Box sx={{
                                                                mt: 2,
                                                                display: 'flex',
                                                                justifyContent: 'space-between'
                                                            }}>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    onClick={() => setSelectedPlanIndex(index)}
                                                                    disabled={selectedPlanIndex === index}
                                                                >
                                                                    {selectedPlanIndex === index ? 'Seçili Plan' : 'Planı Görüntüle'}
                                                                </Button>
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                ) : (
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        py: 4
                                    }}>
                                        <FitnessCenterIcon sx={{fontSize: 40, color: 'text.disabled', mb: 1}}/>
                                        <Typography color="text.secondary" align="center">
                                            Bu danışana atanmış beslenme planı bulunmamaktadır.
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Water Tracking Card */}
                        <WaterTrackingCard data={waterTrackingData} clientId={id}/>
                    </Box>
                );
            case 'randevu':
                const now = new Date();
                const upcomingAppointments = appointments.filter(app =>
                    (app.status !== 'canceled' && app.status !== 'cancelled') &&
                    new Date(app.start) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) &&
                    new Date(app.start) > now
                );
                const pastAppointments = appointments.filter(app =>
                    (app.status !== 'canceled' && app.status !== 'cancelled') &&
                    (new Date(app.start) <= now)
                );
                return (
                    <Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                            <Typography variant="h6"></Typography>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon/>}
                                onClick={() => setIsAddAppointmentDialogOpen(true)}
                                sx={{bgcolor: theme.palette.primary.main}}
                            >
                                Yeni Randevu
                            </Button>
                        </Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={7}>
                                {/* Yaklaşan Randevular */}
                                <Card elevation={3} sx={{mb: 3}}>
                                    <CardHeader
                                        title="Yaklaşan Randevular"
                                        titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
                                        sx={{
                                            bgcolor: '#2d4149',
                                            color: 'white',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    {appointmentsLoading ? (
                                        <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                                            <CircularProgress/>
                                        </Box>
                                    ) : upcomingAppointments.length > 0 ? (
                                        <List>
                                            {upcomingAppointments.map(app => (
                                                <ListItem
                                                    key={app.id}
                                                    secondaryAction={
                                                        <Box>
                                                            <IconButton color="error"
                                                                        onClick={() => handleDeleteAppointmentConfirmation(app)}
                                                                        edge="end" aria-label="delete">
                                                                <DeleteIcon/>
                                                            </IconButton>
                                                        </Box>
                                                    }
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar sx={{bgcolor: 'primary.main'}}>
                                                            <EventIcon/>
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                                <Typography variant="subtitle1"
                                                                            sx={{fontWeight: 'bold'}}>
                                                                    {app.title || 'Randevu'}
                                                                </Typography>
                                                                <Chip
                                                                    label={
                                                                        app.status === 'pending' ? 'Beklemede' :
                                                                            app.status === 'approved' ? 'Onaylandı' :
                                                                                app.status === 'cancelled' ? 'İptal Edildi' :
                                                                                    app.status
                                                                    }
                                                                    size="small"
                                                                    color={
                                                                        app.status === 'pending' ? 'warning' :
                                                                            app.status === 'approved' ? 'success' :
                                                                                app.status === 'cancelled' ? 'error' :
                                                                                    'info'
                                                                    }
                                                                    sx={{ml: 1}}
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box>
                                                                <Typography variant="body2" component="span">
                                                                    {app.start ? new Date(app.start).toLocaleString('tr-TR', {
                                                                        dateStyle: 'long',
                                                                        timeStyle: 'short'
                                                                    }) : ''}
                                                                </Typography>
                                                                {app.note && (
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Notlar: {app.note}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{p: 2}}>
                                            Yaklaşan randevu bulunmamaktadır.
                                        </Typography>
                                    )}
                                </Card>
                                {/* Geçmiş Randevular */}
                                <Card elevation={3}>
                                    <CardHeader
                                        title="Geçmiş Randevular"
                                        titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
                                        sx={{
                                            bgcolor: '#2d4149',
                                            color: 'white',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    {appointmentsLoading ? (
                                        <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                                            <CircularProgress/>
                                        </Box>
                                    ) : pastAppointments.length > 0 ? (
                                        <List>
                                            {pastAppointments.map(app => (
                                                <ListItem key={app.id}>
                                                    <ListItemAvatar>
                                                        <Avatar sx={{bgcolor: 'grey.500'}}>
                                                            <EventIcon/>
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                                <Typography variant="subtitle1"
                                                                            sx={{fontWeight: 'bold'}}>
                                                                    {app.title || 'Randevu'}
                                                                </Typography>
                                                                <Chip
                                                                    label={
                                                                        app.status === 'pending' ? 'Beklemede' :
                                                                            app.status === 'approved' ? 'Onaylandı' :
                                                                                app.status === 'cancelled' ? 'İptal Edildi' :
                                                                                    app.status
                                                                    }
                                                                    size="small"
                                                                    color={
                                                                        app.status === 'pending' ? 'warning' :
                                                                            app.status === 'approved' ? 'success' :
                                                                                app.status === 'cancelled' ? 'error' :
                                                                                    'info'
                                                                    }
                                                                    sx={{ml: 1}}
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box>
                                                                <Typography variant="body2" component="span">
                                                                    {app.start ? new Date(app.start).toLocaleString('tr-TR', {
                                                                        dateStyle: 'long',
                                                                        timeStyle: 'short'
                                                                    }) : ''}
                                                                </Typography>
                                                                {app.note && (
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Notlar: {app.note}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{p: 2}}>
                                            Geçmiş randevu bulunmamaktadır.
                                        </Typography>
                                    )}
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={5}>
                                {/* Randevu Notları */}
                                <Card elevation={3} sx={{mb: 3}}>
                                    <CardHeader
                                        title="Son Randevu Notları"
                                        titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
                                        subheader={pastAppointments.length > 0 ? new Date(pastAppointments[0].start).toLocaleDateString('tr-TR') : ''}
                                        sx={{
                                            bgcolor: '#2d4149',
                                            color: 'white',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        {pastAppointments.length > 0 ? (
                                            pastAppointments[0].note ? (
                                                <Typography variant="body1" paragraph>
                                                    {pastAppointments[0].note}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Bu randevu için not eklenmemiş.
                                                </Typography>
                                            )
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Henüz tamamlanmış randevu bulunmamaktadır.
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                                {/* İstatistikler */}
                                <Card elevation={3}>
                                    <CardHeader
                                        title="Randevu İstatistikleri"
                                        titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
                                        sx={{
                                            bgcolor: '#2d4149',
                                            color: 'white',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Box sx={{
                                                    p: 2,
                                                    bgcolor: 'success.light',
                                                    color: 'success.contrastText',
                                                    borderRadius: 2,
                                                    textAlign: 'center'
                                                }}>
                                                    <Typography variant="h4"
                                                                sx={{fontWeight: 'bold'}}>{pastAppointments.filter(a => a.status === 'completed' || a.status === 'approved').length}</Typography>
                                                    <Typography variant="body2">Tamamlanan</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{
                                                    p: 2,
                                                    bgcolor: 'primary.light',
                                                    color: 'primary.contrastText',
                                                    borderRadius: 2,
                                                    textAlign: 'center'
                                                }}>
                                                    <Typography variant="h4"
                                                                sx={{fontWeight: 'bold'}}>{upcomingAppointments.length}</Typography>
                                                    <Typography variant="body2">Yaklaşan</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{
                                                    p: 2,
                                                    bgcolor: 'warning.light',
                                                    color: 'warning.contrastText',
                                                    borderRadius: 2,
                                                    textAlign: 'center'
                                                }}>
                                                    <Typography variant="h4"
                                                                sx={{fontWeight: 'bold'}}>{appointments.filter(a => a.status === 'cancelled').length}</Typography>
                                                    <Typography variant="body2">İptal Edilen</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{
                                                    p: 2,
                                                    bgcolor: 'info.light',
                                                    color: 'info.contrastText',
                                                    borderRadius: 2,
                                                    textAlign: 'center'
                                                }}>
                                                    <Typography variant="h4"
                                                                sx={{fontWeight: 'bold'}}>{appointments.length}</Typography>
                                                    <Typography variant="body2">Toplam</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        <Dialog open={isAddAppointmentDialogOpen} onClose={() => setIsAddAppointmentDialogOpen(false)}>
                            <DialogTitle>Yeni Randevu Ekle</DialogTitle>
                            <DialogContent>
                                <TextField
                                    label="Başlık"
                                    name="title"
                                    value={appointmentForm.title}
                                    onChange={(e) => setAppointmentForm({...appointmentForm, title: e.target.value})}
                                    fullWidth margin="normal"
                                />
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                                    <DateTimePicker
                                        label="Başlangıç"
                                        ampm={false}
                                        views={['year', 'month', 'day', 'hours', 'minutes']}
                                        value={appointmentForm.start ? new Date(appointmentForm.start) : null}
                                        onChange={(newValue) => {
                                            setAppointmentForm({
                                                ...appointmentForm,
                                                start: newValue ? newValue.toISOString() : null
                                            })
                                        }}
                                        renderInput={(params) => <TextField {...params} fullWidth margin="normal"/>}
                                    />
                                </LocalizationProvider>
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                                    <DateTimePicker
                                        label="Bitiş"
                                        ampm={false}
                                        views={['year', 'month', 'day', 'hours', 'minutes']}
                                        value={appointmentForm.end ? new Date(appointmentForm.end) : null}
                                        onChange={(newValue) => {
                                            setAppointmentForm({
                                                ...appointmentForm,
                                                end: newValue ? newValue.toISOString() : null
                                            })
                                        }}
                                        renderInput={(params) => <TextField {...params} fullWidth margin="normal"/>}
                                    />
                                </LocalizationProvider>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setIsAddAppointmentDialogOpen(false)}>
                                    İptal
                                </Button>
                                <Button onClick={handleAddAppointment}>Ekle</Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                );
            case 'egzersiz':
                return (
                    <Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                            <Typography variant="h5" sx={{fontWeight: 'bold', color: theme.palette.primary.main}}>
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon/>}
                                onClick={handleOpenAssignExerciseDialog}
                            >
                                Yeni Egzersiz Ata
                            </Button>
                        </Box>

                        {/* Aktif Egzersiz Alanı */}
                        {assignedExercisesLoading ? (
                            <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                                <CircularProgress/>
                            </Box>
                        ) : activeExercise ? (
                            <Card elevation={3} sx={{mb: 3, overflow: 'hidden', borderRadius: 2}}>
                                <CardHeader
                                    title="Aktif Egzersiz Programı"
                                    titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
                                    sx={{
                                        bgcolor: '#2d4149',
                                        color: 'white',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                />
                                <CardContent>
                                    <Typography variant="h6" component="div" sx={{fontWeight: 'bold', mb: 1}}>
                                        {activeExercise.Exercise?.exercise_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                        {activeExercise.Exercise?.exercise_description}
                                    </Typography>

                                    <Grid container spacing={2} sx={{mb: 2}}>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: 1,
                                                bgcolor: 'primary.light',
                                                borderRadius: 1
                                            }}>
                                                <CalendarTodayIcon
                                                    sx={{color: 'primary.dark', mr: 1, fontSize: 18}}/>
                                                <Typography variant="body2" sx={{fontWeight: 'medium'}}>
                                                    {new Date(activeExercise.start_date).toLocaleDateString('tr-TR')} - {new Date(activeExercise.end_date).toLocaleDateString('tr-TR')}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        {activeExercise.Exercise?.duration && (
                                            <Grid item xs={6} sm={6} md={3}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    p: 1,
                                                    bgcolor: 'info.light',
                                                    borderRadius: 1
                                                }}>
                                                    <AccessTimeIcon
                                                        sx={{color: 'info.dark', mr: 1, fontSize: 18}}/>
                                                    <Typography variant="body2" sx={{fontWeight: 'medium'}}>
                                                        {activeExercise.Exercise.duration} dakika
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {activeExercise.Exercise?.difficulty && (
                                            <Grid item xs={6} sm={6} md={3}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    p: 1,
                                                    bgcolor: activeExercise.Exercise.difficulty > 3 ? 'error.light' : activeExercise.Exercise.difficulty > 1 ? 'warning.light' : 'success.light',
                                                    borderRadius: 1
                                                }}>
                                                    <FitnessCenterIcon sx={{
                                                        color: activeExercise.Exercise.difficulty > 3 ? 'error.dark' : activeExercise.Exercise.difficulty > 1 ? 'warning.dark' : 'success.dark',
                                                        mr: 1,
                                                        fontSize: 18
                                                    }}/>
                                                    <Typography variant="body2" sx={{fontWeight: 'medium'}}>
                                                        Zorluk: {activeExercise.Exercise.difficulty}/5
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                        {activeExercise.Exercise?.calories_burned && (
                                            <Grid item xs={6} sm={6} md={3}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    p: 1,
                                                    bgcolor: 'secondary.light',
                                                    borderRadius: 1
                                                }}>
                                                    <LocalFireDepartmentIcon
                                                        sx={{color: 'secondary.dark', mr: 1, fontSize: 18}}/>
                                                    <Typography variant="body2" sx={{fontWeight: 'medium'}}>
                                                        {activeExercise.Exercise.calories_burned} kcal
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>

                                    {activeExercise.note && (
                                        <Box sx={{
                                            mt: 2,
                                            p: 2,
                                            bgcolor: 'warning.light',
                                            borderRadius: 1,
                                            borderLeft: 4,
                                            borderLeftColor: 'warning.main'
                                        }}>
                                            <Typography variant="subtitle2" sx={{fontWeight: 'bold', mb: 0.5}}>
                                                Diyetisyen Notu:
                                            </Typography>
                                            <Typography variant="body2">{activeExercise.note}</Typography>
                                        </Box>
                                    )}

                                    {activeExercise.Exercise?.video && (
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            href={activeExercise.Exercise.video}
                                            target="_blank"
                                            startIcon={<OndemandVideoIcon/>}
                                            sx={{mt: 2}}
                                        >
                                            Video İzle
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Alert severity="info" sx={{mb: 3}}>
                                Danışana atanmış aktif bir egzersiz programı bulunmamaktadır.
                            </Alert>
                        )}

                        {/* Tüm Egzersiz Programları */}
                        <Card elevation={3} sx={{borderRadius: 2}}>
                            <CardHeader
                                title="Atanmış Tüm Egzersizler"
                                titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
                                sx={{
                                    bgcolor: '#2d4149',
                                    color: 'white',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider'
                                }}
                            />
                            <CardContent>
                                {assignedExercisesLoading ? (
                                    <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                                        <CircularProgress/>
                                    </Box>
                                ) : assignedExercises.length > 0 ? (
                                    <TableContainer component={Paper} elevation={0}>
                                        <Table sx={{minWidth: 650}} aria-label="egzersiz tablosu">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><strong>Egzersiz</strong></TableCell>
                                                    <TableCell><strong>Tarih Aralığı</strong></TableCell>
                                                    <TableCell><strong>Süre</strong></TableCell>
                                                    <TableCell><strong>Zorluk</strong></TableCell>
                                                    <TableCell><strong>Kalori</strong></TableCell>
                                                    <TableCell><strong>Durum</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {assignedExercises.length > 10 && (
                                                    <TableRow>
                                                        <TableCell colSpan={6} sx={{
                                                            textAlign: 'center',
                                                            py: 2,
                                                            bgcolor: 'rgba(0, 0, 0, 0.02)'
                                                        }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Toplam {assignedExercises.length} egzersizden son 10
                                                                tanesi görüntüleniyor
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {assignedExercises.slice(-10).map((exercise) => (
                                                    <TableRow
                                                        key={exercise.id}
                                                        sx={{
                                                            '&:last-child td, &:last-child th': {border: 0},
                                                            bgcolor: isActiveExercise(exercise) ? 'rgba(76, 175, 80, 0.08)' : 'inherit'
                                                        }}
                                                    >
                                                        <TableCell component="th" scope="row">
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {exercise.Exercise?.exercise_name}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(exercise.start_date).toLocaleDateString('tr-TR')} - {new Date(exercise.end_date).toLocaleDateString('tr-TR')}
                                                        </TableCell>
                                                        <TableCell>
                                                            {exercise.Exercise?.duration || '-'} dk
                                                        </TableCell>
                                                        <TableCell>
                                                            {exercise.Exercise?.difficulty || '-'}/5
                                                        </TableCell>
                                                        <TableCell>
                                                            {exercise.Exercise?.calories_burned || '-'} kcal
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                size="small"
                                                                label={isActiveExercise(exercise) ? "Aktif" : "Pasif"}
                                                                color={isActiveExercise(exercise) ? "success" : "default"}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        py: 4,
                                        borderRadius: 2,
                                        border: '1px dashed #bdbdbd',
                                        bgcolor: '#f8f9fa'
                                    }}>
                                        <FitnessCenterIcon sx={{fontSize: 40, color: 'text.disabled', mb: 1}}/>
                                        <Typography color="text.secondary" align="center">
                                            Bu danışana atanmış egzersiz programı bulunmamaktadır.
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Egzersiz Geçmişi - Add as separate section */}
                        <Card elevation={3} sx={{borderRadius: 2, mt: 3}}>
                            <CardHeader
                                title="Tamamlanan Egzersiz Geçmişi"
                                titleTypographyProps={{variant: 'h6', fontWeight: 'bold'}}
                                sx={{
                                    bgcolor: '#2d4149',
                                    color: 'white',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider'
                                }}
                            />
                            <CardContent>
                                <Box sx={{
                                    mb: 3,
                                    p: 2,
                                    bgcolor: '#ffffff',
                                    borderRadius: 2,
                                    border: '1px solid #e0e0e0'
                                }}>
                                    <Typography variant="subtitle1" sx={{
                                        mb: 2,
                                        fontWeight: 500,
                                        color: '#424242',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <FilterAltIcon sx={{mr: 1, fontSize: 20, color: '#757575'}}/>
                                        Tarih Aralığı Filtreleme
                                    </Typography>
                                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end'}}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                                            <Box sx={{flex: '1 1 200px'}}>
                                                <DatePicker
                                                    label="Başlangıç Tarihi"
                                                    value={historyStartDate ? new Date(historyStartDate) : null}
                                                    onChange={(newValue) => handleHistoryDateChange('start', newValue)}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            variant: "outlined",
                                                            size: "small",
                                                            sx: {
                                                                backgroundColor: '#fff',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    '&:hover fieldset': {
                                                                        borderColor: theme.palette.primary.main,
                                                                    },
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{flex: '1 1 200px'}}>
                                                <DatePicker
                                                    label="Bitiş Tarihi"
                                                    value={historyEndDate ? new Date(historyEndDate) : null}
                                                    onChange={(newValue) => handleHistoryDateChange('end', newValue)}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            variant: "outlined",
                                                            size: "small",
                                                            sx: {
                                                                backgroundColor: '#fff',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    '&:hover fieldset': {
                                                                        borderColor: theme.palette.primary.main,
                                                                    },
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </LocalizationProvider>
                                    </Box>
                                </Box>

                                {loadingExerciseHistory ? (
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        py: 5
                                    }}>
                                        <CircularProgress sx={{color: theme.palette.primary.main, mb: 2}}/>
                                        <Typography variant="body1" color="text.secondary">Egzersiz geçmişi
                                            yükleniyor...</Typography>
                                    </Box>
                                ) : exerciseHistory.filter(item => item.status === 'completed').length > 0 ? (
                                    <List sx={{width: '100%', bgcolor: 'background.paper'}}>
                                        {exerciseHistory
                                            .filter(item => item.status === 'completed')
                                            .map((item) => (
                                                <React.Fragment key={item.id}>
                                                    <ListItem
                                                        alignItems="flex-start"
                                                        sx={{
                                                            py: 2,
                                                            transition: 'background-color 0.2s',
                                                            '&:hover': {
                                                                backgroundColor: '#f5f5f5'
                                                            }
                                                        }}
                                                    >
                                                        <ListItemAvatar>
                                                            <Avatar sx={{
                                                                bgcolor: '#43a047',
                                                                width: 48,
                                                                height: 48,
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }}>
                                                                <CheckCircleIcon/>
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <Typography
                                                                        variant="h6"
                                                                        fontWeight="500"
                                                                        sx={{
                                                                            color: '#2e7d32',
                                                                            fontSize: '1.1rem'
                                                                        }}
                                                                    >
                                                                        {item.Exercise?.exercise_name || "Egzersiz"}
                                                                    </Typography>
                                                                    <Chip
                                                                        label="Tamamlandı"
                                                                        color="success"
                                                                        size="small"
                                                                        icon={<CheckCircleIcon/>}
                                                                        sx={{fontWeight: 'medium'}}
                                                                    />
                                                                </Box>
                                                            }
                                                            secondary={
                                                                <React.Fragment>
                                                                    <Box sx={{
                                                                        mt: 1,
                                                                        py: 1,
                                                                        px: 1.5,
                                                                        bgcolor: '#e8f5e9',
                                                                        borderRadius: 1,
                                                                        display: 'flex',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                        <EventIcon sx={{
                                                                            color: '#2e7d32',
                                                                            mr: 1,
                                                                            fontSize: 20
                                                                        }}/>
                                                                        <Typography component="span" variant="body2"
                                                                                    fontWeight="medium" color="#2e7d32">
                                                                            Tamamlanma
                                                                            Tarihi: {new Date(item.updatedAt).toLocaleString('tr-TR')}
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        flexWrap: 'wrap',
                                                                        gap: 0.5,
                                                                        mt: 1.5
                                                                    }}>
                                                                        <Chip
                                                                            size="small"
                                                                            icon={<AccessTimeIcon fontSize="small"/>}
                                                                            label={`Süre: ${item.duration || item.Exercise?.duration || 0} dakika`}
                                                                            sx={{
                                                                                mr: 1,
                                                                                mb: 1,
                                                                                bgcolor: '#e3f2fd',
                                                                                color: '#1565c0',
                                                                                fontWeight: 500
                                                                            }}
                                                                        />

                                                                        {item.Exercise?.calories_burned && (
                                                                            <Chip
                                                                                size="small"
                                                                                icon={<LocalFireDepartmentIcon
                                                                                    fontSize="small"/>}
                                                                                label={`${item.Exercise.calories_burned} kcal`}
                                                                                sx={{
                                                                                    mr: 1,
                                                                                    mb: 1,
                                                                                    bgcolor: '#ffebee',
                                                                                    color: '#c62828',
                                                                                    fontWeight: 500
                                                                                }}
                                                                            />
                                                                        )}

                                                                        {item.Exercise?.difficulty && (
                                                                            <Chip
                                                                                size="small"
                                                                                label={`Zorluk: ${item.Exercise.difficulty}/5`}
                                                                                color={item.Exercise.difficulty > 3 ? "error" : item.Exercise.difficulty > 1 ? "warning" : "success"}
                                                                                variant="outlined"
                                                                                sx={{mr: 1, mb: 1, fontWeight: 500}}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                </React.Fragment>
                                                            }
                                                        />
                                                    </ListItem>
                                                    <Divider variant="inset" component="li"/>
                                                </React.Fragment>
                                            ))}
                                    </List>
                                ) : (
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        py: 6,
                                        px: 3,
                                        bgcolor: '#f8f9fa',
                                        borderRadius: 2,
                                        border: '1px dashed #bdbdbd'
                                    }}>
                                        <EventBusyIcon sx={{fontSize: 60, color: '#bdbdbd', mb: 2}}/>
                                        <Typography variant="h6" color="text.secondary" align="center">
                                            Seçilen tarih aralığında tamamlanmış egzersiz bulunmamaktadır
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" align="center"
                                                    sx={{mt: 1, maxWidth: 600}}>
                                            Danışanınız henüz herhangi bir egzersizi tamamlamamış veya seçtiğiniz tarih
                                            aralığında tamamlanmış egzersiz bulunmuyor. Farklı bir tarih aralığı
                                            seçebilir veya danışanınızın egzersizleri tamamlamasını bekleyebilirsiniz.
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Egzersiz Atama Popup'ı */}
                        <Dialog open={isAssignExerciseDialogOpen} onClose={handleCloseAssignExerciseDialog}>
                            <DialogTitle>Yeni Egzersiz Ata</DialogTitle>
                            <Box component="form" onSubmit={handleAssignExercise}>
                                <DialogContent dividers>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" gutterBottom>Egzersiz Seçin</Typography>
                                            {availableExercisesLoading ? (
                                                <Box sx={{display: 'flex', justifyContent: 'center', py: 2}}>
                                                    <CircularProgress size={24}/>
                                                </Box>
                                            ) : (
                                                <TextField
                                                    select
                                                    name="exercise_id"
                                                    value={assignForm.exercise_id}
                                                    onChange={handleAssignFormChange}
                                                    fullWidth
                                                    required
                                                    size="small"
                                                    placeholder="Egzersiz seçin"
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <FitnessCenterIcon fontSize="small"/>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    sx={{mb: 2}}
                                                >
                                                    <MenuItem value="" disabled>Egzersiz seçin</MenuItem>
                                                    {availableExercises.map((exercise) => (
                                                        <MenuItem key={exercise.id} value={exercise.id}>
                                                            {exercise.exercise_name}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" gutterBottom>Not</Typography>
                                            <TextField
                                                name="note"
                                                value={assignForm.note}
                                                onChange={handleAssignFormChange}
                                                fullWidth
                                                size="small"
                                                placeholder="Not (isteğe bağlı)"
                                                sx={{mb: 2}}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                                                <DatePicker
                                                    label="Başlangıç Tarihi"
                                                    name="start_date"
                                                    value={assignForm.start_date ? new Date(assignForm.start_date) : null}
                                                    onChange={(newValue) => {
                                                        setAssignForm(prev => ({
                                                            ...prev,
                                                            start_date: newValue ? newValue.toISOString().split('T')[0] : ''
                                                        }))
                                                    }}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            required: true,
                                                            size: "small"
                                                        }
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                                                <DatePicker
                                                    label="Bitiş Tarihi"
                                                    name="end_date"
                                                    value={assignForm.end_date ? new Date(assignForm.end_date) : null}
                                                    onChange={(newValue) => {
                                                        setAssignForm(prev => ({
                                                            ...prev,
                                                            end_date: newValue ? newValue.toISOString().split('T')[0] : ''
                                                        }))
                                                    }}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            required: true,
                                                            size: "small"
                                                        }
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </Grid>
                                    </Grid>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleCloseAssignExerciseDialog} color="secondary">
                                        İptal
                                    </Button>
                                    <Button type="submit" variant="contained" color="primary" disabled={assignLoading}>
                                        {assignLoading ? <CircularProgress size={24}/> : "Egzersiz Ata"}
                                    </Button>
                                </DialogActions>
                            </Box>
                        </Dialog>
                    </Box>
                );
            case 'odeme':
                const today = new Date();
                const activeInvoice = clientInvoices.find(inv => {
                    if (!inv.issueDate || !inv.dueDate) return false;
                    const start = new Date(inv.issueDate);
                    const end = new Date(inv.dueDate);
                    return today >= start && today <= end;
                });
                const totalPages = Math.ceil(clientInvoices.length / invoicesPerPage);
                const paginatedInvoices = clientInvoices.slice(
                    (currentInvoicePage - 1) * invoicesPerPage,
                    currentInvoicePage * invoicesPerPage
                );
                return (
                    <Paper elevation={2} sx={{p: 3}}>
                        {/* Aktif Invoice */}
                        {activeInvoice && (
                            <Card elevation={4}
                                  sx={{mb: 3, border: '2px solid', borderColor: 'success.main', background: '#f6fff6'}}>
                                <CardHeader
                                    avatar={<Avatar sx={{bgcolor: 'success.main'}}><ReceiptLongIcon/></Avatar>}
                                    title={<Typography variant="subtitle1"
                                                       sx={{fontWeight: 'bold', color: 'success.main'}}>Aktif
                                        Fatura: {activeInvoice.description || 'Açıklama yok'}</Typography>}
                                    subheader={<Typography variant="body2" color="text.secondary">Fatura
                                        No: {activeInvoice.id}</Typography>}
                                    sx={{
                                        borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#2d4149',
                                        color: 'white',
                                    }}
                                />
                                <CardContent>
                                    <Typography variant="body2" sx={{mb: 1}}>
                                        <strong>Tutar:</strong> {Number(activeInvoice.amount).toLocaleString('tr-TR', {
                                        style: 'currency',
                                        currency: 'TRY'
                                    })}
                                    </Typography>
                                    <Typography variant="body2" sx={{mb: 1}}>
                                        <strong>Düzenleme
                                            Tarihi:</strong> {activeInvoice.issueDate ? new Date(activeInvoice.issueDate).toLocaleDateString('tr-TR') : '-'}
                                    </Typography>
                                    <Typography variant="body2" sx={{mb: 1}}>
                                        <strong>Son Ödeme
                                            Tarihi:</strong> {activeInvoice.dueDate ? new Date(activeInvoice.dueDate).toLocaleDateString('tr-TR') : '-'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}
                        {clientInvoicesLoading ? (
                            <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                                <CircularProgress/>
                            </Box>
                        ) : clientInvoices && clientInvoices.length > 0 ? (
                            <Box>
                                <Grid container spacing={2}>
                                    {paginatedInvoices.map((invoice) => {
                                        let statusColor = 'default';
                                        let statusLabel = '';
                                        if (invoice.status === 'paid') {
                                            statusColor = 'success';
                                            statusLabel = 'Ödendi';
                                        } else if (invoice.status === 'cancelled') {
                                            statusColor = 'error';
                                            statusLabel = 'İptal';
                                        } else {
                                            statusColor = 'warning';
                                            statusLabel = 'Beklemede';
                                        }
                                        return (
                                            <Grid item xs={12} md={6} key={invoice.id}>
                                                <Card elevation={3}>
                                                    <CardHeader
                                                        avatar={<Avatar
                                                            sx={{bgcolor: 'primary.main'}}><ReceiptLongIcon/></Avatar>}
                                                        title={<Typography variant="subtitle1"
                                                                           sx={{fontWeight: 'bold'}}>{invoice.description || 'Açıklama yok'}</Typography>}
                                                        subheader={<Typography variant="body2" color="text.secondary">Fatura
                                                            No: {invoice.id}</Typography>}
                                                        action={<Chip label={statusLabel} color={statusColor}
                                                                      size="small"/>}
                                                        sx={{
                                                            bgcolor: '#2d4149',
                                                            color: 'white',
                                                            borderBottom: '1px solid',
                                                            borderColor: 'divider'
                                                        }}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2" sx={{mb: 1}}>
                                                            <strong>Tutar:</strong> {Number(invoice.amount).toLocaleString('tr-TR', {
                                                            style: 'currency',
                                                            currency: 'TRY'
                                                        })}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{mb: 1}}>
                                                            <strong>Düzenleme
                                                                Tarihi:</strong> {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('tr-TR') : '-'}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{mb: 1}}>
                                                            <strong>Son Ödeme
                                                                Tarihi:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('tr-TR') : '-'}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setCurrentInvoicePage(p => Math.max(1, p - 1))}
                                            disabled={currentInvoicePage === 1}
                                            sx={{mr: 1}}
                                        >
                                            Önceki
                                        </Button>
                                        <Typography variant="body2" sx={{mx: 2, display: 'flex', alignItems: 'center'}}>
                                            Sayfa {currentInvoicePage} / {totalPages}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setCurrentInvoicePage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentInvoicePage === totalPages}
                                        >
                                            Sonraki
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                Henüz ödeme bilgisi bulunmamaktadır.
                            </Typography>
                        )}
                    </Paper>
                );
            default:
                return null;
        }
    };

    const handleAssignFormChange = (e) => {
        const {name, value} = e.target;
        setAssignForm(prev => ({...prev, [name]: value}));
    };

    const handleAssignExercise = async (e) => {
        e.preventDefault();
        setAssignLoading(true);
        try {
            await axios.post(
                config[config.environment].apiUrl + "/exercise/assignExercise",
                {
                    ...assignForm,
                    client_id: id
                },
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }
            );
            setAssignForm({exercise_id: '', start_date: '', end_date: '', note: ''});
            setAssignedExercisesLoading(true);
            const response = await axios.get(
                config[config.environment].apiUrl + "/exercise/getAssignedExercisesByClient",
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                    params: {
                        client_id: id,
                    },
                }
            );
            setAssignedExercises(response.data);
            handleCloseAssignExerciseDialog();
        } catch (err) {
            setErrorMessage(`Egzersiz atama hatası: ${err.message}`);
            setShowErrorPopup(true);
        } finally {
            setAssignLoading(false);
            setAssignedExercisesLoading(false);
        }
    };

    const handleOpenAssignExerciseDialog = () => {
        setIsAssignExerciseDialogOpen(true);
    };

    const handleCloseAssignExerciseDialog = () => {
        setIsAssignExerciseDialogOpen(false);
        setAssignForm({exercise_id: '', start_date: '', end_date: '', note: ''});
    };

    const handleOpenAssignNutritionPlanDialog = () => {
        setIsAssignNutritionPlanDialogOpen(true);
    };

    const handleCloseAssignNutritionPlanDialog = () => {
        setIsAssignNutritionPlanDialogOpen(false);
    };

    const handleNutritionPlanAssignSuccess = async () => {
        // Beslenme planlarını yeniden yükle
        setNutritionPlanLoading(true);
        try {
            const response = await axios.post(
                config[config.environment].apiUrl + "/nutrition/getNutritionAssignmentPlanByClient",
                {
                    client_id: id,
                    range: "all"
                },
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }
            );

            setNutritionPlan(response.data);

            if (response.data && response.data.length > 0) {
                const currentPlanIndex = findCurrentPlan(response.data);
                setSelectedPlanIndex(currentPlanIndex);
            }
        } catch (err) {
            console.error("Beslenme planı yüklenirken hata:", err.message);
        } finally {
            setNutritionPlanLoading(false);
        }
    };

    const handleAddAppointment = async () => {
        try {
            const response = await axios.post(
                config[config.environment].apiUrl + "/appointment/addAppointmentAsDietitian",
                {
                    title: appointmentForm.title,
                    start: appointmentForm.start,
                    end: appointmentForm.end,
                    client_id: id
                },
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }
            );

            setIsAddAppointmentDialogOpen(false);
            setAppointmentForm({title: '', start: '', end: ''});

            setAppointmentsLoading(true);
            const appointmentsResponse = await axios.get(
                config[config.environment].apiUrl + "/appointment/fetchClientAppointmentAsDietitian",
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                    params: {
                        client_id: id,
                    },
                }
            );
            setAppointments(appointmentsResponse.data);
            setAppointmentsLoading(false);

            showSuccessToast("Randevu başarıyla oluşturuldu.");
        } catch (err) {
            setErrorMessage(err.response.data.message);
            setShowErrorPopup(true);
        }
    };

    const fetchExerciseHistory = (startDate, endDate) => {
        if (!id || !startDate || !endDate) return;

        setLoadingExerciseHistory(true);
        axios.get(`${config[config.environment].apiUrl}/exercise/getClientExerciseHistory`, {
            headers: {Authorization: localStorage.getItem("token")},
            params: {
                client_id: id,
                start_date: startDate,
                end_date: endDate
            }
        })
            .then(response => {
                setExerciseHistory(response.data || []);
                setLoadingExerciseHistory(false);
            })
            .catch(error => {
                console.error("Error fetching exercise history:", error);
                setLoadingExerciseHistory(false);
                setExerciseHistory([]);
            });
    };

    const handleHistoryDateChange = (dateType, newValue) => {
        const formattedDate = newValue ? newValue.toISOString().split('T')[0] : '';

        if (dateType === 'start') {
            setHistoryStartDate(formattedDate);
            if (formattedDate && historyEndDate) {
                fetchExerciseHistory(formattedDate, historyEndDate);
            }
        } else {
            setHistoryEndDate(formattedDate);
            if (historyStartDate && formattedDate) {
                fetchExerciseHistory(historyStartDate, formattedDate);
            }
        }
    };

    return (
        <Default>
            <Box sx={{p: 2}}>
                <Grid container spacing={3}>
                    {/* Sol Panel - Danışanın Resmi ve Bilgileri */}
                    <Grid item xs={12} md={2}>
                        <Card elevation={4} sx={{
                            height: '100%',
                            borderRadius: 2,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: 8
                            }
                        }}>
                            <Box sx={{
                                bgcolor: 'primary.main',
                                p: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant="h6" sx={{color: 'white', fontWeight: 'bold'}}>
                                    Danışan Bilgileri
                                </Typography>
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                p: 3,
                                bgcolor: 'background.paper'
                            }}>
                                <Avatar
                                    alt={`${danisan.name} ${danisan.surname}`}
                                    src="/placeholder_client.jpg"
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        mb: 2,
                                        border: '4px solid',
                                        borderColor: 'primary.light',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                        transition: 'transform 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.05)'
                                        }
                                    }}
                                />
                                <Typography variant="h5" sx={{fontWeight: 'bold', mb: 1, textAlign: 'center'}}>
                                    {danisan.name}
                                </Typography>
                                <Divider sx={{width: '100%', my: 2}}/>

                                {/* Danışan Bilgileri - Yeni Tasarım */}
                                <List sx={{width: '100%', p: 0}}>
                                    <ListItem sx={{
                                        py: 1,
                                        px: 0,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{bgcolor: 'primary.light', width: 32, height: 32}}>
                                                <Person fontSize="small"/>
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography variant="body2"
                                                                 color="text.secondary">Cinsiyet</Typography>}
                                            secondary={<Typography variant="body1">{danisan.gender || '-'}</Typography>}
                                        />
                                    </ListItem>

                                    <ListItem sx={{
                                        py: 1,
                                        px: 0,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{bgcolor: 'primary.light', width: 32, height: 32}}>
                                                <Cake fontSize="small"/>
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography variant="body2"
                                                                 color="text.secondary">Yaş</Typography>}
                                            secondary={<Typography variant="body1">{danisan.age || '-'}</Typography>}
                                        />
                                    </ListItem>

                                    <ListItem sx={{
                                        py: 1,
                                        px: 0,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{bgcolor: 'primary.light', width: 32, height: 32}}>
                                                <Email fontSize="small"/>
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography variant="body2"
                                                                 color="text.secondary">E-posta</Typography>}
                                            secondary={<Typography variant="body1"
                                                                   noWrap>{danisan.email || '-'}</Typography>}
                                        />
                                    </ListItem>

                                    <ListItem sx={{
                                        py: 1,
                                        px: 0,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{bgcolor: 'primary.light', width: 32, height: 32}}>
                                                <Phone fontSize="small"/>
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography variant="body2"
                                                                 color="text.secondary">Telefon</Typography>}
                                            secondary={<Typography
                                                variant="body1">{danisan.phoneNumber || '-'}</Typography>}
                                        />
                                    </ListItem>
                                </List>
                                {/* Not Alanı */}
                                <Box
                                    sx={{
                                        width: '100%',
                                        mt: 3,
                                        p: 2,
                                        bgcolor: '#fffde7',
                                        border: '1.5px solid #ffe082',
                                        borderRadius: 2,
                                        minHeight: 80,
                                        boxShadow: '0 2px 8px rgba(255, 224, 130, 0.15)',
                                        fontFamily: 'Caveat, "Comic Sans MS", cursive',
                                        fontSize: 18,
                                        color: '#795548',
                                        backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 23px, #ffe082 24px)',
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                >
                                    <TextField
                                        multiline
                                        minRows={3}
                                        maxRows={8}
                                        fullWidth
                                        variant="standard"
                                        value={clientNote}
                                        onChange={e => setClientNote(e.target.value)}
                                        placeholder="Danışan için notlarınızı buraya yazabilirsiniz..."
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: {
                                                fontFamily: 'Caveat, "Comic Sans MS", cursive',
                                                fontSize: 18,
                                                bgcolor: 'transparent'
                                            }
                                        }}
                                    />
                                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 1}}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => handleSaveClientNote(danisan.id, clientNote)}
                                        >
                                            Kaydet
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>

                    {/* Sağ Panel - Tabs ve içerik */}
                    <Grid item xs={12} md={10}>
                        <Card elevation={4} sx={{borderRadius: 2, overflow: 'hidden'}}>
                            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                                <Tabs
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    variant={isMobile ? "scrollable" : "fullWidth"}
                                    scrollButtons="auto"
                                    allowScrollButtonsMobile
                                    textColor="primary"
                                    indicatorColor="primary"
                                    aria-label="danışan sekmeler"
                                    sx={{
                                        bgcolor: 'background.paper',
                                        '& .MuiTab-root': {
                                            fontWeight: 'medium',
                                            textTransform: 'none',
                                            fontSize: '0.95rem',
                                            py: 1.5
                                        }
                                    }}
                                >
                                    <Tab label="Anamnez" value="anamnez"/>
                                    <Tab label="Ölçümler" value="olcum"/>
                                    <Tab label="Beslenme" value="beslenme"/>
                                    <Tab label="Randevular" value="randevu"/>
                                    <Tab label="Egzersizler" value="egzersiz"/>
                                    <Tab label="Ödemeler" value="odeme"/>
                                </Tabs>
                            </Box>
                            <Box sx={{p: 3, minHeight: '50vh'}}>
                                {renderTabContent()}
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Ölçüm Ekleme Dialog */}
            <Dialog
                open={isMeasurementDialogOpen}
                onClose={handleCloseMeasurementDialog}
                fullWidth
                maxWidth="md"
                scroll="paper"
            >
                <DialogTitle>Yeni Ölçüm Ekle</DialogTitle>
                <Box component="form" onSubmit={handleCreateMeasurement}>
                    <DialogContent dividers sx={{overflowY: 'auto', maxHeight: '70vh'}}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Boy (cm)"
                                    name="boy"
                                    type="number"
                                    fullWidth
                                    value={measurementForm.boy}
                                    onChange={handleMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Kilo (kg)"
                                    name="kilo"
                                    type="number"
                                    fullWidth
                                    value={measurementForm.kilo}
                                    onChange={handleMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Bel Çevresi"
                                    name="bel"
                                    type="number"
                                    fullWidth
                                    value={measurementForm.bel}
                                    onChange={handleMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Bel Çevresi"
                                    name="digerbel"
                                    type="number"
                                    fullWidth
                                    value={measurementForm.digerbel}
                                    onChange={handleMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Kalça Çevresi"
                                    name="kalca"
                                    type="number"
                                    fullWidth
                                    value={measurementForm.kalca}
                                    onChange={handleMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Göğüs Çevresi"
                                    name="gogus"
                                    type="number"
                                    fullWidth
                                    value={measurementForm.gogus}
                                    onChange={handleMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Kol Çevresi"
                                    name="kol"
                                    type="number"
                                    fullWidth
                                    value={measurementForm.kol}
                                    onChange={handleMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Bacak Çevresi"
                                    name="bacak"
                                    type="number"
                                    fullWidth
                                    value={measurementForm.bacak}
                                    onChange={handleMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Yağ Oranı"
                                    name="yag"
                                    type="number"
                                    fullWidth
                                    value={measurementForm.yag}
                                    onChange={handleMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Kas Oranı"
                                    name="kas"
                                    type="number"
                                    fullWidth
                                    value={measurementForm.kas}
                                    onChange={handleMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Su Oranı"
                                    name="su"
                                    type="number"
                                    fullWidth
                                    value={measurementForm.su}
                                    onChange={handleMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseMeasurementDialog}>
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={createMeasurementLoading}
                        >
                            {createMeasurementLoading ? <CircularProgress size={24}/> : "Ölçüm Ekle"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* Ölçüm Düzenleme Dialog */}
            <Dialog open={isEditMeasurementDialogOpen} onClose={handleCloseEditMeasurementDialog} fullWidth
                    maxWidth="md">
                <DialogTitle>Ölçüm Düzenle</DialogTitle>
                <Box component="form" onSubmit={handleUpdateMeasurement}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Boy (cm)"
                                    name="boy"
                                    type="number"
                                    fullWidth
                                    value={editMeasurementForm.boy}
                                    onChange={handleEditMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Kilo (kg)"
                                    name="kilo"
                                    type="number"
                                    fullWidth
                                    value={editMeasurementForm.kilo}
                                    onChange={handleEditMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Bel Çevresi"
                                    name="bel"
                                    type="number"
                                    fullWidth
                                    value={editMeasurementForm.bel}
                                    onChange={handleEditMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Bel Çevresi"
                                    name="digerbel"
                                    type="number"
                                    fullWidth
                                    value={editMeasurementForm.digerbel}
                                    onChange={handleEditMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Kalça Çevresi"
                                    name="kalca"
                                    type="number"
                                    fullWidth
                                    value={editMeasurementForm.kalca}
                                    onChange={handleEditMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Göğüs Çevresi"
                                    name="gogus"
                                    type="number"
                                    fullWidth
                                    value={editMeasurementForm.gogus}
                                    onChange={handleEditMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Kol Çevresi"
                                    name="kol"
                                    type="number"
                                    fullWidth
                                    value={editMeasurementForm.kol}
                                    onChange={handleEditMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Bacak Çevresi"
                                    name="bacak"
                                    type="number"
                                    fullWidth
                                    value={editMeasurementForm.bacak}
                                    onChange={handleEditMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Yağ Oranı"
                                    name="yag"
                                    type="number"
                                    fullWidth
                                    value={editMeasurementForm.yag}
                                    onChange={handleEditMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Kas Oranı"
                                    name="kas"
                                    type="number"
                                    fullWidth
                                    value={editMeasurementForm.kas}
                                    onChange={handleEditMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Su Oranı"
                                    name="su"
                                    type="number"
                                    fullWidth
                                    value={editMeasurementForm.su}
                                    onChange={handleEditMeasurementFormChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditMeasurementDialog}>
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={updateMeasurementLoading}
                        >
                            {updateMeasurementLoading ? <CircularProgress size={24}/> : "Güncelle"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog
                open={deleteConfirmDialogOpen}
                onClose={() => setDeleteConfirmDialogOpen(false)}
                aria-labelledby="delete-appointment-dialog-title"
                aria-describedby="delete-appointment-dialog-description"
            >
                <DialogTitle id="delete-appointment-dialog-title">
                    {"Randevu Silme Onayı"}
                </DialogTitle>
                <DialogContent>
                    <Typography id="delete-appointment-dialog-description">
                        {`${appointmentToDelete?.title} randevusunu silmek istediğinizden emin misiniz?`}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteConfirmDialogOpen(false)}
                        color="primary"
                    >
                        İptal
                    </Button>
                    <Button
                        onClick={handleDeleteAppointment}
                        color="error"
                        autoFocus
                    >
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Ölçüm Silme Onayı Dialog */}
            <Dialog
                open={isDeleteMeasurementDialogOpen}
                onClose={handleCloseDeleteMeasurementDialog}
                aria-labelledby="delete-measurement-dialog-title"
                aria-describedby="delete-measurement-dialog-description"
            >
                <DialogTitle id="delete-measurement-dialog-title">
                    Ölçüm Silme Onayı
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {measurementToDelete &&
                            `${new Date(measurementToDelete.createdAt).toLocaleDateString('tr-TR')} tarihli ölçümü silmek istediğinizden emin misiniz?`}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteMeasurementDialog}>İptal</Button>
                    <Button onClick={() => deleteMeasurement(measurementToDelete)} color="error">
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Anamnez Düzenleme Dialugu */}
            <Dialog
                open={isAnamnezDialogOpen}
                onClose={() => setIsAnamnezDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Anamnez Bilgilerini Düzenle
                    <IconButton
                        style={{position: 'absolute', right: 8, top: 8}}
                        onClick={() => setIsAnamnezDialogOpen(false)}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{mb: 3}}>
                        <Typography variant="h6" gutterBottom>Sağlık Bilgileri</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Kronik Hastalıklar"
                                    value={anamnezForm.saglik_bilgileri?.kronik_hastaliklar || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('saglik_bilgileri', 'kronik_hastaliklar', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Alerjiler"
                                    value={anamnezForm.saglik_bilgileri?.alerjiler || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('saglik_bilgileri', 'alerjiler', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="İlaç Kullanımı"
                                    value={anamnezForm.saglik_bilgileri?.ilac_kullanimi || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('saglik_bilgileri', 'ilac_kullanimi', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Geçmiş Ameliyatlar"
                                    value={anamnezForm.saglik_bilgileri?.gecmis_ameliyatlar || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('saglik_bilgileri', 'gecmis_ameliyatlar', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Aile Sağlık Geçmişi"
                                    value={anamnezForm.saglik_bilgileri?.aile_saglik_gecmisi || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('saglik_bilgileri', 'aile_saglik_gecmisi', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Uyku Düzeni"
                                    value={anamnezForm.saglik_bilgileri?.uyku || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('saglik_bilgileri', 'uyku', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{mb: 3}}>
                        <Typography variant="h6" gutterBottom>Diyet Alışkanlıkları</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Günlük Su Tüketimi"
                                    value={anamnezForm.diyet_aliskanliklari?.gunluk_su_tuketimi || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('diyet_aliskanliklari', 'gunluk_su_tuketimi', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Öğün Düzeni"
                                    value={anamnezForm.diyet_aliskanliklari?.ogun_duzeni || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('diyet_aliskanliklari', 'ogun_duzeni', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Favori Yiyecekler"
                                    value={anamnezForm.diyet_aliskanliklari?.favori_yiyecekler || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('diyet_aliskanliklari', 'favori_yiyecekler', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Sevmediği Yiyecekler"
                                    value={anamnezForm.diyet_aliskanliklari?.sevilmeyen_yiyecekler || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('diyet_aliskanliklari', 'sevilmeyen_yiyecekler', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Atıştırmalık Alışkanlıkları"
                                    value={anamnezForm.diyet_aliskanliklari?.atistirmalik_aliskanliklari || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('diyet_aliskanliklari', 'atistirmalik_aliskanliklari', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Dışarıda Yemek"
                                    value={anamnezForm.diyet_aliskanliklari?.disarida_yemek || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('diyet_aliskanliklari', 'disarida_yemek', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{mb: 3}}>
                        <Typography variant="h6" gutterBottom>Fiziksel Aktivite</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Aktivite Seviyesi"
                                    value={anamnezForm.fiziksel_aktivite?.aktivite_seviyesi || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('fiziksel_aktivite', 'aktivite_seviyesi', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Egzersiz Alışkanlıkları"
                                    value={anamnezForm.fiziksel_aktivite?.egzersiz_aliskanliklari || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('fiziksel_aktivite', 'egzersiz_aliskanliklari', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Sevdiği Sporlar"
                                    value={anamnezForm.fiziksel_aktivite?.sevdigi_sporlar || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('fiziksel_aktivite', 'sevdigi_sporlar', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Mesleği ve Aktivite Durumu"
                                    value={anamnezForm.fiziksel_aktivite?.meslek_ve_aktivite_durumu || ''}
                                    onChange={(e) => handleNestedAnamnezFormChange('fiziksel_aktivite', 'meslek_ve_aktivite_durumu', e.target.value)}
                                    margin="normal"
                                    multiline
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Box>
                        <Typography variant="h6" gutterBottom>Özel Notlar</Typography>
                        <TextField
                            fullWidth
                            multiline
                            name="ozel_notlar"
                            value={anamnezForm.ozel_notlar || ''}
                            onChange={handleAnamnezFormChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAnamnezDialogOpen(false)} color="inherit">
                        İptal
                    </Button>
                    <Button
                        onClick={handleSaveAnamnez}
                        variant="contained"
                        color="primary"
                    >
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Resim büyütme modalı */}
            <Dialog
                open={imageModalOpen}
                onClose={handleCloseImageModal}
                maxWidth="md"
                fullWidth
            >
                <DialogContent sx={{p: 1, textAlign: 'center'}}>
                    {selectedImage && (
                        <Box
                            component="img"
                            src={selectedImage}
                            alt="Yemek görseli"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseImageModal} color="primary">
                        Kapat
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Beslenme Planı Atama Modal */}
            <NutritionPlanAssignModal
                open={isAssignNutritionPlanDialogOpen}
                onClose={handleCloseAssignNutritionPlanDialog}
                clientId={id}
                onSuccess={handleNutritionPlanAssignSuccess}
            />
        </Default>
    );
}

export default React.memo(Danisan);

