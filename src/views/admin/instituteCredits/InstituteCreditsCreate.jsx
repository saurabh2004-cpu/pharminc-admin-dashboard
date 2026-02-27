import React, { useState, useEffect } from 'react';
import { Grid, Box, Button, CircularProgress, Snackbar, Alert, Autocomplete, TextField } from '@mui/material';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import { createInstituteCredits } from '../../../services/instituteCreditsService';
import { getInstitutes } from '../../../services/instituteService';
import { useNavigate } from 'react-router';

const InstituteCreditsCreate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        instituteId: null,
        credits: ''
    });

    const [institutes, setInstitutes] = useState([]);
    const [loadingInstitutes, setLoadingInstitutes] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/dashboard/institute-credits', title: 'Institute Credits' },
        { title: 'Allocate Credits' },
    ];

    useEffect(() => {
        const fetchInstitutes = async () => {
            setLoadingInstitutes(true);
            try {
                // Fetch basic institute list for autocompletion
                const response = await getInstitutes();
                if (response.data && response.data.institutes) {
                    setInstitutes(response.data.institutes);
                }
            } catch (err) {
                console.error("Failed to load institutes:", err);
                setError("Could not load institutes for selection.");
            } finally {
                setLoadingInstitutes(false);
            }
        };
        fetchInstitutes();
    }, []);

    const handleCreditsChange = (e) => {
        setFormData(prev => ({
            ...prev,
            credits: e.target.value
        }));
    };

    const validateForm = () => {
        if (!formData.instituteId) {
            setError('Please select an Institute.');
            return false;
        }
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
                instituteId: formData.instituteId,
                credits: parseInt(formData.credits, 10),
            };

            const res = await createInstituteCredits(dataToSubmit);
            if (res.status === 201 || res.data) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/dashboard/institute-credits');
                }, 1500);
            }
        } catch (error) {
            setError(error.response?.data?.error || error.message || 'An error occurred allocating credits.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccess(false);
        setError('');
    };

    return (
        <Box>
            <Box sx={{ pt: '10px' }}>
                <Breadcrumb title="Allocate Institute Credits" items={BCrumb} />
            </Box>
            <Grid container spacing={3} marginTop={2}>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="institute-select">Select Institute *</CustomFormLabel>
                    <Autocomplete
                        id="institute-select"
                        options={institutes}
                        getOptionLabel={(option) => option.name || ''}
                        loading={loadingInstitutes}
                        value={institutes.find(inst => inst.id === formData.instituteId) || null}
                        onChange={(event, newValue) => {
                            setFormData(prev => ({ ...prev, instituteId: newValue ? newValue.id : null }));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search Institute"
                                variant="outlined"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {loadingInstitutes ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                    />
                </Grid>

                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="credits">Initial Credits Amount *</CustomFormLabel>
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
                    <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading || loadingInstitutes}>
                        {loading ? <CircularProgress size={24} /> : 'Allocate Credits'}
                    </Button>
                    <Button variant="outlined" color="error" sx={{ ml: 2 }} onClick={() => navigate('/dashboard/institute-credits')}>
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
                    <Alert onClose={handleCloseSnackbar} severity="success">Credits allocated successfully!</Alert>
                )}
            </Snackbar>
        </Box>
    );
};

export default InstituteCreditsCreate;
