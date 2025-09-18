import React, { useEffect, useState } from 'react';
import { Grid, MenuItem, Select, FormControl, Checkbox, Dialog, DialogTitle, DialogContent, Typography, Box, DialogActions } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
// import { IconBuildingArch, IconMail, IconMessage2, IconPhone, IconUser } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { IconUpload, IconFileImport } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';

const CreateCustomer = () => {
  const [formData, setFormData] = React.useState({
    customerId: '',
    customerName: '',
    contactName: '',
    contactEmail: '',
    customerEmail: '',
    CustomerPhoneNo: '',
    contactPhone: null,
    primaryBrand: '',
    defaultShippingRate: 0,
    orderApproval: '',
    comments: '',
    category: '',
    netTerms: '',
    shippingAddressOne: '',
    shippingAddressTwo: '',
    shippingAddressThree: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    billingAddressOne: '',
    billingAddressTwo: '',
    billingAddressThree: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    password: '',
    inactive: false
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);

  const handleSubmit = async () => {
    // Validation
    if (!formData.customerId.trim()) {
      setError('Please enter a customer ID');
      return;
    }
    if (!formData.customerName) {
      setError('Please enter a customer name');
      return;
    }
    if (!formData.contactEmail) {
      setError('Please enter a contact email');
      return;
    }
    if (!formData.CustomerPhoneNo) {
      setError('Please enter a customer phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post('/admin/create-single-user', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Create customer response:", res);

      if (res.data.statusCode === 200) {
        // Reset form on success
        setFormData({
          customerId: '',
          customerName: '',
          contactName: '',
          contactEmail: '',
          customerEmail: '',
          CustomerPhoneNo: '',
          contactPhone: [],
          primaryBrand: '',
          defaultShippingRate: 0,
          orderApproval: '',
          comments: '',
          category: '',
          netTerms: '',
          shippingAddressOne: '',
          shippingAddressTwo: '',
          shippingAddressThree: '',
          shippingCity: '',
          shippingState: '',
          shippingZip: '',
          billingAddressOne: '',
          billingAddressTwo: '',
          billingAddressThree: '',
          billingCity: '',
          billingState: '',
          billingZip: '',
          password: '',
          inactive: false
        });

        navigate('/dashboard/customers/list');

      } else if (res.data.statusCode === 400) {
        console.log("Create Customer error:", res.data.message);
      }

    } catch (error) {
      console.error('Create Customer error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create Customer');
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
      // Correct field name for customers
      formDataForUpload.append('users', selectedFile);

      // Correct API endpoint for customers import
      const res = await axiosInstance.post('/admin/import-users', formDataForUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("CSV imported", res.data);

      if (res.data.statusCode === 200) {
        setCsvDialogOpen(false);
        setSelectedFile(null);
        setError('CSV imported successfully!');
        // Reset file input
        const fileInput = document.getElementById('csv-file-input');
        if (fileInput) fileInput.value = '';

        setTimeout(() => {
          navigate('/dashboard/customers/list');
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
    // Reset file input
    const fileInput = document.getElementById('csv-file-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div>
      <Grid container spacing={2}>

        {/* Customer ID and Customer Name - Row 1 */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="customerId" sx={{ mt: 2 }}>
            Customer ID
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="customerId"
            fullWidth
            type="text"
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            placeholder="Enter Customer ID"
            disabled={loading}
          />
        </Grid>
        <Grid size={6}>
          <CustomFormLabel htmlFor="customerName" sx={{ mt: 2 }}>
            Customer Name
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="customerName"
            fullWidth
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            disabled={loading}
            placeholder="Enter Customer Name"
          />
        </Grid>

        {/* Contact Name and Contact Email - Row 2 */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="contactName" sx={{ mt: 0 }}>
            Contact Name
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="contactName"
            fullWidth
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            disabled={loading}
            placeholder="Enter Contact Name"
          />
        </Grid>
        <Grid size={6}>
          <CustomFormLabel htmlFor="contactEmail" sx={{ mt: 0 }}>
            Contact Email
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="contactEmail"
            fullWidth
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            disabled={loading}
            placeholder="Enter Contact Email"
          />
        </Grid>

        {/* Customer Email and Customer Phone Number - Row 3 */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="customerEmail" sx={{ mt: 0 }}>
            Customer Email
          </CustomFormLabel>
          <CustomOutlinedInput
            id="customerEmail"
            fullWidth
            type="email"
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            disabled={loading}
            placeholder="Enter Customer Email"
          />
        </Grid>
        <Grid size={6}>
          <CustomFormLabel htmlFor="CustomerPhoneNo" sx={{ mt: 0 }}>
            Customer Phone Number
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="CustomerPhoneNo"
            fullWidth
            type="tel"
            value={formData.CustomerPhoneNo}
            onChange={(e) => setFormData({ ...formData, CustomerPhoneNo: e.target.value })}
            disabled={loading}
            placeholder="Enter Customer Phone Number"
          />
        </Grid>

        {/* Primary Brand and Default Shipping Rate - Row 4 */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="primaryBrand" sx={{ mt: 0 }}>
            Primary Brand
          </CustomFormLabel>
          <CustomOutlinedInput
            id="primaryBrand"
            fullWidth
            value={formData.primaryBrand}
            onChange={(e) => setFormData({ ...formData, primaryBrand: e.target.value })}
            disabled={loading}
            placeholder="Enter Primary Brand"
          />
        </Grid>
        <Grid size={6}>
          <CustomFormLabel htmlFor="defaultShippingRate" sx={{ mt: 0 }}>
            Default Shipping Rate
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="defaultShippingRate"
            fullWidth
            type="number"
            value={formData.defaultShippingRate}
            onChange={(e) => setFormData({ ...formData, defaultShippingRate: parseFloat(e.target.value) || 0 })}
            disabled={loading}
            placeholder="Enter Default Shipping Rate"
          />
        </Grid>

        {/* Order Approval and Category - Row 5 */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="orderApproval" sx={{ mt: 0 }}>
            Order Approval
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              value={formData.orderApproval}
              onChange={(e) => setFormData({ ...formData, orderApproval: e.target.value })}
              disabled={loading}
              displayEmpty
            >
              <MenuItem value="">Select Order Approval Type</MenuItem>
              <MenuItem value="required">Required</MenuItem>
              <MenuItem value="not_required">Not Required</MenuItem>
              <MenuItem value="auto">Auto Approve</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={6}>
          <CustomFormLabel htmlFor="category" sx={{ mt: 0 }}>
            Category
          </CustomFormLabel>
          <CustomOutlinedInput
            id="category"
            fullWidth
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={loading}
            placeholder="Enter Category"
          />
        </Grid>

        {/* Net Terms - Single field in row 6 */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="netTerms" sx={{ mt: 0 }}>
            Net Terms
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="netTerms"
            fullWidth
            value={formData.netTerms}
            onChange={(e) => setFormData({ ...formData, netTerms: e.target.value })}
            disabled={loading}
            placeholder="Enter Net Terms (e.g., Net 30)"
          />
        </Grid>

        {/* Shipping Address Section */}
        <Grid size={12}>
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Shipping Address
            <span style={{ color: 'red' }}>*</span>
          </Typography>
        </Grid>

        {/* Shipping Address Line 1 */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="shippingAddressOne" sx={{ mt: 0 }}>
            Shipping Address Line 1
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="shippingAddressOne"
            fullWidth
            value={formData.shippingAddressOne}
            onChange={(e) => setFormData({ ...formData, shippingAddressOne: e.target.value })}
            disabled={loading}
            placeholder="Enter Shipping Address Line 1"
          />
        </Grid>

        {/* Shipping Address Line 2 */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="shippingAddressTwo" sx={{ mt: 0 }}>
            Shipping Address Line 2
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="shippingAddressTwo"
            fullWidth
            value={formData.shippingAddressTwo}
            onChange={(e) => setFormData({ ...formData, shippingAddressTwo: e.target.value })}
            disabled={loading}
            placeholder="Enter Shipping Address Line 2 (Optional)"
          />
        </Grid>

        {/* Shipping Address Line 3 */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="shippingAddressThree" sx={{ mt: 0 }}>
            Shipping Address Line 3
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="shippingAddressThree"
            fullWidth
            value={formData.shippingAddressThree}
            onChange={(e) => setFormData({ ...formData, shippingAddressThree: e.target.value })}
            disabled={loading}
            placeholder="Enter Shipping Address Line 3 (Optional)"
          />
        </Grid>

        {/* Shipping City */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="shippingCity" sx={{ mt: 0 }}>
            Shipping City
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
        </Grid>
        <Grid size={6}>
          <CustomFormLabel htmlFor="shippingState" sx={{ mt: 0 }}>
            Shipping State
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
        </Grid>
        <Grid size={6}>
          <CustomOutlinedInput
            id="shippingCity"
            fullWidth
            value={formData.shippingCity}
            onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
            disabled={loading}
            placeholder="Enter Shipping City"
          />
        </Grid>
        <Grid size={6}>
          <CustomOutlinedInput
            id="shippingState"
            fullWidth
            value={formData.shippingState}
            onChange={(e) => setFormData({ ...formData, shippingState: e.target.value })}
            disabled={loading}
            placeholder="Enter Shipping State"
          />
        </Grid>

        {/* Shipping Zip */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="shippingZip" sx={{ mt: 0 }}>
            Shipping ZIP Code
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="shippingZip"
            fullWidth
            value={formData.shippingZip}
            onChange={(e) => setFormData({ ...formData, shippingZip: e.target.value })}
            disabled={loading}
            placeholder="Enter Shipping ZIP Code"
          />
        </Grid>

        {/* Billing Address Section */}
        <Grid size={12}>
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Billing Address
          </Typography>
        </Grid>

        {/* Billing Address Line 1 */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="billingAddressOne" sx={{ mt: 0 }}>
            Billing Address Line 1
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="billingAddressOne"
            fullWidth
            value={formData.billingAddressOne}
            onChange={(e) => setFormData({ ...formData, billingAddressOne: e.target.value })}
            disabled={loading}
            placeholder="Enter Billing Address Line 1"
          />
        </Grid>

        {/* Billing Address Line 2 */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="billingAddressTwo" sx={{ mt: 0 }}>
            Billing Address Line 2
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="billingAddressTwo"
            fullWidth
            value={formData.billingAddressTwo}
            onChange={(e) => setFormData({ ...formData, billingAddressTwo: e.target.value })}
            disabled={loading}
            placeholder="Enter Billing Address Line 2 (Optional)"
          />
        </Grid>

        {/* Billing Address Line 3 */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="billingAddressThree" sx={{ mt: 0 }}>
            Billing Address Line 3
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="billingAddressThree"
            fullWidth
            value={formData.billingAddressThree}
            onChange={(e) => setFormData({ ...formData, billingAddressThree: e.target.value })}
            disabled={loading}
            placeholder="Enter Billing Address Line 3 (Optional)"
          />
        </Grid>

        {/* Billing City */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="billingCity" sx={{ mt: 0 }}>
            Billing City
          </CustomFormLabel>
        </Grid>
        <Grid size={6}>
          <CustomFormLabel htmlFor="billingState" sx={{ mt: 0 }}>
            Billing State
          </CustomFormLabel>
        </Grid>
        <Grid size={6}>
          <CustomOutlinedInput
            id="billingCity"
            fullWidth
            value={formData.billingCity}
            onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
            disabled={loading}
            placeholder="Enter Billing City"
          />
        </Grid>
        <Grid size={6}>
          <CustomOutlinedInput
            id="billingState"
            fullWidth
            value={formData.billingState}
            onChange={(e) => setFormData({ ...formData, billingState: e.target.value })}
            disabled={loading}
            placeholder="Enter Billing State"
          />
        </Grid>

        {/* Billing Zip and Password - Two fields in one row */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="billingZip" sx={{ mt: 0 }}>
            Billing ZIP Code
          </CustomFormLabel>
          <CustomOutlinedInput
            id="billingZip"
            fullWidth
            value={formData.billingZip}
            onChange={(e) => setFormData({ ...formData, billingZip: e.target.value })}
            disabled={loading}
            placeholder="Enter Billing ZIP Code"
          />
        </Grid>
        <Grid size={6}>
          <CustomFormLabel htmlFor="password" sx={{ mt: 0 }}>
            Password
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="password"
            fullWidth
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
            placeholder="Enter Password"
          />
        </Grid>
        {/* Comments */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="comments" sx={{ mt: 0 }}>
            Comments
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="comments"
            fullWidth
            multiline
            rows={4}
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            disabled={loading}
            placeholder="Enter Comments (Optional)"
          />
        </Grid>

        {/* Inactive Checkbox */}
        <Grid size={12} sx={{ mt: 2 }}>
          <FormControl>
            <Box display="flex" alignItems="center">
              <Checkbox
                checked={formData.inactive}
                onChange={(e) => setFormData({ ...formData, inactive: e.target.checked })}
                disabled={loading}
              />
              <Typography>Mark as Inactive</Typography>
            </Box>
          </FormControl>
        </Grid>

        {/* Error Message */}
        {error && (
          <Grid size={12} mt={2}>
            <div
              style={{
                color: error.includes('success') ? 'green' : 'red',
                padding: '10px',
                backgroundColor: error.includes('success') ? '#e8f5e8' : '#ffebee',
                borderRadius: '4px',
                border: error.includes('success') ? '1px solid #c8e6c9' : '1px solid #ffcdd2'
              }}
            >
              {error}
            </div>
          </Grid>
        )}

        {/* Submit Button */}
        <Grid size={12} mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ minWidth: '120px', backgroundColor: '#2E2F7F' }}
          >
            {loading ? 'Creating...' : 'Create Customer'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setCsvDialogOpen(true)}
            sx={{ ml: 2 }}
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
        {/* Loading Backdrop */}
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
          Import Commerce Categories from CSV
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Select a CSV file to import multiple badges at once.
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

export default CreateCustomer;