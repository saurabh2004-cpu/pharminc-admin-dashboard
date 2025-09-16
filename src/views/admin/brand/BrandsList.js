import * as React from 'react';
import { Box } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ProductTableList from '../../../components/apps/ecommerce/ProductTableList/ProductTableList';
import { ProductProvider } from '../../../context/EcommerceContext';
import axiosInstance from '../../../axios/axiosInstance'

const BCrumb = [
    {
        to: '/',
        title: 'Home',
    },
    {
        title: 'Brands',
    },
];

const BrandsList = () => {
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
            label: 'Brand Name',
        },
        {
            id: 'slug',
            numeric: false,
            disablePadding: false,
            label: 'Slug',
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

    const fetchBrandsList = async () => {
        try {
            const response = await axiosInstance.get('/brand/get-brands-list');
            console.log("response brands", response);

            if (response.data.statusCode === 200) {
                // Extract the data array from the response
                setTableData(response.data.data);
            }

        } catch (error) {
            console.error('Error fetching brands list:', error);
            setError(error.message);
        }
    };



    React.useEffect(() => {
        fetchBrandsList();
    }, []);

    return (
        <ProductProvider>
            <PageContainer title="Brands List" description="this is Brands List page">
                {/* breadcrumb */}
                <Breadcrumb title="Brands List" items={BCrumb} />
                {/* end breadcrumb */}
                <Box>
                    <ProductTableList
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

export default BrandsList;