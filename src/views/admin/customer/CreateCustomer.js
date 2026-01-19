import React, { useEffect, useState } from 'react';
import {
  Grid,
  MenuItem,
  Select,
  FormControl,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  DialogActions,
  Card,
  CardContent,
  IconButton,
  Divider,
  FormControlLabel
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { IconUpload, IconFileImport, IconPlus, IconTrash, IconEdit, IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';
import { set } from 'lodash';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

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
    orderApproval: 'Pending',
    comments: '',
    category: '',
    netTerms: '',
    shippingAddresses: [{
      shippingAddressOne: '',
      shippingAddressTwo: '',
      shippingAddressThree: '',
      shippingCity: '',
      shippingState: '',
      shippingZip: '',
      isDefault: true
    }],
    billingAddresses: [{
      billingAddressOne: '',
      billingAddressTwo: '',
      billingAddressThree: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
      isDefault: true
    }],
    isBillingSameAsShipping: false,
    password: '',
    inactive: null,
    markupDiscount: null,
    abn: '',
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [pricingGroups, setPricingGroups] = React.useState([]);
  const [customerId, setCustomerId] = useState('');
  const [brandList, setBrandList] = useState([]);
  const [checked, setChecked] = useState(false);
  const [netTermsList, setNetTermsList] = useState([]);

  // Add new shipping address
  const addShippingAddress = () => {
    setFormData({
      ...formData,
      shippingAddresses: [
        ...formData.shippingAddresses,
        {
          shippingAddressOne: '',
          shippingAddressTwo: '',
          shippingAddressThree: '',
          shippingCity: '',
          shippingState: '',
          shippingZip: '',
          isDefault: false
        }
      ]
    });
  };

  // Remove shipping address
  const removeShippingAddress = (index) => {
    if (formData.shippingAddresses.length > 1) {
      const updatedAddresses = formData.shippingAddresses.filter((_, i) => i !== index);

      // If we removed the default address, make the first one default
      if (formData.shippingAddresses[index].isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      setFormData({
        ...formData,
        shippingAddresses: updatedAddresses
      });
    }
  };

  // Update shipping address
  const updateShippingAddress = (index, field, value) => {
    const updatedAddresses = formData.shippingAddresses.map((address, i) => {
      if (i === index) {
        return { ...address, [field]: value };
      }
      return address;
    });

    setFormData({
      ...formData,
      shippingAddresses: updatedAddresses
    });
  };

  // Set default shipping address
  const setDefaultShippingAddress = (index) => {
    const updatedAddresses = formData.shippingAddresses.map((address, i) => ({
      ...address,
      isDefault: i === index
    }));

    setFormData({
      ...formData,
      shippingAddresses: updatedAddresses
    });
  };

  // Add new billing address
  const addBillingAddress = () => {
    setFormData({
      ...formData,
      billingAddresses: [
        ...formData.billingAddresses,
        {
          billingAddressOne: '',
          billingAddressTwo: '',
          billingAddressThree: '',
          billingCity: '',
          billingState: '',
          billingZip: '',
          isDefault: false
        }
      ]
    });
  };

  // Remove billing address
  const removeBillingAddress = (index) => {
    if (formData.billingAddresses.length > 1) {
      const updatedAddresses = formData.billingAddresses.filter((_, i) => i !== index);

      // If we removed the default address, make the first one default
      if (formData.billingAddresses[index].isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      setFormData({
        ...formData,
        billingAddresses: updatedAddresses
      });
    }
  };

  // Update billing address
  const updateBillingAddress = (index, field, value) => {
    const updatedAddresses = formData.billingAddresses.map((address, i) => {
      if (i === index) {
        return { ...address, [field]: value };
      }
      return address;
    });

    setFormData({
      ...formData,
      billingAddresses: updatedAddresses
    });
  };

  // Set default billing address
  const setDefaultBillingAddress = (index) => {
    const updatedAddresses = formData.billingAddresses.map((address, i) => ({
      ...address,
      isDefault: i === index
    }));

    setFormData({
      ...formData,
      billingAddresses: updatedAddresses
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData?.customerId.trim()) {
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

    if (!formData.netTerms) {
      setError('Please select a net terms');
      return;
    }

    // Validate at least one complete shipping address
    const hasValidShippingAddress = formData.shippingAddresses.some(addr =>
      addr.shippingAddressOne && addr.shippingCity && addr.shippingState && addr.shippingZip
    );
    if (!hasValidShippingAddress) {
      setError('Please provide at least one complete shipping address');
      return;
    }

    // Validate at least one complete billing address
    const hasValidBillingAddress = formData.billingAddresses.some(addr =>
      addr.billingAddressOne && addr.billingCity && addr.billingState
    );
    if (!hasValidBillingAddress) {
      setError('Please provide at least one complete billing address');
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

      // console.log("Create customer response:", res);

      if (res.data.statusCode === 200) {
        // Reset form on success
        setFormData({
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
          shippingAddresses: [{
            shippingAddressOne: '',
            shippingAddressTwo: '',
            shippingAddressThree: '',
            shippingCity: '',
            shippingState: '',
            shippingZip: '',
            isDefault: true
          }],
          billingAddresses: [{
            billingAddressOne: '',
            billingAddressTwo: '',
            billingAddressThree: '',
            billingCity: '',
            billingState: '',
            billingZip: '',
            isDefault: true
          }],
          isBillingSameAsShipping: false,
          password: '',
          inactive: false
        });

        navigate('/dashboard/customers/list');

      } else {
        // console.log("Create Customer error:", res.data.message);
        setError(res.data.message);
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
      formDataForUpload.append('users', selectedFile);

      const res = await axiosInstance.post('/admin/import-users', formDataForUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // console.log("CSV imported", res.data);

      if (res.data.statusCode === 200) {
        setCsvDialogOpen(false);
        setSelectedFile(null);
        setError('CSV imported successfully!');
        const fileInput = document.getElementById('csv-file-input');
        if (fileInput) fileInput.value = '';

        setTimeout(() => {
          navigate('/dashboard/customers/list');
        }, 2000);
      }
    } catch (error) {
      // setError(error.response?.data?.message || error.message || 'An error occurred while importing CSV');
      console.error('CSV import error:', error);
      setCsvDialogOpen(false);
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

  const fetchBrandsList = async () => {
    try {
      const response = await axiosInstance.get('/brand/get-brands-list');
      // console.log("response brands", response);

      if (response.data.statusCode === 200) {
        setBrandList(response.data.data);
      }

    } catch (error) {
      console.error('Error fetching brands list:', error);
      setError(error.message);
    }
  };

  const fetchLatestCustomerId = async () => {
    try {
      const response = await axiosInstance.get('/admin/get-latest-customer-id');

      if (response.data.statusCode === 200) {
        setCustomerId(response.data.data?.customerId);
      }

    } catch (error) {
      console.error('Error fetching latest customer id:', error);
      setError(error.message);
    }
  }

  function incrementCustomerId(customerId) {
    const prefix = customerId.match(/[A-Za-z]+/)[0];
    const numberPart = customerId.match(/\d+/)[0];

    const newNumber = (parseInt(numberPart, 10) + 1).toString().padStart(numberPart.length, '0');

    return prefix + newNumber;
  }

  useEffect(() => {
    if (customerId) {
      setFormData({
        ...formData,
        customerId: incrementCustomerId(customerId)
      })
    } else {
      setCustomerId('CUS00000');
    }
  }, [customerId])

  // Fetch product groups
  const fetchNetTermsData = async () => {
    try {
      const response = await axiosInstance.get('/net-terms-list/get-all-net-terms-simple');
      // console.log("response product groups", response);

      if (response.data.statusCode === 200) {
        setNetTermsList(response.data.data);
      } else {
        setNetTermsList([]);
      }
    } catch (error) {
      console.error('Error fetching product groups:', error);
      setNetTermsList([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchBrandsList(),
        fetchLatestCustomerId(),
        fetchNetTermsData()
      ]);
    };
    fetchData();
  }, []);

  const handleBillingSameAsShippingChange = (e) => {
    setChecked(e.target.checked);

    if (e.target.checked) {
      const transformedAddresses = formData.shippingAddresses.map(addr => ({
        billingAddressOne: addr.shippingAddressOne,
        billingAddressTwo: addr.shippingAddressTwo,
        billingAddressThree: addr.shippingAddressThree,
        billingCity: addr.shippingCity,
        billingState: addr.shippingState,
        billingZip: addr.shippingZip,
        isDefault: addr.isDefault
      }));

      setFormData({
        ...formData,
        isBillingSameAsShipping: true,
        billingAddresses: transformedAddresses
      });
    } else {
      // Reset to default empty billing address
      setFormData({
        ...formData,
        isBillingSameAsShipping: false,
        billingAddresses: [{
          billingAddressOne: '',
          billingAddressTwo: '',
          billingAddressThree: '',
          billingCity: '',
          billingState: '',
          billingZip: '',
          isDefault: true
        }]
      });
    }
  };






  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Create Customer',
    },
  ];

  return (
    <div>
      <Breadcrumb title="Create Customer" items={BCrumb} />
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
          // disabled
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



        {/* Order Approval and Category - Row 5 */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="orderApproval" sx={{ mt: 0 }}>
            Primary Brand
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              value={formData.primaryBrand}
              onChange={(e) => setFormData({ ...formData, primaryBrand: e.target.value })}
              disabled={loading}
              displayEmpty
            >
              <MenuItem value="">Select Primary Brand</MenuItem>
              {brandList.map((brand) => (
                <MenuItem key={brand.id} value={brand.name}>
                  {brand.name}
                </MenuItem>
              ))}

            </Select>
          </FormControl>
        </Grid>

        <Grid size={6}>
          <CustomFormLabel htmlFor="defaultShippingRate" sx={{ mt: 0 }}>
            ABN
          </CustomFormLabel>
          <CustomOutlinedInput
            id="defaultShippingRate"
            fullWidth
            type="text"
            value={formData.abn}
            onChange={(e) => setFormData({ ...formData, abn: parseFloat(e.target.value) || 0 })}
            disabled={loading}
            placeholder="Enter ABN"
          />
        </Grid>

        {/* <Grid size={6}>
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
        </Grid> */}


        <Grid size={6}>
          <CustomFormLabel htmlFor="defaultShippingRate" sx={{ mt: 0 }}>
            Default Shipping Rate
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="defaultShippingRate"
            fullWidth
            type="text"
            value={formData.defaultShippingRate}
            onChange={(e) => setFormData({ ...formData, defaultShippingRate: parseFloat(e.target.value) || 0 })}
            disabled={loading}
            placeholder="Enter Default Shipping Rate"
          />
        </Grid>

        <Grid size={6}>
          <CustomFormLabel htmlFor="category" sx={{ mt: 0 }}>
            Order Approval
          </CustomFormLabel>
          <CustomOutlinedInput
            id="category"
            fullWidth
            value={formData.orderApproval}
            onChange={(e) => setFormData({ ...formData, orderApproval: e.target.value })}
            disabled={loading}
            placeholder="Enter Category"
          />
        </Grid>

        {/* <Grid size={6}>
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
        </Grid> */}

        <Grid size={6}>
          <CustomFormLabel htmlFor="orderApproval" sx={{ mt: 0 }}>
            Select Net Terms
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              value={formData.netTerms}
              onChange={(e) => setFormData({ ...formData, netTerms: e.target.value })}
              disabled={loading}
              displayEmpty
            >
              <MenuItem value="">
                Select Net Terms
                <span style={{ color: 'red' }}>*</span>
              </MenuItem>
              {netTermsList.map((netTerm) => (
                <MenuItem key={netTerm._id} value={netTerm._id}>
                  {netTerm.netTermName}
                </MenuItem>
              ))}

            </Select>
          </FormControl>
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

        <Grid size={6}>
          <CustomFormLabel htmlFor="orderApproval" sx={{ mt: 0 }}>
            Customer Account Status
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              value={formData.inactive}
              onChange={(e) => setFormData({ ...formData, inactive: e.target.value })}
              disabled={loading}
              displayEmpty
            >
              <MenuItem value="">Select Customer Account Status</MenuItem>
              <MenuItem key='Approved' value={false}>
                Approved
              </MenuItem>
              <MenuItem key='Un-Approved' value={true}>
                Un Approved
              </MenuItem>
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

        {/* Shipping Addresses Section */}
        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
            <Typography variant="h6">
              Shipping Addresses
              <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Button
              variant="outlined"
              startIcon={<IconPlus size="1rem" />}
              onClick={addShippingAddress}
              disabled={loading}
              sx={{ borderColor: '#2E2F7F', color: '#2E2F7F' }}
            >
              Add New Address
            </Button>
          </Box>

          {formData.shippingAddresses.map((address, index) => (
            <Card key={index} sx={{ mb: 1.5, border: address.isDefault ? '2px solid #2E2F7F' : '1px solid #e0e0e0' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {address.isDefault ? 'Default Shipping Address' : `Shipping Address ${index + 1}`}
                  </Typography>
                  <Box>
                    {!address.isDefault && (
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<IconCheck size="0.7rem" />}
                        onClick={() => setDefaultShippingAddress(index)}
                        disabled={loading}
                        sx={{ color: '#2E2F7F', mr: 1, fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                      >
                        Default
                      </Button>
                    )}
                    {formData.shippingAddresses.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => removeShippingAddress(index)}
                        disabled={loading}
                        sx={{ color: 'red', p: 0.5 }}
                      >
                        <IconTrash size="0.9rem" />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <Grid container spacing={1.5}>
                  <Grid size={6}>
                    <CustomFormLabel sx={{ mb: 1.5, fontSize: '0.8rem' }}>Address Line 1 *</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      size="small"
                      value={address.shippingAddressOne}
                      onChange={(e) => updateShippingAddress(index, 'shippingAddressOne', e.target.value)}
                      disabled={loading}
                      placeholder="Enter Address Line 1"
                      sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <CustomFormLabel sx={{ mb: 1.5, fontSize: '0.8rem' }}>Address Line 2</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      size="small"
                      value={address.shippingAddressTwo}
                      onChange={(e) => updateShippingAddress(index, 'shippingAddressTwo', e.target.value)}
                      disabled={loading}
                      placeholder="Address Line 2"
                      sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <CustomFormLabel sx={{ mb: 0.5, fontSize: '0.8rem' }}>Address Line 3</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      size="small"
                      value={address.shippingAddressThree}
                      onChange={(e) => updateShippingAddress(index, 'shippingAddressThree', e.target.value)}
                      disabled={loading}
                      placeholder="Address Line 3"
                      sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <CustomFormLabel sx={{ mb: 0.5, fontSize: '0.8rem' }}>City *</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      size="small"
                      value={address.shippingCity}
                      onChange={(e) => updateShippingAddress(index, 'shippingCity', e.target.value)}
                      disabled={loading}
                      placeholder="City"
                      sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
                    />
                  </Grid>


                  {/* Order Approval and Category - Row 5 */}
                  <Grid size={6}>
                    <CustomFormLabel htmlFor="shippingState" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                      State *
                    </CustomFormLabel>
                    <FormControl fullWidth>
                      <Select
                        value={address.shippingState}
                        onChange={(e) => updateShippingAddress(index, 'shippingState', e.target.value)}
                        disabled={loading}
                        displayEmpty
                      >
                        <MenuItem value="">Select State</MenuItem>
                        <MenuItem value="New South Wales">New South Wales</MenuItem>
                        <MenuItem value="Victoria">Victoria</MenuItem>
                        <MenuItem value="Queensland">Queensland</MenuItem>
                        <MenuItem value="Western Australia">Western Australia</MenuItem>
                        <MenuItem value="South Australia">South Australia</MenuItem>
                        <MenuItem value="Tasmania">Tasmania</MenuItem>
                        <MenuItem value="Australian Capital Territory">Australian Capital Territory</MenuItem>
                        <MenuItem value="Northern Territory">Northern Territory</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>


                  <Grid size={6}>
                    <CustomFormLabel sx={{ mb: 0.5, fontSize: '0.8rem' }}>ZIP Code *</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      size="small"
                      value={address.shippingZip}
                      onChange={(e) => updateShippingAddress(index, 'shippingZip', e.target.value)}
                      disabled={loading}
                      placeholder="ZIP"
                      sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <CustomFormLabel sx={{ mb: 0.5, fontSize: '0.8rem' }}>Country *</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      size="small"
                      value='Australia'
                      disabled
                      placeholder="Country"
                      sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>


        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={(e) => handleBillingSameAsShippingChange(e)}
            />
          }
          label="Billing Addreess same as Shipping Address"
        />

        {/* Billing Addresses Section */}
        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
            <Typography variant="h6">
              Billing Addresses
              <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Button
              variant="outlined"
              startIcon={<IconPlus size="1rem" />}
              onClick={addBillingAddress}
              disabled={loading}
              sx={{ borderColor: '#2E2F7F', color: '#2E2F7F' }}
            >
              Add New Address
            </Button>
          </Box>

          {formData.billingAddresses.map((address, index) => (
            <Card key={index} sx={{ mb: 0.5, border: address.isDefault ? '2px solid #2E2F7F' : '1px solid #e0e0e0' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {address.isDefault ? 'Default Billing Address' : `Billing Address ${index + 1}`}
                  </Typography>
                  <Box>
                    {!address.isDefault && (
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<IconCheck size="0.7rem" />}
                        onClick={() => setDefaultBillingAddress(index)}
                        disabled={loading}
                        sx={{ color: '#2E2F7F', mr: 1, fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                      >
                        Default
                      </Button>
                    )}
                    {formData.billingAddresses.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => removeBillingAddress(index)}
                        disabled={loading}
                        sx={{ color: 'red', p: 0.5 }}
                      >
                        <IconTrash size="0.9rem" />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <Grid container spacing={1.5}>
                  <Grid size={6}>
                    <CustomFormLabel sx={{ mb: 0.5, fontSize: '0.8rem' }}>Address Line 1 *</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      size="small"
                      value={address.billingAddressOne}
                      onChange={(e) => updateBillingAddress(index, 'billingAddressOne', e.target.value)}
                      disabled={loading}
                      placeholder="Enter Address Line 1"
                      sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <CustomFormLabel sx={{ mb: 0.5, fontSize: '0.8rem' }}>Address Line 2</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      size="small"
                      value={address.billingAddressTwo}
                      onChange={(e) => updateBillingAddress(index, 'billingAddressTwo', e.target.value)}
                      disabled={loading}
                      placeholder="Address Line 2"
                      sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <CustomFormLabel sx={{ mb: 0.5, fontSize: '0.8rem' }}>Address Line 3</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      size="small"
                      value={address.billingAddressThree}
                      onChange={(e) => updateBillingAddress(index, 'billingAddressThree', e.target.value)}
                      disabled={loading}
                      placeholder="Address Line 3"
                      sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <CustomFormLabel sx={{ mb: 0.5, fontSize: '0.8rem' }}>City *</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      size="small"
                      value={address.billingCity}
                      onChange={(e) => updateBillingAddress(index, 'billingCity', e.target.value)}
                      disabled={loading}
                      placeholder="City"
                      sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
                    />
                  </Grid>


                  <Grid size={6}>
                    <CustomFormLabel htmlFor="billingState" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                      State *
                    </CustomFormLabel>
                    <FormControl fullWidth>
                      <Select
                        value={address.billingState}
                        onChange={(e) => updateBillingAddress(index, 'billingState', e.target.value)}
                        disabled={loading}
                        displayEmpty
                      >
                        <MenuItem value="">Select State</MenuItem>
                        <MenuItem value="New South Wales">New South Wales</MenuItem>
                        <MenuItem value="Victoria">Victoria</MenuItem>
                        <MenuItem value="Queensland">Queensland</MenuItem>
                        <MenuItem value="Western Australia">Western Australia</MenuItem>
                        <MenuItem value="South Australia">South Australia</MenuItem>
                        <MenuItem value="Tasmania">Tasmania</MenuItem>
                        <MenuItem value="Australian Capital Territory">Australian Capital Territory</MenuItem>
                        <MenuItem value="Northern Territory">Northern Territory</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={6}>
                    <CustomFormLabel sx={{ mb: 0.5, fontSize: '0.8rem' }}>ZIP Code</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      size="small"
                      value={address.billingZip}
                      onChange={(e) => updateBillingAddress(index, 'billingZip', e.target.value)}
                      disabled={loading}
                      placeholder="ZIP"
                      sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
                    />
                  </Grid>

                  <Grid size={6}>
                    <CustomFormLabel sx={{ mb: 0.5, fontSize: '0.8rem' }}>Country *</CustomFormLabel>
                    <CustomOutlinedInput
                      fullWidth
                      size="small"
                      value='Australia'
                      disabled
                      placeholder="Country"
                      sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Comments */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="comments" sx={{ mt: 0 }}>
            Comments
          </CustomFormLabel>
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
        {/* <Grid size={12} sx={{ mt: 2 }}>
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
        </Grid> */}

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
          Import Customers from CSV
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Select a CSV file to import multiple customers at once.
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