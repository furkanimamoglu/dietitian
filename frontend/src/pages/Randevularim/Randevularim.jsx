import React, { useState } from "react";
import "./Randevularim.css";

import FullCalendar from "@fullcalendar/react";
import "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import Grid2 from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Default from "../../components/Layouts/Default.jsx";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";

export default function Randevularim() {
    const [randevular, setRandevu] = useState([
        {
            title: "Randevu 1",
            start: "2024-12-30T10:00:00",
            end: "2024-12-30T11:00:00",
        },
        {
            title: "Randevu 2",
            start: "2024-12-31T14:00:00",
            end: "2024-12-31T15:00:00",
        },
    ]);

    const [openDialog, setOpenDialog] = useState(false);
    const [randevuData, setRandevuData] = useState({
        title: "",
        start: "",
        end: "",
    });

    const handleDateClick = (arg) => {
        const currentView = arg.view.type; // Takvim görünümünü alıyoruz

        if (currentView === "dayGridMonth") {
            arg.view.calendar.changeView("timeGridDay", arg.date);
        } else if (currentView === "timeGridDay") {
            console.log("Günlük görünümde tıklandı, randevu ekle");
            setRandevuData({
                ...randevuData,
                start: arg.dateStr, // Tıklanan günün başlangıç tarihi
                end: arg.dateStr,   // Başlangıç ve bitişi aynı tutuyoruz
            });
            setOpenDialog(true); // Randevu ekleme popup'ını açıyoruz
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setRandevuData({
            title: "",
            start: "",
            end: "",
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRandevuData({ ...randevuData, [name]: value });
    };

    const handleSaveRandevu = () => {
        // Burada randevu kaydını gerçekleştirebilirsiniz (API çağrısı veya state güncellemesi)
        setRandevu([...randevular, randevuData]); // Yeni randevuyu ekliyoruz
        handleDialogClose(); // Dialogu kapatıyoruz
    };

    return (
        <Default>
            <Grid2 container sx={{ height: "100%", width: "100%" }}>
                {/* Takvim Box */}
                <Box sx={{ width: "100%", height: "100%" }}>
                    <FullCalendar
                        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        themeSystem={'bootstrap5'}
                        events={randevular}
                        editable={true}
                        droppable={true}
                        locale="tr"
                        contentHeight="68vh"
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "timeGridDay timeGridWeek dayGridMonth dayGridYear"
                        }}
                        navLinks={true}
                        businessHours={{
                            daysOfWeek: [1, 2, 3, 4, 5],
                            startTime: "09:00",
                            endTime: "18:00",
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
                    />
                </Box>
            </Grid2>

            {/* Randevu ekleme popup'ı */}
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Randevu Ekle</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Başlık"
                        name="title"
                        value={randevuData.title}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Başlangıç"
                        name="start"
                        value={randevuData.start}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        disabled
                    />
                    <TextField
                        label="Bitiş"
                        name="end"
                        value={randevuData.end}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        disabled
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        İptal
                    </Button>
                    <Button onClick={handleSaveRandevu} color="primary">
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>
        </Default>
    );
}
