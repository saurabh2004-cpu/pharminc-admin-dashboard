import React from 'react';
import { Grid, Dialog, DialogTitle, DialogContent, Typography, Box, DialogActions } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconFileImport, IconUpload } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { CircularProgress, Backdrop } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const CreateBrand = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        slug: ''
    });
    const [error, setError] = React.useState('');
    const navigate = useNavigate();
    const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [loading, setLoading] = React.useState(false);


    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = name.trim().replace(/\s+/g, '-')?.toLowerCase();

        setFormData({
            ...formData,
            name: name,
            slug: slug
        });
    };

    const handleSubmit = async () => {
        try {
            // Create FormData for multipart/form-data
            const submitFormData = new FormData();
            submitFormData.append('name', formData.name);
            submitFormData.append('slug', formData.slug);

            const res = await axiosInstance.post('/brand/create-brand', submitFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.statusCode === 200) {
                setFormData({
                    name: '',
                    brandImage: null,
                    slug: ''
                });
                navigate('/dashboard/brands/list');
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred');
            console.error(error.message);
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
            // Correct field name for pricing groups discounts
            formDataForUpload.append('commerce-categories', selectedFile);

            // Correct API endpoint for pricing groups discounts import
            const res = await axiosInstance.post('/brand/import-commerce-categories', formDataForUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // console.log("CSV imported", res.data);

            if (res.data.statusCode === 200) {
                setCsvDialogOpen(false);
                setSelectedFile(null);

                // Reset file input
                const fileInput = document.getElementById('csv-file-input');
                if (fileInput) fileInput.value = '';

                navigate('/dashboard/brands/list');
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

    const handleBrandImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                brandImage: file
            });
            setError('');
        }
    };


    const BCrumb = [
        {
            to: '/',
            title: 'Home',
        },
        {
            title: 'Create Brand',
        },
    ];


    return (
        <div>
            <Breadcrumb title="Create Brand" items={BCrumb}  />
            <Grid containe marginTop={4}>
                {/* 1 */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="bi-name"
                        sx={{ mt: 0 }}
                    >
                        Brand Name
                        <span style={{ color: 'red' }}>*</span>
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



                {/* 2 */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="bi-company">Slug  <span style={{ color: 'red' }}>*</span></CustomFormLabel>
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
                    <Button variant="contained" color="primary" sx={{ backgroundColor: '#2E2F7F' }} onClick={handleSubmit}>
                        Submit
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
                            Select a CSV file to import multiple commerce categories  at once.
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

export default CreateBrand;