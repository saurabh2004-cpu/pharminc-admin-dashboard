import React, { useState, useEffect } from 'react';
import { Grid, Box, CircularProgress, Alert, Snackbar, Typography, Checkbox, FormControlLabel } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import { updateBlog, getBlogById } from '../../../services/blogService';
import { useNavigate, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const BlogEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        readTime: '',
        category: '',
        author: '',
        points: [''],
        isFeatured: false,
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await getBlogById(id);
                const data = res.data?.data || res.data;
                if (data) {
                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        image: data.image || '',
                        readTime: data.readTime || '',
                        category: data.category || '',
                        author: data.author || '',
                        points: data.points && data.points.length > 0 ? data.points : [''],
                        isFeatured: data.isFeatured || false,
                    });
                    if (data.image) {
                        const imageUrl = data.image.startsWith('http') 
                            ? data.image 
                            : `${import.meta.env.VITE_BASE_BACKEND_URL ? import.meta.env.VITE_BASE_BACKEND_URL.replace('/api/v1', '') : ''}${data.image}`;
                        setFilePreview(imageUrl);
                    }
                }
            } catch (error) {
                setError('Failed to fetch blog');
            } finally {
                setFetchLoading(false);
            }
        };

        if (id) {
            fetchBlog();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        if (!formData.title || !formData.description) {
            setError('Title and Description are required');
            return false;
        }
        if (!formData.author) {
            setError('Author is required');
            return false;
        }
        if (!formData.readTime) {
            setError('Read Time is required');
            return false;
        }
        if (!formData.category) {
            setError('Category is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('readTime', formData.readTime);
            data.append('category', formData.category);
            data.append('author', formData.author);
            
            const filteredPoints = formData.points.filter(p => p.trim() !== '');
            data.append('points', JSON.stringify(filteredPoints));
            
            data.append('isFeatured', formData.isFeatured);
            if (selectedFile) {
                data.append('image', selectedFile);
            } else {
                data.append('image', formData.image);
            }

            const res = await updateBlog(id, data);
            if (res.status === 200 || res.data) {
                setSuccess(true);
                setTimeout(() => navigate('/dashboard/blogs/list'), 1500);
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

    const handlePointChange = (index, value) => {
        const newPoints = [...formData.points];
        newPoints[index] = value;
        setFormData(prev => ({ ...prev, points: newPoints }));
    };

    const handleAddPoint = () => {
        setFormData(prev => ({ ...prev, points: [...prev.points, ''] }));
    };

    const handleRemovePoint = (index) => {
        setFormData(prev => ({ ...prev, points: prev.points.filter((_, i) => i !== index) }));
    };

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/dashboard/blogs/list', title: 'Blogs' },
        { title: 'Edit Blog' },
    ];

    if (fetchLoading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <Breadcrumb title="Edit Blog" items={BCrumb} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <CustomFormLabel htmlFor="title">Title *</CustomFormLabel>
                    <CustomOutlinedInput id="title" name="title" fullWidth value={formData.title} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <CustomFormLabel htmlFor="description">Description *</CustomFormLabel>
                    <CustomOutlinedInput id="description" name="description" multiline rows={6} fullWidth value={formData.description} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="image">Blog Image *</CustomFormLabel>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Button variant="outlined" component="label">
                            Choose Image
                            <input 
                                type="file" 
                                hidden 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                        </Button>
                        {selectedFile ? (
                            <Typography variant="body2" color="textSecondary">
                                {selectedFile.name}
                            </Typography>
                        ) : formData.image ? (
                            <Typography variant="body2" color="textSecondary">
                                Existing image loaded
                            </Typography>
                        ) : null}
                    </Box>
                    {filePreview && (
                        <Box mt={2}>
                            <img 
                                src={filePreview} 
                                alt="Preview" 
                                style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px', objectFit: 'cover' }} 
                            />
                        </Box>
                    )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="readTime">Read Time * (e.g., "5 mins")</CustomFormLabel>
                    <CustomOutlinedInput id="readTime" name="readTime" fullWidth value={formData.readTime} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="category">Category *</CustomFormLabel>
                    <CustomOutlinedInput id="category" name="category" fullWidth value={formData.category} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="author">Author *</CustomFormLabel>
                    <CustomOutlinedInput id="author" name="author" fullWidth value={formData.author} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" mt={2} mb={1}>Points</Typography>
                    {formData.points.map((point, index) => (
                        <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
                            <CustomOutlinedInput
                                fullWidth
                                placeholder={`Point ${index + 1}`}
                                value={point}
                                onChange={(e) => handlePointChange(index, e.target.value)}
                            />
                            <Button variant="outlined" color="error" onClick={() => handleRemovePoint(index)}>
                                Remove
                            </Button>
                        </Box>
                    ))}
                    <Button variant="outlined" color="primary" onClick={handleAddPoint}>
                        + Add Point
                    </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.isFeatured}
                                onChange={handleChange}
                                name="isFeatured"
                                color="primary"
                            />
                        }
                        label="Is Featured"
                        sx={{ mt: 4 }}
                    />
                </Grid>

                <Grid item size={{ xs: 12 }} mt={3}>
                    <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Update Blog'}
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
                    <Alert onClose={handleCloseSnackbar} severity="success">Blog updated successfully!</Alert>
                )}
            </Snackbar>
        </div>
    );
};

export default BlogEdit;
