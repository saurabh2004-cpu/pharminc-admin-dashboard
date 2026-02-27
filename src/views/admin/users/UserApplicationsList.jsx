import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useParams, useLocation } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getApplicationsByUserId } from '../../../services/applicationService';

const UserApplicationsList = () => {
    const { id } = useParams();
    const location = useLocation();

    // Safely retrieve username from state, default to specific ID or "User" if not navigated properly
    const userName = location.state?.userName || 'User';

    const BCrumb = [
        { to: '/', title: 'Home' },
        { to: '/dashboard/users/list', title: 'Users' },
        { title: userName },
        { title: 'Applications' }
    ];

    const headCells = [
        { id: 'job.title', numeric: false, disablePadding: false, label: 'Job Title' },
        { id: 'job.salaryMin', numeric: false, disablePadding: false, label: 'Salary' },
        { id: 'status', numeric: false, disablePadding: false, label: 'Application Status' },
        { id: 'created_at', numeric: false, disablePadding: false, label: 'Applied Date' },
        { id: 'job.jobType', numeric: false, disablePadding: false, label: 'Job Type' },
        { id: 'job.institute.name', numeric: false, disablePadding: false, label: 'Institute Name' },
    ];

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await getApplicationsByUserId(id);
            if (response?.data) {
                setTableData(response.data);
            }
        } catch (error) {
            console.error('Error fetching user applications:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchApplications();
        }
    }, [id]);

    return (
        <PageContainer title={`${userName} Applications`} description="This is the user applications list page">
            <Breadcrumb title={`${userName} Applications`} items={BCrumb} />

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
                        isUserApplicationsList={true}
                        setTableData={setTableData}
                        serverPagination={false}
                    />
                )}
            </Box>
        </PageContainer>
    );
};

export default UserApplicationsList;
