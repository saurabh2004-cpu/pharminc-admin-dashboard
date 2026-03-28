import React, { useState, useEffect } from 'react';
import { Grid, Box, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import { getInstituteCredits, updateInstituteCredits } from '../../../services/instituteCreditsService';
import { useNavigate, useParams } from 'react-router';

const InstituteCreditsEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        instituteName: '',
        credits: ''
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/dashboard/institute-credits', title: 'Institute Credits' },
        { title: 'Edit Credits' },
    ];

    useEffect(() => {
        const fetchCreditsData = async () => {
            try {
                const response = await getInstituteCredits(id);
                if (response.data) {
                    setFormData({
                        instituteName: response.data.institute?.name || 'Unknown Institute',
                        credits: response.data.credits
                    });
                }
            } catch (err) {
                console.error("Failed to fetch institute credits:", err);
                setError("Failed to load institute credit data.");
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            fetchCreditsData();
        }
    }, [id]);

    const handleCreditsChange = (e) => {
        setFormData(prev => ({
            ...prev,
            credits: e.target.value
        }));
    };

    const validateForm = () => {
        if (formData.credits === '') {
            setError('Please assign an initial credits amount.');
            return false;
        }
        if (isNaN(formData.credits) || parseInt(formData.credits, 10) < 0) {
            setError('Credits must be a non-negative valid number.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const dataToSubmit = {
                credits: parseInt(formData.credits, 10),
            };

            const res = await updateInstituteCredits(id, dataToSubmit);
            if (res.status === 200 || res.data) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/dashboard/institute-credits');
                }, 1500);
            }
        } catch (error) {
            setError(error.response?.data?.error || error.message || 'An error occurred updating credits.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccess(false);
        setError('');
    };

    if (fetching) return <Box mt={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ pt: '10px' }}>
                <Breadcrumb title="Edit Institute Credits" items={BCrumb} />
            </Box>
            <Grid container spacing={3} marginTop={2}>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="instituteName">Assigned Institute</CustomFormLabel>
                    <CustomOutlinedInput
                        id="instituteName"
                        name="instituteName"
                        type="text"
                        fullWidth
                        disabled
                        value={formData.instituteName}
                    />
                </Grid>

                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="credits">Current Credits Balance *</CustomFormLabel>
                    <CustomOutlinedInput
                        id="credits"
                        name="credits"
                        type="number"
                        fullWidth
                        value={formData.credits}
                        onChange={handleCreditsChange}
                        placeholder="e.g. 100"
                    />
                </Grid>

                <Grid item xs={12} mt={3}>
                    <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Save Credits'}
                    </Button>
                    <Button variant="outlined" color="secondary" sx={{ ml: 2 }} onClick={() => navigate('/dashboard/institute-credits')}>
                        Cancel
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
                    <Alert onClose={handleCloseSnackbar} severity="success">Credits updated successfully!</Alert>
                )}
            </Snackbar>
        </Box>
    );
};

export default InstituteCreditsEdit;
