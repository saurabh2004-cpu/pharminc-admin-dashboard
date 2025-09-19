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
      id: 'documentNumber',
      numeric: false,
      disablePadding: false,
      label: 'Document Number',
    },
    {
      id: 'date',
      numeric: false,
      disablePadding: false,
      label: 'Date',
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
      id: 'LastUpdatedDate',
      numeric: false,
      disablePadding: false,
      label: 'Last Updated Date',
    },

  ];

  const [tableData, setTableData] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [filter, setFilter] = React.useState('');
  const [loading, setLoading] = React.useState(false)
  const { isCollapse } = React.useContext(CustomizerContext);
  const [date, setdate] = React.useState('');



  React.useEffect(() => {
    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // Adding 1 since getMonth() returns 0-11

    // Set initial filter with current month and year
    setFilter(`get-net-terms-by-month/${currentMonth}/${currentYear}`);
  }, []);

  const fetchCustomersList = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/netTerms/${filter}`); 
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