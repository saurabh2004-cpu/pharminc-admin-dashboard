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
    CardContent,
    Chip
} from '@mui/material';
import { IconSearch, IconPackage } from '@tabler/icons-react';
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
    const [productGroups, setProductGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Product Selection, 2: Form
    const [packTypes, setPackTypes] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    // Form data state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        documentNumber: documentNo || '',
        customerName: '',
        customerNumber: '',
        salesChannel: '',
        trackingNumber: '',
        shippingAddress: '',
        billingAddress: '',
        customerPO: '',
        itemSku: '',
        packQuantity: '',
        packType: '',
        unitsQuantity: 1,
        amount: 0,
        comments: '',
        discountType: '',
        discountPercentage: '',
        subTotal: 0,
        totalAmount: 0,
        finalAmount: 0
    });

    // Better initialization that preserves customer data
    useEffect(() => {
        if (open && tableData && tableData.length > 0) {
            const firstOrder = tableData[0];
            // console.log("Initializing form with order data:", firstOrder);

            setFormData(prev => ({
                ...prev,
                documentNumber: documentNo || firstOrder.documentNumber || '',
                customerName: firstOrder.customerName || '',
                customerNumber: firstOrder.customerNumber || '',
                salesChannel: firstOrder.salesChannel || '',
                shippingAddress: firstOrder.shippingAddress || '',
                billingAddress: firstOrder.billingAddress || '',
                date: firstOrder.date ? new Date(firstOrder.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                trackingNumber: firstOrder.trackingNumber || '',
                customerPO: firstOrder.customerPO || ''
            }));

            // console.log("Form initialized with customer:", firstOrder.customerName);
        }
    }, [open, tableData, documentNo]);

    // Calculate product group stock (minimum stock among all products)
    const calculateProductGroupStock = (productGroup) => {
        if (!productGroup.products || productGroup.products.length === 0) return 0;

        const minStock = Math.min(
            ...productGroup.products.map(productItem =>
                productItem.product?.stockLevel || 0
            )
        );
        return minStock;
    };

    // Check if item is a product group
    const isProductGroup = (item) => {
        return item.products && Array.isArray(item.products) && item.products.length > 0;
    };

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
                            uniqueProducts.push({
                                ...product,
                                itemType: 'product',
                                displayName: `${product.sku} - ${product.ProductName || 'N/A'}`,
                                calculatedStock: product.stockLevel || 0
                            });
                        }
                    });

                    return uniqueProducts;
                };

                const products = getUniqueProducts(productsData);
                setProductList(products);
            }
        } catch (error) {
            console.error('Error fetching products list:', error);
            setError('Failed to fetch products list');
        } finally {
            setLoading(false);
        }
    };

    // Fetch product groups
    const fetchProductGroups = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/product-group/get-all-product-groups');
            // console.log("response product groups", response);

            if (response.data.statusCode === 200) {
                if (Array.isArray(response.data.data)) {
                    const transformedGroups = response.data.data.map(group => ({
                        ...group,
                        ProductName: group.name || 'Product Group',
                        itemType: 'productGroup',
                        displayName: `${group.sku} - ${group.name} (Product Group)`,
                        calculatedStock: calculateProductGroupStock(group),
                        eachPrice: group.eachPrice || group.price || 0
                    }));

                    setProductGroups(transformedGroups);
                }
            }
        } catch (error) {
            console.error('Error fetching product groups list:', error);
            setError('Error fetching product groups: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Combine products and product groups for display
    useEffect(() => {
        const combinedList = [...productList, ...productGroups];
        setFilteredProducts(combinedList);
    }, [productList, productGroups]);

    // Fetch pack types - handles both products and product groups
    const fetchProductsAvailablePackTypes = async (sku, isProductGroup = false) => {
        if (!sku) return;

        try {
            if (isProductGroup) {
                // For product groups, use default pack types since they don't have individual pack types
                const defaultPackTypes = [
                    { _id: 'default-1', name: 'Each', quantity: 1 },
                    { _id: 'default-2', name: 'Pack of 2', quantity: 2 },
                    { _id: 'default-3', name: 'Pack of 5', quantity: 5 },
                    { _id: 'default-4', name: 'Pack of 10', quantity: 10 }
                ];
                setPackTypes(defaultPackTypes);

                // Auto-select the first pack type
                if (defaultPackTypes.length > 0) {
                    const firstPack = defaultPackTypes[0];
                    const newPackQuantity = parseInt(firstPack.quantity);
                    const currentUnitsQuantity = formData.unitsQuantity || 1;
                    const unitPrice = selectedProduct?.eachPrice || 0;
                    // const totalAmount = unitPrice * (newPackQuantity * currentUnitsQuantity);
                    const totalAmount = unitPrice;

                    setTotalAmount(unitPrice * (newPackQuantity * currentUnitsQuantity));

                    // console.log("total;Amount", unitPrice * (newPackQuantity * currentUnitsQuantity))

                    setFormData(prev => ({
                        ...prev,
                        packQuantity: firstPack.quantity.toString(),
                        packType: firstPack.name,
                        amount: parseFloat(totalAmount.toFixed(2))
                    }));
                }
            } else {
                // For individual products, fetch from API
                const response = await axiosInstance.get(`/products/get-products-pack-types/${sku}`);
                // console.log("Pack types response:", response.data);

                if (response.status === 200 && response.data.data) {
                    setPackTypes(response.data.data);

                    // Auto-select the first pack type if available
                    if (response.data.data.length > 0) {
                        const firstPack = response.data.data[0];
                        const newPackQuantity = parseInt(firstPack.quantity);
                        const currentUnitsQuantity = formData.unitsQuantity || 1;
                        const unitPrice = selectedProduct?.eachPrice || 0;
                        // const totalAmount = unitPrice * (newPackQuantity * currentUnitsQuantity);
                        const totalAmount = unitPrice;

                        setFormData(prev => ({
                            ...prev,
                            packQuantity: firstPack.quantity.toString(),
                            packType: firstPack.name,
                            amount: parseFloat(totalAmount.toFixed(2))
                        }));
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching products pack types:', error);
            // Set default pack types if API fails
            const defaultPackTypes = [
                { _id: 'default-1', name: 'Each', quantity: 1 }
            ];
            setPackTypes(defaultPackTypes);
        }
    };

    // Filter products based on search
    useEffect(() => {
        if (productSearch.trim() === '') {
            const combinedList = [...productList, ...productGroups];
            setFilteredProducts(combinedList);
        } else {
            const filtered = [...productList, ...productGroups].filter(item =>
                item.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
                item.ProductName?.toLowerCase().includes(productSearch.toLowerCase()) ||
                item.name?.toLowerCase()?.includes(productSearch?.toLowerCase()) ||
                item.displayName?.toLowerCase().includes(productSearch.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
    }, [productSearch, productList, productGroups]);

    // Unified calculation function
    const calculateValues = (packQty, unitQty, discType, discPct, product = selectedProduct) => {
        const basePrice = product?.eachPrice || 0;
        let adjustedPrice = basePrice;
        const pct = parseFloat(discPct);

        if (!isNaN(pct)) {
            if (discType === 'Pricing Group Discount') {
                // +10 increases, -10 decreases
                adjustedPrice = basePrice + (basePrice * pct / 100);
            } else if (discType === 'Item Discount' || discType === 'Custom Discount') {
                // Positive only, always deducted
                adjustedPrice = basePrice - (basePrice * Math.abs(pct) / 100);
            }
        }

        if (adjustedPrice < 0) adjustedPrice = 0;

        const quantity = (parseInt(packQty) || 1) * (parseInt(unitQty) || 1);
        const total = adjustedPrice * quantity;

        return {
            unitPrice: parseFloat(adjustedPrice.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
    };

    // Improved amount calculation function
    const recalculateAmount = (packQty, unitQty, product = selectedProduct) => {
        // This is kept for compatibility with existing calls, but using state for discount
        const { unitPrice, total } = calculateValues(
            packQty,
            unitQty,
            formData.discountType,
            formData.discountPercentage,
            product
        );

        setTotalAmount(total);
        return unitPrice;
    };

    // Improved product selection with immediate amount calculation
    const handleProductSelect = (product) => {
        // console.log("Product selected:", product);
        setSelectedProduct(product);

        // Reset discount fields when product changes
        const initialPackQuantity = formData.packQuantity || '1';
        const initialUnitsQuantity = formData.unitsQuantity || 1;

        // Calculate initial amount (no discount initially)
        const { unitPrice, total } = calculateValues(
            initialPackQuantity,
            initialUnitsQuantity,
            '',
            '',
            product
        );

        setFormData(prev => ({
            ...prev,
            itemSku: product.sku || '',
            amount: unitPrice,
            discountType: '',
            discountPercentage: '',
            subTotal: total,
            totalAmount: total,
            finalAmount: total
        }));

        setTotalAmount(total);

        // console.log("Initial amount set to:", initialAmount);

        // Fetch pack types for the selected product
        const isGroup = isProductGroup(product);
        fetchProductsAvailablePackTypes(product.sku, isGroup);
    };

    // Improved form input changes with better amount recalculation
    const handleInputChange = (field, value) => {
        // Discount Validation
        if (field === 'discountPercentage') {
            if (formData.discountType === 'Item Discount' || formData.discountType === 'Custom Discount') {
                if (parseFloat(value) < 0) return; // Prevent negative input
            }
        }

        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Improved pack type change handler
    const handlePackTypeChange = (e) => {
        const selectedPackQuantity = e.target.value;
        const selectedPack = packTypes.find(pack => pack.quantity.toString() === selectedPackQuantity.toString());

        if (selectedPack) {
            setFormData(prev => ({
                ...prev,
                packQuantity: selectedPack.quantity.toString(),
                packType: selectedPack.name
            }));
        }
    };

    // Real-time calculation effect
    useEffect(() => {
        if (step !== 2 || !selectedProduct) return;

        const basePrice = selectedProduct.eachPrice || 0;
        let adjustedPrice = basePrice;
        const pct = parseFloat(formData.discountPercentage);
        const discType = formData.discountType;

        if (!isNaN(pct) && discType) {
            if (discType === 'Pricing Group Discount') {
                // Allow positive and negative
                adjustedPrice = basePrice + (basePrice * pct / 100);
            } else if (discType === 'Item Discount' || discType === 'Custom Discount') {
                // Only positive, deduct
                const absPct = Math.abs(pct);
                adjustedPrice = basePrice - (basePrice * absPct / 100);
            }
        }

        // Safety check
        if (adjustedPrice < 0) adjustedPrice = 0;

        const packQty = parseInt(formData.packQuantity) || 1;
        const unitsQty = parseInt(formData.unitsQuantity) || 1;

        // Total Amount = Discounted Unit Price * Pack Qty * Units Qty
        const quantityMultiplier = packQty * unitsQty;
        const total = adjustedPrice * quantityMultiplier;

        setFormData(prev => {
            // Avoid infinite loop by checking if values actually changed
            if (
                prev.amount === parseFloat(adjustedPrice.toFixed(2)) &&
                prev.totalAmount === parseFloat(total.toFixed(2))
            ) {
                return prev;
            }

            return {
                ...prev,
                amount: parseFloat(adjustedPrice.toFixed(2)),
                totalAmount: parseFloat(total.toFixed(2)),
                finalAmount: parseFloat(total.toFixed(2)),
                subTotal: parseFloat(total.toFixed(2))
            };
        });

        setTotalAmount(total);

    }, [
        formData.discountType,
        formData.discountPercentage,
        formData.packQuantity,
        formData.unitsQuantity,
        selectedProduct,
        step
    ]);

    // Improved form submission with better validation
    const handleSubmit = async () => {
        // console.log("Submitting form data:", formData);
        // console.log("Selected product:", selectedProduct);

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
        const availableStock = isProductGroup(selectedProduct)
            ? calculateProductGroupStock(selectedProduct)
            : selectedProduct.stockLevel;

        if (selectedProduct && availableStock < totalItems) {
            setError(`Insufficient stock. Required: ${totalItems}, Available: ${availableStock}`);
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
                comments: formData.comments || '',
                isProductGroup: isProductGroup(selectedProduct),
                customerNumber: formData.customerNumber,
                discountType: formData.discountType || null,
                discountPercentages: formData.discountPercentage ? formData.discountPercentage.toString() : '0',
                subTotal: parseFloat(formData.subTotal || formData.totalAmount),
                totalAmount: parseFloat(formData.totalAmount),
                finalAmount: parseFloat(formData.finalAmount || formData.totalAmount)
            };

            // console.log("Sending payload to API:", payload);

            const res = await axiosInstance.post('/sales-order/add-product-to-sales-order', payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // console.log("Create sales order response:", res.data);

            if (res.data.statusCode === 200) {
                // console.log("Sales order created successfully:", res.data.data);

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
            fetchProductGroups();
            setError('');
            setStep(1);
        }
    }, [open]);

    // Improved modal close handler
    const handleClose = () => {
        setStep(1);
        setSelectedProduct(null);
        setProductSearch('');
        setError('');
        setPackTypes([]);
        // Don't reset form data completely - preserve customer info for next addition
        setFormData(prev => ({
            ...prev,
            itemSku: '',
            packQuantity: '',
            packType: '',
            unitsQuantity: 1,
            amount: 0,
            comments: '',
            discountType: '',
            discountPercentage: '',
            subTotal: 0,
            totalAmount: 0,
            finalAmount: 0
        }));
        onClose();
    };

    // Handle next step
    const handleNext = () => {
        if (!selectedProduct) {
            setError('Please select a product');
            return;
        }

        // Ensure amount is calculated before proceeding
        if (formData.amount === 0) {
            const calculatedAmount = recalculateAmount(
                formData.packQuantity || '1',
                formData.unitsQuantity || 1
            );
            setFormData(prev => ({ ...prev, amount: calculatedAmount }));
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
                        {step === 1 ? 'Select Product' : 'Add Product to Sales Order'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {step === 1 ? 'Choose a product or product group to add to sales order' : `Add product to order #${documentNo}`}
                    </Typography>
                    {step === 2 && formData.customerName && (
                        <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                            Customer: {formData.customerName}
                        </Typography>
                    )}
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ overflowY: 'auto', p: 3 }}>
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
                                            <TableCell width="100px">Type</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredProducts.map((product) => {
                                            const isGroup = isProductGroup(product);
                                            const stockLevel = isGroup
                                                ? calculateProductGroupStock(product)
                                                : product.stockLevel;

                                            return (
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
                                                            color={stockLevel > 0 ? 'success.main' : 'error.main'}
                                                        >
                                                            {stockLevel}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {isGroup ? (
                                                            <Chip
                                                                label="Group"
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                                icon={<IconPackage size={14} />}
                                                            />
                                                        ) : (
                                                            <Chip
                                                                label="Product"
                                                                size="small"
                                                                color="default"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {filteredProducts.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
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
                    // Form Step
                    <Box>
                        {/* Selected Product Info */}
                        {selectedProduct && (
                            <Card variant="outlined" sx={{ mb: 3 }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                        <Typography variant="h6" color="primary">
                                            Selected {isProductGroup(selectedProduct) ? 'Product Group' : 'Product'}
                                        </Typography>
                                        <Chip
                                            label={isProductGroup(selectedProduct) ? "Product Group" : "Individual Product"}
                                            color={isProductGroup(selectedProduct) ? "primary" : "default"}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
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
                                                <strong>Base Price:</strong> ${(selectedProduct.eachPrice || 0).toFixed(2)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2">
                                                <strong>Available Stock:</strong> {
                                                    isProductGroup(selectedProduct)
                                                        ? calculateProductGroupStock(selectedProduct)
                                                        : selectedProduct.stockLevel
                                                }
                                            </Typography>
                                        </Grid>
                                        {isProductGroup(selectedProduct) && selectedProduct.products && (
                                            <Grid item xs={12}>
                                                <Typography variant="body2">
                                                    <strong>Products in Group:</strong> {selectedProduct.products.length}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}

                        <Divider sx={{ mb: 3 }} />

                        {/* Order Form - 2 Column Grid */}
                        <Grid container spacing={2}>
                            {/* Row 1: Customer Context */}
                            <Grid item xs={12} md={6}>
                                <CustomFormLabel htmlFor="customer-name">Customer Name</CustomFormLabel>
                                <CustomOutlinedInput
                                    id="customer-name"
                                    fullWidth
                                    value={formData.customerName}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomFormLabel htmlFor="sales-channel">Sales Channel</CustomFormLabel>
                                <CustomOutlinedInput
                                    id="sales-channel"
                                    fullWidth
                                    value={formData.salesChannel}
                                    disabled
                                />
                            </Grid>

                            {/* Row 2: Quantity Inputs */}
                            <Grid item xs={12} md={6}>
                                <CustomFormLabel htmlFor="pack-type">Pack Quantity *</CustomFormLabel>
                                {isProductGroup(selectedProduct) ? (
                                    <TextField
                                        select
                                        id="pack-type"
                                        value={formData.packQuantity}
                                        onChange={handlePackTypeChange}
                                        disabled={packTypes.length === 0 || loading}
                                        fullWidth
                                        size="small"
                                    >
                                        {packTypes.map((pack) => (
                                            <MenuItem key={pack._id} value={pack.quantity.toString()}>
                                                {pack.name} (Qty: {pack.quantity})
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                ) : (
                                    <TextField
                                        select
                                        id="pack-type"
                                        value={formData.packQuantity}
                                        onChange={handlePackTypeChange}
                                        disabled={packTypes.length === 0 || loading}
                                        fullWidth
                                        size="small"
                                    >
                                        {packTypes.map((pack) => (
                                            <MenuItem key={pack._id} value={pack.quantity.toString()}>
                                                {pack.name} (Qty: {pack.quantity})
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <CustomFormLabel htmlFor="units-quantity">Units Quantity *</CustomFormLabel>
                                <CustomOutlinedInput
                                    id="units-quantity"
                                    type="number"
                                    fullWidth
                                    value={formData.unitsQuantity}
                                    onChange={(e) => handleInputChange('unitsQuantity', e.target.value)}
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>

                            {/* Row 3: Discount Inputs */}
                            <Grid item xs={12} md={6}>
                                <CustomFormLabel htmlFor="discount-type">Discount Type</CustomFormLabel>
                                <TextField
                                    select
                                    id="discount-type"
                                    fullWidth
                                    value={formData.discountType}
                                    onChange={(e) => handleInputChange('discountType', e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    <MenuItem value="Pricing Group Discount">Pricing Group Discount</MenuItem>
                                    <MenuItem value="Item Discount">Item Discount</MenuItem>
                                    <MenuItem value="Custom Discount">Custom Discount</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <CustomFormLabel htmlFor="discount-percentage">Discount (%)</CustomFormLabel>
                                <CustomOutlinedInput
                                    id="discount-percentage"
                                    type="number"
                                    fullWidth
                                    value={formData.discountPercentage}
                                    onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                                    disabled={!formData.discountType}
                                    placeholder={!formData.discountType ? "Select type first" : "0"}
                                    endAdornment={<InputAdornment position="end">%</InputAdornment>}
                                />
                            </Grid>

                            {/* Row 4: Calculated Prices (Read-Only) */}
                            <Grid item xs={12} md={6}>
                                <CustomFormLabel htmlFor="unit-price">Unit Price (Discounted)</CustomFormLabel>
                                <CustomOutlinedInput
                                    id="unit-price"
                                    fullWidth
                                    value={formData.amount?.toFixed(2) || '0.00'}
                                    disabled
                                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <CustomFormLabel htmlFor="total-amount">Total Amount</CustomFormLabel>
                                <CustomOutlinedInput
                                    id="total-amount"
                                    fullWidth
                                    value={formData.totalAmount?.toFixed(2) || '0.00'}
                                    disabled
                                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                    sx={{ fontWeight: 'bold' }}
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
                            disabled={loading || formData.totalAmount <= 0}
                            startIcon={loading ? <CircularProgress size={16} /> : null}
                        >
                            {loading ? 'Adding...' : 'Add Product'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ProductSelectionModal;