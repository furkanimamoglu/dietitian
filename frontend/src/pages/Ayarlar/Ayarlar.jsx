import React, {useState} from "react";
import Default from "../../Components/Layouts/Default.jsx";
import "./Ayarlar.css";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Modal,
    Paper,
    Select,
    Slider,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import {
    Brightness4,
    Close as CloseIcon,
    Edit as EditIcon,
    Language,
    Lock as LockIcon,
    Notifications,
    Person,
    Save,
    Settings as SettingsIcon,
    Visibility,
    VisibilityOff,
    School,
    WorkOutline,
    LocationOn,
    Description,
    AccessTime,
    ColorLens,
    Campaign,
    NotificationsActive
} from "@mui/icons-material";

function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
            {...other}
            className="tab-panel-container"
        >
            {value === index && (
                <Box sx={{p: 3}}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function Ayarlar() {
    const [tabValue, setTabValue] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);

    const [personalInfo, setPersonalInfo] = useState({
        name: "Dr. Furkan İmamoğlu",
        title: "Uzman Diyetisyen",
        email: "ayse.yilmaz@example.com",
        phone: "+90 555 123 4567",
        education: "Hacettepe Üniversitesi, Beslenme ve Diyetetik",
        experience: "8 yıl",
        specializations: ["Sporcu Beslenmesi", "Kilo Yönetimi", "Klinik Beslenme"],
        about: "Sağlıklı beslenme konusunda uzmanlaşmış, danışanlarıyla kişiselleştirilmiş beslenme programları oluşturmaya odaklanan bir diyetisyenim.",
        location: "İstanbul, Kadıköy",
        consultationHours: "Pazartesi - Cuma: 09:00 - 18:00",
        languages: ["Türkçe", "İngilizce"]
    });

    const [passwordInfo, setPasswordInfo] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });

    const [appSettings, setAppSettings] = useState({
        darkMode: false,
        danisanNotifications: true,
        randevuNotifications: true,
        messagingNotifications: true,
        autoLogout: 30,
        language: "Türkçe",
        colorTheme: "default",
        defaultSessionDuration: 60,
        defaultCaloriePlan: 1800,
        showWeightGraphs: true,
        enableMealReminders: true,
        showProgressReports: true
    });

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handlePersonalInfoChange = (e) => {
        setPersonalInfo({
            ...personalInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleSpecializationChange = (e, index) => {
        const updatedSpecializations = [...personalInfo.specializations];
        updatedSpecializations[index] = e.target.value;
        setPersonalInfo({
            ...personalInfo,
            specializations: updatedSpecializations
        });
    };

    const addSpecialization = () => {
        setPersonalInfo({
            ...personalInfo,
            specializations: [...personalInfo.specializations, ""]
        });
    };

    const removeSpecialization = (index) => {
        const updatedSpecializations = personalInfo.specializations.filter((_, i) => i !== index);
        setPersonalInfo({
            ...personalInfo,
            specializations: updatedSpecializations
        });
    };

    const handleAppSettingsChange = (e) => {
        const {name, value, checked} = e.target;
        setAppSettings({
            ...appSettings,
            [name]: e.target.type === 'checkbox' ? checked : value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordInfo({
            ...passwordInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveSettings = () => {
        // Simulating API call to save settings
        setTimeout(() => {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 500);
    };

    const handleChangePassword = () => {
        // Placeholder for password change logic
        if (passwordInfo.newPassword !== passwordInfo.confirmNewPassword) {
            // Handle error - passwords don't match
            return;
        }

        // Simulating API call to change password
        setTimeout(() => {
            setOpenPasswordModal(false);
            setSaveSuccess(true);
            setPasswordInfo({
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            });
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 500);
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleOpenPasswordModal = () => {
        setOpenPasswordModal(true);
    };

    const handleClosePasswordModal = () => {
        setOpenPasswordModal(false);
        setPasswordInfo({
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: ""
        });
    };

    const colorThemes = [
        {value: "default", label: "Varsayılan"},
        {value: "blue", label: "Mavi"},
        {value: "green", label: "Yeşil"},
        {value: "purple", label: "Mor"},
        {value: "orange", label: "Turuncu"},
    ];

    const languages = [
        {value: "Türkçe", label: "Türkçe"},
        {value: "English", label: "English"},
        {value: "Deutsch", label: "Deutsch"},
        {value: "Français", label: "Français"},
        {value: "Español", label: "Español"},
    ];

    const sessionDurations = [
        {value: 30, label: "30 dakika"},
        {value: 45, label: "45 dakika"},
        {value: 60, label: "1 saat"},
        {value: 90, label: "1.5 saat"},
        {value: 120, label: "2 saat"},
    ];

    return (
        <Default>
            <Box className="ayarlar-full-container">
                <Typography variant="h4" component="h1" className="ayarlar-title">
                    Ayarlar
                </Typography>

                {saveSuccess && (
                    <Alert severity="success" sx={{mb: 2}}>
                        Ayarlarınız başarıyla kaydedildi!
                    </Alert>
                )}

                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="settings tabs"
                        variant="fullWidth"
                        className="settings-tabs"
                    >
                        <Tab icon={<Person/>} iconPosition="start" label="Profil Bilgileri"/>
                        <Tab icon={<SettingsIcon/>} iconPosition="start" label="Uygulama Ayarları"/>
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card variant="outlined" className="settings-card profile-preview-card">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{mb: 3}}>
                                        Profil Önizleme
                                    </Typography>
                                    
                                    <Box className="profile-preview-container">
                                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3}}>
                                            <Avatar
                                                src="/profile-placeholder.jpg"
                                                sx={{width: 120, height: 120, mb: 2}}
                                            />
                                            <Typography variant="h5" align="center">{personalInfo.name}</Typography>
                                            <Typography variant="subtitle1" color="text.secondary" align="center">
                                                {personalInfo.title}
                                            </Typography>
                                            
                                            <Box sx={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0.5, mt: 2}}>
                                                {personalInfo.specializations.map((spec, index) => (
                                                    <Chip 
                                                        key={index}
                                                        label={spec}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                        
                                        <Divider sx={{my: 2}} />
                                        
                                        <Box sx={{mb: 2}}>
                                            <Typography variant="body2" sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                                <LocationOn fontSize="small" sx={{mr: 1, color: 'primary.main'}} />
                                                {personalInfo.location}
                                            </Typography>
                                            
                                            <Typography variant="body2" sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                                <School fontSize="small" sx={{mr: 1, color: 'primary.main'}} />
                                                {personalInfo.education}
                                            </Typography>
                                            
                                            <Typography variant="body2" sx={{display: 'flex', alignItems: 'center'}}>
                                                <WorkOutline fontSize="small" sx={{mr: 1, color: 'primary.main'}} />
                                                {personalInfo.experience} deneyim
                                            </Typography>
                                        </Box>
                                        
                                        <Divider sx={{my: 2}} />
                                        
                                        <Typography variant="body2" sx={{mb: 2}}>
                                            {personalInfo.about}
                                        </Typography>
                                        
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                        >
                                            Danışan Gözünden Görüntüle
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={8}>
                            <Card variant="outlined" className="settings-card">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Profil Bilgileri
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Bu bilgiler danışanlarınıza profilinizde görünecektir.
                                    </Typography>
                                    <Divider sx={{mb: 3}}/>

                                    <Box component="form" className="form-container">
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Ad Soyad"
                                                    name="name"
                                                    value={personalInfo.name}
                                                    onChange={handlePersonalInfoChange}
                                                    margin="normal"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Ünvan"
                                                    name="title"
                                                    value={personalInfo.title}
                                                    onChange={handlePersonalInfoChange}
                                                    margin="normal"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="E-posta"
                                                    name="email"
                                                    type="email"
                                                    value={personalInfo.email}
                                                    onChange={handlePersonalInfoChange}
                                                    margin="normal"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Telefon"
                                                    name="phone"
                                                    value={personalInfo.phone}
                                                    onChange={handlePersonalInfoChange}
                                                    margin="normal"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Konum"
                                                    name="location"
                                                    value={personalInfo.location}
                                                    onChange={handlePersonalInfoChange}
                                                    margin="normal"
                                                    variant="outlined"
                                                    placeholder="Şehir, İlçe"
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Eğitim"
                                                    name="education"
                                                    value={personalInfo.education}
                                                    onChange={handlePersonalInfoChange}
                                                    margin="normal"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Deneyim"
                                                    name="experience"
                                                    value={personalInfo.experience}
                                                    onChange={handlePersonalInfoChange}
                                                    margin="normal"
                                                    variant="outlined"
                                                    placeholder="Örn: 8 yıl"
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Çalışma Saatleri"
                                                    name="consultationHours"
                                                    value={personalInfo.consultationHours}
                                                    onChange={handlePersonalInfoChange}
                                                    margin="normal"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" sx={{mt: 2, mb: 1}}>Uzmanlık Alanları</Typography>
                                                {personalInfo.specializations.map((specialization, index) => (
                                                    <Box key={index} sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={specialization}
                                                            onChange={(e) => handleSpecializationChange(e, index)}
                                                            margin="dense"
                                                            variant="outlined"
                                                        />
                                                        <IconButton 
                                                            color="error" 
                                                            onClick={() => removeSpecialization(index)}
                                                            disabled={personalInfo.specializations.length <= 1}
                                                        >
                                                            <CloseIcon />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={addSpecialization}
                                                    sx={{mt: 1}}
                                                    disabled={personalInfo.specializations.length >= 5}
                                                >
                                                    Uzmanlık Alanı Ekle
                                                </Button>
                                            </Grid>
                                            
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Hakkımda"
                                                    name="about"
                                                    value={personalInfo.about}
                                                    onChange={handlePersonalInfoChange}
                                                    margin="normal"
                                                    variant="outlined"
                                                    multiline
                                                    rows={4}
                                                    helperText="Kendinizi ve çalışma prensiplerinizi kısaca tanıtın (300 karakter)"
                                                    inputProps={{ maxLength: 300 }}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 3}}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<LockIcon/>}
                                                onClick={handleOpenPasswordModal}
                                            >
                                                Şifremi Değiştir
                                            </Button>

                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<Save/>}
                                                onClick={handleSaveSettings}
                                            >
                                                Değişiklikleri Kaydet
                                            </Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" className="settings-card">
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <ColorLens color="primary" sx={{mr: 1}}/>
                                        <Typography variant="h6">
                                            Görünüm ve Dil
                                        </Typography>
                                    </Box>
                                    <Divider sx={{mb: 3}}/>

                                    <Box className="app-settings-container">
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={appSettings.darkMode}
                                                    onChange={handleAppSettingsChange}
                                                    name="darkMode"
                                                    color="primary"
                                                />
                                            }
                                            label="Karanlık Mod"
                                        />

                                        <FormControl fullWidth margin="normal">
                                            <InputLabel id="color-theme-label">Renk Teması</InputLabel>
                                            <Select
                                                labelId="color-theme-label"
                                                id="color-theme"
                                                value={appSettings.colorTheme}
                                                label="Renk Teması"
                                                name="colorTheme"
                                                onChange={handleAppSettingsChange}
                                            >
                                                {colorThemes.map(theme => (
                                                    <MenuItem key={theme.value} value={theme.value}>
                                                        {theme.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel id="language-label">Dil Seçimi</InputLabel>
                                            <Select
                                                labelId="language-label"
                                                id="language"
                                                value={appSettings.language}
                                                label="Dil Seçimi"
                                                name="language"
                                                onChange={handleAppSettingsChange}
                                            >
                                                {languages.map(lang => (
                                                    <MenuItem key={lang.value} value={lang.value}>
                                                        {lang.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </CardContent>
                            </Card>
                            
                            <Card variant="outlined" className="settings-card" sx={{mt: 3}}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <AccessTime color="primary" sx={{mr: 1}}/>
                                        <Typography variant="h6">
                                            Oturum Ayarları
                                        </Typography>
                                    </Box>
                                    <Divider sx={{mb: 3}}/>

                                    <Box className="app-settings-container">
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel id="session-duration-label">Varsayılan Seans Süresi</InputLabel>
                                            <Select
                                                labelId="session-duration-label"
                                                id="session-duration"
                                                value={appSettings.defaultSessionDuration}
                                                label="Varsayılan Seans Süresi"
                                                name="defaultSessionDuration"
                                                onChange={handleAppSettingsChange}
                                            >
                                                {sessionDurations.map(duration => (
                                                    <MenuItem key={duration.value} value={duration.value}>
                                                        {duration.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        
                                        <Typography gutterBottom sx={{mt: 2}}>Otomatik Çıkış Süresi (dakika)</Typography>
                                        <Slider
                                            value={appSettings.autoLogout}
                                            onChange={(e, newValue) => {
                                                setAppSettings({...appSettings, autoLogout: newValue});
                                            }}
                                            min={5}
                                            max={60}
                                            step={5}
                                            marks
                                            name="autoLogout"
                                            valueLabelDisplay="auto"
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" className="settings-card">
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <NotificationsActive color="primary" sx={{mr: 1}}/>
                                        <Typography variant="h6">
                                            Bildirim Ayarları
                                        </Typography>
                                    </Box>
                                    <Divider sx={{mb: 3}}/>

                                    <Box className="app-settings-container">
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={appSettings.danisanNotifications}
                                                    onChange={handleAppSettingsChange}
                                                    name="danisanNotifications"
                                                    color="primary"
                                                />
                                            }
                                            label="Yeni Danışan Bildirimleri"
                                        />

                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={appSettings.randevuNotifications}
                                                    onChange={handleAppSettingsChange}
                                                    name="randevuNotifications"
                                                    color="primary"
                                                />
                                            }
                                            label="Randevu Bildirimleri"
                                        />

                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={appSettings.messagingNotifications}
                                                    onChange={handleAppSettingsChange}
                                                    name="messagingNotifications"
                                                    color="primary"
                                                />
                                            }
                                            label="Mesajlaşma Bildirimleri"
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                            
                            <Card variant="outlined" className="settings-card" sx={{mt: 3}}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <Description color="primary" sx={{mr: 1}}/>
                                        <Typography variant="h6">
                                            Diyet ve Program Ayarları
                                        </Typography>
                                    </Box>
                                    <Divider sx={{mb: 3}}/>

                                    <Box className="app-settings-container">
                                        <TextField
                                            fullWidth
                                            label="Varsayılan Kalori Planı"
                                            name="defaultCaloriePlan"
                                            type="number"
                                            value={appSettings.defaultCaloriePlan}
                                            onChange={handleAppSettingsChange}
                                            margin="normal"
                                            variant="outlined"
                                            inputProps={{ min: 1200, max: 3000, step: 50 }}
                                            helperText="Kcal/gün"
                                        />
                                        
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={appSettings.showWeightGraphs}
                                                    onChange={handleAppSettingsChange}
                                                    name="showWeightGraphs"
                                                    color="primary"
                                                />
                                            }
                                            label="Kilo Takip Grafiklerini Göster"
                                        />
                                        
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={appSettings.enableMealReminders}
                                                    onChange={handleAppSettingsChange}
                                                    name="enableMealReminders"
                                                    color="primary"
                                                />
                                            }
                                            label="Öğün Hatırlatıcılarını Etkinleştir"
                                        />
                                        
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={appSettings.showProgressReports}
                                                    onChange={handleAppSettingsChange}
                                                    name="showProgressReports"
                                                    color="primary"
                                                />
                                            }
                                            label="İlerleme Raporlarını Göster"
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Save/>}
                                    onClick={handleSaveSettings}
                                >
                                    Tüm Ayarları Kaydet
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Box>

            {/* Password Change Modal */}
            <Modal
                open={openPasswordModal}
                onClose={handleClosePasswordModal}
                aria-labelledby="password-modal-title"
            >
                <Box className="password-modal">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography id="password-modal-title" variant="h6" component="h2">
                            Şifre Değiştir
                        </Typography>
                        <IconButton onClick={handleClosePasswordModal}>
                            <CloseIcon/>
                        </IconButton>
                    </Box>

                    <Divider sx={{mb: 3}}/>

                    <Box component="form" className="form-container">
                        <TextField
                            fullWidth
                            label="Mevcut Şifre"
                            name="currentPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordInfo.currentPassword}
                            onChange={handlePasswordChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Yeni Şifre"
                            name="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordInfo.newPassword}
                            onChange={handlePasswordChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Yeni Şifre (Tekrar)"
                            name="confirmNewPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordInfo.confirmNewPassword}
                            onChange={handlePasswordChange}
                            margin="normal"
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2}}>
                            <Button
                                variant="outlined"
                                onClick={handleClosePasswordModal}
                            >
                                İptal
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleChangePassword}
                            >
                                Şifreyi Değiştir
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </Default>
    );
}