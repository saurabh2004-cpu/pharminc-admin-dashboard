import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    CircularProgress,
    Snackbar,
    Alert,
    FormControl,
    Select,
    MenuItem,
    Autocomplete,
    InputLabel,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { getUserById, updateUser } from '../../../services/userService';

const BCrumb = [
    { to: '/', title: 'Home' },
    { to: '/dashboard/users/list', title: 'Users' },
    { title: 'Edit User' },
];

const UserEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        headline: '',
        about: '',
        degree: '',
        university: '',
        yearOfStudy: '',
        specialization: '',
        experience: '',
        speciality: '',
        subSpeciality: '',
        city: '',
        country: '',
        role: '',
    });

    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);

    useEffect(() => {
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

    const handleCountryChange = async (event, newValue) => {
        setFormData(prev => ({ ...prev, country: newValue || '', city: '' }));
        setCities([]);
        if (newValue) fetchCities(newValue);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getUserById(id);
                if (response.data) {
                    const d = response.data;
                    setFormData({
                        firstName: d.firstName || '',
                        lastName: d.lastName || '',
                        email: d.email || '',
                        gender: d.gender || '',
                        headline: d.headline || '',
                        about: d.about || '',
                        degree: d.degree || '',
                        university: d.university || '',
                        yearOfStudy: d.yearOfStudy || '',
                        specialization: d.specialization || '',
                        experience: d.experience ? String(d.experience) : '',
                        speciality: d.speciality || '',
                        subSpeciality: d.subSpeciality || '',
                        city: d.city || '',
                        country: d.country || '',
                        role: d.role || '',
                    });

                    if (d.country) {
                        fetchCities(d.country);
                    }
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError(err.response?.data?.error || err.message || "Failed to load user details");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const dataToUpdate = {
                ...formData,
                experience: formData.experience ? parseInt(formData.experience, 10) : null
            };

            await updateUser(id, dataToUpdate);
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard/users/list');
            }, 1000);
        } catch (err) {
            console.error("Error updating user:", err);
            setError(err.response?.data?.error || err.message || "Failed to edit user");
        } finally {
            setSaving(false);
        }
    };

    const handleCloseSnackbar = () => {
        setError(null);
        setSuccess(false);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <PageContainer title="Edit User" description="Edit an existing user profile">
            <Breadcrumb title="Edit User" items={BCrumb} />

            <ParentCard title="User Details">
                <Grid container spacing={3}>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled // Typically email shouldn't be edited easily, but leaving it disabled for safety depending on auth mechanics
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                label="Role"
                            >
                                <MenuItem value="DOCTOR">Doctor</MenuItem>
                                <MenuItem value="NURSE">Nurse</MenuItem>
                                <MenuItem value="STUDENT">Student</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Headline"
                            name="headline"
                            value={formData.headline}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="About"
                            name="about"
                            multiline
                            rows={4}
                            value={formData.about}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Degree"
                            name="degree"
                            value={formData.degree}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="University"
                            name="university"
                            value={formData.university}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Year of Study"
                            name="yearOfStudy"
                            value={formData.yearOfStudy}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Specialization"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Experience (Years)"
                            name="experience"
                            type="number"
                            value={formData.experience}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Speciality"
                            name="speciality"
                            value={formData.speciality}
                            onChange={handleInputChange}
                        />
                    </Grid>



                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Sub Speciality"
                            name="subSpeciality"
                            value={formData.subSpeciality}
                            onChange={handleInputChange}
                        />
                    </Grid>

                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <Autocomplete
                            id="country"
                            options={countries}
                            value={formData.country || null}
                            onChange={handleCountryChange}
                            renderInput={(params) => <TextField {...params} label="Country" variant="outlined" fullWidth />}
                        />
                    </Grid>

                    <Grid item size={{ xs: 12, sm: 6 }}>
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
                                    label="City"
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



                    <Grid item size={{ xs: 12 }}>
                        <Box display="flex" justifyContent="flex-end" gap={2}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => navigate('/dashboard/users/list')}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </ParentCard>

            <Snackbar
                open={!!error || success}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
                    {error || "User updated successfully!"}
                </Alert>
            </Snackbar>
        </PageContainer>
    );
};

export default UserEdit;
