import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { getAllConsultations, deleteConsultation } from '../../../services/consultationService';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Consultations' },
];

const ConsultationList = () => {
    const headCells = [
        { id: 'Actions', numeric: false, disablePadding: false, label: 'Actions' },
        { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
        { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
        { id: 'phone', numeric: false, disablePadding: false, label: 'Phone' },
        { id: 'city', numeric: false, disablePadding: false, label: 'City' },
        { id: 'totalCreditCardDues', numeric: false, disablePadding: false, label: 'CC Dues' },
        { id: 'totalLoanDues', numeric: false, disablePadding: false, label: 'Loan Dues' },
        { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
        { id: 'createdAt', numeric: false, disablePadding: false, label: 'Created Date' },
    ];

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchList = async () => {
        setLoading(true);
        try {
            const response = await getAllConsultations();
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
        <PageContainer title="Consultations List" description="This is the Consultations List page">
            <Breadcrumb title="Consultations List" items={BCrumb} />
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
                        isConsultationsList={true}
                        setTableData={setTableData}
                        onDelete={deleteConsultation}
                    />
                )}
            </Box>
        </PageContainer>
    );
};

export default ConsultationList;
