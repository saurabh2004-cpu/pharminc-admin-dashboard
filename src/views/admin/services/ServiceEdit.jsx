import React, { useState, useEffect } from 'react';
import { Grid, Box, CircularProgress, Alert, Snackbar, MenuItem, Select, FormControl } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import { getServiceById, updateService, getAllServices } from '../../../services/servicesService';
import { useNavigate, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const ServiceEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        description: '',
        relatedServices: [],
        clientsAssisted: '',
        highlight: '',
        startingFrom: '',
        fullDescription: '',
        shortDescriptionPoints: ''
    });

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchServicesAndData = async () => {
            try {
                const servicesRes = await getAllServices();
                if (servicesRes.data && servicesRes.data.data) {
                    setServices(servicesRes.data.data);
                } else if (servicesRes.data) {
                    setServices(servicesRes.data);
                }

                const res = await getServiceById(id);
                const data = res.data?.data || res.data;
                if (data) {
                    setFormData({
                        name: data.name || '',
                        title: data.title || '',
                        description: data.description || '',
                        relatedServices: data.relatedServices ? data.relatedServices.map(s => typeof s === 'object' ? s._id : s) : [],
                        clientsAssisted: data.clientsAssisted || '',
                        highlight: data.highlight || '',
                        startingFrom: data.startingFrom || '',
                        fullDescription: data.fullDescription || '',
                        shortDescriptionPoints: data.shortDescriptionPoints ? data.shortDescriptionPoints.join('\n') : ''
                    });
                }
            } catch (error) {
                setError('Failed to fetch data');
            } finally {
                setFetchLoading(false);
            }
        };

        if (id) {
            fetchServicesAndData();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.name || !formData.title || !formData.description) {
            setError('Please fill all required fields');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const submitData = {
                ...formData,
                shortDescriptionPoints: formData.shortDescriptionPoints
                    ? formData.shortDescriptionPoints.split('\n').map(p => p.trim()).filter(p => p !== '')
                    : []
            };
            const res = await updateService(id, submitData);
            if (res.status === 200 || res.data) {
                setSuccess(true);
                setTimeout(() => navigate('/dashboard/services/list'), 1500);
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
        { to: '/dashboard/services/list', title: 'Services' },
        { title: 'Edit Service' },
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
            <Breadcrumb title="Edit Service" items={BCrumb} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="name">Name *</CustomFormLabel>
                    <CustomOutlinedInput id="name" name="name" fullWidth value={formData.name} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="title">Title *</CustomFormLabel>
                    <CustomOutlinedInput id="title" name="title" fullWidth value={formData.title} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <CustomFormLabel htmlFor="description">Description *</CustomFormLabel>
                    <CustomOutlinedInput id="description" name="description" multiline rows={4} fullWidth value={formData.description} onChange={handleChange} />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <CustomFormLabel htmlFor="clientsAssisted">Clients Assisted</CustomFormLabel>
                    <CustomOutlinedInput id="clientsAssisted" name="clientsAssisted" placeholder="e.g. 2,500+" fullWidth value={formData.clientsAssisted} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <CustomFormLabel htmlFor="highlight">Highlight</CustomFormLabel>
                    <CustomOutlinedInput id="highlight" name="highlight" placeholder="e.g. Fast eligibility guidance" fullWidth value={formData.highlight} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <CustomFormLabel htmlFor="startingFrom">Starting From</CustomFormLabel>
                    <CustomOutlinedInput id="startingFrom" name="startingFrom" placeholder="e.g. ₹999" fullWidth value={formData.startingFrom} onChange={handleChange} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <CustomFormLabel htmlFor="fullDescription">Full Description</CustomFormLabel>
                    <CustomOutlinedInput id="fullDescription" name="fullDescription" multiline rows={6} placeholder="Enter full description details..." fullWidth value={formData.fullDescription} onChange={handleChange} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <CustomFormLabel htmlFor="shortDescriptionPoints">Short Description Points (One point per line)</CustomFormLabel>
                    <CustomOutlinedInput id="shortDescriptionPoints" name="shortDescriptionPoints" multiline rows={4} placeholder="Eligibility Checking Based On Income&#10;Guidance For Salaried Applicants&#10;Assistance With Document Preparation" fullWidth value={formData.shortDescriptionPoints} onChange={handleChange} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="relatedServices">Related Services</CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="relatedServices"
                            name="relatedServices"
                            multiple
                            value={formData.relatedServices}
                            onChange={handleChange}
                            displayEmpty
                        >
                            {services.map((service) => (
                                <MenuItem key={service._id || service.id} value={service._id || service.id}>
                                    {service.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item size={{ xs: 12 }} mt={3}>
                    <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Update Service'}
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
                    <Alert onClose={handleCloseSnackbar} severity="success">Service updated successfully!</Alert>
                )}
            </Snackbar>
        </div>
    );
};

export default ServiceEdit;
