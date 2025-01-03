import React, { useState } from "react";
import "./Randevularim.css";

import FullCalendar from "@fullcalendar/react";
import "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import Default from "../../components/Layouts/Default.jsx";

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid2, Box } from '@mui/material';

export default function Randevularim() {

    const [randevular, setRandevular] = useState([
        {
            id: 1,
            title: "Randevu 1",
            start: "2025-01-01T10:00:00",
            end: "2025-01-02T11:00:00",
        },
        {
            id: 2,
            title: "Randevu 2",
            start: "2025-01-05T14:00:00",
            end: "2025-01-05T15:00:00",
        },
    ]);

    const [eventData, setEventData] = useState({
        title: "",
        start: "",
        end: "",
    });

    const [randevuEklePopup, setRandevuEklePopup] = useState(false);
    const [randevuDuzenlePopup, setRandevuDuzenlePopup] = useState(false);

    const handleDateClick = (arg) => {
        const currentView = arg.view.type;

        if (currentView === "dayGridMonth" || currentView === "dayGridYear") {
            arg.view.calendar.changeView("timeGridDay", arg.date);
        } else {
            const startDate = new Date( arg.dateStr);
            const endDate = new Date(arg.dateStr);
            endDate.setHours(endDate.getHours() + 1);

            setEventData({
                title: "",
                start: startDate.toISOString().slice(0, 16),
                end: endDate.toISOString().slice(0, 16),
            });

            setRandevuEklePopup(true);
        }
    };

    const randevuDuzenle = (arg) => {
        const event = arg.event;

        setEventData({
            id: event.id,
            title: event.title,
            start: event.start.toISOString().slice(0, 16),
            end: event.end.toISOString().slice(0, 16),
        });

        setRandevuDuzenlePopup(true);
    }

    const randevuEkle = () => {
        const newEvent = {
            ...eventData,
            id: randevular.length + 1, // Yeni bir id ataması yapılabilir
            start: eventData.start,
            end: eventData.end,
        };

        // Yeni randevuyu mevcut randevulara ekle
        setRandevular(prevRandevular => {
            const updatedRandevular = [...prevRandevular, newEvent];
            return updatedRandevular; // Yeni listeyi döndür
        });
        setRandevuEklePopup(false);
    };

    const handleEventClick = (arg) => {
        randevuDuzenle(arg);
    };

    const handleEventResize = (arg) => {
        console.log('Event Title:', arg.event.title);
        console.log('Start Date:', arg.event.start.toISOString());
        console.log('End Date:', arg.event.end ? arg.event.end.toISOString() : 'N/A');
        //randevuDuzenle(arg);
    }

    const handleEventDrop = (arg) => {
        console.log('Event Title:', arg.event.title);
        console.log('Start Date:', arg.event.start.toISOString());
        console.log('End Date:', arg.event.end ? arg.event.end.toISOString() : 'N/A');
        //randevuDuzenle(arg);
    }

    const handleRandevuEkleButton = (arg) => {
        setEventData({
            title: "",
            start: "",
            end: "",
        });

        setRandevuEklePopup(true);
    }

    const handleEventChange = (updatedEvent) => {
        setEventData(updatedEvent); // eventData'yı güncelliyoruz
    };

    const handleEventSave = () => {
        const updatedEventWithDates = {
            ...eventData,
            start: eventData.start,
            end: eventData.end,
        };

        setRandevular(prevRandevular => {
            const updatedRandevular = prevRandevular.map(randevu =>
                String(randevu.id) === String(updatedEventWithDates.id)
                    ? { ...randevu, ...updatedEventWithDates }
                    : randevu
            );
            return updatedRandevular;
        });
        handleDialogClose();
    };


    const handleDialogClose = () => {
        setRandevuDuzenlePopup(false);
        setRandevuEklePopup(false);
    };

    return (
        <Default>
            <Grid2 container sx={{ height: "100%", width: "100%" }}>
                <Box sx={{ width: "100%", height: "100%" }}>
                    {/* TODO: Resize Event sırasında eğer kullanıcı kaydetmezse, event eski boyutuna geri dönmeli */}
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
                        eventResize={handleEventResize}
                        eventDrop={handleEventDrop}
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
                        name="title"
                        value={eventData.title}
                        onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Başlangıç Tarihi:"
                        name="start"
                        value={eventData.start}
                        onChange={(e) => setEventData({ ...eventData, start: e.target.value })}
                        fullWidth
                        margin="normal"
                        type="datetime-local"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        label="Bitiş Tarihi:"
                        name="end"
                        value={eventData.end}
                        onChange={(e) => setEventData({ ...eventData, end: e.target.value })}
                        fullWidth
                        margin="normal"
                        type="datetime-local"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
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
                        name="title"
                        value={eventData.title}
                        onChange={(e) => handleEventChange({ ...eventData, title: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Başlangıç Tarihi:"
                        name="start"
                        value={eventData.start}
                        onChange={(e) => handleEventChange({ ...eventData, start: e.target.value })}
                        fullWidth
                        margin="normal"
                        type="datetime-local"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        label="Bitiş Tarihi:"
                        name="end"
                        value={eventData.end}
                        onChange={(e) => handleEventChange({ ...eventData, end: e.target.value })}
                        fullWidth
                        margin="normal"
                        type="datetime-local"
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
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
