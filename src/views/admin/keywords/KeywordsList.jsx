import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { Link } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getAllKeywords, deleteKeyword, updateKeyword } from '../../../services/keywordService';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Keywords' },
];

const KeywordsList = () => {
    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'keyword', numeric: false, disablePadding: false, label: 'Keyword' },
        { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
        { id: 'createdAt', numeric: false, disablePadding: false, label: 'Created Date' },
    ];

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('pending'); // Default to pending status

    const statusFilterOptions = [
        { label: 'All Statuses', value: '' },
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' }
    ];

    const fetchList = async (status = '') => {
        setLoading(true);
        try {
            const response = await getAllKeywords(status);
            if (response.data && response.data.data) {
                setTableData(response.data.data);
            } else if (response.data) {
                setTableData(response.data);
            }
        } catch (error) {
            console.error('Error fetching list:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList(selectedStatus);
    }, [selectedStatus]);

    const handleStatusFilterChange = (event) => {
        setSelectedStatus(event.target.value);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await updateKeyword(id, { status: newStatus });
            if (res.status === 200 || res.data) {
                // Update local state by updating or filtering changed status item
                setTableData((prev) => 
                    prev.map((kw) => {
                        const kwId = kw._id || kw.id;
                        if (kwId === id) {
                            return { ...kw, status: newStatus };
                        }
                        return kw;
                    }).filter((kw) => {
                        if (selectedStatus && kw.status !== selectedStatus) {
                            return false;
                        }
                        return true;
                    })
                );
            }
        } catch (err) {
            console.error('Failed to update keyword status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    return (
        <PageContainer title="Keywords List" description="This is the Keywords List page">
            <Breadcrumb title="Keywords List" items={BCrumb}>
                <Box>
                    <Button component={Link} to="/dashboard/keywords/import" variant="contained" color="primary">
                        Import CSV
                    </Button>
                </Box>
            </Breadcrumb>
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
                        isKeywordsList={true}
                        setTableData={setTableData}
                        onDelete={deleteKeyword}
                        onStatusChange={handleStatusChange}
                        statusFilter={selectedStatus}
                        onStatusFilterChange={handleStatusFilterChange}
                        statusFilterOptions={statusFilterOptions}
                    />
                )}
            </Box>
        </PageContainer>
    );
};

export default KeywordsList;
