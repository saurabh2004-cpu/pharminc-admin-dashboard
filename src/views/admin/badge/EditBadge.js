import React, { useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const EditBadge = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        slug: '',
        backgroundColor: '',
        text: ''
    });
    const [error, setError] = React.useState('');
    const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = name.trim().replace(/\s+/g, '-')?.toLowerCase();

        setFormData({
            ...formData,
            name: name,
            slug: slug
        });
    };

    const handleSubmit = async () => {
        try {
            const res = await axiosInstance.put(`/badge/update-badge/${id}`, formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // console.log("Badge creation response:", res.data);

            if (res.data.statusCode === 200) {
                setFormData({
                    name: '',
                    slug: '',
                    backgroundColor: '',
                    text: ''
                });
                setError('Badge created successfully!');
                navigate('/dashboard/badge/list');
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred');
            console.error(error.message);
        }
    };

    const fetchBadge = async () => {
        try {
            const res = await axiosInstance.get(`/badge/get-badge/${id}`);

            // console.log("res.data", res.data)

            if (res.data.statusCode === 200) {
                setFormData(res.data.data);
            } else {
                setError('Failed to fetch badge details');
            }
        } catch (error) {
            console.error("Error fetching badge details", error);
            setError('Failed to fetch badge details');
        }
    }

    useEffect(() => {
        fetchBadge();
    }, [id]);


    const handleCloseCsvDialog = () => {
        setCsvDialogOpen(false);
        setSelectedFile(null);
        setError('');
        // Reset file input
        const fileInput = document.getElementById('csv-file-input');
        if (fileInput) fileInput.value = '';
    };

    const BCrumb = [
        {
            to: '/',
            title: 'Home',
        },
        {
            title: 'Edit Badge',
        },
    ];

    return (
        <div>

            <Breadcrumb title="Edit Badge" items={BCrumb} />

            <Grid container marginTop={4}>
                {/* 1 */}
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="bi-name"
                        sx={{ mt: 0 }}
                    >
                        Brand Name
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="bi-name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => handleNameChange(e)}
                    />
                </Grid>
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="bi-background-color"
                        sx={{ mt: 0 }}
                    >
                        Background Color
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="bi-background-color"
                        fullWidth
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    />
                </Grid>
                <Grid size={12}>
                    <CustomFormLabel
                        htmlFor="bi-text"
                        sx={{ mt: 0 }}
                    >
                        Text
                    </CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="bi-text"
                        fullWidth
                        value={formData.text}
                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    />
                </Grid>
                {/* 2 */}
                <Grid size={12}>
                    <CustomFormLabel htmlFor="bi-company">Slug</CustomFormLabel>
                </Grid>
                <Grid size={12}>
                    <CustomOutlinedInput
                        id="bi-company"
                        fullWidth
                        disabled
                        value={formData.slug}
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
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Grid>
            </Grid>


        </div>
    );
};

export default EditBadge;