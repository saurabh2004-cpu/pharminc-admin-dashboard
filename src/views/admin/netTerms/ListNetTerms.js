import * as React from 'react';
import { Box } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import { ProductProvider } from '../../../context/EcommerceContext';
import axiosInstance from '../../../axios/axiosInstance';
import ListTable from './ListTable';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Customers',
  },
];

const ListNetTerms = () => {
  const headCells = [
    {
      id: 'serial',
      numeric: true,
      disablePadding: false,
      label: 'Serial',
    },
    {
      id: 'salesOrderId',
      numeric: false,
      disablePadding: false,
      label: 'Sales Order ID',
    },
    // {
    //   id: 'documentNumber',
    //   numeric: false,
    //   disablePadding: false,
    //   label: 'Document Number',
    // },
    {
      id: 'customerName',
      numeric: false,
      disablePadding: false,
      label: 'Customer Name',
    },
    {
      id: 'orderDate',
      numeric: false,
      disablePadding: false,
      label: 'Order Date',
    },
    {
      id: 'dueDate',
      numeric: false,
      disablePadding: false,
      label: 'Due Date',
    },
    {
      id: 'amount',
      numeric: false,
      disablePadding: false,
      label: 'Amount',
    },
    {
      id: 'netTerms',
      numeric: false,
      disablePadding: false,
      label: 'Net Terms',
    },
   
    {
      id: 'status',
      numeric: false,
      disablePadding: false,
      label: 'Status',
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
  const [filter, setFilter] = React.useState('get-net-terms-by-month');

  const fetchCustomersList = async () => {
    try {
      // Update API endpoint to fetch customers instead of products
      const response = await axiosInstance.get(`/netTerms/${filter}`); // or whatever your customer endpoint is
      console.log("response net termsssss", response);

      if (response.data.statusCode === 200) {
        setTableData(response.data.data.payments);
      }

    } catch (error) {
      console.error('Error fetching customers list:', error);
      setError(error.message);
    }
  };

  React.useEffect(() => {
    fetchCustomersList();
  }, [filter]);

  return (
    <ProductProvider>
      <PageContainer title="Customers List" description="this is Customers List page">
        {/* breadcrumb */}
        <Breadcrumb title="Customers List" items={BCrumb} />
        {/* end breadcrumb */}
        <Box>
          <ListTable
            showCheckBox={false}
            headCells={headCells}
            tableData={tableData}
            isCustomersList={true} // Changed from isProductsList
            setTableData={setTableData}
            setFilter={setFilter}
          />
        </Box>
      </PageContainer>
    </ProductProvider>
  );
};

export default ListNetTerms;