import React, { useState, useEffect } from 'react';
import { Grid, Box, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import { getCreditsWallet, updateCreditsWallet } from '../../../services/creditsWalletService';
import { useNavigate, useParams } from 'react-router';

const CreditsWalletEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        newJobCreditsPrice: '',
        renewJobCreditsPrice: ''
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/dashboard/credits-wallet', title: 'Credits Wallet' },
        { title: 'Edit Wallet' },
    ];

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                const response = await getCreditsWallet(id);
                if (response.data) {
                    setFormData({
                        newJobCreditsPrice: response.data.newJobCreditsPrice,
                        renewJobCreditsPrice: response.data.renewJobCreditsPrice
                    });
                }
            } catch (err) {
                console.error("Failed to fetch wallet:", err);
                setError("Failed to load generic credits wallet data.");
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            fetchWalletData();
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
        if (formData.newJobCreditsPrice === '' || formData.renewJobCreditsPrice === '') {
            setError('Please fill all required fields completely.');
            return false;
        }
        if (isNaN(formData.newJobCreditsPrice) || isNaN(formData.renewJobCreditsPrice)) {
            setError('Prices must be valid numbers.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const dataToSubmit = {
                newJobCreditsPrice: parseInt(formData.newJobCreditsPrice, 10),
                renewJobCreditsPrice: parseInt(formData.renewJobCreditsPrice, 10),
            };

            const res = await updateCreditsWallet(id, dataToSubmit);
            if (res.status === 200 || res.data) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/dashboard/credits-wallet');
                }, 1500);
            }
        } catch (error) {
            setError(error.response?.data?.error || error.message || 'An error occurred during update.');
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
                <Breadcrumb title="Edit Credits Wallet" items={BCrumb} />
            </Box>
            <Grid container spacing={3} marginTop={2}>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="newJobCreditsPrice">New Job Credits Price *</CustomFormLabel>
                    <CustomOutlinedInput
                        id="newJobCreditsPrice"
                        name="newJobCreditsPrice"
                        type="number"
                        fullWidth
                        value={formData.newJobCreditsPrice}
                        onChange={handleChange}
                        placeholder="e.g. 50"
                    />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="renewJobCreditsPrice">Renew Job Credits Price *</CustomFormLabel>
                    <CustomOutlinedInput
                        id="renewJobCreditsPrice"
                        name="renewJobCreditsPrice"
                        type="number"
                        fullWidth
                        value={formData.renewJobCreditsPrice}
                        onChange={handleChange}
                        placeholder="e.g. 30"
                    />
                </Grid>

                <Grid item xs={12} mt={3}>
                    <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                    <Button variant="outlined" color="error" sx={{ ml: 2 }} onClick={() => navigate('/dashboard/credits-wallet')}>
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
                    <Alert onClose={handleCloseSnackbar} severity="success">Wallet updated successfully!</Alert>
                )}
            </Snackbar>
        </Box>
    );
};

export default CreditsWalletEdit;
