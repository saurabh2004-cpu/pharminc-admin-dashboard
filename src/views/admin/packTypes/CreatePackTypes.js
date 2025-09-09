import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconBuildingArch, IconMail, IconMessage2, IconPhone, IconUser } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';

const CreatePackTypes = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        quantity: '',
    });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();


    const handleSubmit = async () => {
        // Validation
        if (!formData.name.trim()) {
            setError('Pack type name is required');
            return;
        }
        if (!formData.quantity) {
            setError('Please enter a quantity');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await axiosInstance.post('/packs-types/create-packs-type', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Create pack types response:", res);

            if (res.data.statusCode === 200) {
                // Reset form on success
                setFormData({
                    name: '',
                    quantity: '',
                });

                navigate('/dashboard/pack-types/list');

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



    return (
        <div>
            <Grid container spacing={2}>

                {/* Pack Name */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="pack-name" sx={{ mt: 2 }}>
                        Pack Name'<span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="pack-name"
                        fullWidth
                        // disabled
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter pack name"
                    />
                </Grid>

                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="quantity"
                        sx={{ mt: 0 }}
                    >
                        Pack quantity
                        <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="quantity"
                        fullWidth
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        disabled={loading}
                        placeholder="Enter pack quantity"
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
                        {loading ? 'Creating...' : 'Create Pack Type'}
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

export default CreatePackTypes;