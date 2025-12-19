import React, { useEffect } from 'react';
import {
    Grid,
    Button,
    Typography,
    Box
} from '@mui/material';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const EditCustomersPercentage = () => {
    const [formData, setFormData] = React.useState({
        percentage: ''
    });
    const [error, setError] = React.useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [customerData, setCustomerData] = React.useState(null);
    const { customerId, pricingGroupDiscountId, discountId } = useParams();

    const handleSubmit = async () => {
        // Form validation
        if (!formData.percentage) {
            setError('Please enter a percentage value');
            return;
        }

        // Validate percentage format
        const percentageValue = parseFloat(formData.percentage.toString().replace(/[+-]/g, ''));
        if (isNaN(percentageValue) || percentageValue <= 0 || percentageValue > 100) {
            setError('Please enter a valid percentage between 0 and 100');
            return;
        }

        try {
            setLoading(true);

            const dataToSend = {
                percentage: formData.percentage
            };

            // console.log("Data being sent for update:", dataToSend);

            const res = await axiosInstance.put(
                `/pricing-groups-discount/update-customers-percentage/${customerId}/${pricingGroupDiscountId}`,
                dataToSend,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // console.log("Customer percentage update response:", res.data);

            if (res.data.statusCode === 200) {
                setError('success: Customer percentage updated successfully!');
                setTimeout(() => {
                    navigate(`/dashboard/groups-discount/customers/${discountId}`);
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred');
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerDiscountData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(
                `/pricing-groups-discount/get-pricing-group-discount-by-customerId-and-discountId/${customerId}/${pricingGroupDiscountId}`
            );
            // console.log("Customer discount data:", response.data);

            if (response.data.statusCode === 200 && response.data.data) {
                const discountData = response.data.data;

                // Find the specific customer in the customers array
                const customer = discountData.customers.find(
                    cust => cust.user._id === customerId || cust.user === customerId
                );

                if (customer) {
                    setCustomerData({
                        customerId: customer.user.customerId,
                        customerName: customer.user.customerName,
                        customerEmail: customer.user.customerEmail,
                        currentPercentage: customer.percentage,
                        pricingGroupName: discountData.pricingGroup?.name || 'N/A'
                    });

                    setFormData({
                        percentage: customer.percentage || ''
                    });
                } else {
                    setError('Customer not found in this pricing group discount');
                }
            } else {
                setError('No discount data found');
            }
        } catch (error) {
            console.error('Error fetching customer discount data:', error);
            setError('Error fetching customer data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (customerId && pricingGroupDiscountId) {
            fetchCustomerDiscountData();
        }
    }, [customerId, pricingGroupDiscountId]);

    const handlePercentageChange = (e) => {
        const value = e.target.value;

        // Allow +, -, digits, and decimal point
        if (value === '' || /^[+-]?\d*\.?\d*$/.test(value)) {
            setFormData({
                percentage: value
            });
        }
    };

    const BCrumb = [
        {
            to: '/',
            title: 'Home',
        },
        {
            title: 'Edit Pricing Group ',
        },
    ];


    return (
        <div>
            <Breadcrumb title="Edit Pricing Group Customer Percentage" items={BCrumb} />
            <Grid container spacing={3} marginTop={4}>
                {/* Customer Information Display in Input Fields */}
                <Grid size={12}>
                    <CustomFormLabel sx={{ mt: 2 }}>
                        Customer Information
                    </CustomFormLabel>
                </Grid>

                {/* Customer ID */}
                <Grid size={12} sm={6}>
                    <CustomFormLabel htmlFor="customer-id">
                        Customer ID
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="customer-id"
                        fullWidth
                        value={customerData?.customerId || ''}
                        disabled
                        placeholder="Loading..."
                    />
                </Grid>

                {/* Customer Name */}
                <Grid size={12} sm={6}>
                    <CustomFormLabel htmlFor="customer-name">
                        Customer Name
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="customer-name"
                        fullWidth
                        value={customerData?.customerName || ''}
                        disabled
                        placeholder="Loading..."
                    />
                </Grid>



                {/* Pricing Group */}
                <Grid size={12} sm={6}>
                    <CustomFormLabel htmlFor="pricing-group">
                        Pricing Group
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="pricing-group"
                        fullWidth
                        value={customerData?.pricingGroupName || ''}
                        disabled
                        placeholder="Loading..."
                    />
                </Grid>

                {/* Current Percentage */}
                <Grid size={12} sm={6}>
                    <CustomFormLabel htmlFor="current-percentage">
                        Current Percentage
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="current-percentage"
                        fullWidth
                        value={customerData?.currentPercentage || ''}
                        disabled
                        placeholder="Loading..."
                        sx={{
                            '& input': {
                                color: customerData?.currentPercentage?.startsWith('-')
                                    ? 'error.main'
                                    : customerData?.currentPercentage?.startsWith('+')
                                        ? 'success.main'
                                        : 'text.primary'
                            }
                        }}
                    />
                </Grid>

                {/* New Percentage Input */}
                <Grid size={12} sm={6}>
                    <CustomFormLabel htmlFor="new-percentage">
                        New Percentage *
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                            (Use + for markup, - for discount)
                        </Typography>
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="new-percentage"
                        fullWidth
                        type="text"
                        value={formData.percentage}
                        onChange={handlePercentageChange}
                        placeholder="Enter percentage (e.g., +10 or -10)"
                        sx={{
                            '& input': {
                                color: formData.percentage.toString().startsWith('-')
                                    ? 'error.main'
                                    : formData.percentage.toString().startsWith('+')
                                        ? 'success.main'
                                        : 'text.primary'
                            }
                        }}
                    />
                    {formData.percentage && (
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                            {formData.percentage.toString().startsWith('-')
                                ? '📉 Discount will be applied'
                                : formData.percentage.toString().startsWith('+')
                                    ? '📈 Markup will be applied'
                                    : 'ℹ️ Add + or - sign for proper calculation'}
                        </Typography>
                    )}
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
                        {loading ? 'Updating...' : 'Update Customer Percentage'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(`/dashboard/groups-discount/customers/${pricingGroupDiscountId}`)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default EditCustomersPercentage;