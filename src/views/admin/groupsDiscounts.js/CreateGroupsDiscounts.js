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
    Chip,
} from '@mui/material';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconUpload, IconFileImport } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { Autocomplete, TextField } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const CreateGroupsDiscounts = () => {
    const [formData, setFormData] = React.useState({
        customers: [], // Array of customer ObjectIds (_id)
        pricingGroupIds: [], // Changed to array for multiple pricing groups
        percentage: ''
    });
    const [error, setError] = React.useState('');
    const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const navigate = useNavigate();
    const [pricingGroups, setPricingGroups] = React.useState([]);
    const [customers, setCustomers] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async () => {
        // Form validation
        if (!formData.customers || formData.customers.length === 0 || 
            !formData.percentage || !formData.pricingGroupIds || 
            formData.pricingGroupIds.length === 0) {
            setError('Please fill in all required fields and select at least one customer and one pricing group');
            return;
        }

        // Parse the percentage (remove + or - sign for validation)
        const percentageValue = parseFloat(formData.percentage.toString().replace(/[+-]/g, ''));

        if (isNaN(percentageValue) || percentageValue <= 0 || percentageValue > 100) {
            setError('Please enter a valid percentage between 0 and 100');
            return;
        }

        try {
            setLoading(true);

            // Send data to create multiple pricing group discounts
            const dataToSend = {
                customers: formData.customers, // Array of customer ObjectIds
                pricingGroupIds: formData.pricingGroupIds, // Array of pricing group ObjectIds
                percentage: formData.percentage
            };

            const res = await axiosInstance.post('/pricing-groups-discount/create-pricing-group-discount', dataToSend, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.statusCode === 200) {
                setFormData({
                    pricingGroupIds: [],
                    customers: [],
                    percentage: '',
                });
                setError(`Successfully created ${res.data.data.created} pricing group discount(s)!`);
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

    // Handle multiple pricing group selection
    const handlePricingGroupChange = (event, newValue) => {
        setFormData({
            ...formData,
            pricingGroupIds: newValue.map(group => group._id)
        });
    };

    // Handle multiple customer selection
    const handleCustomerChange = (event, newValue) => {
        setFormData({
            ...formData,
            customers: newValue.map(customer => customer._id)
        });
    };

    const handlePercentageChange = (e) => {
        const value = e.target.value;

        // Allow +, -, digits, and decimal point
        if (value === '' || /^[+-]?\d*\.?\d*$/.test(value)) {
            setFormData({ ...formData, percentage: value });
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

            if (res.data.statusCode === 200) {
                setCsvDialogOpen(false);
                setSelectedFile(null);
                setError('CSV imported successfully!');
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
            setLoading(true);
            const response = await axiosInstance.get('/pricing-groups/get-pricing-groups');

            if (response.data.statusCode === 200) {
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

            if (response.data.statusCode === 200) {
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

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                fetchPricingGroups(),
                fetchCustomers(),
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
            title: 'Create Groups Discounts',
        },
    ];

    return (
        <div>
            <Breadcrumb title="Create Groups Discounts" items={BCrumb} />
            <Grid container marginTop={4}>
                {/* Multiple Pricing Group Selection */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="pricing-group-select"
                        sx={{ mt: 2 }}
                    >
                        Select Pricing Groups
                        <span style={{ color: 'red' }}>*</span>
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                            (Multiple selection allowed)
                        </Typography>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <Autocomplete
                            id="pricing-group-select"
                            multiple
                            value={pricingGroups.filter(group => formData.pricingGroupIds.includes(group._id))}
                            onChange={handlePricingGroupChange}
                            options={Array.isArray(pricingGroups) ? pricingGroups : []}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            disabled={loading || !Array.isArray(pricingGroups) || pricingGroups.length === 0}
                            noOptionsText={!Array.isArray(pricingGroups) || pricingGroups.length === 0 ? 'Loading pricing groups...' : 'No pricing groups found'}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        {...getTagProps({ index })}
                                        key={option._id}
                                        label={option.name || 'Unknown'}
                                        size="small"
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={!Array.isArray(pricingGroups) || pricingGroups.length === 0 ? 'Loading pricing groups...' : 'Search and select pricing groups'}
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
                    {formData.pricingGroupIds.length > 0 && (
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                            {formData.pricingGroupIds.length} pricing group{formData.pricingGroupIds.length > 1 ? 's' : ''} selected
                        </Typography>
                    )}
                </Grid>

                {/* Multiple Customer Selection */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="customer-select"
                        sx={{ mt: 2 }}
                    >
                        Select Customers
                        <span style={{ color: 'red' }}>*</span>
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                            (Multiple selection allowed)
                        </Typography>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <Autocomplete
                            id="customer-select"
                            multiple
                            value={customers.filter(customer => formData.customers.includes(customer._id))}
                            onChange={handleCustomerChange}
                            options={Array.isArray(customers) ? customers : []}
                            getOptionLabel={(option) => `${option.customerId}${option.customerName ? ' - ' + option.customerName : ''}`}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            disabled={loading || !Array.isArray(customers) || customers.length === 0}
                            noOptionsText={!Array.isArray(customers) || customers.length === 0 ? 'Loading customers...' : 'No customers found'}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        {...getTagProps({ index })}
                                        key={option._id}
                                        label={`${option.customerId || 'Unknown'}${option.customerName ? ' - ' + option.customerName : ''}`}
                                        size="small"
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={!Array.isArray(customers) || customers.length === 0 ? 'Loading customers...' : 'Search and select customers'}
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
                    {formData.customers.length > 0 && (
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                            {formData.customers.length} customer{formData.customers.length > 1 ? 's' : ''} selected
                        </Typography>
                    )}
                </Grid>

                {/* Discount Percentage */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="discount-percentage"
                        sx={{ mt: 2 }}
                    >
                        Discount Percentage (%)
                        <span style={{ color: 'red' }}>*</span>
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                            (Use + for markup, - for discount)
                        </Typography>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="discount-percentage"
                        fullWidth
                        type="text"
                        value={formData.percentage}
                        onChange={handlePercentageChange}
                        placeholder="Enter discount percentage (e.g., +10 or -10)"
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
                                ? '📉 Discount applied'
                                : formData.percentage.toString().startsWith('+')
                                    ? '📈 Markup applied'
                                    : 'ℹ️ Add + or - sign'}
                        </Typography>
                    )}
                </Grid>

                {/* Summary Box */}
                {formData.pricingGroupIds.length > 0 && formData.customers.length > 0 && (
                    <Grid size={12} mt={2}>
                        <Box sx={{
                            p: 2,
                            borderRadius: '8px',
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #3b82f6'
                        }}>
                            <Typography variant="body2" fontWeight="bold" gutterBottom>
                                Summary:
                            </Typography>
                            <Typography variant="body2">
                                • {formData.pricingGroupIds.length} pricing group{formData.pricingGroupIds.length > 1 ? 's' : ''} selected
                            </Typography>
                            <Typography variant="body2">
                                • {formData.customers.length} customer{formData.customers.length > 1 ? 's' : ''} selected
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" mt={1}>
                                Total documents to be created: {formData.pricingGroupIds.length * formData.customers.length}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {/* Error/Success Message */}
                {error && (
                    <Grid size={12} mt={2}>
                        <div style={{
                            color: error.includes('success') || error.includes('Successfully') ? 'green' : 'red',
                            padding: '8px',
                            borderRadius: '4px',
                            backgroundColor: error.includes('success') || error.includes('Successfully') ? '#f0f9ff' : '#fef2f2',
                            border: `1px solid ${error.includes('success') || error.includes('Successfully') ? '#22c55e' : '#ef4444'}`
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

                        {error && !error.includes('success') && !error.includes('Successfully') && (
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

export default CreateGroupsDiscounts;