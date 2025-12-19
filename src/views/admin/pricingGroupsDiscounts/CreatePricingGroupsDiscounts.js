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
    Select
} from '@mui/material';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconUpload, IconFileImport } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';
import { Autocomplete, TextField } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const CreatePricingGroupsDiscounts = () => {
    const [formData, setFormData] = React.useState({
        customerId: '',
        percentage: '',
        productSku: ''
    });
    const [error, setError] = React.useState('');
    const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const navigate = useNavigate();
    const [pricingGroups, setPricingGroups] = React.useState([]);
    const [customers, setCustomers] = React.useState([]);
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async () => {
        // Form validation
        if (!formData.customerId || !formData.percentage || !formData.productSku) {
            setError('Please fill in all required fields');
            return;
        }

        if (isNaN(formData.percentage) || parseFloat(formData.percentage) <= 0 || parseFloat(formData.percentage) > 100) {
            setError('Please enter a valid percentage between 0 and 100');
            return;
        }

        try {
            setLoading(true);
            const res = await axiosInstance.post('/item-based-discount/create-item-based-discount', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // console.log("Pricing group discount creation response:", res.data);

            if (res.data.statusCode === 200) {
                setFormData({
                    pricingGroupId: '',
                    customerId: '',
                    percentage: '',
                    productSku: ''
                });
                setError('Pricing group discount created successfully!');
                setTimeout(() => {
                    navigate('/dashboard/items-based-discounts/list');
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

    // const handlePricingGroupChange = (e) => {
    //     setFormData({ ...formData, pricingGroupId: e.target.value });
    // };

    const handleCustomerChange = (e) => {
        setFormData({ ...formData, customerId: e.target.value });
    };

    const handleProductSkuChange = (e) => {
        setFormData({ ...formData, productSku: e.target.value });
    };

    const handleImportCsvFile = async () => {
        if (!selectedFile) {
            setError('Please select a CSV file first');
            return;
        }

        try {
            setLoading(true);
            const formDataForUpload = new FormData();
            // Correct field name for pricing groups discounts
            formDataForUpload.append('discountGroups', selectedFile);

            // Correct API endpoint for pricing groups discounts import
            const res = await axiosInstance.post('/item-based-discount/import-items-based-discount', formDataForUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // console.log("CSV imported", res.data);

            if (res.data.statusCode === 200) {
                setCsvDialogOpen(false);
                setSelectedFile(null);
                setError('CSV imported successfully!');
                // Reset file input
                const fileInput = document.getElementById('csv-file-input');
                if (fileInput) fileInput.value = '';

                setTimeout(() => {
                    navigate('/dashboard/items-based-discounts/list');
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

    const fetchPricingGroups = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/pricing-groups/get-pricing-groups');
            // console.log("response pricing groups", response);

            if (response.data.statusCode === 200) {
                // Ensure we always set an array
                setPricingGroups(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error('Error fetching pricing groups list:', error);
            setError('Error fetching pricing groups: ' + error.message);
            setPricingGroups([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/get-all-users');
            // console.log("response customers", response);

            if (response.data.statusCode === 200) {
                // Ensure we always set an array
                setCustomers(Array.isArray(response.data.data) ? response.data.data : []);
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
            // console.log("response products", response);

            if (response.data.statusCode === 200) {
                // Correct: products are inside response.data.data (not .docs)
                const productsArray = Array.isArray(response.data.data)
                    ? response.data.data
                    : [];

                const uniqueProducts = productsArray.filter(
                    (product, index, self) =>
                        index === self.findIndex((p) => p.sku === product.sku)
                );

                setProducts((prev) => [...prev, ...uniqueProducts]);
            }
        } catch (error) {
            console.error('Error fetching products list:', error);
            setError('Error fetching products: ' + error.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

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
                    }));

                    setProducts((prevProducts) => [...prevProducts, ...transformedGroups]);

                }
            }
        } catch (error) {
            console.error('Error fetching product groups list:', error);
            setError('Error fetching product groups: ' + error.message);
            // setProductGroups([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                fetchPricingGroups(),
                fetchCustomers(),
                fetchProducts(),
                fetchProductGroups()
            ]);
        };
        fetchData();
    }, []);

    const BCrumb = [
        {
            to: '/',
            title: 'Home',
        },
        {
            title: 'Create Item Discounts',
        },
    ];

    return (
        <div>
            <Breadcrumb title="Create Item Discounts" items={BCrumb} />
            <Grid container>
                <Grid size={12} marginTop={4}>
                    <CustomFormLabel
                        htmlFor="customer-select"
                        sx={{ mt: 2 }}
                    >
                        Select Customer
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <Autocomplete
                            id="customer-select"
                            value={customers.find(customer => customer.customerId === formData.customerId) || null}
                            onChange={(event, newValue) => {
                                handleCustomerChange({
                                    target: {
                                        value: newValue ? newValue.customerId : ''
                                    }
                                });
                            }}
                            options={Array.isArray(customers) ? customers : []}
                            getOptionLabel={(option) => `${option.customerId}${option.customerName ? ' - ' + option.customerName : ''}`}
                            isOptionEqualToValue={(option, value) => option.customerId === value.customerId}
                            disabled={loading || !Array.isArray(customers) || customers.length === 0}
                            noOptionsText={!Array.isArray(customers) || customers.length === 0 ? 'Loading customers...' : 'No customers found'}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={!Array.isArray(customers) || customers.length === 0 ? 'Loading customers...' : 'Search and select a customer'}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.87)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                        },
                                    }}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>

                {/* Product SKU Selection */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="product-sku-select"
                        sx={{ mt: 2 }}
                    >
                        Select Product SKU
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <Autocomplete
                            id="product-sku-select"
                            value={products.find(item => item.sku === formData.productSku) || null}
                            onChange={(event, newValue) => {
                                handleProductSkuChange({
                                    target: {
                                        value: newValue ? newValue.sku : ''
                                    }
                                });
                            }}
                            options={Array.isArray(products) ? products : []}
                            getOptionLabel={(option) => {
                                // Handle both product and product group structures
                                if (option.ProductName) {
                                    return `${option.sku} - ${option.ProductName}`;
                                } else if (option.name) {
                                    return `${option.sku} - ${option.name}${option.type === 'productGroup' ? ' (Product Group)' : ''}`;
                                }
                                return option.sku;
                            }}
                            isOptionEqualToValue={(option, value) => option.sku === value.sku}
                            disabled={loading || !Array.isArray(products) || products.length === 0}
                            noOptionsText={!Array.isArray(products) || products.length === 0 ? 'Loading products...' : 'No products found'}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={!Array.isArray(products) || products.length === 0 ? 'Loading products...' : 'Search and select a product'}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.87)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                        },
                                    }}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>

                {/* Discount Percentage */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="discount-percentage"
                        sx={{ mt: 2 }}
                    >
                        Discount Percentage (%)
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="discount-percentage"
                        fullWidth
                        type="number"
                        inputProps={{ min: 0, max: 100, step: 0.01 }}
                        value={formData.percentage}
                        onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                        placeholder="Enter discount percentage (0-100)"
                    />
                </Grid>

                {/* Error/Success Message */}
                {error && (
                    <Grid size={12} mt={2}>
                        <div style={{
                            color: error.includes('success') ? 'green' : 'red',
                            padding: '8px',
                            borderRadius: '4px',
                            backgroundColor: error.includes('success') ? '#f0f9ff' : '#fef2f2',
                            border: `1px solid ${error.includes('success') ? '#22c55e' : '#ef4444'}`
                        }}>
                            {error}
                        </div>
                    </Grid>
                )}

                {/* Action Buttons */}
                <Grid item={12} mt={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{ mr: 2, backgroundColor: '#2E2F7F' }}
                    >
                        {loading ? 'Creating...' : 'Submit'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setCsvDialogOpen(true)}
                        disabled={loading}
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
                    Import Item Discounts from CSV
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Select a CSV file to import multiple items discounts at once.
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

export default CreatePricingGroupsDiscounts;