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
  InputAdornment,
  InputLabel,
  Chip
} from '@mui/material';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconUpload, IconFileImport } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';
import { Autocomplete, TextField } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';


const CreateSalesRep = () => {
  const [formData, setFormData] = React.useState({
    email: '',
    name: '',
    password: '',
    role: 'Sales-Rep', // Default role
    customers: [],
  });
  const [error, setError] = React.useState('');
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const navigate = useNavigate();
  const [customers, setCustomers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // Role options from schema
  const roles = ['Sales-Rep', 'Master-Sales-Rep'];

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

  const handleSubmit = async () => {
    // Clear previous errors
    setError('');

    // Form validation
    if (!formData.email || formData.email.trim() === '') {
      setError('Please enter an email address');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.name || formData.name.trim() === '') {
      setError('Please enter a name');
      return;
    }

    if (!formData.password || formData.password.trim() === '') {
      setError('Please enter a password');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    if (!formData.role) {
      setError('Please select a role');
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
        email: formData.email.trim(),
        name: formData.name.trim(),
        password: formData.password,
        role: formData.role,
        customers: formData.customers
      };

      console.log("Submitting data:", submitData);

      const res = await axiosInstance.post('/sales-rep/create-sales-rep', submitData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Sales rep creation response:", res.data);

      if (res.data.statusCode === 200 || res.data.statusCode === 201) {
        setFormData({
          email: '',
          name: '',
          password: '',
          role: 'Sales-Rep',
          customers: [],
        });
        setError('Sales representative created successfully!');
        setTimeout(() => {
          navigate('/dashboard/SalesRep/list');
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred');
      console.error('Error creating sales representative:', error);
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
          navigate('/dashboard/SalesRep/list');
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
  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Create Sales Rep',
    },
  ];


  return (
    <div>
      <Breadcrumb title="Create Sales Rep" items={BCrumb} />

      <Grid container spacing={2}>
        {/* Email */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="email" sx={{ mt: 2 }}>
            Email
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="email"
            fullWidth
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address (e.g., salesrep@example.com)"
          />
        </Grid>

        {/* Name */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="name" sx={{ mt: 2 }}>
            Name
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name (e.g., John Doe)"
          />
        </Grid>

        {/* Role Selection */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="role-select" sx={{ mt: 2 }}>
            Role
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              id="role-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              displayEmpty
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
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
            {formData.role === 'Master-Sales-Rep'
              ? 'Master Sales Representatives have additional privileges'
              : 'Standard Sales Representative role'}
          </Typography>
        </Grid>

        {/* Password */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="password" sx={{ mt: 2 }}>
            Password
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="password"
            fullWidth
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter password (minimum 6 characters)"
          />
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
            Password must be at least 6 characters long
          </Typography>
        </Grid>

        {/* Customer Selection - Multiple */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="customer-select" sx={{ mt: 2 }}>
            Select Customers (Multiple)
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              id="customer-select"
              multiple
              value={customers.filter(customer => formData.customers.includes(customer._id))}
              onChange={(event, newValue, reason, details) => {
                // Handle "Select All" functionality
                if (details?.option?.selectAll) {
                  if (allCustomersSelected) {
                    // Deselect all
                    handleCustomerChange({
                      target: {
                        value: []
                      }
                    });
                  } else {
                    // Select all
                    handleCustomerChange({
                      target: {
                        value: customers.map(c => c._id)
                      }
                    });
                  }
                } else {
                  // Normal selection
                  handleCustomerChange({
                    target: {
                      value: newValue.map(customer => customer._id)
                    }
                  });
                }
              }}
              options={[
                // Add "Select All" as first option
                ...(customers.length > 0 ? [{ _id: 'select-all', customerName: 'Select All Customers', customerId: `${customers.length} customers available`, selectAll: true }] : []),
                ...customers
              ]}
              getOptionLabel={(option) => {
                if (option.selectAll) {
                  return `Select All Customers (${customers.length})`;
                }
                return option.customerName || option.name || '';
              }}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              disabled={loading || !Array.isArray(customers) || customers.length === 0}
              disableCloseOnSelect
              noOptionsText={!Array.isArray(customers) || customers.length === 0 ? 'Loading customers...' : 'No customers found'}
              renderOption={(props, option, { selected }) => {
                const { key, ...otherProps } = props;
                if (option.selectAll) {
                  return (
                    <li key={key} {...otherProps}>
                      <Checkbox
                        checked={allCustomersSelected}
                        indeterminate={formData.customers.length > 0 && !allCustomersSelected}
                        style={{ marginRight: 8 }}
                      />
                      <ListItemText
                        primary="Select All Customers"
                        secondary={`${customers.length} customers available`}
                      />
                    </li>
                  );
                }
                return (
                  <li key={key} {...otherProps}>
                    <Checkbox
                      checked={selected}
                      style={{ marginRight: 8 }}
                    />
                    <ListItemText
                      primary={option.customerName || option.name}
                      secondary={`ID: ${option.customerId || option._id}`}
                    />
                  </li>
                );
              }}
              renderTags={(value, getTagProps) => {
                if (allCustomersSelected) {
                  return (
                    <Chip
                      label={`All Customers (${customers.length})`}
                      size="small"
                      onDelete={() => {
                        handleCustomerChange({
                          target: {
                            value: []
                          }
                        });
                      }}
                    />
                  );
                }
                return value
                  .filter(option => !option.selectAll)
                  .map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option._id}
                      label={option.customerName || option.name || option._id}
                      size="small"
                    />
                  ));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={!Array.isArray(customers) || customers.length === 0 ? 'Loading customers...' : 'Search and select customers'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.87)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              )}
            />
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
            {loading ? 'Creating...' : 'Create Sales Rep'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setCsvDialogOpen(true)}
            disabled={loading}
          >
            Import CSV
          </Button>
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

export default CreateSalesRep;