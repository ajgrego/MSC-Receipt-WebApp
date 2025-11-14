import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem,
  IconButton,
  DialogContentText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Download as DownloadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';

// Add phone number formatting function
const formatPhoneNumber = (phoneNumberString) => {
  if (!phoneNumberString) return '';
  
  // Strip all non-numeric characters
  const cleaned = phoneNumberString.replace(/\D/g, '');
  
  // Check if the number is valid
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  // If the number doesn't match the expected format, return the original
  return phoneNumberString;
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    type: '',
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingDonation, setDeletingDonation] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('adminToken');
      if (!storedToken) {
        setToken(null);
        setLoginOpen(true);
        setLoading(false);
        return;
      }

      try {
        // Verify token with server
        const response = await axios.get('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.data.valid) {
          setToken(storedToken);
          setLoginOpen(false);
          const socket = io();
          await fetchDonations();
          
          socket.on('donationUpdate', () => {
            fetchDonations();
          });
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('adminToken');
        setToken(null);
        setLoginOpen(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (token) {
      setLoginOpen(false);
      fetchDonations();
    }
  }, [token]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/donations', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      setDonations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setError('Failed to fetch donations. Please try logging in again.');
      setLoading(false);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('adminToken');
        setToken(null);
        setLoginOpen(true);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token: newToken } = response.data;
      
      localStorage.setItem('adminToken', newToken);
      setToken(newToken);
      setCredentials({ username: '', password: '' });
      setLoginOpen(false);
      
      setSnackbar({
        open: true,
        message: 'Login successful!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Login error:', error);
      setSnackbar({
        open: true,
        message: 'Invalid credentials. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleExport = async () => {
    try {
      console.log('Starting export with token:', token);
      const response = await axios.get('/api/donations/export/excel', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        responseType: 'blob',
      });

      console.log('Response received:', response.status);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'MSC-Donations.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Donations exported successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Export error:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Failed to export donations. ';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage += 'Session expired. Please log in again.';
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error',
          });
          return;
        } else {
          errorMessage += error.response.data?.error || error.message;
        }
      } else if (error.request) {
        errorMessage += 'Server not responding. Please try again.';
      } else {
        errorMessage += error.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDeleteClick = (donation) => {
    setDeletingDonation(donation);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/donations/${deletingDonation.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSnackbar({
        open: true,
        message: 'Donation deleted successfully',
        severity: 'success',
      });
      
      // Refresh the donations list
      fetchDonations();
    } catch (error) {
      console.error('Error deleting donation:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting donation. Please try again.',
        severity: 'error',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setDeletingDonation(null);
    }
  };

  const filteredDonations = donations.filter((donation) => {
    const donationDate = new Date(donation.date);
    const matchesStartDate = !filters.startDate || donationDate >= filters.startDate;
    const matchesEndDate = !filters.endDate || donationDate <= filters.endDate;
    const matchesType = !filters.type || donation.type === filters.type;
    return matchesStartDate && matchesEndDate && matchesType;
  });

  if (loading && !loginOpen) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ py: 4 }}>
        {token ? (
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              Admin Panel
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(date) => setFilters((prev) => ({ ...prev, startDate: date }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="End Date"
                    value={filters.endDate}
                    onChange={(date) => setFilters((prev) => ({ ...prev, endDate: date }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label="Donation Type"
                    value={filters.type}
                    onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="in-kind">In-Kind</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {filteredDonations.length} donation{filteredDonations.length !== 1 ? 's' : ''} found
              </Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={filteredDonations.length === 0}
              >
                Export to Excel
              </Button>
            </Box>

            {filteredDonations.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No donations found matching your criteria.</Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Donor Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDonations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>
                          {(() => {
                            let dateParts;
                            if (donation.date.includes('T')) {
                              const isoDate = new Date(donation.date);
                              dateParts = [
                                isoDate.getFullYear().toString(),
                                (isoDate.getMonth() + 1).toString().padStart(2, '0'),
                                isoDate.getDate().toString().padStart(2, '0')
                              ];
                            } else {
                              dateParts = donation.date.split('-');
                            }
                            return `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
                          })()}
                        </TableCell>
                        <TableCell>{donation.type === 'cash' ? 'Cash' : 'In-Kind'}</TableCell>
                        <TableCell>{donation.donor_name}</TableCell>
                        <TableCell>{donation.donor_email}</TableCell>
                        <TableCell>{formatPhoneNumber(donation.donor_phone)}</TableCell>
                        <TableCell align="right">
                          ${donation.type === 'cash' 
                            ? (donation.amount ? parseFloat(donation.amount).toFixed(2) : '0.00')
                            : (donation.total_value ? parseFloat(donation.total_value).toFixed(2) : '0.00')}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleDeleteClick(donation)}
                            color="error"
                            size="small"
                            title="Delete donation"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={deleteConfirmOpen}
              onClose={() => setDeleteConfirmOpen(false)}
            >
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this donation?<br /><br />
                  <strong>Receipt ID:</strong> MSC-{deletingDonation?.id?.toString().padStart(4, '0')}<br />
                  <strong>Donor:</strong> {deletingDonation?.donor_name || 'N/A'}<br />
                  <strong>Date:</strong> {deletingDonation ? (() => {
                    let dateParts;
                    if (deletingDonation.date.includes('T')) {
                      const isoDate = new Date(deletingDonation.date);
                      dateParts = [
                        isoDate.getFullYear().toString(),
                        (isoDate.getMonth() + 1).toString().padStart(2, '0'),
                        isoDate.getDate().toString().padStart(2, '0')
                      ];
                    } else {
                      dateParts = deletingDonation.date.split('-');
                    }
                    return `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
                  })() : 'N/A'}<br />
                  <strong>Amount:</strong> ${deletingDonation?.type === 'cash' 
                    ? (deletingDonation.amount ? parseFloat(deletingDonation.amount).toFixed(2) : '0.00')
                    : (deletingDonation?.total_value ? parseFloat(deletingDonation.total_value).toFixed(2) : '0.00')}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : null}

        <Dialog 
          open={!token || loginOpen}
          onClose={() => {
            if (token) {
              setLoginOpen(false);
            }
          }}
          disableEscapeKeyDown
          disableBackdropClick
        >
          <DialogTitle>Admin Login</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, username: e.target.value }))
                }
                margin="normal"
                required
                autoFocus
              />
              <TextField
                fullWidth
                label=""
                name="password"
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, password: e.target.value }))
                }
                margin="normal"
                required
              />
              <DialogActions sx={{ px: 0, pt: 2 }}>
                <Button onClick={() => navigate('/')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Login
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default AdminPanel; 