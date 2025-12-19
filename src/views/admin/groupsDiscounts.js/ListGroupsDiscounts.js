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
      id: 'pricingGroup',
      numeric: false,
      disablePadding: false,
      label: 'Pricing Group',
    },
    {
      id: 'updatedAt',
      numeric: false,
      disablePadding: false,
      label: 'Last Updated Date',
    },
  ];

  const [tableData, setTableData] = React.useState([]);
  const [error, setError] = React.useState(null);

  const fetchPricingGroupsDiscounts = async () => {
    try {
      const response = await axiosInstance.get('/pricing-groups-discount/all-pricing-group-discounts');
      // console.log("response pricing groups discounts", response);

      if (response.data.statusCode === 200) {
        // Transform the API data to match table structure
        const transformedData = response.data.data.map(item => ({
          _id: item._id,
          pricingGroup: item.pricingGroup,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));
        
        setTableData(transformedData);
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
    // <ProductProvider>
      <PageContainer title="Pricing Groups Discounts List" description="this is Pricing Groups List page">
        <Breadcrumb title="Pricing Groups Discounts List" items={BCrumb} />
        <Box>
          <ListTable
            showCheckBox={false}
            headCells={headCells}
            tableData={tableData}
            isBrandsList={true}
            setTableData={setTableData}
          />
        </Box>
      </PageContainer>
    // </ProductProvider>
  );
};

export default ListGroupsDiscounts;