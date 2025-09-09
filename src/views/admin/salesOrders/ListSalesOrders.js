import * as React from 'react';
import { Box } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import { ProductProvider } from '../../../context/EcommerceContext';
import axiosInstance from '../../../axios/axiosInstance'
import ListTable from './ListTable';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Sales Orders',
  },
];

const ListSalesOrders = () => {
  const headCells = [
    {
      id: 'serial',
      numeric: false,
      disablePadding: false,
      label: 'Serial',
    },
    {
      id: 'date',
      numeric: false,
      disablePadding: false,
      label: 'Date',
    },
    {
      id: 'documentNumber',
      numeric: false,
      disablePadding: false,
      label: 'Document Number',
    },
    {
      id: 'customerName',
      numeric: false,
      disablePadding: false,
      label: 'Customer Name',
    },
    {
      id: 'salesChannel',
      numeric: false,
      disablePadding: false,
      label: 'Sales Channel',
    },
    {
      id: 'trackingNumber',
      numeric: false,
      disablePadding: false,
      label: 'Tracking Number',
    },
    {
      id: 'shippingAddress',
      numeric: false,
      disablePadding: false,
      label: 'Shipping Address',
    },
    {
      id: 'billingAddress',
      numeric: false,
      disablePadding: false,
      label: 'Billing Address',
    },
    {
      id: 'customerPO',
      numeric: false,
      disablePadding: false,
      label: 'Customer PO',
    },
    {
      id: 'itemSku',
      numeric: false,
      disablePadding: false,
      label: 'Item SKU',
    },
    {
      id: 'packQuantity',
      numeric: true,
      disablePadding: false,
      label: 'Pack Quantity',
    },
    {
      id: 'unitsQuantity',
      numeric: true,
      disablePadding: false,
      label: 'Units Quantity',
    },
    {
      id: 'amount',
      numeric: true,
      disablePadding: false,
      label: 'Amount',
    },
    

    {
      id: 'createdAt',
      numeric: false,
      disablePadding: false,
      label: 'Created Date',
    },
    {
      id: 'Actions',
      numeric: false,
      disablePadding: false,
      label: 'Actions',
    },
  ];

  const [tableData, setTableData] = React.useState([]);
  const [error, setError] = React.useState(null);

  const fetchPricingGroups = async () => {
    try {
      const response = await axiosInstance.get('/sales-order/get-sales-orders');
      console.log("response Sales Orders", response);

      if (response.data.statusCode === 200) {
        setTableData(response.data.data.salesOrders);
      }

    } catch (error) {
      console.error('Error fetching brands list:', error);
      setError(error.message);
    }
  };



  React.useEffect(() => {
    fetchPricingGroups();
  }, []);

  return (
    <ProductProvider>
      <PageContainer title="Sales Orders List" description="this is Sales Orders List page">
        {/* breadcrumb */}
        <Breadcrumb title="Sales Orders List" items={BCrumb} />
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

export default ListSalesOrders;