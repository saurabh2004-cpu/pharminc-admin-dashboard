import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    Divider,
    CircularProgress,
    Alert,
    Chip,
    Stack
} from '@mui/material';
import { useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import { getCreditsHistoryById } from '../../../services/creditsHistoryService';
import { format } from 'date-fns';

const BCrumb = [
    { to: '/', title: 'Home' },
    { to: '/dashboard/credits-history', title: 'Credits History' },
    { title: 'Details' },
];

const FieldRow = ({ label, value }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5} borderBottom="1px solid rgba(0,0,0,0.05)">
            <Typography variant="subtitle2" color="textSecondary">{label}</Typography>
            <Typography variant="body1" fontWeight="500" textAlign="right">{value}</Typography>
        </Box>
    );
};

const CreditsHistoryDetail = () => {
    const { id } = useParams();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await getCreditsHistoryById(id);
                if (response.data) {
                    setDetail(response.data);
                }
            } catch (err) {
                console.error("Error fetching credit history details:", err);
                setError(err.response?.data?.error || err.message || "Failed to load details");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !detail) {
        return (
            <PageContainer title="Credit History Details" description="View transaction details">
                <Breadcrumb title="Credit History Details" items={BCrumb} />
                <Alert severity="error">{error || "Record not found"}</Alert>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Credit History Details" description="View transaction details">
            <Breadcrumb title="Credit History Details" items={BCrumb} />

            <Grid container spacing={3}>
                {/* Credit Transaction Overview */}
                <Grid item size={{ xs: 12 }}>
                    <Card sx={{ backgroundColor: detail.type === 'CREDIT' ? 'rgba(46, 125, 50, 0.05)' : 'rgba(211, 47, 47, 0.05)' }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h4" fontWeight="700">
                                        Transaction #{detail.id.slice(0, 8)}
                                    </Typography>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        {format(new Date(detail.created_at), 'PPPPpppp')}
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={1}>
                                    <Chip
                                        label={detail.type}
                                        color={detail.type === 'CREDIT' ? 'success' : 'error'}
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                    <Chip
                                        label={detail.action.replace(/_/g, ' ')}
                                        variant="outlined"
                                        color="primary"
                                    />
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Institute Details */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" fontWeight="600" mb={3} borderBottom="2px solid #f0f0f0" pb={1}>
                                Institute Details
                            </Typography>
                            <Box display="flex" flexDirection="column">
                                <FieldRow label="Name" value={detail.institute?.name} />
                                <FieldRow label="Email" value={detail.institute?.contactEmail} />
                                <FieldRow label="Phone" value={detail.institute?.contactNumber} />
                                <FieldRow label="Role" value={detail.institute?.role} />
                                <FieldRow
                                    label="Location"
                                    value={detail.institute?.city && detail.institute?.country ? `${detail.institute.city}, ${detail.institute.country}` : detail.institute?.country || detail.institute?.city}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Transaction Financials */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" fontWeight="600" mb={3} borderBottom="2px solid #f0f0f0" pb={1}>
                                Transaction Details
                            </Typography>
                            <Box display="flex" flexDirection="column">
                                {detail.cost > 0 && <FieldRow label="Cost" value={detail.cost !== null ? `${detail.cost} Credits` : '0'} />}
                                {detail.purchasedCredits > 0 && < FieldRow label="Purchased Credits" value={detail.purchasedCredits !== null ? `${detail.purchasedCredits} Credits` : '0'} />}
                                {detail.currentCredits !== null && <FieldRow label="Credits After Transaction" value={`${detail.currentCredits} Credits`} />}
                                {detail.created_at !== null && <FieldRow label="Created At" value={format(new Date(detail.created_at), 'MMM d yyyy HH:mm:ss')} />}
                                {detail.updated_at !== null && <FieldRow label="Updated At" value={format(new Date(detail.updated_at), 'MMM d yyyy HH:mm:ss')} />}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Job Details (Optional) */}
                {detail.job && (
                    <Grid item size={{ xs: 12 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" fontWeight="600" mb={3} borderBottom="2px solid #f0f0f0" pb={1}>
                                    Related Job Details
                                </Typography>
                                <Grid container spacing={4}>
                                    <Grid item size={{ xs: 12, md: 6 }}>
                                        <FieldRow label="Job Title" value={detail.job.title} />
                                        <FieldRow label="Role" value={detail.job.role} />
                                        <FieldRow label="Job Type" value={detail.job.jobType} />
                                        <FieldRow label="Work Location" value={detail.job.workLocation} />
                                        <FieldRow
                                            label="Job Location"
                                            value={detail.job.city && detail.job.country ? `${detail.job.city}, ${detail.job.country}` : detail.job.country || detail.job.city}
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12, md: 6 }}>
                                        <FieldRow
                                            label="Salary"
                                            value={`${detail.job.salaryCurrency} ${detail.job.salaryMin} - ${detail.job.salaryMax}`}
                                        />
                                        <FieldRow
                                            label="Status"
                                            value={<Chip label={detail.job.status} size="small" color={detail.job.status === 'active' ? 'success' : 'default'} />}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </PageContainer>
    );
};

export default CreditsHistoryDetail;
