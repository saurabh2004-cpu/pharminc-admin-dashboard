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
    title: 'Pricing Groups Discounts',
  },
];

const ListGroupsDiscounts = () => {
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
      id: 'CustomerName',
      numeric: false,
      disablePadding: false,
      label: 'Customer Name',
    },
    {
      id: 'pricingGroup',
      numeric: false,
      disablePadding: false,
      label: 'Pricing Group',
    },
    {
      id: 'percentage',
      numeric: false,
      disablePadding: false,
      label: 'Discount Percentage',
    },
    {
      id: 'Last Updated Date',
      numeric: false,
      disablePadding: false,
      label: 'Last Updated Date',
    },
  ];

  const [tableData, setTableData] = React.useState([]);
  const [allPricingGroupDiscounts, setAllPricingGroupDiscounts] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [pricingGroupsMap, setPricingGroupsMap] = React.useState({});

  // Transform API data to match table structure for NEW schema
  const transformApiData = (apiData) => {
    const transformedData = [];
    
    apiData.forEach(discountGroup => {
      // For each customer in the customers array, create a separate row
      discountGroup.customers.forEach(customerObj => {
        const customer = customerObj.user; // user is now populated
        transformedData.push({
          _id: `${discountGroup._id}_${customer._id}`, // Unique ID for each row
          customerId: customer.customerId,
          customerName: customer.customerName || customer.contactName || customer.storeName,
          pricingGroup: discountGroup.pricingGroup,
          percentage: customerObj.percentage, // percentage is now per customer
          createdAt: discountGroup.createdAt,
          updatedAt: discountGroup.updatedAt,
          // Keep reference to original discount group for deletion
          originalDiscountId: discountGroup._id,
          originalCustomerId: customer._id,
          customerObject: customer // Keep the full customer object for reference
        });
      });
    });
    
    return transformedData;
  };

  // Create a comprehensive mapping of pricing group IDs to names
  const buildPricingGroupsMap = (data) => {
    const groupsMap = {};

    data.forEach(item => {
      if (item.pricingGroup && typeof item.pricingGroup === 'object') {
        groupsMap[item.pricingGroup._id] = item.pricingGroup.name;
      } else if (typeof item.pricingGroup === 'string') {
        groupsMap[item.pricingGroup] = `Group ${item.pricingGroup}`;
      }
    });

    return groupsMap;
  };

  // Fetch all pricing group discounts
  const fetchAllPricingGroupsDiscounts = async () => {
    try {
      const response = await axiosInstance.get('/pricing-groups-discount/all-pricing-group-discounts');
      console.log("All pricing groups discounts", response);

      if (response.data.statusCode === 200) {
        const transformedData = transformApiData(response.data.data);
        setAllPricingGroupDiscounts(transformedData);

        // Build pricing groups map
        const groupsMap = buildPricingGroupsMap(response.data.data);
        setPricingGroupsMap(groupsMap);
        console.log("Pricing groups map:", groupsMap);
      }
    } catch (error) {
      console.error('Error fetching all pricing groups discounts:', error);
    }
  };

  const fetchPricingGroupsDiscounts = async () => {
    try {
      const response = await axiosInstance.get('/pricing-groups-discount/all-pricing-group-discounts');
      console.log("response unique pricing groups discounts", response);

      if (response.data.statusCode === 200) {
        const transformedData = transformApiData(response.data.data);
        setTableData(transformedData);

        // Build pricing groups map
        const groupsMap = buildPricingGroupsMap(response.data.data);
        setPricingGroupsMap(groupsMap);
        console.log("Pricing groups map:", groupsMap);
      }
    } catch (error) {
      console.error('Error fetching unique pricing groups discounts:', error);
      setError(error.message);
    }
  };

  const { isCollapse } = React.useContext(CustomizerContext);

  React.useEffect(() => {
    fetchPricingGroupsDiscounts();
  }, []);

  return (
    <ProductProvider>
      <PageContainer title="Pricing Groups Discounts List" description="this is Pricing Groups List page">
        <Breadcrumb title="Pricing Groups Discounts List" items={BCrumb} />
        <Box>
          <ListTable
            showCheckBox={false}
            headCells={headCells}
            tableData={tableData}
            allPricingGroupDiscounts={allPricingGroupDiscounts}
            pricingGroupsMap={pricingGroupsMap}
            isBrandsList={true}
            setTableData={setTableData}
          />
        </Box>
      </PageContainer>
    </ProductProvider>
  );
};

export default ListGroupsDiscounts;