import React, { useState } from 'react';
import { Grid, Box, CircularProgress, Alert, Snackbar, MenuItem, Select, FormControl } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import { createLabel } from '../../../services/labelService';
import { useNavigate } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const LabelCreate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        type: 'city',
        isFeatured: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.name) {
            setError('Please enter a name for the label');
            return false;
        }
        if (!formData.type) {
            setError('Please select a label type');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const res = await createLabel(formData);
            if (res.status === 201 || res.data) {
                setSuccess(true);
                setTimeout(() => navigate('/dashboard/labels/list'), 1500);
            }
        } catch (error) {
            const errDetails = error.response?.data?.message || error.response?.data?.error || error.message;
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
        { to: '/dashboard/labels/list', title: 'Labels' },
        { title: 'Create Label' },
    ];

    return (
        <div>
            <Breadcrumb title="Create Label" items={BCrumb} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="name">Name *</CustomFormLabel>
                    <CustomOutlinedInput id="name" name="name" fullWidth value={formData.name} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="type">Type *</CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <MenuItem value="city">City</MenuItem>
                            <MenuItem value="state">State</MenuItem>
                            <MenuItem value="bank">Bank</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="isFeatured">Is Featured</CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="isFeatured"
                            name="isFeatured"
                            value={formData.isFeatured}
                            onChange={handleChange}
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item size={{ xs: 12 }} mt={3}>
                    <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Create Label'}
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
                    <Alert onClose={handleCloseSnackbar} severity="success">Label created successfully!</Alert>
                )}
            </Snackbar>
        </div>
    );
};

export default LabelCreate;
