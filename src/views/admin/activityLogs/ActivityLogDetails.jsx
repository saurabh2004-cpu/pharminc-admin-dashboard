import React, { useState, useEffect } from 'react';
import {
    Box, CircularProgress, Alert, Paper, Typography, Button,
    Grid, Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import axiosInstance from '../../../axios/axiosInstance';
import { format } from 'date-fns';

const ActivityLogDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [log, setLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/admin/activity-logs', title: 'Activity Logs' },
        { title: 'Log Details' },
    ];

    useEffect(() => {
        const fetchLogDetails = async () => {
            try {
                const response = await axiosInstance.get(`/activity-logs/${id}`);
                setLog(response.data);
            } catch (err) {
                console.error('Error fetching activity log details:', err);
                setError(err.message || 'Failed to fetch log details');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchLogDetails();
    }, [id]);

    const renderJson = (data) => {
        if (!data) return <Typography color="textSecondary">No Data Available</Typography>;
        return (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', overflowX: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '13px' }}>
                    {JSON.stringify(data, null, 2)}
                </pre>
            </Paper>
        );
    };

    return (
        <PageContainer title="Activity Log Details" description="View details of a specific activity log">
            <Breadcrumb title="Log Details" items={BCrumb} />

            <Box mb={2}>
                <Button variant="outlined" onClick={() => navigate('/admin/activity-logs')}>
                    Back to Logs List
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Box mt={3}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            ) : log ? (
                <Paper variant="outlined" sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="h5" mb={3} fontWeight={600}>General Information</Typography>

                    <Grid container spacing={3} mb={4}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                            <Typography variant="body1" fontWeight={500}>
                                {format(new Date(log.createdAt), 'E, MMM d yyyy HH:mm:ss')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="subtitle2" color="textSecondary">Module</Typography>
                            <Typography variant="body1" fontWeight={500}>{log.module}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="subtitle2" color="textSecondary">Action</Typography>
                            <Typography variant="body1" fontWeight={500}>{log.action}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                            <Typography variant="body1" fontWeight={500}>{log.description || '-'}</Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ mb: 4 }} />

                    <Typography variant="h5" mb={3} fontWeight={600}>Data Audit</Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, height: '100%' }}>
                                <Typography variant="h6" mb={2} color="error.main">Old Data</Typography>
                                {renderJson(log.oldData)}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, height: '100%' }}>
                                <Typography variant="h6" mb={2} color="success.main">New Data</Typography>
                                {renderJson(log.newData)}
                            </Box>
                        </Grid>
                    </Grid>

                </Paper>
            ) : null}
        </PageContainer>
    );
};

export default ActivityLogDetails;
