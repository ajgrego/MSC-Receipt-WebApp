import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
} from '@mui/material';
import { Home as HomeIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: 'white', color: 'primary.main' }}>
      <Toolbar>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Avatar 
            src="/images.png" 
            alt="My Sister's Closet Logo" 
            sx={{ width: 60, height: 60, mr: 2 }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: '#F052A1',
            }}
          >
            My Sister's Closet
          </Typography>
        </Box>
        <Box>
          <Button
            color="primary"
            component={RouterLink}
            to="/cash-donation"
            sx={{ mx: 1 }}
          >
            Cash Donation
          </Button>
          <Button
            color="primary"
            component={RouterLink}
            to="/in-kind-donation"
            sx={{ mx: 1 }}
          >
            In-Kind Donation
          </Button>
          <Button
            color="primary"
            component={RouterLink}
            to="/admin"
            startIcon={<AdminIcon />}
            sx={{ mx: 1 }}
          >
            Admin
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 