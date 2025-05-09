import React, {useEffect, useState, useRef} from "react";
import axios from "axios";
import "./Randevularim.css";

import FullCalendar from "@fullcalendar/react";
import "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import Default from "../../Components/Layouts/Default.jsx";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid2,
    TextField,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import config from "../../config.js";
import {Close} from "@mui/icons-material";
import {Autocomplete} from "@mui/lab";

export default function Randevularim() {
    const [randevular, setRandevular] = useState([]);
    const [clients, setClients] = useState([]);

    const [randevuEklePopup, setRandevuEklePopup] = useState(false);
    const [randevuDuzenlePopup, setRandevuDuzenlePopup] = useState(false);

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
        const fetchAppointments = async () => {
            try {
                const response = await axios.get(
                    config[config.environment].apiUrl+"/appointment/fetchDietitianAppointments",
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
                    color: appointment.status === "approved" || appointment.status === "confirmed" ? "#4CAF50" : "#FF9800"
                }));

                setRandevular(formattedAppointments);
            } catch (error) {
                console.error("Randevular çekilirken bir hata oluştu:", error);
            }
        };

        fetchAppointments();
    }, []);

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
            } catch (error) {
                console.error("Müşteriler çekilirken bir hata oluştu:", error);
            }
        };

        fetchClients();
    }, []);

    const handleRandevuEkleButton = () => {
        setEventData({
            id: null,
            title: "",
            start: "",
            end: "",
            client_id: "",
            status: "pending",
        });
        setRandevuEklePopup(true);
    };

    const handleDateClick = (arg) => {
        const currentView = arg.view.type;

        if (currentView === "dayGridMonth" || currentView === "dayGridYear") {
            arg.view.calendar.changeView("timeGridDay", arg.date);
        } else {
            const startDate = new Date(arg.dateStr);
            const endDate = new Date(arg.dateStr);
            endDate.setHours(endDate.getHours() + 1);

            setEventData((prev) => ({
                ...prev,
                title: "",
                start: startDate.toISOString().slice(0, 16),
                end: endDate.toISOString().slice(0, 16),
                client_id: "",
                status: "pending",
            }));
            setRandevuEklePopup(true);
        }
    };

    const handleEventClick = (arg) => {
        const event = arg.event;
        setEventData({
            id: event.id,
            title: event.title,
            start: event.start.toISOString().slice(0, 16),
            end: event.end?.toISOString().slice(0, 16) || "",
            client_id: event.extendedProps?.client_id || "",
            status: event.extendedProps?.status || "pending",
        });
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
                            color: updatedStatus === "approved" || updatedStatus === "confirmed" ? "#4CAF50" : "#FF9800"
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
        try {
            const newEvent = {
                id: randevular.length + 1,
                title: eventData.title,
                start: eventData.start,
                end: eventData.end,
                extendedProps: {
                    client_id: eventData.client_id,
                },
            };

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

            setRandevular((prevRandevular) => [...prevRandevular, newEvent]);
            setRandevuEklePopup(false);
        } catch (error) {
            console.error("Randevu eklenirken bir hata oluştu:", error);
        }
    };

    const handleEventSave = async () => {
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
                            color: updatedEventWithDates.status === "approved" || updatedEventWithDates.status === "confirmed" ? "#4CAF50" : "#FF9800"
                        }
                        : randevu
                );
            });

            handleDialogClose();
        } catch (error) {
            console.error("Randevu güncellenirken bir hata oluştu:", error);
        }
    };

    const handleDialogClose = () => {
        setRandevuDuzenlePopup(false);
        setRandevuEklePopup(false);
    };

    const handleEventChange = (key, value) => {
        setEventData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    return (
        <Default>
            <Grid2 container sx={{ height: "100%", width: "100%" }}>
                <Box sx={{ width: "100%", height: "100%" }}>
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
                                dayHeaderFormat: { weekday: 'long' }
                            },
                            timeGridWeek: {
                                buttonText: "Haftalık",
                                weekNumbers: true,
                                dayHeaderFormat: { weekday: 'long' }
                            },
                            dayGridMonth: {
                                buttonText: "Aylık",
                                dayHeaderFormat: { weekday: 'long' }
                            },
                            dayGridYear: {
                                buttonText: "Yıllık",
                                dayHeaderFormat: { weekday: 'long' }
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
                        eventOverlap={false}
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
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Randevu Başlığı"
                        value={eventData.title}
                        onChange={(e) => handleEventChange("title", e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                        error={!eventData.title}
                        helperText={!eventData.title ? "Bu alan zorunludur" : ""}
                    />
                    <TextField
                        label="Başlangıç Tarihi:"
                        value={eventData.start}
                        onChange={(e) => handleEventChange("start", e.target.value)}
                        fullWidth
                        margin="normal"
                        type="datetime-local"
                        required
                        error={!eventData.start}
                        helperText={!eventData.start ? "Bu alan zorunludur" : ""}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        label="Bitiş Tarihi:"
                        value={eventData.end}
                        onChange={(e) => handleEventChange("end", e.target.value)}
                        fullWidth
                        margin="normal"
                        type="datetime-local"
                        required
                        error={!eventData.end}
                        helperText={!eventData.end ? "Bu alan zorunludur" : ""}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <Autocomplete
                        options={clients}
                        getOptionLabel={(option) => option.name}
                        onChange={(e, value) => handleEventChange("client_id", value?.id || "")}
                        value={clients.find((client) => client.id === eventData.client_id) || null}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Danışan"
                                margin="normal"
                                required
                                error={!eventData.client_id}
                                helperText={!eventData.client_id ? "Bu alan zorunludur" : ""}
                            />
                        )}
                        fullWidth
                    />
                    {/* Status Selectbox (MUI) */}
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="status-label">Durum</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status-select"
                            value={eventData.status}
                            label="Durum"
                            onChange={(e) => handleEventChange("status", e.target.value)}
                        >
                            <MenuItem value="confirmed">Onaylandı</MenuItem>
                            <MenuItem value="pending">Beklemede</MenuItem>
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
                        disabled={
                            !eventData.title || !eventData.start || !eventData.end || !eventData.client_id
                        }
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
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Randevu Başlığı"
                        value={eventData.title}
                        onChange={(e) => handleEventChange("title", e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                        error={!eventData.title}
                        helperText={!eventData.title ? "Bu alan zorunludur" : ""}
                    />
                    <TextField
                        label="Başlangıç Tarihi"
                        value={eventData.start}
                        onChange={(e) => handleEventChange("start", e.target.value)}
                        fullWidth
                        margin="normal"
                        type="datetime-local"
                        required
                        error={!eventData.start}
                        helperText={!eventData.start ? "Bu alan zorunludur" : ""}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        label="Bitiş Tarihi"
                        value={eventData.end}
                        onChange={(e) => handleEventChange("end", e.target.value)}
                        fullWidth
                        margin="normal"
                        type="datetime-local"
                        required
                        error={!eventData.end}
                        helperText={!eventData.end ? "Bu alan zorunludur" : ""}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <Autocomplete
                        options={clients}
                        getOptionLabel={(option) => option.name}
                        onChange={(e, value) => handleEventChange("client_id", value?.id || "")}
                        value={clients.find((client) => client.id === eventData.client_id) || null}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Danışan"
                                margin="normal"
                                required
                                error={!eventData.client_id}
                                helperText={!eventData.client_id ? "Bu alan zorunludur" : ""}
                            />
                        )}
                        fullWidth
                    />
                    {/* Status Selectbox (MUI) */}
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="status-label">Durum</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status-select"
                            value={eventData.status}
                            label="Durum"
                            onChange={(e) => handleEventChange("status", e.target.value)}
                        >
                            <MenuItem value="confirmed">Onaylandı</MenuItem>
                            <MenuItem value="pending">Beklemede</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleEventSave}
                        color="primary"
                        disabled={
                            !eventData.title || !eventData.start || !eventData.end || !eventData.client_id
                        }
                    >
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>
        </Default>
    );
}
