import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
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

const InKindDonation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date(),
    donor_name: '',
    donor_address: '',
    donor_phone: '',
    donor_email: '',
  });
  const [items, setItems] = useState([{ description: '', value: '' }]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [donationId, setDonationId] = useState(null);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.donor_name.trim()) {
      newErrors.donor_name = 'Donor name is required';
    }
    if (formData.donor_email && !/\S+@\S+\.\S+/.test(formData.donor_email)) {
      newErrors.donor_email = 'Please enter a valid email address';
    }
    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
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

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    if (errors[`item_${index}_${field}`]) {
      setErrors((prev) => ({
      ...prev,
        [`item_${index}_${field}`]: '',
      }));
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', value: '' }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const value = parseFloat(item.value);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
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
    
    try {
      // Filter out items with no description or value
      const validItems = items.filter(item => item.description && item.value);
      
      const response = await axios.post('/api/donations', {
        ...formData,
        type: 'in-kind',
        items: validItems.map(item => ({
          ...item,
          value: parseFloat(item.value) || 0
        })),
        total_value: calculateTotal(),
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
      setSnackbar({
        open: true,
        message: 'Error submitting donation. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    resetForm();
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

    try {
      await axios.post(`/api/donations/${donationId}/email`, {
        email: formData.donor_email,
      });

      setEmailConfirmOpen(true);

      // Redirect to home page after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error sending email:', error);

      // Extract error message from response if available
      let errorMessage = 'Error sending email. Please try again.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
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

  const resetForm = () => {
    setFormData({
      date: new Date(),
      donor_name: '',
      donor_address: '',
      donor_phone: '',
      donor_email: '',
    });
    setItems([{ description: '', value: '' }]);
    setErrors({});
  };

  // Filter valid items for display
  const validItems = items.filter(item => item.description && item.value);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          In-Kind Donation
        </Typography>
        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <DatePicker
                  label="Date of Gift"
                  value={formData.date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Donor Name"
                  name="donor_name"
                  value={formData.donor_name}
                  onChange={handleChange}
                  error={!!errors.donor_name}
                  helperText={errors.donor_name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="donor_address"
                  value={formData.donor_address}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="donor_phone"
                  value={formData.donor_phone}
                  onChange={handleChange}
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
                <Typography variant="h6" gutterBottom>
                  Donated Items
                </Typography>
                {errors.items && (
                  <Typography color="error" variant="body2" gutterBottom>
                    {errors.items}
                  </Typography>
                )}
                <List>
                  {items.map((item, index) => (
                    <ListItem key={index}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={5}>
                    <TextField
                      fullWidth
                            label="Description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            error={!!errors[`item_${index}_description`]}
                            helperText={errors[`item_${index}_description`]}
                    />
                  </Grid>
                        <Grid item xs={5}>
                    <TextField
                      fullWidth
                      label="Value"
                      type="number"
                            value={item.value}
                            onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                            error={!!errors[`item_${index}_value`]}
                            helperText={errors[`item_${index}_value`]}
                      InputProps={{
                        startAdornment: '$',
                      }}
                    />
                  </Grid>
                        <Grid item xs={2}>
                        <IconButton
                            color="error"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addItem}
                  sx={{ mt: 2 }}
                >
                  Add Item
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" align="right">
                  Total Value: ${calculateTotal().toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                >
                  Submit Donation
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        <Dialog
          open={previewOpen}
          onClose={handleClosePreview}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Receipt Preview</DialogTitle>
          <DialogContent>
            <div id="receipt-preview">
              <Box sx={{ p: 4, textAlign: 'center', borderBottom: 2, borderColor: '#F052A1', pb: 3, mb: 3 }}>
                <img 
                  src="/images.png" 
                  alt="My Sister's Closet Logo" 
                  style={{ maxWidth: '180px', marginBottom: '15px' }}
                />
                <Typography variant="h4" sx={{ color: '#F052A1', fontWeight: 'bold', mb: 2 }}>
                  Donation Receipt
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#666' }}>
                  Receipt ID: MSC-{donationId?.toString().padStart(4, '0')}
                </Typography>
              </Box>

              <Grid container spacing={1.5} sx={{ mb: 3 }}>
                <Grid item xs={4} sm={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#F052A1', fontSize: '1.1rem' }}>
                    Date of Gift:
                </Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="subtitle1" sx={{ fontSize: '1.1rem' }}>
                    {formData.date.toLocaleDateString()}
                </Typography>
                </Grid>

                <Grid item xs={4} sm={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#F052A1', fontSize: '1.1rem' }}>
                    Name:
                </Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="subtitle1" sx={{ fontSize: '1.1rem' }}>
                    {formData.donor_name}
                  </Typography>
                </Grid>

                {formData.donor_address && (
                  <>
                    <Grid item xs={4} sm={3}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#F052A1', fontSize: '1.1rem' }}>
                        Address:
                      </Typography>
                    </Grid>
                    <Grid item xs={8} sm={9}>
                      <Typography variant="subtitle1" sx={{ fontSize: '1.1rem' }}>
                        {formData.donor_address}
                      </Typography>
                    </Grid>
                  </>
                )}

                {formData.donor_phone && (
                  <>
                    <Grid item xs={4} sm={3}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#F052A1', fontSize: '1.1rem' }}>
                        Phone:
                      </Typography>
                    </Grid>
                    <Grid item xs={8} sm={9}>
                      <Typography variant="subtitle1" sx={{ fontSize: '1.1rem' }}>
                        {formatPhoneNumber(formData.donor_phone)}
                      </Typography>
                    </Grid>
                  </>
                )}

                {formData.donor_email && (
                  <>
                    <Grid item xs={4} sm={3}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#F052A1', fontSize: '1.1rem' }}>
                        Email:
                      </Typography>
                    </Grid>
                    <Grid item xs={8} sm={9}>
                      <Typography variant="subtitle1" sx={{ fontSize: '1.1rem' }}>
                        {formData.donor_email}
                    </Typography>
                    </Grid>
                  </>
                )}
              </Grid>

              {/* Always show table, even if empty */}
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        borderBottom: 2, 
                        borderRight: 1,
                        borderBottomColor: '#F052A1',
                        borderRightColor: '#F052A1',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        padding: '12px'
                      }}>
                        Description
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        borderBottom: 2,
                        borderBottomColor: '#F052A1',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        padding: '12px'
                      }}>
                        Value
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => {
                      // Check if this item has both description and value
                      const isValid = item.description && item.value;
                      const borderColor = isValid ? '#eee' : '#333';
                      
                      return (
                        <TableRow key={index}>
                          <TableCell sx={{ 
                            borderBottom: 1,
                            borderRight: 1,
                            borderBottomColor: borderColor,
                            borderRightColor: borderColor,
                            padding: isValid ? '10px' : '20px',
                            height: isValid ? 'auto' : '50px'
                          }}>
                            {isValid ? item.description : '\u00A0'}
                          </TableCell>
                          <TableCell align="right" sx={{ 
                            borderBottom: 1,
                            borderBottomColor: borderColor,
                            padding: isValid ? '10px' : '20px',
                            height: isValid ? 'auto' : '50px'
                          }}>
                            {isValid ? `$${parseFloat(item.value || 0).toFixed(2)}` : '\u00A0'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell sx={{ 
                        borderTop: 2,
                        borderRight: 1,
                        borderTopColor: '#F052A1',
                        borderRightColor: '#F052A1',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        padding: '12px'
                      }}>
                        Total Value
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        borderTop: 2,
                        borderTopColor: '#F052A1',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        padding: '12px'
                      }}>
                        ${calculateTotal().toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify', lineHeight: 1.5, fontSize: '1rem' }}>
                On behalf of the women we serve and My Sister's Closet staff, we wish to thank you for 
                contributing to our organization. Your support is deeply appreciated. Your generous gift will 
                help us to provide essential tools and training to low-income and at-risk women who have the 
                immediate goal of moving beyond poverty by finding sustainable employment. By helping 
                these vulnerable women remarket themselves as credible, professional, and reliable job 
                candidates, we can directly increase their chances of eventually becoming self-sufficient.
              </Typography>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify', lineHeight: 1.5, fontSize: '1rem' }}>
                Since 1998, MSC has helped thousands of voucher clients with essential mentoring and advocacy 
                assistance to overcome obstacles such as homelessness and domestic violence. In many cases, these 
                individuals have not been able to move forward because they lack basic life skills and education. My 
                Sister's Closet of Monroe County helps them take critical steps to change their ability to move into 
                better-paying jobs with benefits. By providing this unique assistance, they are able to change their 
                economic standing and provide better lives for their children.
              </Typography>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify', lineHeight: 1.5, fontSize: '1rem' }}>
                My Sister's Closet also provides emergency clothing and hygiene products (hats, gloves, 
                chapstick, sunscreen, dry socks, shoes, etc.) to over one hundred indigent walk-ins. In addition, 
                approximately 800 local women each year seek out My Sister's Closet for discounted professional 
                clothing and free image consulting.
              </Typography>

              <Typography variant="body1" paragraph sx={{ textAlign: 'justify', lineHeight: 1.5, fontSize: '1rem' }}>
                We can only continue to provide these life-changing services because of your valuable support.
              </Typography>

              <Box sx={{ mt: 3, color: '#F052A1' }}>
                <Typography variant="body1" paragraph sx={{ mb: 0.5 }}>
                  Warmest and sincerest thanks and appreciation!
                </Typography>
                <Typography variant="body1">
                  Sandy Keller<br />
                  Founder / Executive Director
                </Typography>
              </Box>

              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 3, 
                  pt: 2,
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
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreview}>Close</Button>
            <Button onClick={generatePDF} color="primary">
              Print Receipt
            </Button>
            <Button onClick={handleEmailReceipt}>Email</Button>
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

export default InKindDonation;