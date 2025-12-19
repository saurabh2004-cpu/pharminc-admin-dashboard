import React, { useEffect } from 'react';
import {
    Grid,
    Button,
    Typography,
    Box,
    FormControl,
    MenuItem,
    Select,
    CircularProgress
} from '@mui/material';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const EditMetaData = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = React.useState({
        page: '',
        title: '',
        description: '',
        keywords: '',
    });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [fetchingData, setFetchingData] = React.useState(true);
    const [pages] = React.useState([
        'home',
        'brand',
        'point-accessories',
        "asra-aromas",
        "matador-wholesale",
        'cart',
        'checkout',
        'contact-us',
        'login',
        'my-account-review',
        'point-accessories',
        'product-details',
        "product-listing",
        'reset-password',
        'salesRep',
        'search',
        'sign-up',
        'thank-you',
        'wishlist',
        'our-story',
        'privacy-policy',
        'terms-and-conditions',
        'sales-rep-login'
    ]);

    // Fetch existing metadata by ID
    useEffect(() => {
        const fetchMetaData = async () => {
            try {
                setFetchingData(true);
                const res = await axiosInstance.get(`/meta-data/get-meta-data/${id}`);

                if (res.data.statusCode === 200 && res.data.data) {
                    const { page, title, description, keywords } = res.data.data;
                    setFormData({
                        page: page || '',
                        title: title || '',
                        description: description || '',
                        keywords: keywords || '',
                    });
                } else {
                    setError('Failed to fetch metadata');
                }
            } catch (error) {
                setError(error.response?.data?.message || error.message || 'Failed to fetch metadata');
                console.error('Error fetching metadata:', error);
            } finally {
                setFetchingData(false);
            }
        };

        if (id) {
            fetchMetaData();
        } else {
            setError('No metadata ID provided');
            setFetchingData(false);
        }
    }, [id]);

    const handleSubmit = async () => {
        // Form validation
        if (!formData.title || !formData.description || !formData.keywords) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const updateData = {
                title: formData.title,
                description: formData.description,
                keywords: formData.keywords,
            };

            const res = await axiosInstance.put(`/meta-data/update-meta-data/${id}`, updateData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // console.log("Meta data update response:", res.data);

            if (res.data.statusCode === 200) {
                setError('Meta data updated successfully!');
                setTimeout(() => {
                    navigate('/dashboard/meta-data/list');
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred');
            console.error('Update error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (e) => {
        setFormData({ ...formData, page: e.target.value });
    };

    const handleCancel = () => {
        navigate('/dashboard/meta-data/list');
    };

    if (fetchingData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading metadata...</Typography>
            </Box>
        );
    }

    const BCrumb = [
        {
            to: '/',
            title: 'Home',
        },
        {
            title: 'Edit Meta Data',
        },
    ];


    return (
        <div>
            <Breadcrumb title="Edit Meta Data" items={BCrumb} />



            <Grid container>
                {/* Page Selection (Read-only/Disabled) */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="page-select" sx={{ mt: 2 }}>
                        Page <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <Select
                            id="page-select"
                            value={formData.page}
                            onChange={handlePageChange}
                            disabled={true}
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
                                Select a page
                            </MenuItem>
                            {Array.isArray(pages) && pages.map((page) => (
                                <MenuItem key={page} value={page}>
                                    {page}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                        Page cannot be changed during update
                    </Typography>
                </Grid>

                {/* Page Title */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="page-title" sx={{ mt: 2 }}>
                        Page Title <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="page-title"
                        fullWidth
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter page title"
                        disabled={loading}
                    />
                </Grid>

                {/* Page Description */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="page-description" sx={{ mt: 2 }}>
                        Page Description <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="page-description"
                        fullWidth
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter page description"
                        disabled={loading}
                    />
                </Grid>

                {/* Page Keywords */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="page-keywords" sx={{ mt: 2 }}>
                        Page Keywords <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="page-keywords"
                        fullWidth
                        type="text"
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        placeholder="Enter page keywords"
                        disabled={loading}
                    />
                </Grid>

                {/* Error/Success Message */}
                {error && (
                    <Grid size={12} sx={{ mt: 2 }}>
                        <Box sx={{
                            color: error.includes('success') ? 'green' : 'red',
                            padding: '12px',
                            borderRadius: '4px',
                            backgroundColor: error.includes('success') ? '#f0fdf4' : '#fef2f2',
                            border: `1px solid ${error.includes('success') ? '#22c55e' : '#ef4444'}`
                        }}>
                            {error}
                        </Box>
                    </Grid>
                )}

                {/* Action Buttons */}
                <Grid size={12} sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading || fetchingData}
                        sx={{ mr: 2, backgroundColor: '#2E2F7F' }}
                    >
                        {loading ? 'Updating...' : 'Update'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default EditMetaData;