import * as React from 'react';
import { Box } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import { ProductProvider } from '../../../context/EcommerceContext';
import axiosInstance from '../../../axios/axiosInstance'
import ListTable from './ListTable';
import { CustomizerContext } from '../../../context/CustomizerContext'

const BCrumb = [
    {
        to: '/',
        title: 'Home',
    },
    {
        title: 'Categories ',
    },
];

const CategoriesList = () => {
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
            label: 'Category Name',
        },
        {
            id: 'Sequence',
            numeric: false,
            disablePadding: false,
            label: ' Sequence',
        },
        {
            id: 'description',
            numeric: false,
            disablePadding: false,
            label: 'Category Description',
        },
        {
            id: 'description-colour',
            numeric: false,
            disablePadding: false,
            label: 'Description Colour',
        },
        {
            id: 'brand',
            numeric: false,
            disablePadding: false,
            label: 'Brand ',
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

    const fetchCategoryList = async () => {
        try {
            const response = await axiosInstance.get('/category/get-categories');
            console.log("response categories", response);

            if (response.data.statusCode === 200) {
                setTableData(response.data.data);
            }

        } catch (error) {
            console.error('Error fetching brands list:', error);
            setError(error.message);
        }
    };

    const { isCollapse } = React.useContext(CustomizerContext);



    React.useEffect(() => {
        fetchCategoryList();
    }, []);

    return (
        // <ProductProvider>
            <PageContainer title="Categories List" description="this is Brands List page">
                {/* breadcrumb */}
                <Breadcrumb title="Categories List" items={BCrumb} />
                {/* end breadcrumb */}
                <Box
                // sx={{
                //     minWidth: isCollapse === "mini-sidebar" ? '120%' : '105%', // keep as number, not string
                //     marginLeft: isCollapse === "mini-sidebar" ? "-110px" : "-24px", // adjust values
                //     transition: "margin-left 0.3s ease", // smooth animation
                // }}
                >
                    <ListTable
                        showCheckBox={false}
                        headCells={headCells}
                        tableData={tableData}
                        isBrandsList={true} // Add this prop to identify it's brands data
                        setTableData={setTableData}
                    />
                </Box>
            </PageContainer>
        // </ProductProvider >
    );
};

export default CategoriesList;