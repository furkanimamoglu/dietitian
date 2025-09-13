import React, {useEffect, useRef, useState} from 'react';
import {
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Fab,
    IconButton,
    Paper,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import './ChatBot.css';

// Markdown biçimlendirme fonksiyonu
const formatMessage = (text) => {
    if (!text) return '';

    // Başlıkları biçimlendir
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>');

    // Listeler için biçimlendirme
    const listPattern = /^\* (.+)$/gm;
    if (listPattern.test(formattedText)) {
        formattedText = formattedText.replace(
            /(\n\* (.+)(\n\* (.+))*)/g,
            function (match) {
                return '<ul>' + match.replace(/^\* (.+)$/gm, '<li>$1</li>') + '</ul>';
            }
        );
    }

    // Numaralı listeler için biçimlendirme
    const numberedListPattern = /^\d+\. (.+)$/gm;
    if (numberedListPattern.test(formattedText)) {
        formattedText = formattedText.replace(
            /(\n\d+\. (.+)(\n\d+\. (.+))*)/g,
            function (match) {
                return '<ol>' + match.replace(/^\d+\. (.+)$/gm, '<li>$1</li>') + '</ol>';
            }
        );
    }

    // Paragraflar için biçimlendirme
    formattedText = formattedText
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>');

    return formattedText;
};

const ChatBot = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            text: 'Merhaba! Ben Tia. Size Diyetia\'da rehberlik etmek için buradayım. Diyetia hakkında ki sorularınızı bana sorabilirsiniz. Ayrıca sizin için beslenme programları, yemek tarifleri ve egzersiz önerileri de sunabilirim. Size nasıl yardımcı olabilirim?',
            sender: 'bot',
            formatted: true
        }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const API_KEY = 'AIzaSyDzBGGL6TZP86mx47Ot190baPS2-cBe_oQ';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {text: input, sender: 'user'};
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const systemInstruction = "Sen Diyetia'nın yapay zeka asistanı Tia'sın. Sadece Türkçe dilinde yanıt ver. Başka herhangi bir dilde cevap verme. Her koşulda Türkçe dilini kullan. Karşında ki kişi bir diyetisyen ve sana yalnızca Beslenme Programları, Yemek Tarifleri, Egzersizler, İdeal Kilo, Fiziksel Aktiviteler, Kalori Hesaplamaları, Diyetia, Diyetia'nın kullanımı hakkında sorular sorabilir. Bunlar dışında bir şey sorarsa yalnızca bu alanlarda yardımcı olabileceğini söyle. Diyetia'nın kullanımı şu şekildedir: Danışan, Danışanlarım, Randevularım, Beslenme, Tarifler, Egzersizler, Finans sayfaları bulunmaktadır ve bu sayfalardan soru sorulabilir. Danışanlarım sayfası içerisinde kullanıcı Danışan ekleyebilir, Tüm danışanlara bildirim gönderebilir, QR okutabilir, Excel formatında danışanları içe aktarabilir veya dışa aktarabilir, Bir danışan üzerinde silme görüntüleme gibi işlemleri yapabilir ayrıca bir danışana çift tıklarsa danışanı görüntüler. Danışan Danışan sayfası içerisinde kullanıcı danışan için Anamnez Raporu oluşturabilir, Danışan ölçümlerini girebilir, Danışana atanmış olan beslenme programını ve uyulup uyulmadığını görüntüleyebilir, Su takibi yapabilir ve günlük su limitini yönetebilir, Önce ki atanmış randevuları görebilir, danışanın atanmış egzersizlerini görebilir, danışanın yaptığı ödemeleri görebilir. Randevularım sayfasında, google takvimler gibi bir kullanım bulunmaktadır, kullanıcı burada boş bir saate tıklayarak randevu alabilir, randevu silebilir ve randevuyu sürükleyip bırakarak başka saate atama yapabilir, randevuya tıklayarak o randevuyu düzenleyebilir, randevuya tıklayarak içerisinden randevu durumunu değiştirerek onaylayabilir. Beslenme sayfası içerisinde kullanıcı Beslenme Plan Kategorisi ekleyebilir, Beslenme plan kategorisi eklemeden Plan eklemesi mümkün değildir, Beslenme Plan kategorisi ekledikten sonra Beslenme Planı ekleyebilir, Beslenme Planı oluşturulduktan sonra sağ tarafta gösterim alanında her bir plan için 4 adet buton bulunur, bu butonlardan Yeşil Adam resimli buton planı danışana atamayı sağlar, danışana atama sırasında Danışan ve danışanın bu programa uyması beklenen süre seçilir istenirse özel not bırakılabilir, Mavi Print butonuna basılarak beslenme planını son hali PDF olarak çıkartılabilir. Beslenme planında sarı kalem butonuna basılarak Beslenme Planı düzenleme arayüzüne geçilebilir. Beslenme Planı Düzenleme arayüzünde Beslenme Planının adı, açıklaması, kategorisi, görseli ve plan düzenlenebilir. Beslenme Planı Düzenleme arayüzünde görünen saatlere tıklanılarak, öğün saatleri değiştirilebilir, günlerin yanında bulunan çarpı işaretine basılarak günler silinebilir veya günlerin en sağ tarafında ki + butonuna basılarak silinen gün geri eklenebilir, Ayrıca her günün üzerinde kopyala yapıştır butonları bulunmaktadır bu butonlarla günler diğer günlere kopyalanabilir, Yemek Ekle butonuyla öğüne yemek ve porsiyonu eklenebilir ayrıca aynı öğüne alternatif bir menü girilmek istenirse de Alternatif ekle butonuna basılabilir. Kırmızı Çöp butonu ile de Beslenme Planı silinebilir. Beslenme sayfasında sağ tarafta Plan Yönetimi yazan alanda Danışana basılarak, atanmış olan güncel plan görüntülenebilir. Tarifler ve Egzersizler sayfası da Beslenme sayfasına benzer şekilde çalışmaktadır sadece Plan düzenleme kısmı yoktur. Finans sayfasında Genel Bakış, Paket Yönetimi, Fatura Yönetimi olarak 3 bölüm bulunmaktadır. Genel Bakış içerisinde bu ay ki yapılan genel durum görüntülenmektedir. Paket yönetimi kısmında diyetisyenin danışanlara hazırladığı hizmet paketleri, fiyatları ve süreleri belirtilmiştir. Yeni Paket Ekle, Düzenle ve Sil butonları bulunmaktadır. Yeni Paket Ekle'ye basıldığında Paket Adı, Paket Tipi, Fiyat girildikten sonra Hizmetler de girilerek paket kaydedilebilir. Fatura Yönetimi alanında ise diyetisyenin danışanlara oluşturduğu faturalar görüntülenir, Yeni Fatura oluşturabilir, Ödemeleri Hatırlatma bildirimi gönderebilir ve Tutar Durum Fatura tarihi gibi güncel fatura bilgilerini takip edebilir. Yanıtlarını markdown formatında ver - başlıklar için **, alt başlıklar için ##, listeler için * kullan. Metin düzenlemesine özen göster, düzgün biçimlendirilmiş, okunaklı yanıtlar ver. Özellikle tarif ve beslenme programlarında listeleri düzenli şekilde madde işaretleriyle (*) yaz. Muhtemelen demeyi bırak.";

            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{text: systemInstruction + "\n\nKullanıcı mesajı: " + input}]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95
                    }
                })
            });

            const data = await response.json();
            if (data.candidates && data.candidates.length > 0) {
                const botResponse = {
                    text: data.candidates[0].content.parts[0].text,
                    sender: 'bot',
                    formatted: true
                };
                setMessages(prev => [...prev, botResponse]);
            } else {
                setMessages(prev => [...prev, {
                    text: 'Üzgünüm, şu anda cevap veremiyorum. Lütfen daha sonra tekrar deneyin.',
                    sender: 'bot'
                }]);
            }
        } catch (error) {
            console.error('Error connecting to Gemini API:', error);
            setMessages(prev => [...prev, {
                text: 'API ile bağlantı kurarken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
                sender: 'bot'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <Tooltip title="Asistan Tia" placement="left">
                <Fab
                    style={{backgroundColor: '#ff9e25'}}
                    aria-label="chat"
                    className="chat-fab"
                    onClick={handleClickOpen}
                >
                    <ChatIcon/>
                </Fab>
            </Tooltip>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{className: "chat-dialog"}}
            >
                <DialogTitle className="chat-dialog-title">
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                            <SmartToyIcon sx={{mr: 1, color: '#ff9e25'}}/>
                            <Typography sx={{color: '#fd9200'}} variant="h6">Asistan Tia</Typography>
                        </Box>
                        <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
                            <CloseIcon/>
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent dividers className="chat-dialog-content">
                    <Box className="message-container">
                        {messages.map((message, index) => (
                            <Box
                                key={index}
                                className={`message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}
                            >
                                <Paper elevation={2} className="message-bubble">
                                    {message.sender === 'bot' ? (
                                        <SmartToyIcon className="message-icon" fontSize="small"/>
                                    ) : (
                                        <PersonIcon className="message-icon" fontSize="small"/>
                                    )}
                                    {message.formatted ? (
                                        <Typography
                                            variant="body1"
                                            className="formatted-message"
                                            dangerouslySetInnerHTML={{__html: formatMessage(message.text)}}
                                        />
                                    ) : (
                                        <Typography variant="body1">{message.text}</Typography>
                                    )}
                                </Paper>
                            </Box>
                        ))}
                        {loading && (
                            <Box className="message bot-message">
                                <Paper elevation={2} className="message-bubble">
                                    <SmartToyIcon className="message-icon" fontSize="small"/>
                                    <CircularProgress size={20} thickness={4} sx={{color: '#ff9e25'}}/>
                                </Paper>
                            </Box>
                        )}
                        <div ref={messagesEndRef}/>
                    </Box>
                </DialogContent>

                <Box className="chat-input-container">
                    <TextField
                        autoFocus
                        margin="dense"
                        id="message"
                        fullWidth
                        variant="outlined"
                        placeholder="Mesajınızı yazın..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="chat-input"
                        multiline
                        maxRows={3}
                        sx={{
                            '& .MuiOutlinedInput-root.Mui-focused': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#ff9e25',
                                }
                            }
                        }}
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="send-button"
                        sx={{backgroundColor: '#ff9e25', color: 'white', '&:hover': {backgroundColor: '#f44336'}}}
                    >
                        <SendIcon/>
                    </IconButton>
                </Box>
            </Dialog>
        </>
    );
};

export default ChatBot;
