import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconBuildingArch, IconMail, IconMessage2, IconPhone, IconUser } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';

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

    // Helper function to generate slug from text
    const generateSlug = (text) => {
        return text.trim().replace(/\s+/g, '-').toLowerCase();
    };

    // Helper function to get brand slug by ID
    const getBrandSlug = (brandId) => {
        const brand = brandsList.find(b => b._id === brandId);
        return brand ? generateSlug(brand.name) : '';
    };

    // Generate complete slug
    const generateCompleteSlug = (categoryName, brandId) => {
        if (!categoryName.trim() || !brandId) return '';

        const brandSlug = getBrandSlug(brandId);
        const categorySlug = generateSlug(categoryName);

        return brandSlug ? `${brandSlug}/${categorySlug}` : categorySlug;
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        const completeSlug = generateCompleteSlug(name, formData.brand);

        setFormData({
            ...formData,
            name: name,
            slug: completeSlug,
        });
    };

    const handleBrandChange = (e) => {
        const selectedBrandId = e.target.value;
        const completeSlug = generateCompleteSlug(formData.name, selectedBrandId);

        setFormData({
            ...formData,
            brand: selectedBrandId,
            slug: completeSlug,
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
            const res = await axiosInstance.post('/category/create-category', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Create category response:", res);

            if (res.data.statusCode === 200) {
                // Reset form on success
                setFormData({
                    name: '',
                    slug: '',
                    brand: ''
                });

                navigate('/dashboard/category/list');

            } else if (res.data.statusCode === 400) {
                console.log("Create category error:", res.data.message);
            }

        } catch (error) {
            console.error('Create category error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to create category');
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

    useEffect(() => {
        fetchBrandsList();
    }, []);

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
                        <span style={{ color: 'red' }}>*</span>
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
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <Select
                            id="brand-select"
                            value={formData.brand}
                            onChange={handleBrandChange}
                            disabled={loading || brandsList.length === 0}
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
                                {brandsList.length === 0 ? 'Loading brands...' : 'Select a brand'}
                            </MenuItem>
                            {brandsList.map((brand) => (
                                <MenuItem key={brand._id} value={brand._id}>
                                    {brand.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Slug */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="category-slug" sx={{ mt: 2 }}>
                        Slug
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="category-slug"
                        fullWidth
                        disabled
                        value={formData.slug}
                        placeholder="Auto-generated as brand-name/category-name"
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
                        sx={{ minWidth: '120px', backgroundColor: '#2E2F7F' }}
                    >
                        {loading ? 'Creating...' : 'Create Category'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                            setFormData({ name: '', slug: '', brand: '' });
                            setError('');
                        }}
                        disabled={loading}
                        sx={{ ml: 2, minWidth: '120px' }}
                    >
                        Clear
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default CreateCategory;