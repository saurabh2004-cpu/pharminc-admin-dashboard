import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getUnverifiedUsers, verifyUser } from '../../../services/userService';
import { Snackbar } from '@mui/material';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'User Verification' },
];

const UserVerificationList = () => {
    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
        { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
        { id: 'role', numeric: false, disablePadding: false, label: 'Role' },
        { id: 'verificationStatus', numeric: false, disablePadding: false, label: 'Verification Status' },
        { id: 'createdAt', numeric: false, disablePadding: false, label: 'Created Date' },
    ];

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchUsersList = async () => {
        setLoading(true);
        try {
            // backend expects page 1-indexed, frontend Mui is 0-indexed
            const response = await getUnverifiedUsers(page + 1, limit, statusFilter);

            console.log("users list response", response);

            if (response.data && response.data.data) {
                setTableData(response.data.data);
                setTotalCount(response.data.total || response.data.data.length);
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
        try {
            await verifyUser(id, newStatus);

            setSuccessMessage(`User successfully ${newStatus.toLowerCase()}!`);
            fetchUsersList();
        } catch (err) {
            console.error('Error verifying user:', err);
            setError(err.response?.data?.error || err.message || 'Failed to update user status');
        }
    };

    const handleCloseSnackbar = () => {
        setSuccessMessage('');
        setError(null);
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
