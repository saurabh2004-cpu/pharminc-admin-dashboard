import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getAllAdmins } from '../../../services/adminService';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Admins' },
];

const AdminsList = () => {
    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
        { id: 'role', numeric: false, disablePadding: false, label: 'Role' },
        { id: 'created_at', numeric: false, disablePadding: false, label: 'Created Date' },
    ];

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAdminsList = async () => {
        setLoading(true);
        try {
            const response = await getAllAdmins();
            if (response.data && response.data.data) {
                setTableData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching admins list:', error);
            setError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminsList();
    }, []);

    return (
        <PageContainer title="Admins List" description="This is the Admins List page">
            <Breadcrumb title="Admins List" items={BCrumb} />

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
                        isAdminList={true}
                        setTableData={setTableData}
                    />
                )}
            </Box>
        </PageContainer>
    );
};

export default AdminsList;
