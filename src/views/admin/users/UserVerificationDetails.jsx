import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Box, Typography, Button, Grid, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import PageContainer from '../../../components/container/PageContainer';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import { getUserVerificationById, approveUserVerification, rejectUserVerification } from '../../../services/verificationService';
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
    { to: '/dashboard/users/verification', title: 'User Verifications' },
    { title: 'Details' },
];

const UserVerificationDetails = () => {
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
            const res = await getUserVerificationById(id);
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

    const handleApprove = async () => {
        try {
            await approveUserVerification(id);
            setSuccessMsg('User verification approved successfully!');
            fetchDetails();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to approve');
        }
    };

    const handleReject = async () => {
        try {
            await rejectUserVerification(id);
            setSuccessMsg('User verification rejected successfully!');
            fetchDetails();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reject');
        }
    };

    if (loading) return (
        <PageContainer title="User Verification Details">
            <Breadcrumb title="User Verification Details" items={BCrumb} />
            <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
        </PageContainer>
    );

    if (error && !details) return (
        <PageContainer title="User Verification Details">
            <Breadcrumb title="User Verification Details" items={BCrumb} />
            <Alert severity="error">{error}</Alert>
            <Button sx={{ mt: 2 }} onClick={() => navigate('/dashboard/users/verification')}>Back to List</Button>
        </PageContainer>
    );

    return (
        <PageContainer title="User Verification Details" description="Full details of user verification">
            <Breadcrumb title="User Verification Details" items={BCrumb} />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

            <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" fontWeight="600">
                        {details.firstName} {details.lastName}
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
                        <Typography variant="body2" color="textSecondary">Email</Typography>
                        <Typography variant="body1" fontWeight="500">{details.email || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Phone</Typography>
                        <Typography variant="body1" fontWeight="500">{details.phone || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">DOB</Typography>
                        <Typography variant="body1" fontWeight="500">{details.dob ? format(new Date(details.dob), 'PP') : 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">User Role</Typography>
                        <Typography variant="body1" fontWeight="500">{details.userRole || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Authorized to Verify</Typography>
                        <Typography variant="body1" fontWeight="500">{details.authorizeToVerify ? 'Yes' : 'No'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Submitted On</Typography>
                        <Typography variant="body1" fontWeight="500">{details.created_at ? format(new Date(details.created_at), 'PP p') : 'N/A'}</Typography>
                    </Grid>

                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Country</Typography>
                        <Typography variant="body1" fontWeight="500">{details.country || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">City</Typography>
                        <Typography variant="body1" fontWeight="500">{details.city || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Professional Title</Typography>
                        <Typography variant="body1" fontWeight="500">{details.professionalTitle || 'N/A'}</Typography>
                    </Grid>

                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Primary Specialty</Typography>
                        <Typography variant="body1" fontWeight="500">{details.primarySpecialty || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">License Number</Typography>
                        <Typography variant="body1" fontWeight="500">{details.licenseNumber || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">License Expiry</Typography>
                        <Typography variant="body1" fontWeight="500">{details.licenseExpiryDate ? format(new Date(details.licenseExpiryDate), 'PP') : 'N/A'}</Typography>
                    </Grid>

                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Degree</Typography>
                        <Typography variant="body1" fontWeight="500">{details.degree || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">University</Typography>
                        <Typography variant="body1" fontWeight="500">{details.university || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Graduation Year</Typography>
                        <Typography variant="body1" fontWeight="500">{details.yearOfGraduation || 'N/A'}</Typography>
                    </Grid>

                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Post Graduate Degree</Typography>
                        <Typography variant="body1" fontWeight="500">{details.postGraduateDegree || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">PG University</Typography>
                        <Typography variant="body1" fontWeight="500">{details.postGraduateUniversity || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Current Employer</Typography>
                        <Typography variant="body1" fontWeight="500">{details.currentEmployer || 'N/A'}</Typography>
                    </Grid>

                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Current Role</Typography>
                        <Typography variant="body1" fontWeight="500">{details.currentRole || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Practice Country</Typography>
                        <Typography variant="body1" fontWeight="500">{details.practiceCountry || 'N/A'}</Typography>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Practice City</Typography>
                        <Typography variant="body1" fontWeight="500">{details.practiceCity || 'N/A'}</Typography>
                    </Grid>

                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2" color="textSecondary">Licence Suspended?</Typography>
                        <Typography variant="body1" fontWeight="500" color={details.isLicenceSuspended ? 'error' : 'textPrimary'}>
                            {details.isLicenceSuspended ? 'Yes' : 'No'}
                        </Typography>
                    </Grid>

                    {details.isLicenceSuspended && (
                        <Grid item size={{ xs: 12, sm: 12, md: 8 }}>
                            <Typography variant="body2" color="textSecondary">Suspension Reason</Typography>
                            <Typography variant="body1" fontWeight="500">{details.licenceSuspensionReason || 'N/A'}</Typography>
                        </Grid>
                    )}
                </Grid>

                <Box display="flex" gap={2} mb={4}>
                    {details.status !== 'APPROVED' && (
                        <Button variant="contained" color="success" onClick={handleApprove}>
                            Approve
                        </Button>
                    )}
                    {details.status !== 'REJECTED' && (
                        <Button variant="outlined" color="error" onClick={handleReject}>
                            Reject
                        </Button>
                    )}
                </Box>
            </Paper>

            {/* <Typography variant="h4" mb={3}>Attached Documents</Typography> */}

            {/* <DocumentViewer url={details.governMentId} title="Government ID" />
            <DocumentViewer url={details.degreeCertificate} title="Degree Certificate" />
            <DocumentViewer url={details.postGraduateDegreeCertificate} title="Post Graduate Certificate" /> */}

        </PageContainer>
    );
};

export default UserVerificationDetails;
