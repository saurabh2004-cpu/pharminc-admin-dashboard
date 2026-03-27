import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getPackages } from '../../../services/packageService';
import { IconPlus } from '@tabler/icons-react';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Packages' },
];

const PackageList = () => {
    const navigate = useNavigate();
    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
        { id: 'price', numeric: true, disablePadding: false, label: 'Price' },
        { id: 'credits', numeric: true, disablePadding: false, label: 'Credits' },
        { id: 'createdAt', numeric: false, disablePadding: false, label: 'Created Date' },
    ];

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPackagesList = async () => {
        setLoading(true);
        try {
            const response = await getPackages();
            if (response.data && response.data.data) {
                setTableData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching packages list:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackagesList();
    }, []);

    return (
        <PageContainer title="Packages List" description="Manage all subscription packages">
            <Breadcrumb title="Packages List" items={BCrumb} />

            <Box mb={3} display="flex" justifyContent="flex-end">
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<IconPlus size="18" />}
                    onClick={() => navigate('/dashboard/packages/create')}
                >
                    Create Package
                </Button>
            </Box>

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
                        isPackagesList={true}
                        setTableData={setTableData}
                        serverPagination={false}
                    />
                )}
            </Box>
        </PageContainer>
    );
};

export default PackageList;
