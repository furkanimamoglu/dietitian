import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import SpaIcon from '@mui/icons-material/Spa';
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';
import {Search} from "@mui/icons-material";
import SearchIcon from '@mui/icons-material/Search';
import {alpha, InputBase, styled} from "@mui/material";

const settings = ['Profil', 'Hesap', 'Ayarlar', 'Çıkış Yap'];

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
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    }));

    const SearchIconWrapper = styled('div')(({ theme }) => ({
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }));

    const StyledInputBase = styled(InputBase)(({ theme }) => ({
        color: 'inherit',
        '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '20ch',
            },
        },
    }));


    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <AppBar sx={{boxShadow: "0 4px 6px rgba(0,0,0,0.1)"}} position="static">
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

                    {/* Search Bar Start */}
                    <Box sx={{ justifyContent: 'flex-end', pr: 2, display: {xs: 'flex', md: 'flex'}}}>
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
            </Container>
        </AppBar>
    );
}

export default Header;