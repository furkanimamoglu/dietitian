import React, { useEffect, useState, useMemo } from 'react';
import './Danisan.css';
import Default from "../../Components/Layouts/Default.jsx";
import axios from "axios";
import config from "../../config.js";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box, 
  Typography, 
  Avatar, 
  Divider, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ErrorIcon from "@mui/icons-material/Error";

function Danisan() {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);

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

    const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);
    const [appointmentForm, setAppointmentForm] = useState({ title: '', start: '', end: '' });

    // Ölçümler için state
    const [measurements, setMeasurements] = useState([]);
    const [measurementsLoading, setMeasurementsLoading] = useState(false);

    // Success popup states
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Error popup states
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

            // Başarılı silme sonrası state'i güncelle
            setAppointments(prevAppointments =>
                prevAppointments.filter(appointment => appointment.id !== appointmentToDelete.id)
            );

            // Dialogu kapat
            setDeleteConfirmDialogOpen(false);

            // Başarı mesajını göster
            setSuccessMessage("Randevu başarıyla silindi.");
            setShowSuccessPopup(true);
        } catch (error) {
            // Hata durumunda hata mesajını göster
            setErrorMessage(error.response?.data?.message || "Randevu silinirken bir hata oluştu.");
            setShowErrorPopup(true);
        } finally {
            // Silme işlemi sonrası state'i temizle
            setAppointmentToDelete(null);
        }
    };

    // Auto-hide success popup after 3 seconds
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

    // Danisan.jsx içerisinde state tanımlamalarını ekleyin (diğer state'lerin yanına)
    const [measurementForm, setMeasurementForm] = useState({
        boy: '',
        kilo: '',
        bel: '',
        kalca: '',
        gogus: '',
        yag: '',
        kas: '',
        su: ''
    });
    const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);
    const [createMeasurementLoading, setCreateMeasurementLoading] = useState(false);

    const handleMeasurementFormChange = (e) => {
        const { name, value } = e.target;
        setMeasurementForm(prev => ({ ...prev, [name]: value }));
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
            yag: '',
            kas: '',
            su: ''
        });
    };

    const handleCreateMeasurement = async (e) => {
        e.preventDefault();

        // Yüzde toplamı kontrolü
        const yag = parseFloat(measurementForm.yag) || 0;
        const kas = parseFloat(measurementForm.kas) || 0;
        const su = parseFloat(measurementForm.su) || 0;
        const toplam = yag + kas + su;
        if (yag > 100 || kas > 100 || su > 100 || toplam > 100) {
            setErrorMessage("Yağ, kas ve su yüzdelerinin toplamı %100'ü geçemez.");
            setShowErrorPopup(true);
            return;
        }
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

            setSuccessMessage("Yeni ölçüm başarıyla eklendi.");
            setShowSuccessPopup(true);

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
        kalca: '',
        gogus: '',
        yag: '',
        kas: '',
        su: ''
    });
    const [selectedMeasurementId, setSelectedMeasurementId] = useState(null);
    const [updateMeasurementLoading, setUpdateMeasurementLoading] = useState(false);

    const handleEditMeasurementFormChange = (e) => {
        const { name, value } = e.target;
        setEditMeasurementForm(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenEditMeasurementDialog = (measurement) => {
        setSelectedMeasurementId(measurement.id);
        setEditMeasurementForm({
            boy: measurement.boy || '',
            kilo: measurement.kilo || '',
            bel: measurement.bel || '',
            kalca: measurement.kalca || '',
            gogus: measurement.gogus || '',
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

        // Yüzde toplamı kontrolü
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

            // Ölçümleri güncellemek için yeniden çek
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

            setSuccessMessage("Ölçüm başarıyla güncellendi.");
            setShowSuccessPopup(true);

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

        // Sadece tarihleri karşılaştırmak için saat, dakika, saniyeyi sıfırlayalım
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        return today >= startDate && today <= endDate;
    };

    const calculateBMI = useMemo(() => {
        if (!measurements || measurements.length === 0) return null;
        if (!danisan?.boy || !measurements[0]?.kilo) return null;

        const heightInM = danisan.boy / 100;
        const bmi = (measurements[0].kilo / (heightInM * heightInM)).toFixed(1);

        // BMI kategorisi belirleme
        let category = '';
        let color = '';

        if (bmi < 18.5) {
            category = 'Zayıf';
            color = 'info.main'; // Mavi
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Normal Kilo';
            color = 'success.main'; // Yeşil
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Fazla Kilolu';
            color = 'warning.main'; // Sarı
        } else if (bmi >= 30 && bmi < 35) {
            category = 'Hafif Obez';
            color = 'orange'; // Turuncu
        } else {
            category = 'Obez';
            color = 'error.main'; // Kırmızı
        }

        return { value: bmi, category, color };
    }, [measurements, danisan]);

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

                const {
                    name,
                    surname,
                    email,
                    phoneNumber,
                    gender,
                    boy,
                    weight,
                    status,
                    birthDate,
                    job,
                    maritalStatus,
                    city,
                } = response.data;

                setDanisan({
                    name,
                    surname,
                    email,
                    phoneNumber,
                    gender,
                    boy,
                    weight,
                    status,
                    birthDate: birthDate || '-',
                    job: job || '-',
                    maritalStatus: maritalStatus || '-',
                    city: city || '-',
                });
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
                        config[config.environment].apiUrl + "/dietitian/getNutritionAssignmentPlanByClient",
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

    if (isLoading) {
        return (
            <Default>
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Skeleton variant="rectangular" height={200} />
                    <Skeleton variant="text" height={50} width="40%" />
                    <Skeleton variant="text" height={30} width="60%" />
                    <Skeleton variant="text" height={30} width="70%" />
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

    const renderMealItems = (mealItems) => {
        if (!mealItems) return "Öğün girilmemiş.";

        if (Array.isArray(mealItems) && mealItems.length > 0 && mealItems[0].hasOwnProperty('isim')) {
            return (
                <>
                    {mealItems.map((item, index) => (
                        <Typography
                            key={index}
                            variant="body2"
                            component="div"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: index < mealItems.length - 1 ? 0.5 : 0,
                                ...(item.yenildi ? { textDecoration: 'line-through', color: 'text.secondary' } : {})
                            }}
                        >
                            {item.yenildi ?
                                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} /> :
                                <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                            }
                            {item.isim}
                        </Typography>
                    ))}
                </>
            );
        }

        if (typeof mealItems === 'string') {
            return mealItems;
        }

        if (Array.isArray(mealItems)) {
            return mealItems.join(", ");
        }

        if (mealItems.main && Array.isArray(mealItems.main)) {
            const mainItems = mealItems.main.join(", ");

            if (mealItems.alternatives && Object.keys(mealItems.alternatives).length > 0) {
                let alternativesText = [];

                for (const [mainItem, alternatives] of Object.entries(mealItems.alternatives)) {
                    if (alternatives && alternatives.length > 0) {
                        alternativesText.push(`${mainItem} yerine: ${alternatives.join(", ")}`);
                    }
                }

                if (alternativesText.length > 0) {
                    return (
                        <>
                            <Typography variant="body2" component="div">{mainItems}</Typography>
                            <Typography variant="body2" component="div" color="text.secondary" sx={{ fontSize: '0.85rem', fontStyle: 'italic', mt: 0.5 }}>
                                {alternativesText.join("; ")}
                            </Typography>
                        </>
                    );
                }
            }

            return mainItems;
        }

        return "Öğün formatı tanınmıyor.";
    };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'anamnez':
                return (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setSuccessMessage(`Anamnez başarıyla eklendi.`);
                                    setShowSuccessPopup(true);
                                }}
                            >
                                Yeni Anamnez
                            </Button>
                        </Box>

                        {/* Sağlık Bilgileri Akordiyonu */}
                        <Accordion elevation={3} sx={{ mb: 2 }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText',
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        Sağlık Bilgileri
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            label="Son Güncelleme: 15.05.2023"
                                            size="small"
                                            color="primary"
                                            sx={{ mr: 1 }}
                                        />
                                        <Button
                                            component="span"
                                            variant="contained"
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => {}}
                                            color="primary"
                                            sx={{ fontWeight: 'bold', color: 'white', boxShadow: 1 }}
                                        >
                                            Düzenle
                                        </Button>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Kronik Hastalıklar"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    <Chip label="Hipertansiyon" size="small" color="primary" variant="outlined" />
                                                    <Chip label="Tip 2 Diyabet" size="small" color="primary" variant="outlined" />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Alerjiler"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Laktoz intoleransı, Fındık alerjisi
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="İlaç Kullanımı"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Metformin 500mg (günde 2 kez)
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Geçmiş Ameliyatlar"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Apendektomi (2015)
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Aile Sağlık Geçmişi"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Anne: Hipertansiyon<br />
                                                    Baba: Kalp hastalığı
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Kan Değerleri"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Son kontrol: 10.04.2023<br />
                                                    HbA1c: 6.8%<br />
                                                    Kolesterol: 210 mg/dL
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        {/* Kan Tahlili Akordiyonu */}
                        <Accordion elevation={3} sx={{ mb: 2 }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    bgcolor: 'error.light',
                                    color: 'error.contrastText',
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        Kan Tahlili
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            label="Son Güncelleme: 10.05.2023"
                                            size="small"
                                            color="error"
                                            sx={{ mr: 1, fontWeight: 'bold' }}
                                        />
                                        <Button
                                            component="span"
                                            variant="contained"
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => {}}
                                            color="error"
                                            sx={{ fontWeight: 'bold', color: 'white', boxShadow: 1 }}
                                        >
                                            Düzenle
                                        </Button>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
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
                                        Henüz kan tahlili bilgisi eklenmemiş.
                                    </Typography>
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        {/* Diyet Alışkanlıkları Akordiyonu */}
                        <Accordion elevation={3} sx={{ mb: 2 }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    bgcolor: 'warning.light',
                                    color: 'warning.contrastText',
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        Diyet Alışkanlıkları
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            label="Son Güncelleme: 12.05.2023"
                                            size="small"
                                            color="warning"
                                            sx={{ mr: 1 }}
                                        />
                                        <Button
                                            component="span"
                                            variant="contained"
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => {}}
                                            color="warning"
                                            sx={{ fontWeight: 'bold', color: 'white', boxShadow: 1 }}
                                        >
                                            Düzenle
                                        </Button>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Günlük Su Tüketimi"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    4-5 bardak (yetersiz)
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Öğün Düzeni"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Sabah: Genellikle atlanıyor<br />
                                                    Öğle: Hafif yemek<br />
                                                    Akşam: Ağır ve geç yemek
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Favori Yiyecekler"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Makarna, beyaz ekmek, şekerli içecekler
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Sevmediği Yiyecekler"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Brokoli, karnabahar, ıspanak
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Atıştırmalık Alışkanlıkları"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Akşam TV izlerken tatlı ve cips tüketimi
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Dışarıda Yemek"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Haftada 3-4 kez fast-food tüketimi
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* Fiziksel Aktivite Akordiyonu */}
                        <Accordion elevation={3} sx={{ mb: 2 }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    bgcolor: 'info.light',
                                    color: 'info.contrastText',
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        Fiziksel Aktivite
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            label="Son Güncelleme: 10.05.2023"
                                            size="small"
                                            color="info"
                                            sx={{ mr: 1 }}
                                        />
                                        <Button
                                            component="span"
                                            variant="contained"
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => {}}
                                            color="info"
                                            sx={{ fontWeight: 'bold', color: 'white', boxShadow: 1 }}
                                        >
                                            Düzenle
                                        </Button>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Aktivite Seviyesi"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Sedanter (masa başı çalışma)
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Egzersiz Alışkanlıkları"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Haftada 1 kez yürüyüş (30 dakika)
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Sevdiği Sporlar"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Yüzme, bisiklet
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Mesleği ve Aktivite Durumu"
                                                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                                                sx={{ bgcolor: 'grey.100', py: 1 }}
                                            />
                                            <CardContent>
                                                <Typography variant="body2">
                                                    Yazılım Geliştirici (8+ saat oturarak çalışma)
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* Uyku ve Stres Yönetimi */}
                        <Accordion elevation={3} sx={{ mb: 2 }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    bgcolor: 'success.light',
                                    color: 'success.contrastText',
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        Uyku ve Stres Yönetimi
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            label="Son Güncelleme: 10.05.2023"
                                            size="small"
                                            color="success"
                                            sx={{ mr: 1, fontWeight: 'bold' }}
                                        />
                                        <Button
                                            component="span"
                                            variant="contained"
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => {}}
                                            color="success"
                                            sx={{ fontWeight: 'bold', color: 'white', boxShadow: 1 }}
                                        >
                                            Düzenle
                                        </Button>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
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
                                        Henüz uyku ve stres bilgisi eklenmemiş.
                                    </Typography>
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        {/* Özel Notlar */}
                        <Accordion elevation={3}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    bgcolor: '#7c4dff',
                                    color: '#fff',
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        Özel Notlar
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            label="Son Güncelleme: 10.05.2023"
                                            size="small"
                                            sx={{ mr: 1, fontWeight: 'bold', bgcolor: '#9575cd', color: '#fff' }}
                                        />
                                        <Button
                                            component="span"
                                            variant="contained"
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => {}}
                                            sx={{ fontWeight: 'bold', color: 'white', boxShadow: 1, bgcolor: '#9575cd', '&:hover': { bgcolor: '#5e35b1' } }}
                                        >
                                            Düzenle
                                        </Button>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="body2">
                                        Danışan iş hayatında yoğun stres yaşıyor. Akşamları geç saatlerde yemek yeme alışkanlığı var.
                                        Diyetisyen randevularına düzenli geliyor ancak beslenme planına uyumda zaman zaman zorluklar yaşıyor.
                                        Hafta sonları sosyal hayatında beslenme düzenini korumakta zorlanıyor.
                                    </Typography>
                                </Paper>
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                );
            case 'olcum':
                return (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card elevation={3} sx={{ height: '100%' }}>
                                    <CardHeader
                                        title="Vücut Ölçümleri"
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        action={
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    color="primary"
                                                    startIcon={<AddIcon />}
                                                    onClick={handleOpenMeasurementDialog}
                                                >
                                                    Yeni Ölçüm
                                                </Button>
                                            </Box>
                                        }
                                        sx={{
                                            bgcolor: 'primary.light',
                                            color: 'primary.contrastText',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1,
                                            '&::-webkit-scrollbar': { background: '#e8f5e9', width: 8 },
                                            '&::-webkit-scrollbar-thumb': { background: '#81c784', borderRadius: 4 },
                                            scrollbarColor: '#81c784 #e8f5e9',
                                            scrollbarWidth: 'thin'
                                        }}>
                                            <TableContainer component={Paper} sx={{ mb: 4, mt: 2 }}>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Tarih</TableCell>
                                                            <TableCell align="right">Boy (cm)</TableCell>
                                                            <TableCell align="right">Kilo (kg)</TableCell>
                                                            <TableCell align="right">Bel (cm)</TableCell>
                                                            <TableCell align="right">Kalça (cm)</TableCell>
                                                            <TableCell align="right">Göğüs (cm)</TableCell>
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
                                                                <TableCell align="right">{measurement.boy || '-'}</TableCell>
                                                                <TableCell align="right">{measurement.kilo || '-'}</TableCell>
                                                                <TableCell align="right">{measurement.bel || '-'}</TableCell>
                                                                <TableCell align="right">{measurement.kalca || '-'}</TableCell>
                                                                <TableCell align="right">{measurement.gogus || '-'}</TableCell>
                                                                <TableCell align="right">{measurement.yag || '-'}</TableCell>
                                                                <TableCell align="right">{measurement.kas || '-'}</TableCell>
                                                                <TableCell align="right">{measurement.su || '-'}</TableCell>
                                                                <TableCell align="center">
                                                                    <IconButton
                                                                        color="primary"
                                                                        size="small"
                                                                        onClick={() => handleOpenEditMeasurementDialog(measurement)}
                                                                    >
                                                                        <EditIcon />
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
                            <Grid item xs={12} md={6}>
                                <Card elevation={3} sx={{ height: '100%' }}>
                                    <CardHeader
                                        title="Vücut Analizi"
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        sx={{
                                            bgcolor: 'primary.light',
                                            color: 'primary.contrastText',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {measurements && measurements.length > 0 ? (
                                                <>
                                                    <Box>
                                                        <Typography variant="subtitle1" gutterBottom>Vücut Yağ Oranı</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', height: 10, borderRadius: 5 }}>
                                                                <Box
                                                                    sx={{
                                                                        width: `${measurements[0].yag || 0}%`,
                                                                        bgcolor: theme.palette.primary.main,
                                                                        height: '100%',
                                                                        borderRadius: 5
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography variant="body2">{measurements[0].yag || 0}%</Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Hedef: 25-28% | Standart: 25-31%
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" gutterBottom>Kas Kütlesi</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', height: 10, borderRadius: 5 }}>
                                                                <Box
                                                                    sx={{
                                                                        width: `${measurements[0].kas || 0}%`,
                                                                        bgcolor: theme.palette.info.main,
                                                                        height: '100%',
                                                                        borderRadius: 5
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography variant="body2">{measurements[0].kas || 0}%</Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Hedef: 30-35% | Standart: 30-35%
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" gutterBottom>Vücut Suyu</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', height: 10, borderRadius: 5 }}>
                                                                <Box
                                                                    sx={{
                                                                        width: `${measurements[0].su || 0}%`,
                                                                        bgcolor: theme.palette.info.light,
                                                                        height: '100%',
                                                                        borderRadius: 5
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography variant="body2">{measurements[0].su || 0}%</Typography>
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Hedef: 45-60% | Standart: 45-60%
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" gutterBottom>BMI</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', height: 10, borderRadius: 5 }}>
                                                                <Box
                                                                    sx={{
                                                                        width: '80%',
                                                                        bgcolor: calculateBMI?.color || theme.palette.warning.main,
                                                                        height: '100%',
                                                                        borderRadius: 5
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Typography variant="body2">{calculateBMI?.value || '-'}</Typography>
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
                        </Box>

                        {nutritionPlanLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={2}>
                                        <Skeleton variant="rectangular" height={400} animation="wave" />
                                    </Grid>
                                    <Grid item xs={12} md={10}>
                                        <Skeleton variant="rectangular" height={80} animation="wave" sx={{ mb: 2 }} />
                                        <Skeleton variant="rectangular" height={320} animation="wave" />
                                    </Grid>
                                </Grid>
                            </Box>
                        ) : (
                            <Paper elevation={3} sx={{ mb: 3 }}>
                                <Box sx={{
                                    p: 2,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    borderTopLeftRadius: 4,
                                    borderTopRightRadius: 4,
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {nutritionPlan && nutritionPlan.length > 0
                                            ? nutritionPlan[selectedPlanIndex]?.note || "İsim Girilmemiş Plan"
                                            : "İsim Girilmemiş Plan"}
                                    </Typography>
                                </Box>

                                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                                    <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 1 }} />
                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                        İşaretli ve üzeri çizili öğeler, danışanın mobil uygulamada yedim olarak işaretlediği öğünlerdir.
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box sx={{ overflowX: 'auto' }}>
                                    <Box sx={{ minWidth: 900, p: 2 }}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={2}>
                                                <Box sx={{ textAlign: 'center', p: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Öğün</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Grid container>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Pzt</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Sal</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Çar</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Per</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Cum</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Cmt</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Box sx={{ textAlign: 'center', p: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Paz</Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 1 }} />

                                        {/* Kahvaltı */}
                                        <Grid container spacing={1}>
                                            <Grid item xs={2}>
                                                <Box sx={{
                                                    bgcolor: 'primary.light',
                                                    color: 'primary.contrastText',
                                                    p: 1,
                                                    borderRadius: 1,
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Kahvaltı</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazartesi?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Salı?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Çarşamba?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Perşembe?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cuma?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cumartesi?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazar?.Kahvaltı)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 1 }} />

                                        {/* Öğle Yemeği */}
                                        <Grid container spacing={1}>
                                            <Grid item xs={2}>
                                                <Box sx={{
                                                    bgcolor: 'warning.light',
                                                    color: 'warning.contrastText',
                                                    p: 1,
                                                    borderRadius: 1,
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Öğle</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazartesi?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Salı?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Çarşamba?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Perşembe?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cuma?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cumartesi?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazar?.["Öğle Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 1 }} />

                                        {/* Akşam Yemeği */}
                                        <Grid container spacing={1}>
                                            <Grid item xs={2}>
                                                <Box sx={{
                                                    bgcolor: 'error.light',
                                                    color: 'error.contrastText',
                                                    p: 1,
                                                    borderRadius: 1,
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Akşam</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazartesi?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Salı?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Çarşamba?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Perşembe?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cuma?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cumartesi?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazar?.["Akşam Yemeği"])
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 1 }} />

                                        {/* Ara Öğün */}
                                        <Grid container spacing={1}>
                                            <Grid item xs={2}>
                                                <Box sx={{
                                                    bgcolor: 'info.light',
                                                    color: 'info.contrastText',
                                                    p: 1,
                                                    borderRadius: 1,
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Ara Öğün</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazartesi?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Salı?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Çarşamba?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Perşembe?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cuma?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Cumartesi?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={1.7}>
                                                        <Paper elevation={1} sx={{ p: 1, height: '100%' }}>
                                                            {nutritionPlan && nutritionPlan.length > 0
                                                                ? renderMealItems(nutritionPlan[selectedPlanIndex]?.mealPlan?.Pazar?.Aparatif)
                                                                : <Typography variant="body2">Öğün girilmemiş.</Typography>
                                                            }
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                                <Divider />
                            </Paper>
                        )}

                        <Card elevation={3} sx={{ mb: 3 }}>
                            <CardHeader
                                title="Atanmış Planlar"
                                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                sx={{
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider'
                                }}
                            />
                            <List>
                                {nutritionPlanLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : nutritionPlan && nutritionPlan.length > 0 ? (
                                    nutritionPlan.map((plan, index) => {
                                        // Calculate how many meals have been eaten in this plan
                                        let totalMeals = 0;
                                        let eatenMeals = 0;

                                        if (plan.mealPlan) {
                                            Object.keys(plan.mealPlan).forEach(day => {
                                                if (plan.mealPlan[day]) {
                                                    Object.keys(plan.mealPlan[day]).forEach(mealType => {
                                                        const meals = plan.mealPlan[day][mealType];
                                                        if (Array.isArray(meals) && meals.length > 0) {
                                                            if (meals[0].hasOwnProperty('isim')) {
                                                                // New format with isim and yenildi
                                                                totalMeals += meals.length;
                                                                eatenMeals += meals.filter(meal => meal.yenildi).length;
                                                            } else {
                                                                // Old format
                                                                totalMeals += meals.length;
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        }

                                        return (
                                            <React.Fragment key={plan.id || index}>
                                                <ListItem
                                                    onClick={() => setSelectedPlanIndex(index)}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        bgcolor: selectedPlanIndex === index ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0, 0, 0, 0.08)'
                                                        }
                                                    }}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                            <EventIcon />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                                {plan.note || "Beslenme Planı"}
                                                                {isActivePlan(plan) && (
                                                                    <Chip
                                                                        label="Aktif Plan"
                                                                        size="small"
                                                                        color="success"
                                                                        sx={{ ml: 1 }}
                                                                    />
                                                                )}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <>
                                                                <Typography variant="body2" component="span">
                                                                    {plan.start_date && plan.end_date
                                                                        ? `${new Date(plan.start_date).toLocaleDateString('tr-TR')} - ${new Date(plan.end_date).toLocaleDateString('tr-TR')}`
                                                                        : "Tarih belirtilmemiş"}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" display="block">
                                                                    Not: {plan.note || "Not eklenmemiş"}
                                                                </Typography>
                                                                {totalMeals > 0 && (
                                                                    <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                                                                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                                                                        {eatenMeals} / {totalMeals} öğün tüketildi
                                                                    </Typography>
                                                                )}
                                                            </>
                                                        }
                                                    />
                                                </ListItem>
                                                {index < nutritionPlan.length - 1 && (
                                                    <Divider variant="inset" component="li" />
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <ListItem>
                                        <ListItemText
                                            primary="Atanmış beslenme planı bulunamadı"
                                            secondary="Danışana henüz bir beslenme planı atanmamış"
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </Card>
                    </Box>
                );
            case 'randevu':
                const now = new Date();
                const upcomingAppointments = appointments.filter(app =>
                    ['pending', 'approved'].includes(app.status) &&
                    new Date(app.start) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) &&
                    new Date(app.start) > now
                );
                const pastAppointments = appointments.filter(app =>
                    (app.status !== 'pending') ||
                    (app.status !== 'canceled') ||
                    (new Date(app.start) <= now)
                );
                return (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6"></Typography>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => setIsAddAppointmentDialogOpen(true)}
                                sx={{ bgcolor: theme.palette.primary.main }}
                            >
                                Yeni Randevu
                            </Button>
                        </Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={7}>
                                {/* Yaklaşan Randevular */}
                                <Card elevation={3} sx={{ mb: 3 }}>
                                    <CardHeader
                                        title="Yaklaşan Randevular"
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        sx={{
                                            bgcolor: 'primary.light',
                                            color: 'primary.contrastText',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    {appointmentsLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : upcomingAppointments.length > 0 ? (
                                        <List>
                                            {upcomingAppointments.map(app => (
                                                <ListItem
                                                    key={app.id}
                                                    secondaryAction={
                                                        <Box>
                                                            <IconButton color="error" onClick={() => handleDeleteAppointmentConfirmation(app)} edge="end" aria-label="delete">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Box>
                                                    }
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                            <EventIcon />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                                    {app.title || 'Randevu'}
                                                                </Typography>
                                                                <Chip
                                                                    label={app.status === 'pending' ? 'Yaklaşan' : app.status}
                                                                    size="small"
                                                                    color="info"
                                                                    sx={{ ml: 1 }}
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box>
                                                                <Typography variant="body2" component="span">
                                                                    {app.start ? new Date(app.start).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' }) : ''}
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
                                        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                                            Yaklaşan randevu bulunmamaktadır.
                                        </Typography>
                                    )}
                                </Card>
                                {/* Geçmiş Randevular */}
                                <Card elevation={3}>
                                    <CardHeader
                                        title="Geçmiş Randevular"
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        sx={{
                                            bgcolor: 'grey.200',
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    {appointmentsLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : pastAppointments.length > 0 ? (
                                        <List>
                                            {pastAppointments.map(app => (
                                                <ListItem key={app.id}>
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ bgcolor: 'grey.500' }}>
                                                            <EventIcon />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                                    {app.title || 'Randevu'}
                                                                </Typography>
                                                                <Chip
                                                                    label={
                                                                        app.status === 'active' ? 'Yaklaşan' :
                                                                            app.status === 'completed' ? 'Tamamlandı' :
                                                                                app.status === 'cancelled' ? 'İptal Edildi' :
                                                                                    'Bilinmeyen'
                                                                    }
                                                                    size="small"
                                                                    color={
                                                                        app.status === 'active' ? 'info' :
                                                                            app.status === 'completed' ? 'success' :
                                                                                app.status === 'cancelled' ? 'error' :
                                                                                    'default'
                                                                    }
                                                                    sx={{ ml: 1 }}
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box>
                                                                <Typography variant="body2" component="span">
                                                                    {app.start ? new Date(app.start).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' }) : ''}
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
                                        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                                            Geçmiş randevu bulunmamaktadır.
                                        </Typography>
                                    )}
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={5}>
                                {/* Randevu Notları */}
                                <Card elevation={3} sx={{ mb: 3 }}>
                                    <CardHeader
                                        title="Son Randevu Notları"
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        subheader={pastAppointments.length > 0 && pastAppointments[0].start ? new Date(pastAppointments[0].start).toLocaleDateString('tr-TR') : ''}
                                        sx={{
                                            bgcolor: 'primary.light',
                                            color: 'primary.contrastText',
                                            '& .MuiCardHeader-subheader': {
                                                color: 'primary.contrastText'
                                            },
                                            borderBottom: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                    <CardContent>
                                        {pastAppointments.length > 0 && pastAppointments[0].note ? (
                                            <Typography variant="body1" paragraph>
                                                {pastAppointments[0].note}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Henüz not eklenmemiş.
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                                {/* İstatistikler */}
                                <Card elevation={3}>
                                    <CardHeader
                                        title="Randevu İstatistikleri"
                                        titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                        sx={{
                                            bgcolor: 'grey.200',
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
                                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{pastAppointments.filter(a => a.status === 'completed').length}</Typography>
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
                                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{upcomingAppointments.length}</Typography>
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
                                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{appointments.filter(a => a.status === 'cancelled').length}</Typography>
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
                                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{appointments.length}</Typography>
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
                                <TextField
                                    label="Başlangıç"
                                    name="start"
                                    type="datetime-local"
                                    value={appointmentForm.start}
                                    onChange={(e) => setAppointmentForm({...appointmentForm, start: e.target.value})}
                                    fullWidth margin="normal"
                                />
                                <TextField
                                    label="Bitiş"
                                    name="end"
                                    type="datetime-local"
                                    value={appointmentForm.end}
                                    onChange={(e) => setAppointmentForm({...appointmentForm, end: e.target.value})}
                                    fullWidth margin="normal"
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setIsAddAppointmentDialogOpen(false)}>İptal</Button>
                                <Button onClick={handleAddAppointment}>Ekle</Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                );
            case 'egzersiz':
                return (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                        </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleOpenAssignExerciseDialog} // Popup açma fonksiyonu
                            >
                                Yeni Egzersiz Ata
                            </Button>
                        </Box>

                        {/* Aktif Egzersiz Alanı */}
                        {assignedExercisesLoading ? (
                             <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                 <CircularProgress />
                             </Box>
                        ) : activeExercise ? (
                            <Card elevation={3} sx={{ mb: 3, overflow: 'hidden', borderRadius: 2 }}>
                                <CardHeader
                                    title="Aktif Egzersiz Programı"
                                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                    sx={{
                                        bgcolor: 'success.light',
                                        color: 'success.contrastText',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                />
                                <Box sx={{ p: 2 }}>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            position: 'relative',
                                            height: '100%',
                                            transition: 'all 0.3s ease',
                                            border: 'none',
                                            borderRadius: 2,
                                            background: 'linear-gradient(to right, #f0fff0, #ffffff)',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                                            },
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                height: '100%',
                                                width: '5px',
                                                backgroundColor: 'success.main',
                                                borderRadius: '4px 0 0 4px'
                                            }
                                        }}
                                    >
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 10,
                                            right: 10,
                                            display: 'flex',
                                            gap: 1,
                                            zIndex: 10
                                        }}>
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                                    '&:hover': { bgcolor: 'success.light' }
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                                    '&:hover': { bgcolor: 'error.light', color: 'white' }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            alignItems: { xs: 'center', sm: 'flex-start' },
                                            p: 2,
                                            gap: 2
                                        }}>
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                p: 2,
                                                minWidth: { xs: '100%', sm: '200px' },
                                                borderRight: { xs: 'none', sm: '1px dashed rgba(0,0,0,0.1)' },
                                                borderBottom: { xs: '1px dashed rgba(0,0,0,0.1)', sm: 'none' },
                                                mb: { xs: 2, sm: 0 }
                                            }}>
                                                <Avatar
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        bgcolor: 'success.light',
                                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                        mb: 2
                                                    }}
                                                >
                                                    <FitnessCenterIcon sx={{ fontSize: 40 }} />
                                                </Avatar>
                                                <Chip
                                                    label="Aktif Egzersiz"
                                                    color="success"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        px: 1,
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                                                        mb: 1.5
                                                    }}
                                                />
                                                <Typography
                                                    variant="h6"
                                                    align="center"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: 'text.primary',
                                                        mb: 1
                                                    }}
                                                >
                                                    {activeExercise.Exercise?.exercise_name || 'Egzersiz'}
                                                </Typography>
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 0.5
                                                }}>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        align="center"
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 0.5
                                                        }}
                                                    >
                                                        <EventIcon fontSize="small" />
                                                        {activeExercise.start_date ? new Date(activeExercise.start_date).toLocaleDateString('tr-TR') : '-'}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        align="center"
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 0.5
                                                        }}
                                                    >
                                                        <EventIcon fontSize="small" />
                                                        {activeExercise.end_date ? new Date(activeExercise.end_date).toLocaleDateString('tr-TR') : '-'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ flex: 1 }}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 2,
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                            height: '100%'
                                                        }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    color: 'success.main',
                                                                    mb: 1,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 0.5
                                                                }}
                                                            >
                                                                <InfoIcon fontSize="small" />
                                                                Açıklama
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {activeExercise.Exercise?.exercise_description || '-'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 2,
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                            height: '100%'
                                                        }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    color: 'success.main',
                                                                    mb: 1,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 0.5
                                                                }}
                                                            >
                                                                <InfoIcon fontSize="small" />
                                                                Not
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {activeExercise.note || '-'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 2,
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                            height: '100%'
                                                        }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    color: 'success.main',
                                                                    mb: 1
                                                                }}
                                                            >
                                                                Süre
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {activeExercise.Exercise?.duration ? `${activeExercise.Exercise.duration} dk` : '-'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 2,
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                            height: '100%'
                                                        }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    color: 'success.main',
                                                                    mb: 1
                                                                }}
                                                            >
                                                                Zorluk
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {activeExercise.Exercise?.difficulty || '-'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 2,
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                            height: '100%'
                                                        }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    color: 'success.main',
                                                                    mb: 1
                                                                }}
                                                            >
                                                                Kategori
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {activeExercise.Exercise?.category || '-'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 2,
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                            height: '100%'
                                                        }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    color: 'success.main',
                                                                    mb: 1
                                                                }}
                                                            >
                                                                Ekipman
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {activeExercise.Exercise?.equipment || '-'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>

                                                {activeExercise.Exercise?.video && (
                                                    <Box sx={{ mt: 2 }}>
                                                        <Accordion
                                                            variant="outlined"
                                                            sx={{
                                                                borderRadius: 2,
                                                                overflow: 'hidden',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                                '&:before': {
                                                                    display: 'none'
                                                                }
                                                            }}
                                                        >
                                                            <AccordionSummary
                                                                expandIcon={<ExpandMoreIcon />}
                                                                sx={{
                                                                    bgcolor: 'success.light',
                                                                    color: 'success.contrastText'
                                                                }}
                                                            >
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Egzersiz Videosu</Typography>
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                <Box sx={{ p: 1, bgcolor: '#000' }}>
                                                                    <video width="100%" controls>
                                                                        <source src={activeExercise.Exercise.video} type="video/mp4" />
                                                                        Tarayıcınız video etiketini desteklemiyor.
                                                                    </video>
                                                                </Box>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </Card>
                                </Box>
                            </Card>
                        ) : (
                             !assignedExercisesLoading && (
                                 <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2, textAlign: 'center' }}>
                                     <Typography variant="body2" color="text.secondary">
                                         Bugün için atanmış aktif bir egzersiz programı bulunmamaktadır.
                                     </Typography>
                                 </Box>
                             )
                        )}

                        {/* Atanmış Egzersizler Listesi */}
                        <Card elevation={3}>
                             <CardHeader
                                 title="Tüm Atanmış Egzersizler"
                                 titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                 sx={{
                                     bgcolor: 'primary.light',
                                     color: 'primary.contrastText',
                                     borderBottom: '1px solid',
                                     borderColor: 'divider'
                                 }}
                             />
                             {assignedExercisesLoading ? (
                                 <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                     <CircularProgress />
                                 </Box>
                             ) : assignedExercises && assignedExercises.length > 0 ? (
                                 <Box sx={{ p: 2 }}>
                                     <Grid container spacing={2}>
                                         {assignedExercises.map((ex, idx) => (
                                             <Grid item xs={12} md={6} key={ex.id || idx}>
                                                 <Card
                                                     variant="outlined"
                                                     sx={{
                                                         position: 'relative',
                                                         height: '100%',
                                                         transition: 'all 0.3s ease',
                                                         border: 'none',
                                                         borderRadius: 2,
                                                         background: 'linear-gradient(to right, #f5f9ff, #ffffff)',
                                                         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                                         overflow: 'hidden',
                                                         '&:hover': {
                                                             transform: 'translateY(-4px)',
                                                             boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)'
                                                         },
                                                         '&::before': {
                                                             content: '""',
                                                             position: 'absolute',
                                                             left: 0,
                                                             top: 0,
                                                             height: '100%',
                                                             width: '5px',
                                                             backgroundColor: new Date() >= new Date(ex.start_date) && new Date() <= new Date(ex.end_date) ? 'success.main' : 'grey.400',
                                                             borderRadius: '4px 0 0 4px'
                                                         }
                                                     }}
                                                 >
                                                     <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                                                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                             <Avatar
                                                                 sx={{
                                                                     bgcolor: new Date() >= new Date(ex.start_date) && new Date() <= new Date(ex.end_date) ? 'success.light' : 'grey.300',
                                                                     boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                                                 }}
                                                             >
                                                                 <FitnessCenterIcon />
                                                             </Avatar>
                                                             <Box>
                                                                 <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                                                     {ex.Exercise?.exercise_name || 'Egzersiz'}
                                                                 </Typography>
                                                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                     <Chip
                                                                         label={
                                                                             ex.status === 'active' ? 'Aktif' :
                                                                                 ex.status === 'completed' ? 'Tamamlandı' :
                                                                                     ex.status === 'cancelled' ? 'İptal Edildi' :
                                                                                         'Bilinmeyen'
                                                                         }
                                                                         size="small"
                                                                         color={
                                                                             ex.status === 'active' ? 'success' :
                                                                                 ex.status === 'completed' ? 'default' :
                                                                                     ex.status === 'cancelled' ? 'error' :
                                                                                         'default'
                                                                         }
                                                                         sx={{ height: 22, '& .MuiChip-label': { px: 1, py: 0 } }}
                                                                     />
                                                                     <Typography variant="caption" color="text.secondary">
                                                                         {ex.start_date && ex.end_date ?
                                                                             `${new Date(ex.start_date).toLocaleDateString('tr-TR')} - ${new Date(ex.end_date).toLocaleDateString('tr-TR')}` :
                                                                             '-'}
                                                                     </Typography>
                                                                 </Box>
                                                             </Box>
                                                         </Box>
                                                         <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                             <IconButton
                                                                 size="small"
                                                                 sx={{
                                                                     bgcolor: 'background.paper',
                                                                     boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                                                                     '&:hover': { bgcolor: 'primary.light', color: 'white' }
                                                                 }}
                                                             >
                                                                 <EditIcon fontSize="small" />
                                                             </IconButton>
                                                             <IconButton
                                                                 size="small"
                                                                 color="error"
                                                                 sx={{
                                                                     bgcolor: 'background.paper',
                                                                     boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                                                                     '&:hover': { bgcolor: 'error.light', color: 'white' }
                                                                 }}
                                                             >
                                                                 <DeleteIcon fontSize="small" />
                                                             </IconButton>
                                                         </Box>
                                                     </Box>
                                                     <CardContent sx={{ p: 2, pb: 1 }}>
                                                         <Grid container spacing={2}>
                                                             <Grid item xs={12}>
                                                                 <Box sx={{
                                                                     p: 1.5,
                                                                     mb: 1.5,
                                                                     bgcolor: 'background.paper',
                                                                     borderRadius: 2,
                                                                     boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                                                                     height: '100%'
                                                                 }}>
                                                                     <Typography
                                                                         variant="subtitle2"
                                                                         sx={{
                                                                             fontWeight: 'bold',
                                                                             color: 'primary.main',
                                                                             mb: 0.5,
                                                                             display: 'flex',
                                                                             alignItems: 'center',
                                                                             gap: 0.5
                                                                         }}
                                                                     >
                                                                         <InfoIcon fontSize="small" />
                                                                         Açıklama
                                                                     </Typography>
                                                                     <Typography variant="body2">
                                                                         {ex.Exercise?.exercise_description || '-'}
                                                                     </Typography>
                                                                 </Box>
                                                             </Grid>

                                                             <Grid item xs={6}>
                                                                 <Box sx={{
                                                                     p: 1.5,
                                                                     bgcolor: 'background.paper',
                                                                     borderRadius: 2,
                                                                     boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                                                                     height: '100%',
                                                                     display: 'flex',
                                                                     flexDirection: 'column'
                                                                 }}>
                                                                     <Typography
                                                                         variant="subtitle2"
                                                                         sx={{
                                                                             fontWeight: 'bold',
                                                                             color: 'primary.main',
                                                                             mb: 0.5
                                                                         }}
                                                                     >
                                                                         Kategori
                                                                     </Typography>
                                                                     <Typography variant="body2" sx={{ flex: 1 }}>
                                                                         {ex.Exercise?.category || '-'}
                                                                     </Typography>
                                                                 </Box>
                                                             </Grid>

                                                             <Grid item xs={6}>
                                                                 <Box sx={{
                                                                     p: 1.5,
                                                                     bgcolor: 'background.paper',
                                                                     borderRadius: 2,
                                                                     boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                                                                     height: '100%',
                                                                     display: 'flex',
                                                                     flexDirection: 'column'
                                                                 }}>
                                                                     <Typography
                                                                         variant="subtitle2"
                                                                         sx={{
                                                                             fontWeight: 'bold',
                                                                             color: 'primary.main',
                                                                             mb: 0.5
                                                                         }}
                                                                     >
                                                                         Ekipman
                                                                     </Typography>
                                                                     <Typography variant="body2" sx={{ flex: 1 }}>
                                                                         {ex.Exercise?.equipment || '-'}
                                                                     </Typography>
                                                                 </Box>
                                                             </Grid>

                                                             <Grid item xs={6}>
                                                                 <Box sx={{
                                                                     p: 1.5,
                                                                     bgcolor: 'background.paper',
                                                                     borderRadius: 2,
                                                                     boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                                                                     height: '100%',
                                                                     display: 'flex',
                                                                     flexDirection: 'column'
                                                                 }}>
                                                                     <Typography
                                                                         variant="subtitle2"
                                                                         sx={{
                                                                             fontWeight: 'bold',
                                                                             color: 'primary.main',
                                                                             mb: 0.5
                                                                         }}
                                                                     >
                                                                         Süre
                                                                     </Typography>
                                                                     <Typography variant="body2" sx={{ flex: 1 }}>
                                                                         {ex.Exercise?.duration ? `${ex.Exercise.duration} dk` : '-'}
                                                                     </Typography>
                                                                 </Box>
                                                             </Grid>

                                                             <Grid item xs={6}>
                                                                 <Box sx={{
                                                                     p: 1.5,
                                                                     bgcolor: 'background.paper',
                                                                     borderRadius: 2,
                                                                     boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                                                                     height: '100%',
                                                                     display: 'flex',
                                                                     flexDirection: 'column'
                                                                 }}>
                                                                     <Typography
                                                                         variant="subtitle2"
                                                                         sx={{
                                                                             fontWeight: 'bold',
                                                                             color: 'primary.main',
                                                                             mb: 0.5
                                                                         }}
                                                                     >
                                                                         Zorluk
                                                                     </Typography>
                                                                     <Typography variant="body2" sx={{ flex: 1 }}>
                                                                         {ex.Exercise?.difficulty || '-'}
                                                                     </Typography>
                                                                 </Box>
                                                             </Grid>
                                                         </Grid>

                                                         {ex.note && (
                                                             <Box
                                                                 sx={{
                                                                     mt: 2,
                                                                     p: 1.5,
                                                                     bgcolor: 'rgba(0, 0, 0, 0.02)',
                                                                     borderRadius: 2,
                                                                     borderLeft: '3px solid',
                                                                     borderColor: 'info.light',
                                                                 }}
                                                             >
                                                                 <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'info.main', mb: 0.5 }}>Not</Typography>
                                                                 <Typography variant="body2">{ex.note}</Typography>
                                                             </Box>
                                                         )}

                                                         {ex.Exercise?.video && (
                                                             <Box sx={{ mt: 2 }}>
                                                                 <Accordion
                                                                     variant="outlined"
                                                                     sx={{
                                                                         borderRadius: 2,
                                                                         overflow: 'hidden',
                                                                         boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                                                                         '&:before': {
                                                                             display: 'none'
                                                                         }
                                                                     }}
                                                                 >
                                                                     <AccordionSummary
                                                                         expandIcon={<ExpandMoreIcon />}
                                                                         sx={{
                                                                             bgcolor: 'primary.light',
                                                                             color: 'primary.contrastText'
                                                                         }}
                                                                     >
                                                                         <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                             <FitnessCenterIcon fontSize="small" /> Egzersiz Videosu
                                                                         </Typography>
                                                                     </AccordionSummary>
                                                                     <AccordionDetails sx={{ p: 0 }}>
                                                                         <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: '#000' }}>
                                                                             <Box
                                                                                 component="video"
                                                                                 sx={{
                                                                                     position: 'absolute',
                                                                                     top: 0,
                                                                                     left: 0,
                                                                                     width: '100%',
                                                                                     height: '100%',
                                                                                     objectFit: 'contain'
                                                                                 }}
                                                                                 controls
                                                                             >
                                                                                 <source src={ex.Exercise.video} type="video/mp4" />
                                                                                 Tarayıcınız video etiketini desteklemiyor.
                                                                             </Box>
                                                                         </Box>
                                                                     </AccordionDetails>
                                                                 </Accordion>
                                                             </Box>
                                                         )}
                                                     </CardContent>
                                                 </Card>
                                             </Grid>
                                         ))}
                                     </Grid>
                                 </Box>
                             ) : (
                                 !assignedExercisesLoading && (
                                     <Box sx={{
                                         display: 'flex',
                                         flexDirection: 'column',
                                         alignItems: 'center',
                                         justifyContent: 'center',
                                         p: 4,
                                         height: 200,
                                         bgcolor: 'grey.50'
                                     }}>
                                         <FitnessCenterIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
                                         <Typography variant="body1" color="text.secondary" align="center">
                                             Danışana atanmış egzersiz bulunmamaktadır.
                                         </Typography>
                                     </Box>
                                 )
                             )}
                        </Card>

                        {/* Egzersiz Atama Popup'ı */}
                        <Dialog open={isAssignExerciseDialogOpen} onClose={handleCloseAssignExerciseDialog}>
                             <DialogTitle>Yeni Egzersiz Ata</DialogTitle>
                                <Box component="form" onSubmit={handleAssignExercise}> {/* Form Dialog'u sarmalayacak */}
                                    <DialogContent dividers> {/* İçeriği sınırlamak ve divider eklemek için */}
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" gutterBottom>Egzersiz Seçin</Typography>
                                                {availableExercisesLoading ? (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                                        <CircularProgress size={24} />
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
                                                                    <FitnessCenterIcon fontSize="small" />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        sx={{ mb: 2 }}
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
                                                     sx={{ mb: 2 }}
                                                 />
                                             </Grid>
                                             <Grid item xs={12} sm={6}>
                                                 <Typography variant="subtitle2" gutterBottom>Başlangıç Tarihi</Typography>
                                                 <TextField
                                                     name="start_date"
                                                     value={assignForm.start_date}
                                                     onChange={handleAssignFormChange}
                                                     type="date"
                                                     fullWidth
                                                     required
                                                     size="small"
                                                     InputLabelProps={{ shrink: true }}
                                                 />
                                             </Grid>
                                             <Grid item xs={12} sm={6}>
                                                 <Typography variant="subtitle2" gutterBottom>Bitiş Tarihi</Typography>
                                                 <TextField
                                                     name="end_date"
                                                     value={assignForm.end_date}
                                                     onChange={handleAssignFormChange}
                                                     type="date"
                                                     fullWidth
                                                     required
                                                     size="small"
                                                     InputLabelProps={{ shrink: true }}
                                                 />
                                             </Grid>
                                        </Grid>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseAssignExerciseDialog} color="secondary">
                                            İptal
                                        </Button>
                                        <Button type="submit" variant="contained" color="primary" disabled={assignLoading}>
                                            {assignLoading ? <CircularProgress size={24} /> : "Egzersiz Ata"}
                                        </Button>
                                    </DialogActions>
                                </Box> {/* Form sonu */}
                        </Dialog>
                    </Box>
                );
            case 'odeme':
                // Aktif invoice'u bul
                const today = new Date();
                const activeInvoice = clientInvoices.find(inv => {
                    if (!inv.issueDate || !inv.dueDate) return false;
                    const start = new Date(inv.issueDate);
                    const end = new Date(inv.dueDate);
                    return today >= start && today <= end;
                });
                // Pagination hesaplamaları
                const totalPages = Math.ceil(clientInvoices.length / invoicesPerPage);
                const paginatedInvoices = clientInvoices.slice(
                    (currentInvoicePage - 1) * invoicesPerPage,
                    currentInvoicePage * invoicesPerPage
                );
                return (
                    <Paper elevation={2} sx={{ p: 3 }}>
                        {/* Aktif Invoice */}
                        {activeInvoice && (
                            <Card elevation={4} sx={{ mb: 3, border: '2px solid', borderColor: 'success.main', background: '#f6fff6' }}>
                                <CardHeader
                                    avatar={<Avatar sx={{ bgcolor: 'success.main' }}><ReceiptLongIcon /></Avatar>}
                                    title={<Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success.main' }}>Aktif Fatura: {activeInvoice.description || 'Açıklama yok'}</Typography>}
                                    subheader={<Typography variant="body2" color="text.secondary">Fatura No: {activeInvoice.id}</Typography>}
                                    sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.100' }}
                                />
                                <CardContent>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Tutar:</strong> {Number(activeInvoice.amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Düzenleme Tarihi:</strong> {activeInvoice.issueDate ? new Date(activeInvoice.issueDate).toLocaleDateString('tr-TR') : '-'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Son Ödeme Tarihi:</strong> {activeInvoice.dueDate ? new Date(activeInvoice.dueDate).toLocaleDateString('tr-TR') : '-'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}
                        {clientInvoicesLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
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
                                                        avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><ReceiptLongIcon /></Avatar>}
                                                        title={<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{invoice.description || 'Açıklama yok'}</Typography>}
                                                        subheader={<Typography variant="body2" color="text.secondary">Fatura No: {invoice.id}</Typography>}
                                                        action={<Chip label={statusLabel} color={statusColor} size="small" />}
                                                        sx={{ bgcolor: 'grey.100', borderBottom: '1px solid', borderColor: 'divider' }}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Tutar:</strong> {Number(invoice.amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Düzenleme Tarihi:</strong> {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('tr-TR') : '-'}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Son Ödeme Tarihi:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('tr-TR') : '-'}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setCurrentInvoicePage(p => Math.max(1, p - 1))}
                                            disabled={currentInvoicePage === 1}
                                            sx={{ mr: 1 }}
                                        >
                                            Önceki
                                        </Button>
                                        <Typography variant="body2" sx={{ mx: 2, display: 'flex', alignItems: 'center' }}>
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
        const { name, value } = e.target;
        setAssignForm(prev => ({ ...prev, [name]: value }));
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
            setAssignForm({ exercise_id: '', start_date: '', end_date: '', note: '' });
            // Başarıyla atandıktan sonra egzersizleri tekrar çek
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
        setAssignForm({ exercise_id: '', start_date: '', end_date: '', note: '' });
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
            setAppointmentForm({ title: '', start: '', end: '' }); // Reset form

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

            setSuccessMessage(`Randevu başarıyla oluşturuldu.`);
            setShowSuccessPopup(true);
        } catch (err) {
            setErrorMessage(err.response.data.message);
            setShowErrorPopup(true);
        }
    };

    return (
        <Default>
            <Box sx={{ p: 2 }}>
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
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
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
                                    width: 150,
                                    height: 150,
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
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {danisan.name} {danisan.surname}
                            </Typography>
                            <Divider sx={{ width: '100%', my: 2 }} />
                            {/* Danışan Bilgileri Grid */}
                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2"><strong>Cinsiyet:</strong> {danisan.gender || '-'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2"><strong>Doğum Tarihi:</strong> {danisan.birthDate || '-'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2"><strong>Meslek:</strong> {danisan.job || '-'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2"><strong>Medeni Durum:</strong> {danisan.maritalStatus || '-'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2"><strong>E-posta:</strong> {danisan.email || '-'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2"><strong>Telefon:</strong> {danisan.phoneNumber || '-'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2"><strong>Şehir:</strong> {danisan.city || '-'}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                            </Box>
                        </Card>
                    </Grid>

                {/* Sağ Panel - Tabs ve içerik */}
                    <Grid item xs={12} md={10}>
                        <Card elevation={4} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
                                <Tab label="Anamnez" value="anamnez" />
                                <Tab label="Ölçümler" value="olcum" />
                                <Tab label="Beslenme" value="beslenme" />
                                <Tab label="Randevular" value="randevu" />
                                <Tab label="Egzersizler" value="egzersiz" />
                                <Tab label="Ödemeler" value="odeme" />
                                </Tabs>
                        </Box>
                            <Box sx={{ p: 3, minHeight: '50vh' }}>
                                {renderTabContent()}
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="success-popup">
                    <div className="success-popup-content">
                        <CheckCircleIcon className="success-icon" />
                        <p>{successMessage}</p>
                    </div>
                </div>
            )}

            {/* Error Popup */}
            {showErrorPopup && (
                <div className="error-popup">
                    <div className="error-popup-content">
                        <ErrorIcon className="error-icon" />
                        <p>{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* Ölçüm Ekleme Dialog */}
            <Dialog open={isMeasurementDialogOpen} onClose={handleCloseMeasurementDialog} fullWidth maxWidth="md">
                <DialogTitle>Yeni Ölçüm Ekle</DialogTitle>
                <Box component="form" onSubmit={handleCreateMeasurement}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Boy (cm)"
                                    name="boy"
                                    type="number"
                                    fullWidth
                                    value={measurementForm.boy}
                                    onChange={handleMeasurementFormChange}
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                            {createMeasurementLoading ? <CircularProgress size={24} /> : "Ölçüm Ekle"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* Ölçüm Düzenleme Dialog */}
            <Dialog open={isEditMeasurementDialogOpen} onClose={handleCloseEditMeasurementDialog} fullWidth maxWidth="md">
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                            {updateMeasurementLoading ? <CircularProgress size={24} /> : "Güncelle"}
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
        </Default>
    );
}

export default React.memo(Danisan);

