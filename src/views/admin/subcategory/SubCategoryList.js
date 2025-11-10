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
        title: 'Sub Categories',
    },
];

const SubCategoryList = () => {
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
            id: 'description',
            numeric: false,
            disablePadding: false,
            label: 'Category Description',
        },
        {
            id: 'description-color',
            numeric: false,
            disablePadding: false,
            label: 'Category Description Color',
        },
        {
            id: 'category',
            numeric: false,
            disablePadding: false,
            label: 'Category',
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

    const fetchSubCategoryList = async () => {
        try {
            const response = await axiosInstance.get('/subcategory/get-sub-categories');
            console.log("response sub categories", response.data.data);

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
        fetchSubCategoryList();
    }, []);

    return (
        <ProductProvider>
            <PageContainer title="Sub Categories List" description="this is Brands List page">
                {/* breadcrumb */}
                <Breadcrumb title="Sub Categories List" items={BCrumb} />
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
        </ProductProvider>
    );
};

export default SubCategoryList;