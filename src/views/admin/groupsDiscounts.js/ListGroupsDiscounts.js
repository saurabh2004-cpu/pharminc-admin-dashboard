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
    title: 'Pricing Groups Discounts',
  },
];

const ListGroupsDiscounts = () => {
  const headCells = [
    
    {
      id: 'customerId',
      numeric: false,
      disablePadding: false,
      label: 'Customer ID',
    },
    {
      id: 'CustomerName',
      numeric: false,
      disablePadding: false,
      label: 'Customer Name',
    },
    
    
    {
      id: 'Last Updated Date',
      numeric: false,
      disablePadding: false,
      label: 'Last Updated Date',
    },

  ];

  const [tableData, setTableData] = React.useState([]);
  const [error, setError] = React.useState(null);

  const fetchPricingGroupsDiscounts = async () => {
    try {
      const response = await axiosInstance.get('/pricing-groups-discount/get-all-pricing-group-discounts');
      console.log("response pricing groups", response);

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
      <PageContainer title="Pricing Groups Discounts List" description="this is Pricing Groups List page">
        {/* breadcrumb */}
        <Breadcrumb title="Pricing Groups Discounts List" items={BCrumb} />
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

export default ListGroupsDiscounts;