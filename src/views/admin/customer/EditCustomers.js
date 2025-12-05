import React, { useEffect, useState } from 'react';
import {
  Grid,
  MenuItem,
  Select,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  DialogActions,
  Card,
  CardContent,
  IconButton,
  Chip,
  Autocomplete,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { IconPlus, IconTrash, IconCheck, IconX, IconUserCheck, IconUserOff } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const EditCustomers = () => {
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
    password: '',
    inactive: false,
    markupDiscount: []
  });

  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [statusLoading, setStatusLoading] = React.useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [pricingGroupDiscounts, setPricingGroupDiscounts] = useState([]);
  const [pricingGroups, setPricingGroups] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [salesReps, setSalesReps] = useState([]);
  const [selectedSalesRep, setSelectedSalesRep] = useState('');
  const [currentSalesRep, setCurrentSalesRep] = useState(null);
  const [salesRepLoading, setSalesRepLoading] = useState(false);
  const [brandList, setBrandList] = useState([]);
  const [billingSameAsShipping, setBillingSameAsShipping] = React.useState(false);
  const [netTermsList, setNetTermsList] = useState([]);




  const handleBillingSameAsShippingChange = (e) => {
    const checked = e.target.checked;
    setBillingSameAsShipping(checked);

    if (checked) {
      // Copy shipping addresses to billing addresses
      const transformedAddresses = formData.shippingAddresses.map(addr => ({
        billingAddressOne: addr.shippingAddressOne,
        billingAddressTwo: addr.shippingAddressTwo,
        billingAddressThree: addr.shippingAddressThree,
        billingCity: addr.shippingCity,
        billingState: addr.shippingState,
        billingZip: addr.shippingZip,
        isDefault: addr.isDefault
      }));

      console.log("transformedAddresses", transformedAddresses);

      setFormData({
        ...formData,
        billingAddresses: transformedAddresses
      });
    } else {
      // Reset to existing billing addresses or default
      if (formData.billingAddresses.length > 0 && formData.billingAddresses[0].billingAddressOne) {
        // Keep existing billing addresses
        setFormData({
          ...formData,
          billingAddresses: formData.billingAddresses
        });
      } else {
        // Set to default empty billing address
        setFormData({
          ...formData,
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
    }
  };


  const fetchBrandsList = async () => {
    try {
      const response = await axiosInstance.get('/brand/get-brands-list');
      console.log("response brands", response);

      if (response.data.statusCode === 200) {
        setBrandList(response.data.data);
      }

    } catch (error) {
      console.error('Error fetching brands list:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchBrandsList()
  }, []);

  // Fetch all sales representatives
  const fetchSalesReps = async () => {
    try {
      setSalesRepLoading(true);
      const response = await axiosInstance.get('/sales-rep/get-sales-reps');
      if (response.data.statusCode === 200) {
        setSalesReps(response.data.data);

        // Find if this customer is assigned to any sales rep
        const customerSalesRep = response.data.data.find(rep =>
          rep.customers.includes(id)
        );

        if (customerSalesRep) {
          setCurrentSalesRep(customerSalesRep);
          setSelectedSalesRep(customerSalesRep._id);
        }
      }
    } catch (error) {
      console.error('Error fetching sales reps:', error);
      setError('Failed to load sales representatives');
    } finally {
      setSalesRepLoading(false);
    }
  };

  // Assign customer to sales rep
  const assignToSalesRep = async () => {
    if (!selectedSalesRep) {
      setError('Please select a sales representative');
      return;
    }

    try {
      setSalesRepLoading(true);
      const response = await axiosInstance.post(
        `/sales-rep/add-customer-to-sales-rep/${selectedSalesRep}/${id}`
      );

      if (response.data.statusCode === 200) {
        setError('Customer assigned to sales rep successfully');
        // Refresh sales reps data to get updated assignments
        await fetchSalesReps();
      }
    } catch (error) {
      console.error('Error assigning customer to sales rep:', error);
      setError(error.response?.data?.message || error.message || 'Failed to assign customer to sales rep');
    } finally {
      setSalesRepLoading(false);
    }
  };

  // Remove customer from sales rep
  const removeFromSalesRep = async () => {
    if (!currentSalesRep) return;

    try {
      setSalesRepLoading(true);
      const response = await axiosInstance.delete(
        `/sales-rep/remove-customer-from-sales-rep/${currentSalesRep._id}/${id}`
      );

      if (response.data.statusCode === 200) {
        setError('Customer removed from sales rep successfully');
        setCurrentSalesRep(null);
        setSelectedSalesRep('');
        // Refresh sales reps data
        await fetchSalesReps();
      }
    } catch (error) {
      console.error('Error removing customer from sales rep:', error);
      setError(error.response?.data?.message || error.message || 'Failed to remove customer from sales rep');
    } finally {
      setSalesRepLoading(false);
    }
  };

  // Toggle customer active/inactive status
  const toggleCustomerStatus = async () => {
    setStatusLoading(true);
    try {
      const newStatus = !formData.inactive;

      const res = await axiosInstance.put(`/admin/update-user-details/${id}`, {
        ...formData,
        inactive: newStatus
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.data.statusCode === 200) {
        setFormData(prev => ({
          ...prev,
          inactive: newStatus
        }));
      } else {
        setError('Failed to update customer status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update customer status');
    } finally {
      setStatusLoading(false);
    }
  };

  // Shipping Address Functions
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

  const removeShippingAddress = (index) => {
    if (formData.shippingAddresses.length > 1) {
      const updatedAddresses = formData.shippingAddresses.filter((_, i) => i !== index);

      if (formData.shippingAddresses[index].isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      setFormData({
        ...formData,
        shippingAddresses: updatedAddresses
      });
    }
  };

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

  // Billing Address Functions
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

  const removeBillingAddress = (index) => {
    if (formData.billingAddresses.length > 1) {
      const updatedAddresses = formData.billingAddresses.filter((_, i) => i !== index);

      if (formData.billingAddresses[index].isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      setFormData({
        ...formData,
        billingAddresses: updatedAddresses
      });
    }
  };

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
      // Prepare the data to send
      const dataToSend = {
        ...formData,
        markupDiscount: pricingGroupDiscounts.map(discount => ({
          pricingGroup: discount.pricingGroup,
          percentage: discount.percentage
        }))
      };

      console.log("Sending data:", dataToSend);

      const res = await axiosInstance.put(`/admin/update-user-details/${id}`, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("update customer response:", res);

      if (res.data.statusCode === 200) {
        navigate('/dashboard/customers/list');
      } else if (res.data.statusCode === 400) {
        console.log("Update Customer error:", res.data.message);
        setError(res.data.message);
      }

    } catch (error) {
      console.error('Update Customer error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update Customer');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomer = async () => {
    try {
      const res = await axiosInstance.get(`/admin/get-user/${id}`);

      console.log("res user", res)

      if (res.data.statusCode === 200) {
        const customerData = res.data.data;

        // Check if addresses exist in the response
        const shippingAddresses = customerData.shippingAddresses && customerData.shippingAddresses.length > 0
          ? customerData.shippingAddresses.map((addr, index) => ({
            ...addr,
            isDefault: index === 0 // Set first address as default
          }))
          : [{
            shippingAddressOne: '',
            shippingAddressTwo: '',
            shippingAddressThree: '',
            shippingCity: '',
            shippingState: '',
            shippingZip: '',
            isDefault: true
          }];

        const billingAddresses = customerData.billingAddresses && customerData.billingAddresses.length > 0
          ? customerData.billingAddresses.map((addr, index) => ({
            ...addr,
            isDefault: index === 0 // Set first address as default
          }))
          : [{
            billingAddressOne: '',
            billingAddressTwo: '',
            billingAddressThree: '',
            billingCity: '',
            billingState: '',
            billingZip: '',
            isDefault: true
          }];

        setFormData({
          ...customerData,
          shippingAddresses,
          billingAddresses
        });
        setCustomerId(customerData._id);
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
      console.error(error.message);
    }
  }

  const fetPricingGroupsByCustomerId = async () => {
    try {
      const res = await axiosInstance.get(`/pricing-groups-discount/get-pricing-group-discounts-by-customer-id/${customerId}`);

      console.log("pricing groups by Customer id ", res)

      if (res.data.statusCode === 200) {
        setPricingGroups(res.data.data);
        // Transform the data for the table
        const discounts = res.data.data.map(item => ({
          _id: item._id,
          pricingGroup: item.pricingGroup._id,
          pricingGroupName: item.pricingGroup.name,
          percentage: item.customers.find(c => c.user._id === customerId)?.percentage || ''
        }));
        setPricingGroupDiscounts(discounts);

        // Also set in formData
        setFormData(prev => ({
          ...prev,
          markupDiscount: discounts
        }));
      }
    } catch (error) {
      console.error('Error fetching pricing groups:', error);
    }
  }

  const handlePercentageChange = (index, newPercentage) => {
    const updatedDiscounts = [...pricingGroupDiscounts];
    updatedDiscounts[index].percentage = newPercentage;
    setPricingGroupDiscounts(updatedDiscounts);

    // Also update formData markupDiscount
    setFormData(prev => ({
      ...prev,
      markupDiscount: updatedDiscounts
    }));
  };

  const handleSalesRepChange = (event) => {
    const newSalesRepId = event.target.value;
    setSelectedSalesRep(newSalesRepId);

    // If the user selects a different sales rep than the current one, clear the current assignment
    if (currentSalesRep && currentSalesRep._id !== newSalesRepId) {
      setCurrentSalesRep(null);
    }
  };

  // Fetch product groups
  const fetchNetTermsData = async () => {
    try {
      const response = await axiosInstance.get('/net-terms-list/get-all-net-terms-simple');
      console.log("response product groups", response);

      if (response.data.statusCode === 200) {
        setNetTermsList(response.data.data);
        setFormData(prev => ({
          ...prev,
          netTerms: response.data.data
        }));
      } else {
        setNetTermsList([]);
      }
    } catch (error) {
      console.error('Error fetching product groups:', error);
      setNetTermsList([]);
    }
  };

  useEffect(() => {
    fetPricingGroupsByCustomerId();
  }, [customerId]);

  useEffect(() => {
    const fetch = async () => {
      await Promise.all([
        fetchCustomer(),
        fetchSalesReps(),
        fetchNetTermsData()
      ])
    }
    fetch();
  }, [id]);

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Edit Customer',
    },
  ];

  return (
    <div>

      {/* Status Header Section */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h5" fontWeight="bold">
                Edit Customer - {formData.customerName || 'Loading...'}
              </Typography>
              <Chip
                label={formData.inactive ? "UNAPPROVED" : "APPROVED"}
                color={formData.inactive ? "error" : "success"}
                variant="outlined"
                size="medium"
              />
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Customer ID: {formData.customerId}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant={formData.inactive ? "contained" : "outlined"}
              color={formData.inactive ? "success" : "error"}
              onClick={toggleCustomerStatus}
              disabled={statusLoading || loading}
              startIcon={formData.inactive ? <IconUserCheck size="1.1rem" /> : <IconUserOff size="1.1rem" />}
              sx={{
                minWidth: '140px',
                fontWeight: 'bold',
                ...(formData.inactive ? {
                  backgroundColor: '#2e7d32',
                  '&:hover': { backgroundColor: '#1b5e20' }
                } : {
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  '&:hover': {
                    backgroundColor: '#d32f2f',
                    color: 'white'
                  }
                })
              }}
            >
              {statusLoading ? 'Updating...' : (formData.inactive ? 'Approve Customer' : 'Unapprove Customer')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Sales Representative Assignment */}
      <Grid size={12}>
        <CustomFormLabel htmlFor="salesRep" sx={{ mt: 0 }}>
          Sales Representative
        </CustomFormLabel>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <FormControl fullWidth>
            <Select
              value={selectedSalesRep}
              onChange={handleSalesRepChange}
              disabled={salesRepLoading || loading}
              displayEmpty
            >
              <MenuItem value="">
                <em>Select Sales Representative</em>
              </MenuItem>
              {salesReps.map((rep) => (
                <MenuItem key={rep._id} value={rep._id}>
                  {rep.name} - {rep.email} ({rep.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {currentSalesRep ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: '200px' }}>
              <Chip
                label={`Currently assigned to: ${currentSalesRep.name}`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
              />
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={removeFromSalesRep}
                disabled={salesRepLoading}
                startIcon={<IconTrash size="1rem" />}
              >
                Remove
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={assignToSalesRep}
              disabled={!selectedSalesRep || salesRepLoading}
              sx={{ minWidth: '120px', backgroundColor: '#2E2F7F' }}
            >
              {salesRepLoading ? 'Assigning...' : 'Assign'}
            </Button>
          )}
        </Box>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Assign this customer to a sales representative for management
        </Typography>
      </Grid>

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
            disabled
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

        <Grid size={6}>
          <CustomFormLabel htmlFor="CustomerPhoneNo" sx={{ mt: 0 }}>
            Contact Phone Number
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="CustomerPhoneNo"
            fullWidth
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            disabled={loading}
            placeholder="Enter Customer Phone Number"
          />
        </Grid>

        {/* Primary Brand and Default Shipping Rate - Row 4 */}
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

        {/* Order Approval and Category - Row 5 */}
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

        {/* Net Terms and Password */}
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
              <MenuItem value="">Select Net Terms</MenuItem>
              {netTermsList.map((netTerm) => (
                <MenuItem key={netTerm._id} value={netTerm._id}>
                  {netTerm.netTermName}
                </MenuItem>
              ))}

            </Select>
          </FormControl>
        </Grid>


        {/* <Grid size={6}>
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
        </Grid> */}

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
                  <Grid size={6}>
                    <CustomFormLabel htmlFor={`billingState-${index}`} sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                      State *
                    </CustomFormLabel>
                    <FormControl fullWidth size="small">
                      <Select
                        id={`shippingState-${index}`}
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
                      value="Australia"
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
              checked={billingSameAsShipping}
              onChange={handleBillingSameAsShippingChange}
              disabled={loading}
            />
          }
          label="Billing Address same as Shipping Address"
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
              disabled={loading || billingSameAsShipping}
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
                        disabled={loading || billingSameAsShipping}
                        sx={{ color: '#2E2F7F', mr: 1, fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                      >
                        Default
                      </Button>
                    )}
                    {formData.billingAddresses.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => removeBillingAddress(index)}
                        disabled={loading || billingSameAsShipping}
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
                      disabled={loading || billingSameAsShipping}
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
                      disabled={loading || billingSameAsShipping}
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
                      disabled={loading || billingSameAsShipping}
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
                      disabled={loading || billingSameAsShipping}
                      placeholder="City"
                      sx={{ '& .MuiOutlinedInput-input': { py: 1 } }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <CustomFormLabel htmlFor={`shippingState-${index}`} sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                      State *
                    </CustomFormLabel>
                    <FormControl fullWidth size="small">
                      <Select
                        id={`billingState-${index}`}
                        value={address.billingState}
                        onChange={(e) => updateBillingAddress(index, 'billingState', e.target.value)}
                        disabled={loading || billingSameAsShipping}
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
                      value="Australia"
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

        {/* Markup discounts Discounts */}
        <Grid size={12}>
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Markup / Discount
          </Typography>

          {pricingGroupDiscounts.length > 0 ? (
            <Box sx={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd', fontWeight: 'bold' }}>
                      Pricing Group Name
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd', fontWeight: 'bold' }}>
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pricingGroupDiscounts.map((discount, index) => (
                    <tr key={discount._id}>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        {discount.pricingGroupName}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        <CustomOutlinedInput
                          fullWidth
                          value={discount.percentage}
                          onChange={(e) => handlePercentageChange(index, e.target.value)}
                          disabled={loading}
                          placeholder="Enter percentage (e.g., +10 or -5)"
                          sx={{ maxWidth: '200px' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              No pricing group discounts found for this customer.
            </Typography>
          )}
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
            {loading ? 'Updating...' : 'Update Customer'}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default EditCustomers;