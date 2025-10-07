import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl, Dialog, DialogTitle, DialogContent, Typography, Box, DialogActions, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconFileImport, IconUpload, } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Autocomplete } from '@mui/material'
import { CircularProgress, Backdrop } from '@mui/material';
import { set } from 'lodash';
import { Card, CardContent, Radio } from "@mui/material";


const CreateSalesOrders = () => {
  const [formData, setFormData] = React.useState({
    date: '',
    documentNumber: '',
    customerName: '',
    salesChannel: '',
    trackingNumber: '',
    shippingAddress: {},
    billingAddress: {},
    customerPO: '',
    itemSku: '',
    packQuantity: 1,
    unitsQuantity: 1,
    finalAmount: null,
    amount: 0
  });



  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [productsList, setProductsList] = React.useState([]);
  const [packTypes, setPackTypes] = React.useState([]);
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [customers, setCustomers] = React.useState([]);
  const [billingAddress, setBillingAddress] = React.useState('');
  const [shippingAddress, setShippingAddress] = React.useState('');
  const [selectedShippingAddress, setSelectedShippingAddress] = React.useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = React.useState(null);
  const [selectedProduct, setSelectedProduct] = React.useState(null);

  useEffect(() => {
    console.log("selectedProduct", selectedProduct);
    const totalItems = formData?.packQuantity * formData.unitsQuantity;
    let totalAmount = selectedProduct?.eachPrice * totalItems;
    console.log("before tax totalAmount", totalAmount);
    totalAmount = totalAmount - (totalAmount * selectedProduct?.taxPercentages) / 100;
    console.log("after tax totalAmount", totalAmount);

    setFormData(prev => ({
      ...prev,
      amount: totalAmount
    }))
  }, [formData.packQuantity, formData.unitsQuantity, selectedProduct]);


  const handleSubmit = async () => {
    // Validation
    if (!formData.customerName.trim()) {
      setError('Customer name is required');
      return;
    }

    if (!formData.salesChannel.trim()) {
      setError('Sales channel is required');
      return;
    }

    if (!formData.itemSku.trim()) {
      setError('Item SKU is required');
      return;
    }

    if (!formData.packQuantity || formData.packQuantity <= 0) {
      setError('Pack quantity is required');
      return;
    }

    if (!formData.amount) {
      setError('Amount is required');
      return;
    }


    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post('/sales-order/create-sales-order', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Create sales order response:", res);

      if (res.data.statusCode === 200) {
        // Reset form on success
        setFormData({
          date: '',
          documentNumber: '',
          customerName: '',
          salesChannel: '',
          trackingNumber: '',
          shippingAddress: '',
          billingAddress: '',
          customerPO: '',
          itemSku: '',
          packQuantity: 0,
          unitsQuantity: 0,
          finalAmount: 0,
          amount: 0
        });
        navigate('/dashboard/sales-orders/list');

      } else if (res.data.statusCode === 400) {
        console.log("Create sales order error:", res.data.message);
        setError(res.data.message);
      }


    } catch (error) {
      console.error('Create sales order error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create sales order');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const response = await axiosInstance.get('/products/get-all-products-dashboard');
      console.log("response products", response.data);

      if (response.data.statusCode === 200) {
        const productsData = response.data.data?.docs || response.data.data || response.data;

        // Filter out duplicates based on _id
        const getUniqueProducts = (products) => {
          if (!Array.isArray(products)) return [];

          const uniqueProducts = [];
          const seenIds = new Set();

          products.forEach(product => {
            if (product._id && !seenIds.has(product._id)) {
              seenIds.add(product._id);
              uniqueProducts.push(product);
            }
          });

          return uniqueProducts;
        };

        setProductsList(getUniqueProducts(productsData));
      }

    } catch (error) {
      console.error('Error fetching products list:', error);
      setError(error.message);
    }
  };

  const fetchProductsAvailablePackTypes = async () => {
    try {
      const response = await axiosInstance.get(`/products/get-products-pack-types/${formData.itemSku}`);
      console.log("response products pack types", response);

      if (response.status === 200) {
        setPackTypes(response.data.data);
      }

    } catch (error) {
      console.error('Error fetching products pack types:', error);
      setError(error.message);
    }
  };

  const fetchCustomersList = async () => {
    try {
      const response = await axiosInstance.get('/admin/get-all-users'); // or whatever your customer endpoint is
      console.log("response customers", response.data);

      if (response.data.statusCode === 200) {
        const customersData = response.data.data?.docs || response.data.data || response.data;

        // Filter out duplicates based on _id
        const getUniqueCustomers = (customers) => {
          if (!Array.isArray(customers)) return [];

          const uniqueCustomers = [];
          const seenIds = new Set();

          customers.forEach(customer => {
            if (customer._id && !seenIds.has(customer._id)) {
              seenIds.add(customer._id);
              uniqueCustomers.push(customer);
            }
          });

          return uniqueCustomers;
        };

        setCustomers(getUniqueCustomers(customersData));
      }

    } catch (error) {
      console.error('Error fetching customers list:', error);
      setError(error.message);
    }
  };

  const fetchCustomerAddresses = async () => {
    try {
      const response = await axiosInstance.get(`/admin/customer-addresses/${formData.customerName}`);
      console.log("response customer addresses", response.data);

      if (response.data.statusCode === 200) {
        if (response.data.data.billingAddresses.length > 0) {
          setBillingAddress(response.data.data.billingAddresses);
        }

        if (response.data.data.shippingAddresses) {
          setShippingAddress(response.data.data.shippingAddresses);
        }
      }

    } catch (error) {
      console.error('Error fetching customer addresses:', error);
      // setError(error.message);
    }
  }

  useEffect(() => {
    fetchCustomerAddresses();
  }, [formData.customerName]);

  React.useEffect(() => {
    fetchCustomersList();
  }, []);

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
      // Correct field name for sales orders
      formDataForUpload.append('salesOrders', selectedFile);

      // Correct API endpoint for sales orders import
      const res = await axiosInstance.post('/sales-order/import-sales-orders', formDataForUpload, {
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
          navigate('/dashboard/sales-orders/list');
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




  useEffect(() => {
    if (formData.itemSku) {
      fetchProductsAvailablePackTypes();
    }
  }, [formData.itemSku]);

  React.useEffect(() => {
    fetchProductsList();
  }, [])


  return (
    <div>
      <Grid container spacing={2}>
        {/* Date - Full Width */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="date" sx={{ mt: 0 }}>
            Date
          </CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={formData.date ? new Date(formData.date) : null}
              onChange={(newValue) => {
                setFormData({ ...formData, date: newValue });
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: "Select date",
                  id: "date"
                }
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Document Number and Customer Name - Two per row */}
        {/* <Grid size={6}>
          <CustomFormLabel htmlFor="document-number" sx={{ mt: 2 }}>
            Document Number
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="document-number"
            fullWidth
            value={formData.documentNumber}
            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
            placeholder="Enter document number"
          />
        </Grid> */}

        <Grid size={6}>
          <CustomFormLabel htmlFor="item-sku" sx={{ mt: 2 }}>
            Select Customer Name
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              id="item-sku-autocomplete"
              options={customers}
              getOptionLabel={(customer) =>
                customer ? ` ${customer.customerName}` : ""
              }
              value={
                customers.find((c) => c.customerName === formData.customerName) || null
              }
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  customerName: newValue ? newValue.customerName : "",
                });

              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    productsList.length === 0
                      ? "Loading Customers..."
                      : "Search or select a Customer"
                  }
                  size="small"
                />
              )}
            />
          </FormControl>
        </Grid>

        <Grid size={6}>
          <CustomFormLabel htmlFor="doc-no" sx={{ mt: 2 }}>
            Document Number
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="doc-no"
            fullWidth
            value={formData.documentNumber}
            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
            placeholder="Enter Document Number"
          />
        </Grid>

        {/* Sales Channel and Tracking Number - Two per row */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="sales-channel" sx={{ mt: 2 }}>
            Sales Channel
          </CustomFormLabel>
          <CustomOutlinedInput
            id="sales-channel"
            fullWidth
            value={formData.salesChannel}
            onChange={(e) => setFormData({ ...formData, salesChannel: e.target.value })}
            placeholder="Enter sales channel"
          />
        </Grid>
        <Grid size={6}>
          <CustomFormLabel htmlFor="tracking-number" sx={{ mt: 2 }}>
            Tracking Number
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="tracking-number"
            fullWidth
            value={formData.trackingNumber}
            onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
            placeholder="Enter tracking number"
          />
        </Grid>

        {/* Shipping Address - Full Width
        <Grid size={12}>
          <CustomFormLabel htmlFor="shipping-address" sx={{ mt: 2 }}>
            Shipping Address
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="shipping-address"
            fullWidth
            value={formData.shippingAddress}
            onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
            placeholder="Enter shipping address"
          />
        </Grid>

        {/* Billing Address - Full Width */}
        {/* <Grid size={12}>
          <CustomFormLabel htmlFor="billing-address" sx={{ mt: 2 }}>
            Billing Address
          </CustomFormLabel>
          <CustomOutlinedInput
            id="billing-address"
            fullWidth
            value={formData.billingAddress}
            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
            placeholder="Enter billing address"
          />
        </Grid> */ }

        {/* Shipping Address Selection */}
        <Grid item xs={12} size={12}>
          {shippingAddress.length > 0 && <CustomFormLabel>Choose Shipping Address</CustomFormLabel>}
          {shippingAddress.length > 0 && <Grid container spacing={2}>
            {shippingAddress?.map((addr, index) => {
              return (
                <Grid item xs={6} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      border: selectedShippingAddress === index ? "2px solid #2E2F7F" : "1px solid #ccc",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      setSelectedShippingAddress(index);
                      setFormData({
                        ...formData,
                        shippingAddress: {
                          shippingAddressOne: addr.shippingAddressOne,
                          shippingAddressTwo: addr.shippingAddressTwo || '',
                          shippingAddressThree: addr.shippingAddressThree || '',
                          shippingCity: addr.shippingCity,
                          shippingState: addr.shippingState,
                          shippingZip: addr.shippingZip
                        }
                      });
                    }}
                  >
                    <CardContent>
                      <Radio
                        checked={selectedShippingAddress === index}
                        onChange={() => {
                          setSelectedShippingAddress(index);
                          setFormData({
                            ...formData,
                            shippingAddress: {
                              shippingAddressOne: addr.shippingAddressOne,
                              shippingAddressTwo: addr.shippingAddressTwo || '',
                              shippingAddressThree: addr.shippingAddressThree || '',
                              shippingCity: addr.shippingCity,
                              shippingState: addr.shippingState,
                              shippingZip: addr.shippingZip
                            }
                          });
                        }}
                      />
                      <Typography variant="subtitle1" fontWeight="bold">{addr.shippingAddressOne}</Typography>
                      {addr.shippingAddressTwo && (
                        <Typography variant="body2">{addr.shippingAddressTwo}</Typography>
                      )}
                      {addr.shippingAddressThree && (
                        <Typography variant="body2">{addr.shippingAddressThree}</Typography>
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {addr.shippingCity}, {addr.shippingState} {addr.shippingZip}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>}
        </Grid>

        {/* Billing Address Selection */}
        <Grid item xs={12} size={12} sx={{ mt: 2 }}>
          {billingAddress.length > 0 && <CustomFormLabel>Choose Billing Address</CustomFormLabel>}
          {billingAddress.length > 0 && <Grid container spacing={2}>
            {billingAddress?.map((addr, index) => {
              return (
                <Grid item xs={6} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      border: selectedBillingAddress === index ? "2px solid #2E2F7F" : "1px solid #ccc",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      setSelectedBillingAddress(index);
                      setFormData({
                        ...formData,
                        billingAddress: {
                          billingAddressOne: addr.billingAddressOne,
                          billingAddressTwo: addr.billingAddressTwo || '',
                          billingAddressThree: addr.billingAddressThree || '',
                          billingCity: addr.billingCity,
                          billingState: addr.billingState,
                          billingZip: addr.billingZip
                        }
                      });
                    }}
                  >
                    <CardContent>
                      <Radio
                        checked={selectedBillingAddress === index}
                        onChange={() => {
                          setSelectedBillingAddress(index);
                          setFormData({
                            ...formData,
                            billingAddress: {
                              billingAddressOne: addr.billingAddressOne,
                              billingAddressTwo: addr.billingAddressTwo || '',
                              billingAddressThree: addr.billingAddressThree || '',
                              billingCity: addr.billingCity,
                              billingState: addr.billingState,
                              billingZip: addr.billingZip
                            }
                          });
                        }}
                      />
                      <Typography variant="subtitle1" fontWeight="bold">{addr.billingAddressOne}</Typography>
                      {addr.billingAddressTwo && (
                        <Typography variant="body2">{addr.billingAddressTwo}</Typography>
                      )}
                      {addr.billingAddressThree && (
                        <Typography variant="body2">{addr.billingAddressThree}</Typography>
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {addr.billingCity}, {addr.billingState} {addr.billingZip}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>}
        </Grid>


        {/* Customer PO and Item SKU - Two per row */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="customer-po" sx={{ mt: 2 }}>
            Customer PO
          </CustomFormLabel>
          <CustomOutlinedInput
            id="customer-po"
            fullWidth
            value={formData.customerPO}
            onChange={(e) => setFormData({ ...formData, customerPO: e.target.value })}
            placeholder="Enter customer PO"
          />
        </Grid>
        <Grid size={6}>
          <CustomFormLabel htmlFor="item-sku" sx={{ mt: 2 }}>
            Item SKU
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              id="item-sku-autocomplete"
              options={productsList}
              getOptionLabel={(product) =>
                product ? `${product.ProductName} (SKU: ${product.sku})` : ""
              }
              value={
                productsList.find((p) => p.sku === formData.itemSku) || null
              }
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  itemSku: newValue ? newValue.sku : "",
                });
                setSelectedProduct(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    productsList.length === 0
                      ? "Loading products..."
                      : "Search or select a product"
                  }
                  size="small"
                />
              )}
            />
          </FormControl>
        </Grid>

        {/* Pack Quantity and Units Quantity - Two per row */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="pack-quantity" sx={{ mt: 2 }}>
            Pack Quantity
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Select
              id="item-sku-select"
              value={formData.packQuantity}
              onChange={(e) => setFormData({ ...formData, packQuantity: e.target.value })}
              disabled={loading || productsList.length === 0}
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
              <MenuItem value="" disabled>
                {packTypes.length === 0 ? 'Loading products...' : 'Select a product'}
              </MenuItem>
              {packTypes.map((packType) => (
                <MenuItem key={packType._id} value={packType.quantity}>
                  {packType.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={6}>
          <CustomFormLabel htmlFor="units-quantity" sx={{ mt: 2 }}>
            Units Quantity
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="units-quantity"
            fullWidth
            value={formData.unitsQuantity}
            onChange={(e) => setFormData({ ...formData, unitsQuantity: e.target.value })}
            placeholder="Enter units quantity"
          />
        </Grid>

        {/* Amount - Full Width (since it's the only one in this row) */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="amount" sx={{ mt: 2 }}>
            Amount
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="amount"
            fullWidth
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="Enter Amount "
          />
        </Grid>

        {/* Error Message */}
        {error && (
          <Grid size={12} mt={2}>
            <div
              style={{
                color: 'red',
                padding: '10px',
                backgroundColor: '#ffebee',
                borderRadius: '4px',
                border: '1px solid #ffcdd2'
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
            sx={{ minWidth: '120px', backgroundColor: '#2E2F7F' }}
          >
            {loading ? 'Creating...' : 'Create Sales Order'}
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
          Import Sales Orders from CSV
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Select a CSV file to import multiple sales orders at once.
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

export default CreateSalesOrders;