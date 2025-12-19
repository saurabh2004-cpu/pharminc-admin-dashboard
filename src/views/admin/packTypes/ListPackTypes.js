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
            // console.log("response pack types list", response);

            if (response.status === 200) {
                setTableData(response.data.data.packs);
            }

        } catch (error) {
            console.error('Error fetching pack types list:', error);
            setError(error.message);
        }
    };

    const { isCollapse } = React.useContext(CustomizerContext);

    React.useEffect(() => {
        fetchPackTypesList();
    }, []);

    return (
        // <ProductProvider>
            <PageContainer title="Pack Types List" description="this is Pack Types page">
                {/* breadcrumb */}
                <Breadcrumb title="Pack Types List" items={BCrumb} />
                {/* end breadcrumb */}
                <Box
                // sx={{
                //     minWidth: isCollapse === "mini-sidebar" ? '120%' : '105%', // keep as number, not string
                //     marginLeft: isCollapse === "mini-sidebar" ? "-110px" : "-24px", // adjust values
                //     transition: "margin-left 0.3s ease", // smooth animation
                // }}
                >
                    < ListTable
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

export default ListPackTypes;