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
    title: 'Item Discounts',
  },
];

const ListPricingGroupsDiscounts = () => {
  const headCells = [


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
      console.log("response item based discounts", response);

      if (response.data.statusCode === 200) {
        setTableData(response.data.data);
      }

    } catch (error) {
      console.error('Error fetching brands list:', error);
      setError(error.message);
    }
  };



  React.useEffect(() => {
    fetchPricingGroupsDiscounts();
  }, []);

  return (
    <ProductProvider>
      <PageContainer title="Item Discounts List" description="this is Item Discounts List page">
        {/* breadcrumb */}
        <Breadcrumb title="Item Discounts" items={BCrumb} />
        {/* end breadcrumb */}
        <Box sx={{ minWidth: '105', marginLeft: '-24px' }}>
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

export default ListPricingGroupsDiscounts;