import { AppBar, Box, Button, Container, IconButton, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import SwitchLanguage from "./SwitchLanguage";
import React from "react";

const navItems = [
    { label: 'Boutiques', path: '/' },
    { label: 'Produits', path: '/product' },
    { label: 'Catégories', path: '/category' },
];

const NavBar = () => {
    const navigate = useNavigate();
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  
    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorElNav(event.currentTarget);
    };
  
    const handleCloseNavMenu = () => {
      setAnchorElNav(null);
    };
    
    return (
        <div>
            <AppBar component="nav" position="static">
                <Container maxWidth="xl">
                    <Toolbar className="header">
                        <Typography
                            variant="h6"
                            onClick={() => navigate('/')} 
                            component="a"
                            sx={{ cursor: 'pointer' }}>
                             Gestion de boutiques
                        </Typography>
                        <IconButton
                            size="large"
                            aria-label="navigation"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                            sx={{display: { xs: 'flex', md: 'none' }, mr: 1 }}
                        >
                                <MenuIcon sx={{ color: "white"}} />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: 'block', md: 'none' } }}
                            >
                            {navItems.map((item) => (
                                <MenuItem key={item.label} onClick={handleCloseNavMenu}>
                                <Typography sx={{ textAlign: 'center' }} onClick={() => navigate(item.path)}>{item.label}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box sx={{display: { xs: 'none', md: 'flex' }, mr: 1 }}>
                            {navItems.map((item) => (
                                <Button key={item.label} sx={{ color: '#fff' }} onClick={() => navigate(item.path)}>
                                    {item.label}
                                </Button>
                            ))}
                        </Box>
                        <Box>
                            <SwitchLanguage />
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </div>
    );
};

export default NavBar;