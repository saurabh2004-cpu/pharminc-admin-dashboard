import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    Avatar,
    Divider,
    CircularProgress,
    Alert,
    Chip,
    Snackbar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import { getInstituteById } from '../../../services/instituteService';
import { getJobsByInstituteId } from '../../../services/jobService';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { format } from 'date-fns';

const BCrumb = [
    { to: '/', title: 'Home' },
    { to: '/dashboard/institutes/list', title: 'Institutes' },
    { title: 'Institute Details' },
];

function stringToColor(string) {
    if (!string) return '#10163A';
    let hash = 0;
    let i;
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
}

function stringAvatar(name) {
    if (!name) return { children: 'I', bgcolor: '#10163A' };
    const splitName = name.split(' ').filter(Boolean);
    const firstLetter = splitName[0]?.[0] || '';
    const secondLetter = splitName[1]?.[0] || '';
    return {
        bgcolor: stringToColor(name),
        children: `${firstLetter}${secondLetter}`.toUpperCase(),
    };
}

// Reusable component for displaying field rows
const FieldRow = ({ label, value }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" py={1.5} borderBottom="1px solid rgba(0,0,0,0.05)">
            <Typography variant="subtitle2" color="textSecondary">{label}</Typography>
            <Typography variant="body1" fontWeight="500" textAlign="right">{value}</Typography>
        </Box>
    );
};

const InstituteDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [institute, setInstitute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Jobs Table State
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [jobsError, setJobsError] = useState(null);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState('All');

    const jobsHeadCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'title', numeric: false, disablePadding: false, label: 'Job Title' },
        { id: 'role', numeric: false, disablePadding: false, label: 'Role' },
        { id: 'jobType', numeric: false, disablePadding: false, label: 'Job Type' },
        { id: 'workLocation', numeric: false, disablePadding: false, label: 'Work Location' },
        { id: 'experienceLevel', numeric: false, disablePadding: false, label: 'Experience Level' },
        { id: 'salaryRange', numeric: false, disablePadding: false, label: 'Salary Range' },
        { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
        { id: 'speciality', numeric: false, disablePadding: false, label: 'Speciality' },
        { id: 'subSpeciality', numeric: false, disablePadding: false, label: 'SubSpeciality' },
        { id: 'city', numeric: false, disablePadding: false, label: 'City' },
        { id: 'country', numeric: false, disablePadding: false, label: 'Country' },
        { id: 'applicationDeadline', numeric: false, disablePadding: false, label: 'Deadline' },
        { id: 'contactEmail', numeric: false, disablePadding: false, label: 'Contact Email' },
        { id: 'contactPhone', numeric: false, disablePadding: false, label: 'Contact Phone' },
        { id: 'contactPerson', numeric: false, disablePadding: false, label: 'Contact Person' },
        { id: 'created_at', numeric: false, disablePadding: false, label: 'Created Date' },
        { id: 'updated_at', numeric: false, disablePadding: false, label: 'Updated Date' },
    ];

    useEffect(() => {
        const fetchInstitute = async () => {
            try {
                const response = await getInstituteById(id);
                if (response.data) {
                    setInstitute(response.data);
                }
            } catch (err) {
                console.error("Error fetching institute data:", err);
                setError(err.response?.data?.error || err.message || "Failed to load institute details");
            } finally {
                setLoading(false);
            }
        };
        fetchInstitute();
    }, [id]);

    useEffect(() => {
        const fetchJobs = async () => {
            setJobsLoading(true);
            try {
                const response = await getJobsByInstituteId(id, page + 1, limit, statusFilter);
                if (response.data && response.data.jobs) {
                    setJobs(response.data.jobs);
                    setTotalCount(response.data.total || response.data.jobs.length);
                } else {
                    setJobs([]);
                }
            } catch (err) {
                console.error("Error fetching institute jobs:", err);
                setJobsError(err.response?.data?.error || err.message || "Failed to load jobs");
            } finally {
                setJobsLoading(false);
            }
        };

        if (id) {
            fetchJobs();
        }
    }, [id, page, limit, statusFilter]);

    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(0);
    };

    const handleCloseSnackbar = () => {
        setJobsError(null);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !institute) {
        return (
            <PageContainer title="Institute Details" description="View institute profile">
                <Breadcrumb title="Institute Details" items={BCrumb} />
                <Alert severity="error">{error || "Institute not found"}</Alert>
            </PageContainer>
        );
    }

    const fallbackProps = !institute.profile_picture ? stringAvatar(institute.name || '') : {};

    return (
        <PageContainer title="Institute Details" description="View institute profile">
            <Breadcrumb title="Institute Details" items={BCrumb} />

            {/* TOP SECTION: Cover & Profile Avatar */}
            <Card sx={{ padding: 0, mb: 3, overflow: 'visible' }}>
                <Box sx={{
                    height: '220px',
                    background: institute.banner_picture ? `url(${institute.banner_picture})` : 'linear-gradient(135deg, #10163A 0%, #3e4e9b 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                }}>
                    <Box sx={{
                        position: 'absolute',
                        bottom: '-65px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <Avatar
                            src={institute.profile_picture || undefined}
                            alt={institute.name}
                            sx={{
                                width: 130,
                                height: 130,
                                border: '4px solid white',
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                backgroundColor: fallbackProps.bgcolor || 'white',
                                fontSize: '3rem',
                                fontWeight: 'bold',
                                color: 'white'
                            }}
                        >
                            {fallbackProps.children}
                        </Avatar>
                    </Box>
                </Box>

                <CardContent sx={{ pt: 10, pb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="700" gutterBottom>
                        {institute.name || 'No Name'}
                    </Typography>

                    {institute.headline && (
                        <Typography variant="h6" color="textSecondary" sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}>
                            {institute.headline}
                        </Typography>
                    )}

                    <Box display="flex" justifyContent="center" gap={2} mt={2}>
                        <Chip
                            label={institute.role || 'INSTITUTE'}
                            color="primary"
                            variant="outlined"
                        />
                        <Chip
                            size="small"
                            color={institute.verified ? "success" : "warning"}
                            label={institute.verified ? "Verified" : "Unverified"}
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* MAIN CONTENT LAYOUT */}
            <Grid container spacing={3}>

                {/* LEFT SECTION: Professional Details */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" fontWeight="600" mb={3} borderBottom="2px solid #f0f0f0" pb={1}>
                                Institute Details
                            </Typography>

                            <Box display="flex" flexDirection="column">
                                <FieldRow label="Type" value={institute.type} />
                                <FieldRow label="Ownership" value={institute.ownership} />
                                <FieldRow label="Year Established" value={institute.yearEstablished} />
                                <FieldRow label="Affiliated University" value={institute.affiliatedUniversity} />
                                <FieldRow label="Beds Count" value={institute.bedsCount} />
                                <FieldRow label="Staff Count" value={institute.staffCount} />
                                <FieldRow label="Created Date" value={institute.created_at ? format(new Date(institute.created_at), 'MMM d, yyyy') : null} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* RIGHT SECTION: Contact Info */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" fontWeight="600" mb={3} borderBottom="2px solid #f0f0f0" pb={1}>
                                Contact Info
                            </Typography>

                            <Box display="flex" flexDirection="column">
                                <FieldRow label="Email" value={institute.contactEmail} />
                                <FieldRow label="Contact Number" value={institute.contactNumber} />
                                <FieldRow label="Telephone" value={institute.telephone} />
                                <FieldRow label="Location" value={institute.city && institute.country ? `${institute.city}, ${institute.country}` : institute.country || institute.city} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* BELOW SECTIONS */}
            <Grid container spacing={3} mt={0}>
                {institute.about && (
                    <Grid item size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" fontWeight="600" mb={2}>About</Typography>
                                <Typography variant="body1" color="textSecondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                                    {institute.about}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {institute.services && institute.services.length > 0 && (
                    <Grid item size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" fontWeight="600" mb={2}>Services</Typography>
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {institute.services.map((service, index) => (
                                        <Chip key={index} label={service} variant="filled" sx={{ borderRadius: '8px', px: 1 }} />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            {/* JOBS SECTION */}
            <Box mt={4}>
                <Typography variant="h4" fontWeight="600" mb={2}>
                    Jobs Posted by {institute.name}
                </Typography>

                <Card>
                    <CardContent>
                        {jobsLoading ? (
                            <Box display="flex" justifyContent="center" mt={3} mb={3}>
                                <CircularProgress />
                            </Box>
                        ) : jobsError ? (
                            <Box mt={3} mb={3}>
                                <Alert severity="error">{jobsError}</Alert>
                            </Box>
                        ) : (
                            <ProductTableList
                                showCheckBox={false}
                                headCells={jobsHeadCells}
                                tableData={jobs}
                                isJobsList={true}
                                setTableData={setJobs}
                                serverPagination={true}
                                totalCount={totalCount}
                                page={page}
                                rowsPerPage={limit}
                                onPageChange={(e, newPage) => setPage(newPage)}
                                onRowsPerPageChange={(e) => {
                                    setLimit(parseInt(e.target.value, 10));
                                    setPage(0);
                                }}
                                statusFilter={statusFilter}
                                onStatusFilterChange={handleFilterChange}
                                statusFilterOptions={[
                                    { value: 'All', label: 'All' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                    { value: 'expired', label: 'Expired' },
                                ]}
                            />
                        )}
                    </CardContent>
                </Card>
            </Box>

            <Snackbar
                open={!!jobsError}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error">{jobsError}</Alert>
            </Snackbar>
        </PageContainer>
    );
};

export default InstituteDetails;
