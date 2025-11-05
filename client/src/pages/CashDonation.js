import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import html2pdf from 'html2pdf.js';
import axios from 'axios';

// Format phone number to (XXX) XXX-XXXX
const formatPhoneNumber = (phoneNumberString) => {
  if (!phoneNumberString) return '';
  
  // Strip all non-numeric characters
  const cleaned = phoneNumberString.replace(/\D/g, '');
  
  // Check if the number is valid
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  
  // If the number doesn't match the expected format, return the original
  return phoneNumberString;
};

const CashDonation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date(),
    donor_name: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    donor_phone: '',
    donor_email: '',
    amount: '',
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [donationId, setDonationId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.donor_name.trim()) {
      newErrors.donor_name = 'Donor name is required';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount greater than 0';
      }
    }
    
    // Optional fields with validation
    if (formData.donor_email && !/\S+@\S+\.\S+/.test(formData.donor_email)) {
      newErrors.donor_email = 'Please enter a valid email address';
    }
    
    if (formData.donor_phone) {
      const phoneRegex = /^\+?[\d\s-()]{10,}$/;
      if (!phoneRegex.test(formData.donor_phone)) {
        newErrors.donor_phone = 'Please enter a valid phone number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form',
        severity: 'error',
      });
      return;
    }
    
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setLoading(true);
    
    try {
      // Format the date in YYYY-MM-DD format while preserving local date
      const localDate = new Date(formData.date);
      const formattedDate = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
      
      const response = await axios.post('/api/donations', {
        ...formData,
        type: 'cash',
        amount: parseFloat(formData.amount),
        date: formattedDate,
      });
      
      setDonationId(response.data.id);
      setPreviewOpen(true);
      
      setSnackbar({
        open: true,
        message: 'Donation submitted successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error submitting donation:', error);
      const errorMessage = error.response?.data?.error || 'Error submitting donation. Please try again.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const element = document.getElementById('receipt-preview');
    if (!element) {
      setSnackbar({
        open: true,
        message: 'Error printing receipt. Receipt preview not found.',
        severity: 'error',
      });
      return;
    }

    // Add print-specific styles
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #receipt-preview, #receipt-preview * {
          visibility: visible;
        }
        #receipt-preview {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px;
        }
        @page {
          size: letter;
          margin: 0.5in;
        }
      }
    `;
    document.head.appendChild(style);

    // Print the document
    window.print();

    // Remove the style after printing
    document.head.removeChild(style);

    // Show success message
    setSnackbar({
      open: true,
      message: 'Print dialog opened successfully!',
      severity: 'success',
    });

    // Redirect to home page after a delay
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const handleEmailReceipt = async () => {
    if (!formData.donor_email) {
      setSnackbar({
        open: true,
        message: 'Email address is required to send receipt',
        severity: 'error',
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`/api/donations/${donationId}/email`, {
        email: formData.donor_email,
      });
      
      setEmailConfirmOpen(true);
      
      // Redirect to home page after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      const errorMessage = error.response?.data?.error || 'Error sending email receipt. Please try again.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const resetForm = () => {
    setFormData({
      date: new Date(),
      donor_name: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      donor_phone: '',
      donor_email: '',
      amount: '',
    });
    setErrors({});
    setDonationId(null);
    setPreviewOpen(false);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    resetForm();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Cash Donation Form
        </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Donation Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  error={!!errors.amount}
                  helperText={errors.amount}
                  InputProps={{
                    startAdornment: <Typography>$</Typography>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Donor Name"
                  name="donor_name"
                  value={formData.donor_name}
                  onChange={handleChange}
                  error={!!errors.donor_name}
                  helperText={errors.donor_name}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  inputProps={{ maxLength: 2 }}
                />
              </Grid>

              <Grid item xs={6} sm={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="donor_phone"
                  value={formData.donor_phone}
                  onChange={handleChange}
                  error={!!errors.donor_phone}
                  helperText={errors.donor_phone}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="donor_email"
                  type="email"
                  value={formData.donor_email}
                  onChange={handleChange}
                  error={!!errors.donor_email}
                  helperText={errors.donor_email}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Donation'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Confirm Donation</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to submit this donation?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmSubmit} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Receipt Preview Dialog */}
        <Dialog
          open={previewOpen}
          onClose={handleClosePreview}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Donation Receipt</DialogTitle>
          <DialogContent>
            <Box id="receipt-preview" sx={{ p: 3 }}>
              <Box sx={{ textAlign: 'center', mb: 2, borderBottom: 2, borderColor: '#F052A1', pb: 2 }}>
                <img 
                  src="/images.png" 
                  alt="My Sister's Closet Logo" 
                  style={{ maxWidth: '180px', marginBottom: '10px' }}
                />
                <Typography variant="h5" sx={{ color: '#F052A1' }}>
                  Donation Receipt
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#666', mt: 1 }}>
                  Receipt ID: MSC-{donationId?.toString().padStart(4, '0')}
                </Typography>
              </Box>
              
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={4} sm={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#F052A1' }}>
                    Date of Gift:
                  </Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="subtitle1">
                    {formData.date.toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={4} sm={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#F052A1' }}>
                    Name:
                  </Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="subtitle1">
                    {formData.donor_name}
                  </Typography>
                </Grid>
                
                {(formData.street_address || formData.city || formData.state || formData.zip_code) && (
                  <>
                    <Grid item xs={4} sm={3}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#F052A1' }}>
                        Address:
                      </Typography>
                    </Grid>
                    <Grid item xs={8} sm={9}>
                      {formData.street_address && (
                        <Typography variant="subtitle1">
                          {formData.street_address}
                        </Typography>
                      )}
                      {(formData.city || formData.state || formData.zip_code) && (
                        <Typography variant="subtitle1">
                          {[formData.city, formData.state, formData.zip_code].filter(Boolean).join(', ')}
                        </Typography>
                      )}
                    </Grid>
                  </>
                )}
                
                {formData.donor_phone && (
                  <>
                    <Grid item xs={4} sm={3}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#F052A1' }}>
                        Phone:
                      </Typography>
                    </Grid>
                    <Grid item xs={8} sm={9}>
                      <Typography variant="subtitle1">
                        {formatPhoneNumber(formData.donor_phone)}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {formData.donor_email && (
                  <>
                    <Grid item xs={4} sm={3}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#F052A1' }}>
                        Email:
                      </Typography>
                    </Grid>
                    <Grid item xs={8} sm={9}>
                      <Typography variant="subtitle1">
                        {formData.donor_email}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={4} sm={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#F052A1' }}>
                    Amount:
                  </Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="subtitle1">
                    ${parseFloat(formData.amount).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="body1" paragraph sx={{ mt: 2, textAlign: 'justify', lineHeight: 1.4, fontSize: '0.95rem' }}>
                Dear {formData.donor_name},
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify', lineHeight: 1.4, fontSize: '0.95rem' }}>
                On behalf of the women we serve, thank you for your generous gift. MSC uses unique 
                mentoring, advocacy, tools and training services to help clients living in poverty or at-risk 
                circumstances stabilize their lives and meet with life success. By helping these women remarket 
                themselves as credible, professional, and reliable job candidates, we can directly increase their 
                chances of becoming self-sufficient.
              </Typography>
              <Typography variant="body1" paragraph sx={{ textAlign: 'justify', lineHeight: 1.4, fontSize: '0.95rem' }}>
                Since 1998, MSC has helped thousands of women move past obstacles such as homelessness 
                and domestic violence, and into better-paying jobs with benefits. By providing these life-changing 
                services, they are able to improve their economic standing and provide brighter lives for their children.
                </Typography>
              
              <Box sx={{ mt: 2, color: '#F052A1' }}>
                <Typography variant="body1" paragraph>
                  Warmest and sincerest thanks and appreciation!
                </Typography>
                <Typography variant="body1">
                  Sandy Keller
                </Typography>
                <Typography variant="body1">
                  Founder / Executive Director
                </Typography>
              </Box>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 2, 
                  pt: 1,
                  fontStyle: 'italic', 
                  color: 'text.secondary',
                  fontSize: '0.9rem',
                  borderTop: 1,
                  borderColor: '#F052A1'
                }}
              >
                This letter serves as your official receipt for tax purposes. My Sister's Closet is a registered non-profit organization. 
                No goods or services were provided in exchange for this donation.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreview}>Close</Button>
            <Button onClick={generatePDF} color="primary">
              Print Receipt
            </Button>
            {formData.donor_email && (
              <Button onClick={handleEmailReceipt} color="primary">
                Email Receipt
              </Button>
            )}
          </DialogActions>
        </Dialog>
        
        {/* Email Confirmation Dialog */}
        <Dialog
          open={emailConfirmOpen}
          maxWidth="sm"
          fullWidth
        >
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: '#f5f5f5'
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#F052A1',
                fontWeight: 'bold',
                mb: 2
              }}
            >
              Receipt Sent Successfully!
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Thank you for your donation to My Sister's Closet.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              A receipt has been emailed to:
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontStyle: 'italic',
                color: '#666',
                mb: 3
              }}
            >
              {formData.donor_email}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666',
                fontStyle: 'italic'
              }}
            >
              Redirecting to home page...
            </Typography>
          </Box>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

export default CashDonation; 