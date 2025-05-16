import React, {useEffect, useState} from "react";
import Default from "../../Components/Layouts/Default.jsx";
import "./Ayarlar.css";
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  Switch, 
  FormControlLabel, 
  InputAdornment, 
  IconButton,
  Alert,
  Paper,
  Modal,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Slider,
  Tooltip
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  Save, 
  CreditCard, 
  Settings as SettingsIcon, 
  Person, 
  Edit as EditIcon, 
  Close as CloseIcon,
  VolumeUp,
  Brightness4,
  Language,
  Notifications,
  Schedule,
  Lock as LockIcon,
  ColorLens
} from "@mui/icons-material";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

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
        <Box sx={{ p: 3 }}>
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
    name: "Dr. Ayşe Yılmaz",
    email: "ayse.yilmaz@example.com",
    phone: "+90 555 123 4567"
  });

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  const [appSettings, setAppSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    smsNotifications: false,
    autoSave: true,
    language: "Türkçe",
    fontSize: 14,
    colorTheme: "default",
    soundNotifications: true,
    autoLogout: 30
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
    const { name, value, checked } = e.target;
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
    { value: "default", label: "Varsayılan" },
    { value: "blue", label: "Mavi" },
    { value: "green", label: "Yeşil" },
    { value: "purple", label: "Mor" },
    { value: "orange", label: "Turuncu" },
  ];

  const languages = [
    { value: "Türkçe", label: "Türkçe" },
    { value: "English", label: "English" },
    { value: "Deutsch", label: "Deutsch" },
    { value: "Français", label: "Français" },
    { value: "Español", label: "Español" },
  ];

  return (
    <Default>
      <Box className="ayarlar-full-container">
        <Typography variant="h4" component="h1" className="ayarlar-title">
          Ayarlar
        </Typography>
        
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Ayarlarınız başarıyla kaydedildi!
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="settings tabs"
            variant="fullWidth"
            className="settings-tabs"
          >
            <Tab icon={<Person />} iconPosition="start" label="Kişisel Bilgiler" />
            <Tab icon={<SettingsIcon />} iconPosition="start" label="Uygulama Ayarları" />
            <Tab icon={<CreditCard />} iconPosition="start" label="Abonelik ve Ödeme" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Card variant="outlined" className="settings-card">
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  src="/profile-placeholder.jpg"
                  sx={{ width: 100, height: 100, mr: 3 }}
                />
                <Box>
                  <Typography variant="h5">{personalInfo.name}</Typography>
                  <Typography variant="body1" color="text.secondary">Premium Diyetisyen</Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mt: 1 }}
                    startIcon={<EditIcon />}
                  >
                    Profil Fotoğrafını Değiştir
                  </Button>
                </Box>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Kişisel Bilgiler
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box component="form" className="form-container">
                <TextField
                  fullWidth
                  label="Ad Soyad"
                  name="name"
                  value={personalInfo.name}
                  onChange={handlePersonalInfoChange}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end">
                          <EditIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  label="E-posta"
                  name="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end">
                          <EditIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Telefon"
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  margin="normal"
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end">
                          <EditIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<LockIcon />}
                  onClick={handleOpenPasswordModal}
                  sx={{ mt: 2, alignSelf: "flex-start" }}
                >
                  Şifremi Değiştir
                </Button>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                  sx={{ mt: 3 }}
                >
                  Değişiklikleri Kaydet
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" className="settings-card">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Brightness4 color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Görünüm Ayarları
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
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
                    
                    <Box sx={{ mt: 2, mb: 3 }}>
                      <Typography gutterBottom>Yazı Boyutu</Typography>
                      <Slider
                        value={appSettings.fontSize}
                        onChange={(e, newValue) => {
                          setAppSettings({...appSettings, fontSize: newValue});
                        }}
                        min={12}
                        max={20}
                        step={1}
                        marks
                        name="fontSize"
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    
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
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" className="settings-card">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Notifications color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Bildirim Ayarları
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box className="app-settings-container">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appSettings.emailNotifications}
                          onChange={handleAppSettingsChange}
                          name="emailNotifications"
                          color="primary"
                        />
                      }
                      label="E-posta Bildirimleri"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appSettings.smsNotifications}
                          onChange={handleAppSettingsChange}
                          name="smsNotifications"
                          color="primary"
                        />
                      }
                      label="SMS Bildirimleri"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appSettings.soundNotifications}
                          onChange={handleAppSettingsChange}
                          name="soundNotifications"
                          color="primary"
                        />
                      }
                      label="Ses Bildirimleri"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined" className="settings-card">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Language color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Genel Ayarlar
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={appSettings.autoSave}
                            onChange={handleAppSettingsChange}
                            name="autoSave"
                            color="primary"
                          />
                        }
                        label="Otomatik Kaydetme"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
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
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography gutterBottom>Otomatik Çıkış Süresi (dakika)</Typography>
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
                    </Grid>
                  </Grid>
                  
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<Save />}
                    onClick={handleSaveSettings}
                    sx={{ mt: 3 }}
                  >
                    Ayarları Kaydet
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card variant="outlined" className="settings-card subscription-main-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Abonelik ve Ödeme Bilgileri
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box className="subscription-container">
                    <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Box sx={{ color: 'white' }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Mevcut Plan
                            </Typography>
                            <Typography variant="h4" gutterBottom fontWeight="bold">
                              Premium Diyetisyen Paketi
                            </Typography>
                            <Typography variant="body1">
                              Tüm özelliklere sınırsız erişim
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label="Sınırsız Danışan" 
                                size="small" 
                                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                              />
                              <Chip 
                                label="Gelişmiş Raporlar" 
                                size="small" 
                                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                              />
                              <Chip 
                                label="7/24 Destek" 
                                size="small" 
                                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                              />
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', color: 'white', height: '100%', justifyContent: 'space-between' }}>
                            <Typography variant="h3" fontWeight="bold">
                              ₺599
                              <Typography component="span" variant="body1">/ay</Typography>
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 2 }}>
                              Sonraki ödeme tarihi: <b>15 Nisan 2023</b>
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>

                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 4, mb: 2 }}>
                      Ödeme Geçmişi
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      {[
                        { date: '15 Mart 2023', amount: '₺599', status: 'Ödendi' },
                        { date: '15 Şubat 2023', amount: '₺599', status: 'Ödendi' },
                        { date: '15 Ocak 2023', amount: '₺599', status: 'Ödendi' }
                      ].map((payment, index) => (
                        <Box key={index} sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          p: 2, 
                          borderBottom: '1px solid #eee',
                          '&:hover': { backgroundColor: '#f9f9f9' }
                        }}>
                          <Typography variant="body2">{payment.date}</Typography>
                          <Typography variant="body2">{payment.amount}</Typography>
                          <Chip 
                            label={payment.status} 
                            size="small" 
                            color="success" 
                            sx={{ height: 24 }} 
                          />
                        </Box>
                      ))}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                      <Button 
                        variant="outlined" 
                        color="primary"
                      >
                        Faturaları Görüntüle
                      </Button>
                      
                      <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<CreditCard />}
                      >
                        Ödeme Yöntemini Güncelle
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined" className="settings-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Mevcut Ödeme Yöntemi
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box 
                      component="img" 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" 
                      alt="Visa"
                      sx={{ width: 60, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="body1">
                        **** **** **** 4242
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Son Kullanma: 06/24
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Fatura Adresi
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Typography variant="body1">
                    Dr. Ayşe Yılmaz
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    İstanbul Beslenme Kliniği
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bağdat Caddesi No: 123
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kadıköy / İstanbul
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<EditIcon />}
                    sx={{ mt: 3 }}
                  >
                    Fatura Bilgilerini Düzenle
                  </Button>
                </CardContent>
              </Card>
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
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
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
                      {showPassword ? <VisibilityOff /> : <Visibility />}
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
                      {showPassword ? <VisibilityOff /> : <Visibility />}
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
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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