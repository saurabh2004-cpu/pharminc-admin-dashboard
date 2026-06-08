import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { Link } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getAllServices, deleteService } from '../../../services/servicesService';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Services' },
];

const ServicesList = () => {
    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
        { id: 'title', numeric: false, disablePadding: false, label: 'Title' },
        { id: 'relatedServices', numeric: false, disablePadding: false, label: 'Related Services' },
        { id: 'createdAt', numeric: false, disablePadding: false, label: 'Created Date' },
    ];

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchList = async () => {
        setLoading(true);
        try {
            const response = await getAllServices();
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
        fetchList();
    }, []);

    return (
        <PageContainer title="Services List" description="This is the Services List page">
            <Breadcrumb title="Services List" items={BCrumb}>
                <Box>
                    <Button component={Link} to="/dashboard/services/create" variant="contained" color="primary">
                        Add New Service
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
                        isServicesList={true}
                        setTableData={setTableData}
                        onDelete={deleteService}
                    />
                )}
            </Box>
        </PageContainer>
    );
};

export default ServicesList;
