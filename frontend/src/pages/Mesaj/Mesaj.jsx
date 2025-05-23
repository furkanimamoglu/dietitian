import React, {useRef, useEffect, useState} from 'react';
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
    useTheme,
    Badge,
    Tooltip,
    Zoom,
    Fade,
    Menu,
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    CircularProgress
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
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import axios from "axios";
import config from "../../config.js";
import "./Mesaj.css";

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
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();

    const messageListRef = useRef();
    const messageInputRef = useRef();
    const fileInputRef = useRef();

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
                // Add some mock data for demo purposes
                const enhancedData = response.data.map(client => ({
                    ...client,
                    lastMessage: client.lastMessage || "",
                    unreadCount: Math.floor(Math.random() * 3)
                }));
                setDanisanList(enhancedData);
            })
            .catch((error) => {
                console.error("Error fetching clients:", error);
            });
    };

    const fetchMessages = (partnerId) => {
        setIsLoading(true);
        debugger;
        axios
            .get(config[config.environment].apiUrl + `/message/getMyMessages?partner_id=${partnerId}`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                }
            })
            .then((response) => {
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
                setMessages(formattedMessages);
            })
            .catch((error) => {
                console.error("Error fetching messages:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleDanisanSelect = (danisan) => {
        setSelectedDanisan(danisan);

        fetchMessages(danisan.id);

        setTimeout(() => {
            if (messageInputRef.current) {
                messageInputRef.current.focus();
            }
        }, 100);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === "" || !selectedDanisan) return;

        const newMsg = {
            id: Date.now(),
            text: newMessage,
            sender: "DIETITIAN",
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        };

        setMessages([...messages, newMsg]);
        setNewMessage("");

        const messageData = {
            receiver_id: selectedDanisan.id,
            message: newMessage,
            isRead: false
        };

        axios.post(config[config.environment].apiUrl + "/message/sendMessage",
            messageData,
        {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .catch(error => {
                console.error("Error sending message:", error);
            });
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
        if (!name) return '#1976d2'; // default color
        const colors = [
            '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2',
            '#c2185b', '#f57c00', '#0288d1', '#689f38'
        ];

        const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return colors[charCodeSum % colors.length];
    };

    const filteredDanisanList = danisanList.filter((danisan) =>
        `${danisan.name || ''} || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
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
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSize) {
            alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Simüle edilmiş dosya yükleme
            await simulateFileUpload(file, (progress) => {
                setUploadProgress(progress);
            });

            const fileUrl = URL.createObjectURL(file);
            const newMsg = {
                id: Date.now(),
                text: isImage ? null : 'Dosya gönderildi: ' + file.name,
                sender: "DIETITIAN",
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                file: {
                    url: fileUrl,
                    name: file.name,
                    type: file.type,
                    isImage
                }
            };

            setMessages(prev => [...prev, newMsg]);
        } catch (error) {
            console.error('Dosya yükleme hatası:', error);
            alert('Dosya yüklenirken bir hata oluştu.');
        } finally {
            setIsUploading(false);
            setFileUploadDialog(false);
        }
    };

    const simulateFileUpload = (file, progressCallback) => {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                progressCallback(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    resolve();
                }
            }, 200);
        });
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
                                                    <Badge
                                                        color="success"
                                                        variant="dot"
                                                    >
                                                        <Avatar
                                                            sx={{bgcolor: getAvatarColor(danisan.name || '')}}
                                                        >
                                                            {getInitials(danisan.name || '')}
                                                        </Avatar>
                                                    </Badge>
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
                                                            {danisan.unreadCount > 0 && (
                                                                <Badge
                                                                    badgeContent={danisan.unreadCount}
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
                                                                        <CheckCircleIcon sx={{
                                                                            fontSize: 12,
                                                                            color: message.sender === "DIETITIAN" ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'
                                                                        }}/>
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
                                                        <Tooltip title="Dosya/Resim ekle">
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => setFileUploadDialog(true)}
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

                                        <Divider sx={{my: 1}}/>

                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <Avatar sx={{bgcolor: theme.palette.success.light}}>
                                                    <HeightIcon/>
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="Boy"
                                                secondary={selectedDanisan.height ? `${selectedDanisan.height} cm` : "Belirtilmemiş"}
                                            />
                                        </ListItemButton>

                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <Avatar sx={{bgcolor: theme.palette.success.light}}>
                                                    <FitnessCenterIcon/>
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

            {/* File Upload Dialog */}
            <Dialog
                open={fileUploadDialog}
                onClose={() => !isUploading && setFileUploadDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Dosya/Resim Yükle
                    {!isUploading && (
                        <IconButton
                            aria-label="close"
                            onClick={() => setFileUploadDialog(false)}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                            }}
                        >
                            <CloseIcon/>
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent>
                    {isUploading ? (
                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3}}>
                            <CircularProgress variant="determinate" value={uploadProgress}/>
                            <Typography variant="body2" color="text.secondary">
                                Yükleniyor... {uploadProgress}%
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, py: 2}}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{display: 'none'}}
                                onChange={handleFileSelect}
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                            />
                            <Button
                                variant="outlined"
                                startIcon={<ImageIcon/>}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Resim Seç
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<AttachFileIcon/>}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Dosya Seç
                            </Button>
                            <Typography variant="caption" color="text.secondary" align="center">
                                Maksimum dosya boyutu: 5MB
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Default>
    );
}