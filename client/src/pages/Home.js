import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import {
  AttachMoney as CashIcon,
  Inventory as InKindIcon,
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to My Sister's Closet
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Thank you for your generosity. Please select the type of donation you'd like to make.
      </Typography>

      <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
        <Grid item xs={12} sm={6}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
            onClick={() => navigate('/cash-donation')}
          >
            <CashIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              Cash Donation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Make a monetary donation to support our cause
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
            onClick={() => navigate('/in-kind-donation')}
          >
            <InKindIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              In-Kind Donation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Donate items to help those in need
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home; 