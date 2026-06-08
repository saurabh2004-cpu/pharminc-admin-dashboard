import React, { useState, useEffect } from 'react';
import { Grid, Box, CircularProgress, Alert, Snackbar, Typography, Card, CardContent, Divider, Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Button from '@mui/material/Button';
import { updateConsultationStatus, getConsultationById } from '../../../services/consultationService';
import { useNavigate, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

const ConsultationView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [status, setStatus] = useState('');

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchConsultation = async () => {
            try {
                const res = await getConsultationById(id);
                const fetchedData = res.data?.data || res.data;
                if (fetchedData) {
                    setData(fetchedData);
                    setStatus(fetchedData.status || 'Pending');
                }
            } catch (error) {
                setError('Failed to fetch consultation details');
            } finally {
                setFetchLoading(false);
            }
        };

        if (id) {
            fetchConsultation();
        }
    }, [id]);

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handleUpdateStatus = async () => {
        setLoading(true);
        try {
            const res = await updateConsultationStatus(id, status);
            if (res.status === 200 || res.data) {
                setSuccess(true);
                setData(prev => ({ ...prev, status }));
            }
        } catch (error) {
            const errDetails = error.response?.data?.error || error.response?.data?.details || error.message;
            setError(errDetails || 'An error occurred updating status');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccess(false);
        setError('');
    };

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/dashboard/consultations/list', title: 'Consultations' },
        { title: 'View Consultation' },
    ];

    if (fetchLoading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    if (!data) {
        return (
            <Box mt={3}>
                <Alert severity="error">Consultation not found</Alert>
            </Box>
        );
    }

    return (
        <div>
            <Breadcrumb title="Consultation Details" items={BCrumb} />
            
            <Card variant="outlined">
                <CardContent>
                    <Grid container spacing={3}>
                        {/* 1. Basic & Contact Info */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" color="primary" sx={{ mb: -1 }}>Basic & Contact Information</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                            <Typography variant="body1" fontWeight={500}>{data.name}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                            <Typography variant="body1" fontWeight={500}>{data.email}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                            <Typography variant="body1" fontWeight={500}>{data.phone}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">Alternate Phone</Typography>
                            <Typography variant="body1" fontWeight={500}>{data.alternatePhone || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">City</Typography>
                            <Typography variant="body1" fontWeight={500}>{data.customCity ? `${data.city} (${data.customCity})` : data.city}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">Convenient Call Time</Typography>
                            <Typography variant="body1" fontWeight={500}>{data.convenientCallTime}</Typography>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Divider sx={{ my: 1 }} />
                        </Grid>

                        {/* 2. Personal & Financial Details */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" color="primary" sx={{ mb: -1 }}>Personal & Financial Details</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">Marital Status</Typography>
                            <Typography variant="body1" fontWeight={500}>{data.maritalStatus}</Typography>
                        </Grid>
                        {data.spouseIncome && (
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Typography variant="subtitle2" color="textSecondary">Spouse Income</Typography>
                                <Typography variant="body1" fontWeight={500}>{data.spouseIncome}</Typography>
                            </Grid>
                        )}
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">Employment Status</Typography>
                            <Typography variant="body1" fontWeight={500}>{data.employmentStatus}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">Monthly Income</Typography>
                            <Typography variant="body1" fontWeight={500}>{data.monthlyIncome}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">Total Credit Card Dues</Typography>
                            <Typography variant="body1" fontWeight={500}>{data.totalCreditCardDues}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="subtitle2" color="textSecondary">Total Loan Dues</Typography>
                            <Typography variant="body1" fontWeight={500}>{data.totalLoanDues}</Typography>
                        </Grid>

                        {/* 3. Loan Issues & Settlement (Conditional) */}
                        {(data.totalLoanDues && data.totalLoanDues !== 'No Dues') && (
                            <>
                                <Grid size={{ xs: 12 }}>
                                    <Divider sx={{ my: 1 }} />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="h6" color="primary" sx={{ mb: -1 }}>Loan Settlement Details</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Payment Status</Typography>
                                    <Typography variant="body1" fontWeight={500}>{data.paymentStatus || 'N/A'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Facing Harassment</Typography>
                                    <Typography variant="body1" fontWeight={500}>{data.facingHarassment || 'N/A'}</Typography>
                                </Grid>
                                {data.receivedLegalNotice && (
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" color="textSecondary">Received Legal Notice?</Typography>
                                        <Typography variant="body1" fontWeight={500}>{data.receivedLegalNotice}</Typography>
                                    </Grid>
                                )}
                                {data.settlementTime && (
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" color="textSecondary">Settlement Time Requirement</Typography>
                                        <Typography variant="body1" fontWeight={500}>{data.settlementTime}</Typography>
                                    </Grid>
                                )}
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Any Past Settlement?</Typography>
                                    <Typography variant="body1" fontWeight={500}>{data.pastSettlement || 'N/A'}</Typography>
                                </Grid>
                                {data.receivedSettlementLetter && (
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" color="textSecondary">Received Settlement Letter?</Typography>
                                        <Typography variant="body1" fontWeight={500}>{data.receivedSettlementLetter}</Typography>
                                    </Grid>
                                )}
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Funds Requirement</Typography>
                                    <Typography variant="body1" fontWeight={500}>{data.fundsRequirement || 'N/A'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="textSecondary">Preferred Language</Typography>
                                    <Typography variant="body1" fontWeight={500}>{data.preferredLanguage || 'N/A'}</Typography>
                                </Grid>
                            </>
                        )}

                        <Grid size={{ xs: 12 }}>
                            <Divider sx={{ my: 1 }} />
                        </Grid>
                        
                        {/* 4. Message */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" color="textSecondary">Message</Typography>
                            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mt: 1 }}>
                                <Typography variant="body1">{data.message || 'No message provided'}</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box mt={4} mb={2}>
                        <Divider />
                    </Box>

                    <Grid container spacing={3} alignItems="center">
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="h6" mb={1}>Update Status</Typography>
                            <Box display="flex" gap={2} alignItems="center">
                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel id="status-select-label">Status</InputLabel>
                                    <Select
                                        labelId="status-select-label"
                                        value={status}
                                        label="Status"
                                        onChange={handleStatusChange}
                                    >
                                        <MenuItem value="Pending">Pending</MenuItem>
                                        <MenuItem value="Completed">Completed</MenuItem>
                                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                                    </Select>
                                </FormControl>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={handleUpdateStatus} 
                                    disabled={loading || status === data.status}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Save Status'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Snackbar
                open={!!error || success}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                {error ? (
                    <Alert onClose={handleCloseSnackbar} severity="error">{error}</Alert>
                ) : (
                    <Alert onClose={handleCloseSnackbar} severity="success">Status updated successfully!</Alert>
                )}
            </Snackbar>
        </div>
    );
};

export default ConsultationView;
