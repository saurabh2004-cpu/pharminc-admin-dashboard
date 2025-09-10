import React from 'react';
import { Grid, MenuItem, Select, FormControl, Dialog, DialogTitle, DialogContent, Typography, Box, DialogActions } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconBuildingArch, IconFileImport, IconMail, IconMessage2, IconPhone, IconUpload, IconUser } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';

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
            const res = await axiosInstance.post('/brand/create-brand', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.statusCode === 200) {
                setFormData({
                    name: '',
                    slug: ''
                })
                navigate('/dashboard/brands/list')
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
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

            console.log("CSV imported", res.data);

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
            // if (!file.name.toLowerCase().endsWith('.csv') || !file.name.toLowerCase().endsWith('.xlsx') ) {
            //     setError('Please select a valid CSV file');
            //     // return;
            // }
            setSelectedFile(file);
            setError('');
        }
    };

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
                <DialogTitle>
                    Import Pricing Group Discounts from CSV
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Select a CSV file to import multiple pricing group discounts at once.
                            Expected format: pricingGroupId, customerId, productSku, percentage
                        </Typography>

                        <input
                            id="csv-file-input"
                            type="file"
                            accept=".csv/xls/xlsx"
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

export default CreateBrand;