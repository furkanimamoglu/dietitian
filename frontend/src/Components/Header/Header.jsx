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
} from '@mui/material';

import FindInPageIcon from '@mui/icons-material/FindInPage';
import EventIcon from '@mui/icons-material/Event';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from "@mui/icons-material/Person";

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

export default function Header() {
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!localStorage.getItem('token')) {
            window.location.href = '/login';
        }
    }, []);

    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);

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
    };

    return (

        <AppBar
            position="fixed"
            sx={{
                backgroundColor: '#2e7d32',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
        >
            <Container maxWidth={false} disableGutters>
                <Toolbar>
                    {/* Sol bölüm: Logo / Marka Adı */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SpaIcon sx={{ display: 'flex', ml: { xs: 2, md: 4 }, mr: 1 }} />
                        <Typography
                            variant="h6"
                            component="a"
                            href="/dashboard"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            Diyetia
                        </Typography>
                    </Box>

                    {/* Orta bölüm: Arama Çubuğu */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            ml: { xs: 1, md: 4 },
                            mr: { xs: 1, md: 4 },
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <SearchContainer
                            sx={{
                                position: 'relative',
                            }}
                        >
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
                                                    {/* Type'a göre ikon */}
                                                    {getIconByType(result.type)}
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            )}
                        </SearchContainer>
                    </Box>

                    {/* Sağ bölüm: Bildirimler, Yardım, Profil */}
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
                </Toolbar>
            </Container>
        </AppBar>
    );
}
