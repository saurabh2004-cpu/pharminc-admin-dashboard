import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, MenuItem, CircularProgress, Alert, Snackbar, Chip, Autocomplete, TextField, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import CustomSelect from '../../../components/forms/theme-elements/CustomSelect';
import { getJobById, updateJob } from '../../../services/jobService';
import healthcareRoles from '../../../constants/healthcareRoles.json';

const currencies = [
    { value: "INR", label: "INR (₹)" },
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
];

const JobEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        role: '',
        jobType: '',
        workLocation: '',
        experienceLevel: '',
        salaryMin: '',
        salaryMax: '',
        salaryCurrency: '',
        shortDescription: '',
        fullDescription: '',
        requirements: '',
        applicationDeadline: '',
        contactEmail: '',
        contactPhone: '',
        contactPerson: '',
        additionalInfo: '',
        speciality: '',
        subSpeciality: '',
        city: '',
        country: '',
        skills: []
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Country / City State
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);

    // Skills dynamic list state
    const [skillInput, setSkillInput] = useState('');

    const [specialityOptions, setSpecialityOptions] = useState([]);
    const [subSpecialityOptions, setSubSpecialityOptions] = useState([]);

    useEffect(() => {
        if (formData.role && healthcareRoles[formData.role.toUpperCase()]) {
            setSpecialityOptions(Object.keys(healthcareRoles[formData.role.toUpperCase()]));
        } else {
            setSpecialityOptions([]);
        }
    }, [formData.role]);

    useEffect(() => {
        if (formData.role && formData.speciality && healthcareRoles[formData.role.toUpperCase()] && healthcareRoles[formData.role.toUpperCase()][formData.speciality]) {
            setSubSpecialityOptions(healthcareRoles[formData.role.toUpperCase()][formData.speciality]);
        } else {
            setSubSpecialityOptions([]);
        }
    }, [formData.role, formData.speciality]);

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
        const fetchJobData = async () => {
            try {
                const res = await getJobById(id);
                if (res.data && res.data.job) {
                    const job = res.data.job;
                    const city = job.city || job.institute?.city || '';
                    const country = job.country || job.institute?.country || '';

                    setFormData({
                        title: job.title || '',
                        role: job.role || '',
                        jobType: job.jobType || '',
                        workLocation: job.workLocation || '',
                        experienceLevel: job.experienceLevel || '',
                        salaryMin: job.salaryMin || '',
                        salaryMax: job.salaryMax || '',
                        salaryCurrency: job.salaryCurrency || '',
                        shortDescription: job.shortDescription || '',
                        fullDescription: job.fullDescription || '',
                        requirements: job.requirements || '',
                        applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
                        contactEmail: job.contactEmail || '',
                        contactPhone: job.contactPhone || '',
                        contactPerson: job.contactPerson || '',
                        additionalInfo: job.additionalInfo || '',
                        speciality: job.speciality || '',
                        subSpeciality: job.subSpeciality || '',
                        city: city,
                        country: country,
                        skills: job.skills || []
                    });
                    if (country) fetchCities(country);
                }
            } catch (err) {
                setError(err.message || 'Error fetching job details');
            } finally {
                setFetching(false);
            }
        };
        fetchJobData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, [name]: value };
            if (name === 'role' && value !== prev.role) {
                newData.speciality = '';
                newData.subSpeciality = '';
            }
            if (name === 'speciality' && value !== prev.speciality) {
                newData.subSpeciality = '';
            }
            return newData;
        });
    };

    const handleAddSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed && !formData.skills.includes(trimmed)) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data = {
                ...formData,
                salaryMin: parseFloat(formData.salaryMin),
                salaryMax: parseFloat(formData.salaryMax),
                applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : null
            };
            const res = await updateJob(id, data);
            if (res.data) {
                setSuccess(true);
                setTimeout(() => navigate('/dashboard/jobs'), 1500);
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to update job');
        } finally {
            setLoading(false);
        }
    };

    const BCrumb = [{ to: '/', title: 'Home' }, { to: '/dashboard/jobs', title: 'Job Management' }, { title: 'Edit Job' }];

    if (fetching) return <Box mt={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <PageContainer title="Edit Job" description="Edit job details">
            <Breadcrumb title="Edit Job" items={BCrumb} />
            <Grid container spacing={3} mt={2}>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="title">Job Title *</CustomFormLabel>
                    <CustomOutlinedInput id="title" name="title" fullWidth value={formData.title} onChange={handleChange} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="role">Role *</CustomFormLabel>
                    <CustomSelect id="role" name="role" fullWidth value={formData.role} onChange={handleChange}>
                        <MenuItem value="DOCTOR">Doctor</MenuItem>
                        <MenuItem value="NURSE">Nursing</MenuItem>
                        <MenuItem value="STUDENT">Student</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                    </CustomSelect>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="jobType">Job Type *</CustomFormLabel>
                    <CustomSelect id="jobType" name="jobType" fullWidth value={formData.jobType} onChange={handleChange}>
                        <MenuItem value="Full-time">Full-time</MenuItem>
                        <MenuItem value="Part-time">Part-time</MenuItem>
                        <MenuItem value="Contract">Contract</MenuItem>
                    </CustomSelect>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="workLocation">Work Location *</CustomFormLabel>
                    <CustomSelect id="workLocation" name="workLocation" fullWidth value={formData.workLocation} onChange={handleChange}>
                        <MenuItem value="On-site">On-site</MenuItem>
                        <MenuItem value="Remote">Remote</MenuItem>
                        <MenuItem value="Hybrid">Hybrid</MenuItem>
                    </CustomSelect>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="experienceLevel">Experience Level *</CustomFormLabel>
                    <CustomSelect id="experienceLevel" name="experienceLevel" fullWidth value={formData.experienceLevel} onChange={handleChange}>
                        <MenuItem value="Entry Level">Entry Level</MenuItem>
                        <MenuItem value="Mid Level">Mid Level</MenuItem>
                        <MenuItem value="Senior Level">Senior Level</MenuItem>
                        <MenuItem value="Expert Level">Expert Level</MenuItem>
                    </CustomSelect>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <Box display="flex" gap={2}>
                        <Box flex={1}>
                            <CustomFormLabel>Salary Min</CustomFormLabel>
                            <CustomOutlinedInput name="salaryMin" type="number" fullWidth value={formData.salaryMin} onChange={handleChange} />
                        </Box>
                        <Box flex={1}>
                            <CustomFormLabel>Salary Max</CustomFormLabel>
                            <CustomOutlinedInput name="salaryMax" type="number" fullWidth value={formData.salaryMax} onChange={handleChange} />
                        </Box>
                        <Box flex={0.5}>
                            <CustomFormLabel>Currency</CustomFormLabel>
                            <CustomSelect id="salaryCurrency" name="salaryCurrency" fullWidth value={formData.salaryCurrency} onChange={handleChange}>
                                {currencies.map((currency) => (
                                    <MenuItem key={currency.value} value={currency.value}>
                                        {currency.label}
                                    </MenuItem>
                                ))}
                            </CustomSelect>
                        </Box>
                    </Box>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="speciality">Speciality</CustomFormLabel>
                    <CustomSelect
                        id="speciality"
                        name="speciality"
                        fullWidth
                        value={formData.speciality}
                        onChange={handleChange}
                        disabled={!formData.role || specialityOptions.length === 0}
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        {specialityOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </CustomSelect>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="subSpeciality">SubSpeciality</CustomFormLabel>
                    <CustomSelect
                        id="subSpeciality"
                        name="subSpeciality"
                        fullWidth
                        value={formData.subSpeciality}
                        onChange={handleChange}
                        disabled={!formData.speciality || subSpecialityOptions.length === 0}
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        {subSpecialityOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </CustomSelect>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel>Country</CustomFormLabel>
                    <Autocomplete
                        options={countries}
                        value={formData.country || null}
                        onChange={handleCountryChange}
                        renderInput={(params) => <TextField {...params} variant="outlined" fullWidth />}
                    />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel>City</CustomFormLabel>
                    <Autocomplete
                        options={cities}
                        value={formData.city || null}
                        onChange={(e, val) => setFormData(prev => ({ ...prev, city: val || '' }))}
                        loading={loadingCities}
                        freeSolo
                        onInputChange={(e, val, reason) => { if (reason === 'input') setFormData(prev => ({ ...prev, city: val })) }}
                        renderInput={(params) => <TextField {...params} variant="outlined" fullWidth />}
                    />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel>Application Deadline</CustomFormLabel>
                    <CustomOutlinedInput name="applicationDeadline" type="date" fullWidth value={formData.applicationDeadline} onChange={handleChange} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel>Contact Person</CustomFormLabel>
                    <CustomOutlinedInput name="contactPerson" fullWidth value={formData.contactPerson} onChange={handleChange} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel>Contact Email</CustomFormLabel>
                    <CustomOutlinedInput disabled name="contactEmail" fullWidth value={formData.contactEmail} onChange={handleChange} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel>Contact Phone</CustomFormLabel>
                    <CustomOutlinedInput name="contactPhone" fullWidth value={formData.contactPhone} onChange={handleChange} />
                </Grid>
                <Grid item size={{ xs: 12 }}>
                    <CustomFormLabel>Skills</CustomFormLabel>
                    <Box display="flex" gap={1} mb={2}>
                        <CustomOutlinedInput fullWidth value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()} />
                        <Button variant="contained" onClick={handleAddSkill} startIcon={<IconPlus size="1.2rem" />}>Add</Button>
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {formData.skills.map((skill, index) => (
                            <Chip key={index} label={skill} onDelete={() => handleRemoveSkill(skill)} deleteIcon={<IconTrash size="1rem" />} />
                        ))}
                    </Box>
                </Grid>
                <Grid item size={{ xs: 12 }}>
                    <CustomFormLabel>Short Description</CustomFormLabel>
                    <CustomOutlinedInput name="shortDescription" multiline rows={2} fullWidth value={formData.shortDescription} onChange={handleChange} />
                </Grid>
                <Grid item size={{ xs: 12 }}>
                    <CustomFormLabel>Full Description</CustomFormLabel>
                    <CustomOutlinedInput name="fullDescription" multiline rows={4} fullWidth value={formData.fullDescription} onChange={handleChange} />
                </Grid>
                <Grid item size={{ xs: 12 }}>
                    <CustomFormLabel>Requirements</CustomFormLabel>
                    <CustomOutlinedInput name="requirements" multiline rows={4} fullWidth value={formData.requirements} onChange={handleChange} />
                </Grid>
                <Grid item size={{ xs: 12 }}>
                    <CustomFormLabel>Additional Info</CustomFormLabel>
                    <CustomOutlinedInput name="additionalInfo" multiline rows={2} fullWidth value={formData.additionalInfo} onChange={handleChange} />
                </Grid>
                <Grid item size={{ xs: 12 }} mt={3}>
                    <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading} size="large">
                        {loading ? <CircularProgress size={24} /> : 'Update Job'}
                    </Button>
                </Grid>
            </Grid>
            <Snackbar open={!!error || success} autoHideDuration={6000} onClose={() => { setError(''); setSuccess(false); }}>
                <Alert severity={error ? "error" : "success"}>{error || "Job updated successfully!"}</Alert>
            </Snackbar>
        </PageContainer>
    );
};

export default JobEdit;
