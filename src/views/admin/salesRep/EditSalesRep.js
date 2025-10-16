import React, { useEffect } from 'react';
import {
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  FormControl,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  InputAdornment
} from '@mui/material';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconUpload, IconFileImport } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';

const EditSalesRep = () => {
  const [formData, setFormData] = React.useState({
    salesRepId: '',
    password: '', // Note: Password won't be populated for security
    customers: [],
  });
  const [error, setError] = React.useState('');
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const navigate = useNavigate();
  const [customers, setCustomers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const { id } = useParams();

  // Check if all customers are selected
  const allCustomersSelected = customers.length > 0 && formData.customers.length === customers.length;

  // Handle multiple customer selection with "Select All" functionality
  const handleCustomerChange = (e) => {
    const selectedCustomerIds = e.target.value;

    // Check if "Select All" was triggered
    if (selectedCustomerIds.includes('select-all')) {
      if (allCustomersSelected) {
        // If all were selected, clear selection
        setFormData(prev => ({
          ...prev,
          customers: []
        }));
      } else {
        // If not all were selected, select all
        const allCustomerIds = customers.map(customer => customer._id);
        setFormData(prev => ({
          ...prev,
          customers: allCustomerIds
        }));
      }
    } else {
      // Normal selection
      setFormData(prev => ({
        ...prev,
        customers: selectedCustomerIds
      }));
    }
  };

  const fetchSalesRepById = async () => {
    try {
      const res = await axiosInstance.get(`/sales-rep/get-sales-rep/${id}`);

      console.log("fetch sales rep by id ", res);
      
      // FIXED: Access the data from response.data.data
      const salesRepData = res.data.data;
      
      // Extract customer IDs from the populated customers array
      const customerIds = salesRepData.customers?.map(customer => customer._id) || [];
      
      setFormData({
        salesRepId: salesRepData.salesRepId || '',
        password: '', // Password is hashed, so we don't pre-fill it
        customers: customerIds,
      });
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred');
      console.error('Error fetching sales representative by ID:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSalesRepById();
    }
  }, [id]);

  const handleSubmit = async () => {
    // Form validation
    if (!formData.salesRepId || formData.salesRepId.trim() === '') {
      setError('Please enter a sales rep ID');
      return;
    }
    if (!formData.customers || formData.customers.length === 0) {
      setError('Please select at least one customer');
      return;
    }

    try {
      setLoading(true);

      // Prepare data for submission
      const submitData = {
        salesRepId: formData.salesRepId,
        customers: formData.customers
      };

      // Only include password if it was changed (not empty)
      if (formData.password && formData.password.trim() !== '') {
        submitData.password = formData.password;
      }

      const res = await axiosInstance.put(`/sales-rep/update-sales-rep/${id}`, submitData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Sales rep update response:", res.data);

      if (res.data.statusCode === 200) {
        setError('Sales representative updated successfully!');
        setTimeout(() => {
          navigate('/dashboard/SalesRep/list'); // FIXED: Corrected navigation path
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred');
      console.error('Error updating sales representative:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a valid CSV file');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleImportCsvFile = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first');
      return;
    }

    try {
      setLoading(true);
      const formDataForUpload = new FormData();
      formDataForUpload.append('salesReps', selectedFile);

      const res = await axiosInstance.post('/sales-rep/import-sales-reps', formDataForUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("CSV imported", res.data);

      if (res.data.statusCode === 200) {
        setCsvDialogOpen(false);
        setSelectedFile(null);
        setError('CSV imported successfully!');
        const fileInput = document.getElementById('csv-file-input');
        if (fileInput) fileInput.value = '';

        setTimeout(() => {
          navigate('/dashboard/sales-reps/list');
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred while importing CSV');
      console.error('CSV import error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCsvDialog = () => {
    setCsvDialogOpen(false);
    setSelectedFile(null);
    setError('');
    const fileInput = document.getElementById('csv-file-input');
    if (fileInput) fileInput.value = '';
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/get-all-users');
      console.log("response customers", response);

      if (response.data.statusCode === 200) {
        const customersData = Array.isArray(response.data.data)
          ? response.data.data
          : response.data.data?.docs || [];

        // Filter unique customers by _id
        const uniqueCustomers = customersData.filter(
          (customer, index, self) =>
            index === self.findIndex((c) => c._id === customer._id)
        );

        setCustomers(uniqueCustomers);
      }
    } catch (error) {
      console.error('Error fetching customers list:', error);
      setError('Error fetching customers: ' + error.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Sales Representative
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Update the sales representative details below
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Sales Rep ID */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="sales-rep-id" sx={{ mt: 2 }}>
            Sales Rep ID
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="sales-rep-id"
            fullWidth
            value={formData.salesRepId}
            onChange={(e) => setFormData({ ...formData, salesRepId: e.target.value })}
            placeholder="Enter sales rep ID (e.g., SR001)"
          />
        </Grid>

        {/* Password */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="password" sx={{ mt: 2 }}>
            Password
          </CustomFormLabel>
          <CustomOutlinedInput
            id="password"
            fullWidth
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter new password (leave blank to keep current)"
          />
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Leave blank if you don't want to change the password
          </Typography>
        </Grid>

        {/* Customer Selection - Multiple */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="customer-select" sx={{ mt: 2 }}>
            Select Customers (Multiple)
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              id="customer-select"
              multiple
              value={formData.customers}
              onChange={handleCustomerChange}
              disabled={loading || !Array.isArray(customers) || customers.length === 0}
              displayEmpty
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return 'Select customers';
                }
                if (allCustomersSelected) {
                  return `All Customers (${customers.length})`;
                }
                const selectedNames = selected.map(customerId => {
                  const customer = customers.find(c => c._id === customerId);
                  return customer ? (customer.customerName || customer.name || customerId) : customerId;
                });
                return selectedNames.join(', ');
              }}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.87)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <MenuItem value="" disabled>
                {!Array.isArray(customers) || customers.length === 0 ? 'Loading customers...' : 'Select customers'}
              </MenuItem>

              {/* Select All Option */}
              {Array.isArray(customers) && customers.length > 0 && (
                <MenuItem value="select-all">
                  <Checkbox
                    checked={allCustomersSelected}
                    indeterminate={formData.customers.length > 0 && !allCustomersSelected}
                  />
                  <ListItemText
                    primary="Select All Customers"
                    secondary={`${customers.length} customers available`}
                  />
                </MenuItem>
              )}

              {/* Customer List */}
              {Array.isArray(customers) && customers.map((customer) => (
                <MenuItem key={customer._id} value={customer._id}>
                  <Checkbox checked={formData.customers.indexOf(customer._id) > -1} />
                  <ListItemText
                    primary={customer.customerName || customer.name}
                    secondary={`ID: ${customer.customerId || customer._id}`}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Selection Summary */}
          {formData.customers.length > 0 && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              {allCustomersSelected
                ? `All ${customers.length} customers selected`
                : `${formData.customers.length} of ${customers.length} customers selected`
              }
            </Typography>
          )}
        </Grid>

        {/* Error/Success Message */}
        {error && (
          <Grid size={12} mt={2}>
            <div style={{
              color: error.includes('success') ? 'green' : 'red',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: error.includes('success') ? '#f0f9ff' : '#fef2f2',
              border: `2px solid ${error.includes('success') ? '#22c55e' : '#ef4444'}`,
              fontWeight: 'bold'
            }}>
              {error}
            </div>
          </Grid>
        )}

        {/* Action Buttons */}
        <Grid size={12} mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ mr: 2, backgroundColor: '#2E2F7F', minWidth: '200px' }}
          >
            {loading ? 'Updating...' : 'Update Sales Rep'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/dashboard/sales-reps/list')}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          {/* <Button
            variant="outlined"
            color="secondary"
            onClick={() => setCsvDialogOpen(true)}
            disabled={loading}
          >
            Import CSV
          </Button> */}
        </Grid>
      </Grid>

      {/* CSV Import Dialog */}
      <Dialog
        open={csvDialogOpen}
        onClose={handleCloseCsvDialog}
        maxWidth="sm"
        fullWidth
      >
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            position: 'absolute',
            borderRadius: 1
          }}
          open={loading}
        >
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress color="inherit" size={50} />
            <Typography variant="body2" color="inherit">
              Importing CSV file, please wait...
            </Typography>
          </Box>
        </Backdrop>

        <DialogTitle>
          Import Sales Representatives from CSV
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Select a CSV file to import multiple sales representatives at once.
            </Typography>

            <input
              id="csv-file-input"
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                component="label"
                htmlFor="csv-file-input"
                startIcon={loading ? <CircularProgress size={16} /> : <IconUpload size="1.1rem" />}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Choose File'}
              </Button>

              {selectedFile && !loading && (
                <Typography variant="body2" color="primary">
                  {selectedFile.name}
                </Typography>
              )}
            </Box>

            {error && !error.includes('success') && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseCsvDialog}
            disabled={loading}
            sx={{ opacity: loading ? 0.5 : 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImportCsvFile}
            variant="contained"
            disabled={!selectedFile || loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <IconFileImport size="1.1rem" />}
            sx={{ backgroundColor: '#2E2F7F' }}
          >
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EditSalesRep;