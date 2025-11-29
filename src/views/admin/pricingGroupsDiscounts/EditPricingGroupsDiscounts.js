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
import { useNavigate, useParams } from 'react-router';
import { Autocomplete, TextField } from '@mui/material';

const EditPricingGroupsDiscounts = () => {
    const [formData, setFormData] = React.useState({
        customerId: '',
        productSku: '',
        percentage: '',
    });
    const [error, setError] = React.useState('');
    const navigate = useNavigate();
    const [pricingGroups, setPricingGroups] = React.useState([]);
    const [customers, setCustomers] = React.useState([]);
    const [productList, setProductList] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [dataLoaded, setDataLoaded] = React.useState(false); // Track if all data is loaded
    const { id } = useParams();

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
            const res = await axiosInstance.put(`/item-based-discount/update-items-based-discount/${id}`, formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Pricing group discount update response:", res.data);

            if (res.data.statusCode === 200) {
                setError('Item discount updated successfully!');
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

    const handlePricingGroupChange = (e) => {
        setFormData({ ...formData, pricingGroupId: e.target.value });
    };

    const handleCustomerChange = (e) => {
        setFormData({ ...formData, customerId: e.target.value });
    };

    const handleProductSkuChange = (e) => {
        setFormData({ ...formData, productSku: e.target.value });
    };

    const fetchPricingGroupDiscountBYId = async (id) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/item-based-discount/get-items-based-discount/${id}`);
            console.log("response items based discount by id", response);

            if (response.data.statusCode === 200 && response.data.data) {
                const discountData = response.data.data;

                // Set form data with proper IDs for dropdowns
                setFormData({
                    // pricingGroupId: discountData.pricingGroup?._id || discountData.pricingGroupId || '',
                    customerId: discountData.customerId || '',
                    productSku: discountData.productSku || discountData.sku || '', // Added productSku handling
                    percentage: discountData.percentage || '',
                });

                // Log the data for debugging
                console.log("Setting form data:", {
                    pricingGroupId: discountData.pricingGroup?._id || discountData.pricingGroupId || '',
                    customerId: discountData.customerId || '',
                    productSku: discountData.productSku || discountData.sku || '',
                    percentage: discountData.percentage || '',
                });
            } else {
                setError('No discount data found');
            }
        } catch (error) {
            console.error('Error fetching items based discount by id:', error);
            setError('Error fetching items based discount: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPricingGroups = async () => {
        try {
            const response = await axiosInstance.get('/pricing-groups/get-pricing-groups');
            console.log("response pricing groups", response);

            if (response.data.statusCode === 200) {
                setPricingGroups(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error('Error fetching pricing groups list:', error);
            setError('Error fetching pricing groups: ' + error.message);
            setPricingGroups([]);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await axiosInstance.get('/admin/get-all-users');
            console.log("response customers", response);

            if (response.data.statusCode === 200) {
                setCustomers(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error('Error fetching customers list:', error);
            setError('Error fetching customers: ' + error.message);
            setCustomers([]);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/products/get-all-products-dashboard');
            console.log("response products", response);

            if (response.data.statusCode === 200) {
                // Correct: products are inside response.data.data (not .docs)
                const productsArray = Array.isArray(response.data.data)
                    ? response.data.data
                    : [];

                const uniqueProducts = productsArray.filter(
                    (product, index, self) =>
                        index === self.findIndex((p) => p.sku === product.sku)
                );

                setProductList((prev) => [...prev, ...uniqueProducts]);
            }
        } catch (error) {
            console.error('Error fetching products list:', error);
            setError('Error fetching products: ' + error.message);
            setProductList([]);
        } finally {
            setLoading(false);
        }
    };


    const fetchProductGroups = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/product-group/get-all-product-groups');
            console.log("response product groups", response);

            if (response.data.statusCode === 200) {
                if (Array.isArray(response.data.data)) {
                    const transformedGroups = response.data.data.map(group => ({
                        ...group,
                        ProductName: group.name || 'Product Group',
                    }));

                    setProductList((prevProducts) => [...prevProducts, ...transformedGroups]);

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
        if (!id) {
            navigate('/dashboard/items-based-discounts/create');
        }
    }, [id])

    // Load all dropdown data first
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchPricingGroups(),
                    fetchCustomers(),
                    fetchProducts(),
                    fetchProductGroups()
                ]);
                setDataLoaded(true);
            } catch (error) {
                console.error('Error loading data:', error);
                setError('Error loading required data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Load the discount data after dropdown data is loaded
    useEffect(() => {
        if (id && dataLoaded) {
            fetchPricingGroupDiscountBYId(id);
        }
    }, [id, dataLoaded]);

    return (
        <div>
            <Grid container>
                {/* Pricing Group Selection */}
                {/* <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="pricing-group-select"
                        sx={{ mt: 2 }}
                    >
                        Select Pricing Group *
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <Select
                            id="pricing-group-select"
                            value={formData.pricingGroupId}
                            onChange={handlePricingGroupChange}
                            disabled={loading || !Array.isArray(pricingGroups) || pricingGroups.length === 0}
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
                                {!Array.isArray(pricingGroups) || pricingGroups.length === 0 ? 'Loading pricing groups...' : 'Select a pricing group'}
                            </MenuItem>
                            {Array.isArray(pricingGroups) && pricingGroups.map((group) => (
                                <MenuItem key={group._id} value={group._id}>
                                    {group.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid> */}

                {/* Customer Selection */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="customer-select"
                        sx={{ mt: 2 }}
                    >
                        Select Customer *
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <Select
                            id="customer-select"
                            value={formData.customerId}
                            onChange={handleCustomerChange}
                            disabled={loading || !Array.isArray(customers) || customers.length === 0}
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
                                {!Array.isArray(customers) || customers.length === 0 ? 'Loading customers...' : 'Select a customer'}
                            </MenuItem>
                            {Array.isArray(customers) && customers.map((customer) => (
                                <MenuItem key={customer._id} value={customer.customerId}>
                                    {customer.customerId} - {customer.customerName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* Debug info - remove this after fixing */}
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                        Current selected: {formData.customerId} | Available customers: {customers.length}
                    </Typography>
                </Grid>

                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="sku-select"
                        sx={{ mt: 2 }}
                    >
                        Select ProductSku *
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <Autocomplete
                        id="sku-select"
                        options={Array.isArray(productList) ? productList : []}
                        getOptionLabel={(option) => `${option.sku} - ${option.ProductName}`}
                        value={productList.find(p => p.sku === formData.productSku) || null}
                        onChange={(event, newValue) => {
                            handleProductSkuChange({
                                target: {
                                    value: newValue ? newValue.sku : ''
                                }
                            });
                        }}
                        disabled={loading || !Array.isArray(productList) || productList.length === 0}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder={!Array.isArray(productList) || productList.length === 0 ? 'Loading Products...' : 'Select a SKU'}
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
                        isOptionEqualToValue={(option, value) => option.sku === value.sku}
                        noOptionsText={!Array.isArray(productList) || productList.length === 0 ? 'Loading Products...' : 'No products found'}
                    />
                    {/* Debug info - remove this after fixing */}
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                        Current selected: {formData.productSku} | Available Products: {productList.length}
                    </Typography>
                </Grid>

                {/* Discount Percentage */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="discount-percentage"
                        sx={{ mt: 2 }}
                    >
                        Discount Percentage (%) *
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
                        sx={{ mr: 2 }}
                    >
                        {loading ? 'Updating...' : 'Update'}
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default EditPricingGroupsDiscounts;