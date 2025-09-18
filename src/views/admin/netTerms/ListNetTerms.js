import * as React from 'react';
import { Box } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import { ProductProvider } from '../../../context/EcommerceContext';
import axiosInstance from '../../../axios/axiosInstance';
import ListTable from './ListTable';
import { CustomizerContext } from '../../../context/CustomizerContext'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Net Terms',
  },
];

const ListNetTerms = () => {
  const headCells = [
    {
      id: 'Actions',
      numeric: false,
      disablePadding: false,
      label: 'Actions',
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


  ];

  const [tableData, setTableData] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [filter, setFilter] = React.useState('get-net-terms-by-month');
  const [loading, setLoading] = React.useState(false)
  const { isCollapse } = React.useContext(CustomizerContext);


  const fetchCustomersList = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/netTerms/${filter}`); // or whatever your customer endpoint is
      console.log("response net termsssss", response);

      if (response.data.statusCode === 200) {
        setTableData(response.data.data.payments);
      }

    } catch (error) {
      console.error('Error fetching customers list:', error);
      setError(error.message);
    } finally {
      setLoading(false)
    }
  };

  React.useEffect(() => {
    fetchCustomersList();
  }, [filter]);

  return (
    <ProductProvider>
      <PageContainer title="Net Terms List" description="this is Customers List page">
        {/* breadcrumb */}
        <Breadcrumb title="Net Terms List" items={BCrumb} />
        {/* end breadcrumb */}
        <Box
        // sx={{
        //   minWidth: isCollapse === "mini-sidebar" ? '120%' : '105%', // keep as number, not string
        //   marginLeft: isCollapse === "mini-sidebar" ? "-110px" : "-24px", // adjust values
        //   transition: "margin-left 0.3s ease", // smooth animation
        // }}
        >
          <ListTable
            showCheckBox={false}
            headCells={headCells}
            tableData={tableData}
            isCustomersList={true} // Changed from isProductsList
            setTableData={setTableData}
            setFilter={setFilter}
            loading={loading}
          />
        </Box>
      </PageContainer>
    </ProductProvider>
  );
};

export default ListNetTerms;