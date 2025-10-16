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

const CreateBulkDiscounts = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        product: '', 
        customers: [], 
        discount: null,
    });
    const [error, setError] = React.useState('');
    const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const navigate = useNavigate();
    const [customers, setCustomers] = React.useState([]);
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

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

    // Handle product selection
    const handleProductChange = (e) => {
        const selectedProductId = e.target.value;
        setFormData(prev => ({
            ...prev,
            product: selectedProductId
        }));
    };

    // Handle discount change
    const handleDiscountChange = (value) => {
        const discountValue = parseFloat(value) || 0;
        setFormData(prev => ({
            ...prev,
            discount: discountValue
        }));
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
        if (!formData.discount || formData.discount <= 0) {
            setError('Please enter a valid discount percentage');
            return;
        }
        if (formData.discount > 100) {
            setError('Discount cannot exceed 100%');
            return;
        }

        try {
            setLoading(true);

            // Prepare data that matches backend schema
            const submitData = {
                name: formData.name,
                product: formData.product,
                customers: formData.customers,
                discount: formData.discount
            };

            console.log("Submitting data:", submitData);

            const res = await axiosInstance.post('/bulk-discounts/create-bulk-discount', submitData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Bulk discount creation response:", res.data);

            if (res.data.statusCode === 200 || res.data.statusCode === 201) {
                setFormData({
                    name: '',
                    customers: [],
                    product: '',
                    discount: 0
                });
                setError('Bulk discount created successfully!');
                setTimeout(() => {
                    navigate('/dashboard/bulk-discounts/list');
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred');
            console.error('Error creating bulk discount:', error);
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
            formDataForUpload.append('bulkDiscounts', selectedFile);

            const res = await axiosInstance.post('/bulk-discount/import-bulk-discounts', formDataForUpload, {
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
                    navigate('/dashboard/bulk-discounts/list');
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
                                if (allCustomersSelected) {
                                    return `All Customers (${customers.length})`;
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
                            
                            {/* Select All Option */}
                            {Array.isArray(customers) && customers.length > 0 && (
                                <MenuItem value="select-all">
                                    <Checkbox
                                        checked={allCustomersSelected}
                                        indeterminate={formData.customers.length > 0 && !allCustomersSelected}
                                    />
                                    <ListItemText
                                        primary="Select All Customers"
                                        secondary={`${customers.length} customers available`}
                                    />
                                </MenuItem>
                            )}

                            {/* Customer List */}
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
                                        secondary={`Base Price: ₹${product.eachPrice || 'N/A'}`}
                                    />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Selected Product Info */}
                {formData.product && selectedProduct && (
                    <Grid size={12}>
                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="body1">
                                Selected Product: <strong>{selectedProduct.sku} - {selectedProduct.ProductName || selectedProduct.name}</strong>
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                Base Price: <strong>₹{selectedProduct.eachPrice || 'N/A'}</strong>
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {/* Discount Percentage */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="discount" sx={{ mt: 2 }}>
                        Discount Percentage (%)
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="discount"
                        fullWidth
                        type="text"
                        inputProps={{ min: 1, max: 100, step: 0.01 }}
                        value={formData.discount}
                        onChange={(e) => handleDiscountChange(e.target.value)}
                        placeholder="Enter discount percentage (1-100)"
                        endAdornment={<InputAdornment position="end">%</InputAdornment>}
                    />
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                        Enter a discount percentage between 1% and 100%
                    </Typography>
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
                        {loading ? 'Creating...' : 'Create Bulk Discount'}
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
                    Import Bulk Discounts from CSV
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Select a CSV file to import multiple bulk discounts at once.
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

export default CreateBulkDiscounts;