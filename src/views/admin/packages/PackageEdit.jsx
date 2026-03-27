import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { getPackageById, updatePackage } from '../../../services/packageService';

const BCrumb = [
    { to: '/', title: 'Home' },
    { to: '/dashboard/packages/list', title: 'Packages' },
    { title: 'Edit Package' },
];

const PackageEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        credits: '',
    });

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const response = await getPackageById(id);
                if (response.data && response.data.data) {
                    const d = response.data.data;
                    setFormData({
                        name: d.name || '',
                        price: d.price || '',
                        credits: d.credits || '',
                    });
                }
            } catch (err) {
                console.error("Error fetching package data:", err);
                setError(err.response?.data?.message || err.message || "Failed to load package details");
            } finally {
                setLoading(false);
            }
        };
        fetchPackage();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const dataToUpdate = {
                ...formData,
                price: parseInt(formData.price, 10),
                credits: parseInt(formData.credits, 10),
            };

            await updatePackage(id, dataToUpdate);
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard/packages/list');
            }, 1000);
        } catch (err) {
            console.error("Error updating package:", err);
            setError(err.response?.data?.message || err.message || "Failed to update package");
        } finally {
            setSaving(false);
        }
    };

    const handleCloseSnackbar = () => {
        setError(null);
        setSuccess(false);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <PageContainer title="Edit Package" description="Update an existing subscription package">
            <Breadcrumb title="Edit Package" items={BCrumb} />

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
                                {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
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
                    {error || "Package updated successfully!"}
                </Alert>
            </Snackbar>
        </PageContainer>
    );
};

export default PackageEdit;
