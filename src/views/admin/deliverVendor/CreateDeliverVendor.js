import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconBuildingArch, IconMail, IconMessage2, IconPhone, IconUser } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';

const CreateDeliverVendor = () => {
    const [formData, setFormData] = React.useState({
        vendorName: '',
        vendorTrackingUrl: '',
    });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();


    const handleSubmit = async () => {
        // Validation
        if (!formData.vendorName.trim()) {
            setError('Vendor name is required');
            return;
        }
        if (!formData.vendorTrackingUrl) {
            setError('Please enter a vendor tracking URL');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await axiosInstance.post('/delivery-vendor/create-delivery-vendor', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Create delivery vendor response:", res);

            if (res.data.statusCode === 200) {
                // Reset form on success
                setFormData({
                    vendorName: '',
                    vendorTrackingUrl: '',
                });

                navigate('/dashboard/delivery-vendors/list');

            } else if (res.data.statusCode === 400) {
                console.log("Create delivery vendor error:", res.data.message);
            }


        } catch (error) {
            console.error('Create delivery vendor error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to create delivery vendor');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div>
            <Grid container spacing={2}>

                {/* Vendor Name */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="vendor-name" sx={{ mt: 2 }}>
                        Vendor Name
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="vendor-name"
                        fullWidth
                        // disabled
                        type="text"
                        value={formData.vendorName}
                        onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                        placeholder="Enter vendor name"
                    />
                </Grid>

                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="tax-name"
                        sx={{ mt: 0 }}
                    >
                        Vendor Tracking Url
                        {/* <span style={{ color: 'red' }}>*</span> */}
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="vendor-tracking-url"
                        fullWidth
                        value={formData.vendorTrackingUrl}
                        onChange={(e) => setFormData({ ...formData, vendorTrackingUrl: e.target.value })}
                        disabled={loading}
                        placeholder="Enter vendor tracking URL"
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
                        {loading ? 'Creating...' : 'Create Deliver Vendor'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                            setFormData({ name: '', slug: '', brand: '' });
                            setError('');
                        }}
                        disabled={loading}
                        sx={{ ml: 2, minWidth: '120px' }}
                    >
                        Clear
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default CreateDeliverVendor;