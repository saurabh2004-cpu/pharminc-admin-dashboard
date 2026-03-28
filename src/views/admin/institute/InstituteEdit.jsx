import React, { useEffect } from 'react';
import { Grid, Box, Typography, MenuItem, Switch, FormControlLabel, CircularProgress, Alert, Snackbar, Chip, Autocomplete, IconButton, InputAdornment, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import CustomSelect from '../../../components/forms/theme-elements/CustomSelect';
import { IconTrash, IconPlus, IconEye, IconEyeOff } from '@tabler/icons-react';
import { getInstituteById, updateInstitute } from '../../../services/instituteService';
import { useNavigate, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const InstituteEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = React.useState({
        name: '',
        contactEmail: '',
        contactNumber: '',
        telephone: '',
        type: '',
        city: '',
        country: '',
        ownership: '',
        headline: '',
        about: '',
        affiliatedUniversity: '',
        bedsCount: '',
        staffCount: '',
        yearEstablished: '',
        role: 'HOSPITAL',
        services: '',
        verified: false,
    });

    const [loading, setLoading] = React.useState(false);
    const [fetching, setFetching] = React.useState(true);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);

    // Country / City State
    const [countries, setCountries] = React.useState([]);
    const [cities, setCities] = React.useState([]);
    const [loadingCities, setLoadingCities] = React.useState(false);

    // Fetch Countries on load
    React.useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch('https://countriesnow.space/api/v0.1/countries/positions');
                const data = await response.json();
                const countryOptions = data.data.map((c) => c.name).sort();
                setCountries(countryOptions);
            } catch (err) {
                console.error('Failed to fetch countries', err);
            }
        };
        fetchCountries();
    }, []);

    // Fetch Cities based on given Country
    const fetchCities = async (countryName) => {
        if (!countryName) return;
        setLoadingCities(true);
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: countryName })
            });
            const data = await response.json();
            if (!data.error && data.data) {
                setCities(data.data.sort());
            } else {
                setCities([]);
            }
        } catch (err) {
            console.error('Failed to fetch cities', err);
            setCities([]);
        } finally {
            setLoadingCities(false);
        }
    };

    // Load cities upon a new manual country selection
    const handleCountryChange = async (event, newValue) => {
        setFormData(prev => ({ ...prev, country: newValue || '', city: null })); // Reset city explicit null
        setCities([]);
        if (newValue) fetchCities(newValue);
    };

    // Calculate years array natively
    const currentYear = new Date().getFullYear();
    const yearsList = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => (1950 + i).toString()).reverse();

    // Services dynamic list state
    const [serviceInput, setServiceInput] = React.useState('');
    const [servicesList, setServicesList] = React.useState([]);

    const handleAddService = () => {
        const trimmedService = serviceInput.trim();
        if (!trimmedService) return;

        // Prevent duplicate services
        if (servicesList.includes(trimmedService)) {
            setError('Service already added');
            return;
        }

        setServicesList(prev => [...prev, trimmedService]);
        setServiceInput('');
        setError('');
    };

    const handleRemoveService = (serviceToRemove) => {
        setServicesList(prev => prev.filter(service => service !== serviceToRemove));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const fetchInstitute = async () => {
        try {
            const res = await getInstituteById(id);
            console.log("get institute ", res.data);
            if (res.data) {
                const data = res.data;
                setFormData({
                    name: data.name || '',
                    contactEmail: data.contactEmail || '',
                    contactNumber: data.contactNumber || '',
                    telephone: data.telephone || '',
                    type: data.type || '',
                    city: data.city || '',
                    country: data.country || '',
                    ownership: data.ownership || '',
                    headline: data.headline || '',
                    about: data.about || '',
                    affiliatedUniversity: data.affiliatedUniversity || '',
                    bedsCount: data.bedsCount || '',
                    staffCount: data.staffCount || '',
                    yearEstablished: data.yearEstablished || '',
                    role: data.role || 'HOSPITAL',
                    services: '', // Will be handled by servicesList
                    verified: data.verified
                });

                // Fetch related cities explicitly if a country exists initially 
                if (data.country) {
                    fetchCities(data.country);
                }

                // Load existing services into the dynamic list array
                if (data.services && Array.isArray(data.services)) {
                    setServicesList(data.services);
                }
            }
        } catch (error) {
            setError(error.message || 'Error fetching institute details');
            console.error(error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (id) fetchInstitute();
    }, [id]);

    const validateForm = () => {
        if (!formData.name || !formData.contactEmail || !formData.contactNumber || !formData.role) {
            setError('Please fill all required fields');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const dataToSubmit = { ...formData };

            dataToSubmit.services = servicesList;
            dataToSubmit.bedsCount = parseInt(formData.bedsCount) || 0;
            dataToSubmit.staffCount = parseInt(formData.staffCount) || 0;
            dataToSubmit.yearEstablished = parseInt(formData.yearEstablished) || 0;

            const res = await updateInstitute(id, dataToSubmit);
            if (res.status === 200 || res.data) {
                setSuccess(true);
                setTimeout(() => navigate('/dashboard/institutes/list'), 1500);
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
        { title: 'Edit Institute' },
    ];

    if (fetching) return <Box mt={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <div>
            <Breadcrumb title="Edit Institute" items={BCrumb} />
            <Grid container spacing={3} marginTop={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="name">Name *</CustomFormLabel>
                    <CustomOutlinedInput id="name" name="name" fullWidth value={formData.name} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="contactEmail">Contact Email *</CustomFormLabel>
                    <CustomOutlinedInput id="contactEmail" type="email" name="contactEmail" fullWidth disabled value={formData.contactEmail} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="contactNumber">Contact Number *</CustomFormLabel>
                    <CustomOutlinedInput id="contactNumber" name="contactNumber" fullWidth value={formData.contactNumber} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="telephone">Telephone</CustomFormLabel>
                    <CustomOutlinedInput id="telephone" name="telephone" fullWidth value={formData.telephone} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="type">Type *</CustomFormLabel>
                    <CustomOutlinedInput id="type" name="type" fullWidth value={formData.type} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="country">Country</CustomFormLabel>
                    <Autocomplete
                        id="country"
                        options={countries}
                        value={formData.country || null}
                        onChange={handleCountryChange}
                        renderInput={(params) => <TextField {...params} placeholder="Select Country" variant="outlined" fullWidth />}
                    />
                </Grid>
                {/* Row 1: City | Ownership */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="city">City</CustomFormLabel>
                    <Autocomplete
                        id="city"
                        options={cities}
                        value={formData.city || null}
                        onChange={(e, val) => setFormData(prev => ({ ...prev, city: val || '' }))}
                        loading={loadingCities}
                        freeSolo
                        onInputChange={(event, newInputValue, reason) => {
                            if (reason === 'input') {
                                setFormData(prev => ({ ...prev, city: newInputValue || '' }));
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Select or type City"
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {loadingCities ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="ownership">Ownership</CustomFormLabel>
                    <CustomOutlinedInput id="ownership" name="ownership" fullWidth value={formData.ownership} onChange={handleChange} />
                </Grid>

                {/* Row 2: Affiliated University | Year Established */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="affiliatedUniversity">Affiliated University</CustomFormLabel>
                    <CustomOutlinedInput id="affiliatedUniversity" name="affiliatedUniversity" fullWidth value={formData.affiliatedUniversity} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="yearEstablished">Year Established</CustomFormLabel>
                    <Autocomplete
                        id="yearEstablished"
                        options={yearsList}
                        value={formData.yearEstablished ? formData.yearEstablished.toString() : null}
                        onChange={(e, val) => setFormData(prev => ({ ...prev, yearEstablished: val ? parseInt(val, 10) : '' }))}
                        renderInput={(params) => <TextField {...params} placeholder="Select Year" variant="outlined" fullWidth />}
                    />
                </Grid>

                {/* Row 3: Beds Count | Staff Count */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="bedsCount">Beds Count *</CustomFormLabel>
                    <CustomOutlinedInput id="bedsCount" name="bedsCount" type="number" fullWidth value={formData.bedsCount} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="staffCount">Staff Count *</CustomFormLabel>
                    <CustomOutlinedInput id="staffCount" name="staffCount" type="number" fullWidth value={formData.staffCount} onChange={handleChange} />
                </Grid>

                {/* Row 4: Role | Services */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="role">Role *</CustomFormLabel>
                    <CustomSelect id="role" name="role" value={formData.role} onChange={handleChange} fullWidth>
                        <MenuItem value="HOSPITAL">HOSPITAL</MenuItem>
                        <MenuItem value="CLINIC">CLINIC</MenuItem>
                        <MenuItem value="LAB">LAB</MenuItem>
                        <MenuItem value="PHARMACY">PHARMACY</MenuItem>
                    </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="services">Services</CustomFormLabel>
                    <Box display="flex" gap={1} mb={2}>
                        <CustomOutlinedInput
                            id="services"
                            name="services"
                            fullWidth
                            value={serviceInput}
                            onChange={(e) => setServiceInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddService();
                                }
                            }}
                            placeholder="e.g. Emergency"
                        />
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleAddService}
                            startIcon={<IconPlus size="1.2rem" />}
                            sx={{ minWidth: "100px" }}
                        >
                            Add
                        </Button>
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {servicesList.map((service, index) => (
                            <Chip
                                key={index}
                                label={service}
                                onDelete={() => handleRemoveService(service)}
                                deleteIcon={<IconTrash size="1rem" />}
                                sx={{
                                    borderRadius: '20px',
                                    px: 0.5,
                                    py: 0.5,
                                    bgcolor: '#f5f5f5',
                                    '& .MuiChip-deleteIcon': {
                                        opacity: 0,
                                        transition: 'opacity 0.2s',
                                        color: '#d32f2f'
                                    },
                                    '&:hover .MuiChip-deleteIcon': {
                                        opacity: 1
                                    }
                                }}
                            />
                        ))}
                    </Box>
                </Grid>

                {/* Row 5: Place Headline (full width) */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="headline">Headline</CustomFormLabel>
                    <CustomOutlinedInput id="headline" name="headline" fullWidth value={formData.headline} onChange={handleChange} />
                </Grid>

                {/* Row 6: About (full width) */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="about">About</CustomFormLabel>
                    <CustomOutlinedInput id="about" name="about" multiline rows={4} fullWidth value={formData.about} onChange={handleChange} />
                </Grid>

                {/* Row 7: Status (full width) */}
                {/* <Grid size={12}>
                    <CustomFormLabel>Status</CustomFormLabel>
                    <FormControlLabel
                        control={<Switch checked={formData.verified} onChange={handleChange} name="verified" color="primary" />}
                        label={formData.verified ? "Verified" : "Not Verified"}
                    />
                </Grid> */}

                <Grid size={12} mt={3}>
                    <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Update Institute'}
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
                    <Alert onClose={handleCloseSnackbar} severity="success">Institute updated successfully!</Alert>
                )}
            </Snackbar>
        </div>
    );
};

export default InstituteEdit;
