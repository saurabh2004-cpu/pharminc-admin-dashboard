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
  FormControlLabel,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  Paper,
  Button,
  Menu,
  MenuItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  FormLabel,
  RadioGroup,
  DialogActions,
  CircularProgress,
  Radio,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit, IconKey, IconMapPin } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';
import { IconUserPlus } from '@tabler/icons-react';
import { set } from 'lodash';

function descendingComparator(a, b, orderBy) {
  let aValue = a[orderBy];
  let bValue = b[orderBy];

  // Special handling for nested or complex fields
  if (orderBy === 'netTerms') {
    aValue = a.netTerms?.netTermName || '';
    bValue = b.netTerms?.netTermName || '';
  } else if (orderBy === 'shippingAddresses') {
    aValue = a.shippingAddresses?.[0]?.shippingAddressOne || '';
    bValue = b.shippingAddresses?.[0]?.shippingAddressOne || '';
  } else if (orderBy === 'billingAddresses') {
    aValue = a.billingAddresses?.[0]?.billingAddressOne || '';
    bValue = b.billingAddresses?.[0]?.billingAddressOne || '';
  } else if (orderBy === 'inactive') {
    aValue = a.inactive ? 1 : 0;
    bValue = b.inactive ? 1 : 0;
  }

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

function getComparator(
  order,
  orderBy,
) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}


const SalesRepAssignmentDialog = ({ open, onClose, customer, salesReps, onAssign }) => {
  const [selectedSalesRep, setSelectedSalesRep] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedSalesRep) {
      alert('Please select a sales representative');
      return;
    }

    setIsAssigning(true);
    await onAssign(selectedSalesRep, customer._id);
    setIsAssigning(false);
    setSelectedSalesRep('');
  };

  const handleClose = () => {
    setSelectedSalesRep('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Assign Customer to Sales Representative
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Customer: <strong>{customer?.customerName || 'N/A'}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: <strong>{customer?.customerEmail || customer?.contactEmail || 'N/A'}</strong>
          </Typography>
        </Box>

        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
            Select Sales Representative
          </FormLabel>
          <RadioGroup
            value={selectedSalesRep}
            onChange={(e) => setSelectedSalesRep(e.target.value)}
          >
            {salesReps.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No sales representatives available
              </Typography>
            ) : (
              salesReps.map((rep) => (
                <Box
                  key={rep._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    mb: 1,
                    border: '1px solid',
                    borderColor: selectedSalesRep === rep._id ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    backgroundColor: selectedSalesRep === rep._id ? 'primary.50' : 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => setSelectedSalesRep(rep._id)}
                >
                  <Radio
                    value={rep._id}
                    checked={selectedSalesRep === rep._id}
                    sx={{ mr: 1 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {rep.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rep.email}
                    </Typography>
                    <Chip
                      label={rep.role}
                      size="small"
                      color={rep.role === 'Master-Sales-Rep' ? 'primary' : 'default'}
                      sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                    />
                  </Box>
                </Box>
              ))
            )}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={isAssigning}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={!selectedSalesRep || isAssigning}
          startIcon={isAssigning ? <CircularProgress size={16} /> : null}
        >
          {isAssigning ? 'Assigning...' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
        {headCells.map((headCell, index) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              ...headCellStyle,
              ...(index === 0 ? stickyCellStyle : {}),
            }}
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
      </TableRow>
    </TableHead>
  );
}

const EnhancedTableToolbar = (props) => {
  const {
    numSelected,
    handleSearch,
    search,
    placeholder,
    approvalFilter,
    setApprovalFilter
  } = props;

  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const openFilterMenu = Boolean(filterAnchorEl);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterSelect = (filterValue) => {
    setApprovalFilter(filterValue);
    handleFilterClose();
  };

  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get(
        '/admin/export-users',
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "customers-list.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };


  const handleSendResetEmail = async () => {
    try {
      const response = await axiosInstance.post('/admin/send-reset-email-to-all-customers', {});

      setSnackbarMessage('Sending Reset password emails ');

    } catch (error) {
      console.error('Error sending reset password emails:', error);
    }
  }

  const getFilterLabel = () => {
    switch (approvalFilter) {
      case 'unapproved':
        return 'Unapproved Only';
      case 'approved':
        return 'Approved Only';
      default:
        return 'All Customers';
    }
  };

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
        <Box sx={{ flex: '1 1 100%' }}>
          <TextField
            placeholder={placeholder || "Search"}
            size="small"
            onChange={handleSearch}
            value={search}
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
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <IconTrash width="18" />
          </IconButton>
        </Tooltip>
      ) : (
        <>
          <Tooltip title="Export CSV">
            <IconButton onClick={handleExportCSV}>
              <Button size="small" variant="outlined" >Export</Button>
            </IconButton>
          </Tooltip>
          {/* <Tooltip title="Send Reset Password Email">
            <IconButton onClick={handleSendResetEmail}>
              <Button size="small" variant="outlined" >Send Email</Button>
            </IconButton>
          </Tooltip> */}
        </>
      )}
    </Toolbar>
  );
};

// Helper function to format addresses
const formatAddress = (address) => {
  if (!address) return 'N/A';

  const parts = [
    address.shippingAddressOne || address.billingAddressOne,
    address.shippingAddressTwo || address.billingAddressTwo,
    address.shippingAddressThree || address.billingAddressThree,
    address.shippingCity || address.billingCity,
    address.shippingState || address.billingState,
    address.shippingZip || address.billingZip
  ].filter(Boolean);

  return parts.join(', ');
};

// Component to display multiple addresses
// Grid layout with tabs for many addresses
const AddressesDisplay = ({ addresses, type }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
    return <Typography variant="body2">No {type} addresses</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 350 }}>
      {/* Tabs for navigation */}
      {addresses.length > 1 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
          <Box sx={{ display: 'flex', overflowX: 'auto' }}>
            {addresses.map((_, index) => (
              <Button
                key={index}
                size="small"
                variant={selectedTab === index ? "contained" : "text"}
                onClick={() => setSelectedTab(index)}
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.7rem',
                  mr: 0.5
                }}
              >
                {index + 1}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {/* Address Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 1,
        }}
      >
        {addresses.slice(selectedTab, selectedTab + 1).map((address, index) => (
          <Box
            key={selectedTab}
            sx={{
              p: 1.5,
              border: '1px solid',
              borderColor: 'primary.light',
              borderRadius: 1,
              backgroundColor: 'primary.50',
            }}
          >
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <IconMapPin size={14} style={{ marginRight: 6 }} />
              <Typography variant="subtitle2" fontWeight="600">
                {type} Address {selectedTab + 1}
              </Typography>
            </Box>

            {/* Compact address details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {[
                address.shippingAddressOne || address.billingAddressOne,
                address.shippingAddressTwo || address.billingAddressTwo,
                address.shippingAddressThree || address.billingAddressThree,
              ].filter(Boolean).map((line, lineIndex) => (
                <Typography key={lineIndex} variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {line}
                </Typography>
              ))}

              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                {[
                  address.shippingCity || address.billingCity,
                  address.shippingState || address.billingState,
                  address.shippingZip || address.billingZip
                ].filter(Boolean).join(', ')}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const ListTable = ({
  showCheckBox,
  headCells,
  tableData,
  isProductsList = true,
  isBrandsList = true,
  setTableData,
  loading
}) => {

  const {
    filteredAndSortedProducts,
  } = useContext(ProductContext);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('customerId');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [approvalFilter, setApprovalFilter] = useState('all');

  const sourceData = tableData || [];
  const [rows, setRows] = useState(sourceData);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [salesReps, setSalesReps] = useState([]);
  const [salesRepDialog, setSalesRepDialog] = useState({
    open: false,
    customer: null,
  });
  const [error, setError] = useState('');


  // Define column widths
  const columnWidths = {
    customerId: { minWidth: '135px' },
    customerPhoneNo: { minWidth: '150px' },
    abn: { minWidth: '120px' },
    primaryBrand: { minWidth: '170px' },
    netTerms: { minWidth: '150px' },
    inactive: { minWidth: '100px' },
    serial: { minWidth: '80px' },
    sku: { minWidth: '150px' },
    productName: { minWidth: '280px' },
    stockLevel: { minWidth: '240px' },
    pricingGroup: { minWidth: '220px' },
    brand: { minWidth: '220px' },
    category: { minWidth: '220px' },
    subCategory: { minWidth: '220px' },
    storeDescription: { minWidth: '300px' },
    pageTitle: { minWidth: '300px' },
    eachBarcodes: { minWidth: '150px' },
    orderApprovel: { minWidth: '300px' },
    packBarcodes: { minWidth: '150px' },
    defaultShippingRate: { minWidth: '140px' },
    createdAt: { minWidth: '160px' },
    actions: { minWidth: '160px' },
    addresses: { minWidth: '300px' }, // Wider for addresses
  };

  useEffect(() => {
    let filteredData = sourceData;

    // Apply approval filter first
    if (approvalFilter === 'unapproved') {
      filteredData = filteredData.filter(row => row.inactive === true);
    } else if (approvalFilter === 'approved') {
      filteredData = filteredData.filter(row => row.inactive === false);
    }

    // Then apply search filter if search is active
    if (search.trim()) {
      const searchValue = search.toLowerCase();
      filteredData = filteredData.filter((row) => {
        // Search in addresses as well
        const shippingAddressesText = row.shippingAddresses?.map(addr =>
          Object.values(addr).join(' ').toLowerCase()
        ).join(' ') || '';

        const billingAddressesText = row.billingAddresses?.map(addr =>
          Object.values(addr).join(' ').toLowerCase()
        ).join(' ') || '';

        return (
          row.customerId?.toLowerCase().includes(searchValue) ||
          row.customerName?.toLowerCase().includes(searchValue) ||
          row.contactName?.toLowerCase().includes(searchValue) ||
          row.customerEmail?.toLowerCase().includes(searchValue) ||
          row.contactEmail?.toLowerCase().includes(searchValue) ||
          row.CustomerPhoneNo?.toString().toLowerCase().includes(searchValue) ||
          row.abn?.toLowerCase().includes(searchValue) ||
          row.category?.toLowerCase().includes(searchValue) ||
          row.primaryBrand?.toLowerCase().includes(searchValue) ||
          row.netTerms?.netTermName?.toLowerCase().includes(searchValue) ||
          row.orderApproval?.toLowerCase().includes(searchValue) ||
          row.defaultShippingRate?.toString().toLowerCase().includes(searchValue) ||
          shippingAddressesText.includes(searchValue) ||
          billingAddressesText.includes(searchValue) ||
          (row.inactive ? "inactive" : "active").includes(searchValue) ||
          (row.createdAt
            ? new Date(row.createdAt).toLocaleDateString().toLowerCase().includes(searchValue)
            : false)
        );
      });
    }

    // Set the filtered rows
    if (isBrandsList) {
      setRows(filteredData);
    } else {
      setRows(filteredAndSortedProducts);
    }
  }, [sourceData, filteredAndSortedProducts, isBrandsList, search, approvalFilter]);

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n?.name || n.title);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
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

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const theme = useTheme();
  const borderColor = theme.palette.divider;

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    itemId: null,
    itemName: '',
    isDeleting: false
  });

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      itemId: null,
      itemName: '',
      isDeleting: false
    });
  };

  const handleDeleteClick = (event, id, name) => {
    event.stopPropagation();
    setDeleteDialog({
      open: true,
      itemId: id,
      itemName: name,
      isDeleting: false
    });
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`/admin/delete-user/${deleteDialog.itemId}`);
      // console.log("deleted", res.data);

      if (res.data.statusCode === 200) {
        setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
        setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));
        handleDeleteCancel();
      }
    } catch (error) {
      console.error('Error deleting pack:', error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/customers/edit/${id}`);
  };

  const handleChangePassword = (id, email) => {
    navigate(`/dashboard/customers/change-password/${id}/${email}`);
  };

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5,
    backgroundColor: '#f0f8ff',
  };


  const fetchSalesAllRep = async () => {
    try {
      const response = await axiosInstance.get(`/sales-rep/get-sales-reps`);
      // console.log("fetch all sales reps ", response);

      if (response.data.statusCode === 200) {
        setSalesReps(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching Sales Representatives list:', error);
      setError(error.message);
    }
  };

  const handleAssignToSalesRep = async (salesRepId, customerId) => {
    try {
      // console.log("Assigning customer to sales rep:", { salesRepId, customerId });

      const response = await axiosInstance.post(
        `/sales-rep/add-customer-to-sales-rep/${salesRepId}/${customerId}`
      );

      if (response.data.statusCode === 200) {
        // console.log('Customer assigned to sales rep successfully');
        setError('Customer assigned to sales rep successfully');
        handleCloseSalesRepDialog();

        // Optional: Refresh the table data
        // refreshTableData();
      }
    } catch (error) {
      console.error('Error assigning customer to sales rep:', error);
      setError(error.response?.data?.message || error.message || 'Failed to assign customer');
    }
  };

  const handleOpenSalesRepDialog = (customer) => {
    setSalesRepDialog({
      open: true,
      customer: customer,
    });
  };

  const handleCloseSalesRepDialog = () => {
    setSalesRepDialog({
      open: false,
      customer: null,
    });
  };

  useEffect(() => {
    fetchSalesAllRep();
  }, [])

  return (
    <Box>
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder={isBrandsList ? "Search Customer" : "Search Customer"}
          approvalFilter={approvalFilter}
          setApprovalFilter={setApprovalFilter}
        />
        <Paper variant="outlined" sx={{ mx: 2, mt: 1, border: `1px solid ${borderColor}` }}>
          <TableContainer sx={{ width: "100%" }}>
            <Table
              sx={{
                minWidth: 1800,
                borderCollapse: "collapse",
                "& td, & th": {
                  paddingTop: "4px",
                  paddingBottom: "4px",
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
                showCheckBox={showCheckBox}
                headCells={headCells}
              />
              {loading ?
                <Box sx={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 3
                }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Loading ...
                  </Typography>
                </Box>
                : <TableBody>
                  {stableSort(rows, getComparator(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      const isItemSelected = isSelected(row?.ProductName || row.title);
                      const labelId = `enhanced-table-checkbox-${index}`;

                      return (
                        <TableRow
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row._id || row.title}
                          selected={isItemSelected}
                        >
                          {showCheckBox && <TableCell padding="checkbox">
                            <CustomCheckbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{
                                'aria-labelledby': labelId,
                              }}
                            />
                          </TableCell>}

                          {isProductsList ? (
                            <>
                              <TableCell sx={stickyCellStyle}>
                                <Box display="flex" gap={1}>
                                  <Tooltip title="Edit">
                                    <IconButton size="small" color="primary" onClick={() => handleEdit(row._id)}>
                                      <IconEdit size="1.1rem" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton size="small" color="error" onClick={(e) => handleDeleteClick(e, row._id, row.customerName)}>
                                      <IconTrash size="1.1rem" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Change Password">
                                    <IconButton
                                      size="small"
                                      color="secondary"
                                      onClick={() => handleChangePassword(row._id, row.customerEmail)}
                                    >
                                      <IconKey size="1.1rem" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Assign to Sales Rep">
                                    <IconButton
                                      size="small"
                                      color="info"
                                      onClick={() => handleOpenSalesRepDialog(row)}
                                    >
                                      <IconUserPlus size="1.1rem" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.customerId}>
                                <Typography fontWeight="500" variant="subtitle2">
                                  {row.customerId || 'N/A'}
                                </Typography>
                              </TableCell>

                              {/* <TableCell sx={columnWidths.sku}>
                                <Typography fontWeight="500" variant="subtitle2">
                                  {row.markupDiscount || 'N/A'}
                                </Typography>
                              </TableCell> */}

                              <TableCell sx={columnWidths.productName}>
                                <Typography fontWeight="400">
                                  {row.customerName || 'N/A'}
                                </Typography>
                              </TableCell>

                              <TableCell sx={columnWidths.stockLevel}>
                                <Typography fontWeight="400">
                                  {row.contactName || 'N/A'}
                                </Typography>
                              </TableCell>

                              <TableCell sx={columnWidths.pricingGroup}>
                                <Typography fontWeight="400">
                                  {row.customerEmail || 'N/A'}
                                </Typography>
                              </TableCell>

                              <TableCell sx={columnWidths.brand}>
                                <Typography fontWeight="400">
                                  {row.contactEmail || 'N/A'}
                                </Typography>
                              </TableCell>

                              <TableCell sx={columnWidths.customerPhoneNo}>
                                {row.CustomerPhoneNo && <Typography fontWeight="400">
                                  +61 {row.CustomerPhoneNo || 'N/A'}
                                </Typography>}
                              </TableCell>

                              <TableCell sx={columnWidths.abn}>
                                <Typography fontWeight="400">
                                  {row.abn || 'N/A'}
                                </Typography>
                              </TableCell>

                              <TableCell sx={columnWidths.subCategory}>
                                <Typography fontWeight="400">
                                  {row.category || 'N/A'}
                                </Typography>
                              </TableCell>

                              <TableCell sx={columnWidths.primaryBrand}>
                                <Typography fontWeight="400">
                                  {row.primaryBrand || 'N/A'}
                                </Typography>
                              </TableCell>

                              <TableCell sx={columnWidths.netTerms}>
                                {row.netTerms?.netTermName ? (
                                  <Typography fontWeight="400">
                                    {`${row.netTerms.netTermName}  ${row.netTerms.daysCount ? "-" + row.netTerms.daysCount : ''}`}
                                  </Typography>
                                ) : (
                                  <Typography fontWeight="400">N/A</Typography>
                                )}
                              </TableCell>


                              <TableCell sx={columnWidths.eachBarcodes}>
                                <Typography fontWeight="400">
                                  {row.orderApproval || 'N/A'}
                                </Typography>
                              </TableCell>

                              <TableCell sx={columnWidths.defaultShippingRate}>
                                <Typography fontWeight="400">
                                  {isNaN(row.defaultShippingRate) ? 'N/A' : row.defaultShippingRate}
                                </Typography>
                              </TableCell>

                              {/* Shipping Addresses */}
                              <TableCell sx={columnWidths.addresses}>
                                <AddressesDisplay
                                  addresses={row.shippingAddresses}
                                  type="Shipping"
                                />
                              </TableCell>

                              {/* Billing Addresses */}
                              <TableCell sx={columnWidths.addresses}>
                                <AddressesDisplay
                                  addresses={row.billingAddresses}
                                  type="Billing"
                                />
                              </TableCell>

                              <TableCell sx={columnWidths.inactive}>
                                <Chip
                                  label={row.inactive ? 'Inactive' : 'Active'}
                                  color={row.inactive ? 'error' : 'success'}
                                  size="small"
                                />
                              </TableCell>

                              <TableCell sx={columnWidths.createdAt}>
                                <Typography fontWeight="400">
                                  {row.createdAt ? format(new Date(row.createdAt), 'E, MMM d yyyy') : 'N/A'}
                                </Typography>
                              </TableCell>
                            </>
                          ) : (
                            ''
                          )}
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                      <TableCell colSpan={headCells.length + (showCheckBox ? 1 : 0)} />
                    </TableRow>
                  )}
                </TableBody>}
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

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDelete}
        itemName={deleteDialog.itemName}
        isDeleting={deleteDialog.isDeleting}
        itemType={"Customers"}
      />

      <SalesRepAssignmentDialog
        open={salesRepDialog.open}
        onClose={handleCloseSalesRepDialog}
        customer={salesRepDialog.customer}
        salesReps={salesReps}
        onAssign={handleAssignToSalesRep}
      />
    </Box >
  );
};

export default ListTable;