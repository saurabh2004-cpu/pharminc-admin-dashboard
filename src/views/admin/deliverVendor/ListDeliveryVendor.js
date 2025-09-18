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
        title: 'Delivery Vendor',
    },
];

const ListDeliveryVendor = () => {
    const headCells = [
        {
            id: 'Actions',
            numeric: false,
            disablePadding: false,
            label: 'Actions',
        },
        {
            id: 'vendorName',
            numeric: false,
            disablePadding: false,
            label: 'Vendor Name',
        },
        {
            id: 'vendorTrackingUrl',
            numeric: false,
            disablePadding: false,
            label: 'Vendor Tracking URL',
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

    const fetchDeliveryVendorList = async () => {
        try {
            const response = await axiosInstance.get('/delivery-vendor/get-all-delivery-vendors');
            console.log("response delivery vendor list", response);

            if (response.status === 200) {
                setTableData(response.data);
            }

        } catch (error) {
            console.error('Error fetching delivery vendors list:', error);
            setError(error.message);
        }
    };

    const { isCollapse } = React.useContext(CustomizerContext);



    React.useEffect(() => {
        fetchDeliveryVendorList();
    }, []);

    return (
        <ProductProvider>
            <PageContainer title="Delivery Vendor List" description="this is Delivery Vendor page">
                {/* breadcrumb */}
                <Breadcrumb title="Delivery Vendor Kist" items={BCrumb} />
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

export default ListDeliveryVendor;