import React, { useState, useEffect } from 'react';
import { Box, MenuItem, Select, FormControl, InputLabel, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useLocation, useParams } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getJobsByInstituteId } from '../../../services/jobService';
import { getInstituteById } from '../../../services/instituteService';

const InstituteJobsList = () => {
    const { id } = useParams();
    const location = useLocation();
    const [instituteName, setInstituteName] = useState(location.state?.instituteName || '');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState('All');

    const headCells = [
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
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const response = await getJobsByInstituteId(id, page + 1, limit, statusFilter);
                if (response.data && response.data.data) {
                    setJobs(response.data.data);
                    setTotalCount(response.data.total || response.data.data.length);
                } else if (response.data && response.data.jobs) {
                    setJobs(response.data.jobs);
                    setTotalCount(response.data.total || response.data.jobs.length);
                } else if (Array.isArray(response.data)) {
                    setJobs(response.data);
                    setTotalCount(response.data.length);
                } else {
                    setJobs([]);
                }

                // If name is missing, fetch it
                if (!instituteName) {
                    const instRes = await getInstituteById(id);
                    if (instRes.data && instRes.data.name) {
                        setInstituteName(instRes.data.name);
                    }
                }
            } catch (err) {
                console.error("Error fetching institute jobs:", err);
                setError(err.response?.data?.error || err.message || "Failed to load jobs");
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [id, instituteName, page, limit, statusFilter]);

    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(0); // reset page to 1
    };

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/dashboard/institutes/list', title: 'Institutes' },
        { title: `${instituteName || 'Institute'} Jobs` },
    ];

    const handleCloseSnackbar = () => {
        setError(null);
    };

    return (
        <PageContainer title="Institute Jobs" description="View all jobs for this institute">
            <Breadcrumb title={`${instituteName || 'Institute'} Jobs`} items={BCrumb} sx={{ mt: '10px' }} />


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

export default InstituteJobsList;
