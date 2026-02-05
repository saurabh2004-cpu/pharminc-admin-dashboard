import React, { useEffect } from 'react';
import { Grid, MenuItem, Select, FormControl } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconBuildingArch, IconMail, IconMessage2, IconPhone, IconUser } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';

const EditPackTypes = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        quantity: '',
        isDefault: false,
    });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const { id } = useParams();


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
            const res = await axiosInstance.put(`/packs-types/update-packs-type/${id}`, formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // console.log("Update pack types response:", res);

            if (res.data.statusCode === 200) {
                // Reset form on success
                setFormData({
                    name: '',
                    quantity: '',
                });

                navigate('/dashboard/pack-types/list');

            } else if (res.data.statusCode === 400) {
                // console.log("update pack types error:", res.data.message);
            }


        } catch (error) {
            console.error('Update pack types error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to update pack types');
        } finally {
            setLoading(false);
        }
    };

    const fetchPackType = async () => {
        try {
            const response = await axiosInstance.get(`/packs-types/get-packs-type/${id}`);
            // console.log("response single pack type", response);
            if (response.data.statusCode === 200) {
                setFormData({
                    name: response.data.data.name,
                    quantity: response.data.data.quantity,
                    isDefault: response.data.data.isDefault,
                });
            } else {
                setError('Failed to fetch pack type');
            }
        } catch (error) {
            console.error('Fetch pack type error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to fetch pack type');
        }
    };

    useEffect(() => {
        fetchPackType();
    }, [id])

    const BCrumb = [
        {
            to: '/',
            title: 'Home',
        },
        {
            title: 'Edit Pack Types',
        },
    ];


    return (
        <div>
            <Breadcrumb title="Edit Pack Types" items={BCrumb} />
            <Grid container spacing={2}>

                {/* Pack Name */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="pack-name" sx={{ mt: 2 }}>
                        Pack Name
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

                <Grid size={12}>
                    <CustomFormLabel htmlFor="isDefault" sx={{ mt: 0 }}>
                        Is Default <span style={{ color: 'red' }}>*</span>
                    </CustomFormLabel>
                </Grid>

                <Grid size={12}>
                    <CustomTextField
                        id="isDefault"
                        select
                        fullWidth
                        value={formData.isDefault ? 'true' : 'false'}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                isDefault: e.target.value === 'true',
                            })
                        }
                        disabled={loading}
                    >
                        <MenuItem value="true">True</MenuItem>
                        <MenuItem value="false">False</MenuItem>
                    </CustomTextField>
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
                        sx={{ minWidth: '120px' }}
                    >
                        {loading ? 'Creating...' : 'Update '}
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                            setFormData({ name: '', quantity: '', });
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

export default EditPackTypes;