import * as React from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Avatar,
    Tooltip,
    MenuItem,
    Badge,
    InputBase,
    styled,
    alpha,
    Container,
    Divider,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Drawer,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import FindInPageIcon from '@mui/icons-material/FindInPage';
import EventIcon from '@mui/icons-material/Event';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import SpaIcon from '@mui/icons-material/Spa';
import MailIcon from '@mui/icons-material/Mail';
import HelpIcon from '@mui/icons-material/Help';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from "../../config.js";

const getIconByType = (type) => {
    switch (type) {
        case "page":
            return <FindInPageIcon sx={{ color: "#4caf50" }} />;
        case "randevu":
            return <EventIcon sx={{ color: "#e8dd00" }} />;
        case "exercise":
            return <SportsGymnasticsIcon sx={{ color: "#3f51b5" }} />;
        case "tarif":
            return <AssignmentIcon sx={{ color: "#6c07d6" }} />;
        case "danisan":
            return <PersonIcon sx={{ color: "#ff6200" }} />;
        default:
            return null;
    }
};

const settings = [
    { label: 'Ayarlar', value: 'ayarlar' },
    { label: 'Çıkış Yap', value: 'cikisyap' },
];

// Updated color scheme
const mobilePrimaryColor = '#2c8d32';
const mobileGradient = 'linear-gradient(to right, #2c8d32, #40b548)';
const mobileDrawerHeaderBg = 'linear-gradient(45deg, #2c8d32 30%, #40b548 90%)';

const SearchContainer = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        width: '250px',
    },
    [theme.breakpoints.down('sm')]: {
        width: '100%',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1.2, 1, 1.2, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
    },
}));

const MobileMenuToggle = styled(IconButton)(({ theme }) => ({
    marginRight: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
        display: 'none',
    },
}));

const MobileSearchIcon = styled(IconButton)(({ theme }) => ({
    padding: '8px',
    [theme.breakpoints.up('md')]: {
        display: 'none',
    },
}));

// Logo container with enhanced styling for mobile
const LogoContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isMobile',
})(({ theme, isMobile }) => ({
    display: 'flex', 
    alignItems: 'center',
    flexGrow: isMobile ? 1 : 0,
    padding: isMobile ? theme.spacing(0.7, 1) : 0,
    borderRadius: isMobile ? theme.spacing(1) : 0,
    marginLeft: isMobile ? theme.spacing(0.5) : 0,
}));

export default function Header() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    React.useEffect(() => {
        if (!localStorage.getItem('token')) {
            window.location.href = '/login';
        }
    }, []);

    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleMenuItemClick = (value) => {
        if (value === 'cikisyap') {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
        } else if (value === 'ayarlar') {
            navigate('/ayarlar');
        } else {
            navigate('/dashboard');
        }
        setAnchorElUser(null);
        setMobileMenuOpen(false);
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 2) {
            try {
                const response = await axios.get(config[config.environment].apiUrl+`/dietitian/globalSearchbar`, {
                    headers: {
                        Authorization: localStorage.getItem('token')
                    },
                    params: { search: query },
                });

                if (Array.isArray(response.data)) {
                    setSearchResults(response.data);
                } else {
                    console.error('API yanıtı beklenen formatta değil:', response.data);
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Arama sırasında hata oluştu:', error);
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleResultClick = (url) => {
        navigate(url);
        setSearchQuery('');
        setSearchResults([]);
        setMobileSearchOpen(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const toggleMobileSearch = () => {
        setMobileSearchOpen(!mobileSearchOpen);
        if (!mobileSearchOpen) {
            setSearchResults([]);
            setSearchQuery('');
        }
    };

    const navigationItems = [
        { name: "Ana Sayfa", route: "/dashboard", icon: <HomeIcon sx={{ color: "#2c8d32" }} /> },
        { name: "Danışanlarım", route: "/danisanlarim", icon: <PersonIcon sx={{ color: "#ff6200" }} /> },
        { name: "Randevularım", route: "/randevularim", icon: <EventIcon sx={{ color: "#e8dd00" }} /> },
        { name: "Beslenme", route: "/beslenme", icon: <LocalDiningIcon sx={{ color: "#4caf50" }} /> },
        { name: "Tarifler", route: "/tarif", icon: <RestaurantMenuIcon sx={{ color: "#6c07d6" }} /> },
        { name: "Egzersizler", route: "/egzersiz", icon: <SportsGymnasticsIcon sx={{ color: "#3f51b5" }} /> },
        { name: "Finans", route: "/finans", icon: <AccountBalanceWalletIcon sx={{ color: "#2c8d32" }} /> },
        { name: "Mesajlar", route: "/mesaj", icon: <MailIcon sx={{ color: mobilePrimaryColor }} /> },
        { name: "Yardım", route: "/yardim", icon: <HelpIcon sx={{ color: mobilePrimaryColor }} /> }
    ];

    return (
        <AppBar
            position="fixed"
            sx={{
                background: isMobile ? mobileGradient : '#2e7d32',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
        >
            <Container maxWidth={false} disableGutters>
                <Toolbar sx={{ minHeight: { xs: '64px' } }}>
                    {/* Mobile Menu Toggle */}
                    {isMobile && (
                        <MobileMenuToggle
                            size="large"
                            edge="start"
                            color="inherit"
                            onClick={toggleMobileMenu}
                        >
                            <MenuIcon />
                        </MobileMenuToggle>
                    )}

                    {/* Logo / Marka Adı */}
                    <LogoContainer isMobile={isMobile} sx={{ display: 'flex' }}>
                        <SpaIcon sx={{ 
                            display: 'flex', 
                            ml: { xs: 0, md: 4 }, 
                            mr: 1,
                            color: 'white',
                            fontSize: isMobile ? 22 : 24
                        }} />
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                fontSize: isMobile ? '1rem' : '1.25rem',
                                letterSpacing: 1,
                                color: 'white',
                                fontFamily: 'Montserrat, sans-serif'
                            }}
                        >
                            Diyetia
                        </Typography>
                    </LogoContainer>

                    {/* Desktop Search Bar */}
                    {!isMobile && (
                        <Box
                            sx={{
                                flexGrow: 1,
                                ml: { xs: 1, md: 4 },
                                mr: { xs: 1, md: 4 },
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <SearchContainer>
                                <StyledInputBase
                                    placeholder="Arama yap..."
                                    inputProps={{ 'aria-label': 'search' }}
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                                {Array.isArray(searchResults) && searchResults.length > 0 && (
                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            backgroundColor: "#f0f9f0",
                                            zIndex: 1300,
                                            boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
                                            mt: 1,
                                            width: "100%",
                                            maxHeight: "300px",
                                            overflowY: "auto",
                                            borderRadius: "12px",
                                            border: "1px solid #cce8cc",
                                        }}
                                    >
                                        <List>
                                            {searchResults.map((result, index) => (
                                                <ListItem
                                                    key={index}
                                                    disablePadding
                                                    onClick={() => handleResultClick(result.url)}
                                                    sx={{
                                                        "&:hover": {
                                                            backgroundColor: "#e6f7e6",
                                                            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                                                        },
                                                        transition: "all 0.3s ease-in-out",
                                                    }}
                                                >
                                                    <ListItemButton
                                                        sx={{
                                                            padding: "12px 16px",
                                                            color: "#333",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={result.name}
                                                            sx={{
                                                                fontSize: "14px",
                                                                color: "#333",
                                                                fontWeight: "500",
                                                            }}
                                                        />
                                                        {/* Type Based Icon */}
                                                        {getIconByType(result.type)}
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                )}
                            </SearchContainer>
                        </Box>
                    )}

                    {/* Mobile Search Icon */}
                    {isMobile && (
                        <MobileSearchIcon 
                            color="inherit" 
                            onClick={toggleMobileSearch}
                            sx={{ mr: 1 }}
                        >
                            <SearchIcon />
                        </MobileSearchIcon>
                    )}

                    {/* Desktop Icons */}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: { xs: 2, md: 4 } }}>
                            <Tooltip title="Mesajlar" arrow>
                                <IconButton onClick={() => navigate('/mesaj')} color="inherit">
                                    <Badge badgeContent={1} color="warning">
                                        <MailIcon sx={{ color: 'white' }} />
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Yardım" arrow>
                                <IconButton color="inherit">
                                    <HelpIcon sx={{ color: 'white' }} />
                                </IconButton>
                            </Tooltip>

                            <Box sx={{ flexGrow: 0 }}>
                                <Tooltip title="Furkan" arrow>
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <Avatar alt="Furkan" src="/static/images/avatar/2.jpg" />
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '3rem' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    <Box>
                                        {settings.map((item) => (
                                            <MenuItem key={item.value} onClick={() => handleMenuItemClick(item.value)}>
                                                <Typography textAlign="center">{item.label}</Typography>
                                            </MenuItem>
                                        ))}
                                        <Divider />
                                        <MenuItem onClick={handleCloseUserMenu}>
                                            <Typography variant="body2" color="text.secondary">
                                                Sürüm: 0.0.1
                                            </Typography>
                                        </MenuItem>
                                    </Box>
                                </Menu>
                            </Box>
                        </Box>
                    )}

                    {/* Profile Icon always visible */}
                    {isMobile && (
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                            <Avatar 
                                alt="Furkan" 
                                src="/static/images/avatar/2.jpg"
                                sx={{ width: 32, height: 32 }}
                            />
                        </IconButton>
                    )}
                </Toolbar>

                {/* Mobile Search Bar */}
                {isMobile && mobileSearchOpen && (
                    <Box sx={{ p: 2, backgroundColor: 'rgba(44, 141, 50, 0.9)' }}>
                        <SearchContainer>
                            <Box sx={{ position: 'absolute', height: '100%', display: 'flex', alignItems: 'center', pl: 2 }}>
                                <SearchIcon />
                            </Box>
                            <StyledInputBase
                                placeholder="Arama yap..."
                                inputProps={{ 'aria-label': 'search' }}
                                value={searchQuery}
                                onChange={handleSearch}
                                autoFocus
                            />
                            <IconButton 
                                sx={{ 
                                    position: 'absolute', 
                                    right: 0, 
                                    top: 0, 
                                    height: '100%',
                                    color: 'white'
                                }}
                                onClick={toggleMobileSearch}
                            >
                                <CloseIcon />
                            </IconButton>
                        </SearchContainer>
                        {Array.isArray(searchResults) && searchResults.length > 0 && (
                            <Paper
                                sx={{
                                    backgroundColor: "#f0f9f0",
                                    zIndex: 1300,
                                    boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
                                    mt: 1,
                                    width: "100%",
                                    maxHeight: "300px",
                                    overflowY: "auto",
                                    borderRadius: "12px",
                                    border: "1px solid #cce8cc",
                                }}
                            >
                                <List>
                                    {searchResults.map((result, index) => (
                                        <ListItem
                                            key={index}
                                            disablePadding
                                            onClick={() => handleResultClick(result.url)}
                                            sx={{
                                                "&:hover": {
                                                    backgroundColor: "#e6f7e6",
                                                    boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                                                },
                                                transition: "all 0.3s ease-in-out",
                                            }}
                                        >
                                            <ListItemButton
                                                sx={{
                                                    padding: "12px 16px",
                                                    color: "#333",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                }}
                                            >
                                                <ListItemText
                                                    primary={result.name}
                                                    sx={{
                                                        fontSize: "14px",
                                                        color: "#333",
                                                        fontWeight: "500",
                                                    }}
                                                />
                                                {getIconByType(result.type)}
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        )}
                    </Box>
                )}
            </Container>

            {/* Mobile Drawer Menu */}
            <Drawer
                anchor="left"
                open={mobileMenuOpen}
                onClose={toggleMobileMenu}
                sx={{
                    '& .MuiDrawer-paper': { 
                        width: '75%', 
                        maxWidth: '320px',
                        backgroundColor: '#f8fff8',
                    },
                }}
            >
                <Box sx={{ 
                    background: mobileDrawerHeaderBg,
                    p: 2.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SpaIcon sx={{ color: 'white', mr: 1.5, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            color: 'white',
                            fontFamily: '"Segoe UI", Roboto, sans-serif',
                            letterSpacing: '0.5px',
                            textShadow: '0px 1px 2px rgba(0,0,0,0.2)'
                        }}>
                            Diyetia
                        </Typography>
                    </Box>
                    <IconButton onClick={toggleMobileMenu} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                
                <List sx={{ pt: 1 }}>
                    {navigationItems.map((item) => (
                        <ListItem key={item.name} disablePadding>
                            <ListItemButton 
                                onClick={() => { navigate(item.route); toggleMobileMenu(); }}
                                sx={{
                                    borderLeft: location.pathname === item.route ? '4px solid #2c8d32' : '4px solid transparent',
                                    backgroundColor: location.pathname === item.route ? 'rgba(44, 141, 50, 0.1)' : 'transparent'
                                }}
                            >
                                <Box sx={{ mr: 2 }}>{item.icon}</Box>
                                <ListItemText primary={item.name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <List>
                    {settings.map((item) => (
                        <ListItem key={item.value} disablePadding>
                            <ListItemButton onClick={() => handleMenuItemClick(item.value)}>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                
                <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        Sürüm: 0.0.1
                    </Typography>
                </Box>
            </Drawer>
        </AppBar>
    );
}
