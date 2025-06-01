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
    CircularProgress,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    Slider,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";

import Close from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import Person from '@mui/icons-material/Person';
import Save from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Email from '@mui/icons-material/Email';
import Phone from '@mui/icons-material/Phone';
import AccessTime from '@mui/icons-material/AccessTime';
import ColorLens from '@mui/icons-material/ColorLens';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import Description from '@mui/icons-material/Description';
import KeyOutlined from '@mui/icons-material/KeyOutlined';

import config from "../../config.js";
import {showErrorToast, showSuccessToast} from '../../utils/toastUtil';

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
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const [personalInfo, setPersonalInfo] = useState({
        name: "Dr. Furkan İmamoğlu",
        email: "ayse.yilmaz@example.com",
        phoneNumber: "+90 555 123 4567",
        gender: "Erkek",
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
            showSuccessToast("Ayarlarınız başarıyla kaydedildi!");
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 500);
    };

    const handleChangePassword = async () => {
        // Clear previous errors
        setPasswordError("");

        // Validate passwords match
        if (passwordInfo.newPassword !== passwordInfo.confirmNewPassword) {
            setPasswordError("Yeni şifreler eşleşmiyor");
            return;
        }

        // Validate password not empty
        if (!passwordInfo.currentPassword || !passwordInfo.newPassword) {
            setPasswordError("Tüm alanları doldurunuz");
            return;
        }

        try {
            setIsChangingPassword(true);
            const response = await fetch(`${config[config.environment].apiUrl}/dietitian/changePassword`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    oldPassword: passwordInfo.currentPassword,
                    newPassword: passwordInfo.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                setOpenPasswordModal(false);
                setPasswordInfo({
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: ""
                });

                // Show toast notification for success
                showSuccessToast("Şifreniz başarıyla değiştirildi");
            } else {
                // Error
                setPasswordError(data.message || "Şifre değiştirme işlemi başarısız oldu");
                // Show toast notification for error
                showErrorToast(data.message || "Şifre değiştirme işlemi başarısız oldu");
            }
        } catch (error) {
            const errorMessage = "Bir hata oluştu. Lütfen tekrar deneyin.";
            setPasswordError(errorMessage);
            showErrorToast(errorMessage);
            console.error("Password change error:", error);
        } finally {
            setIsChangingPassword(false);
        }
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
        {value: 15, label: "15 dakika"},
        {value: 30, label: "30 dakika"},
        {value: 60, label: "1 saat"}
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

                                    <Box className="profile-preview-container">
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            mb: 3
                                        }}>
                                            <Avatar
                                                src="/profile-placeholder.jpg"
                                                sx={{width: 120, height: 120, mb: 2}}
                                            />
                                            <Typography variant="h5" align="center">{personalInfo.name}</Typography>
                                            <Typography variant="subtitle1" color="text.secondary" align="center">
                                                Diyetisyen
                                            </Typography>
                                        </Box>

                                        <Divider sx={{my: 2}}/>

                                        <Box sx={{mb: 2}}>
                                            <Typography variant="body2"
                                                        sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                                <Person fontSize="small" sx={{mr: 1, color: 'primary.main'}}/>
                                                Cinsiyet: {personalInfo.gender}
                                            </Typography>

                                            <Typography variant="body2"
                                                        sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                                <Email fontSize="small" sx={{mr: 1, color: 'primary.main'}}/>
                                                {personalInfo.email}
                                            </Typography>

                                            <Typography variant="body2" sx={{display: 'flex', alignItems: 'center'}}>
                                                <Phone fontSize="small" sx={{mr: 1, color: 'primary.main'}}/>
                                                {personalInfo.phoneNumber}
                                            </Typography>
                                        </Box>

                                        <Divider sx={{my: 2}}/>

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            startIcon={<KeyOutlined/>}
                                            onClick={handleOpenPasswordModal}
                                            sx={{mb: 2}}
                                        >
                                            Şifremi Değiştir
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Card variant="outlined" className="settings-card">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Temel Hesap Bilgileri
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Sisteme kayıtlı olan temel hesap bilgilerinizi buradan güncelleyebilirsiniz.
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
                                                    name="phoneNumber"
                                                    value={personalInfo.phoneNumber}
                                                    onChange={handlePersonalInfoChange}
                                                    margin="normal"
                                                    variant="outlined"
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth margin="normal">
                                                    <InputLabel id="gender-label">Cinsiyet</InputLabel>
                                                    <Select
                                                        labelId="gender-label"
                                                        id="gender"
                                                        name="gender"
                                                        value={personalInfo.gender}
                                                        label="Cinsiyet"
                                                        onChange={handlePersonalInfoChange}
                                                    >
                                                        <MenuItem value="Erkek">Erkek</MenuItem>
                                                        <MenuItem value="Kadın">Kadın</MenuItem>
                                                        <MenuItem value="Diğer">Diğer</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3}}>
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

                                        <Typography gutterBottom sx={{mt: 2}}>Otomatik Çıkış Süresi
                                            (dakika)</Typography>
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
                                            inputProps={{min: 1200, max: 3000, step: 50}}
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
                            <Close/>
                        </IconButton>
                    </Box>

                    <Divider sx={{mb: 3}}/>

                    {passwordError && (
                        <Alert severity="error" sx={{mb: 2}}>
                            {passwordError}
                        </Alert>
                    )}

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
                                disabled={isChangingPassword}
                            >
                                İptal
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleChangePassword}
                                disabled={isChangingPassword}
                                startIcon={isChangingPassword ? <CircularProgress size={20} color="inherit"/> :
                                    <LockIcon/>}
                            >
                                {isChangingPassword ? 'İşleniyor...' : 'Şifreyi Değiştir'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </Default>
    );
}