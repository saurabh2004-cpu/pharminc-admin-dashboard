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
import { useNavigate } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';

const CreateCustomerSpecificAmounts = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        customers: [], // Array of customer _ids
        product: '', // Product _id
        basePrice: 0,
        actualPercentage: '',
        discountPercentage: '',
        actualPrice: 0,
        discountedPrice: 0
    });
    const [error, setError] = React.useState('');
    const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const navigate = useNavigate();
    const [customers, setCustomers] = React.useState([]);
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    // Calculate actual price based on basePrice and actual percentage
    const calculateActualPrice = (basePrice, actualPercentage) => {
        if (!basePrice || !actualPercentage) return 0;
        const base = parseFloat(basePrice);
        const percentage = parseFloat(actualPercentage);
        return base + (base * percentage / 100);
    };

    // Calculate discounted price based on actual price and discount percentage
    const calculateDiscountedPrice = (actualPrice, discountPercentage) => {
        if (!actualPrice || !discountPercentage) return 0;
        const actual = parseFloat(actualPrice);
        const discount = parseFloat(discountPercentage);
        return actual - (actual * discount / 100);
    };

    // Handle multiple customer selection
    const handleCustomerChange = (e) => {
        const selectedCustomerIds = e.target.value; // Array of _id values
        setFormData(prev => ({
            ...prev,
            customers: selectedCustomerIds
        }));
    };

    // Handle actual percentage change
    const handleActualPercentageChange = (value) => {
        const actualPrice = calculateActualPrice(formData.basePrice, value);
        const discountedPrice = calculateDiscountedPrice(actualPrice, formData.discountPercentage || 0);

        setFormData(prev => ({
            ...prev,
            actualPercentage: value,
            actualPrice: actualPrice,
            discountedPrice: discountedPrice
        }));
    };

    // Handle discount percentage change
    const handleDiscountPercentageChange = (value) => {
        const discountedPrice = calculateDiscountedPrice(formData.actualPrice, value);

        setFormData(prev => ({
            ...prev,
            discountPercentage: value,
            discountedPrice: discountedPrice
        }));
    };

    // Handle product selection and update base price
    const handleProductChange = (e) => {
        const selectedProductId = e.target.value; // Product _id
        const selectedProduct = products.find(p => p._id === selectedProductId);

        if (selectedProduct) {
            const basePrice = selectedProduct.eachPrice || 0;
            const actualPrice = calculateActualPrice(basePrice, formData.actualPercentage || 0);
            const discountedPrice = calculateDiscountedPrice(actualPrice, formData.discountPercentage || 0);

            setFormData(prev => ({
                ...prev,
                product: selectedProductId, // Store product _id
                basePrice: basePrice,
                actualPrice: actualPrice,
                discountedPrice: discountedPrice
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                product: '',
                basePrice: 0,
                actualPrice: 0,
                discountedPrice: 0
            }));
        }
    };

    const handleSubmit = async () => {
        // Form validation
        if (!formData.name || formData.name.trim() === '') {
            setError('Please enter a group name');
            return;
        }
        if (!formData.customers || formData.customers.length === 0) {
            setError('Please select at least one customer');
            return;
        }
        if (!formData.product) {
            setError('Please select a product');
            return;
        }
        if (!formData.actualPercentage) {
            setError('Please enter actual price percentage');
            return;
        }
        if (!formData.discountPercentage) {
            setError('Please enter discount percentage');
            return;
        }

        if (isNaN(formData.actualPercentage) || parseFloat(formData.actualPercentage) < 0) {
            setError('Please enter a valid actual price percentage');
            return;
        }

        if (isNaN(formData.discountPercentage) || parseFloat(formData.discountPercentage) < 0 || parseFloat(formData.discountPercentage) > 100) {
            setError('Please enter a valid discount percentage between 0 and 100');
            return;
        }

        try {
            setLoading(true);

            // Prepare data according to schema
            const discountData = {
                name: formData.name,
                customers: formData.customers, // Array of customer _ids
                product: formData.product, // Product _id
                basePrice: parseFloat(formData.basePrice),
                actualPrice: parseFloat(formData.actualPrice),
                discountedPrice: parseFloat(formData.discountedPrice)
            };

            // console.log("Sending data:", discountData);

            const res = await axiosInstance.post('/customer-secific-amounts/create-customer-specific-amount', discountData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // console.log("Bulk discount creation response:", res.data);

            if (res.data.statusCode === 200) {
                setFormData({
                    name: '',
                    customers: [],
                    product: '',
                    basePrice: 0,
                    actualPercentage: '',
                    discountPercentage: '',
                    actualPrice: 0,
                    discountedPrice: 0
                });
                setError('Discount group created successfully!');
                setTimeout(() => {
                    navigate('/dashboard/customer-specific-amounts/list');
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred');
            console.error(error.message);
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
            formDataForUpload.append('customerSpecificAmounts', selectedFile);

            const res = await axiosInstance.post('/customer-secific-amounts/import-customer-specific-amounts', formDataForUpload, {
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
                    navigate('/dashboard/customer-specific-amounts/list');
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
            // console.log("response customers", response);

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

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/products/get-all-products-dashboard');
            console.log("response products", response);

            if (response.data.statusCode === 200) {
                const productsArray = Array.isArray(response.data.data)
                    ? response.data.data
                    : response.data.data?.docs || [];

                const uniqueProducts = productsArray.filter(
                    (product, index, self) =>
                        index === self.findIndex((p) => p._id === product._id)
                );

                setProducts(uniqueProducts);
            }
        } catch (error) {
            console.error('Error fetching products list:', error);
            setError('Error fetching products: ' + error.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                fetchCustomers(),
                fetchProducts()
            ]);
        };
        fetchData();
    }, []);

    // Get selected product details for display
    const selectedProduct = products.find(p => p._id === formData.product);

    return (
        <div>
            <Grid container spacing={2}>
                {/* Group Name */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="group-name" sx={{ mt: 2 }}>
                        Group Name
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="group-name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter group name (e.g., VIP Customers Discount)"
                    />
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
                </Grid>

                {/* Product Selection */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="product-select" sx={{ mt: 2 }}>
                        Select Product
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="product-select"
                            value={formData.product}
                            onChange={handleProductChange}
                            disabled={loading || !Array.isArray(products) || products.length === 0}
                            displayEmpty
                            renderValue={(selected) => {
                                if (!selected) {
                                    return 'Select a product';
                                }
                                const product = products.find(p => p._id === selected);
                                return product ? `${product.sku} - ${product.ProductName || product.name || ''}` : 'Select a product';
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
                                {!Array.isArray(products) || products.length === 0 ? 'Loading products...' : 'Select a product'}
                            </MenuItem>
                            {Array.isArray(products) && products.map((product) => (
                                <MenuItem key={product._id} value={product._id}>
                                    <ListItemText
                                        primary={`${product.sku} - ${product.ProductName || product.name || ''}`}
                                        secondary={`Base Price: ₹${product.eachPrice}`}
                                    />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Base Price Display */}
                {formData.product && selectedProduct && (
                    <Grid size={12}>
                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="body1">
                                Selected Product: <strong>{selectedProduct.sku} - {selectedProduct.ProductName || selectedProduct.name}</strong>
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                Base Price: <strong>₹{formData.basePrice.toFixed(2)}</strong>
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {/* Actual Price Percentage */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="actual-percentage" sx={{ mt: 2 }}>
                        Actual Price Increase (%)
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="actual-percentage"
                        fullWidth
                        type="number"
                        inputProps={{ min: 0, step: 0.01 }}
                        value={formData.actualPercentage}
                        onChange={(e) => handleActualPercentageChange(e.target.value)}
                        placeholder="Enter percentage"
                        endAdornment={<InputAdornment position="end">%</InputAdornment>}
                    />
                </Grid>

                {/* Actual Price Display */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="actual-price" sx={{ mt: 2 }}>
                        Actual Price
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="actual-price"
                        fullWidth
                        type="number"
                        value={formData.actualPrice.toFixed(2)}
                        disabled
                        startAdornment={<InputAdornment position="start">₹</InputAdornment>}
                    />
                </Grid>

                {/* Discount Percentage */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="discount-percentage" sx={{ mt: 2 }}>
                        Discount Percentage (%)
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="discount-percentage"
                        fullWidth
                        type="number"
                        inputProps={{ min: 0, max: 100, step: 0.01 }}
                        value={formData.discountPercentage}
                        onChange={(e) => handleDiscountPercentageChange(e.target.value)}
                        placeholder="Enter discount percentage"
                        endAdornment={<InputAdornment position="end">%</InputAdornment>}
                    />
                </Grid>

                {/* Discounted Price Display */}
                <Grid size={6}>
                    <CustomFormLabel htmlFor="discounted-price" sx={{ mt: 2 }}>
                        Final Discounted Price
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="discounted-price"
                        fullWidth
                        type="number"
                        value={formData.discountedPrice.toFixed(2)}
                        disabled
                        startAdornment={<InputAdornment position="start">₹</InputAdornment>}
                    />
                </Grid>

                {/* Pricing Summary */}
                {formData.customers.length > 0 && formData.product && formData.actualPercentage && (
                    <Grid size={12}>
                        <Box sx={{ mt: 3, p: 3, backgroundColor: '#e3f2fd', borderRadius: 2, border: '2px solid #2196f3' }}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                                Pricing Summary for All Selected Customers
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid size={12}>
                                    <Typography variant="body2" color="textSecondary">
                                        Number of Customers:
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold" color="primary">
                                        {formData.customers.length}
                                    </Typography>
                                </Grid>

                                <Grid size={12} sm={4}>
                                    <Typography variant="body2" color="textSecondary">
                                        Base Price:
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        ₹{formData.basePrice.toFixed(2)}
                                    </Typography>
                                </Grid>

                                <Grid size={12} sm={4}>
                                    <Typography variant="body2" color="textSecondary">
                                        After {formData.actualPercentage}% Increase:
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold" color="warning.main">
                                        ₹{formData.actualPrice.toFixed(2)}
                                    </Typography>
                                </Grid>

                                <Grid size={12} sm={4}>
                                    <Typography variant="body2" color="textSecondary">
                                        After {formData.discountPercentage}% Discount:
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold" color="success.main">
                                        ₹{formData.discountedPrice.toFixed(2)}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 2, p: 1, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 1 }}>
                                <Typography variant="caption" color="textSecondary">
                                    Calculation: ₹{formData.basePrice.toFixed(2)} + {formData.actualPercentage}% = ₹{formData.actualPrice.toFixed(2)} - {formData.discountPercentage}% = ₹{formData.discountedPrice.toFixed(2)}
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                    Selected Customers ({formData.customers.length}):
                                </Typography>
                                <Box sx={{ maxHeight: 150, overflow: 'auto', p: 1, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 1 }}>
                                    {formData.customers.map((customerId, index) => {
                                        const customer = customers.find(c => c._id === customerId);
                                        return (
                                            <Typography key={customerId} variant="body2" sx={{ py: 0.5 }}>
                                                {index + 1}. {customer?.customerName || customer?.name || customerId} - ₹{formData.discountedPrice.toFixed(2)}
                                            </Typography>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                )}

                {/* Example Calculation */}
                <Grid size={12}>
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff3cd', borderRadius: 1, border: '1px solid #ffeaa7' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#856404', fontWeight: 'bold' }}>
                            💡 Example Calculation:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#856404' }}>
                            Base Price: ₹10 + Actual 20% = ₹12 → Discount 10% = ₹10.80
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#856404', fontStyle: 'italic', display: 'block', mt: 1 }}>
                            All selected customers will receive the same pricing for this product
                        </Typography>
                    </Box>
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
                        {loading ? 'Creating...' : 'Create Discount Group'}
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
                    Import Customer Specific Amounts from CSV
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Select a CSV file to import multiple discount groups at once.
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

export default CreateCustomerSpecificAmounts;