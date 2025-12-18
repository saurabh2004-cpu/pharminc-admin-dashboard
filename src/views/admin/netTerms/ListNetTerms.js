import * as React from 'react';
import { Box } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import { ProductProvider } from '../../../context/EcommerceContext';
import axiosInstance from '../../../axios/axiosInstance';
import ListTable from './ListTable';
import { CustomizerContext } from '../../../context/CustomizerContext'
import { Button, TextField } from '@mui/material';

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
  const [loading, setLoading] = React.useState(false);
  const { isCollapse } = React.useContext(CustomizerContext);
  const [filterType, setFilterType] = React.useState('month');
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1);

  // Fetch data based on filter type
  const fetchNetTermsData = React.useCallback(async (type, year, month) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';

      switch (type) {
        case 'month':
          endpoint = `/netTerms/get-net-terms-by-month/${month}/${year}`;
          break;
        case 'year':
          endpoint = `/netTerms/get-net-terms-by-year/${year}`;
          break;
        case 'week':
          endpoint = `/netTerms/get-net-terms-by-week`;
          break;
        case 'overdue':
          endpoint = `/netTerms/get-overdue-net-terms`;
          break;
        default:
          endpoint = `/netTerms/get-net-terms-by-month/${month}/${year}`;
      }

      const response = await axiosInstance.get(endpoint);
      console.log('NetTerms response:', response.data);

      if (response.data.statusCode === 200) {
        setTableData(response.data.data);
      } else {
        setError('Failed to fetch net terms');
      }
    } catch (err) {
      console.error('Error fetching net terms:', err);
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load - mount only
  React.useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    fetchNetTermsData('month', currentYear, currentMonth);
  }, []); // Empty dependency - runs once on mount

  // Filter handlers
  const handleMonthFilter = () => {
    setFilterType('month');
    fetchNetTermsData('month', selectedYear, selectedMonth);
  };

  const handleYearFilter = () => {
    setFilterType('year');
    fetchNetTermsData('year', selectedYear, selectedMonth);
  };

  const handleWeekFilter = () => {
    setFilterType('week');
    fetchNetTermsData('week', selectedYear, selectedMonth);
  };

  const handleOverdueFilter = () => {
    setFilterType('overdue');
    fetchNetTermsData('overdue', selectedYear, selectedMonth);
  };

  return (
    // <ProductProvider>
      <PageContainer title="Net Terms List" description="Net Terms payment tracking">
        <Breadcrumb title="Net Terms List" items={BCrumb} />

        {/* Filter Controls */}
        <Box sx={{
          mb: 3,
          p: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Month Filter */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label="Month"
              type="number"
              value={selectedMonth}
              onChange={(e) => {
                const val = Math.min(12, Math.max(1, parseInt(e.target.value) || 1));
                setSelectedMonth(val);
              }}
              inputProps={{ min: 1, max: 12 }}
              size="small"
              sx={{ width: 80 }}
            />
            <TextField
              label="Year"
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
              size="small"
              sx={{ width: 100 }}
            />
            <Button
              variant={filterType === 'month' ? 'contained' : 'outlined'}
              onClick={handleMonthFilter}
              size="small"
            >
              By Month
            </Button>
          </Box>

          {/* Year Filter */}
          <Button
            variant={filterType === 'year' ? 'contained' : 'outlined'}
            onClick={handleYearFilter}
            size="small"
          >
            By Year: {selectedYear}
          </Button>

          {/* Week Filter */}
          <Button
            variant={filterType === 'week' ? 'contained' : 'outlined'}
            onClick={handleWeekFilter}
            size="small"
          >
            This Week
          </Button>

          {/* Overdue Filter */}
          <Button
            variant={filterType === 'overdue' ? 'contained' : 'outlined'}
            color={filterType === 'overdue' ? 'error' : 'inherit'}
            onClick={handleOverdueFilter}
            size="small"
          >
            Overdue Payments
          </Button>
        </Box>

        {error && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#ffebee', borderRadius: 1, color: '#c62828' }}>
            Error: {error}
          </Box>
        )}

        <Box>
          <ListTable
            showCheckBox={false}
            headCells={headCells}
            tableData={tableData}
            isCustomersList={true}
            setTableData={setTableData}
            loading={loading}
            filterType={filterType}
          />
        </Box>
      </PageContainer>
    // </ProductProvider>
  );
};

export default ListNetTerms;