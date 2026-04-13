import React from 'react';
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
import { useNavigate } from 'react-router';
import PageContainer from '../../../components/container/PageContainer';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from '../../../components/shared/ParentCard';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { createAdmin } from '../../../services/adminService';

const validationSchema = yup.object({
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup.string().min(6, 'Password should be of minimum 6 characters length').required('Password is required'),
    role: yup.string().oneOf(['ADMIN', 'MASTER_ADMIN'], 'Invalid role').required('Role is required'),
});

const CreateAdmin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(null);

    const formik = useFormik({
        initialValues: {
            name: '',
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
                const response = await createAdmin(values);
                setSuccess(response.data?.message || 'Admin created successfully');
                setTimeout(() => {
                    navigate('/dashboard/admins');
                }, 2000);
            } catch (err) {
                console.error('Error creating admin:', err);
                setError(err.response?.data?.message || 'Failed to create admin');
            } finally {
                setLoading(false);
            }
        },
    });

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/dashboard/admins', title: 'Admins' },
        { title: 'Create Admin' },
    ];

    return (
        <PageContainer title="Create Admin" description="Create a new admin user">
            <Breadcrumb title="Create Admin" items={BCrumb} />
            <ParentCard title="Admin Details">
                <CardContent>
                    <form onSubmit={formik.handleSubmit}>
                        <Grid item xs={12}>
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item size={{ xs: 10, sm: 5 }} >
                                <CustomFormLabel htmlFor="name">Name</CustomFormLabel>
                                <CustomTextField
                                    id="name"
                                    name="name"
                                    fullWidth
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                />
                            </Grid>
                            <Grid item size={{ xs: 10, sm: 5 }} >
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
                            <Grid item size={{ xs: 10, sm: 5 }}>
                                <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
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
                            <Grid item size={{ xs: 10, sm: 6 }}>
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
                            <Grid item xs={12} >
                                <Button
                                    color="primary"
                                    variant="contained"
                                    type="submit"
                                    disabled={loading}
                                    fullWidth
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Admin'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </ParentCard>
        </PageContainer>
    );
};

export default CreateAdmin;
