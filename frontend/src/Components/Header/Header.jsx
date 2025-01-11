import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import SpaIcon from '@mui/icons-material/Spa';
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';
import {Search} from "@mui/icons-material";
import SearchIcon from '@mui/icons-material/Search';
import HelpIcon from '@mui/icons-material/Help';
import {alpha, InputBase, styled} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';

const settings = ['Profil', 'Çıkış Yap'];

function Header() {
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    if (!localStorage.getItem('token')) {
        window.location.href = '/login';
    }

    const Search = styled('div')(({ theme }) => ({
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%'
    }));

    const SearchIconWrapper = styled('div')(({ theme }) => ({
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }));

    const StyledInputBase = styled(InputBase)(({ theme }) => ({
        color: 'inherit',
        '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            width: '100%',
        },
    }));


    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <AppBar sx={{boxShadow: "0 4px 6px rgba(0,0,0,0.1)"}} position="fixed" >
                <Toolbar disableGutters>
                    <SpaIcon sx={{display: {xs: 'flex', md: 'flex'}, mr: "0.5rem", ml: "2rem"}}/>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="dashboard"
                        sx={{
                            mr: 2,
                            display: {xs: 'none', md: 'flex'},
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
                        noWrap
                        component="a"
                        href="dashboard"
                        sx={{
                            mr: 2,
                            display: {xs: 'flex', md: 'none'},
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

                    {/* Search Bar Start */}
                    <Box sx={{ pr: "1rem", display: {xs: 'flex', md: 'flex'}}}>
                        <Search>
                            <SearchIconWrapper>
                                <SearchIcon />
                            </SearchIconWrapper>
                            <StyledInputBase
                                placeholder="Arama yap…"
                                inputProps={{ 'aria-label': 'search' }}
                            />
                        </Search>
                    </Box>
                    {/* Search Bar End */}

                    {/* Notification Button Start */}
                    <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "flex" }, gap: "1rem", justifyContent: "flex-end", pr: "1rem" }}>
                        <Tooltip title="Mesajlar" arrow>
                            <IconButton color="inherit">
                                <Badge badgeContent={1} color="secondary">
                                    <MailIcon sx={{ color: "white" }} />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Bildirimler" arrow>
                            <IconButton color="inherit">
                                <Badge badgeContent={4} color="secondary">
                                    <NotificationsIcon sx={{ color: "white" }} />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Yardım" arrow>
                            <IconButton color="inherit">
                                <HelpIcon sx={{ color: "white" }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    {/* Notification Button End */}

                    {/* Profile Button Start */}
                    <Box sx={{flexGrow: 0}}>
                        <Tooltip title="Profilim">
                            <IconButton onClick={handleOpenUserMenu}>
                                <Avatar sx={{mr:"2rem"}} alt="Furkan" src="/static/images/avatar/2.jpg"/>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{mt: "3.5rem"}}
                            id="menu-appbar"
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <div>
                                {settings.map((setting) => (
                                    <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                        <Typography sx={{textAlign: 'center'}}>{setting}</Typography>
                                    </MenuItem>
                                ))}
                            </div>
                        </Menu>
                    </Box>
                    {/* Profile Button End */}
                </Toolbar>
        </AppBar>
    );
}

export default Header;