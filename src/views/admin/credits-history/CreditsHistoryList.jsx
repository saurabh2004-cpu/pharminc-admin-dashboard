import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getAllCreditsHistory } from '../../../services/creditsHistoryService';

const CreditsHistoryList = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'institute', numeric: false, disablePadding: false, label: 'Institute Name' },
        { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
        { id: 'action', numeric: false, disablePadding: false, label: 'Action' },
        { id: 'cost', numeric: false, disablePadding: false, label: 'Cost' },
        { id: 'purchasedCredits', numeric: false, disablePadding: false, label: 'Purchased' },
        { id: 'currentCredits', numeric: false, disablePadding: false, label: 'Current' },
        { id: 'created_at', numeric: false, disablePadding: false, label: 'Date' },
    ];

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const response = await getAllCreditsHistory(page + 1, limit);
                if (response.data && response.data.data) {
                    setHistory(response.data.data);
                    setTotalCount(response.data.total || 0);
                } else {
                    setHistory([]);
                }
            } catch (err) {
                console.error("Error fetching credit history:", err);
                setError(err.response?.data?.error || err.message || "Failed to load credit history");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [page, limit]);

    const BCrumb = [
        { to: '/', title: 'Home' },
        { title: 'Credits History' },
    ];

    const handleCloseSnackbar = () => {
        setError(null);
    };

    return (
        <PageContainer title="Credits History" description="View all credit transactions">
            <Breadcrumb title="Credits History" items={BCrumb} sx={{ mt: '10px' }} />

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
                        tableData={history}
                        isCreditsHistoryList={true}
                        setTableData={setHistory}
                        serverPagination={true}
                        totalCount={totalCount}
                        page={page}
                        rowsPerPage={limit}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setLimit(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
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

export default CreditsHistoryList;
