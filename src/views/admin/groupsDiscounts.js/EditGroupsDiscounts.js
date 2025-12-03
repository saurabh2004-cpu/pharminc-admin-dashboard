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
        customers: [], // Array of customer objects with user and percentage
        pricingGroupId: '',
        percentage: ''
    });
    const [error, setError] = React.useState('');
    const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const navigate = useNavigate();
    const [pricingGroups, setPricingGroups] = React.useState([]);
    const [allCustomers, setAllCustomers] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const { id } = useParams();

    const handleSubmit = async () => {
        // Form validation
        if (!formData.customers || formData.customers.length === 0 || !formData.pricingGroupId) {
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

            // Ensure proper data structure for backend
            const dataToSend = {
                customers: formData.customers.map(customer => ({
                    user: customer.user, // This should be the customer user ID string
                    percentage: customer.percentage
                })),
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
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };


    const fetchPricingGroupDiscountById = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/pricing-groups-discount/get-pricing-group-discount/${id}`);
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

                console.log("Loaded customers:", customers);

                setFormData({
                    pricingGroupId: pricingGroupId || '',
                    customers: customers || [],
                    percentage: customers.length > 0 ? customers[0].percentage : '',
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

    useEffect(() => {
        if (id) {
            fetchPricingGroupDiscountById();
        }
    }, [id])

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
                percentage: formData.percentage || ''
            };
        });

        setFormData({
            ...formData,
            customers: updatedCustomers
        });

        console.log("Updated customers:", updatedCustomers);
    };

    // Handle individual customer percentage change
    const handleCustomerPercentageChange = (customerId, newPercentage) => {
        const updatedCustomers = formData.customers.map(customer =>
            customer.user === customerId
                ? { ...customer, percentage: newPercentage }
                : customer
        );

        setFormData({
            ...formData,
            customers: updatedCustomers
        });
    };

    // Handle default percentage change - update all customers with this percentage
    const handlePercentageChange = (e) => {
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
                percentage: value,
                customers: updatedCustomers
            });
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
            formDataForUpload.append('pricingGroupsDiscounts', selectedFile);

            const res = await axiosInstance.post('/pricing-groups-discount/import-pricing-groups-discounts', formDataForUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("CSV imported", res.data);

            if (res.data.statusCode === 200) {
                setCsvDialogOpen(false);
                setSelectedFile(null);
                setError('success: CSV imported successfully!');
                const fileInput = document.getElementById('csv-file-input');
                if (fileInput) fileInput.value = '';

                setTimeout(() => {
                    navigate('/dashboard/groups-discounts/list');
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

    // Get customer details by ID
    const getCustomerDetails = (customerId) => {
        return allCustomers.find(c => c._id === customerId);
    };

    // Get customer percentage by ID
    const getCustomerPercentage = (customerId) => {
        const customer = formData.customers.find(c => c.user === customerId);
        return customer ? customer.percentage : 'No %';
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                fetchPricingGroups(),
                fetchAllCustomers(),
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
            title: 'Edit Groups Discounts',
        },
    ];


    return (
        <div>
            <Breadcrumb title="Edit Groups Discounts" items={BCrumb} />
            <Grid container marginTop={4}>
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

                {/* Customers Selection */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="customer-select"
                        sx={{ mt: 2 }}
                    >
                        Select Customers *
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                            (Multiple selection allowed)
                        </Typography>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <Select
                            id="customer-select"
                            multiple
                            value={getSelectedCustomerIds()} // This returns array of customer.user IDs
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
                            {formData.customers.length} customer{formData.customers.length > 1 ? 's' : ''} selected
                        </Typography>
                    )}
                </Grid>

                {/* Individual Customer Percentages */}
                {formData.customers.length > 0 && (
                    <Grid size={12}>
                        <CustomFormLabel
                            sx={{ mt: 2 }}
                        >
                            Individual Customer Percentages *
                            <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                                (Set percentage for each customer)
                            </Typography>
                        </CustomFormLabel>

                        <Box sx={{ mt: 1, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            {formData.customers.map((customer) => {
                                const customerDetails = getCustomerDetails(customer.user);
                                return (
                                    <Box key={customer.user} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { mb: 0, pb: 0, borderBottom: 'none' } }}>
                                        <Grid container alignItems="center" spacing={2}>
                                            <Grid size={5}>
                                                <Typography variant="subtitle2">
                                                    {customerDetails?.customerId} - {customerDetails?.customerName || 'Unknown Customer'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {customerDetails?.customerEmail}
                                                </Typography>
                                            </Grid>
                                            <Grid size={7}>
                                                <CustomOutlinedInput
                                                    fullWidth
                                                    type="text"
                                                    value={customer.percentage}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '' || /^[+-]?\d*\.?\d*$/.test(value)) {
                                                            handleCustomerPercentageChange(customer.user, value);
                                                        }
                                                    }}
                                                    placeholder="Enter percentage (e.g., +10 or -10)"
                                                    sx={{
                                                        '& input': {
                                                            color: customer.percentage.toString().startsWith('-')
                                                                ? 'error.main'
                                                                : customer.percentage.toString().startsWith('+')
                                                                    ? 'success.main'
                                                                    : 'text.primary'
                                                        }
                                                    }}
                                                />

                                            </Grid>
                                        </Grid>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Grid>
                )}

                {/* Default Percentage for All Customers */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="default-percentage"
                        sx={{ mt: 2 }}
                    >
                        Default Percentage for All Customers
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                            (This percentage will apply to all customers when changed)
                        </Typography>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="default-percentage"
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
                                ? '📉 Discount applied to all customers'
                                : formData.percentage.toString().startsWith('+')
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

            {/* CSV Import Dialog */}
            <Dialog
                open={csvDialogOpen}
                onClose={handleCloseCsvDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Import Pricing Group Discounts from CSV
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Select a CSV file to import multiple pricing group discounts at once.
                        </Typography>

                        <input
                            id="csv-file-input"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        <Box display="flex" alignItems="center" gap={2}>
                            <Button
                                variant="outlined"
                                component="label"
                                htmlFor="csv-file-input"
                                startIcon={<IconUpload size="1.1rem" />}
                                disabled={loading}
                            >
                                Choose File
                            </Button>

                            {selectedFile && (
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
                    <Button onClick={handleCloseCsvDialog} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImportCsvFile}
                        variant="contained"
                        disabled={!selectedFile || loading}
                        startIcon={<IconFileImport size="1.1rem" />}
                        sx={{ backgroundColor: '#2E2F7F' }}
                    >
                        {loading ? 'Importing...' : 'Import'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default EditGroupsDiscounts;