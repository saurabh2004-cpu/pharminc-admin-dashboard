import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useParams, useLocation } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getCreditsHistoryByInstituteId } from '../../../services/creditsHistoryService';
import { getInstituteById } from '../../../services/instituteService';

const InstituteCreditsHistoryList = () => {
    const { id } = useParams();
    const location = useLocation();

    const [instituteName, setInstituteName] = useState(location.state?.instituteName || 'Institute');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'job', numeric: false, disablePadding: false, label: 'Job Title' },
        { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
        { id: 'action', numeric: false, disablePadding: false, label: 'Action' },
        { id: 'cost', numeric: false, disablePadding: false, label: 'Cost' },
        { id: 'purchasedCredits', numeric: false, disablePadding: false, label: 'Purchased' },
        { id: 'currentCredits', numeric: false, disablePadding: false, label: 'Current' },
        { id: 'created_at', numeric: false, disablePadding: false, label: 'Date' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch context if missing
                if (!location.state?.instituteName) {
                    try {
                        const instRes = await getInstituteById(id);
                        if (instRes.data) {
                            setInstituteName(instRes.data.name);
                        }
                    } catch (e) {
                        console.error("Failed to fetch institute name:", e);
                    }
                }

                // Fetch history
                const response = await getCreditsHistoryByInstituteId(id);
                if (response.data) {
                    setHistory(response.data);
                }
            } catch (err) {
                console.error("Error fetching institute credit history:", err);
                setError(err.response?.data?.error || err.message || "Failed to load credits history");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, location.state]);

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/dashboard/institutes/list', title: 'Institutes' },
        { title: instituteName },
        { title: 'Credits History' }
    ];

    return (
        <PageContainer title={`${instituteName} Credits History`} description="View institute credit transactions">
            <Breadcrumb title={`${instituteName} Credits History`} items={BCrumb} />

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
                        serverPagination={false}
                    />
                )}
            </Box>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setError(null)} severity="error">{error}</Alert>
            </Snackbar>
        </PageContainer>
    );
};

export default InstituteCreditsHistoryList;
