import React, { useState, useEffect } from 'react';
import { Grid, Box, CircularProgress, Alert, Snackbar, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import { updateAddress, getAddressById } from '../../../services/addressService';
import { useNavigate, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const AddressEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        addressLine1: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        workingDays: {
            weekDays: { from: 'Mon', to: 'Fri', openingTime: '09:00 AM', closingTime: '06:00 PM' },
            weekEnds: { from: 'Sat', to: 'Sun', openingTime: '10:00 AM', closingTime: '04:00 PM' }
        }
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const res = await getAddressById(id);
                const data = res.data?.data || res.data;
                if (data) {
                    setFormData({
                        addressLine1: data.addressLine1 || '',
                        city: data.city || '',
                        state: data.state || '',
                        country: data.country || '',
                        pincode: data.pincode || '',
                        workingDays: {
                            weekDays: data.workingDays?.weekDays || { from: 'Mon', to: 'Fri', openingTime: '09:00 AM', closingTime: '06:00 PM' },
                            weekEnds: data.workingDays?.weekEnds || { from: 'Sat', to: 'Sun', openingTime: '10:00 AM', closingTime: '04:00 PM' }
                        }
                    });
                }
            } catch (error) {
                setError('Failed to fetch address');
            } finally {
                setFetchLoading(false);
            }
        };

        if (id) {
            fetchAddress();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleWorkingDaysChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            workingDays: {
                ...prev.workingDays,
                [type]: {
                    ...prev.workingDays[type],
                    [field]: value
                }
            }
        }));
    };

    const validateForm = () => {
        if (!formData.addressLine1 || !formData.city || !formData.state || !formData.country || !formData.pincode) {
            setError('Please fill all required address fields');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const res = await updateAddress(id, formData);
            if (res.status === 200 || res.data) {
                setSuccess(true);
                setTimeout(() => navigate('/dashboard/addresses/list'), 1500);
            }
        } catch (error) {
            const errDetails = error.response?.data?.error || error.response?.data?.details || error.message;
            setError(errDetails || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccess(false);
        setError('');
    };

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/dashboard/addresses/list', title: 'Addresses' },
        { title: 'Edit Address' },
    ];

    if (fetchLoading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <Breadcrumb title="Edit Address" items={BCrumb} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <CustomFormLabel htmlFor="addressLine1">Address Line 1 *</CustomFormLabel>
                    <CustomOutlinedInput id="addressLine1" name="addressLine1" fullWidth value={formData.addressLine1} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="city">City *</CustomFormLabel>
                    <CustomOutlinedInput id="city" name="city" fullWidth value={formData.city} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="state">State *</CustomFormLabel>
                    <CustomOutlinedInput id="state" name="state" fullWidth value={formData.state} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="country">Country *</CustomFormLabel>
                    <CustomOutlinedInput id="country" name="country" fullWidth value={formData.country} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="pincode">Pincode *</CustomFormLabel>
                    <CustomOutlinedInput id="pincode" name="pincode" fullWidth value={formData.pincode} onChange={handleChange} />
                </Grid>

                <Grid size={{ xs: 12 }} mt={2}>
                    <Typography variant="h6">Working Days</Typography>
                </Grid>

                {/* WeekDays */}
                <Grid size={{ xs: 12, sm: 3 }}>
                    <CustomFormLabel>Weekdays From</CustomFormLabel>
                    <CustomOutlinedInput fullWidth value={formData.workingDays.weekDays.from} onChange={(e) => handleWorkingDaysChange('weekDays', 'from', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <CustomFormLabel>Weekdays To</CustomFormLabel>
                    <CustomOutlinedInput fullWidth value={formData.workingDays.weekDays.to} onChange={(e) => handleWorkingDaysChange('weekDays', 'to', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <CustomFormLabel>Opening Time</CustomFormLabel>
                    <CustomOutlinedInput fullWidth value={formData.workingDays.weekDays.openingTime} onChange={(e) => handleWorkingDaysChange('weekDays', 'openingTime', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <CustomFormLabel>Closing Time</CustomFormLabel>
                    <CustomOutlinedInput fullWidth value={formData.workingDays.weekDays.closingTime} onChange={(e) => handleWorkingDaysChange('weekDays', 'closingTime', e.target.value)} />
                </Grid>

                {/* WeekEnds */}
                <Grid size={{ xs: 12, sm: 3 }}>
                    <CustomFormLabel>Weekends From</CustomFormLabel>
                    <CustomOutlinedInput fullWidth value={formData.workingDays.weekEnds.from} onChange={(e) => handleWorkingDaysChange('weekEnds', 'from', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <CustomFormLabel>Weekends To</CustomFormLabel>
                    <CustomOutlinedInput fullWidth value={formData.workingDays.weekEnds.to} onChange={(e) => handleWorkingDaysChange('weekEnds', 'to', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <CustomFormLabel>Opening Time</CustomFormLabel>
                    <CustomOutlinedInput fullWidth value={formData.workingDays.weekEnds.openingTime} onChange={(e) => handleWorkingDaysChange('weekEnds', 'openingTime', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <CustomFormLabel>Closing Time</CustomFormLabel>
                    <CustomOutlinedInput fullWidth value={formData.workingDays.weekEnds.closingTime} onChange={(e) => handleWorkingDaysChange('weekEnds', 'closingTime', e.target.value)} />
                </Grid>

                <Grid item size={{ xs: 12 }} mt={3}>
                    <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Update Address'}
                    </Button>
                </Grid>
            </Grid> 

            <Snackbar
                open={!!error || success}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                {error ? (
                    <Alert onClose={handleCloseSnackbar} severity="error">{error}</Alert>
                ) : (
                    <Alert onClose={handleCloseSnackbar} severity="success">Address updated successfully!</Alert>
                )}
            </Snackbar>
        </div>
    );
};

export default AddressEdit;
