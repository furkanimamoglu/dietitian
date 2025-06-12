import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import "./Randevularim.css";
import {showErrorToast, showSuccessToast} from '../../utils/toastUtil';

import FullCalendar from "@fullcalendar/react";
import "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import Default from "../../Components/Layouts/Default.jsx";

import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid2,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    InputAdornment
} from '@mui/material';

import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';

import config from "../../config.js";
import Close from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import Person from "@mui/icons-material/Person";


export default function Randevularim() {
    const [randevular, setRandevular] = useState([]);
    const [clients, setClients] = useState([]);

    const [randevuEklePopup, setRandevuEklePopup] = useState(false);
    const [randevuDuzenlePopup, setRandevuDuzenlePopup] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const [validationErrors, setValidationErrors] = useState({
        title: false,
        start: false,
        end: false,
        client_id: false
    });
    const [showValidation, setShowValidation] = useState(false);

    const [eventData, setEventData] = useState({
        id: null,
        title: "",
        start: "",
        end: "",
        client_id: "",
        status: "pending",
    });

    const calendarRef = useRef(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get(
                    config[config.environment].apiUrl + "/dietitian/getAllMyClients",
                    {
                        headers: {
                            Authorization: localStorage.getItem('token')
                        }
                    }
                );
                setClients(response.data || []);

                // Danışanlar çekildikten sonra randevuları çek
                fetchAppointments();
            } catch (error) {
                console.error("Müşteriler çekilirken bir hata oluştu:", error);
            }
        };

        const fetchAppointments = async () => {
            try {
                const response = await axios.get(
                    config[config.environment].apiUrl + "/appointment/fetchDietitianAppointments",
                    {
                        headers: {
                            Authorization: localStorage.getItem('token')
                        }
                    }
                );

                const appointments = response.data || [];

                const formattedAppointments = appointments.map((appointment) => ({
                    id: appointment.id,
                    title: appointment.title,
                    start: appointment.start,
                    end: appointment.end,
                    extendedProps: {
                        client_id: appointment.client_id,
                        status: appointment.status,
                    },
                    color:
                        appointment.status === "approved"
                            ? "#4CAF50"
                            : appointment.status === "cancelled"
                                ? "#F44336"
                                : "#FF9800"
                }));

                setRandevular(formattedAppointments);
            } catch (error) {
                console.log("Randevular çekilirken bir hata oluştu:", error);
            }
        };

        // İlk önce danışanları çek
        fetchClients();
    }, []);

    // Validasyon fonksiyonu
    const validateEventData = () => {
        const errors = {
            title: !eventData.title.trim(),
            start: !eventData.start,
            end: !eventData.end,
            client_id: !eventData.client_id
        };

        setValidationErrors(errors);
        return !Object.values(errors).some(error => error);
    };

    const handleRandevuEkleButton = () => {
        setEventData({
            id: null,
            title: "",
            start: "",
            end: "",
            client_id: "",
            status: "pending",
        });
        // Validasyon durumlarını sıfırla
        setValidationErrors({
            title: false,
            start: false,
            end: false,
            client_id: false
        });
        setShowValidation(false);
        setRandevuEklePopup(true);
    };

    const handleDateClick = (arg) => {
        const currentView = arg.view.type;

        if (currentView === "dayGridMonth" || currentView === "dayGridYear") {
            arg.view.calendar.changeView("timeGridDay", arg.date);
        } else {
            const startDate = new Date(arg.dateStr);
            const endDate = new Date(startDate);

            endDate.setMinutes(endDate.getMinutes() + 15);

            setEventData((prev) => ({
                ...prev,
                title: "",
                start: startDate.toISOString().slice(0, 16),
                end: endDate.toISOString().slice(0, 16),
                client_id: "",
                status: "pending",
            }));
            // Validasyon durumlarını sıfırla
            setValidationErrors({
                title: false,
                start: false,
                end: false,
                client_id: false
            });
            setShowValidation(false);
            setRandevuEklePopup(true);
        }
    };

    const handleEventClick = (arg) => {
        const event = arg.event;
        console.log("Tıklanan randevu bilgileri:", {
            id: event.id,
            title: event.title,
            extendedProps: event.extendedProps
        });

        setEventData({
            id: event.id,
            title: event.title,
            start: event.start.toISOString().slice(0, 16),
            end: event.end?.toISOString().slice(0, 16) || "",
            client_id: event.extendedProps?.client_id || "",
            status: event.extendedProps?.status || "pending",
        });

        setValidationErrors({
            title: false,
            start: false,
            end: false,
            client_id: false
        });
        setShowValidation(false);
        setRandevuDuzenlePopup(true);
    };

    const handleEventResizeOrDrop = async (arg) => {
        try {
            const event = arg.event;

            const updatedEvent = {
                id: event.id,
                title: event.title,
                start: event.start.toISOString(),
                end: event.end ? event.end.toISOString() : null,
                client_id: event.extendedProps?.client_id || "",
                status: event.extendedProps?.status || "pending",
            };

            const requestData = {
                appointment_id: updatedEvent.id,
                title: updatedEvent.title,
                start: updatedEvent.start,
                end: updatedEvent.end,
                client_id: updatedEvent.client_id,
                status: updatedEvent.status,
            };

            const response = await axios.put(
                config[config.environment].apiUrl + "/appointment/updateAppointmentAsDietitian",
                requestData,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                }
            );

            const updatedStatus = response.data?.appointment?.status || updatedEvent.status;

            setRandevular((prevRandevular) => {
                return prevRandevular.map((randevu) =>
                    String(randevu.id) === String(updatedEvent.id)
                        ? {
                            ...randevu,
                            start: updatedEvent.start,
                            end: updatedEvent.end,
                            extendedProps: {
                                client_id: updatedEvent.client_id,
                                status: updatedStatus,
                            },
                            color: updatedStatus === "approved" ? "#4CAF50" : "#FF9800"
                        }
                        : randevu
                );
            });
        } catch (error) {
            console.error("Randevu güncellenirken bir hata oluştu:", error);
            arg.revert();
        }
    };

    const randevuEkle = async () => {
        setShowValidation(true);

        if (!validateEventData()) {
            showErrorToast('Lütfen tüm gerekli alanları doldurun.');
            return;
        }

        try {
            const requestData = {
                title: eventData.title,
                start: eventData.start,
                end: eventData.end,
                client_id: eventData.client_id,
            };

            const response = await axios.post(
                config[config.environment].apiUrl + "/appointment/addAppointmentAsDietitian",
                requestData,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                }
            );

            console.log("Randevu ekleme isteği başarılı:", response.data);

            let appointmentData;

            if (response.data && response.data.appointment) {
                appointmentData = response.data.appointment;
            } else if (response.data && response.data.id) {
                appointmentData = response.data;
            } else {
                console.error("API yanıtı beklenen formatta değil:", response.data);
                showErrorToast('Sunucu yanıtı beklenmeyen formatta. Yöneticinize başvurun.');
                return;
            }

            console.log("İşlenecek appointment verisi:", appointmentData);

            const newEvent = {
                id: appointmentData.id,
                title: appointmentData.title || eventData.title,
                start: appointmentData.start || eventData.start,
                end: appointmentData.end || eventData.end,
                extendedProps: {
                    client_id: appointmentData.client_id || eventData.client_id,
                    status: appointmentData.status || "pending",
                },
                color: (appointmentData.status === "approved") ? "#4CAF50" : "#FF9800"
            };

            setRandevular((prevRandevular) => [...prevRandevular, newEvent]);
            setRandevuEklePopup(false);
            setShowValidation(false);

            showSuccessToast('Randevu başarıyla oluşturuldu!');
        } catch (error) {
            console.error("Randevu eklenirken bir hata oluştu:", error);
            showErrorToast('Randevu eklenirken bir hata oluştu: ' + (error.response?.data?.message || error.message || 'Bilinmeyen hata'));
        }
    };

    const handleEventSave = async () => {
        setShowValidation(true);

        if (!validateEventData()) {
            showErrorToast('Lütfen tüm gerekli alanları doldurun.');
            return;
        }

        try {
            const updatedEventWithDates = {
                id: eventData.id,
                title: eventData.title,
                start: eventData.start,
                end: eventData.end,
                client_id: eventData.client_id,
                status: eventData.status,
            };

            const requestData = {
                appointment_id: updatedEventWithDates.id,
                title: updatedEventWithDates.title,
                start: updatedEventWithDates.start,
                end: updatedEventWithDates.end,
                client_id: updatedEventWithDates.client_id,
                status: updatedEventWithDates.status,
            };

            const response = await axios.put(
                config[config.environment].apiUrl + "/appointment/updateAppointmentAsDietitian",
                requestData,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                }
            );
            console.log("Randevu düzenleme başarılı:", response.data);

            setRandevular((prevRandevular) => {
                return prevRandevular.map((randevu) =>
                    String(randevu.id) === String(updatedEventWithDates.id)
                        ? {
                            ...randevu,
                            title: updatedEventWithDates.title,
                            start: updatedEventWithDates.start,
                            end: updatedEventWithDates.end,
                            extendedProps: {
                                client_id: updatedEventWithDates.client_id,
                                status: updatedEventWithDates.status,
                            },
                            color: updatedEventWithDates.status === "approved" ? "#4CAF50" : "#FF9800"
                        }
                        : randevu
                );
            });

            handleDialogClose();
            setShowValidation(false);
        } catch (error) {
            console.error("Randevu güncellenirken bir hata oluştu:", error);
        }
    };

    const handleDialogClose = () => {
        setRandevuDuzenlePopup(false);
        setRandevuEklePopup(false);
        setShowValidation(false);
        setValidationErrors({
            title: false,
            start: false,
            end: false,
            client_id: false
        });
    };

    const handleEventChange = (key, value) => {
        setEventData((prev) => ({
            ...prev,
            [key]: value,
        }));

        // Eğer validasyon gösteriliyorsa, alan doldurulduğunda hatayı temizle
        if (showValidation && value) {
            setValidationErrors(prev => ({
                ...prev,
                [key]: false
            }));
        }
    };

    const handleEventDelete = async () => {
        try {
            // Get the appointment ID and log it to make sure it's correct
            const appointmentId = eventData.id;
            console.log("Silinecek randevu ID:", appointmentId);

            // Use a properly formatted query parameter
            const response = await axios.delete(
                `${config[config.environment].apiUrl}/appointment/deleteAppointmentAsDietitian`,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                    params: {
                        appointment_id: appointmentId
                    }
                }
            );

            console.log("Randevu silme başarılı:", response.data);

            // Randevu listesinden sil
            setRandevular((prevRandevular) =>
                prevRandevular.filter((randevu) => String(randevu.id) !== String(appointmentId))
            );

            // Toast bildirim göster
            showSuccessToast('Randevu başarıyla silindi!');

            // Dialogları kapat
            setConfirmDialogOpen(false);
            handleDialogClose();

        } catch (error) {
            console.error("Randevu silinirken bir hata oluştu:", error);
            showErrorToast('Randevu silinirken bir hata oluştu!');
            setConfirmDialogOpen(false);
        }
    };

    const handleDeleteClick = () => {
        setConfirmDialogOpen(true);
    };

    return (
        <Default>
            <Grid2 container sx={{height: "100%", width: "100%"}}>
                <Box sx={{width: "100%", height: "100%"}}>
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        timeZone={'UTC'}
                        themeSystem={'bootstrap5'}
                        events={randevular}
                        editable={true}
                        droppable={true}
                        locale="tr"
                        contentHeight="68vh"
                        scrollTime="06:00:00"
                        headerToolbar={{
                            left: "prev,next today randevuEkle",
                            center: "title",
                            right: "timeGridDay timeGridWeek dayGridMonth dayGridYear"
                        }}
                        customButtons={{
                            randevuEkle: {
                                text: 'Randevu Ekle',
                                click: handleRandevuEkleButton
                            }
                        }}
                        navLinks={true}
                        businessHours={{
                            daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
                            startTime: "09:00",
                            endTime: "18:00",
                        }}
                        buttonText={{
                            today: "Bugün"
                        }}
                        views={{
                            timeGridDay: {
                                buttonText: "Günlük",
                                dayHeaderFormat: {weekday: 'long'}
                            },
                            timeGridWeek: {
                                buttonText: "Haftalık",
                                weekNumbers: true,
                                dayHeaderFormat: {weekday: 'long'}
                            },
                            dayGridMonth: {
                                buttonText: "Aylık",
                                dayHeaderFormat: {weekday: 'long'}
                            },
                            dayGridYear: {
                                buttonText: "Yıllık",
                                dayHeaderFormat: {weekday: 'long'}
                            }
                        }}
                        weekNumberFormat={{
                            week: "numeric"
                        }}
                        weekNumbers={true}
                        now={new Date()}
                        nowIndicator={true}
                        firstDay={1}
                        allDayText="Tüm Gün"
                        slotDuration="00:15:00"
                        slotLabelInterval="0:15"
                        slotLabelFormat={{
                            hour: "2-digit",
                            minute: "2-digit",
                            meridiem: "short",
                        }}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        eventResize={handleEventResizeOrDrop}
                        eventDrop={handleEventResizeOrDrop}
                        eventResizableFromStart={true}
                        eventOverlap={true}
                        eventContent={(arg) => {
                            const clientId = arg.event.extendedProps?.client_id;

                            const client = clients.find(c => String(c.id) === String(clientId));
                            const clientName = client ? client.name : "";

                            // Saat formatını ayarlama (UTC zamanını kullanarak)
                            const startTime = arg.event.start ? new Date(arg.event.start).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                                timeZone: 'UTC'
                            }) : '';

                            return (
                                <div className="appointment-event" style={{
                                    height: '100%',
                                    width: '100%',
                                    padding: '1px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        fontSize: '0.8em',
                                        fontWeight: 'bold',
                                        padding: '2px 4px',
                                        borderRadius: '3px',
                                        marginBottom: '1px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        <Person
                                            style={{
                                                fontSize: '0.9em',
                                                color: '#0020ff',
                                                flexShrink: 0
                                            }}
                                        />
                                        <span style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            marginLeft: '2px'
                                        }}>
                                            {clientName || "Danışan belirtilmemiş"}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '0.75em',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '0 4px'
                                    }}>
                                        <span style={{
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                        }}>
                                            {startTime}
                                        </span>
                                        <span style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {arg.event.title}
                                        </span>
                                    </div>
                                </div>
                            );
                        }}
                    />
                </Box>
            </Grid2>

            {/* Yeni Randevu Ekle Popup */}
            <Dialog open={randevuEklePopup} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Yeni Randevu Ekle
                    <IconButton
                        aria-label="close"
                        onClick={handleDialogClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <Close/>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Randevu Başlığı"
                        value={eventData.title}
                        onChange={(e) => handleEventChange("title", e.target.value)}
                        fullWidth
                        margin="normal"
                        error={showValidation && validationErrors.title}
                        helperText={showValidation && validationErrors.title ? "Bu alan zorunludur" : ""}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                            label="Başlangıç Tarihi"
                            value={eventData.start ? new Date(eventData.start) : null}
                            onChange={(newValue) => {
                                handleEventChange("start", newValue ? newValue.toISOString() : '')
                            }}
                            ampm={false}
                            views={['year', 'month', 'day', 'hours', 'minutes']}
                            minutesStep={15}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    margin: "normal",
                                    error: showValidation && validationErrors.start,
                                    helperText: showValidation && validationErrors.start ? "Bu alan zorunludur" : ""
                                }
                            }}
                        />
                        <DateTimePicker
                            label="Bitiş Tarihi"
                            value={eventData.end ? new Date(eventData.end) : null}
                            onChange={(newValue) => {
                                handleEventChange("end", newValue ? newValue.toISOString() : '')
                            }}
                            ampm={false}
                            views={['year', 'month', 'day', 'hours', 'minutes']}
                            minutesStep={15}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    margin: "normal",
                                    error: showValidation && validationErrors.end,
                                    helperText: showValidation && validationErrors.end ? "Bu alan zorunludur" : ""
                                }
                            }}
                        />
                    </LocalizationProvider>
                    <Autocomplete
                        options={clients}
                        getOptionLabel={(option) => option.name}
                        onChange={(e, value) => handleEventChange("client_id", value?.id || "")}
                        value={clients.find((client) => String(client.id) === String(eventData.client_id)) || null}
                        isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Danışan"
                                margin="normal"
                                error={showValidation && validationErrors.client_id}
                                helperText={showValidation && validationErrors.client_id ? "Bu alan zorunludur" : ""}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <InputAdornment position="start">
                                                <Person color="primary" />
                                            </InputAdornment>
                                            {params.InputProps.startAdornment}
                                        </>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderWidth: 2,
                                        }
                                    }
                                }}
                            />
                        )}
                        fullWidth
                    />
                    {/* Status Selectbox (MUI) */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="status-label">Durum</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status-select"
                            value={eventData.status}
                            label="Durum"
                            onChange={(e) => handleEventChange("status", e.target.value)}
                        >
                            <MenuItem value="approved">Onaylandı</MenuItem>
                            <MenuItem value="pending">Beklemede</MenuItem>
                            <MenuItem value="denied">Reddedildi</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="secondary">
                        Vazgeç
                    </Button>
                    <Button
                        onClick={randevuEkle}
                        color="primary"
                    >
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Event Düzenle Popup */}
            <Dialog open={randevuDuzenlePopup} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Randevu Düzenle
                    <IconButton
                        aria-label="close"
                        onClick={handleDialogClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <Close/>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Randevu Başlığı"
                        value={eventData.title}
                        onChange={(e) => handleEventChange("title", e.target.value)}
                        fullWidth
                        margin="normal"
                        error={showValidation && validationErrors.title}
                        helperText={showValidation && validationErrors.title ? "Bu alan zorunludur" : ""}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                            label="Başlangıç Tarihi"
                            value={eventData.start ? new Date(eventData.start) : null}
                            onChange={(newValue) => {
                                handleEventChange("start", newValue ? newValue.toISOString() : '')
                            }}
                            ampm={false} // 24 saat formatı için
                            views={['year', 'month', 'day', 'hours', 'minutes']}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    margin: "normal",
                                    error: showValidation && validationErrors.start,
                                    helperText: showValidation && validationErrors.start ? "Bu alan zorunludur" : ""
                                }
                            }}
                        />
                        <DateTimePicker
                            label="Bitiş Tarihi"
                            value={eventData.end ? new Date(eventData.end) : null}
                            onChange={(newValue) => {
                                handleEventChange("end", newValue ? newValue.toISOString() : '')
                            }}
                            ampm={false} // 24 saat formatı için
                            views={['year', 'month', 'day', 'hours', 'minutes']}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    margin: "normal",
                                    error: showValidation && validationErrors.end,
                                    helperText: showValidation && validationErrors.end ? "Bu alan zorunludur" : ""
                                }
                            }}
                        />
                    </LocalizationProvider>
                    <Autocomplete
                        options={clients}
                        getOptionLabel={(option) => option.name}
                        onChange={(e, value) => handleEventChange("client_id", value?.id || "")}
                        value={clients.find((client) => String(client.id) === String(eventData.client_id)) || null}
                        isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Danışan"
                                margin="normal"
                                error={showValidation && validationErrors.client_id}
                                helperText={showValidation && validationErrors.client_id ? "Bu alan zorunludur" : ""}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <InputAdornment position="start">
                                                <Person color="primary" />
                                            </InputAdornment>
                                            {params.InputProps.startAdornment}
                                        </>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderWidth: 2,
                                        }
                                    }
                                }}
                            />
                        )}
                        fullWidth
                    />
                    {/* Status Selectbox (MUI) */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="status-label">Durum</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status-select"
                            value={eventData.status}
                            label="Durum"
                            onChange={(e) => handleEventChange("status", e.target.value)}
                        >
                            <MenuItem value="approved">Onaylandı</MenuItem>
                            <MenuItem value="pending">Beklemede</MenuItem>
                            <MenuItem value="denied">Reddedildi</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleDeleteClick}
                        color="error"
                        startIcon={<Delete/>}
                    >
                        Sil
                    </Button>
                    <Button
                        onClick={handleEventSave}
                        color="primary"
                    >
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Silme Onay Diyaloğu */}
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{
                    sx: {
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        padding: '10px'
                    }
                }}
            >
                <DialogTitle
                    id="alert-dialog-title"
                    sx={{
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #e9ecef',
                        padding: '16px 24px',
                        fontWeight: 'bold',
                        color: '#dc3545',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <Delete color="error"/>
                    Randevu Silme Onayı
                </DialogTitle>
                <DialogContent sx={{padding: '24px', paddingTop: '24px !important'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <Box sx={{fontWeight: 'medium', fontSize: '16px'}}>
                            "{eventData.title}" randevusunu silmek istediğinize emin misiniz?
                        </Box>
                        <Box sx={{color: 'text.secondary', fontSize: '14px'}}>
                            Bu işlem geri alınamaz. Randevu kalıcı olarak silinecektir.
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #e9ecef'}}>
                    <Button
                        onClick={() => setConfirmDialogOpen(false)}
                        color="inherit"
                        sx={{fontWeight: 'medium'}}
                    >
                        Vazgeç
                    </Button>
                    <Button
                        onClick={handleEventDelete}
                        color="error"
                        variant="contained"
                        autoFocus
                        sx={{
                            fontWeight: 'medium',
                            boxShadow: 'none',
                            '&:hover': {boxShadow: 'none'}
                        }}
                    >
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </Default>
    );
}

