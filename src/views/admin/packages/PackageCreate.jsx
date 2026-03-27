import React, { useState } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { createPackage } from '../../../services/packageService';

const BCrumb = [
    { to: '/', title: 'Home' },
    { to: '/dashboard/packages/list', title: 'Packages' },
    { title: 'Create Package' },
];

const PackageCreate = () => {
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        credits: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price || !formData.credits) {
            setError("All fields are required");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const dataToCreate = {
                ...formData,
                price: parseInt(formData.price, 10),
                credits: parseInt(formData.credits, 10),
            };

            await createPackage(dataToCreate);
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard/packages/list');
            }, 1000);
        } catch (err) {
            console.error("Error creating package:", err);
            setError(err.response?.data?.message || err.message || "Failed to create package");
        } finally {
            setSaving(false);
        }
    };

    const handleCloseSnackbar = () => {
        setError(null);
        setSuccess(false);
    };

    return (
        <PageContainer title="Create Package" description="Create a new subscription package">
            <Breadcrumb title="Create Package" items={BCrumb} />

            <ParentCard title="Package Details">
                <Grid container spacing={3}>
                    <Grid item size={{ xs: 12, sm: 12 }}>
                        <TextField
                            fullWidth
                            label="Package Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Credits"
                            name="credits"
                            type="number"
                            value={formData.credits}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>

                    <Grid item size={{ xs: 12 }}>
                        <Box display="flex" justifyContent="flex-end" gap={2}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => navigate('/dashboard/packages/list')}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? <CircularProgress size={24} color="inherit" /> : 'Create Package'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </ParentCard>

            <Snackbar
                open={!!error || success}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
                    {error || "Package created successfully!"}
                </Alert>
            </Snackbar>
        </PageContainer>
    );
};

export default PackageCreate;
