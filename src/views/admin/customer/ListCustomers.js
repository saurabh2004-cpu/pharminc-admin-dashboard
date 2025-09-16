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

const ListCustomers = () => {
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
      id: 'contactName',
      numeric: false,
      disablePadding: false,
      label: 'Contact Name',
    },
    {
      id: 'customerEmail',
      numeric: false,
      disablePadding: false,
      label: 'Customer Email',
    },
    {
      id: 'contactEmail',
      numeric: false,
      disablePadding: false,
      label: 'Contact Email',
    },
    {
      id: 'CustomerPhoneNo',
      numeric: false,
      disablePadding: false,
      label: 'Phone Number',
    },
    {
      id: 'category',
      numeric: false,
      disablePadding: false,
      label: 'Category',
    },
    {
      id: 'primaryBrand',
      numeric: false,
      disablePadding: false,
      label: 'Primary Brand',
    },
    {
      id: 'netTerms',
      numeric: false,
      disablePadding: false,
      label: 'Net Terms',
    },
    {
      id: 'orderApproval',
      numeric: false,
      disablePadding: false,
      label: 'Order Approval',
    },
    {
      id: 'defaultShippingRate',
      numeric: true,
      disablePadding: false,
      label: 'Shipping Rate',
    },
    {
      id: 'shippingCity',
      numeric: false,
      disablePadding: false,
      label: 'Shipping City',
    },
    {
      id: 'shippingState',
      numeric: false,
      disablePadding: false,
      label: 'Shipping State',
    },
    {
      id: 'inactive',
      numeric: false,
      disablePadding: false,
      label: 'Status',
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

  const fetchCustomersList = async () => {
    try {
      const response = await axiosInstance.get('/admin/get-all-users'); // or whatever your customer endpoint is
      console.log("response customers", response.data);

      if (response.data.statusCode === 200) {
        const customersData = response.data.data?.docs || response.data.data || response.data;

        // Filter out duplicates based on _id
        const getUniqueCustomers = (customers) => {
          if (!Array.isArray(customers)) return [];

          const uniqueCustomers = [];
          const seenIds = new Set();

          customers.forEach(customer => {
            if (customer._id && !seenIds.has(customer._id)) {
              seenIds.add(customer._id);
              uniqueCustomers.push(customer);
            }
          });

          return uniqueCustomers;
        };

        setTableData(getUniqueCustomers(customersData));
      }

    } catch (error) {
      console.error('Error fetching customers list:', error);
      setError(error.message);
    }
  };

  React.useEffect(() => {
    fetchCustomersList();
  }, []);

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
          />
        </Box>
      </PageContainer>
    </ProductProvider>
  );
};

export default ListCustomers;