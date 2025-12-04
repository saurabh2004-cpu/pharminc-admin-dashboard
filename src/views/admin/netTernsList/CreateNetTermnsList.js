import React from 'react';
import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const CreateNetTermnsList = () => {
    const [formData, setFormData] = React.useState({
        netTermName: '',
        daysCount: null,
    });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();


    const handleSubmit = async () => {
        if (!formData.netTermName.trim()) {
            setError('net terms name is required');
            return;
        }
       

        setLoading(true);
        setError('');

        try {
            const res = await axiosInstance.post('/net-terms-list/create-net-term', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Create net terms response:", res);

            if (res.data.statusCode === 200) {
                // Reset form on success
                setFormData({
                    netTermName: '',
                    daysCount: null,
                });

                navigate('/dashboard/net-terms-list');

            } else if (res.data.statusCode === 400) {
                console.log("Create pack types error:", res.data.message);
            }


        } catch (error) {
            console.error('Create pack types error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to create pack types');
        } finally {
            setLoading(false);
        }
    };




    const BCrumb = [
        {
            to: '/',
            title: 'Home',
        },
        {
            title: 'Create Net Terms List',
        },
    ];



    return (
        <div>
            <Breadcrumb title="Create Net Terms List" items={BCrumb} />
            <Grid container spacing={2}>

                {/* Pack Name */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="net-term-name" sx={{ mt: 2 }}>
                        Net Term Name<span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="net-term-name"
                        fullWidth
                        // disabled
                        type="text"
                        value={formData.netTermName}
                        onChange={(e) => setFormData({ ...formData, netTermName: e.target.value })}
                        placeholder="Enter net term name"
                    />
                </Grid>

                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="quantity"
                        sx={{ mt: 0 }}
                    >
                        Days Count
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="days-count"
                        fullWidth
                        value={formData.daysCount}
                        onChange={(e) => setFormData({ ...formData, daysCount: e.target.value })}
                        disabled={loading}
                        placeholder="Enter days count"
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
                        {loading ? 'Creating...' : 'Create Net Terms List'}
                    </Button>

                </Grid>
            </Grid>


        </div>
    );
};

export default CreateNetTermnsList;