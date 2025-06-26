import {useNavigate} from 'react-router-dom';
import React, {useEffect, useState} from "react";
import {
    alpha,
    AppBar,
    Avatar,
    Badge,
    Box,
    Container,
    Divider,
    Drawer,
    IconButton,
    InputBase,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    styled,
    Toolbar,
    Tooltip,
    Typography,
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
import axios from 'axios';
import config from "../../config.js";

const getIconByType = (type) => {
    switch (type) {
        case "page":
            return <FindInPageIcon sx={{color: "#4caf50"}}/>;
        case "randevu":
            return <EventIcon sx={{color: "#e8dd00"}}/>;
        case "exercise":
            return <SportsGymnasticsIcon sx={{color: "#3f51b5"}}/>;
        case "tarif":
            return <AssignmentIcon sx={{color: "#6c07d6"}}/>;
        case "danisan":
            return <PersonIcon sx={{color: "#ff6200"}}/>;
        default:
            return null;
    }
};

const settings = [
    /* {label: 'Ayarlar', value: 'ayarlar'}, */
    {label: 'Ödeme', value: 'odeme'},
    {label: 'Çıkış Yap', value: 'cikisyap'},
];

const mobilePrimaryColor = '#fc9e21';
const mobileGradient = 'linear-gradient(135deg, #fc9e21 0%, #ff7355 50%, #fc9e21 100%)';
const mobileDrawerHeaderBg = '#fc9e21';

const SearchContainer = styled('div')(({theme}) => ({
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

const StyledInputBase = styled(InputBase)(({theme}) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1.2, 1, 1.2, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
    },
}));

const MobileMenuToggle = styled(IconButton)(({theme}) => ({
    marginRight: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
        display: 'none',
    },
}));

const MobileSearchIcon = styled(IconButton)(({theme}) => ({
    padding: '8px',
    [theme.breakpoints.up('md')]: {
        display: 'none',
    },
}));

export default function Header() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            window.location.href = '/girisyap';
        }
    }, []);

    const [messageCount, setMessageCount] = useState(0);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
            navigate('/girisyap');
        } else if (value === 'ayarlar') {
            navigate('/ayarlar');
        } else if (value === 'odeme') {
            navigate('/odeme');
        } else {
            navigate('/anasayfa');
        }
        setAnchorElUser(null);
        setMobileMenuOpen(false);
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 2) {
            try {
                const response = await axios.get(config[config.environment].apiUrl + `/dietitian/globalSearchbar`, {
                    headers: {
                        Authorization: localStorage.getItem('token')
                    },
                    params: {search: query},
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

    const fetchUnreadMessageCount = async () => {
        try {
            const token = localStorage.getItem('token'); // veya başka bir token saklama yönteminiz
            const response = await axios.get(`${config[config.environment].apiUrl}/message/getMyUnreadMessageCount`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token || ''
                }
            });

            if (response.data) {
                setMessageCount(response.data.unreadMessageCount || 0);
            }
        } catch (error) {
            console.error('Okunmamış mesaj sayısı alınamadı:', error);
        }
    };

    useEffect(() => {
        fetchUnreadMessageCount();

        const interval = setInterval(fetchUnreadMessageCount, 60000); // Her 1 dakikada bir

        return () => clearInterval(interval);
    }, []);

    const navigationItems = [
        {name: "Ana Sayfa", route: "/anasayfa", icon: <HomeIcon sx={{color: "#2c8d32"}}/>},
        {name: "Danışanlarım", route: "/danisanlarim", icon: <PersonIcon sx={{color: "#ff6200"}}/>},
        {name: "Randevularım", route: "/randevularim", icon: <EventIcon sx={{color: "#e8dd00"}}/>},
        {name: "Beslenme", route: "/beslenme", icon: <LocalDiningIcon sx={{color: "#4caf50"}}/>},
        {name: "Tarifler", route: "/tarif", icon: <RestaurantMenuIcon sx={{color: "#6c07d6"}}/>},
        {name: "Egzersizler", route: "/egzersiz", icon: <SportsGymnasticsIcon sx={{color: "#3f51b5"}}/>},
        {name: "Finans", route: "/finans", icon: <AccountBalanceWalletIcon sx={{color: "#2c8d32"}}/>},
        {name: "Mesajlar", route: "/mesaj", icon: <MailIcon sx={{color: mobilePrimaryColor}}/>},
    ];

    return (
        <AppBar
            position="fixed"
            sx={{
                background: isMobile ? mobileGradient : 'linear-gradient(135deg, #fc9e21  0%, #ff7355 50%, #fc9e21 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
        >
            <Container maxWidth={false} disableGutters>
                <Toolbar sx={{minHeight: {xs: '64px'}}}>
                    {/* Mobile Menu Toggle */}
                    {isMobile && (
                        <MobileMenuToggle
                            size="large"
                            edge="start"
                            color="inherit"
                            onClick={toggleMobileMenu}
                        >
                            <MenuIcon/>
                        </MobileMenuToggle>
                    )}

                    {/* Logo / Marka Adı */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            cursor: 'pointer',
                            position: 'relative',
                            height: isMobile ? '3.5rem' : '4.5rem',
                            ml: isMobile ? 0 : 4,
                            zIndex: 1000,
                        }}
                        onClick={() => navigate('/anasayfa')}
                    >
                        <Box
                            component="img"
                            src="/logo.png"
                            alt="Diyetia Logo"
                            sx={{
                                height: isMobile ? '2.2rem' : '3rem',
                                width: 'auto',
                                objectFit: 'contain',
                                opacity: 0.95,
                            }}
                        />
                    </Box>

                    {/* Desktop Search Bar */}
                    {!isMobile && (
                        <Box
                            sx={{
                                flexGrow: 1,
                                ml: {xs: 1, md: 4},
                                mr: {xs: 1, md: 4},
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <SearchContainer>
                                <StyledInputBase
                                    placeholder="Arama yap..."
                                    inputProps={{'aria-label': 'search'}}
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                                {Array.isArray(searchResults) && searchResults.length > 0 && (
                                    <Paper
                                        sx={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            backgroundColor: "#ffffff",
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
                                                            backgroundColor: "#ffffff",
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
                            sx={{mr: 1}}
                        >
                            <SearchIcon/>
                        </MobileSearchIcon>
                    )}

                    {/* Desktop Icons */}
                    {!isMobile && (
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mr: {xs: 2, md: 4}}}>
                            <Tooltip title="Mesajlar" arrow>
                                <IconButton sx={{color: 'white', backgroundColor: '#2d4149'}} onClick={() => navigate('/mesaj')} color="inherit">
                                    <Badge badgeContent={messageCount} color="warning">
                                        <MailIcon sx={{color: 'white'}}/>
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            <Box sx={{flexGrow: 0}}>
                                <Tooltip title="Diyetisyen" arrow>
                                    <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
                                        <Avatar alt="Diyetisyen" sx={{color: 'white', backgroundColor: '#2d4149'}}/>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{mt: '3rem'}}
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
                                        <Divider/>
                                        <MenuItem onClick={handleCloseUserMenu}>
                                            <Typography variant="body2" color="text.secondary">
                                                Sürüm: 1.0.6
                                            </Typography>
                                        </MenuItem>
                                    </Box>
                                </Menu>
                            </Box>
                        </Box>
                    )}

                    {/* Profile Icon always visible */}
                    {isMobile && (
                        <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
                            <Avatar
                                alt="Furkan"
                                src="/static/images/avatar/2.jpg"
                                sx={{width: 32, height: 32}}
                            />
                        </IconButton>
                    )}
                </Toolbar>

                {/* Mobile Search Bar */}
                {isMobile && mobileSearchOpen && (
                    <Box sx={{p: 2, backgroundColor: 'rgba(44, 141, 50, 0.9)'}}>
                        <SearchContainer>
                            <Box sx={{
                                position: 'absolute',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                pl: 2
                            }}>
                                <SearchIcon/>
                            </Box>
                            <StyledInputBase
                                placeholder="Arama yap..."
                                inputProps={{'aria-label': 'search'}}
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
                                <CloseIcon/>
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
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <SpaIcon sx={{color: 'white', mr: 1.5, fontSize: 24}}/>
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
                    <IconButton onClick={toggleMobileMenu} sx={{color: 'white'}}>
                        <CloseIcon/>
                    </IconButton>
                </Box>

                <List sx={{pt: 1}}>
                    {navigationItems.map((item) => (
                        <ListItem key={item.name} disablePadding>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.route);
                                    toggleMobileMenu();
                                }}
                                sx={{
                                    borderLeft: location.pathname === item.route ? '4px solid #2c8d32' : '4px solid transparent',
                                    backgroundColor: location.pathname === item.route ? 'rgba(44, 141, 50, 0.1)' : 'transparent'
                                }}
                            >
                                <Box sx={{mr: 2}}>{item.icon}</Box>
                                <ListItemText primary={item.name}/>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{my: 2}}/>

                <List>
                    {settings.map((item) => (
                        <ListItem key={item.value} disablePadding>
                            <ListItemButton onClick={() => handleMenuItemClick(item.value)}>
                                <ListItemText primary={item.label}/>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Box sx={{mt: 'auto', p: 2, borderTop: '1px solid rgba(0,0,0,0.08)'}}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        Sürüm: 0.0.1
                    </Typography>
                </Box>
            </Drawer>
        </AppBar>
    );
}
