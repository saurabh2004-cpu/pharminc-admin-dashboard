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
import { useNavigate } from 'react-router';

const CreateGroupsDiscounts = () => {
    const [formData, setFormData] = React.useState({
        customers: [], // Array of customer ObjectIds (_id)
        pricingGroupId: '',
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
        if (!formData.customers || formData.customers.length === 0 || !formData.percentage || !formData.pricingGroupId) {
            setError('Please fill in all required fields and select at least one customer');
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

            // ✅ CORRECTED: Send data with proper field names matching backend
            const dataToSend = {
                customers: formData.customers, // Array of customer ObjectIds (_id)
                pricingGroupId: formData.pricingGroupId, // Changed from pricingGroup to pricingGroupId
                percentage: formData.percentage
            };

            console.log("Data being sent:", dataToSend);

            const res = await axiosInstance.post('/pricing-groups-discount/create-pricing-group-discount', dataToSend, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Pricing group discount creation response:", res.data);

            if (res.data.statusCode === 200) {
                setFormData({
                    pricingGroupId: '',
                    customers: [],
                    percentage: '',
                });
                setError('Pricing group discount created successfully!');
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

    const handlePricingGroupChange = (e) => {
        setFormData({ ...formData, pricingGroupId: e.target.value });
    };

    // ✅ CORRECTED: Handle multiple customer selection with ObjectIds
    const handleCustomerChange = (event) => {
        const {
            target: { value },
        } = event;

        // value will be an array of customer._id (ObjectIds)
        setFormData({
            ...formData,
            customers: typeof value === 'string' ? value.split(',') : value
        });

        console.log("Selected customers (ObjectIds):", typeof value === 'string' ? value.split(',') : value);
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

            console.log("CSV imported", res.data);

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
            console.log("response pricing groups", response);

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
            console.log("response customers", response);

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

                {/* ✅ CORRECTED: Multiple Customer Selection with ObjectIds */}
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
                        <Select
                            id="customer-select"
                            multiple
                            value={formData.customers}
                            onChange={handleCustomerChange}
                            disabled={loading || !Array.isArray(customers) || customers.length === 0}
                            input={<OutlinedInput />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((customerId) => {
                                        // Find customer by _id (ObjectId)
                                        const customer = customers.find(c => c._id === customerId);
                                        return (
                                            <Chip
                                                key={customerId}
                                                label={`${customer?.customerId || 'Unknown'}${customer?.customerName ? ' - ' + customer.customerName : ''}`}
                                                size="small"
                                            />
                                        );
                                    })}
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
                            {!Array.isArray(customers) || customers.length === 0 ? (
                                <MenuItem disabled>
                                    Loading customers...
                                </MenuItem>
                            ) : (
                                customers.map((customer) => (
                                    <MenuItem
                                        key={customer._id}
                                        value={customer._id} // ✅ Use _id (ObjectId) as value
                                    >
                                        {customer.customerId} 
                                        
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

export default CreateGroupsDiscounts;