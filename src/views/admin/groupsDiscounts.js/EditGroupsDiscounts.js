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
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconUpload, IconFileImport } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';

const EditGroupsDiscounts = () => {
    const [formData, setFormData] = React.useState({
        pricingGroupId: '',
        customerId: '',
        percentage: '',
    });
    const [error, setError] = React.useState('');
    const navigate = useNavigate();
    const [pricingGroups, setPricingGroups] = React.useState([]);
    const [customers, setCustomers] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [dataLoaded, setDataLoaded] = React.useState(false); // Track if all data is loaded
    const { id } = useParams();

    const handleSubmit = async () => {
        // Form validation
        if (!formData.pricingGroupId || !formData.customerId || !formData.percentage ) {
            setError('Please fill in all required fields');
            return;
        }

        if (isNaN(formData.percentage) || parseFloat(formData.percentage) <= 0 || parseFloat(formData.percentage) > 100) {
            setError('Please enter a valid percentage between 0 and 100');
            return;
        }

        try {
            setLoading(true);
            const res = await axiosInstance.put(`/pricing-groups-discount/update-pricing-group-discount/${id}`, formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Pricing group discount update response:", res.data);

            if (res.data.statusCode === 200) {
                setError('Pricing group discount updated successfully!');
                setTimeout(() => {
                    navigate('/dashboard/groups-discounts/list');
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

    const fetchPricingGroupDiscountBYId = async (id) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/pricing-groups-discount/get-pricing-group-discount/${id}`);
            console.log("response item based discount by id", response);

            if (response.data.statusCode === 200 && response.data.data) {
                const discountData = response.data.data;

                // Set form data with proper IDs for dropdowns
                setFormData({
                    pricingGroupId: discountData.pricingGroup || '',
                    customerId: discountData.customerId || '',
                    percentage: discountData.percentage || '',
                });
            } else {
                setError('No discount data found');
            }
        } catch (error) {
            console.error('Error fetching pricing group discount by id:', error);
            setError('Error fetching pricing group discount: ' + error.message);
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


    // Load all dropdown data first
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchPricingGroups(),
                    fetchCustomers(),
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
                <Grid size={12}>
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
                        >
                            <MenuItem value="" disabled>Select a pricing group</MenuItem>
                            {pricingGroups.map((group) => (
                                <MenuItem key={group._id} value={group._id}>
                                    {group.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

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
                        >
                            <MenuItem value="" disabled>Select a customer</MenuItem>
                            {customers.map((customer) => (
                                <MenuItem key={customer._id} value={customer._id}>
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
                        sx={{ mr: 2, backgroundColor: '#2E2F7F' }}
                    >
                        {loading ? 'Updating...' : 'Update'}
                    </Button>

                </Grid>
            </Grid>
        </div>
    );
};

export default EditGroupsDiscounts;