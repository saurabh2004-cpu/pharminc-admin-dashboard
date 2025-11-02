import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconBuildingArch, IconMail, IconMessage2, IconPhone, IconUser } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import { Autocomplete, TextField } from '@mui/material';

const CreateCategory = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        slug: '',
        brand: ''
    });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const [brandsList, setBrandsList] = React.useState([]);
    const { id } = useParams();
    const [category, setCategory] = React.useState({});

    // Determine if this is edit mode or create mode
    const isEditMode = Boolean(id);

    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = name.trim().replace(/\s+/g, '-')?.toLowerCase();

        setFormData({
            ...formData,
            name: name,
            slug: slug,
        });
    };

    const handleBrandChange = (e) => {
        setFormData({
            ...formData,
            brand: e.target.value // This will be the brand ID
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.name.trim()) {
            setError('Category name is required');
            return;
        }
        if (!formData.brand) {
            setError('Please select a brand');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let res;

            if (isEditMode) {
                // Update existing category
                res = await axiosInstance.put(`/category/update-category/${id}`, formData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log("Update category response:", res);
            } else {
                // Create new category
                res = await axiosInstance.post('/category/create-category', formData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log("Create category response:", res);
            }

            if (res.data.statusCode === 200) {
                // Reset form on success (only for create mode)
                if (!isEditMode) {
                    setFormData({
                        name: '',
                        slug: '',
                        brand: ''
                    });
                }

                navigate('/dashboard/category/list');

            } else if (res.data.statusCode === 400) {
                console.log("Category operation error:", res.data.message);
                setError(res.data.message || 'Operation failed');
            }

        } catch (error) {
            console.error('Category operation error:', error);
            setError(error.response?.data?.message || error.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
        } finally {
            setLoading(false);
        }
    };

    const fetchBrandsList = async () => {
        try {
            const response = await axiosInstance.get('/brand/get-brands-list');
            console.log("response brands", response.data);

            if (response.data.statusCode === 200) {
                setBrandsList(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching brands list:', error);
            setError('Failed to fetch brands list');
        }
    };

    const fetchCategory = async () => {
        if (!id) return; // Don't fetch if no ID (create mode)

        try {
            const res = await axiosInstance.get(`/category/get-category/${id}`);
            console.log("res", res)

            if (res.data.statusCode === 200) {
                const categoryData = res.data.data;
                setFormData({
                    name: categoryData.name || '',
                    slug: categoryData.slug || '',
                    brand: categoryData.brand?._id || ''
                });
                setCategory(categoryData);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Failed to fetch category');
            console.error('Fetch category error:', error);
        }
    };

    const handleClear = () => {
        if (isEditMode) {
            // In edit mode, restore original values
            if (category) {
                setFormData({
                    name: category.name || '',
                    slug: category.slug || '',
                    brand: category.brand?._id || ''
                });
            }
        } else {
            // In create mode, clear all fields
            setFormData({ name: '', slug: '', brand: '' });
        }
        setError('');
    };

    useEffect(() => {
        fetchBrandsList();
    }, []);

    useEffect(() => {
        if (isEditMode) {
            fetchCategory();
        }
    }, [id, isEditMode]);

    return (
        <div>
            <Grid container spacing={2}>
                {/* Category Name */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="category-name"
                        sx={{ mt: 0 }}
                    >
                        Category Name
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="category-name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => handleNameChange(e)}
                        disabled={loading}
                        placeholder="Enter category name"
                    />
                </Grid>

                {/* Brand Selection */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="brand-select"
                        sx={{ mt: 2 }}
                    >
                        Select Brand
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <Autocomplete
                            id="brand-select"
                            value={brandsList.find(brand => brand._id === formData.brand) || null}
                            onChange={(event, newValue) => {
                                handleBrandChange({
                                    target: {
                                        value: newValue ? newValue._id : ''
                                    }
                                });
                            }}
                            options={brandsList}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            disabled={loading || brandsList.length === 0}
                            noOptionsText={brandsList.length === 0 ? 'Loading brands...' : 'No brands found'}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={brandsList.length === 0 ? 'Loading brands...' : 'Search and select a brand'}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.87)',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                        },
                                    }}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>

                {/* Slug */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="category-slug" sx={{ mt: 2 }}>
                        Slug
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="category-slug"
                        fullWidth
                        disabled
                        value={formData.slug}
                        placeholder="Auto-generated from category name"
                    />
                </Grid>

                {/* Error Message */}
                {error && (
                    <Grid size={12} mt={2}>
                        <div
                            style={{
                                color: 'red',
                                padding: '10px',
                                backgroundColor: '#ffebee',
                                borderRadius: '4px',
                                border: '1px solid #ffcdd2'
                            }}
                        >
                            {error}
                        </div>
                    </Grid>
                )}

                {/* Submit Button */}
                <Grid size={12} mt={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{ minWidth: '120px' }}
                    >
                        {loading
                            ? (isEditMode ? 'Updating...' : 'Creating...')
                            : (isEditMode ? 'Update Category' : 'Create Category')
                        }
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleClear}
                        disabled={loading}
                        sx={{ ml: 2, minWidth: '120px' }}
                    >
                        {isEditMode ? 'Reset' : 'Clear'}
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default CreateCategory;