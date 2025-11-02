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
  Snackbar,
  Alert,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconFilter, IconSearch, IconTrash, IconEdit, IconCalendar, IconX, IconDownload } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';

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
        {headCells.map((headCell, index) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
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
    onExportCSV,
    onOpenDateFilter,
    dateFilterActive,
    showDateFilter,
    dateFilter,
    onDateFilterChange,
    onApplyDateFilter,
    onClearDateFilter,
    loading
  } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
        flexWrap: 'wrap',
        gap: 2,
        py: 2,
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle2" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <>
          <Box sx={{ flex: '1 1 auto', minWidth: 200, maxWidth: 300 }}>
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
              sx={{ width: '100%' }}
            />
          </Box>

          {/* Date Filter Inputs - Show when filter is toggled */}
          {showDateFilter && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <TextField
                label="From Date"
                type="date"
                size="small"
                value={dateFilter.from}
                onChange={(e) => onDateFilterChange('from', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140 }}
              />
              <TextField
                label="To Date"
                type="date"
                size="small"
                value={dateFilter.to}
                onChange={(e) => onDateFilterChange('to', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140 }}
              />
              <Button
                size="small"
                variant="contained"
                onClick={onApplyDateFilter}
                disabled={loading || !dateFilter.from || !dateFilter.to}
                sx={{ backgroundColor: '#2E2F7F', minWidth: 80 }}
              >
                {loading ? 'Applying...' : 'Apply'}
              </Button>
              <IconButton
                size="small"
                onClick={onClearDateFilter}
                disabled={loading}
                color="error"
              >
                <IconX size="1.1rem" />
              </IconButton>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {/* Show Calendar icon only when date inputs are NOT visible */}
            {!showDateFilter && (
              <Tooltip title={dateFilterActive ? "Date Filter Active - Click to Modify" : "Filter by Date"}>
                <IconButton
                  onClick={onOpenDateFilter}
                  color={dateFilterActive ? "primary" : "default"}
                >
                  <IconCalendar size="1.2rem" />
                </IconButton>
              </Tooltip>
            )}

            {/* Show Export All only when no date filter is active and not showing date inputs */}
            {!dateFilterActive && !showDateFilter && (
              <Tooltip title="Export All CSV">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onExportCSV}
                >
                  Export All
                </Button>
              </Tooltip>
            )}

            {/* Show Export Filtered Data when date filter is active and inputs are hidden */}
            {dateFilterActive && !showDateFilter && (
              <Tooltip title="Export Filtered Data">
                <Button
                  size="small"
                  variant="contained"
                  onClick={onExportCSV}
                  sx={{ backgroundColor: '#2E2F7F' }}
                >
                  Export Filtered Data
                </Button>
              </Tooltip>
            )}
          </Box>
        </>
      )}
    </Toolbar>
  );
};

const ListTable = ({
  showCheckBox,
  headCells,
  tableData,
  isBrandsList = false,
  setTableData
}) => {
  const { filteredAndSortedProducts } = useContext(ProductContext);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('calories');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const sourceData = tableData || [];
  const [rows, setRows] = useState(sourceData);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Date filter states - UPDATED
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  });
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    itemId: null,
    itemName: '',
    isDeleting: false
  });

  // Snackbar state for export notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    let baseData = isBrandsList ? sourceData : filteredAndSortedProducts;

    if (search) {
      const searchValue = search.toLowerCase();
      const filteredRows = baseData.filter((row) => {
        const values = [
          row?.documentNumber,
          row?.customerName,
          row?.itemSku,
          row?.salesChannel,
          row?.status,
          row?.trackingNumber,
          row?.customerPO,
          row?.packType,
          row?.discountType,
          // Include address strings
          row?.shippingAddress,
          row?.billingAddress,
          // Include numeric fields
          row?.amount?.toString(),
          row?.finalAmount?.toString(),
          row?.discountPercentages?.toString(),
          row?.packQuantity?.toString(),
          row?.unitsQuantity?.toString(),
          // Date field
          row?.date,
        ];

        return values.some((val) =>
          (val || "").toString().toLowerCase().includes(searchValue)
        );
      });
      setRows(filteredRows);
    } else {
      setRows(baseData);
    }
  }, [sourceData, filteredAndSortedProducts, isBrandsList, search]);

  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Export by document number function
  const handleExportByDocumentNumber = async (documentNumber) => {
    if (!documentNumber) {
      showSnackbar('No document number found for this order', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        '/sales-order/export-sales-orders-by-document-number',
        {
          params: { documentNumber },
          responseType: 'blob'
        }
      );

      // Check if response is successful
      if (response.status === 200) {
        // Create blob and download file
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `sales-orders-${documentNumber}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        showSnackbar(`Sales orders for document ${documentNumber} exported successfully!`);
      }
    } catch (error) {
      console.error('Error exporting sales orders by document number:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        showSnackbar(`No sales orders found with document number: ${documentNumber}`, 'warning');
      } else if (error.response?.status === 400) {
        showSnackbar('Document number is required', 'error');
      } else {
        showSnackbar('Error exporting sales orders', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    let baseData = isBrandsList ? sourceData : filteredAndSortedProducts;

    if (searchValue) {
      const filteredRows = baseData.filter((row) => {
        // Search in all relevant fields including address strings
        return (
          // Basic fields
          (row?.documentNumber?.toLowerCase() || '').includes(searchValue) ||
          (row?.customerName?.toLowerCase() || '').includes(searchValue) ||
          (row?.itemSku?.toLowerCase() || '').includes(searchValue) ||
          (row?.salesChannel?.toLowerCase() || '').includes(searchValue) ||
          (row?.status?.toLowerCase() || '').includes(searchValue) ||
          (row?.trackingNumber?.toLowerCase() || '').includes(searchValue) ||
          (row?.customerPO?.toLowerCase() || '').includes(searchValue) ||
          (row?.packType?.toLowerCase() || '').includes(searchValue) ||
          (row?.discountType?.toLowerCase() || '').includes(searchValue) ||

          // Shipping Address search (as string)
          (row?.shippingAddress?.toLowerCase() || '').includes(searchValue) ||

          // Billing Address search (as string)
          (row?.billingAddress?.toLowerCase() || '').includes(searchValue) ||

          // Amount fields (convert numbers to string)
          (row?.amount?.toString() || '').includes(searchValue) ||
          (row?.finalAmount?.toString() || '').includes(searchValue) ||
          (row?.discountPercentages?.toString() || '').includes(searchValue) ||
          (row?.packQuantity?.toString() || '').includes(searchValue) ||
          (row?.unitsQuantity?.toString() || '').includes(searchValue) ||

          // Date fields
          (row?.date?.toLowerCase() || '').includes(searchValue)
        );
      });
      setRows(filteredRows);
    } else {
      setRows(baseData);
    }
  };


  // Updated Date filter functions
  const handleOpenDateFilter = () => {
    setShowDateFilter(true);
  };

  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyDateFilter = async () => {
    if (!dateFilter.from || !dateFilter.to) {
      alert('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get('/sales-order/get-sales-order-by-date-frame', {
        params: {
          startDate: dateFilter.from,
          endDate: dateFilter.to
        }
      });

      console.log("get sales orders by date response", response)

      if (response.data.statusCode === 200) {
        setTableData(response.data.data.salesOrders);
        setRows(response.data.data.salesOrders);
        setDateFilterActive(true);
        setShowDateFilter(false); // Hide the filter inputs after applying
      }
    } catch (error) {
      console.error('Error filtering by date:', error);
      alert('Error applying date filter');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDateFilter = async () => {
    try {
      setLoading(true);
      // Reset to show all data
      const response = await axiosInstance.get('/sales-order/get-all-sales-orders');
      if (response.data.statusCode === 200) {
        setTableData(response.data.data.salesOrders);
        setRows(response.data.data.salesOrders);
        setDateFilterActive(false);
        setDateFilter({ from: '', to: '' });
        setShowDateFilter(false); // Hide the filter inputs
      }
    } catch (error) {
      console.error('Error clearing date filter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAllCSV = async () => {
    try {
      let endpoint = '/sales-order/export-sales-orders';
      let params = {};
      let filename = "sales_orders_export.csv";

      // If date filter is active, export filtered data
      if (dateFilterActive) {
        endpoint = '/sales-order/export-sales-orders-by-date-frame';
        params = {
          from: dateFilter.from,
          to: dateFilter.to
        };
        filename = `sales-orders-${dateFilter.from}-to-${dateFilter.to}.csv`;
      }

      const response = await axiosInstance.get(endpoint, {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert('Error exporting data');
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name || n.title);
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

  const handleDeleteSalesOrder = async () => {
    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
      const res = await axiosInstance.delete(`/sales-order/delete-sales-order/${deleteDialog.itemId}`);
      console.log("deleted", res.data);

      if (res.data.statusCode === 200) {
        setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
        setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));
        handleDeleteCancel();
        showSnackbar('Sales order deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting sales order:', error);
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
      showSnackbar('Error deleting sales order', 'error');
    }
  };

  const handleEditSalesOrder = (id) => {
    navigate(`/dashboard/sales-order-product-list/${id}`);
  };

  const handleDocumentClick = (documentNo) => {
    navigate(`/dashboard/sales-order-product-list/${documentNo}`);
  };

  const hadleDocumentClick = (documentNo, orderId) => {
    navigate(`/dashboard/sales-order-by-customer/${documentNo}`);
  }

  const columnWidths = {
    serial: { minWidth: '80px' },
    date: { minWidth: '200px' },
    document: { minWidth: '200px' },
    customer: { minWidth: '300px' },
    salesChannel: { minWidth: '150px' },
    tracking: { minWidth: '200px' },
    shipping: { minWidth: '400px' },
    billing: { minWidth: '400px' },
    customerPO: { minWidth: '150px' },
    itemSku: { minWidth: '150px' },
    packQuantity: { minWidth: '160px' },
    unitsQuantity: { minWidth: '160px' },
    amount: { minWidth: '160px' },
    finalAmount: { minWidth: '160px' },
    createdAt: { minWidth: '200px' },
    actions: { minWidth: '200px' }, // Increased width to accommodate new button
  };

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5,
    backgroundColor: '#f0f8ff',
  };

  return (
    <Box>
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder={'Search sales order'}
          onExportCSV={handleExportAllCSV}
          onOpenDateFilter={handleOpenDateFilter}
          dateFilterActive={dateFilterActive}
          // New props for inline date filter
          showDateFilter={showDateFilter}
          dateFilter={dateFilter}
          onDateFilterChange={handleDateFilterChange}
          onApplyDateFilter={handleApplyDateFilter}
          onClearDateFilter={handleClearDateFilter}
          loading={loading}
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
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = isSelected(row.name || row.title);
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

                        <TableCell sx={{ ...columnWidths.actions, ...stickyCellStyle }}>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Edit">
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={() => handleEditSalesOrder(row.documentNumber)}
                                disabled={loading}
                              >
                                <IconEdit size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Export by Document Number">
                              <IconButton 
                                size="small" 
                                color="secondary" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportByDocumentNumber(row.documentNumber);
                                }}
                                disabled={loading}
                                sx={{
                                  color: 'green',
                                  '&:hover': {
                                    backgroundColor: 'green',
                                    color: 'white'
                                  }
                                }}
                              >
                                <IconDownload size="1.1rem" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={(e) => handleDeleteClick(e, row._id, row?.documentNumber)}
                                disabled={loading}
                              >
                                <IconTrash size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>

                        <TableCell sx={{ ...columnWidths.document, cursor: "pointer", ":hover": { color: "blue" } }} onClick={() => handleDocumentClick(row.documentNumber)}>
                          <Box display="flex" alignItems="center">
                            <Box sx={{ ml: 2 }}>
                              <Typography fontWeight="500" variant="subtitle2">
                                {row?.documentNumber || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell sx={columnWidths.document}>
                          <Box display="flex" alignItems="center">
                            <Box>
                              <Typography fontWeight="400">
                                {row.date && !isNaN(new Date(row.date).getTime())
                                  ? new Date(row.date).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                  : ""}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell sx={{ ...columnWidths.customer, cursor: "pointer" }} onClick={() => hadleDocumentClick(row.customerName, row._id)}>
                          <Box display="flex" alignItems="center">
                            <Box >
                              <Typography fontWeight="400">
                                {row?.customerName || ''}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell sx={columnWidths.salesChannel}>
                          <Box display="flex" alignItems="center">
                            <Box >
                              <Typography fontWeight="400">
                                {row?.salesChannel || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell sx={columnWidths.tracking}>
                          <Box display="flex" alignItems="center">
                            <Box >
                              <Typography fontWeight="400">
                                {row?.trackingNumber || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell sx={columnWidths.shipping}>
                          <Box display="flex" alignItems="center">
                            <Box >
                              <Typography fontWeight="400">
                                {row?.shippingAddress instanceof Object ?
                                  `${row?.shippingAddress.shippingAddressLineOne || ''}  ${row?.shippingAddress.shippingAddressLineTwo || ''}  ${row?.shippingAddress.shippingAddressLineThree || ''}  ${row?.shippingAddress.shippingCity || ''}  ${row?.shippingAddress.shippingState || ''}  ${row?.shippingAddress.shippingZip || ''}`.trim()
                                  : `${row?.shippingAddress}`
                                }
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell sx={columnWidths.billing}>
                          <Box display="flex" alignItems="center">
                            <Box >
                              <Typography fontWeight="400">
                                {row?.billingAddress instanceof Object ?
                                  `${row?.billingAddress.billingAddressLineOne || ''} ${row?.billingAddress.billingAddressLineTwo || ''} ${row?.billingAddress.billingAddressLineThree || ''} ${row?.billingAddress.billingCity || ''} ${row?.billingAddress.billingState || ''} ${row?.billingAddress.billingZip || ''}`.trim()
                                  : `${row?.billingAddress}`
                                }
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell sx={columnWidths.customerPO}>
                          <Box display="flex" alignItems="center">
                            <Box >
                              <Typography fontWeight="400">
                                {row?.customerPO || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell sx={columnWidths.createdAt}>
                          <Typography>
                            {format(new Date(row.updatedAt), 'E, MMM d yyyy')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                    <TableCell colSpan={headCells.length + (showCheckBox ? 1 : 0)} />
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

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteSalesOrder}
        itemName={deleteDialog.itemName}
        isDeleting={deleteDialog.isDeleting}
        itemType={"Sales Order"}
      />

      {/* Snackbar for export notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListTable;