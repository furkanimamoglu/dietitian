import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import SpaIcon from '@mui/icons-material/Spa';
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';
import Navbar from "../Navbar/Navbar.jsx";

const settings = ['Profil', 'Hesap', 'Ayarlar', 'Çıkış Yap'];

function Header() {
    const [anchorElUser, setAnchorElUser] = React.useState(null);


    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <SpaIcon sx={{display: {xs: 'flex', md: 'flex'}, mr: 1}}/>
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
                    {/* Notification Button Start */}
                    <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}, justifyContent: 'flex-end', pr: 2}}>
                        <Badge badgeContent={4} color="secondary">
                            <MailIcon color="action" sx={{color: 'white'}}/>
                        </Badge>
                    </Box>
                    {/* Notification Button End */}

                    {/* Profile Button Start */}
                    <Box sx={{flexGrow: 0}}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
                                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg"/>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{mt: '45px'}}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
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
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                    <Typography sx={{textAlign: 'center'}}>{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    {/* Profile Button End */}
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Header;