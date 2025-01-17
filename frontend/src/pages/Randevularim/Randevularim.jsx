import React, {useEffect, useState} from "react";
import axios from "axios";
import "./Randevularim.css";

import FullCalendar from "@fullcalendar/react";
import "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import Default from "../../components/Layouts/Default.jsx";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid2,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import config from "../../config.js";

export default function Randevularim() {
    const [randevular, setRandevular] = useState([]);
    const [clients, setClients] = useState([]); // Dietisyenin tüm client'larını burada tutacağız

    // Randevu ekleme/düzenleme pop-up'ları için kullanılan state
    const [randevuEklePopup, setRandevuEklePopup] = useState(false);
    const [randevuDuzenlePopup, setRandevuDuzenlePopup] = useState(false);

    const [eventData, setEventData] = useState({
        id: null,
        title: "",
        start: "",
        end: "",
        client_id: "", // Burada client_id'yi ekliyoruz
    });

    // 1) Diyetisyene ait RANDEVULARI çekiyoruz
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
                const appointments = response.data.appointment;

                const formattedAppointments = appointments.map((appointment) => ({
                    id: appointment.id,
                    title: appointment.title,
                    start: appointment.start,
                    end: appointment.end,
                    extendedProps: {
                        client_id: appointment.client_id,
                    }
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
                console.log(response)
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
            };

            const requestData = {
                appointment_id: updatedEvent.id,
                title: updatedEvent.title,
                start: updatedEvent.start,
                end: updatedEvent.end,
                client_id: updatedEvent.client_id,
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

            console.log("Randevu güncelleme başarılı:", response.data);

            setRandevular((prevRandevular) => {
                return prevRandevular.map((randevu) =>
                    String(randevu.id) === String(updatedEvent.id)
                        ? {
                            ...randevu,
                            start: updatedEvent.start,
                            end: updatedEvent.end,
                            extendedProps: {
                                client_id: updatedEvent.client_id,
                            },
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
            };

            const requestData = {
                appointment_id: updatedEventWithDates.id,
                title: updatedEventWithDates.title,
                start: updatedEventWithDates.start,
                end: updatedEventWithDates.end,
                client_id: updatedEventWithDates.client_id,
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
                            },
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
                        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        timeZone={'UTC'}
                        themeSystem={'bootstrap5'}
                        events={randevular}
                        editable={true}
                        droppable={true}
                        locale="tr"
                        contentHeight="68vh"
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
                        slotDuration="00:30:00"
                        slotLabelInterval="0:30"
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
                <DialogTitle>Yeni Randevu Ekle</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Randevu Başlığı"
                        value={eventData.title}
                        onChange={(e) => handleEventChange("title", e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Başlangıç Tarihi:"
                        value={eventData.start}
                        onChange={(e) => handleEventChange("start", e.target.value)}
                        fullWidth
                        margin="normal"
                        type="datetime-local"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        label="Bitiş Tarihi:"
                        value={eventData.end}
                        onChange={(e) => handleEventChange("end", e.target.value)}
                        fullWidth
                        margin="normal"
                        type="datetime-local"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="client-select-label">Müşteri Seç</InputLabel>
                        <Select
                            labelId="client-select-label"
                            label="Müşteri Seç"
                            value={eventData.client_id}
                            onChange={(e) => handleEventChange("client_id", e.target.value)}
                        >
                            {clients.map((client) => (
                                <MenuItem key={client.id} value={client.id}>
                                    {client.name} {/* Örneğin client.name */}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="secondary">
                        Vazgeç
                    </Button>
                    <Button onClick={randevuEkle} color="primary">
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Event Düzenle Popup */}
            <Dialog open={randevuDuzenlePopup} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>Randevu Düzenle</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Randevu Başlığı"
                        value={eventData.title}
                        onChange={(e) => handleEventChange("title", e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Başlangıç Tarihi:"
                        value={eventData.start}
                        onChange={(e) => handleEventChange("start", e.target.value)}
                        fullWidth
                        margin="normal"
                        type="datetime-local"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        label="Bitiş Tarihi:"
                        value={eventData.end}
                        onChange={(e) => handleEventChange("end", e.target.value)}
                        fullWidth
                        margin="normal"
                        type="datetime-local"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="client-select-label-edit">Müşteri Seç</InputLabel>
                        <Select
                            labelId="client-select-label-edit"
                            label="Müşteri Seç"
                            value={eventData.client_id}
                            onChange={(e) => handleEventChange("client_id", e.target.value)}
                        >
                            {clients.map((client) => (
                                <MenuItem key={client.id} value={client.id}>
                                    {client.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="secondary">
                        Vazgeç
                    </Button>
                    <Button onClick={handleEventSave} color="primary">
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>
        </Default>
    );
}
