import React, { useEffect, useState } from 'react';
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Radio,
  FormControl,
  Alert,
  Tooltip
} from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconFileImport, IconUpload, IconPlus, IconTrash, IconAlertCircle } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Autocomplete } from '@mui/material'
import { CircularProgress, Backdrop } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import DeleteIcon from '@mui/icons-material/Delete';
import Chip from '@mui/material/Chip';
import { set } from 'lodash';

const CreateSalesOrders = () => {
  const [formData, setFormData] = React.useState({
    date: new Date().toISOString().split('T')[0],
    documentNumber: 'SO000001',
    customerName: '',
    salesChannel: '',
    trackingNumber: '',
    shippingAddress: {},
    billingAddress: {},
    customerPO: '',
    comments: '',
    customerNumber: '',
    shippingRate: 0
  });

  const [orderItems, setOrderItems] = React.useState([
    {
      itemSku: '',
      packQuantity: 1,
      packType: '',
      unitsQuantity: 1,
      amount: 0,
      subTotal: 0,
      taxAmount: 0,
      isProductGroup: false,
      productName: '',
      availableStock: 0,
      stockWarning: null // 'insufficient' or 'out-of-stock'
    }
  ]);

  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = React.useState([]); // Individual products
  const [allProductGroups, setAllProductGroups] = React.useState([]); // Product groups
  const [packTypes, setPackTypes] = React.useState({}); // Store pack types by SKU
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [customers, setCustomers] = React.useState([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState(null);
  const [stockWarnings, setStockWarnings] = React.useState({}); // Store stock warnings by SKU

  // Calculate totals
  const calculateTotals = () => {
    let subTotal = 0;
    let taxAmount = 0;
    let shippingRate = parseFloat(formData.shippingRate) || 0;

    orderItems.forEach(item => {
      subTotal += parseFloat(item.subTotal) || 0;
      taxAmount += parseFloat(item.taxAmount) || 0;
    });

    const totalAmount = subTotal + taxAmount + shippingRate;

    return { subTotal, taxAmount, totalAmount, shippingRate };
  };

  const totals = calculateTotals();

  // Check if selected product is a product group
  const checkIsProductGroup = (product) => {
    if (!product) return false;
    // Product groups have a 'products' array
    if (Array.isArray(product.products) && product.products.length > 0) {
      return true;
    }
    // Product groups have 'price' field while individual products have 'eachPrice'
    if (product.price !== undefined && product.eachPrice !== undefined) {
      return true; // Both fields exist, likely a product group
    }
    return false;
  };

  // Calculate total quantity for an item
  const calculateTotalQuantity = (item) => {
    const packQty = parseInt(item.packQuantity) || 0;
    const unitsQty = parseInt(item.unitsQuantity) || 0;
    return packQty * unitsQty;
  };

  // Check stock level for an item
  const checkStockLevel = (item) => {
    if (!item.itemSku || !item.availableStock) {
      return null; // No product selected or no stock info
    }

    const totalQuantity = calculateTotalQuantity(item);
    const availableStock = item.availableStock || 0;

    if (availableStock <= 0) {
      return 'out-of-stock';
    } else if (totalQuantity > availableStock) {
      return 'insufficient';
    }

    return null; // No warning
  };

  // Update stock warning for an item
  const updateStockWarning = (item, index) => {
    const warning = checkStockLevel(item);
    const newItems = [...orderItems];
    newItems[index].stockWarning = warning;
    setOrderItems(newItems);
  };

  // Check if any item has stock warning
  const hasStockWarnings = () => {
    return orderItems.some(item => item.stockWarning !== null);
  };

  // Get stock warning message
  const getStockWarningMessage = (item) => {
    if (!item.stockWarning) return null;

    const totalQuantity = calculateTotalQuantity(item);
    const availableStock = item.availableStock || 0;

    if (item.stockWarning === 'out-of-stock') {
      return `Out of stock! Available: ${availableStock}`;
    } else if (item.stockWarning === 'insufficient') {
      return `Insufficient stock! Required: ${totalQuantity}, Available: ${availableStock}`;
    }

    return null;
  };

  // Handle adding a new item row
  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      {
        itemSku: '',
        packQuantity: 1,
        packType: '',
        unitsQuantity: 1,
        amount: 0,
        subTotal: 0,
        taxAmount: 0,
        isProductGroup: false,
        productName: '',
        availableStock: 0,
        stockWarning: null
      }
    ]);
  };

  // Handle removing an item row
  const handleRemoveItem = (index) => {
    if (orderItems.length > 1) {
      const newItems = [...orderItems];
      newItems.splice(index, 1);
      setOrderItems(newItems);
    }
  };

  // Handle product selection change for a specific item
  const handleProductChange = (index, newValue) => {

    console.log("order items before check", orderItems)

    if (Array.isArray(orderItems) && orderItems?.some(item => item.itemSku === newValue.sku)) {
      alert('Product already added');
      return;
    }

    console.log("order items after check", orderItems)

    const newItems = [...orderItems];

    if (newValue) {
      const isGroup = checkIsProductGroup(newValue);
      const unitPrice = isGroup ? (newValue.eachPrice || 0) : (newValue.eachPrice || 0);
      const availableStock = newValue.stockLevel || 0;

      // Get default pack type
      let defaultPack = { name: 'Each', quantity: '1' };
      if (newValue.typesOfPacks && newValue.typesOfPacks.length > 0) {
        defaultPack = newValue.typesOfPacks[0];
      }

      newItems[index] = {
        ...newItems[index],
        itemSku: newValue.sku,
        productName: newValue.ProductName || newValue.name,
        isProductGroup: isGroup,
        packType: defaultPack.name,
        packQuantity: parseFloat(defaultPack.quantity) || 1,
        amount: unitPrice,
        availableStock: availableStock
      };

      // Recalculate for this item
      const packQty = parseFloat(newItems[index].packQuantity) || 0;
      const unitsQty = parseFloat(newItems[index].unitsQuantity) || 0;
      const totalQuantity = packQty * unitsQty;
      const subTotal = unitPrice * totalQuantity;

      const isTaxable = newValue.taxable || false;
      const taxPercentage = parseFloat(newValue.taxPercentages) || 0;
      let taxAmount = 0;

      if (isTaxable && taxPercentage > 0) {
        taxAmount = (subTotal * taxPercentage) / 100;
      }

      newItems[index].subTotal = subTotal;
      newItems[index].taxAmount = taxAmount;

      // Check stock level
      updateStockWarning(newItems[index], index);

      // Fetch pack types for this product
      fetchProductsAvailablePackTypes(newValue.sku);
    } else {
      newItems[index] = {
        ...newItems[index],
        itemSku: '',
        productName: '',
        isProductGroup: false,
        packType: '',
        packQuantity: 1,
        amount: 0,
        subTotal: 0,
        taxAmount: 0,
        availableStock: 0,
        stockWarning: null
      };
    }

    setOrderItems(newItems);
  };

  // Handle quantity change for a specific item
  const handleQuantityChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = parseFloat(value) || 0;

    // Recalculate for this item
    const packQty = parseFloat(newItems[index].packQuantity) || 0;
    const unitsQty = parseFloat(newItems[index].unitsQuantity) || 0;
    const totalQuantity = packQty * unitsQty;
    const unitPrice = parseFloat(newItems[index].amount) || 0;
    const subTotal = unitPrice * totalQuantity;

    // Find the product to get tax info
    const productsList = [...allProducts, ...allProductGroups];
    const product = productsList.find(p => p.sku === newItems[index].itemSku);
    const isTaxable = product?.taxable || false;
    const taxPercentage = parseFloat(product?.taxPercentages) || 0;
    let taxAmount = 0;

    if (isTaxable && taxPercentage > 0) {
      taxAmount = (subTotal * taxPercentage) / 100;
    }

    newItems[index].subTotal = subTotal;
    newItems[index].taxAmount = taxAmount;

    // Update stock warning
    updateStockWarning(newItems[index], index);

    setOrderItems(newItems);
  };

  // Handle pack type change for a specific item
  const handlePackTypeChange = (index, newValue) => {
    const newItems = [...orderItems];

    if (newValue) {
      newItems[index].packType = newValue.name;
      newItems[index].packQuantity = parseFloat(newValue.quantity) || 1;

      // Recalculate after pack quantity change
      handleQuantityChange(index, 'packQuantity', newValue.quantity);
    }

    setOrderItems(newItems);
  };

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

    if (!formData.documentNumber.trim()) {
      setError('Document number is required');
      return;
    }

    if (!formData.shippingAddress || Object.keys(formData.shippingAddress).length === 0) {
      setError('Shipping address is required');
      return;
    }

    if (!formData.billingAddress || Object.keys(formData.billingAddress).length === 0) {
      setError('Billing address is required');
      return;
    }

    // Check for stock warnings
    if (hasStockWarnings()) {
      const hasOutOfStock = orderItems.some(item => item.stockWarning === 'out-of-stock');
      const warningMessage = hasOutOfStock
        ? 'Some items are out of stock. Please remove or replace them before proceeding.'
        : 'Some items have insufficient stock. Please adjust quantities before proceeding.';

      setError(warningMessage);
      return;
    }

    // Validate order items
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      if (!item.itemSku.trim()) {
        setError(`Item SKU is required for item ${i + 1}`);
        return;
      }
      if (!item.packQuantity || item.packQuantity <= 0) {
        setError(`Pack quantity is required for item ${i + 1}`);
        return;
      }
      if (!item.unitsQuantity || item.unitsQuantity <= 0) {
        setError(`Units quantity is required for item ${i + 1}`);
        return;
      }
      if (!item.amount || item.amount <= 0) {
        setError(`Amount is required for item ${i + 1}`);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data for bulk order creation
      const ordersData = {
        date: formData.date,
        documentNumber: formData.documentNumber,
        customerName: formData.customerName,
        salesChannel: formData.salesChannel,
        trackingNumber: formData.trackingNumber,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddress,
        customerPO: formData.customerPO,
        comments: formData.comments,
        customer: selectedCustomer,
        items: orderItems.map(item => ({
          itemSku: item.itemSku,
          packQuantity: item.packQuantity,
          packType: item.packType,
          unitsQuantity: item.unitsQuantity,
          amount: item.amount,
          subTotal: item.subTotal,
          taxAmount: item.taxAmount,
          isProductGroup: item.isProductGroup,
          productName: item.productName,
          taxable: item.taxable || false,
          taxPercentages: item.taxPercentage || 0
        }))
      }

      console.log("Creating multiple sales orders:", ordersData);

      const res = await axiosInstance.post('/sales-order/create-bulk-sales-order-admin', ordersData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Create bulk sales orders response:", res);

      if (res.data.statusCode === 200) {
        // Reset form on success
        setFormData({
          date: new Date().toISOString().split('T')[0],
          documentNumber: '',
          customerName: '',
          salesChannel: '',
          trackingNumber: '',
          shippingAddress: {},
          billingAddress: {},
          customerPO: '',
          comments: '',
          customerNumber: '',
          shippingRate: 0
        });

        setOrderItems([{
          itemSku: '',
          packQuantity: 1,
          packType: '',
          unitsQuantity: 1,
          amount: 0,
          subTotal: 0,
          taxAmount: 0,
          isProductGroup: false,
          productName: '',
          availableStock: 0,
          stockWarning: null
        }]);

        setSelectedCustomer(null);

        alert(`Successfully created ${orderItems.length} sales orders with document number ${formData.documentNumber}`);
        navigate('/dashboard/sales-orders/list');
      } else {
        setError(res.data.message || 'Failed to create sales orders');
      }

    } catch (error) {
      console.error('Create sales orders error:', error);
      if (error.response?.status === 400) {
        // Handle stock validation errors from backend
        if (error.response?.data?.message?.includes('stock') ||
          error.response?.data?.message?.includes('Stock') ||
          error.response?.data?.message?.includes('insufficient')) {
          setError(`Stock validation failed: ${error.response.data.message}. Please adjust quantities.`);
        } else {
          setError(error.response?.data?.message || 'Failed to create sales orders');
        }
      } else {
        setError(error.message || 'Failed to create sales orders');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch individual products with stock info
  const fetchProductsList = async () => {
    try {
      const response = await axiosInstance.get('/products/get-all-products-dashboard');
      console.log("Individual products response:", response.data);

      if (response.data.statusCode === 200) {
        const productsData = response.data.data?.docs || response.data.data || response.data;

        // Filter to get only individual products
        const individualProducts = Array.isArray(productsData)
          ? productsData.filter(product => !product.products || product.products.length === 0)
          : [];

        setAllProducts(individualProducts);
      }

    } catch (error) {
      console.error('Error fetching individual products:', error);
      setError(error.message);
    }
  };

  // Fetch product groups
  const fetchProductGroups = async () => {
    try {
      setError('');
      const response = await axiosInstance.get('/product-group/get-all-product-groups');
      console.log("Product groups response:", response);

      let productGroupsData = [];

      if (response.data?.statusCode === 200) {
        productGroupsData = response.data.data;
      } else if (response.data?.data?.statusCode === 200) {
        productGroupsData = response.data.data.data;
      }

      if (Array.isArray(productGroupsData)) {
        // For product groups, we need to check stock of individual products within the group
        const groupsWithStockInfo = productGroupsData.map(group => {
          if (group.products && group.products.length > 0) {
            // Find the minimum stock level among products in the group
            const minStockLevel = Math.min(...group.products.map(p => p.product?.stockLevel || 0));
            return {
              ...group,
              stockLevel: minStockLevel // Use minimum stock level for the group
            };
          }
          return group;
        });

        setAllProductGroups(groupsWithStockInfo);
      }

    } catch (error) {
      console.error('Error fetching product groups:', error);
      setError(error.response?.data?.message || error.message || 'Error fetching product groups');
    }
  };

  const fetchLatestDocumentNumber = async () => {
    try {
      const response = await axiosInstance.get('/sales-order/get-latest-document-number');
      console.log("Latest document number response:", response);

      if (response.data.statusCode === 200 && response.data.data.documentNumber) {
        setFormData(prev => ({
          ...prev,
          documentNumber: response.data.data.documentNumber.replace(/(\D*)(\d+)/, (_, p, n) => p + String(+n + 1).padStart(n.length, '0'))
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          documentNumber: 'SO000001'
        }))
      }

    } catch (error) {
      console.error('Error fetching latest document number:', error);
    }
  }

  // Fetch pack types for selected product
  const fetchProductsAvailablePackTypes = async (sku) => {
    if (!sku) return;

    try {
      const response = await axiosInstance.get(`/products/get-products-pack-types/${sku}`);
      console.log("Pack types response for", sku, ":", response);

      if (response.status === 200 && Array.isArray(response.data.data)) {
        setPackTypes(prev => ({
          ...prev,
          [sku]: response.data.data
        }));
      }

    } catch (error) {
      console.error('Error fetching products pack types:', error);
    }
  };

  // Fetch customers list
  const fetchCustomersList = async () => {
    try {
      const response = await axiosInstance.get('/admin/get-all-users');
      console.log("Customers response:", response.data);

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

  // Handle customer selection
  const handleCustomerChange = (newValue) => {
    setSelectedCustomer(newValue);
    if (newValue) {
      const billingAddress = newValue.billingAddresses?.find(addr => addr.isDefaultBillingAddress == true);
      const shippingAddress = newValue.shippingAddresses?.find(addr => addr.isDefaultShippingAddress == true);
      const shippingRate = parseFloat(newValue.defaultShippingRate) || 0;

      setFormData(prev => ({
        ...prev,
        customerName: newValue.customerName,
        customerNumber: newValue.customerId,
        shippingRate: shippingRate,
        billingAddress: billingAddress || {},
        shippingAddress: shippingAddress || {}
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        customerName: '',
        customerNumber: '',
        shippingRate: 0,
        billingAddress: {},
        shippingAddress: {}
      }));
    }
  };

  // Initial data fetching
  React.useEffect(() => {
    fetchCustomersList();
    fetchProductsList();
    fetchProductGroups();
    fetchLatestDocumentNumber();
  }, []);

  // Custom option renderer for Autocomplete with stock info
  const renderProductOption = (props, option) => {
    const isOutOfStock = (option.stockLevel || 0) <= 0;
    const stockLevel = option.stockLevel || 0;

    return (
      <li {...props} style={{ opacity: isOutOfStock ? 0.6 : 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            <Typography variant="body1">
              {option.ProductName || option.name}
              <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                (SKU: {option.sku})
              </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Price: ${option.eachPrice || option.price || 0}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isOutOfStock ? (
              <Chip
                label="Out of Stock"
                size="small"
                color="error"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            ) : (
              <Typography variant="caption" color="text.secondary">
                Stock: {stockLevel}
              </Typography>
            )}
          </Box>
        </Box>
      </li>
    );
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
      formDataForUpload.append('salesOrders', selectedFile);

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
    const fileInput = document.getElementById('csv-file-input');
    if (fileInput) fileInput.value = '';
  };

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Create Sales Order',
    },
  ];

  // Get combined products list for autocomplete
  const getProductsList = () => [...allProducts, ...allProductGroups];

  return (
    <div>
      <Breadcrumb title="Create Sales Order" items={BCrumb} />

      <Grid container spacing={2}>
        {/* Date */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="date" sx={{ mt: 0 }}>
            Date
          </CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={formData.date ? new Date(formData.date) : null}
              onChange={(newValue) => {
                setFormData({ ...formData, date: newValue ? newValue.toISOString().split('T')[0] : '' });
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

        {/* Customer Name */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="customer-name" sx={{ mt: 2 }}>
            Select Customer Name
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <FormControl fullWidth>
            <Autocomplete
              id="customer-autocomplete"
              options={customers}
              getOptionLabel={(customer) =>
                customer ? `${customer.customerName} (${customer.customerId || ''})` : ""
              }
              value={selectedCustomer || null}
              onChange={(event, newValue) => handleCustomerChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={customers.length === 0 ? "Loading Customers..." : "Search or select a Customer"}
                  size="small"
                />
              )}
            />
          </FormControl>
        </Grid>

        {/* Document Number */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="doc-no" sx={{ mt: 2 }}>
            Document Number
            <span style={{ color: 'red' }}>*</span>
          </CustomFormLabel>
          <CustomOutlinedInput
            id="doc-no"
            fullWidth
            value={formData.documentNumber}
            disabled
            placeholder="Enter Document Number"
          />
        </Grid>

        {/* Sales Channel and Tracking Number */}
        <Grid size={6}>
          <CustomFormLabel htmlFor="sales-channel" sx={{ mt: 2 }}>
            Sales Channel
            <span style={{ color: 'red' }}>*</span>
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
          </CustomFormLabel>
          <CustomOutlinedInput
            id="tracking-number"
            fullWidth
            value={formData.trackingNumber}
            onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
            placeholder="Enter tracking number"
          />
        </Grid>

        {/* Customer PO */}
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

        {/* Order Items Table */}
        <Grid size={12} sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#2E2F7F' }}>
              Order Items
            </Typography>
            <Button
              variant="outlined"
              startIcon={<IconPlus size="1.1rem" />}
              onClick={handleAddItem}
              sx={{ borderColor: '#2E2F7F', color: '#2E2F7F' }}
            >
              Add Item
            </Button>
          </Box>

          {hasStockWarnings() && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              action={
                <Button
                  color="warning"
                  size="small"
                  onClick={() => {
                    // Auto-fix quantities to match available stock
                    const fixedItems = orderItems.map(item => {
                      if (item.stockWarning === 'insufficient' && item.availableStock > 0) {
                        // Reduce units quantity to match available stock
                        const maxUnits = Math.floor(item.availableStock / item.packQuantity);
                        const newUnitsQuantity = Math.min(item.unitsQuantity, maxUnits);

                        if (newUnitsQuantity < item.unitsQuantity) {
                          const newSubTotal = item.amount * item.packQuantity * newUnitsQuantity;
                          const taxAmount = item.taxPercentage ? (newSubTotal * item.taxPercentage) / 100 : 0;

                          return {
                            ...item,
                            unitsQuantity: newUnitsQuantity,
                            subTotal: newSubTotal,
                            taxAmount: taxAmount,
                            stockWarning: null
                          };
                        }
                      }
                      return item;
                    });

                    setOrderItems(fixedItems);
                  }}
                >
                  Auto-fix Quantities
                </Button>
              }
            >
              Some items have stock issues. Please adjust quantities or remove items before proceeding.
            </Alert>
          )}

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Product/Group</TableCell>
                  <TableCell>Pack Type</TableCell>
                  <TableCell>Pack Qty</TableCell>
                  <TableCell>Units/Pack</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell>Tax</TableCell>
                  <TableCell>Stock Status</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderItems.map((item, index) => {
                  const productsList = getProductsList();
                  const selectedProduct = productsList.find(p => p.sku === item.itemSku);
                  const availablePackTypes = packTypes[item.itemSku] || [];
                  const stockWarningMessage = getStockWarningMessage(item);
                  const totalQuantity = calculateTotalQuantity(item);
                  const isOutOfStock = item.availableStock <= 0;

                  return (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor: item.stockWarning === 'out-of-stock' ? '#ffebee' :
                          item.stockWarning === 'insufficient' ? '#fff3e0' : 'inherit'
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ position: 'relative' }}>
                          <Autocomplete
                            size="small"
                            sx={{ width: 250 }}
                            options={productsList}
                            getOptionLabel={(option) =>
                              option ? `${option.ProductName || option.name} (SKU: ${option.sku})` : ""
                            }
                            value={selectedProduct || null}
                            onChange={(event, newValue) => handleProductChange(index, newValue)}
                            renderOption={renderProductOption}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Search product..."
                                error={!!item.stockWarning}
                              />
                            )}
                          />
                          {item.stockWarning && (
                            <Tooltip title={stockWarningMessage}>
                              <IconAlertCircle
                                size={18}
                                color="error"
                                style={{
                                  position: 'absolute',
                                  right: 8,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  zIndex: 1
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Autocomplete
                          size="small"
                          sx={{ width: 150 }}
                          options={availablePackTypes}
                          getOptionLabel={(option) => option.name || ''}
                          value={availablePackTypes.find(pack => pack.name === item.packType) || null}
                          onChange={(event, newValue) => handlePackTypeChange(index, newValue)}
                          disabled={availablePackTypes.length === 0 || isOutOfStock}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Pack type"
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={item.packQuantity}
                          disabled
                          inputProps={{ min: 1, step: 1 }}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ position: 'relative' }}>
                          <TextField
                            size="small"
                            type="number"
                            value={item.unitsQuantity}
                            onChange={(e) => handleQuantityChange(index, 'unitsQuantity', e.target.value)}
                            inputProps={{
                              min: 1,
                              step: 1,
                              max: isOutOfStock ? 0 : Math.floor(item.availableStock / item.packQuantity)
                            }}
                            sx={{ width: 100 }}
                            error={!!item.stockWarning}
                            helperText={item.availableStock > 0 ?
                              `Max: ${Math.floor(item.availableStock / item.packQuantity)} units` :
                              'Out of stock'}
                            disabled={isOutOfStock}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={item.amount.toFixed(2)}
                          InputProps={{ readOnly: true }}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={item.subTotal.toFixed(2)}
                          InputProps={{ readOnly: true }}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={item.taxAmount.toFixed(2)}
                          InputProps={{ readOnly: true }}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell>
                        {item.itemSku ? (
                          <Box>
                            <Typography
                              variant="caption"
                              display="block"
                              color={item.stockWarning === 'out-of-stock' ? 'error' :
                                item.stockWarning === 'insufficient' ? 'warning' : 'success'}
                              fontWeight={item.stockWarning ? 'bold' : 'normal'}
                            >
                              {item.stockWarning === 'out-of-stock' ? 'Out of Stock' :
                                item.stockWarning === 'insufficient' ? 'Low Stock' : 'In Stock'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Required: {totalQuantity}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Available: {item.availableStock}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Select product
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.isProductGroup ? 'Group' : 'Product'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveItem(index)}
                          disabled={orderItems.length === 1}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Totals Summary */}
        <Grid size={12} sx={{ mt: 2 }}>
          <Card sx={{ backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={4}>
                  <Typography variant="subtitle1" fontWeight="bold">Subtotal</Typography>
                  <Typography variant="h6">${totals.subTotal.toFixed(2)}</Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="subtitle1" fontWeight="bold">Tax Amount</Typography>
                  <Typography variant="h6">${totals.taxAmount.toFixed(2)}</Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="subtitle1" fontWeight="bold">Shipping Rate</Typography>
                  <Typography variant="h6">${totals.shippingRate.toFixed(2)}</Typography>
                </Grid>
                <Grid size={12} sx={{ mt: 2, pt: 2, borderTop: '1px solid #ddd' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="bold">Total Amount</Typography>
                    <Typography variant="h4" fontWeight="bold" color="#2E2F7F">
                      ${totals.totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Comments */}
        <Grid size={12} sx={{ mt: 2 }}>
          <CustomFormLabel htmlFor="comments">
            Comments
          </CustomFormLabel>
          <TextField
            id="comments"
            fullWidth
            multiline
            rows={3}
            value={formData.comments || ''}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            placeholder="Enter any comments or notes..."
            variant="outlined"
          />
        </Grid>

        {/* Error Message */}
        {error && (
          <Grid size={12} mt={2}>
            <Alert
              severity={error.includes('successfully') ? 'success' :
                error.includes('stock') || error.includes('Stock') ? 'warning' : 'error'}
              sx={{ mb: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Grid>
        )}

        {/* Submit Button */}
        <Grid size={12} mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || hasStockWarnings()}
            sx={{
              minWidth: '120px',
              backgroundColor: hasStockWarnings() ? '#ff9800' : '#2E2F7F',
              '&:hover': {
                backgroundColor: hasStockWarnings() ? '#f57c00' : '#1E1F6F'
              },
              '&.Mui-disabled': {
                backgroundColor: hasStockWarnings() ? '#ffe0b2' : '#e0e0e0'
              }
            }}
          >
            {loading ? 'Creating Orders...' :
              hasStockWarnings() ? 'Fix Stock Issues First' :
                `Create ${orderItems.length} Order(s)`}
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