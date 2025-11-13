// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useContext, useState, useEffect } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  Button,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconSearch, IconTrash, IconEdit, IconFilter, IconEye, IconArrowLeft } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';
import { useSelector } from 'react-redux';
import { Login, WindowSharp } from '@mui/icons-material';
import { color } from 'framer-motion';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }

  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, showCheckBox, headCells } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5,
    backgroundColor: '#f0f8ff',
  };

  const headCellStyle = {
    backgroundColor: '#f0f8ff',
    fontWeight: 600,
    zIndex: 4,
  };

  return (
    <TableHead>
      <TableRow>
        {showCheckBox && <TableCell padding="checkbox">
          <CustomCheckbox
            color="primary"
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>}

        <TableCell sx={{ ...headCellStyle, ...stickyCellStyle }}>
          Actions
        </TableCell>

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.key || headCell.id}
            align={headCell.numeric ? 'left' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={headCellStyle}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}

        <TableCell sx={headCellStyle}>
          Created Date
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

const EnhancedTableToolbar = (props) => {
  const { numSelected, handleSearch, search, placeholder, onBackClick, salesRepName } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle2" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Box sx={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<IconArrowLeft size="1.1rem" />}
            onClick={onBackClick}
            variant="outlined"
            size="small"
          >
            Back
          </Button>

          <Box sx={{ flex: 1 }}>

            <TextField
              placeholder={placeholder || "Search customers..."}
              size="small"
              onChange={handleSearch}
              value={search}
              sx={{ width: 300 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size="1.1rem" />
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Box>

          <Box sx={{ marginLeft: 'auto' }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Sales Rep: {salesRepName}
            </Typography>
          </Box>
        </Box>
      )}

      {numSelected > 0 && (
        <Tooltip title="Delete">
          <IconButton>
            <IconTrash width="18" />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

const SalesRepCustomers = () => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('customerName');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [salesRepData, setSalesRepData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const salesRep = useSelector((state) => state.auth.salesRepData);

  // console.log("sales rep in customers list", salesRep)


  // Corrected headCells for Customer data
  const headCells = [
    {
      id: 'customerId',
      label: 'Customer ID',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'customerName',
      label: 'Customer Name',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'phone',
      label: 'Phone',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'email',
      label: 'Email',
      numeric: false,
      disablePadding: false,
    }
  ];

  const fetchSalesRepCustomers = async () => {
    try {
      if (!salesRep._id) {
        setError('Sales Rep Id is missing');
        return;
      }

      // Check if sales rep is Master-Sales-Rep
      if (salesRep.role === 'Master-Sales-Rep') {
        // Fetch all customers for Master Sales Rep
        const response = await axiosInstance.get('/admin/get-all-users');

        // console.log("response of all customers ", response);

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

          const uniqueCustomers = getUniqueCustomers(customersData);
          setCustomers(uniqueCustomers);
          setRows(uniqueCustomers);

          // Set sales rep data for display
          setSalesRepData({
            name: salesRep.name,
            customersCount: uniqueCustomers.length
          });
        }
      } else {
        // For non-Master Sales Reps, fetch only their assigned customers
        const response = await axiosInstance.get(`/sales-rep/get-sales-rep-customers/${salesRep._id}`);

        // console.log("response of get-sales- rep- customers  ", response);

        if (response.data.statusCode === 200) {
          // The API returns an array of customer objects directly
          const customersData = response.data.data.customers || [];
          setCustomers(customersData);
          setRows(customersData);

          // Set sales rep data for display
          setSalesRepData({
            name: salesRep.name,
            customersCount: customersData.length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching sales rep customers:', error);
      setError(error.message || 'Failed to fetch customers');
    }
  };



  useEffect(() => {
    fetchSalesRepCustomers();
  }, [salesRep._id, salesRep.role]); // Add salesRep.role to

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    const filteredRows = customers.filter((customer) => {
      return (
        customer?.customerId?.toLowerCase().includes(searchValue) ||
        customer?.customerName?.toLowerCase().includes(searchValue) ||
        customer?.customerEmail?.toLowerCase().includes(searchValue) ||
        customer?.contactEmail?.toLowerCase().includes(searchValue) ||
        customer?.CustomerPhoneNo?.toString().includes(searchValue) ||
        customer?.contactPhone?.toString().includes(searchValue)
      );
    });
    setRows(filteredRows);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (salesRepId) => selected.indexOf(salesRepId) !== -1;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const borderColor = theme.palette.divider;

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    customerId: null,
    customerName: '',
    isDeleting: false
  });

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      customerId: null,
      customerName: '',
      isDeleting: false
    });
  };

  const handleDeleteClick = (event, customerId, customerName) => {
    event.stopPropagation();
    setDeleteDialog({
      open: true,
      customerId: customerId,
      customerName: customerName,
      isDeleting: false
    });
  };

  const handleRemoveCustomer = async () => {
    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

      const res = await axiosInstance.delete(
        `/sales-rep/remove-customer-from-sales-rep/${salesRep._id}/${deleteDialog.customerId}`
      );


      if (res.data.statusCode === 200) {
        // Update the local state to remove the customer
        setCustomers(prev => prev.filter(customer => customer._id !== deleteDialog.customerId));
        setRows(prev => prev.filter(customer => customer._id !== deleteDialog.customerId));
        handleDeleteCancel();

        // Update sales rep data count
        setSalesRepData(prev => ({
          ...prev,
          customersCount: prev.customersCount - 1
        }));

        // Show success message
        setError(`Customer ${deleteDialog.customerName} removed successfully`);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error removing customer from sales rep:', error);
      setError('Failed to remove customer: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleBackClick = () => {
    navigate('/dashboard/SalesRep/list');
  };



  const handleLoginAsCustomer = (id) => {
    if (!id) {
      console.error('No customer ID provided');
      return;
    }

    try {
      // const baseUrl = import.meta.env.VITE_FRONTEND_URL;
      const baseUrl = import.meta.env.FRONTEND_URL;
      window.open(`${baseUrl}/salesRep/${id}`, '_blank');
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const handleCustomerClick = (name) => {
    const customerName = name.trim()
    navigate(`/salesrep/dashboards/customer/salesOrders/${customerName}`);
  }

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5,
    backgroundColor: '#ffffff',
  };

  return (
    <Box>
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder="Search customers..."
          onBackClick={handleBackClick}
          salesRepId={salesRepData?.name || ''}
        />



        <Paper variant="outlined" sx={{ mx: 2, mt: 1, border: `1px solid ${borderColor}` }}>
          <TableContainer>
            <Table
              sx={{
                minWidth: 1000,
                borderCollapse: "collapse",
                "& td, & th": {
                  borderRight: "1px solid rgba(224, 224, 224, 1)",
                },
                "& td:last-child, & th:last-child": {
                  borderRight: "none",
                },
              }}
              aria-labelledby="tableTitle"
              size={dense ? "small" : "medium"}
            >
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
                showCheckBox={false}
                headCells={headCells}
              />
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((customer, index) => {
                    const isItemSelected = isSelected(customer._id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={customer._id}
                        selected={isItemSelected}
                      >
                        <TableCell sx={stickyCellStyle}>
                          <Box display="flex" gap={1}>
                            {/* <Tooltip title="Remove from Sales Rep">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => handleDeleteClick(e, customer._id, customer.customerName)}
                              >
                                <IconTrash size="1.1rem" />
                              </IconButton>
                            </Tooltip> */}
                            <Tooltip title="LogIn As Customer">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => handleLoginAsCustomer(customer._id)}
                              >
                                <Login size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography fontWeight="600">
                            {customer?.customerId || 'N/A'}
                          </Typography>
                        </TableCell>

                        <TableCell
                          onClick={() => handleCustomerClick(customer.customerName)}>
                          <Typography sx={{ ":hover": { color: "blue" } }}>
                            {customer?.customerName || 'N/A'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography>
                            {customer?.CustomerPhoneNo || customer?.contactPhone || 'N/A'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography>
                            {customer?.customerEmail || customer?.contactEmail || 'N/A'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography>
                            {customer.createdAt ? format(new Date(customer.createdAt), 'E, MMM d yyyy') : 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                    <TableCell colSpan={headCells.length + 2} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 30, 50, 100, 200]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>

      {error && (
        <Box sx={{ p: 2 }}>
          <Typography color={error.includes('successfully') ? 'success' : 'error'}>
            {error}
          </Typography>
        </Box>
      )}

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleRemoveCustomer}
        itemName={deleteDialog.customerName}
        isDeleting={deleteDialog.isDeleting}
        itemType={"Customer"}
        message="Are you sure you want to remove this customer from the sales representative?"
      />
    </Box>
  );
};

export default SalesRepCustomers;