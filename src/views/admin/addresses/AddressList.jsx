import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { Link } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getAllAddresses, deleteAddress } from '../../../services/addressService';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Addresses' },
];

const AddressList = () => {
    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'city', numeric: false, disablePadding: false, label: 'City' },
        { id: 'state', numeric: false, disablePadding: false, label: 'State' },
        { id: 'country', numeric: false, disablePadding: false, label: 'Country' },
        { id: 'pincode', numeric: false, disablePadding: false, label: 'Pincode' },
    ];

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchList = async () => {
        setLoading(true);
        try {
            const response = await getAllAddresses();
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
        <PageContainer title="Addresses List" description="This is the Addresses List page">
            <Breadcrumb title="Addresses List" items={BCrumb}>
                <Box>
                    <Button component={Link} to="/dashboard/addresses/create" variant="contained" color="primary">
                        Add New Address
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
                        isAddressesList={true}
                        setTableData={setTableData}
                        onDelete={deleteAddress}
                    />
                )}
            </Box>
        </PageContainer>
    );
};

export default AddressList;
