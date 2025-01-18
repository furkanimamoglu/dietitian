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
    Divider
} from '@mui/material';

import SpaIcon from '@mui/icons-material/Spa';
import MailIcon from '@mui/icons-material/Mail';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';
import {useNavigate} from "react-router-dom";

const settings = [
    { label: 'Profil', value: 'profil' },
    { label: 'Ayarlar', value: 'ayarlar' },
    { label: 'Çıkış Yap', value: 'cikisyap' }
];

// Styled Search Container
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

// Styled Icon Wrapper
const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

// Styled Input
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

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleMenuItemClick = (value) => {
        if (value === 'cikisyap') {
            localStorage.removeItem('token');
            navigate('/login');
        } else if (value === 'profil') {
            navigate('/profil');
        } else if (value === 'ayarlar') {
            navigate('/ayarlar');
        } else {
            navigate('/dashboard');
        }
        setAnchorElUser(null);
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                backgroundColor: '#2e7d32',
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
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
                            Diyet
                        </Typography>
                        <Typography
                            variant="h5"
                            component="a"
                            href="/dashboard"
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'none' },
                                flexGrow: 1,
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            Diyet
                        </Typography>
                    </Box>

                    {/* Orta bölüm: Empty */}
                    <Box sx={{ flexGrow: 1, ml: { xs: 1, md: 4 }, mr: { xs: 1, md: 4 } }}>

                    </Box>

                    {/* Sağ bölüm: Bildirimler, Yardım, Profil */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: { xs: 2, md: 4 } }}>
                        {/* Arama Çubuğu */}
                        <Box sx={{ flexGrow: 1, ml: { xs: 1, md: 4 }, mr: { xs: 1, md: 4 } }}>
                            <SearchContainer>
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Arama yap..."
                                    inputProps={{ 'aria-label': 'search' }}
                                />
                            </SearchContainer>
                        </Box>

                        {/* Mesajlar */}
                        <Tooltip title="Mesajlar" arrow>
                            <IconButton color="inherit">
                                <Badge badgeContent={1} color="warning">
                                    <MailIcon sx={{ color: 'white' }} />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        {/* Yardım */}
                        <Tooltip title="Yardım" arrow>
                            <IconButton color="inherit">
                                <HelpIcon sx={{ color: 'white' }} />
                            </IconButton>
                        </Tooltip>

                        {/* Profil Menüsü */}
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Profilim" arrow>
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt="Furkan" src="/static/images/avatar/2.jpg" />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
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
                                            Sürüm: 1.0.0
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
