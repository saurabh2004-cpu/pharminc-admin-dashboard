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

  // Create a comprehensive mapping of pricing group IDs to names from BOTH APIs
  const buildPricingGroupsMap = (uniqueData, allData) => {
    const groupsMap = {};

    // Extract from unique API (has full pricingGroup objects)
    uniqueData.forEach(item => {
      if (item.pricingGroup && typeof item.pricingGroup === 'object') {
        groupsMap[item.pricingGroup._id] = item.pricingGroup.name;
      }
    });

    // Extract from all API (now has populated pricingGroup objects)
    allData.forEach(item => {
      if (item.pricingGroup && typeof item.pricingGroup === 'object') {
        groupsMap[item.pricingGroup._id] = item.pricingGroup.name;
      } else if (typeof item.pricingGroup === 'string') {
        // Fallback if pricingGroup is still just an ID string
        groupsMap[item.pricingGroup] = `Group ${item.pricingGroup}`;
      }
    });

    return groupsMap;
  };

  // Fetch all pricing group discounts for search functionality
  const fetchAllPricingGroupsDiscounts = async () => {
    try {
      const response = await axiosInstance.get('/pricing-groups-discount/all-pricing-group-discounts');
      console.log("All pricing groups discounts", response);

      if (response.data.statusCode === 200) {
        setAllPricingGroupDiscounts(response.data.data);

        // Build pricing groups map after we have the data
        if (tableData.length > 0) {
          const groupsMap = buildPricingGroupsMap(tableData, response.data.data);
          setPricingGroupsMap(groupsMap);
          console.log("Pricing groups map:", groupsMap);
        }
      }
    } catch (error) {
      console.error('Error fetching all pricing groups discounts:', error);
    }
  };

  const fetchPricingGroupsDiscounts = async () => {
    try {
      const response = await axiosInstance.get('/pricing-groups-discount/get-all-pricing-group-discounts');
      console.log("response unique pricing groups discounts", response);

      if (response.data.statusCode === 200) {
        setTableData(response.data.data);

        // Build pricing groups map after both APIs have data
        if (allPricingGroupDiscounts.length > 0) {
          const groupsMap = buildPricingGroupsMap(response.data.data, allPricingGroupDiscounts);
          setPricingGroupsMap(groupsMap);
          console.log("Pricing groups map:", groupsMap);
        }
      }
    } catch (error) {
      console.error('Error fetching unique pricing groups discounts:', error);
      setError(error.message);
    }
  };

  const { isCollapse } = React.useContext(CustomizerContext);

  React.useEffect(() => {
    fetchPricingGroupsDiscounts();
    fetchAllPricingGroupsDiscounts();
  }, []);

  // Update pricing groups map when both datasets are available
  React.useEffect(() => {
    if (tableData.length > 0 && allPricingGroupDiscounts.length > 0) {
      const groupsMap = buildPricingGroupsMap(tableData, allPricingGroupDiscounts);
      setPricingGroupsMap(groupsMap);
      console.log("Final pricing groups map:", groupsMap);
    }
  }, [tableData, allPricingGroupDiscounts]);

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