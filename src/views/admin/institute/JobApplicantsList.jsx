import React, { useState, useEffect } from 'react';
import { Box, MenuItem, Select, FormControl, InputLabel, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useLocation, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getApplicationsByJobId } from '../../../services/applicationService';

const JobApplicantsList = () => {
    const { id } = useParams();
    const location = useLocation();
    const [jobName, setJobName] = useState(location.state?.jobName || '');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState('All');

    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'applicantName', numeric: false, disablePadding: false, label: 'Applicant Name' },
        { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
        { id: 'currentPosition', numeric: false, disablePadding: false, label: 'Current Position' },
        { id: 'currentInstitute', numeric: false, disablePadding: false, label: 'Current Institute' },
        { id: 'experienceYears', numeric: false, disablePadding: false, label: 'Experience Years' },
        { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
        { id: 'appliedDate', numeric: false, disablePadding: false, label: 'Applied Date' },
        { id: 'resume', numeric: false, disablePadding: false, label: 'Resume' },
        { id: 'extraActions', numeric: false, disablePadding: false, label: 'Actions' },
    ];

    useEffect(() => {
        const fetchApplicants = async () => {
            setLoading(true);
            try {
                const response = await getApplicationsByJobId(id, page + 1, limit, statusFilter);
                if (response.data && response.data.data) {
                    setApplications(response.data.data);
                    setTotalCount(response.data.total || response.data.data.length);
                } else if (response.data && response.data.applications) {
                    setApplications(response.data.applications);
                    setTotalCount(response.data.total || response.data.applications.length);
                } else if (Array.isArray(response.data)) {
                    setApplications(response.data);
                    setTotalCount(response.data.length);
                } else {
                    setApplications([]);
                }
            } catch (err) {
                console.error("Error fetching job applicants:", err);
                setError(err.response?.data?.error || err.message || "Failed to load applicants");
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [id, page, limit, statusFilter]);

    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(0); // reset page to 1
    };

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/dashboard/institutes/list', title: 'Institutes' },
        { title: 'Jobs', to: -1 }, // Go back to jobs list? Or use a static path if possible
        { title: `${jobName || 'Job'} Applicants` },
    ];

    const handleCloseSnackbar = () => {
        setError(null);
    };

    return (
        <PageContainer title="Job Applicants" description="View all applicants for this job">
            <Breadcrumb title={`${jobName || 'Job'} Applicants`} items={BCrumb} sx={{ mt: '10px' }} />


            <Box>
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={5}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box mt={3}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                ) : (
                    <ProductTableList
                        showCheckBox={false}
                        headCells={headCells}
                        tableData={applications}
                        isApplicantsList={true}
                        setTableData={setApplications}
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
                            { value: 'APPLIED', label: 'Applied' },
                            { value: 'SHORTLISTED', label: 'Shortlisted' },
                            { value: 'NEXT_ROUND_REQUESTED', label: 'Next Round Requested' },
                            { value: 'NEXT_ROUND_ACCEPTED', label: 'Next Round Accepted' },
                            { value: 'NEXT_ROUND_REJECTED', label: 'Next Round Rejected' },
                            { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
                            { value: 'INTERVIEW_ACCEPTED', label: 'Interview Accepted' },
                            { value: 'REJECTED', label: 'Rejected' },
                            { value: 'HIRED', label: 'Hired' },
                        ]}
                    />
                )}
            </Box>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error">{error}</Alert>
            </Snackbar>
        </PageContainer>
    );
};

export default JobApplicantsList;
