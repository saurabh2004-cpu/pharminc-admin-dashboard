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
    Divider,
    InputAdornment,
    CircularProgress,
    Alert,
    FormControl,
    MenuItem,
    Card,
    CardContent
} from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';

const ProductSelectionModal = ({
    open,
    onClose,
    tableData,
    documentNo,
    onSalesOrderCreated
}) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productSearch, setProductSearch] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Product Selection, 2: Form
    const [packTypes, setPackTypes] = useState([]);

    console.log("First order:", tableData[0]);

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
        packType: '',
        unitsQuantity: 1,
        amount: 0,
        comments: ''
    });

    // Initialize form data with existing order data
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            const firstOrder = tableData[0];
            console.log("First order:", firstOrder);

            setFormData(prev => ({
                ...prev,
                documentNumber: documentNo || firstOrder.documentNumber || '',
                customerName: firstOrder.customerName || '',
                salesChannel: firstOrder.salesChannel || '',
                shippingAddress: firstOrder.shippingAddress || '',
                billingAddress: firstOrder.billingAddress || '',
                date: firstOrder.date || new Date().toISOString().split('T')[0],
                trackingNumber: firstOrder.trackingNumber || '',
                customerPO: firstOrder.customerPO || ''
            }));
        }
    }, [tableData, documentNo]);

    // Fetch products list
    const fetchProductsList = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/products/get-all-products-dashboard');

            if (response.data.statusCode === 200) {
                const productsData = response.data.data?.docs || response.data.data || response.data.data?.products || [];

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

    // Fetch pack types for selected product
    const fetchProductsAvailablePackTypes = async (sku) => {
        if (!sku) return;
        
        try {
            const response = await axiosInstance.get(`/products/get-products-pack-types/${sku}`);
            console.log("Pack types response:", response.data);

            if (response.status === 200 && response.data.data) {
                setPackTypes(response.data.data);
                
                // Auto-select the first pack type if available
                if (response.data.data.length > 0) {
                    const firstPack = response.data.data[0];
                    setFormData(prev => ({
                        ...prev,
                        packQuantity: firstPack.quantity.toString(),
                        packType: firstPack.name
                    }));
                    
                    // Recalculate amount with initial values
                    recalculateAmount(firstPack.quantity.toString(), formData.unitsQuantity);
                }
            }
        } catch (error) {
            console.error('Error fetching products pack types:', error);
            setPackTypes([]);
        }
    };

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
        console.log("Product selected:", product);
        setSelectedProduct(product);
        setFormData(prev => ({
            ...prev,
            itemSku: product.sku || '',
            amount: product.eachPrice || 0
        }));
        
        // Fetch pack types for the selected product
        fetchProductsAvailablePackTypes(product.sku);
    };

    // Recalculate amount when quantities change
    const recalculateAmount = (packQty, unitQty) => {
        if (!selectedProduct) return;
        
        const packQuantity = parseInt(packQty) || 1;
        const unitsQuantity = parseInt(unitQty) || 1;
        const totalQuantity = packQuantity * unitsQuantity;
        const unitPrice = selectedProduct.eachPrice || 0;
        const totalAmount = unitPrice * totalQuantity;
        
        setFormData(prev => ({
            ...prev,
            amount: parseFloat(totalAmount.toFixed(2))
        }));
    };

    // Handle form input changes
    const handleInputChange = (field, value) => {
        console.log(`Field ${field} changed to:`, value);
        
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Recalculate amount when quantities change
        if (field === 'packQuantity') {
            recalculateAmount(value, formData.unitsQuantity);
            
            // Also update packType if it exists in packTypes
            const selectedPack = packTypes.find(pack => pack.quantity.toString() === value.toString());
            if (selectedPack) {
                setFormData(prev => ({
                    ...prev,
                    packType: selectedPack.name
                }));
            }
        }
        
        if (field === 'unitsQuantity') {
            recalculateAmount(formData.packQuantity, value);
        }
    };

    // Handle pack type selection
    const handlePackTypeChange = (e) => {
        const selectedPackQuantity = e.target.value;
        const selectedPack = packTypes.find(pack => pack.quantity.toString() === selectedPackQuantity.toString());
        
        console.log("Pack type selected:", selectedPack);
        
        if (selectedPack) {
            setFormData(prev => ({
                ...prev,
                packQuantity: selectedPack.quantity.toString(),
                packType: selectedPack.name
            }));
            
            // Recalculate amount with new pack quantity
            recalculateAmount(selectedPack.quantity.toString(), formData.unitsQuantity);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        console.log("Submitting form data:", formData);
        console.log("Selected product:", selectedProduct);

        // Enhanced validation
        if (!formData.customerName?.trim()) {
            setError('Customer name is required');
            return;
        }

        if (!formData.salesChannel?.trim()) {
            setError('Sales channel is required');
            return;
        }

        if (!formData.itemSku?.trim()) {
            setError('Item SKU is required');
            return;
        }

        if (!formData.packQuantity || formData.packQuantity <= 0) {
            setError('Valid pack quantity is required');
            return;
        }

        if (!formData.unitsQuantity || formData.unitsQuantity <= 0) {
            setError('Valid units quantity is required');
            return;
        }

        if (!formData.amount || formData.amount <= 0) {
            setError('Valid amount is required');
            return;
        }

        // Check if we have enough stock
        const totalItems = parseInt(formData.packQuantity) * parseInt(formData.unitsQuantity);
        if (selectedProduct && selectedProduct.stockLevel < totalItems) {
            setError(`Insufficient stock. Required: ${totalItems}, Available: ${selectedProduct.stockLevel}`);
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Prepare the payload
            const payload = {
                date: formData.date,
                documentNumber: formData.documentNumber,
                customerName: formData.customerName,
                salesChannel: formData.salesChannel,
                trackingNumber: formData.trackingNumber,
                shippingAddress: formData.shippingAddress,
                billingAddress: formData.billingAddress,
                customerPO: formData.customerPO,
                itemSku: formData.itemSku,
                packQuantity: parseInt(formData.packQuantity),
                packType: formData.packType,
                unitsQuantity: parseInt(formData.unitsQuantity),
                amount: parseFloat(formData.amount),
                comments: formData.comments || ''
            };

            console.log("Sending payload to API:", payload);

            const res = await axiosInstance.post('/sales-order/create-sales-order', payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Create sales order response:", res.data);

            if (res.data.statusCode === 200) {
                console.log("Sales order created successfully:", res.data.data);
                
                // Call parent callback to refresh data
                if (onSalesOrderCreated) {
                    onSalesOrderCreated();
                }

                // Reset and close modal
                handleClose();
            } else {
                setError(res.data.message || 'Failed to create sales order');
            }
        } catch (error) {
            console.error('Create sales order error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create sales order';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Initialize products on modal open
    useEffect(() => {
        if (open) {
            fetchProductsList();
            setError('');
            setStep(1);
        }
    }, [open]);

    // Handle modal close
    const handleClose = () => {
        setStep(1);
        setSelectedProduct(null);
        setProductSearch('');
        setError('');
        setPackTypes([]);
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
            packType: '',
            unitsQuantity: 1,
            amount: 0,
            comments: ''
        });
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

    // Handle back to product selection
    const handleBack = () => {
        setStep(1);
        setError('');
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { minHeight: '600px', maxHeight: '90vh' }
            }}
        >
            <DialogTitle>
                <Box>
                    <Typography variant="h4" component="div" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
                        {step === 1 ? 'Select Product' : 'Create Sales Order'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {step === 1 ? 'Choose a product to add to sales order' : 'Fill in the details for new sales order'}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ overflow: 'hidden' }}>
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
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width="60px">Select</TableCell>
                                            <TableCell>SKU</TableCell>
                                            <TableCell>Product Name</TableCell>
                                            <TableCell align="right">Price</TableCell>
                                            <TableCell align="right">Stock Level</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredProducts.map((product) => (
                                            <TableRow
                                                key={product._id}
                                                hover
                                                selected={selectedProduct?._id === product._id}
                                                onClick={() => handleProductSelect(product)}
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                <TableCell>
                                                    <Radio
                                                        checked={selectedProduct?._id === product._id}
                                                        onChange={() => handleProductSelect(product)}
                                                        size="small"
                                                    />
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
                                                <TableCell align="right">
                                                    <Typography variant="body2">
                                                        ${(product.eachPrice || 0).toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography 
                                                        variant="body2" 
                                                        color={product.stockLevel > 0 ? 'success.main' : 'error.main'}
                                                    >
                                                        {product.stockLevel || 0}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredProducts.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    <Typography variant="body2" color="text.secondary">
                                                        {loading ? 'Loading...' : 'No products found'}
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
                    // Form Step - Improved Clean UI with 2 fields per row
                    <Box>
                        {/* Selected Product Info */}
                        {selectedProduct && (
                            <Card variant="outlined" sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        Selected Product
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2">
                                                <strong>Product Name:</strong> {selectedProduct.ProductName}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2">
                                                <strong>SKU:</strong> {selectedProduct.sku}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2">
                                                <strong>Unit Price:</strong> ${(selectedProduct.eachPrice || 0).toFixed(2)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2">
                                                <strong>Available Stock:</strong> {selectedProduct.stockLevel}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}

                        <Divider sx={{ mb: 3 }} />

                        {/* Order Information - Clean Grid Layout */}
                        <Grid container spacing={3}>
                            {/* Row 1 */}
                            <Grid item xs={12} sm={6}>
                                <CustomFormLabel htmlFor="document-number">
                                    Document Number
                                </CustomFormLabel>
                                <CustomOutlinedInput
                                    id="document-number"
                                    fullWidth
                                    value={formData.documentNumber}
                                    disabled
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <CustomFormLabel htmlFor="customer-name">
                                    Customer Name
                                </CustomFormLabel>
                                <CustomOutlinedInput
                                    id="customer-name"
                                    fullWidth
                                    value={formData.customerName}
                                    disabled
                                />
                            </Grid>

                            {/* Row 2 */}
                            <Grid item xs={12} sm={6}>
                                <CustomFormLabel htmlFor="sales-channel">
                                    Sales Channel
                                </CustomFormLabel>
                                <CustomOutlinedInput
                                    id="sales-channel"
                                    fullWidth
                                    value={formData.salesChannel}
                                    disabled
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <CustomFormLabel htmlFor="date">
                                    Order Date
                                </CustomFormLabel>
                                <CustomOutlinedInput
                                    id="date"
                                    fullWidth
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                />
                            </Grid>

                            {/* Row 3 - Product Details */}
                            <Grid item xs={12} sm={6}>
                                <CustomFormLabel htmlFor="pack-type">
                                    Pack Type *
                                </CustomFormLabel>
                                <FormControl fullWidth>
                                    <TextField
                                        select
                                        id="pack-type"
                                        value={formData.packQuantity}
                                        onChange={handlePackTypeChange}
                                        disabled={packTypes.length === 0 || loading}
                                        size="small"
                                    >
                                        <MenuItem value="" disabled>
                                            {packTypes.length === 0 ? 'Loading pack types...' : 'Select pack type'}
                                        </MenuItem>
                                        {packTypes.map((pack) => (
                                            <MenuItem key={pack._id} value={pack.quantity.toString()}>
                                                {pack.name} (Quantity: {pack.quantity})
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </FormControl>
                                {formData.packType && (
                                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                                        Selected: {formData.packType}
                                    </Typography>
                                )}
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <CustomFormLabel htmlFor="units-quantity">
                                    Units Quantity *
                                </CustomFormLabel>
                                <CustomOutlinedInput
                                    id="units-quantity"
                                    fullWidth
                                    type="number"
                                    value={formData.unitsQuantity}
                                    onChange={(e) => handleInputChange('unitsQuantity', e.target.value)}
                                    inputProps={{ 
                                        min: 1,
                                        max: selectedProduct ? selectedProduct.stockLevel : undefined
                                    }}
                                    disabled={loading}
                                />
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                                    Total Items: {parseInt(formData.packQuantity) * parseInt(formData.unitsQuantity)}
                                </Typography>
                            </Grid>

                            {/* Row 4 - Amount Calculation */}
                            <Grid item xs={12} sm={6}>
                                <CustomFormLabel htmlFor="unit-price">
                                    Unit Price
                                </CustomFormLabel>
                                <CustomOutlinedInput
                                    id="unit-price"
                                    fullWidth
                                    value={(selectedProduct?.eachPrice || 0).toFixed(2)}
                                    disabled
                                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <CustomFormLabel htmlFor="total-amount">
                                    Total Amount
                                </CustomFormLabel>
                                <CustomOutlinedInput
                                    id="total-amount"
                                    fullWidth
                                    value={formData.amount.toFixed(2)}
                                    disabled
                                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                />
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                                    Calculation: ${(selectedProduct?.eachPrice || 0).toFixed(2)} × {formData.packQuantity} × {formData.unitsQuantity}
                                </Typography>
                            </Grid>

                            {/* Row 5 - Optional Fields */}
                            <Grid item xs={12} sm={6}>
                                <CustomFormLabel htmlFor="tracking-number">
                                    Tracking Number
                                </CustomFormLabel>
                                <CustomOutlinedInput
                                    id="tracking-number"
                                    fullWidth
                                    value={formData.trackingNumber}
                                    onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                                    placeholder="Optional"
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <CustomFormLabel htmlFor="customer-po">
                                    Customer PO
                                </CustomFormLabel>
                                <CustomOutlinedInput
                                    id="customer-po"
                                    fullWidth
                                    value={formData.customerPO}
                                    onChange={(e) => handleInputChange('customerPO', e.target.value)}
                                    placeholder="Optional"
                                    disabled={loading}
                                />
                            </Grid>

                            {/* Row 6 - Comments (Full Width) */}
                            <Grid item xs={12}>
                                <CustomFormLabel htmlFor="comments">
                                    Comments
                                </CustomFormLabel>
                                <CustomOutlinedInput
                                    id="comments"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={formData.comments}
                                    onChange={(e) => handleInputChange('comments', e.target.value)}
                                    placeholder="Add any comments or notes..."
                                    disabled={loading}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
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
                        <Button onClick={handleBack} disabled={loading}>
                            Back
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} /> : null}
                        >
                            {loading ? 'Creating...' : 'Create Sales Order'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ProductSelectionModal;