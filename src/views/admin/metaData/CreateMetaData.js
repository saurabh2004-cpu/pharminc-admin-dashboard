import React, { useEffect } from 'react';
import {
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    FormControl,
    MenuItem,
    Select
} from '@mui/material';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconUpload, IconFileImport } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';

const CreateMetaData = () => {
    const [formData, setFormData] = React.useState({
        page: '',
        title: '',
        description: '',
        keywords: '',
    });
    const [error, setError] = React.useState('');
    const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const navigate = useNavigate(); 
    const [loading, setLoading] = React.useState(false);
    const [pages, setPages] = React.useState([
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
        'wishlist'
    ]);

    const handleSubmit = async () => {
        // Form validation
        if (!formData.page || !formData.title || !formData.description || !formData.keywords) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const res = await axiosInstance.post('/meta-data/create-meta-data', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Meta data creation response:", res.data);

            if (res.data.statusCode === 200) {
                setFormData({
                    page: '',
                    title: '',
                    description: '',
                    keywords: '',
                });
                setError('Meta data created successfully!');
                setTimeout(() => {
                    navigate('/dashboard/meta-data/list');
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred');
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith('.csv')) {
                setError('Please select a valid CSV file');
                return;
            }
            setSelectedFile(file);
            setError('');
        }
    };

    const handlePageChange = (e) => {
        setFormData({ ...formData, page: e.target.value });
    };

    const handleImportCsvFile = async () => {
        if (!selectedFile) {
            setError('Please select a CSV file first');
            return;
        }

        try {
            setLoading(true);
            const formDataForUpload = new FormData();
            formDataForUpload.append('metaData', selectedFile);

            const res = await axiosInstance.post('/meta-data/import-meta-data', formDataForUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("CSV imported", res.data);

            if (res.data.statusCode === 200) {
                setCsvDialogOpen(false);
                setSelectedFile(null);
                setError('CSV imported successfully!');
                // Reset file input
                const fileInput = document.getElementById('csv-file-input');
                if (fileInput) fileInput.value = '';

                setTimeout(() => {
                    navigate('/dashboard/meta-data/list');
                }, 2000);
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

    useEffect(() => {
        // Fetch any additional data if needed
        // For now, pages are hardcoded above
    }, []);

    return (
        <div>
            <Grid container>
                {/* Page Selection */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="page-select" sx={{ mt: 2 }}>
                        Select Page <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <Select
                            id="page-select"
                            value={formData.page}
                            onChange={handlePageChange}
                            disabled={loading || !Array.isArray(pages) || pages.length === 0}
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
                                {!Array.isArray(pages) || pages.length === 0 ? 'Loading pages...' : 'Select a page'}
                            </MenuItem>
                            {Array.isArray(pages) && pages.map((page) => (
                                <MenuItem key={page} value={page}>
                                    {page}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
                        disabled={loading}
                        sx={{ mr: 2, backgroundColor: '#2E2F7F' }}
                    >
                        {loading ? 'Creating...' : 'Submit'}
                    </Button>
                    {/* <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setCsvDialogOpen(true)}
                        disabled={loading}
                    >
                        Import CSV
                    </Button> */}
                </Grid>
            </Grid>

            {/* CSV Import Dialog */}
            <Dialog
                open={csvDialogOpen}
                onClose={handleCloseCsvDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Import Meta Data from CSV
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Select a CSV file to import multiple meta data entries at once.
                        </Typography>

                        <input
                            id="csv-file-input"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        <Box display="flex" alignItems="center" gap={2}>
                            <Button
                                variant="outlined"
                                component="label"
                                htmlFor="csv-file-input"
                                startIcon={<IconUpload size="1.1rem" />}
                                disabled={loading}
                            >
                                Choose File
                            </Button>

                            {selectedFile && (
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
                    <Button onClick={handleCloseCsvDialog} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImportCsvFile}
                        variant="contained"
                        disabled={!selectedFile || loading}
                        startIcon={<IconFileImport size="1.1rem" />}
                        sx={{ backgroundColor: '#2E2F7F' }}
                    >
                        {loading ? 'Importing...' : 'Import'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CreateMetaData;