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
    title: 'Item Discounts',
  },
];

const ListPricingGroupsDiscounts = () => {
  const headCells = [
    {
      id: 'Actions',
      numeric: false,
      disablePadding: false,
      label: 'Actions',
    },

    {
      id: 'customerId',
      numeric: false,
      disablePadding: false,
      label: 'Customer ID',
    },
    {
      id: 'customerName',
      numeric: false,
      disablePadding: false,
      label: 'Customer Name',
    },
    {
      id: 'updated At',
      numeric: false,
      disablePadding: false,
      label: 'Last Updated Date',
    },

  ];

  const [tableData, setTableData] = React.useState([]);
  const [error, setError] = React.useState(null);

  const fetchPricingGroupsDiscounts = async () => {
    try {
      const response = await axiosInstance.get('/item-based-discount/get-all-item-based-discounts');
      // console.log("response item based discounts", response);

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
    fetchPricingGroupsDiscounts();
  }, []);

  return (
    // <ProductProvider>
      <PageContainer title="Item Discounts List" description="this is Item Discounts List page">
        {/* breadcrumb */}
        <Breadcrumb title="Item Discounts" items={BCrumb} />
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
    // </ProductProvider>
  );
};

export default ListPricingGroupsDiscounts;