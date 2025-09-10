// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useContext, useState, useEffect } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { format, isToday, isThisMonth, parseISO } from 'date-fns';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { 
  IconDotsVertical, 
  IconFilter, 
  IconSearch, 
  IconTrash, 
  IconEdit, 
  IconCalendarEvent,
  IconCalendar,
  IconClearAll,
  IconCheck,
  IconCash,
  IconAlertCircleFilled,
  IconCalendarEventFilled,
  IconCopyCheckFilled
} from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { IconClock, IconClock2 } from '@tabler/icons';

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

  return (
    <TableHead>
      <TableRow>
        {showCheckBox && <TableCell padding="checkbox">
          <CustomCheckbox
            color="primary"
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all',
            }}
          />
        </TableCell>}
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
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
    netTermsFilter,
    setNetTermsFilter,
    filterCount,
    setFilter
  } = props;

  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleFilterSelect = (filter, apiEndpoint) => {
    setNetTermsFilter(filter);
    setFilter(apiEndpoint);
    handleFilterMenuClose();
  };

  const getFilterLabel = () => {
    switch (netTermsFilter) {
      case 'today':
        return "Today's Net Terms";
      case 'thisMonth':
        return "This Month's Net Terms";
      case 'overdue':
        return "Overdue Payments";
      case 'dueToday':
        return "Due Today";
      case 'upcoming':
        return "Upcoming Payments";
      default:
        return 'All Net Terms';
    }
  };

  const getFilterColor = () => {
    switch (netTermsFilter) {
      case 'today':
      case 'dueToday':
        return 'warning';
      case 'thisMonth':
      case 'upcoming':
        return 'info';
      case 'overdue':
        return 'error';
      default:
        return 'default';
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
        <Box sx={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder={placeholder || "Search Net Terms"}
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
          
          {/* Active Filter Chip */}
          {netTermsFilter !== 'all' && (
            <Chip
              label={`${getFilterLabel()} (${filterCount})`}
              color={getFilterColor()}
              variant="outlined"
              size="small"
              onDelete={() => {
                setNetTermsFilter('all');
                setFilter('get-net-terms-by-month');
              }}
            />
          )}
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
          <Tooltip title="Filter Net Terms">
            <IconButton onClick={handleFilterMenuOpen}>
              <IconFilter size="1.2rem" color={netTermsFilter !== 'all' ? 'primary' : 'inherit'} />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={filterMenuAnchor}
            open={Boolean(filterMenuAnchor)}
            onClose={handleFilterMenuClose}
            PaperProps={{
              sx: { minWidth: 250 }
            }}
          >
            <MenuItem onClick={() => handleFilterSelect('all', 'get-net-terms-by-month')}>
              <ListItemIcon>
                <IconClearAll size="1.2rem" />
              </ListItemIcon>
              <ListItemText primary="All Net Terms" />
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect('today', 'get-net-terms-by-day')}>
              <ListItemIcon>
                <IconCalendarEventFilled size="1.2rem" />
              </ListItemIcon>
              <ListItemText primary="Today's Net Terms" />
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect('thisMonth', 'get-net-terms-by-month')}>
              <ListItemIcon>
                <IconCalendar size="1.2rem" />
              </ListItemIcon>
              <ListItemText primary="This Month's Net Terms" />
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect('overdue', 'get-pending-net-terms')}>
              <ListItemIcon>
                <IconAlertCircleFilled size="1.2rem" color="red" />
              </ListItemIcon>
              <ListItemText primary="Overdue Payments" />
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect('dueToday', 'get-pending-net-terms')}>
              <ListItemIcon>
                <IconClock size="1.2rem" color="orange" />
              </ListItemIcon>
              <ListItemText primary="Due Today" />
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect('upcoming', 'get-pending-net-terms')}>
              <ListItemIcon>
                <IconCheck size="1.2rem" color="blue" />
              </ListItemIcon>
              <ListItemText primary="Upcoming Payments" />
            </MenuItem>
          </Menu>
        </>
      )}
    </Toolbar>
  );
};

const ListTable = ({
  showCheckBox,
  headCells,
  tableData,
  isProductsList = true,
  isBrandsList = true,
  setTableData,
  setFilter
}) => {

  const {
    filteredAndSortedProducts,
  } = useContext(ProductContext);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('customerName');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [netTermsFilter, setNetTermsFilter] = useState('all');

  // Handle both direct array and nested data structure
  const sourceData = Array.isArray(tableData) ? tableData : (tableData?.payments || []);
  const [rows, setRows] = useState(sourceData);
  const [filteredRows, setFilteredRows] = useState(sourceData);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Column widths
  const columnWidths = {
    serial: { minWidth: '80px' },
    customerId: { minWidth: '150px' },
    netTerms: { minWidth: '120px' },
    customerName: { minWidth: '200px' },
    customerEmail: { minWidth: '220px' },
    phone: { minWidth: '150px' },
    dueDate: { minWidth: '140px' },
    amount: { minWidth: '120px' },
    status: { minWidth: '120px' },
    actions: { minWidth: '160px' },
  };

  // Apply search filter
  const applySearchFilter = (data, searchValue) => {
    if (!searchValue) return data;
    
    return data.filter((row) => {
      return (
        row.customerId?.toLowerCase().includes(searchValue) ||
        row.customerName?.toLowerCase().includes(searchValue) ||
        row.customerEmail?.toLowerCase().includes(searchValue) ||
        row.documentNumber?.toLowerCase().includes(searchValue) ||
        row.netTerms?.toString().toLowerCase().includes(searchValue)
      );
    });
  };

  // Update filtered data when source data or search changes
  useEffect(() => {
    const searchFiltered = applySearchFilter(sourceData, search.toLowerCase());
    setFilteredRows(searchFiltered);
    setRows(searchFiltered);
    setPage(0);
  }, [sourceData, search]);

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
      const newSelecteds = rows.map((n) => n?.customerName || n._id);
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

  // Get payment status color and icon
  const getStatusDisplay = (row) => {
    const status = row.status || 'active';
    const daysOverdue = row.daysOverdue || 0;
    const daysUntilDue = row.daysUntilDue || 0;

    switch (status) {
      case 'overdue':
        return {
          color: 'error',
          label: `${daysOverdue} days overdue`,
          icon: <IconAlertCircleFilled size="1rem" />
        };
      case 'due_today':
        return {
          color: 'warning',
          label: 'Due Today',
          icon: <IconClock2 size="1rem" />
        };
      case 'due_soon':
        return {
          color: 'info',
          label: `Due in ${daysUntilDue} days`,
          icon: <IconCheckCircle size="1rem" />
        };
      default:
        return {
          color: 'default',
          label: 'Active',
          icon: <IconCopyCheckFilled size="1rem" />
        };
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const total = filteredRows.reduce((sum, row) => sum + (row.amount || 0), 0);
    const count = filteredRows.length;
    return { total, count };
  };

  const { total: totalAmount, count: totalCount } = calculateTotals();

  return (
    <Box>
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder="Search customers, emails, or document numbers"
          netTermsFilter={netTermsFilter}
          setNetTermsFilter={setNetTermsFilter}
          filterCount={filteredRows.length}
          setFilter={setFilter}
        />

        {/* Summary Cards */}
        <Box sx={{ mx: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                    <IconCash size="2rem" color={theme.palette.primary.main} />
                  </Box>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                    <IconCalendarEvent size="2rem" color={theme.palette.info.main} />
                  </Box>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {totalCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {tableData?.year && tableData?.month && (
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                      <IconCalendar size="2rem" color={theme.palette.secondary.main} />
                    </Box>
                    <Typography variant="h6" color="secondary.main" fontWeight="bold">
                      {tableData.month}/{tableData.year}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Period
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>

        <Paper variant="outlined" sx={{ mx: 2, mt: 1, border: `1px solid ${borderColor}` }}>
          <TableContainer sx={{ width: "100%" }}>
            <Table
              sx={{ minWidth: 1200 }}
              aria-labelledby="tableTitle"
              size={dense ? 'small' : 'medium'}
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
                    const isItemSelected = isSelected(row?.customerName || row._id);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    const statusDisplay = getStatusDisplay(row);

                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row._id || row.salesOrderId || `${row.customerName}-${index}`}
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

                        {/* Serial */}
                        <TableCell sx={columnWidths.serial}>
                          <Typography fontWeight="400">
                            {page * rowsPerPage + index + 1}
                          </Typography>
                        </TableCell>

                        {/* Customer ID */}
                        <TableCell sx={columnWidths.customerId}>
                          <Typography fontWeight="500" variant="subtitle2">
                            {row.salesOrderId || 'N/A'}
                          </Typography>
                          {row.documentNumber && (
                            <Typography variant="caption" color="text.secondary">
                              Doc: {row.documentNumber}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Net Terms */}
                        <TableCell sx={columnWidths.netTerms}>
                          <Chip
                            label={row.netTerms ? `Net ${row.netTerms}` : 'N/A'}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>

                        {/* Customer Name */}
                        <TableCell sx={columnWidths.customerName}>
                          <Typography fontWeight="500">
                            {row.customerName}
                          </Typography>
                        </TableCell>

                        {/* Customer Email */}
                        <TableCell sx={columnWidths.customerEmail}>
                          <Typography fontWeight="400">
                            {row.orderDate || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Phone Number */}
                        <TableCell sx={columnWidths.phone}>
                          <Typography fontWeight="400">
                            {row.dueDate|| 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={columnWidths.phone}>
                          <Typography fontWeight="400">
                            {row.amount|| 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={columnWidths.phone}>
                          <Typography fontWeight="400">
                            {row.netTerms|| 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={columnWidths.phone}>
                          <Typography fontWeight="400">
                            {row.status|| 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Due Date (if available) */}
                        {row.dueDate && (
                          <TableCell sx={columnWidths.dueDate}>
                            <Typography variant="body2" fontWeight="500">
                              {format(parseISO(row.dueDate), 'dd/MM/yyyy')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(parseISO(row.dueDate), 'HH:mm')}
                            </Typography>
                          </TableCell>
                        )}

                        {/* Amount (if available) */}
                        {row.amount !== undefined && (
                          <TableCell sx={columnWidths.amount}>
                            <Typography fontWeight="500" color="primary">
                              ${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </Typography>
                          </TableCell>
                        )}

                        {/* Status (if available) */}
                        {row.status && (
                          <TableCell sx={columnWidths.status}>
                            <Chip
                              icon={statusDisplay.icon}
                              label={statusDisplay.label}
                              size="small"
                              color={statusDisplay.color}
                              variant="outlined"
                            />
                          </TableCell>
                        )}

                        {/* Actions */}
                        <TableCell sx={columnWidths.actions}>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Edit">
                              <IconButton size="small" color="primary" onClick={() => navigate(`/dashboard/customers/edit/${row._id || row.customerData?._id}`)}>
                                <IconEdit size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <IconButton size="small" color="info">
                                <IconDotsVertical size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                          </Box>
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
            rowsPerPageOptions={[5, 10, 30, 50]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default ListTable;