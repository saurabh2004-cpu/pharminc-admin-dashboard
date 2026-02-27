import React, { useState, useEffect } from 'react';
import { Box, MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getInstitutes } from '../../../services/instituteService';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Institutes' },
];

const InstituteList = () => {
    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
        { id: 'role', numeric: false, disablePadding: false, label: 'Role' },
        { id: 'verified', numeric: false, disablePadding: false, label: 'Verified' },
        { id: 'contactEmail', numeric: false, disablePadding: false, label: 'Contact Email' },
        { id: 'contactNumber', numeric: false, disablePadding: false, label: 'Contact Number' },
        { id: 'city', numeric: false, disablePadding: false, label: 'City' },
        { id: 'country', numeric: false, disablePadding: false, label: 'Country' },
        { id: 'bedsCount', numeric: true, disablePadding: false, label: 'Beds Count' },
        { id: 'staffCount', numeric: true, disablePadding: false, label: 'Staff Count' },
        { id: 'createdAt', numeric: false, disablePadding: false, label: 'Created Date' },
    ];

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchInstitutesList = async () => {
        setLoading(true);
        try {
            // backend expects page 1-indexed, frontend Mui is 0-indexed
            const response = await getInstitutes(page + 1, limit, statusFilter);
            console.log("response", response)
            if (response.data && response.data.data) {
                setTableData(response.data.data);
                setTotalCount(response.data.total || response.data.data.length);
            } else if (response.data && response.data.institutes) {
                setTableData(response.data.institutes);
                setTotalCount(response.data.total || response.data.institutes.length);
            }
        } catch (error) {
            console.error('Error fetching institutes list:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstitutesList();
    }, [page, limit, statusFilter]);

    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(0); // reset page to 1
    };

    return (
        <PageContainer title="Institutes List" description="This is the Institutes List page">
            <Breadcrumb title="Institutes List" items={BCrumb} />

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
                        isInstitutesList={true}
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
                            { value: 'All', label: 'All' },
                            { value: 'PENDING', label: 'Pending' },
                            { value: 'APPROVED', label: 'Approved' },
                            { value: 'REJECTED', label: 'Rejected' },
                        ]}
                    />
                )}
            </Box>
        </PageContainer>
    );
};

export default InstituteList;
