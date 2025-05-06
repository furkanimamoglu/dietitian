import React, { useRef, useEffect, useState } from 'react';
import Default from "../../Components/Layouts/Default.jsx";
import {
    Avatar,
    Box,
    Chip,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Paper,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HeightIcon from '@mui/icons-material/Height';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WcIcon from '@mui/icons-material/Wc';
import axios from "axios";
import config from "../../config.js";
import "./Mesaj.css";

export default function Mesaj() {
    const [danisanList, setDanisanList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDanisan, setSelectedDanisan] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const theme = useTheme();

    const messageListRef = useRef();
    const messageInputRef = useRef();

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        fetchDanisanList();
    }, []);

    const fetchDanisanList = () => {
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
    };

    const handleDanisanSelect = (danisan) => {
        setSelectedDanisan(danisan);
        setMessages([
            {
                id: 1,
                text: "Merhaba, nasılsınız?",
                sender: "dietitian",
                timestamp: "09:30"
            },
            {
                id: 2,
                text: "İyiyim teşekkürler, bu hafta diyet programıma uydum.",
                sender: "client",
                timestamp: "09:32"
            }
        ]);

        // Input alanına odaklan
        setTimeout(() => {
            if (messageInputRef.current) {
                messageInputRef.current.focus();
            }
        }, 100);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === "") return;

        const newMsg = {
            id: Date.now(),
            text: newMessage,
            sender: "dietitian",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMsg]);
        setNewMessage("");

        // Gerçek uygulamada mesajı API'ye gönder
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getInitials = (name, surname) => {
        return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    };

    const getAvatarColor = (name) => {
        const colors = [
            '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2',
            '#c2185b', '#f57c00', '#0288d1', '#689f38'
        ];

        const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return colors[charCodeSum % colors.length];
    };

    const filteredDanisanList = danisanList.filter((danisan) =>
        `${danisan.name} ${danisan.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = () => {
        const today = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return today.toLocaleDateString('tr-TR', options);
    };

    return (
        <Default>
            <Box className="mesaj-container">

                <Grid container spacing={2} className="mesaj-grid">
                    {/* Sol Panel - Danışan Listesi */}
                    <Grid item xs={12} md={3} className="danisan-list-container">
                        <Paper elevation={2} className="danisan-list-paper">
                            <Box className="search-box">
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Danışan Ara..."
                                    variant="outlined"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            <Divider />

                            <List className="danisan-list">
                                {filteredDanisanList && filteredDanisanList.length > 0 ? (
                                    filteredDanisanList.map((danisan) => (
                                        <ListItemButton
                                            key={danisan.id}
                                            onClick={() => handleDanisanSelect(danisan)}
                                            selected={selectedDanisan?.id === danisan.id}
                                            className={selectedDanisan?.id === danisan.id ? "danisan-item-selected" : "danisan-item"}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{ bgcolor: getAvatarColor(danisan.name) }}
                                                >
                                                    {getInitials(danisan.name, danisan.surname)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={`${danisan.name} ${danisan.surname}`}
                                                secondary={danisan.lastMessage || "Danışan"}
                                            />
                                        </ListItemButton>
                                    ))
                                ) : (
                                    <ListItemButton>
                                        <ListItemText
                                            primary="Danışan bulunamadı"
                                            primaryTypographyProps={{ align: 'center', color: 'text.secondary' }}
                                        />
                                    </ListItemButton>
                                )}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Orta Panel - Mesajlaşma */}
                    <Grid item xs={12} md={6} className="chat-container">
                        <Paper elevation={2} className="chat-paper">
                            {selectedDanisan ? (
                                <>
                                    <Box className="chat-header">
                                        <Avatar
                                            sx={{ bgcolor: getAvatarColor(selectedDanisan.name) }}
                                        >
                                            {getInitials(selectedDanisan.name, selectedDanisan.surname)}
                                        </Avatar>
                                        <Box ml={1}>
                                            <Typography variant="h6">
                                                {selectedDanisan.name} {selectedDanisan.surname}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {selectedDanisan.lastActive || "Çevrimiçi"}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider />

                                    <Box className="messages-container" ref={messageListRef}>
                                        {messages.length > 0 ? (
                                            messages.map((message) => (
                                                <Box
                                                    key={message.id}
                                                    className={`message ${message.sender === "dietitian" ? "sent" : "received"}`}
                                                >
                                                    <Box className="message-content">
                                                        <Typography variant="body1">
                                                            {message.text}
                                                        </Typography>
                                                        <Typography variant="caption" className="message-time">
                                                            {message.timestamp}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ))
                                        ) : (
                                            <Box className="no-messages">
                                                <Typography variant="body2" color="text.secondary">
                                                    Henüz mesaj bulunmuyor. Sohbete başlayın!
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box className="message-input-container">
                                        <TextField
                                            fullWidth
                                            placeholder="Mesajınızı yazın..."
                                            variant="outlined"
                                            size="small"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            inputRef={messageInputRef}
                                            multiline
                                            maxRows={3}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            color="primary"
                                                            onClick={handleSendMessage}
                                                            disabled={!newMessage.trim()}
                                                        >
                                                            <SendIcon />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>
                                </>
                            ) : (
                                <Box className="no-chat-selected">
                                    <Typography variant="h6" color="text.secondary">
                                        Sohbete başlamak için bir danışan seçin
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Sağ Panel - Danışan Bilgileri */}
                    <Grid item xs={12} md={3} className="danisan-info-container">
                        <Paper elevation={2} className="danisan-info-paper">
                            {selectedDanisan ? (
                                <>
                                    <Box className="danisan-info-header">
                                        <Avatar
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                bgcolor: getAvatarColor(selectedDanisan.name)
                                            }}
                                        >
                                            {getInitials(selectedDanisan.name, selectedDanisan.surname)}
                                        </Avatar>
                                        <Typography variant="h6" mt={2} align="center">
                                            {selectedDanisan.name} {selectedDanisan.surname}
                                        </Typography>
                                        <Chip
                                            label={selectedDanisan.status || "Aktif Danışan"}
                                            color="primary"
                                            size="small"
                                            sx={{ mt: 1 }}
                                        />
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <List dense className="danisan-info-list">
                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                                                    <WcIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="Cinsiyet"
                                                secondary={selectedDanisan.gender || "Belirtilmemiş"}
                                            />
                                        </ListItemButton>

                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                                                    <EmailIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="E-posta"
                                                secondary={selectedDanisan.email || "Belirtilmemiş"}
                                            />
                                        </ListItemButton>

                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                                                    <PhoneIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="Telefon"
                                                secondary={selectedDanisan.phoneNumber || "Belirtilmemiş"}
                                            />
                                        </ListItemButton>

                                        <Divider sx={{ my: 1 }} />

                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                                                    <HeightIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="Boy"
                                                secondary={selectedDanisan.height ? `${selectedDanisan.height} cm` : "Belirtilmemiş"}
                                            />
                                        </ListItemButton>

                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                                                    <FitnessCenterIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="Kilo"
                                                secondary={selectedDanisan.weight ? `${selectedDanisan.weight} kg` : "Belirtilmemiş"}
                                            />
                                        </ListItemButton>

                                        {selectedDanisan.bmi && (
                                            <ListItemButton>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                                                        <InfoIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary="BMI"
                                                    secondary={selectedDanisan.bmi}
                                                />
                                            </ListItemButton>
                                        )}
                                    </List>
                                </>
                            ) : (
                                <Box className="no-danisan-selected">
                                    <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3 }} />
                                    <Typography variant="body1" color="text.secondary" mt={2}>
                                        Danışan seçildiğinde bilgileri burada görünecek
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Default>
    );
}