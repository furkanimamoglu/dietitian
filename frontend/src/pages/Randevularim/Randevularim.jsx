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

    const handleDateClick = (arg) => {
        // Tıklanan tarih bilgisi
        console.log("Tıklanan tarih: ", arg.dateStr);

        // 'timeGridDay' görünümüne geçiş yapma
        const calendarApi = arg.view.calendar;
        calendarApi.changeView("timeGridDay", arg.dateStr);  // timeGridDay görünümünü aç
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
                            timeGridDay: { buttonText: "Günlük" },
                            timeGridWeek: { buttonText: "Haftalık" },
                            dayGridMonth: { buttonText: "Aylık" },
                            dayGridYear: { buttonText: "Yıllık" }
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
        </Default>
    );
}
