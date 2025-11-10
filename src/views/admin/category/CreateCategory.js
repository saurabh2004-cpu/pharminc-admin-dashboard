import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl, Dialog, Backdrop, Box, CircularProgress, Typography, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconBuildingArch, IconFileImport, IconMail, IconMessage2, IconPhone, IconUpload, IconUser } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { Autocomplete, TextField } from '@mui/material';

const CreateCategory = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        slug: '',
        brand: '',
        descriptionColour: '#000000', // Default color
    });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const [brandsList, setBrandsList] = React.useState([]);
    const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);


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
        if (!formData.description.trim()) {
            setError('Category description is required');
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
                    description: '',
                    slug: '',
                    brand: '',
                    descriptionColour: '#000000'
                });

                navigate('/dashboard/category/list');

            } else if (res.data.statusCode === 400) {
                console.log("Create category error:", res.data.message);
                setError(res.data.message || 'Failed to create category');
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

    const handleImportCsvFile = async () => {
        if (!selectedFile) {
            setError('Please select a CSV file first');
            return;
        }

        try {
            setLoading(true);
            const formDataForUpload = new FormData();
            formDataForUpload.append('commerce-categories', selectedFile);

            const res = await axiosInstance.post('/brand/import-commerce-categories', formDataForUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("CSV imported", res.data);

            if (res.data.statusCode === 200) {
                setCsvDialogOpen(false);
                setSelectedFile(null);

                // Reset file input
                const fileInput = document.getElementById('csv-file-input');
                if (fileInput) fileInput.value = '';

                navigate('/dashboard/category/list');
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred while importing CSV');
            console.error('CSV import error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseCsvDialog = () => {
        setCsvDialogOpen(false);
        setSelectedFile(null);
        setError('');
        // Reset file input
        const fileInput = document.getElementById('csv-file-input');
        if (fileInput) fileInput.value = '';
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError('');
        }
    };

    const handleClearForm = () => {
        setFormData({ 
            name: '', 
            description: '',
            slug: '', 
            brand: '',
            descriptionColour: '#000000' 
        });
        setError('');
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

                {/* Category Description */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="category-description"
                        sx={{ mt: 0 }}
                    >
                        Category Description
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="category-description"
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        disabled={loading}
                        placeholder="Enter category description"
                    />
                </Grid>

                {/* Description Color */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="description-colour"
                        sx={{ mt: 0 }}
                    >
                        Description Color
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <CustomOutlinedInput
                            id="description-colour"
                            type="color"
                            value={formData.descriptionColour}
                            onChange={(e) => setFormData({ ...formData, descriptionColour: e.target.value })}
                            disabled={loading}
                            sx={{
                                width: '100px',
                                height: '56px',
                                padding: '4px',
                                cursor: 'pointer',
                                '& input[type="color"]': {
                                    cursor: 'pointer',
                                    border: 'none',
                                    width: '100%',
                                    height: '100%'
                                }
                            }}
                        />
                        <CustomOutlinedInput
                            fullWidth
                            value={formData.descriptionColour}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Allow hex color format validation
                                if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === '') {
                                    setFormData({ ...formData, descriptionColour: value });
                                }
                            }}
                            disabled={loading}
                            placeholder="#000000"
                            inputProps={{
                                maxLength: 7,
                                pattern: '^#[0-9A-Fa-f]{6}$'
                            }}
                        />
                        <Box
                            sx={{
                                width: '56px',
                                height: '56px',
                                backgroundColor: formData.descriptionColour,
                                border: '1px solid rgba(0, 0, 0, 0.23)',
                                borderRadius: '4px',
                                flexShrink: 0
                            }}
                        />
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Choose a color for the category description text. Preview shown on the right.
                    </Typography>
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
                        onClick={handleClearForm}
                        disabled={loading}
                        sx={{ ml: 2, minWidth: '120px' }}
                    >
                        Clear
                    </Button>

                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setCsvDialogOpen(true)}
                        disabled={loading}
                        sx={{ ml: 2 }}
                    >
                        Import CSV
                    </Button>
                </Grid>
            </Grid>

            {/* CSV Import Dialog */}
            <Dialog
                open={csvDialogOpen}
                onClose={handleCloseCsvDialog}
                maxWidth="sm"
                fullWidth
            >
                {/* Loading Backdrop */}
                <Backdrop
                    sx={{
                        color: '#fff',
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        position: 'absolute',
                        borderRadius: 1
                    }}
                    open={loading}
                >
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                        <CircularProgress color="inherit" size={50} />
                        <Typography variant="body2" color="inherit">
                            Importing CSV file, please wait...
                        </Typography>
                    </Box>
                </Backdrop>

                <DialogTitle>
                    Import Commerce Categories from CSV
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Select a CSV file to import multiple commerce categories at once.
                        </Typography>

                        <input
                            id="csv-file-input"
                            type="file"
                            accept=".csv,.xls,.xlsx"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        <Box display="flex" alignItems="center" gap={2}>
                            <Button
                                variant="outlined"
                                component="label"
                                htmlFor="csv-file-input"
                                startIcon={loading ? <CircularProgress size={16} /> : <IconUpload size="1.1rem" />}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Choose File'}
                            </Button>

                            {selectedFile && !loading && (
                                <Typography variant="body2" color="primary">
                                    {selectedFile.name}
                                </Typography>
                            )}
                        </Box>

                        {error && !error.includes('success') && (
                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseCsvDialog}
                        disabled={loading}
                        sx={{ opacity: loading ? 0.5 : 1 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImportCsvFile}
                        variant="contained"
                        disabled={!selectedFile || loading}
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <IconFileImport size="1.1rem" />}
                        sx={{ backgroundColor: '#2E2F7F' }}
                    >
                        {loading ? 'Importing...' : 'Import'}
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    );
};

export default CreateCategory;