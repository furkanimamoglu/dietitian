import React, { useRef, useEffect, useState } from 'react';
import './Mesaj.css';
import Default from "../../Components/Layouts/Default.jsx";
import {
    Box,
    Grid2,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    TextField,
    Typography,
    Button
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";
import config from "../../config.js";

export default function Mesaj() {
    const [danisanList, setDanisanList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDanisan, setSelectedDanisan] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const messageListRef = useRef();

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        axios
            .get(config[config.environment].apiUrl + "/dietitian/getAllMyClients", {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((response) => {
                setDanisanList(response.data);
            })
            .catch((error) => {
                console.error("Error fetching clients:", error);
            });
    }, []);

    const handleDanisanSelect = (danisan) => {
        setSelectedDanisan(danisan);
        setMessages([]);
    };

    const handleDeleteDanisan = (danisanId) => {
        const updatedList = danisanList.filter((danisan) => danisan.id !== danisanId);
        setDanisanList(updatedList);

        if (selectedDanisan?.id === danisanId) {
            setSelectedDanisan(null);
            setMessages([]);
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === "") return;
        const newMsg = {
            id: Date.now(),
            text: newMessage,
            timestamp: new Date().toLocaleTimeString(),
        };
        setMessages([...messages, newMsg]);
        setNewMessage("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    const filteredDanisanList = danisanList.filter((danisan) =>
        `${danisan.name} ${danisan.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Default>
            <Grid2 container sx={{ height: '100%' }}>
                {/* Sol Panel */}
                <Grid2
                    container
                    sx={{ height: '78vh', flex: 1, display: 'flex' }}
                    direction="column"
                    spacing={2}
                >
                    <Grid2>
                        <Paper elevation={3} sx={{ minHeight: "78vh", p: "0.5rem" }}>
                            {/* Danışan Ara */}
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Danışan Ara..."
                                variant="outlined"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {/* Danışan Listesi */}
                            <List
                                sx={{
                                    maxHeight: '70vh',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    mt: 1
                                }}
                            >
                                {filteredDanisanList && filteredDanisanList.length > 0 ? (
                                    filteredDanisanList.map((danisan) => (
                                        <ListItem
                                            key={danisan.id}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5',
                                                    '.delete-button': { visibility: 'visible' },
                                                },
                                                transition: 'background-color 0.2s',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <ListItemText
                                                primary={`${danisan.name} ${danisan.surname}`}
                                                onClick={() => handleDanisanSelect(danisan)}
                                            />
                                            {/* Sil Butonu */}
                                            <IconButton
                                                edge="end"
                                                className="delete-button"
                                                aria-label="delete"
                                                onClick={() => handleDeleteDanisan(danisan.id)}
                                                sx={{
                                                    visibility: 'hidden',
                                                    '&:hover': { backgroundColor: '#ff0000' },
                                                    backgroundColor: "#a50000",
                                                    color: 'white',
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItem>
                                    ))
                                ) : (
                                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                                        Danışan bulunamadı.
                                    </Typography>
                                )}
                            </List>
                        </Paper>
                    </Grid2>
                </Grid2>

                {/* Orta Panel (Sohbet) */}
                <Grid2
                    container
                    sx={{
                        height: '78vh',
                        width: '50vw',
                        ml: "1rem",
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                    }}
                >
                    {selectedDanisan ? (
                        <Paper elevation={3} sx={{ width: "100%", height: "100%", display: 'flex', flexDirection: 'column' }}>
                            {/* Danışan Bilgisi */}
                            <Typography variant="h6" sx={{ mb: 2, p: 2, borderBottom: "1px solid #ddd" }}>
                                {selectedDanisan.name} {selectedDanisan.surname} ile Sohbet
                            </Typography>

                            {/* Mesajlar */}
                            <Box
                                sx={{
                                    flex: 1,
                                    overflowY: "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                    p: 2,
                                    backgroundColor: "#f9f9f9",
                                }}
                                ref={messageListRef}
                            >
                                {messages.length > 0 ? (
                                    messages.map((message) => (
                                        <Box
                                            key={message.id}
                                            sx={{
                                                alignSelf: message.sender === "You" ? "flex-end" : "flex-start",
                                                backgroundColor: message.sender === "You" ? "#ffe3b3" : "#d1f7c4",
                                                p: 2,
                                                borderRadius: 2,
                                                maxWidth: "60%",
                                                boxShadow: 1,
                                            }}
                                        >
                                            <Typography variant="body1">{message.text}</Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{ display: "block", textAlign: "right", mt: 1 }}
                                            >
                                                {message.timestamp}
                                            </Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        Mesaj yok.
                                    </Typography>
                                )}
                            </Box>

                            {/* Mesaj Gönder */}
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    backgroundColor: "#ffffff",
                                    p: 1,
                                    borderTop: "1px solid #ddd",
                                }}
                            >
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Mesaj yaz..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSendMessage}
                                    endIcon={<SendIcon />}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Gönder
                                </Button>
                            </Box>
                        </Paper>
                    ) : (
                        <Typography
                            variant="h6"
                            color="textSecondary"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                textAlign: "center",
                            }}
                        >
                            Sohbet başlatmak için bir danışan seçin.
                        </Typography>
                    )}
                </Grid2>

                {/* Sağ Panel (Danışan Bilgileri) */}
                <Grid2
                    container
                    sx={{
                        height: '78vh',
                        width: '24vw',
                        ml: "1rem",
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {selectedDanisan ? (
                        <Paper elevation={3} sx={{ width: "100%", height: "100%", p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Danışan Bilgileri
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Ad:</strong> {selectedDanisan.name}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Soyad:</strong> {selectedDanisan.surname}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Cinsiyet:</strong> {selectedDanisan.gender}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Email:</strong> {selectedDanisan.email || "Bilinmiyor"}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Telefon:</strong> {selectedDanisan.phoneNumber || "Bilinmiyor"}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Boy:</strong> {selectedDanisan.height || "Yok"}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Kilo:</strong> {selectedDanisan.weight || "Yok"}
                            </Typography>
                        </Paper>
                    ) : (
                        <Paper elevation={3} sx={{ width: "100%", height: "100%", p: 2 }}>
                            <Typography
                                variant="h6"
                                color="textSecondary"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "100%",
                                    textAlign: "center",
                                }}
                            >
                                Danışan seçildiğinde bilgileri burada görünecek.
                            </Typography>
                        </Paper>
                    )}
                </Grid2>
            </Grid2>
        </Default>
    );
}
