import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getAllUserVerifications, approveUserVerification, rejectUserVerification } from '../../../services/verificationService';
import { Snackbar } from '@mui/material';
import RejectVerificationModal from './RejectVerificationModal';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'User Verification' },
];

const UserVerificationList = () => {
    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'name', numeric: false, disablePadding: false, label: 'User Name' },
        { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
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
    const [statusFilter, setStatusFilter] = useState('All');

    // Reject Modal State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectTargetId, setRejectTargetId] = useState(null);
    const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);

    const fetchUsersList = async () => {
        setLoading(true);
        try {
            // backend expects page 1-indexed, frontend Mui is 0-indexed
            const response = await getAllUserVerifications(page + 1, limit, statusFilter);

            if (response.data && response.data.verifications) {
                setTableData(response.data.verifications);
                setTotalCount(response.data.total || response.data.verifications.length);
            } else if (Array.isArray(response.data)) {
                setTableData(response.data);
                setTotalCount(response.data.length);
            }
        } catch (error) {
            console.error('Error fetching unverified users list:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersList();
    }, [page, limit, statusFilter]);

    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(0); // reset page to 1
    };

    const handleVerifyStatusChange = async (id, newStatus) => {
        if (newStatus === 'APPROVED') {
            try {
                await approveUserVerification(id);
                setSuccessMessage(`User verification successfully approved!`);
                fetchUsersList();
            } catch (err) {
                console.error('Error verifying user:', err);
                setError(err.response?.data?.error || err.message || 'Failed to update user status');
            }
        } else if (newStatus === 'REJECTED') {
            // Open Modal instead of directly calling API
            setRejectTargetId(id);
            setIsRejectModalOpen(true);
        }
    };

    const handleConfirmReject = async (payload) => {
        if (!rejectTargetId) return;
        setIsSubmittingRejection(true);
        try {
            await rejectUserVerification(rejectTargetId, payload);
            setSuccessMessage(`User verification successfully rejected!`);
            setIsRejectModalOpen(false);
            setRejectTargetId(null);
            fetchUsersList();
        } catch (err) {
            console.error('Error rejecting verification:', err);
            setError(err.response?.data?.error || err.message || 'Failed to reject verification');
        } finally {
            setIsSubmittingRejection(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccessMessage('');
        setError(null);
    };

    const closeRejectModal = () => {
        if (!isSubmittingRejection) {
            setIsRejectModalOpen(false);
            setRejectTargetId(null);
        }
    };

    return (
        <PageContainer title="User Verification List" description="This is the User Verification List page">
            <Breadcrumb title="User Verification" items={BCrumb} />

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
                        isUserVerificationsList={true}
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

            <RejectVerificationModal
                open={isRejectModalOpen}
                handleClose={closeRejectModal}
                handleReject={handleConfirmReject}
                isSubmitting={isSubmittingRejection}
            />

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

export default UserVerificationList;
