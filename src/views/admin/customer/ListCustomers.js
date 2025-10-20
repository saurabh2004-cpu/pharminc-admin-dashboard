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
      id: 'markupDiscount',
      numeric: false,
      disablePadding: false,
      label: 'Markup Discount',
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
      numeric: false,
      disablePadding: false,
      label: 'Shipping Rate',
    },
    {
      id: 'shippingAddresses',
      numeric: false,
      disablePadding: false,
      label: 'Shipping Addresses',
    },
    {
      id: 'billingAddresses',
      numeric: false,
      disablePadding: false,
      label: 'Billing Addresses',
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
  const [loading, setLoading] = React.useState(false)

  const fetchCustomersList = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get('/admin/get-all-users');
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
    } finally {
      setLoading(false)
    }
  };

  const { isCollapse } = React.useContext(CustomizerContext);

  React.useEffect(() => {
    fetchCustomersList();
  }, []);

  return (
    <ProductProvider>
      <PageContainer title="Customers List" description="this is Customers List page">
        <Breadcrumb title="Customers List" items={BCrumb} />
        <Box>
          <ListTable
            showCheckBox={false}
            headCells={headCells}
            tableData={tableData}
            isProductsList={true}
            setTableData={setTableData}
            loading={loading}
          />
        </Box>
      </PageContainer>
    </ProductProvider>
  );
};

export default ListCustomers;