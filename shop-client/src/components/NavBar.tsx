import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
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
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  
    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorElUser(event.currentTarget);
    };
  
    const handleCloseNavMenu = () => {
      setAnchorElNav(null);
    };
  
    const handleCloseUserMenu = () => {
      setAnchorElUser(null);
    };
    return (
        <div>
            <AppBar component="nav" position="static">
                <Container maxWidth="xl">
                    <Toolbar className="header">
                        <Typography variant="h6" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
                            Gestion de boutiques
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box>
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
