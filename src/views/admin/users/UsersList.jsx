import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getAllUsers } from '../../../services/userService';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Users' },
];

const UsersList = () => {
    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
        { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
        { id: 'role', numeric: false, disablePadding: false, label: 'Role' },
        { id: 'city', numeric: false, disablePadding: false, label: 'City' },
        { id: 'country', numeric: false, disablePadding: false, label: 'Country' },
        { id: 'experience', numeric: true, disablePadding: false, label: 'Experience (Yrs)' },
        { id: 'createdAt', numeric: false, disablePadding: false, label: 'Created Date' },
    ];

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    const [roleFilter, setRoleFilter] = useState('All');

    const fetchUsersList = async () => {
        setLoading(true);
        try {
            // backend expects page 1-indexed, frontend Mui is 0-indexed
            const response = await getAllUsers(page + 1, limit, roleFilter);
            if (response.data && response.data.data) {
                setTableData(response.data.data);
                setTotalCount(response.data.total || response.data.data.length);
            }
        } catch (error) {
            console.error('Error fetching users list:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersList();
    }, [page, limit, roleFilter]);

    const handleFilterChange = (e) => {
        setRoleFilter(e.target.value);
        setPage(0); // reset page to 1
    };

    return (
        <PageContainer title="Users List" description="This is the Users List page">
            <Breadcrumb title="Users List" items={BCrumb} />

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
                        isUsersList={true}
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
                        statusFilter={roleFilter}
                        onStatusFilterChange={handleFilterChange}
                        statusFilterOptions={[
                            { value: 'All', label: 'All Roles' },
                            { value: 'DOCTOR', label: 'Doctor' },
                            { value: 'NURSE', label: 'Nurse' },
                            { value: 'STUDENT', label: 'Student' },
                            { value: 'OTHER', label: 'Other' },
                        ]}
                    />
                )}
            </Box>
        </PageContainer>
    );
};

export default UsersList;
