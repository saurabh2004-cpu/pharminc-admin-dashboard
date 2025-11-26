import React from 'react';
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
    Select,
    MenuItem
} from '@mui/material';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconUpload, IconFileImport } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';

const CreateAdmin = () => {
    const [formData, setFormData] = React.useState({
        username: '',
        email: '',
        password: '',
        role: ''
    });
    const [error, setError] = React.useState('');
    const [roles, setRoles] = React.useState(["MASTER ADMIN", "SUB ADMIN"]);
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            const res = await axiosInstance.post('/admin/create-new-admin', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("new admin creation response:", res);

            if (res.data.statusCode === 200) {
                setFormData({
                    email: '',
                    password: '',
                    role: '',
                    username: ''
                })
                setError('admin created successfully!');
                navigate('/dashboard/admin/list')
            } else {
                setError(res.data.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred');
            console.error(error.message);
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
                        username
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="bi-name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                </Grid>

                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="bi-name"
                        sx={{ mt: 0 }}
                    >
                        Email
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="bi-name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </Grid>

                <Grid size={12}>
                    <CustomFormLabel htmlFor="role-select" sx={{ mt: 2 }}>
                        Select Role
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="role-select"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            disabled={loading || roles.length === 0}
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
                                {roles.length === 0 ? 'Loading roles...' : 'Select a role'}
                            </MenuItem>
                            {roles.map((role) => (
                                <MenuItem key={role} value={role}>
                                    {role}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="bi-background-color"
                        sx={{ mt: 3 }}
                    >
                        Password
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="bi-background-color"
                        fullWidth
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </Grid>


                {error && (
                    <Grid size={12} mt={2}>
                        <div style={{ color: error.includes('success') ? 'green' : 'red' }}>
                            {error}
                        </div>
                    </Grid>
                )}

                <Grid item={12} mt={3}>
                    <Button variant="contained" color="primary" sx={{ backgroundColor: '#2E2F7F' }} onClick={handleSubmit}>
                        Submit
                    </Button>

                </Grid>
            </Grid>
        </div>
    );
};

export default CreateAdmin;