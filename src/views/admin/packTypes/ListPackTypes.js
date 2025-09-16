import * as React from 'react';
import { Box } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import { ProductProvider } from '../../../context/EcommerceContext';
import axiosInstance from '../../../axios/axiosInstance'
import ListTable from './ListTable';
import axios from 'axios';

const BCrumb = [
    {
        to: '/',
        title: 'Home',
    },
    {
        title: 'Pack Types',
    },
];

const ListPackTypes = () => {
    const headCells = [
        {
            id: 'Actions',
            numeric: false,
            disablePadding: false,
            label: 'Actions',
        },
        {
            id: 'name',
            numeric: false,
            disablePadding: false,
            label: 'Pack Name',
        },
        {
            id: 'quantity',
            numeric: false,
            disablePadding: false,
            label: 'Quantity',
        },
        {
            id: 'createdAt',
            numeric: false,
            disablePadding: false,
            label: 'Created Date',
        },
        
    ];

    const [tableData, setTableData] = React.useState([]);
    const [error, setError] = React.useState(null);

    const fetchPackTypesList = async () => {
        try {
            const response = await axiosInstance.get('/packs-types/get-all-packs-types');
            console.log("response pack types list", response);

            if (response.status === 200) {
                setTableData(response.data.data.packs);
            }

        } catch (error) {
            console.error('Error fetching pack types list:', error);
            setError(error.message);
        }
    };



    React.useEffect(() => {
        fetchPackTypesList();
    }, []);

    return (
        <ProductProvider>
            <PageContainer title="Pack Types" description="this is Pack Types page">
                {/* breadcrumb */}
                <Breadcrumb title="Pack Types" items={BCrumb} />
                {/* end breadcrumb */}
                <Box>
                    <ListTable
                        showCheckBox={false}
                        headCells={headCells}
                        tableData={tableData}
                        isBrandsList={true} // Add this prop to identify it's brands data
                        setTableData={setTableData}
                    />
                </Box>
            </PageContainer>
        </ProductProvider>
    );
};

export default ListPackTypes;