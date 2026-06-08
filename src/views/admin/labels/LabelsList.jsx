import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { Link } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getAllLabels, deleteLabel } from '../../../services/labelService';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Labels' },
];

const LabelsList = () => {
    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
        { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
        { id: 'isFeatured', numeric: false, disablePadding: false, label: 'Is Featured' },
        { id: 'createdAt', numeric: false, disablePadding: false, label: 'Created Date' },
    ];

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('');

    const typeFilterOptions = [
        { label: 'All Types', value: '' },
        { label: 'City', value: 'city' },
        { label: 'State', value: 'state' },
        { label: 'Bank', value: 'bank' }
    ];

    const fetchList = async (type = '') => {
        setLoading(true);
        try {
            const response = await getAllLabels(type);
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
        fetchList(selectedType);
    }, [selectedType]);

    const handleTypeFilterChange = (event) => {
        setSelectedType(event.target.value);
    };

    return (
        <PageContainer title="Labels List" description="This is the Labels List page">
            <Breadcrumb title="Labels List" items={BCrumb}>
                <Box>
                    <Button component={Link} to="/dashboard/labels/create" variant="contained" color="primary">
                        Add New Label
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
                        isLabelsList={true}
                        setTableData={setTableData}
                        onDelete={deleteLabel}
                        statusFilter={selectedType}
                        onStatusFilterChange={handleTypeFilterChange}
                        statusFilterOptions={typeFilterOptions}
                    />
                )}
            </Box>
        </PageContainer>
    );
};

export default LabelsList;
