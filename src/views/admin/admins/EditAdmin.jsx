import React, { useEffect, useState } from 'react';
import {
    CardContent,
    Grid,
    Button,
    Alert,
    CircularProgress,
    Select,
    MenuItem,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router';
import PageContainer from '../../../components/container/PageContainer';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from '../../../components/shared/ParentCard';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { getAdminById, updateAdmin } from '../../../services/adminService';

const validationSchema = yup.object({
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup.string().min(6, 'Password should be of minimum 6 characters length'),
    role: yup.string().oneOf(['ADMIN', 'MASTER_ADMIN'], 'Invalid role').required('Role is required'),
});

const EditAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            role: 'ADMIN',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            setError(null);
            setSuccess(null);
            try {
                // If password is empty, don't send it or handle it in backend
                const dataToUpdate = { ...values };
                if (!values.password) {
                    delete dataToUpdate.password;
                }
                const response = await updateAdmin(id, dataToUpdate);
                setSuccess(response.data?.message || 'Admin updated successfully');
                setTimeout(() => {
                    navigate('/dashboard/admins');
                }, 2000);
            } catch (err) {
                console.error('Error updating admin:', err);
                setError(err.response?.data?.message || 'Failed to update admin');
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const response = await getAdminById(id);
                if (response.data && response.data.profile) {
                    formik.setValues({
                        email: response.data.profile.email,
                        password: '', // Don't show password
                        role: response.data.profile.role,
                    });
                }
            } catch (err) {
                console.error('Error fetching admin details:', err);
                setError('Failed to load admin details');
            } finally {
                setFetching(false);
            }
        };
        fetchAdmin();
    }, [id]);

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/dashboard/admins', title: 'Admins' },
        { title: 'Edit Admin' },
    ];

    if (fetching) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <PageContainer title="Edit Admin" description="Update admin user details">
            <Breadcrumb title="Edit Admin" items={BCrumb} />
            <ParentCard title="Admin Details">
                <CardContent>
                    <form onSubmit={formik.handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                            </Grid>
                            <Grid item size={{ xs: 10, sm: 5 }}>
                                <CustomFormLabel htmlFor="email">Email Address</CustomFormLabel>
                                <CustomTextField
                                    id="email"
                                    name="email"
                                    fullWidth
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                />
                            </Grid>

                            <Grid item size={{ xs: 10, sm: 5 }} >
                                <CustomFormLabel htmlFor="password">Password (Leave blank to keep current)</CustomFormLabel>
                                <CustomTextField
                                    id="password"
                                    name="password"
                                    type="password"
                                    fullWidth
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    error={formik.touched.password && Boolean(formik.errors.password)}
                                    helperText={formik.touched.password && formik.errors.password}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <CustomFormLabel htmlFor="role">Role</CustomFormLabel>
                                <Select
                                    id="role"
                                    name="role"
                                    fullWidth
                                    value={formik.values.role}
                                    onChange={formik.handleChange}
                                >
                                    <MenuItem value="ADMIN">Admin</MenuItem>
                                    <MenuItem value="MASTER_ADMIN">Master Admin</MenuItem>
                                </Select>
                            </Grid>
                            <Grid item xs={12} marginLeft={3}>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    type="submit"
                                    disabled={loading}
                                    fullWidth
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Admin'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </ParentCard>
        </PageContainer>
    );
};

// Import Box if it's not available (it's used in the fetching state)
import { Box } from '@mui/material';

export default EditAdmin;
