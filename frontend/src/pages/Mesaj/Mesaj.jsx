import React, {useCallback, useEffect, useRef, useState} from 'react';
import Default from "../../Components/Layouts/Default.jsx";
import "./Mesaj.css";

import {
    Avatar,
    Badge,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Fade,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Menu,
    Paper,
    TextField,
    Tooltip,
    Typography,
    useTheme,
    Zoom
} from "@mui/material";

import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HeightIcon from '@mui/icons-material/Height';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WcIcon from '@mui/icons-material/Wc';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StraightenIcon from '@mui/icons-material/Straighten';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ScaleIcon from '@mui/icons-material/Scale';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import axios from "axios";
import config from "../../config.js";

export default function Mesaj() {
    const [danisanList, setDanisanList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDanisan, setSelectedDanisan] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [emojiPickerAnchor, setEmojiPickerAnchor] = useState(null);
    const [fileUploadDialog, setFileUploadDialog] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [lastMessageId, setLastMessageId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [measurements, setMeasurements] = useState(null); // Ölçüm verileri için state eklendi
    const theme = useTheme();

    const messageListRef = useRef();
    const messageInputRef = useRef();
    const fileInputRef = useRef();
    const intervalRef = useRef();

    useEffect(() => {
        if (messageListRef.current) {
            setTimeout(() => {
                messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
            }, 100);
        }
    }, [messages]);

    useEffect(() => {
        if (selectedDanisan && messageListRef.current) {
            setTimeout(() => {
                messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
            }, 300);
        }
    }, [selectedDanisan]);

    const checkNewMessages = useCallback(async (partnerId) => {
        if (!partnerId) return;

        try {
            const response = await axios.get(
                config[config.environment].apiUrl + `/message/getMyMessages?partner_id=${partnerId}`,
                {
                    headers: {
                        Authorization: localStorage.getItem("token"),
                    }
                }
            );

            if (!response.data || response.data.length === 0) {
                return;
            }

            const formattedMessages = response.data.map(msg => ({
                id: msg.id,
                text: msg.message,
                sender: msg.sender,
                timestamp: new Date(msg.createdAt).toLocaleString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                isRead: msg.isRead
            }));

            const latestMessageId = Math.max(...formattedMessages.map(msg => msg.id));

            if (lastMessageId !== null && latestMessageId <= lastMessageId) {
                return;
            }

            const newMessages = formattedMessages.filter(msg =>
                lastMessageId === null || msg.id > lastMessageId
            );

            if (newMessages.length > 0) {
                console.log(`${newMessages.length} yeni mesaj alındı`);

                if (lastMessageId === null) {
                    setMessages(formattedMessages);
                } else {
                    setMessages(prevMessages => [...prevMessages, ...newMessages]);
                }

                setLastMessageId(latestMessageId);
            }

        } catch (error) {
            console.error("Yeni mesajları kontrol ederken hata:", error);
        }
    }, [lastMessageId]);

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (!selectedDanisan) {
            return;
        }

        checkNewMessages(selectedDanisan.id);

        intervalRef.current = setInterval(() => {
            checkNewMessages(selectedDanisan.id);
        }, 10000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [selectedDanisan?.id, checkNewMessages]);

    useEffect(() => {
        fetchDanisanList();
    }, []);

    const [unreadCounts, setUnreadCounts] = useState({});

    const fetchUnreadMessageCounts = useCallback(async () => {
        try {
            if (!danisanList || danisanList.length === 0) return;

            const promises = danisanList.map(danisan =>
                axios.get(
                    config[config.environment].apiUrl + `/message/getMyUnreadMessageCount?partner_id=${danisan.id}`,
                    {
                        headers: {
                            Authorization: localStorage.getItem("token"),
                        }
                    }
                )
            );

            const responses = await Promise.all(promises);

            const newUnreadCounts = danisanList.reduce((acc, danisan, index) => {
                acc[danisan.id] = responses[index]?.data.unreadMessageCount || 0;
                return acc;
            }, {});

            setUnreadCounts(newUnreadCounts);
        } catch (error) {
            console.error("Okunmamış mesaj sayısını alırken hata:", error);
        }
    }, [danisanList]);


    useEffect(() => {
        if (danisanList.length > 0) {
            fetchUnreadMessageCounts();
        }

        const interval = setInterval(() => {
            if (danisanList.length > 0) {
                fetchUnreadMessageCounts();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchUnreadMessageCounts]);

    const fetchDanisanList = () => {
        axios
            .get(config[config.environment].apiUrl + "/dietitian/getAllMyClients", {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            })
            .then((response) => {
                const enhancedData = response.data.map(client => ({
                    ...client,
                    lastMessage: client.lastMessage || "",
                    unreadCount: 0
                }));
                setDanisanList(enhancedData);

                setTimeout(() => {
                    fetchUnreadMessageCounts();
                }, 100);
            })
            .catch((error) => {
                console.error("Error fetching clients:", error);
            });
    };

    const markMessagesAsRead = useCallback(async (partnerId) => {
        if (!partnerId) return;

        try {
            await axios.post(
                config[config.environment].apiUrl + `/message/changeMessageStatusToReaded?partner_id=${partnerId}`,
                {},
                {
                    headers: {
                        Authorization: localStorage.getItem("token"),
                    }
                }
            );

            setUnreadCounts(prev => ({
                ...prev,
                [partnerId]: 0
            }));

        } catch (error) {
            console.error("Mesajları okundu olarak işaretlerken hata:", error);
        }
    }, []);

    const handleDanisanSelect = (danisan) => {
        setSelectedDanisan(danisan);
        setMessages([]);
        setLastMessageId(null);
        setMeasurements(null); // Yeni danışan seçildiğinde ölçümleri sıfırla

        // Danışan seçildiğinde ölçüm verilerini getir
        fetchClientMeasurements(danisan.id);

        markMessagesAsRead(danisan.id);

        setTimeout(() => {
            if (messageInputRef.current) {
                messageInputRef.current.focus();
            }
        }, 100);
    };

    // Danışanın ölçüm verilerini getiren fonksiyon
    const fetchClientMeasurements = async (clientId) => {
        try {
            const response = await axios.get(
                config[config.environment].apiUrl + `/measurement/getClientMeasurement?client_id=${clientId}`,
                {
                    headers: {
                        Authorization: localStorage.getItem("token"),
                    }
                }
            );

            if (response.data && response.data.length > 0) {
                // En son ölçüm verisini al
                setMeasurements(response.data[0]);
            } else {
                setMeasurements(null);
            }
        } catch (error) {
            console.error("Danışan ölçümlerini getirirken hata:", error);
            setMeasurements(null);
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === "" || !selectedDanisan) return;

        const tempId = Date.now();
        const newMsg = {
            id: tempId,
            text: newMessage,
            sender: "DIETITIAN",
            timestamp: new Date().toLocaleString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            isRead: false
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");

        const messageData = {
            receiver_id: selectedDanisan.id,
            message: newMessage,
            isRead: false
        };

        try {
            const response = await axios.post(
                config[config.environment].apiUrl + "/message/sendMessage",
                messageData,
                {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                }
            );

            if (response.data && response.data.id) {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === tempId
                            ? {...msg, id: response.data.id}
                            : msg
                    )
                );

                setLastMessageId(response.data.id);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return `${name.charAt(0)}`.toUpperCase();
    };

    const getAvatarColor = (name) => {
        if (!name) return '#1976d2';
        const colors = [
            '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2',
            '#c2185b', '#f57c00', '#0288d1', '#689f38'
        ];

        const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return colors[charCodeSum % colors.length];
    };

    const filteredDanisanList = danisanList.filter((danisan) =>
        `${danisan.name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = () => {
        const today = new Date();
        const options = {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'};
        return today.toLocaleDateString('tr-TR', options);
    };

    const handleEmojiSelect = (emoji) => {
        setNewMessage(prev => prev + emoji.native);
        setEmojiPickerAnchor(null);
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const maxSize = 5 * 1024 * 1024;

        if (!isImage) {
            alert('Sadece resim dosyaları yükleyebilirsiniz.');
            return;
        }

        if (file.size > maxSize) {
            alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.post(
                config[config.environment].apiUrl + "/upload?type=message&client_id=" + selectedDanisan.id,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: localStorage.getItem("token"),
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    },
                }
            );

            if (response.data && response.data.imageUrl) {
                const imageUrl = response.data.imageUrl;

                const messageText = `[RESIM:${imageUrl}]`;

                const messageData = {
                    receiver_id: selectedDanisan.id,
                    message: messageText,
                    isRead: false
                };

                const tempId = Date.now();
                const newMsg = {
                    id: tempId,
                    text: null,
                    sender: "DIETITIAN",
                    timestamp: new Date().toLocaleString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    file: {
                        url: imageUrl,
                        name: file.name,
                        type: file.type,
                        isImage: true
                    }
                };

                setMessages(prev => [...prev, newMsg]);

                try {
                    const msgResponse = await axios.post(
                        config[config.environment].apiUrl + "/message/sendMessage",
                        messageData,
                        {
                            headers: {
                                Authorization: localStorage.getItem("token")
                            }
                        }
                    );

                    if (msgResponse.data && msgResponse.data.id) {
                        setMessages(prev =>
                            prev.map(msg =>
                                msg.id === tempId
                                    ? {...msg, id: msgResponse.data.id}
                                    : msg
                            )
                        );

                        setLastMessageId(msgResponse.data.id);
                    }
                } catch (msgError) {
                    console.error("Resim mesajı gönderirken hata:", msgError);
                    setMessages(prev => prev.filter(msg => msg.id !== tempId));
                }
            } else {
                throw new Error('Resim URL\'i alınamadı.');
            }
        } catch (error) {
            console.error('Resim yükleme hatası:', error);
            alert('Resim yüklenirken bir hata oluştu.');
        } finally {
            setIsUploading(false);
            setFileUploadDialog(false);
        }
    };

    const renderMessage = (message) => {
        if (message.file) {
            if (message.file.isImage) {
                return (
                    <Box sx={{maxWidth: '300px', maxHeight: '300px', overflow: 'hidden', borderRadius: '8px'}}>
                        <img
                            src={message.file.url}
                            alt={message.file.name}
                            style={{width: '100%', height: 'auto', display: 'block'}}
                        />
                    </Box>
                );
            } else {
                return (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        padding: '8px',
                        borderRadius: '8px'
                    }}>
                        <AttachFileIcon/>
                        <Typography variant="body2" component="a" href={message.file.url} download={message.file.name}>
                            {message.file.name}
                        </Typography>
                    </Box>
                );
            }
        }

        if (message.text && typeof message.text === 'string') {
            const imageMatch = message.text.match(/^\[RESIM:(.*?)\]$/);
            if (imageMatch) {
                const imageUrl = imageMatch[1];
                return (
                    <Box sx={{maxWidth: '300px', maxHeight: '300px', overflow: 'hidden', borderRadius: '8px'}}>
                        <img
                            src={imageUrl}
                            alt="Gönderilen resim"
                            style={{width: '100%', height: 'auto', display: 'block'}}
                        />
                    </Box>
                );
            }
        }

        return (
            <Typography variant="body1">
                {message.text}
            </Typography>
        );
    };

    return (
        <Default>
            <Box className="mesaj-container">
                <Grid container spacing={2} className="mesaj-grid">
                    {/* Sol Panel - Danışan Listesi */}
                    <Grid item xs={12} md={3} className="danisan-list-container">
                        <Paper elevation={3} className="danisan-list-paper">
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
                                                <SearchIcon color="action"/>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            <Divider/>

                            <List className="danisan-list">
                                {filteredDanisanList && filteredDanisanList.length > 0 ? (
                                    filteredDanisanList.map((danisan) => (
                                        <Zoom in={true}
                                              style={{transitionDelay: `${filteredDanisanList.indexOf(danisan) * 100}ms`}}
                                              key={danisan.id}>
                                            <ListItemButton
                                                onClick={() => handleDanisanSelect(danisan)}
                                                selected={selectedDanisan?.id === danisan.id}
                                                className={selectedDanisan?.id === danisan.id ? "danisan-item-selected" : "danisan-item"}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        src={danisan.profilePhoto || undefined}
                                                        sx={{bgcolor: danisan.profilePhoto ? undefined : getAvatarColor(danisan.name || '')}}
                                                    >
                                                        {!danisan.profilePhoto && getInitials(danisan.name || '')}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                                            <Typography variant="body1" noWrap>
                                                                {danisan.name || ''}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                noWrap
                                                                sx={{maxWidth: '80%'}}
                                                            >
                                                                {danisan.lastMessage || "Yeni danışan"}
                                                            </Typography>
                                                            {unreadCounts[danisan.id] > 0 && (
                                                                <Badge
                                                                    badgeContent={unreadCounts[danisan.id]}
                                                                    color="primary"
                                                                    size="small"
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItemButton>
                                        </Zoom>
                                    ))
                                ) : (
                                    <ListItemButton>
                                        <ListItemText
                                            primary="Danışan bulunamadı"
                                            primaryTypographyProps={{align: 'center', color: 'text.secondary'}}
                                        />
                                    </ListItemButton>
                                )}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Orta Panel - Mesajlaşma */}
                    <Grid item xs={12} md={6} className="chat-container">
                        <Paper elevation={3} className="chat-paper">
                            {selectedDanisan ? (
                                <>
                                    <Box className="chat-header">
                                        <Avatar
                                            sx={{bgcolor: getAvatarColor(selectedDanisan.name || '')}}
                                        >
                                            {getInitials(selectedDanisan.name || '')}
                                        </Avatar>
                                        <Box ml={1} sx={{flexGrow: 1}}>
                                            <Typography variant="h6">
                                                {selectedDanisan.name || ''}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" sx={{fontWeight: 'bold'}}>
                                            {formatDate()}
                                        </Typography>
                                    </Box>

                                    <Divider/>

                                    <Box className="messages-container" ref={messageListRef}>
                                        <Box sx={{p: 2, textAlign: 'center'}}>
                                            <Chip
                                                label={`Sohbet başladı - ${formatDate()}`}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Box>

                                        {isLoading ? (
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100%'
                                            }}>
                                                <CircularProgress size={40}/>
                                            </Box>
                                        ) : messages.length > 0 ? (
                                            messages.map((message) => (
                                                <Fade in={true} key={message.id}>
                                                    <Box
                                                        className={`message ${message.sender === "DIETITIAN" ? "sent" : "received"}`}
                                                    >
                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: message.sender === "DIETITIAN" ? 'flex-end' : 'flex-start',
                                                            width: '100%'
                                                        }}>
                                                            <Typography variant="caption"
                                                                        className="message-sender-label">
                                                                {message.sender === "DIETITIAN" ? "Diyetisyen" : "Danışan"}
                                                            </Typography>
                                                            <Box className="message-content">
                                                                {renderMessage(message)}
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'flex-end',
                                                                    alignItems: 'center',
                                                                    gap: 0.5
                                                                }}>
                                                                    <Typography variant="caption"
                                                                                className="message-time">
                                                                        {message.timestamp}
                                                                    </Typography>
                                                                    {message.sender === "DIETITIAN" && (
                                                                        <CheckCircleIcon sx={{fontSize: 12, color: message.sender === "DIETITIAN" ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'}}/>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Fade>
                                            ))
                                        ) : (
                                            <Box className="no-messages">
                                                <Typography variant="body2" color="text.secondary">
                                                    Henüz mesaj bulunmuyor. Sohbete başlayın!
                                                </Typography>
                                            </Box>
                                        )}

                                        {isTyping && (
                                            <Box className="message received typing-indicator">
                                                <Box className="message-content">
                                                    <Box sx={{display: 'flex', gap: 1}}>
                                                        <span className="typing-dot"></span>
                                                        <span className="typing-dot"></span>
                                                        <span className="typing-dot"></span>
                                                    </Box>
                                                </Box>
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
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Tooltip title="Emoji ekle">
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={(e) => setEmojiPickerAnchor(e.currentTarget)}
                                                            >
                                                                <EmojiEmotionsIcon/>
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Resim gönder">
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => fileInputRef.current?.click()}
                                                            >
                                                                <AttachFileIcon/>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Tooltip title="Gönder">
                                                            <IconButton
                                                                color="primary"
                                                                onClick={handleSendMessage}
                                                                disabled={!newMessage.trim()}
                                                                sx={{
                                                                    backgroundColor: newMessage.trim() ? theme.palette.primary.main : 'inherit',
                                                                    color: newMessage.trim() ? 'white' : 'inherit',
                                                                    '&:hover': {
                                                                        backgroundColor: newMessage.trim() ? theme.palette.primary.dark : 'inherit',
                                                                    }
                                                                }}
                                                            >
                                                                <SendIcon/>
                                                            </IconButton>
                                                        </Tooltip>
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
                                    <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                        Danışanlarınızla mesajlaşmaya başlayın 💬
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Sağ Panel - Danışan Bilgileri */}
                    <Grid item xs={12} md={3} className="danisan-info-container">
                        <Paper elevation={3} className="danisan-info-paper">
                            {selectedDanisan ? (
                                <>
                                    <Box className="danisan-info-header">
                                        <Avatar
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                bgcolor: getAvatarColor(selectedDanisan.name || '')
                                            }}
                                        >
                                            {getInitials(selectedDanisan.name || '')}
                                        </Avatar>
                                        <Typography variant="h6" mt={2} align="center">
                                            {selectedDanisan.name || ''}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{my: 2}}/>

                                    <List dense className="danisan-info-list">
                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <Avatar sx={{bgcolor: theme.palette.primary.light}}>
                                                    <WcIcon/>
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="Cinsiyet"
                                                secondary={selectedDanisan.gender || "Belirtilmemiş"}
                                            />
                                        </ListItemButton>

                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <Avatar sx={{bgcolor: theme.palette.primary.light}}>
                                                    <EmailIcon/>
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="E-posta"
                                                secondary={selectedDanisan.email || "Belirtilmemiş"}
                                            />
                                        </ListItemButton>

                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <Avatar sx={{bgcolor: theme.palette.primary.light}}>
                                                    <PhoneIcon/>
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="Telefon"
                                                secondary={selectedDanisan.phoneNumber || "Belirtilmemiş"}
                                            />
                                        </ListItemButton>

                                        {selectedDanisan.bmi && (
                                            <ListItemButton>
                                                <ListItemAvatar>
                                                    <Avatar sx={{bgcolor: theme.palette.success.light}}>
                                                        <InfoIcon/>
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary="BMI"
                                                    secondary={selectedDanisan.bmi}
                                                />
                                            </ListItemButton>
                                        )}

                                        {/* Ölçüm verileri bölümü */}
                                        {measurements && (
                                            <>
                                                <Divider sx={{my: 2}} />
                                                <Typography variant="subtitle1" sx={{px: 2, fontWeight: 'bold', color: theme.palette.primary.main}}>
                                                    Son Ölçüm Bilgileri
                                                </Typography>
                                                <Box sx={{px: 2, mt: 1}}>
                                                    <Grid container spacing={1}>
                                                        <Grid item xs={6}>
                                                            <Paper
                                                                elevation={0}
                                                                sx={{
                                                                    p: 1,
                                                                    bgcolor: theme.palette.primary.light,
                                                                    color: 'white',
                                                                    borderRadius: 1,
                                                                    textAlign: 'center',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <HeightIcon />
                                                                <Typography variant="caption" sx={{fontWeight: 'bold'}}>Boy</Typography>
                                                                <Typography variant="body2">{measurements.boy} cm</Typography>
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Paper
                                                                elevation={0}
                                                                sx={{
                                                                    p: 1,
                                                                    bgcolor: theme.palette.success.light,
                                                                    color: 'white',
                                                                    borderRadius: 1,
                                                                    textAlign: 'center',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <MonitorWeightIcon />
                                                                <Typography variant="caption" sx={{fontWeight: 'bold'}}>Kilo</Typography>
                                                                <Typography variant="body2">{measurements.kilo} kg</Typography>
                                                            </Paper>
                                                        </Grid>

                                                        {/* Diğer ölçüm değerleri - 4 kutu ile ayrı satırda gösterilecek */}
                                                        <Grid item xs={12}>
                                                            <Typography variant="caption" sx={{mt: 1, display: 'block', color: theme.palette.text.secondary}}>
                                                                Diğer Ölçümler
                                                            </Typography>
                                                        </Grid>

                                                        <Grid item xs={3}>
                                                            <Paper
                                                                elevation={0}
                                                                sx={{
                                                                    p: 1,
                                                                    bgcolor: theme.palette.info.light,
                                                                    color: 'white',
                                                                    borderRadius: 1,
                                                                    textAlign: 'center',
                                                                    height: '100%',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <StraightenIcon fontSize="small" />
                                                                <Typography variant="caption" sx={{fontWeight: 'bold'}}>Bel</Typography>
                                                                <Typography variant="body2">{measurements.bel} cm</Typography>
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <Paper
                                                                elevation={0}
                                                                sx={{
                                                                    p: 1,
                                                                    bgcolor: theme.palette.warning.light,
                                                                    color: 'white',
                                                                    borderRadius: 1,
                                                                    textAlign: 'center',
                                                                    height: '100%',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <StraightenIcon fontSize="small" />
                                                                <Typography variant="caption" sx={{fontWeight: 'bold'}}>Kalça</Typography>
                                                                <Typography variant="body2">{measurements.kalca} cm</Typography>
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <Paper
                                                                elevation={0}
                                                                sx={{
                                                                    p: 1,
                                                                    bgcolor: theme.palette.error.light,
                                                                    color: 'white',
                                                                    borderRadius: 1,
                                                                    textAlign: 'center',
                                                                    height: '100%',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <StraightenIcon fontSize="small" />
                                                                <Typography variant="caption" sx={{fontWeight: 'bold'}}>Göğüs</Typography>
                                                                <Typography variant="body2">{measurements.gogus} cm</Typography>
                                                            </Paper>
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <Paper
                                                                elevation={0}
                                                                sx={{
                                                                    p: 1,
                                                                    bgcolor: theme.palette.secondary.light,
                                                                    color: 'white',
                                                                    borderRadius: 1,
                                                                    textAlign: 'center',
                                                                    height: '100%',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <StraightenIcon fontSize="small" />
                                                                <Typography variant="caption" sx={{fontWeight: 'bold'}}>Kol</Typography>
                                                                <Typography variant="body2">{measurements.kol} cm</Typography>
                                                            </Paper>
                                                        </Grid>

                                                        <Grid item xs={12}>
                                                            <Box sx={{mt: 1}}>
                                                                <Grid container spacing={1}>
                                                                    <Grid item xs={4}>
                                                                        <Paper
                                                                            elevation={0}
                                                                            sx={{
                                                                                p: 1,
                                                                                bgcolor: 'rgba(244, 167, 89, 0.8)',
                                                                                color: 'white',
                                                                                borderRadius: 1,
                                                                                textAlign: 'center',
                                                                                display: 'flex',
                                                                                flexDirection: 'column',
                                                                                alignItems: 'center'
                                                                            }}
                                                                        >
                                                                            <ScaleIcon fontSize="small" />
                                                                            <Typography variant="caption" sx={{fontWeight: 'bold'}}>Yağ</Typography>
                                                                            <Typography variant="body2">%{measurements.yag}</Typography>
                                                                        </Paper>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Paper
                                                                            elevation={0}
                                                                            sx={{
                                                                                p: 1,
                                                                                bgcolor: 'rgba(90, 173, 246, 0.8)',
                                                                                color: 'white',
                                                                                borderRadius: 1,
                                                                                textAlign: 'center',
                                                                                display: 'flex',
                                                                                flexDirection: 'column',
                                                                                alignItems: 'center'
                                                                            }}
                                                                        >
                                                                            <FitnessCenterIcon fontSize="small" />
                                                                            <Typography variant="caption" sx={{fontWeight: 'bold'}}>Kas</Typography>
                                                                            <Typography variant="body2">%{measurements.kas}</Typography>
                                                                        </Paper>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <Paper
                                                                            elevation={0}
                                                                            sx={{
                                                                                p: 1,
                                                                                bgcolor: 'rgba(79, 195, 247, 0.8)',
                                                                                color: 'white',
                                                                                borderRadius: 1,
                                                                                textAlign: 'center',
                                                                                display: 'flex',
                                                                                flexDirection: 'column',
                                                                                alignItems: 'center'
                                                                            }}
                                                                        >
                                                                            <WaterDropIcon fontSize="small" />
                                                                            <Typography variant="caption" sx={{fontWeight: 'bold'}}>Su</Typography>
                                                                            <Typography variant="body2">%{measurements.su}</Typography>
                                                                        </Paper>
                                                                    </Grid>
                                                                </Grid>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>

                                                    <Box sx={{mt: 1, textAlign: 'center'}}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Son ölçüm tarihi: {new Date(measurements.createdAt).toLocaleDateString('tr-TR')}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </>
                                        )}
                                    </List>
                                </>
                            ) : (
                                <Box className="no-danisan-selected">
                                    <PersonIcon sx={{fontSize: 60, color: 'text.secondary', opacity: 0.3}}/>
                                    <Typography variant="body1" color="text.secondary" mt={2}>
                                        Danışan seçildiğinde bilgileri burada görünecek
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Emoji Picker */}
            <Menu
                anchorEl={emojiPickerAnchor}
                open={Boolean(emojiPickerAnchor)}
                onClose={() => setEmojiPickerAnchor(null)}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Box sx={{p: 1}}>
                    <Picker
                        data={data}
                        onEmojiSelect={handleEmojiSelect}
                        theme={theme.palette.mode}
                    />
                </Box>
            </Menu>

            {/* Gizli dosya giriş alanı */}
            <input
                type="file"
                ref={fileInputRef}
                style={{display: 'none'}}
                onChange={handleFileSelect}
                accept="image/*"
            />

            {/* Resim yükleme işlemi sırasında gösterilecek ilerleme bildirimi */}
            {isUploading && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: '80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        zIndex: 1000
                    }}
                >
                    <CircularProgress variant="determinate" value={uploadProgress} size={24}/>
                    <Typography variant="body2">
                        Resim yükleniyor... {uploadProgress}%
                    </Typography>
                </Box>
            )}
        </Default>
    );
}
