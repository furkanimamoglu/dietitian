import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {tr} from 'date-fns/locale';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import axios from 'axios';
import config from '../../config.js';
import {showErrorToast, showSuccessToast} from '../../utils/toastUtil';

const NutritionPlanAssignModal = ({
                                      open,
                                      onClose,
                                      clientId,
                                      onSuccess
                                  }) => {
    const [availableNutritionPlans, setAvailableNutritionPlans] = useState([]);
    const [availableNutritionPlansLoading, setAvailableNutritionPlansLoading] = useState(false);
    const [nutritionAssignForm, setNutritionAssignForm] = useState({
        nutrition_plan_id: '',
        start_date: '',
        end_date: '',
        note: ''
    });
    const [nutritionAssignLoading, setNutritionAssignLoading] = useState(false);

    useEffect(() => {
        if (open) {
            // Varsayılan tarihler ayarla
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);

            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            setNutritionAssignForm({
                nutrition_plan_id: '',
                start_date: formatDate(today),
                end_date: formatDate(nextWeek),
                note: ''
            });

            fetchAvailableNutritionPlans();
        }
    }, [open]);

    const fetchAvailableNutritionPlans = async () => {
        setAvailableNutritionPlansLoading(true);
        try {
            const response = await axios.get(
                `${config[config.environment].apiUrl}/nutrition/getNutritionPlans`,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }
            );
            setAvailableNutritionPlans(response.data);
        } catch (err) {
            console.error("Beslenme planları yüklenirken hata:", err.message);
            setAvailableNutritionPlans([]);
            showErrorToast("Beslenme planları yüklenirken bir hata oluştu.");
        } finally {
            setAvailableNutritionPlansLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const {name, value} = e.target;
        setNutritionAssignForm(prev => ({...prev, [name]: value}));
    };

    const setDateRange = (weeks) => {
        const today = new Date();
        const start = new Date(today);
        const end = new Date(today);

        if (weeks === 'month') {
            end.setMonth(end.getMonth() + 1);
        } else {
            end.setDate(end.getDate() + (7 * weeks));
        }

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setNutritionAssignForm(prev => ({
            ...prev,
            start_date: formatDate(start),
            end_date: formatDate(end)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNutritionAssignLoading(true);

        try {
            const assignData = {
                client_id: clientId,
                nutrition_plan_id: nutritionAssignForm.nutrition_plan_id,
                start_date: nutritionAssignForm.start_date,
                end_date: nutritionAssignForm.end_date,
                note: nutritionAssignForm.note
            };

            await axios.post(
                `${config[config.environment].apiUrl}/nutrition/assignNutritionPlanToClient`,
                assignData,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }
            );

            // Bildirim gönder
            try {
                await axios.post(
                    `${config[config.environment].apiUrl}/notification/sendNutritionPlanAssignedNotification`,
                    {client_id: clientId},
                    {headers: {Authorization: localStorage.getItem("token")}}
                );
            } catch (notificationError) {
                console.error("Bildirim gönderilirken hata oluştu:", notificationError);
            }

            showSuccessToast("Beslenme planı başarıyla atandı.");
            onSuccess && onSuccess();
            onClose();

        } catch (err) {
            console.error("Beslenme planı atama hatası:", err);
            showErrorToast(err.response?.data?.message || "Beslenme planı atanırken bir hata oluştu.");
        } finally {
            setNutritionAssignLoading(false);
        }
    };

    const handleClose = () => {
        setNutritionAssignForm({
            nutrition_plan_id: '',
            start_date: '',
            end_date: '',
            note: ''
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <RestaurantIcon sx={{mr: 1, color: 'primary.main'}}/>
                    Beslenme Planı Ata
                </Box>
            </DialogTitle>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                                Beslenme Planı Seçin
                            </Typography>
                            {availableNutritionPlansLoading ? (
                                <Box sx={{display: 'flex', justifyContent: 'center', py: 2}}>
                                    <CircularProgress size={24}/>
                                </Box>
                            ) : (
                                <TextField
                                    select
                                    name="nutrition_plan_id"
                                    value={nutritionAssignForm.nutrition_plan_id}
                                    onChange={handleFormChange}
                                    fullWidth
                                    required
                                    size="small"
                                    placeholder="Beslenme planı seçin"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <RestaurantIcon fontSize="small"/>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{mb: 2}}
                                >
                                    <MenuItem value="" disabled>
                                        Beslenme planı seçin
                                    </MenuItem>
                                    {availableNutritionPlans.map((plan) => (
                                        <MenuItem key={plan.id} value={plan.id}>
                                            {plan.title}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{mb: 1, mt: 2}}>
                                Hızlı Süre Seç:
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 2}}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setDateRange(1)}
                                >
                                    1 Hafta
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setDateRange(2)}
                                >
                                    2 Hafta
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setDateRange(3)}
                                >
                                    3 Hafta
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setDateRange('month')}
                                >
                                    1 Ay
                                </Button>
                            </Stack>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                                <DatePicker
                                    label="Başlangıç Tarihi"
                                    value={nutritionAssignForm.start_date ? new Date(nutritionAssignForm.start_date) : null}
                                    onChange={(newValue) => {
                                        const formatted = newValue ? newValue.toISOString().split('T')[0] : '';
                                        setNutritionAssignForm(prev => ({...prev, start_date: formatted}));
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
                                    value={nutritionAssignForm.end_date ? new Date(nutritionAssignForm.end_date) : null}
                                    onChange={(newValue) => {
                                        const formatted = newValue ? newValue.toISOString().split('T')[0] : '';
                                        setNutritionAssignForm(prev => ({...prev, end_date: formatted}));
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

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                                Not (Opsiyonel)
                            </Typography>
                            <TextField
                                name="note"
                                value={nutritionAssignForm.note}
                                onChange={handleFormChange}
                                fullWidth
                                size="small"
                                placeholder="Danışana özel notlar..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={nutritionAssignLoading || !nutritionAssignForm.nutrition_plan_id}
                    >
                        {nutritionAssignLoading ? <CircularProgress size={24}/> : "Plan Ata"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default NutritionPlanAssignModal;
