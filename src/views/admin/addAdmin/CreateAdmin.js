import React from 'react';
import {
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box
} from '@mui/material';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconUpload, IconFileImport } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';

const CreateAdmin = () => {
    const [formData, setFormData] = React.useState({
        email: '',
        password: '',
    });
    const [error, setError] = React.useState('');

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
                })
                setError('admin created successfully!');
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