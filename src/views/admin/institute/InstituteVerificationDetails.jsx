import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Box, Typography, Button, Grid, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import PageContainer from '../../../components/container/PageContainer';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import { getInstituteVerificationById, approveInstituteVerification, rejectInstituteVerification } from '../../../services/verificationService';
import { format } from 'date-fns';

const DocumentViewer = ({ url, title }) => {
    if (!url) return null;

    const lowerUrl = url.toLowerCase();
    const isImage = lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.gif');
    const isPdf = lowerUrl.endsWith('.pdf');

    return (
        <Box mb={4}>
            <Typography variant="h6" mb={2}>{title}</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa', display: 'flex', justifyContent: 'center', minHeight: '300px', alignItems: 'center' }}>
                {isImage ? (
                    <img src={url} alt={title} style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }} />
                ) : isPdf ? (
                    <iframe src={url} title={title} width="100%" height="600px" style={{ border: 'none' }} />
                ) : (
                    <Button variant="contained" color="primary" onClick={() => window.open(url, '_blank')}>
                        View Document
                    </Button>
                )}
            </Paper>
        </Box>
    );
};

const BCrumb = [
    { to: '/', title: 'Home' },
    { to: '/dashboard/institutes/verification', title: 'Institute Verifications' },
    { title: 'Details' },
];

const InstituteVerificationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getInstituteVerificationById(id);
            console.log("verification details", res.data);
            setDetails(res.data);
        } catch (err) {
            console.error('Error fetching verification details', err);
            setError(err.response?.data?.error || err.message || 'Failed to load details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handleApprove = async (instituteId) => {
        try {
            await approveInstituteVerification(instituteId);
            setSuccessMsg('Institute verification approved successfully!');
            fetchDetails();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to approve');
        }
    };

    const handleReject = async (instituteId) => {
        try {
            await rejectInstituteVerification(instituteId);
            setSuccessMsg('Institute verification rejected successfully!');
            fetchDetails();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reject');
        }
    };

    if (loading) return (
        <PageContainer title="Institute Verification Details">
            <Breadcrumb title="Institute Verification Details" items={BCrumb} />
            <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
        </PageContainer>
    );

    if (error && !details) return (
        <PageContainer title="Institute Verification Details">
            <Breadcrumb title="Institute Verification Details" items={BCrumb} />
            <Alert severity="error">{error}</Alert>
            <Button sx={{ mt: 2 }} onClick={() => navigate('/dashboard/institutes/verification')}>Back to List</Button>
        </PageContainer>
    );

    return (
        <PageContainer title="Institute Verification Details" description="Full details of institute verification">
            <Breadcrumb title="Institute Verification Details" items={BCrumb} />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

            <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" fontWeight="600">
                        {details.institute?.name || details.adminName || 'Verification Details'}
                    </Typography>
                    <Box display="flex" gap={2}>
                        <Typography variant="subtitle1" fontWeight={600} color={
                            details.status === 'APPROVED' ? 'success.main' :
                                details.status === 'REJECTED' ? 'error.main' : 'warning.main'
                        }>
                            Status: {details.status}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3} mb={4}>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Admin Name</Typography>
                        <Typography variant="body1" fontWeight="500">{details.adminName || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Admin Phone</Typography>
                        <Typography variant="body1" fontWeight="500">{details.adminPhone || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Email</Typography>
                        <Typography variant="body1" fontWeight="500">{details.email || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Telephone</Typography>
                        <Typography variant="body1" fontWeight="500">{details.telephone || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Submitted On</Typography>
                        <Typography variant="body1" fontWeight="500">{details.created_at ? format(new Date(details.created_at), 'PP p') : 'N/A'}</Typography>
                    </Grid>
                </Grid>

                <Box display="flex" gap={2} mb={4}>
                    {details.status !== 'APPROVED' && (
                        <Button variant="contained" color="success" onClick={() => handleApprove(details.institute.id)}>
                            Approve
                        </Button>
                    )}
                    {details.status !== 'REJECTED' && (
                        <Button variant="outlined" color="error" onClick={() => handleReject(details.institute.id)}>
                            Reject
                        </Button>
                    )}
                </Box>
            </Paper>

            {/* <Typography variant="h4" mb={3}>Attached Documents</Typography> */}

            {/* <DocumentViewer url={details.registrationCertificate} title="Registration Certificate" /> */}

        </PageContainer>
    );
};

export default InstituteVerificationDetails;
