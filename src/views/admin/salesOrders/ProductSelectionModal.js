import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Radio,
    FormControlLabel,
    RadioGroup,
    Divider,
    InputAdornment,
    CircularProgress,
    Alert,
    FormControl,
    MenuItem
} from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Select } from '@mui/material';

const ProductSelectionModal = ({
    open,
    onClose,
    tableData,
    documentNo,
    onSalesOrderCreated
}) => {
    const [selectedProduct, setSelectedProduct] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Product Selection, 2: Form


    // Form data state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        documentNumber: documentNo || '',
        customerName: '',
        salesChannel: '',
        trackingNumber: '',
        shippingAddress: '',
        billingAddress: '',
        customerPO: '',
        itemSku: '',
        packQuantity: 1,
        unitsQuantity: 1,
        amount: 0
    });



    // Initialize form data with existing order data
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            const firstOrder = tableData[0];

            console.log("First orderiiiiiiiiiiiii:", firstOrder.customerName);

            setFormData(prev => ({
                ...prev,
                documentNumber: documentNo || firstOrder.documentNumber || '',
                customerName: firstOrder.customerName || '',
                salesChannel: firstOrder.salesChannel || '',
                shippingAddress: firstOrder.shippingAddress || '',
                billingAddress: firstOrder.billingAddress || '',
                date: firstOrder.date,
                trackingNumber: firstOrder.trackingNumber,
                customerPO: firstOrder.customerPO

            }));
        }
    }, [tableData, documentNo]);

    // Fetch products list
    const fetchProductsList = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/products/get-all-products');

            if (response.data.statusCode === 200) {
                const productsData = response.data.data?.docs || response.data.data || response.data;

                // Filter unique products and only active ones
                const getUniqueProducts = (products) => {
                    if (!Array.isArray(products)) return [];

                    const uniqueProducts = [];
                    const seenIds = new Set();

                    products.forEach(product => {
                        if (product._id && !seenIds.has(product._id) && !product.inactive) {
                            seenIds.add(product._id);
                            uniqueProducts.push(product);
                        }
                    });

                    return uniqueProducts;
                };

                const products = getUniqueProducts(productsData);
                setProductList(products);
                setFilteredProducts(products);
            }
        } catch (error) {
            console.error('Error fetching products list:', error);
            setError('Failed to fetch products list');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductsAvailablePackTypes = async () => {
        try {
            const response = await axiosInstance.get(`/products/get-products-pack-types/${formData.itemSku}`);
            console.log("response products pack types", response);

            if (response.status === 200) {
                setFormData(prev => ({
                    ...prev,
                    packType: response.data.data
                }))
            }

        } catch (error) {
            console.error('Error fetching products pack types:', error);
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchProductsAvailablePackTypes();
    }, [formData.itemSku]);


    // Filter products based on search
    useEffect(() => {
        if (productSearch.trim() === '') {
            setFilteredProducts(productList);
        } else {
            const filtered = productList.filter(product =>
                product.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
                product.ProductName?.toLowerCase().includes(productSearch.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
    }, [productSearch, productList]);

    // Handle product selection
    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setFormData(prev => ({
            ...prev,
            itemSku: product.sku || '',
            amount: product.eachPrice || 0
        }));
    };

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Calculate total amount when quantities change
        if (field === 'packQuantity' || field === 'unitsQuantity') {
            const selectedProd = productList.find(p => p._id === selectedProduct);
            if (selectedProd) {
                const packQty = field === 'packQuantity' ? parseInt(value) || 1 : formData.packQuantity;
                const unitQty = field === 'unitsQuantity' ? parseInt(value) || 1 : formData.unitsQuantity;
                const totalAmount = selectedProd.eachPrice * unitQty;

                setFormData(prev => ({
                    ...prev,
                    amount: totalAmount
                }));
            }
        }
    };

    // Handle form submission
    const handleSubmit = async () => {

        console.log("Submitting form data:", formData);
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

                console.log("created sales order ", res.data);
                // Call parent callback to refresh data
                if (onSalesOrderCreated) {
                    onSalesOrderCreated();
                }

                // Reset and close modal
                setStep(1);
                setSelectedProduct('');
                setProductSearch('');
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    documentNumber: documentNo || '',
                    customerName: '',
                    salesChannel: '',
                    trackingNumber: '',
                    shippingAddress: '',
                    billingAddress: '',
                    customerPO: '',
                    itemSku: '',
                    packQuantity: 1,
                    unitsQuantity: 1,
                    amount: 0
                });
                onClose();
            } else if (res.data.statusCode === 400) {
                setError(res.data.message || 'Failed to create sales order');
            }
        } catch (error) {
            console.error('Create sales order error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to create sales order');
        } finally {
            setLoading(false);
        }
    };

    // Initialize products on modal open
    useEffect(() => {
        if (open) {
            fetchProductsList();
        }
    }, [open]);

    useEffect(() => {
        const totalItems = formData.packQuantity * formData.unitsQuantity;
        const totalAmount = selectedProduct.eachPrice * totalItems;
        setFormData(prev => ({
            ...prev,
            amount: totalAmount
        }))
    }, [formData.packQuantity, formData.unitsQuantity])

    // Handle modal close
    const handleClose = () => {
        setStep(1);
        setSelectedProduct('');
        setProductSearch('');
        setError('');
        onClose();
    };

    // Handle next step
    const handleNext = () => {
        if (!selectedProduct) {
            setError('Please select a product');
            return;
        }
        setError('');
        setStep(2);
    };



    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: { minHeight: '600px' }
            }}
        >
            <DialogTitle>
                <Typography variant="h5">
                    {step === 1 ? 'Select Product' : 'Create Sales Order'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {step === 1 ? 'Choose a product to add to sales order' : 'Fill in the details for new sales order'}
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {step === 1 ? (
                    // Product Selection Step
                    <Box>
                        <TextField
                            fullWidth
                            placeholder="Search by SKU or Product Name..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconSearch size="1.1rem" />
                                    </InputAdornment>
                                )
                            }}
                        />

                        {loading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Select</TableCell>
                                            <TableCell>SKU</TableCell>
                                            <TableCell>Product Name</TableCell>
                                            <TableCell>Price</TableCell>
                                            <TableCell>Stock Level</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredProducts.map((product) => (
                                            <TableRow
                                                key={product._id}
                                                hover
                                                selected={selectedProduct._id === product._id}
                                            >
                                                <TableCell>
                                                    <RadioGroup
                                                        value={selectedProduct._id}
                                                        onChange={() => handleProductSelect(product)}
                                                    >
                                                        <FormControlLabel
                                                            value={product._id}
                                                            control={<Radio size="small" />}
                                                            label=""
                                                        />
                                                    </RadioGroup>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {product.sku || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {product.ProductName || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        ${product.eachPrice || '0.00'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {product.stockLevel || 0}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredProducts.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    <Typography variant="body2" color="text.secondary">
                                                        No products found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                ) : (
                    // Form Step
                    <Grid container spacing={3}>

                        <Grid item xs={12} fullWidth>
                            <Typography variant="h6" gutterBottom>
                                Selected Product: {productList.find(p => p._id === selectedProduct._id)?.ProductName}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        {/* <Grid size={12}>
                            <CustomFormLabel htmlFor="date" sx={{ mt: 0 }}>
                                Date
                            </CustomFormLabel>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e })}
                                    renderInput={(params) => <CustomOutlinedInput {...params} />}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            placeholder: "Select date",
                                            id: "date"
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid> */}

                        {/* <Grid size={6}>
                            <CustomFormLabel htmlFor="customer-po" sx={{ mt: 2 }}>
                                Document Number
                            </CustomFormLabel>
                            <CustomOutlinedInput
                                id="customer-po"
                                fullWidth
                                disabled
                                value={formData.documentNumber}
                                onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                            />
                        </Grid> */}

                        {/* <Grid size={6}>
                            <CustomFormLabel htmlFor="customer-name" sx={{ mt: 2 }}>
                                Customer Name *
                            </CustomFormLabel>
                            <CustomOutlinedInput
                                id="customer-name"
                                fullWidth
                                disabled
                                value={formData.customerName}
                                onChange={(e) => handleInputChange('customerName', e.target.value)}
                            />
                        </Grid> */}
                        {/* <Grid size={6}>
                            <CustomFormLabel htmlFor="Sales-Channel" sx={{ mt: 2 }}>
                                Sales Channel  *
                            </CustomFormLabel>
                            <CustomOutlinedInput
                                id="Sales-Channel"
                                fullWidth
                                disabled
                                value={formData.salesChannel}
                                onChange={(e) => handleInputChange('salesChannel', e.target.value)}
                            />
                        </Grid> */}
                        {/* <Grid size={6}>
                            <CustomFormLabel htmlFor="Shipping-address" sx={{ mt: 2 }}>
                                Shipping Address *
                            </CustomFormLabel>
                            <CustomOutlinedInput
                                id="Shipping-address"
                                fullWidth
                                disabled
                                value={formData.shippingAddress}
                                onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                            />
                        </Grid> */}
                        {/* <Grid size={6}>
                            <CustomFormLabel htmlFor="billing-address" sx={{ mt: 2 }}>
                                Billing Address *
                            </CustomFormLabel>
                            <CustomOutlinedInput
                                id="billing-address"
                                fullWidth
                                disabled
                                value={formData.billingAddress}
                                onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                            />
                        </Grid> */}
                        {/* <Grid size={6}>
                            <CustomFormLabel htmlFor="tracking-no" sx={{ mt: 2 }}>
                                Tracking Number *
                            </CustomFormLabel>
                            <CustomOutlinedInput
                                id="tracking-no"
                                fullWidth
                                disabled
                                value={formData.trackingNumber}
                                onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                            />
                        </Grid> */}

                        {/* <Grid size={6}>
                            <CustomFormLabel htmlFor="customner-po" sx={{ mt: 2 }}>
                                Customer PO *
                            </CustomFormLabel>
                            <CustomOutlinedInput
                                id="customer-po"
                                fullWidth
                                disabled
                                value={formData.customerPO}
                                onChange={(e) => handleInputChange('customerPO', e.target.value)}
                            />
                        </Grid> */}

                        <Grid size={6}>
                            <CustomFormLabel htmlFor="pricing-group-select" sx={{ mt: 2 }}>
                                Pack Type *
                            </CustomFormLabel>
                            <FormControl fullWidth>
                                <Select
                                    id="pricing-group-select"
                                    value={formData.packQuantity}
                                    onChange={(e) => handleInputChange('packQuantity', e.target.value)}
                                    disabled={loading || selectedProduct.typesOfPacks.length === 0}
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
                                        {selectedProduct.typesOfPacks.length === 0 ? 'Loading types...' : 'Select a type'}
                                    </MenuItem>
                                    {selectedProduct.typesOfPacks.map((pack) => (
                                        <MenuItem key={pack.name} value={pack.quantity}>
                                            {pack.name} : Qty -{pack.quantity}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={6}>
                            <CustomFormLabel htmlFor="units-qty" sx={{ mt: 2 }}>
                                Units Quantity *
                            </CustomFormLabel>
                            <CustomOutlinedInput
                                id="units-qty"
                                fullWidth
                                value={formData.unitsQuantity}
                                onChange={(e) => handleInputChange('unitsQuantity', e.target.value)}
                            />
                        </Grid>

                        <Grid size={6}>
                            <CustomFormLabel htmlFor="Amount" sx={{ mt: 2 }}>
                                Amount *
                            </CustomFormLabel>
                            <CustomOutlinedInput
                                id="Amount"
                                fullWidth
                                value={formData.amount}
                                disabled
                                onChange={(e) => {
                                    const totalItems = formData.unitsQuantity * formData.packQuantity;
                                    const totalAmount = formData.eachPrice * totalItems;
                                    handleInputChange('amount', totalAmount);
                                }}
                            />
                        </Grid>
                    </Grid>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                {step === 1 ? (
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        disabled={!selectedProduct || loading}
                    >
                        Next
                    </Button>
                ) : (
                    <>
                        <Button onClick={() => setStep(1)} disabled={loading}>
                            Back
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                        // disabled={loading}
                        >
                            {loading ? <CircularProgress size={20} /> : 'Create Sales Order'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ProductSelectionModal;