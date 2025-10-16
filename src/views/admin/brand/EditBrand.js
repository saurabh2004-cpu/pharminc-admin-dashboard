import React, { useEffect } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';

const EditBrand = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        brandImage: null,
        description: '',
        slug: '',
        existingImageUrl: ''
    });
    const [error, setError] = React.useState('');
    const [imagePreview, setImagePreview] = React.useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = name.trim().replace(/\s+/g, '-').toLowerCase();

        setFormData({
            ...formData,
            name: name,
            slug: slug
        });
    };

    const fetchBrand = async () => {
        try {
            const res = await axiosInstance.get(`/brand/get-brand/${id}`);

            console.log("res", res);

            if (res.data.statusCode === 200) {
                const brandData = res.data.data;
                setFormData({
                    name: brandData.name,
                    slug: brandData.slug,
                    description: brandData.description || '',
                    brandImage: null,
                    existingImageUrl: brandData.brandImg || ''
                });
                setImagePreview(brandData.brandImg || '');
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
            console.error(error.message);
        }
    };

    const handleBrandImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                brandImage: file
            });

            // Create preview URL for new image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            setError('');
        }
    };

    const handleSubmit = async () => {
        try {
            const submitFormData = new FormData();
            submitFormData.append('name', formData.name);
            submitFormData.append('slug', formData.slug);
            submitFormData.append('description', formData.description);

            // Only append image if a new one was selected
            if (formData.brandImage) {
                submitFormData.append('brandImg', formData.brandImage);
            }

            const res = await axiosInstance.put(`/brand/update-brand/${id}`, submitFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.statusCode === 200) {
                navigate('/dashboard/brands/list');
            }
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Something went wrong');
        }
    };

    useEffect(() => {
        fetchBrand();
    }, [id]);

    return (
        <div>
            <Grid container>
                {/* 1 */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="bi-name"
                        sx={{ mt: 0 }}
                    >
                        Brand Name
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="bi-name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => handleNameChange(e)}
                    />
                </Grid>

                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="brand-image-file"
                        sx={{ mt: 0 }}
                    >
                        Brand Image
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                
                <Grid size={12}>
                    {/* Show existing image preview if available */}
                    {imagePreview && (
                        <Box sx={{ mb: 2 }}>
                            <img 
                                src={imagePreview} 
                                alt="Brand" 
                                style={{ 
                                    maxWidth: '150px', 
                                    maxHeight: '150px', 
                                    objectFit: 'contain',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    padding: '8px'
                                }} 
                            />
                        </Box>
                    )}
                    
                    <CustomOutlinedInput
                        id="brand-image-file"
                        fullWidth
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg"
                        onChange={(e) => handleBrandImageChange(e)}
                        inputProps={{
                            style: { cursor: 'pointer' }
                        }}
                    />
                </Grid>

                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="bi-description"
                        sx={{ mt: 0 }}
                    >
                        Brand Description
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>

                <Grid size={12}>
                    <CustomOutlinedInput
                        id="bi-description"
                        fullWidth
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </Grid>

                {/* 2 */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="bi-company">Slug</CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="bi-company"
                        fullWidth
                        disabled
                        value={formData.slug}
                    />
                </Grid>

                {error && (
                    <Grid size={12} mt={2}>
                        <div style={{ color: 'red' }}>
                            {error}
                        </div>
                    </Grid>
                )}

                <Grid size={12} mt={3}>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default EditBrand;