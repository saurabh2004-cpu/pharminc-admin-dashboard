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
    Chip,
    OutlinedInput
} from '@mui/material';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconUpload, IconFileImport } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';

const EditGroupsDiscounts = () => {
    const [formData, setFormData] = React.useState({
        pricingGroupId: '',
        customers: [], // Array of { user: customerId, percentage: value }
        selectedCustomersToUpdate: [], // For selecting customers to update percentage
        updatePercentage: '', // Percentage value for selected customers
        defaultPercentage: '', // Default percentage for all customers
    });
    const [error, setError] = React.useState('');
    const navigate = useNavigate();
    const [pricingGroups, setPricingGroups] = React.useState([]);
    const [allCustomers, setAllCustomers] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [dataLoaded, setDataLoaded] = React.useState(false);
    const { id } = useParams();

    const handleSubmit = async () => {
        // Form validation
        if (!formData.pricingGroupId || !formData.customers || formData.customers.length === 0) {
            setError('Please fill in all required fields and select at least one customer');
            return;
        }

        // Validate all customers have percentages
        const invalidCustomer = formData.customers.find(customer => {
            if (!customer.percentage) {
                return true;
            }
            const percentageValue = parseFloat(customer.percentage.toString().replace(/[+-]/g, ''));
            return isNaN(percentageValue) || percentageValue <= 0 || percentageValue > 100;
        });

        if (invalidCustomer) {
            setError('Please ensure all customers have valid percentages between 0 and 100');
            return;
        }

        try {
            setLoading(true);
            
            // Send data with customers array containing user and individual percentages
            const dataToSend = {
                customers: formData.customers,
                pricingGroupId: formData.pricingGroupId
            };

            console.log("Data being sent for update:", dataToSend);

            const res = await axiosInstance.put(`/pricing-groups-discount/update-pricing-group-discount/${id}`, dataToSend, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Pricing group discount update response:", res.data);

            if (res.data.statusCode === 200) {
                setError('success: Pricing group discount updated successfully!');
                setTimeout(() => {
                    navigate('/dashboard/groups-discounts/list');
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred');
            console.error('Update error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePricingGroupChange = (e) => {
        setFormData({ ...formData, pricingGroupId: e.target.value });
    };

    // Handle customer selection - add/remove customers from the group
    const handleCustomerChange = (event) => {
        const {
            target: { value },
        } = event;

        const selectedCustomerIds = typeof value === 'string' ? value.split(',') : value;
        
        // Create customers array with selected customers
        const updatedCustomers = selectedCustomerIds.map(customerId => {
            // Check if customer already exists in formData
            const existingCustomer = formData.customers.find(c => c.user === customerId);
            if (existingCustomer) {
                return existingCustomer; // Keep existing percentage
            }
            // New customer - use the default percentage value
            return {
                user: customerId,
                percentage: formData.defaultPercentage || ''
            };
        });

        setFormData({
            ...formData,
            customers: updatedCustomers
        });

        console.log("Updated customers:", updatedCustomers);
    };

    // Handle default percentage change - update all customers with this percentage
    const handleDefaultPercentageChange = (e) => {
        const value = e.target.value;
        
        // Allow +, -, digits, and decimal point
        if (value === '' || /^[+-]?\d*\.?\d*$/.test(value)) {
            // Update all customers with the new default percentage
            const updatedCustomers = formData.customers.map(customer => ({
                ...customer,
                percentage: value
            }));

            setFormData({ 
                ...formData, 
                defaultPercentage: value,
                customers: updatedCustomers
            });
        }
    };

    // Handle selection of customers to update percentage
    const handleCustomersToUpdateChange = (event) => {
        const {
            target: { value },
        } = event;

        const selectedCustomerIds = typeof value === 'string' ? value.split(',') : value;
        
        setFormData({
            ...formData,
            selectedCustomersToUpdate: selectedCustomerIds
        });
    };

    // Handle update percentage change for selected customers
    const handleUpdatePercentageChange = (e) => {
        const value = e.target.value;
        
        // Allow +, -, digits, and decimal point
        if (value === '' || /^[+-]?\d*\.?\d*$/.test(value)) {
            setFormData({ 
                ...formData, 
                updatePercentage: value
            });
        }
    };

    // Apply the update percentage to selected customers
    const handleApplyUpdatePercentage = () => {
        if (formData.selectedCustomersToUpdate.length === 0) {
            setError('Please select at least one customer to update');
            return;
        }

        if (!formData.updatePercentage) {
            setError('Please enter a percentage value to update');
            return;
        }

        // Validate percentage
        const percentageValue = parseFloat(formData.updatePercentage.toString().replace(/[+-]/g, ''));
        if (isNaN(percentageValue) || percentageValue <= 0 || percentageValue > 100) {
            setError('Please enter a valid percentage between 0 and 100');
            return;
        }

        // Update selected customers with the new percentage
        const updatedCustomers = formData.customers.map(customer => 
            formData.selectedCustomersToUpdate.includes(customer.user)
                ? { ...customer, percentage: formData.updatePercentage }
                : customer
        );

        setFormData({
            ...formData,
            customers: updatedCustomers,
            selectedCustomersToUpdate: [], // Clear selection after update
            updatePercentage: '' // Clear update percentage field
        });

        setError('success: Percentage updated for selected customers!');
    };

    const fetchPricingGroupDiscountById = async (discountId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/pricing-groups-discount/get-pricing-group-discount/${discountId}`);
            console.log("Pricing group discount by id:", response.data);

            if (response.data.statusCode === 200 && response.data.data) {
                const discountData = response.data.data;

                // Extract pricingGroup ID
                const pricingGroupId = discountData.pricingGroup && typeof discountData.pricingGroup === 'object' 
                    ? discountData.pricingGroup._id 
                    : discountData.pricingGroup;

                // Extract customers array with user and percentage
                const customers = Array.isArray(discountData.customers) 
                    ? discountData.customers.map(customer => ({
                        user: customer.user?._id || customer.user,
                        percentage: customer.percentage || ''
                    }))
                    : [];

                // Get the first customer's percentage as default
                const defaultPercentage = customers.length > 0 ? customers[0].percentage : '';

                console.log("Loaded discount data:", {
                    pricingGroupId,
                    customers,
                    defaultPercentage
                });

                setFormData({
                    pricingGroupId: pricingGroupId || '',
                    customers: customers || [],
                    selectedCustomersToUpdate: [],
                    updatePercentage: '',
                    defaultPercentage: defaultPercentage || '',
                });
            } else {
                setError('No discount data found');
            }
        } catch (error) {
            console.error('Error fetching pricing group discount:', error);
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

    const fetchAllCustomers = async () => {
        try {
            const response = await axiosInstance.get('/admin/get-all-users');
            console.log("response customers", response);

            if (response.data.statusCode === 200) {
                setAllCustomers(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error('Error fetching customers list:', error);
            setError('Error fetching customers: ' + error.message);
            setAllCustomers([]);
        }
    };

    // Get selected customer IDs for the multi-select
    const getSelectedCustomerIds = () => {
        return formData.customers.map(customer => customer.user);
    };

    // Get customer name by ID
    const getCustomerName = (customerId) => {
        const customer = allCustomers.find(c => c._id === customerId);
        return customer ? `${customer.customerId} - ${customer.customerName || ''}` : 'Unknown';
    };

    // Get customer percentage by ID
    const getCustomerPercentage = (customerId) => {
        const customer = formData.customers.find(c => c.user === customerId);
        return customer ? customer.percentage : 'No %';
    };

    // Load all dropdown data first
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchPricingGroups(),
                    fetchAllCustomers(),
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
            fetchPricingGroupDiscountById(id);
        }
    }, [id, dataLoaded]);

    return (
        <div>
            <Grid container>
                {/* 1. Pricing Group Selection */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="pricing-group-select"
                        sx={{ mt: 2 }}
                    >
                        Pricing Group *
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
                </Grid>

                {/* 2. Customers Selection - Add/Remove customers */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="customer-select"
                        sx={{ mt: 2 }}
                    >
                        Customers in this Pricing Group *
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                            (Select/deselect customers to add/remove from this group)
                        </Typography>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <Select
                            id="customer-select"
                            multiple
                            value={getSelectedCustomerIds()}
                            onChange={handleCustomerChange}
                            disabled={loading || !Array.isArray(allCustomers) || allCustomers.length === 0}
                            input={<OutlinedInput />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((customerId) => (
                                        <Chip
                                            key={customerId}
                                            label={`${getCustomerName(customerId)} (${getCustomerPercentage(customerId)})`}
                                            size="small"
                                        />
                                    ))}
                                </Box>
                            )}
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
                            {!Array.isArray(allCustomers) || allCustomers.length === 0 ? (
                                <MenuItem disabled>
                                    Loading customers...
                                </MenuItem>
                            ) : (
                                allCustomers.map((customer) => (
                                    <MenuItem
                                        key={customer._id}
                                        value={customer._id}
                                    >
                                        {customer.customerId} - {customer.customerName || ''}
                                        {customer.markupDiscount && (
                                            <Typography component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                                                ({customer.markupDiscount > 0 ? '+' : ''}{customer.markupDiscount}%)
                                            </Typography>
                                        )}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                    {formData.customers.length > 0 && (
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                            {formData.customers.length} customer{formData.customers.length > 1 ? 's' : ''} in this pricing group
                        </Typography>
                    )}
                </Grid>

                {/* 3. Select Customers to Update Percentage */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="update-customer-select"
                        sx={{ mt: 2 }}
                    >
                        Select Customers to Update Percentage
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                            (Choose specific customers to update their percentage)
                        </Typography>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <Select
                            id="update-customer-select"
                            multiple
                            value={formData.selectedCustomersToUpdate}
                            onChange={handleCustomersToUpdateChange}
                            disabled={loading || formData.customers.length === 0}
                            input={<OutlinedInput />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((customerId) => (
                                        <Chip
                                            key={customerId}
                                            label={getCustomerName(customerId)}
                                            size="small"
                                        />
                                    ))}
                                </Box>
                            )}
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
                            {formData.customers.length === 0 ? (
                                <MenuItem disabled>
                                    No customers in this pricing group
                                </MenuItem>
                            ) : (
                                formData.customers.map((customer) => (
                                    <MenuItem
                                        key={customer.user}
                                        value={customer.user}
                                    >
                                        {getCustomerName(customer.user)} (Current: {customer.percentage}%)
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                    {formData.selectedCustomersToUpdate.length > 0 && (
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                            {formData.selectedCustomersToUpdate.length} customer{formData.selectedCustomersToUpdate.length > 1 ? 's' : ''} selected for percentage update
                        </Typography>
                    )}
                </Grid>

                {/* 4. Update Percentage Value for Selected Customers */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="update-percentage"
                        sx={{ mt: 2 }}
                    >
                        Update Percentage for Selected Customers (%)
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                            (Enter new percentage for selected customers)
                        </Typography>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <Box display="flex" gap={2} alignItems="flex-start">
                        <CustomOutlinedInput
                            id="update-percentage"
                            fullWidth
                            type="text"
                            value={formData.updatePercentage}
                            onChange={handleUpdatePercentageChange}
                            placeholder="Enter new percentage (e.g., +10 or -10)"
                            disabled={formData.selectedCustomersToUpdate.length === 0}
                            sx={{
                                '& input': {
                                    color: formData.updatePercentage.toString().startsWith('-') 
                                        ? 'error.main' 
                                        : formData.updatePercentage.toString().startsWith('+') 
                                            ? 'success.main' 
                                            : 'text.primary'
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleApplyUpdatePercentage}
                            disabled={loading || formData.selectedCustomersToUpdate.length === 0 || !formData.updatePercentage}
                            sx={{ minWidth: '140px', backgroundColor: '#1976d2' }}
                        >
                            Apply Update
                        </Button>
                    </Box>
                    {formData.updatePercentage && (
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                            {formData.updatePercentage.toString().startsWith('-') 
                                ? '📉 Discount will be applied' 
                                : formData.updatePercentage.toString().startsWith('+') 
                                    ? '📈 Markup will be applied' 
                                    : 'ℹ️ Add + or - sign'}
                        </Typography>
                    )}
                </Grid>

                {/* 5. Default Percentage for All Customers */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="default-percentage"
                        sx={{ mt: 2 }}
                    >
                        Default Percentage for All Customers (%) *
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                            (This percentage applies to all customers in the group)
                        </Typography>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="default-percentage"
                        fullWidth
                        type="text"
                        value={formData.defaultPercentage}
                        onChange={handleDefaultPercentageChange}
                        placeholder="Enter default percentage (e.g., +10 or -10)"
                        sx={{
                            '& input': {
                                color: formData.defaultPercentage.toString().startsWith('-') 
                                    ? 'error.main' 
                                    : formData.defaultPercentage.toString().startsWith('+') 
                                        ? 'success.main' 
                                        : 'text.primary'
                            }
                        }}
                    />
                    {formData.defaultPercentage && (
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                            {formData.defaultPercentage.toString().startsWith('-') 
                                ? '📉 Discount applied to all customers' 
                                : formData.defaultPercentage.toString().startsWith('+') 
                                    ? '📈 Markup applied to all customers' 
                                    : 'ℹ️ Add + or - sign'}
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
                        {loading ? 'Updating...' : 'Update Pricing Group Discount'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/dashboard/groups-discounts/list')}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default EditGroupsDiscounts;