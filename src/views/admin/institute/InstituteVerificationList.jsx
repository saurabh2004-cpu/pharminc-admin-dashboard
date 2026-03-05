import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getAllInstituteVerifications, approveInstituteVerification, rejectInstituteVerification } from '../../../services/verificationService';
import { Snackbar } from '@mui/material';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Institute Verification Queue' },
];

const InstituteVerificationList = () => {
    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'name', numeric: false, disablePadding: false, label: 'Institute Name' },
        { id: 'email', numeric: false, disablePadding: false, label: 'Contact Email' },
        { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
        { id: 'created_at', numeric: false, disablePadding: false, label: 'Submitted Date' },
        { id: 'documents', numeric: false, disablePadding: false, label: 'Documents' },
    ];

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState('PENDING');

    const fetchInstitutesList = async () => {
        setLoading(true);
        try {
            const response = await getAllInstituteVerifications(page + 1, limit, statusFilter);

            if (response.data && response.data.verifications) {
                setTableData(response.data.verifications);
                setTotalCount(response.data.total || response.data.verifications.length);
            } else if (Array.isArray(response.data)) {
                setTableData(response.data);
                setTotalCount(response.data.length);
            }
        } catch (error) {
            console.error('Error fetching unverified institutes list:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstitutesList();
    }, [page, limit, statusFilter]);

    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(0);
    };

    const handleVerifyStatusChange = async (id, newStatus) => {
        try {
            if (newStatus === 'APPROVED') {
                await approveInstituteVerification(id);
            } else {
                await rejectInstituteVerification(id);
            }

            setSuccessMessage(`Institute verification successfully ${newStatus.toLowerCase()}!`);
            fetchInstitutesList();
        } catch (err) {
            console.error('Error verifying institute:', err);
            setError(err.response?.data?.error || err.message || 'Failed to update institute status');
        }
    };

    const handleCloseSnackbar = () => {
        setSuccessMessage('');
        setError(null);
    };

    return (
        <PageContainer title="Institute Verification List" description="This is the Institute Verification List page">
            <Breadcrumb title="Institute Verification Queue" items={BCrumb} />

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
                        tableData={tableData}
                        isInstituteVerificationsList={true}
                        setTableData={setTableData}
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
                            { value: 'All', label: 'All Statuses' },
                            { value: 'PENDING', label: 'Pending' },
                            { value: 'REJECTED', label: 'Rejected' },
                        ]}
                        onVerifyStatusChange={handleVerifyStatusChange}
                    />
                )}
            </Box>

            <Snackbar
                open={!!error || !!successMessage}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
                    {error || successMessage}
                </Alert>
            </Snackbar>
        </PageContainer>
    );
};

export default InstituteVerificationList;
