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
    InputAdornment,
    Alert
} from '@mui/material';

import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';

import config from "../../config.js";
import Close from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import Person from "@mui/icons-material/Person";
import Notifications from "@mui/icons-material/Notifications";


export default function Randevularim() {
    const [randevular, setRandevular] = useState([]);
    const [clients, setClients] = useState([]);

    const [randevuEklePopup, setRandevuEklePopup] = useState(false);
    const [randevuDuzenlePopup, setRandevuDuzenlePopup] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmChangeDialogOpen, setConfirmChangeDialogOpen] = useState(false);
    const [originalAppointmentData, setOriginalAppointmentData] = useState(null);
    const [dragDropEventData, setDragDropEventData] = useState(null);
    const [dragDropArgument, setDragDropArgument] = useState(null);

    const [appointmentConflict, setAppointmentConflict] = useState(false);
    const [conflictMessage, setConflictMessage] = useState("");

    const [validationErrors, setValidationErrors] = useState({
        start: false,
        end: false,
        client_id: false
    });
    const [showValidation, setShowValidation] = useState(false);

    const [eventData, setEventData] = useState({
        id: null,
        note: "",
        start: "",
        end: "",
        client_id: "",
        status: "approved",
    });

    const [reminderButtonDisabled, setReminderButtonDisabled] = useState(false);

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
                    title: appointment.note,
                    note: appointment.note,
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

        fetchClients();
    }, []);

    const validateEventData = () => {
        const errors = {
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
            note: "",
            start: "",
            end: "",
            client_id: "",
            status: "approved",
        });
        setValidationErrors({
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
            const startDate = new Date(arg.date);
            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + 15);

            console.log("Tıklanan saat (yerel):", startDate.toLocaleTimeString());

            setEventData((prev) => ({
                ...prev,
                note: "",
                start: startDate,
                end: endDate,
                client_id: "",
                status: "approved",
            }));

            setValidationErrors({
                start: false,
                end: false,
                client_id: false
            });
            setShowValidation(false);

            checkAppointmentConflicts(startDate, endDate);

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

        setOriginalAppointmentData({
            id: event.id,
            note: event.title,
            start: event.start,
            end: event.end,
            client_id: event.extendedProps?.client_id,
            status: event.extendedProps?.status || "pending"
        });

        setEventData({
            id: event.id,
            note: event.title || "",
            start: event.start,
            end: event.end || event.start,
            client_id: event.extendedProps?.client_id || "",
            status: event.extendedProps?.status || "pending",
        });

        setValidationErrors({
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
            setDragDropEventData({
                id: event.id,
                note: event.title,
                start: event.start.toISOString(),
                end: event.end ? event.end.toISOString() : null,
                client_id: event.extendedProps?.client_id || "",
                status: event.extendedProps?.status || "pending",
            });

            const randevu = randevular.find(r => String(r.id) === String(event.id));
            setOriginalAppointmentData(randevu);

            setDragDropArgument(arg);

            setConfirmChangeDialogOpen(true);
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
                note: eventData.note,
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
                note: appointmentData.note || eventData.note,
                start: appointmentData.start || eventData.start,
                end: appointmentData.end || eventData.end,
                extendedProps: {
                    client_id: appointmentData.client_id || eventData.client_id,
                    status: appointmentData.status || "pending",
                },
                color: (appointmentData.status === "approved") ? "#4CAF50" : "#FF9800"
            };

            setRandevular((prevRandevular) => [...prevRandevular, newEvent]);

            try {
                const startDate = new Date(appointmentData.start || eventData.start);
                const date = startDate.toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                const time = startDate.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                const notificationData = {
                    client_id: appointmentData.client_id || eventData.client_id,
                    appointmentDetails: {
                        date: date,
                        time: time
                    }
                };

                const notificationResponse = await axios.post(
                    config[config.environment].apiUrl + "/notification/sendAppointmentNotification",
                    notificationData,
                    {
                        headers: {
                            Authorization: localStorage.getItem('token'),
                        },
                    }
                );

                console.log("Randevu bildirimi gönderildi:", notificationResponse.data);
            } catch (notificationError) {
                console.error("Randevu bildirimi gönderilirken bir hata oluştu:", notificationError);
            }

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

        setOriginalAppointmentData({
            id: eventData.id,
            note: eventData.note,
            start: eventData.start,
            end: eventData.end,
            client_id: eventData.client_id,
            status: eventData.status
        });

        setConfirmChangeDialogOpen(true);
    };

    const confirmAppointmentChange = async () => {
        try {
            if (dragDropEventData) {
                await confirmDragDropChange();
                return;
            }

            const updatedEventWithDates = {
                id: eventData.id,
                note: eventData.note,
                start: eventData.start,
                end: eventData.end,
                client_id: eventData.client_id,
                status: eventData.status,
            };

            const requestData = {
                appointment_id: updatedEventWithDates.id,
                note: updatedEventWithDates.note,
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
                            note: updatedEventWithDates.note,
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

            await sendAppointmentChangeNotification();

            setConfirmChangeDialogOpen(false);
            handleDialogClose();
            setShowValidation(false);
            showSuccessToast('Randevu başarıyla güncellendi!');
        } catch (error) {
            console.error("Randevu güncellenirken bir hata oluştu:", error);
            showErrorToast('Randevu güncellenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
        } finally {
            setDragDropEventData(null);
            setDragDropArgument(null);
        }
    };

    const confirmDragDropChange = async () => {
        try {
            const requestData = {
                appointment_id: dragDropEventData.id,
                note: dragDropEventData.note,
                start: dragDropEventData.start,
                end: dragDropEventData.end,
                client_id: dragDropEventData.client_id,
                status: dragDropEventData.status,
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

            const updatedStatus = response.data?.appointment?.status || dragDropEventData.status;

            setRandevular((prevRandevular) => {
                return prevRandevular.map((randevu) =>
                    String(randevu.id) === String(dragDropEventData.id)
                        ? {
                            ...randevu,
                            start: dragDropEventData.start,
                            end: dragDropEventData.end,
                            extendedProps: {
                                client_id: dragDropEventData.client_id,
                                status: updatedStatus,
                            },
                            color: updatedStatus === "approved" ? "#4CAF50" : "#FF9800"
                        }
                        : randevu
                );
            });

            await sendDragDropChangeNotification();

            setConfirmChangeDialogOpen(false);
            showSuccessToast('Randevu başarıyla güncellendi!');
        } catch (error) {
            console.error("Sürükle-bırak işleminde hata oluştu:", error);
            showErrorToast('Randevu güncellenirken bir hata oluştu');
            if (dragDropArgument) {
                dragDropArgument.revert();
            }
        }
    };

    const sendReminderNotification = async () => {
        try {
            if (!eventData.start || !eventData.client_id) {
                showErrorToast('Randevu tarihi ve danışan bilgisi gereklidir.');
                return;
            }

            const startDate = new Date(eventData.start);

            const date = startDate.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const time = startDate.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            const requestData = {
                client_id: eventData.client_id,
                appointmentDetails: {
                    date: date,
                    time: time
                }
            };

            const response = await axios.post(
                config[config.environment].apiUrl + "/notification/sendAppointmentReminder",
                requestData,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                }
            );

            showSuccessToast(response.data?.message || 'Randevu hatırlatma bildirimi gönderildi!');

            setReminderButtonDisabled(true);
            setTimeout(() => {
                setReminderButtonDisabled(false);
            }, 5000);
        } catch (error) {
            console.error("Hatırlatma bildirimi gönderilirken bir hata oluştu:", error);
            showErrorToast('Bildirim gönderilemedi: ' + (error.response?.data?.message || error.message));
        }
    };

    const sendAppointmentChangeNotification = async () => {
        try {
            if (!eventData.start || !eventData.client_id) {
                showErrorToast('Randevu tarihi ve danışan bilgisi gereklidir.');
                return;
            }

            const startDate = new Date(eventData.start);

            const date = startDate.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const time = startDate.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            const requestData = {
                client_id: eventData.client_id,
                appointmentDetails: {
                    date: date,
                    time: time
                }
            };

            const response = await axios.post(
                config[config.environment].apiUrl + "/notification/sendAppointmentChangeNotification",
                requestData,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                }
            );

            console.log("Randevu değişikliği bildirimi başarılı:", response.data);
            return true;
        } catch (error) {
            console.error("Değişiklik bildirimi gönderilirken bir hata oluştu:", error);
            showErrorToast('Değişiklik bildirimi gönderilemedi: ' + (error.response?.data?.message || error.message));
            return false;
        }
    };

    const sendDragDropChangeNotification = async () => {
        try {
            if (!dragDropEventData || !dragDropEventData.start || !dragDropEventData.client_id) {
                showErrorToast('Randevu tarihi ve danışan bilgisi gereklidir.');
                return false;
            }

            const startDate = new Date(dragDropEventData.start);

            const date = startDate.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const time = startDate.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            const requestData = {
                client_id: dragDropEventData.client_id,
                appointmentDetails: {
                    date: date,
                    time: time
                }
            };

            const response = await axios.post(
                config[config.environment].apiUrl + "/notification/sendAppointmentChangeNotification",
                requestData,
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                }
            );

            console.log("Randevu değişikliği bildirimi başarılı:", response.data);
            return true;
        } catch (error) {
            console.error("Değişiklik bildirimi gönderilirken bir hata oluştu:", error);
            showErrorToast('Değişiklik bildirimi gönderilemedi: ' + (error.response?.data?.message || error.message));
            return false;
        }
    };

    const handleChangeDialogClose = () => {
        if (dragDropArgument) {
            dragDropArgument.revert();
        }

        setConfirmChangeDialogOpen(false);
        setDragDropEventData(null);
        setDragDropArgument(null);
    };

    const handleDialogClose = () => {
        if (randevuDuzenlePopup && originalAppointmentData && calendarRef.current) {
            const calendar = calendarRef.current.getApi();
            const existingEvent = calendar.getEventById(originalAppointmentData.id);

            if (existingEvent) {
                existingEvent.setProp('title', originalAppointmentData.note);
                existingEvent.setStart(originalAppointmentData.start);
                existingEvent.setEnd(originalAppointmentData.end);

                existingEvent.setExtendedProp('client_id', originalAppointmentData.client_id);
                existingEvent.setExtendedProp('status', originalAppointmentData.status);
            }
        }

        setRandevuDuzenlePopup(false);
        setRandevuEklePopup(false);
        setShowValidation(false);
        setValidationErrors({
            start: false,
            end: false,
            client_id: false
        });
        setAppointmentConflict(false);
        setConflictMessage("");
        setOriginalAppointmentData(null);
    };

    const checkAppointmentConflicts = (start, end, currentAppointmentId = null) => {
        if (!start || !end) return false;

        const startTime = new Date(start);
        const endTime = new Date(end);

        if (startTime >= endTime) {
            setAppointmentConflict(true);
            setConflictMessage("Başlangıç zamanı bitiş zamanından sonra olamaz.");
            return true;
        }

        const conflictingAppointment = randevular.find(appointment => {
            if (currentAppointmentId && String(appointment.id) === String(currentAppointmentId)) {
                return false;
            }

            const appointmentStart = new Date(appointment.start);
            const appointmentEnd = new Date(appointment.end || appointment.start);

            return (startTime < appointmentEnd && endTime > appointmentStart);
        });

        if (conflictingAppointment) {
            const client = clients.find(c => String(c.id) === String(conflictingAppointment.extendedProps?.client_id));
            const clientName = client ? client.name : "Bilinmeyen Danışan";

            const conflictStartTime = new Date(conflictingAppointment.start).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            const conflictEndTime = conflictingAppointment.end ?
                new Date(conflictingAppointment.end).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }) : conflictStartTime;

            setAppointmentConflict(true);
            setConflictMessage(`Bu saatte "${clientName}" için "${conflictingAppointment.note}" randevusu bulunuyor. (${conflictStartTime} - ${conflictEndTime})`);
            return true;
        }

        setAppointmentConflict(false);
        setConflictMessage("");
        return false;
    };

    const handleEventChange = (key, value) => {
        setEventData((prev) => ({
            ...prev,
            [key]: value,
        }));

        if (showValidation && value) {
            setValidationErrors(prev => ({
                ...prev,
                [key]: false
            }));
        }

        if ((key === "start" || key === "end") && eventData.start && eventData.end) {
            const startToCheck = key === "start" ? value : eventData.start;
            const endToCheck = key === "end" ? value : eventData.end;

            const currentId = randevuDuzenlePopup ? eventData.id : null;
            checkAppointmentConflicts(startToCheck, endToCheck, currentId);
        }
    };

    const handleEventDelete = async () => {
        try {
            const appointmentId = eventData.id;
            console.log("Silinecek randevu ID:", appointmentId);

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

            setRandevular((prevRandevular) =>
                prevRandevular.filter((randevu) => String(randevu.id) !== String(appointmentId))
            );

            showSuccessToast('Randevu başarıyla silindi!');

            try {
                const randevuTarihi = new Date(eventData.start);
                const formattedDate = randevuTarihi.toISOString().split('T')[0];
                const formattedTime = randevuTarihi.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                await axios.post(
                    `${config[config.environment].apiUrl}/notification/sendAppointmentCancellationNotification`,
                    {
                        client_id: eventData.clientId || eventData.client_id,
                        appointmentDetails: {
                            date: formattedDate,
                            time: formattedTime
                        }
                    },
                    {
                        headers: {
                            Authorization: localStorage.getItem('token'),
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log("Randevu iptal bildirimi başarıyla gönderildi");
            } catch (notificationError) {
                console.error("Randevu iptal bildirimi gönderilirken hata:", notificationError);
            }

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
                        timeZone={'local'}
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

                            const startTime = arg.event.start ? new Date(arg.event.start).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
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
                                            {arg.event.note}
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
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                        <DateTimePicker
                            label="Başlangıç Tarihi"
                            value={eventData.start ? new Date(eventData.start) : null}
                            onChange={(newValue) => {
                                handleEventChange("start", newValue ? newValue.toISOString() : '')
                            }}
                            ampm={false}
                            views={['year', 'month', 'day', 'hours', 'minutes']}
                            disablePast
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
                            disablePast
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
                    <TextField
                        label="Randevu Notu"
                        value={eventData.note}
                        onChange={(e) => handleEventChange("note", e.target.value)}
                        fullWidth
                        margin="normal"
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
                            <MenuItem value="cancelled">Reddedildi</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Çakışma mesajı için Alert bileşeni */}
                    {appointmentConflict && conflictMessage && (
                        <Alert severity="error" sx={{marginTop: 2}}>
                            {conflictMessage}
                        </Alert>
                    )}
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
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                        <DateTimePicker
                            label="Başlangıç Tarihi"
                            value={eventData.start ? new Date(eventData.start) : null}
                            onChange={(newValue) => {
                                handleEventChange("start", newValue ? newValue.toISOString() : '')
                            }}
                            ampm={false}
                            views={['year', 'month', 'day', 'hours', 'minutes']}
                            disablePast
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
                            disablePast
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
                    <TextField
                        label="Randevu Notu"
                        value={eventData.note}
                        onChange={(e) => handleEventChange("note", e.target.value)}
                        fullWidth
                        margin="normal"
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
                            <MenuItem value="cancelled">Reddedildi</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Çakışma mesajı için Alert bileşeni */}
                    {appointmentConflict && conflictMessage && (
                        <Alert severity="error" sx={{marginTop: 2}}>
                            {conflictMessage}
                        </Alert>
                    )}
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
                        onClick={sendReminderNotification}
                        color="info"
                        disabled={reminderButtonDisabled}
                        startIcon={<Notifications />}
                    >
                        Randevu Hatırlat
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
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5, fontWeight: 'medium', fontSize: '16px'}}>
                            <Box>
                                <strong>Tarih/Saat:</strong> {eventData.start ?
                                    `${new Date(eventData.start).toLocaleDateString('tr-TR', {day: '2-digit', month: '2-digit', year: 'numeric'})} - 
                                    ${new Date(eventData.start).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})} / 
                                    ${new Date(eventData.end).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}`
                                    : ''}
                            </Box>
                            <Box>
                                <strong>Danışan:</strong> {clients.find(client => String(client.id) === String(eventData.client_id))?.name || 'Belirtilmemiş'}
                            </Box>
                            <Box sx={{mt: 1}}>
                                Bu randevuyu silmek istediğinize emin misiniz?
                            </Box>
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

            {/* Değişiklik Onay Diyaloğu */}
            <Dialog
                open={confirmChangeDialogOpen}
                onClose={() => setConfirmChangeDialogOpen(false)}
                aria-labelledby="change-confirm-dialog-title"
                aria-describedby="change-confirm-dialog-description"
                PaperProps={{
                    sx: {
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        padding: '10px'
                    }
                }}
            >
                <DialogTitle
                    id="change-confirm-dialog-title"
                    sx={{
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #e9ecef',
                        padding: '16px 24px',
                        fontWeight: 'bold',
                        color: '#fd9200',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <Notifications color="primary"/>
                    Randevu Değişikliği Onayı
                </DialogTitle>
                <DialogContent sx={{padding: '24px', paddingTop: '24px !important'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <Box sx={{ fontWeight: 'medium', fontSize: '16px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {originalAppointmentData?.start && originalAppointmentData?.end ? (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                        <span style={{ fontWeight: 'bold', color: '#f44336', marginRight: '8px' }}>Eski:</span>
                                        {new Date(originalAppointmentData.start).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        {' '} - {' '}
                                        <span style={{ fontWeight: 'bold' }}>
                                            {new Date(originalAppointmentData.start).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            {' '} - {' '}
                                            {new Date(originalAppointmentData.end).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                                        <span style={{ fontWeight: 'bold', color: '#4caf50', marginRight: '8px' }}>Yeni:</span>
                                        {dragDropEventData ?
                                            <>
                                                {new Date(dragDropEventData.start).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                {' '} - {' '}
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {new Date(dragDropEventData.start).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    {' '} - {' '}
                                                    {dragDropEventData.end ?
                                                        new Date(dragDropEventData.end).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) :
                                                        ''
                                                    }
                                                </span>
                                            </> :
                                            <>
                                                {new Date(eventData.start).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                {' '} - {' '}
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {new Date(eventData.start).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    {' '} - {' '}
                                                    {new Date(eventData.end).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </>
                                        }
                                    </Box>
                                    <Box sx={{ mt: 1 }}>Bu değişikliği onaylıyor musunuz?</Box>
                                </>
                            ) : (
                                'Tarih bilgisi bulunamadı'
                            )}
                        </Box>
                        <Box sx={{color: 'text.secondary', fontSize: '14px'}}>
                            Değişiklikleri onaylamak için "Onayla" butonuna tıklayın. İptal etmek için "Vazgeç" butonuna tıklayın.
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{padding: '16px 24px', borderTop: '1px solid #e9ecef'}}>
                    <Button
                        onClick={handleChangeDialogClose}
                        color="inherit"
                        sx={{fontWeight: 'medium'}}
                    >
                        Vazgeç
                    </Button>
                    <Button
                        onClick={confirmAppointmentChange}
                        color="primary"
                        variant="contained"
                        autoFocus
                        sx={{
                            fontWeight: 'medium',
                            boxShadow: 'none',
                            '&:hover': {boxShadow: 'none'}
                        }}
                    >
                        Onayla
                    </Button>
                </DialogActions>
            </Dialog>
        </Default>
    );
}

