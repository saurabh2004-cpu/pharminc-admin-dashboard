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
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
// import CustomSwitch from '../../../forms/theme-elements/CustomSwitch';
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit, IconKey } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import axios from 'axios';
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

function getComparator(
  order,
  orderBy,
) {
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
    zIndex: 5, // higher than other cells so it stays on top
    backgroundColor: '#f0f8ff', // keeps background clean while scrolling
  };

  const headCellStyle = {
    backgroundColor: '#f0f8ff', // ✅ apply to all header cells
    fontWeight: 600,
    zIndex: 4, // slightly lower than sticky so sticky overlaps
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
              ...(index === 0 ? stickyCellStyle : {}), // 👈 first col sticky
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
    rows, 
    headCells,
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

  const getFilterLabel = () => {
    switch(approvalFilter) {
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
          <Tooltip title="Filter list">
            <IconButton onClick={handleFilterClick}>
              <IconFilter size="1.2rem" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={filterAnchorEl}
            open={openFilterMenu}
            onClose={handleFilterClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem 
              onClick={() => handleFilterSelect('all')}
              selected={approvalFilter === 'all'}
            >
              <ListItemText>All Customers</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => handleFilterSelect('unapproved')}
              selected={approvalFilter === 'unapproved'}
            >
              <ListItemText>Unapproved Only</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => handleFilterSelect('approved')}
              selected={approvalFilter === 'approved'}
            >
              <ListItemText>Approved Only</ListItemText>
            </MenuItem>
          </Menu>
          
          {approvalFilter !== 'all' && (
            <Typography variant="caption" sx={{ mx: 1, color: 'primary.main' }}>
              {getFilterLabel()}
            </Typography>
          )}
          
          <Tooltip title="Export CSV">
            <IconButton onClick={handleExportCSV}>
              <Button size="small" variant="outlined" >Export</Button>
            </IconButton>
          </Tooltip>
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
  loading
}) => {

  const {
    filteredAndSortedProducts,
  } = useContext(ProductContext);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('calories');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [approvalFilter, setApprovalFilter] = useState('all'); // 'all', 'unapproved', 'approved'

  const sourceData = tableData || [];
  const [rows, setRows] = useState(sourceData);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Define column widths for products table
  const columnWidths = {
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
    defaultShippingRate: { minWidth: '200px' },
    createdAt: { minWidth: '160px' },
    actions: { minWidth: '160px' },
    packBarcodes: { minWidth: '250px' },
  };

  useEffect(() => {
    let filteredData = sourceData;

    // Apply approval filter first
    if (approvalFilter === 'unapproved') {
      filteredData = filteredData.filter(row => row.userApproval === false);
    } else if (approvalFilter === 'approved') {
      filteredData = filteredData.filter(row => row.userApproval === true);
    }

    // Then apply search filter if search is active
    if (search.trim()) {
      const searchValue = search.toLowerCase();
      filteredData = filteredData.filter((row) => {
        return (
          row.customerId?.toLowerCase().includes(searchValue) ||
          row.customerName?.toLowerCase().includes(searchValue) ||
          row.contactName?.toLowerCase().includes(searchValue) ||
          row.customerEmail?.toLowerCase().includes(searchValue) ||
          row.contactEmail?.toLowerCase().includes(searchValue) ||
          row.CustomerPhoneNo?.toString().toLowerCase().includes(searchValue) ||
          row.category?.toLowerCase().includes(searchValue) ||
          row.primaryBrand?.toLowerCase().includes(searchValue) ||
          row.netTerms?.toString().toLowerCase().includes(searchValue) ||
          row.orderApproval?.toLowerCase().includes(searchValue) ||
          row.defaultShippingRate?.toString().toLowerCase().includes(searchValue) ||
          row.shippingCity?.toLowerCase().includes(searchValue) ||
          row.shippingState?.toLowerCase().includes(searchValue) ||
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

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
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
    event.stopPropagation(); // Prevent row selection
    setDeleteDialog({
      open: true,
      itemId: id,
      itemName: name,
      isDeleting: false
    });
  };

  //delete product
  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`/admin/delete-user/${deleteDialog.itemId}`);

      console.log("deleted", res.data);

      if (res.data.statusCode === 200) {
        setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
        setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));
        handleDeleteCancel();
      }
    } catch (error) {
      console.error('Error deleting pack:', error);
    }
  };

  //edit product
  const handleEdit = (id) => {
    navigate(`/dashboard/customers/edit/${id}`);
  };

  //chnage password
  const handleChangePassword = (email) => {
    navigate(`/dashboard/customers/change-password/${email}`);
  };

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5, // higher than other cells so it stays on top
    backgroundColor: '#f0f8ff', // keeps background clean while scrolling
  };

  return (
    <Box>
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder={isBrandsList ? "Search Brand" : "Search Product"}
          approvalFilter={approvalFilter}
          setApprovalFilter={setApprovalFilter}
        />
        <Paper variant="outlined" sx={{ mx: 2, mt: 1, border: `1px solid ${borderColor}` }}>
          <TableContainer sx={{ width: "100%" }}>
            <Table
              sx={{
                minWidth: 1800,
                borderCollapse: "collapse", // ensures borders connect
                "& td, & th": {
                  paddingTop: "4px",    // 👈 reduce vertical padding
                  paddingBottom: "4px",
                  borderRight: "1px solid rgba(224, 224, 224, 1)", // vertical line
                },
                "& td:last-child, & th:last-child": {
                  borderRight: "none", // no border on last column
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
                <>
                  < Box sx={{
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
                </>
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
                            // Products List View with enhanced styling and widths
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

                                  {/* Change Password */}
                                  <Tooltip title="Change Password">
                                    <IconButton
                                      size="small"
                                      color="secondary"
                                      onClick={() => handleChangePassword(row.customerEmail ? row.customerEmail : row.contactEmail)}
                                    >
                                      <IconKey size="1.1rem" /> {/* Use a key/lock icon */}
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.sku}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="500" variant="subtitle2">
                                      {row.customerId}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.productName}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400" >
                                      {row.customerName}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.stockLevel}>
                                <Box display="flex" alignItems="center">
                                  <Box >
                                    <Typography fontWeight="400">
                                      {row.contactName}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.pricingGroup}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400" sx={{ ml: 2 }}>
                                      {row.customerEmail || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.brand}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.contactEmail || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.category}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.CustomerPhoneNo || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.subCategory}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.category || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.storeDescription}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400" >
                                      {row.primaryBrand || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.pageTitle}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {isNaN(row.netTerms) ? 'N/A' : row.netTerms}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.eachBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.orderApproval || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.defaultShippingRate}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400" >
                                      {isNaN(row.defaultShippingRate) ? 'N/A' : row.defaultShippingRate}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.packBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.shippingAddresses[0].shippingAddressOne || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.packBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.shippingAddresses[0].shippingAddressTwo || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.packBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.shippingAddresses[0].shippingAddressThree || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.packBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.shippingAddresses[0].shippingCity || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={columnWidths.packBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.shippingAddresses[0].shippingState || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={columnWidths.packBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.shippingAddresses[0].shippingZip || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              {/* billing addresses  */}

                              <TableCell sx={columnWidths.packBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.billingAddresses[0].billingAddressOne || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.packBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.billingAddresses[0].billingAddressTwo || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.packBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.billingAddresses[0].billingAddressThree || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.packBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.billingAddresses[0].billingCity || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.packBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.billingAddresses[0].billingState || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.packBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.billingAddresses[0].billingZip || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.packBarcodes}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {row.inactive === true ? 'Inactive' : 'Active' || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>

                              <TableCell sx={columnWidths.createdAt}>
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography fontWeight="400">
                                      {format(new Date(row.createdAt), 'E, MMM d yyyy')}
                                    </Typography>
                                  </Box>
                                </Box>
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
    </Box>
  );
};

export default ListTable;