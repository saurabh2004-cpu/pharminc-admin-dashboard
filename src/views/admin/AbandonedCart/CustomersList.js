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
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

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

        {/* Actions column */}
        {/* <TableCell sx={{ ...headCellStyle, ...stickyCellStyle }}>
          Actions
        </TableCell> */}

        {headCells.map((headCell, index) => (
          <TableCell
            key={headCell.key || headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
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


      </TableRow>
    </TableHead>
  );
}

const EnhancedTableToolbar = (props) => {
  const { numSelected, handleSearch, search, placeholder, rows, headCells } = props;

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
        <></>
      )}
    </Toolbar>
  );
};

const CustomersList = () => {
  const {
    filteredAndSortedProducts,
  } = useContext(ProductContext);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('customerId');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [tableData, setTableData] = React.useState([]);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  // Define headCells for the table
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
      id: 'customerPhone',
      label: 'Customer Phone',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'customerEmail',
      label: 'Customer Email',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'totalCartItems',
      label: 'Total Cart Items',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'updatedAt',
      label: 'Last Updated Date',
      numeric: false,
      disablePadding: false,
    },
  ];

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get(`/cart/get-all-users-with-cart-items`);
      // console.log("get-all-users-with-cart-items ", response);

      if (response.data.statusCode === 200) {
        // Transform the nested data structure to flat structure for table
        const transformedData = response.data.data.users.map(userObj => ({
          _id: userObj.user._id,
          customerId: userObj.user.customerId,
          customerName: userObj.user.customerName,
          customerPhone: userObj.user.CustomerPhoneNo,
          customerEmail: userObj.user.customerEmail,
          totalCartItems: userObj.totalCartItems,
          cartId: userObj.cartId,
          cartItems: userObj.cartItems,
          updatedAt: userObj.user.updatedAt,
          createdAt: userObj.user.createdAt,
        }));

        setTableData(transformedData);
        setRows(transformedData);
      }

    } catch (error) {
      console.error('Error fetching customers list:', error);
      setError(error.message);
    }
  };

  React.useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    const filteredRows = tableData.filter((row) => {
      return (
        row?.customerId?.toLowerCase().includes(searchValue) ||
        row?.customerName?.toLowerCase().includes(searchValue) ||
        row?.customerPhone?.toLowerCase().includes(searchValue) ||
        row?.customerEmail?.toLowerCase().includes(searchValue)
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
      const newSelecteds = rows.map((n) => n.customerId);
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

  // const [deleteDialog, setDeleteDialog] = useState({
  //   open: false,
  //   itemId: null,
  //   itemName: '',
  //   isDeleting: false
  // });


  const handleDeleteClick = (event, id, name) => {
    event.stopPropagation();
    setDeleteDialog({
      open: true,
      itemId: id,
      itemName: name,
      isDeleting: false
    });
  };

  const handleCustomerIdClcik = async (customerId) => {
    navigate(`/dashboard/abandoned-cart-items/list/${customerId}`);
  }



  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5,
    backgroundColor: '#f0f8ff',
  };

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Abandoned Cart Customers List',
    },
  ];

  return (
    <Box>
      <Breadcrumb title="Abandoned Cart Customers List" items={BCrumb} />
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder="Search Customers"
          rows={rows}
          headCells={headCells}
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
                  .map((row, index) => {
                    const isItemSelected = isSelected(row.customerId);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row._id}
                        selected={isItemSelected}
                      >
                        {/* Actions Column */}
                        {/* <TableCell sx={stickyCellStyle}>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Edit">
                              <IconButton size="small" color="primary" onClick={() => handleEditCustomer(row?._id)}>
                                <IconEdit size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={(e) => handleDeleteClick(e, row?._id, row?.customerName)}>
                                <IconTrash size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell> */}

                        {/* Customer ID */}
                        <TableCell onClick={() => handleCustomerIdClcik(row._id)} sx={{ cursor: 'pointer', ":hover": { color: "primary.main" } }}>
                          <Typography fontWeight="600">
                            {row?.customerId || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Customer Name */}
                        <TableCell sx={{ cursor: 'pointer' }}>
                          <Typography fontWeight="600">
                            {row?.customerName || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Customer Phone */}
                        <TableCell sx={{ cursor: 'pointer' }}>
                          <Typography>
                            {row?.customerPhone || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Customer Email */}
                        <TableCell sx={{ cursor: 'pointer' }}>
                          <Typography>
                            {row?.customerEmail || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Total Cart Items */}
                        <TableCell>
                          <Typography fontWeight="600" onClick={() => handleCustomerIdClcik(row._id)} sx={{ marginLeft: "50px" }} color="primary">
                            {row?.totalCartItems || 0}
                          </Typography>
                        </TableCell>

                        {/* Last Updated Date */}
                        <TableCell>
                          <Typography>
                            {row.updatedAt ? format(new Date(row.updatedAt), 'E, MMM d yyyy') : 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                    <TableCell colSpan={headCells.length + 3} />
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

      {/* Show error if any */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      )}

      {/* <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteCustomer}
        itemName={deleteDialog.itemName}
        isDeleting={deleteDialog.isDeleting}
        itemType={"Customer"}
      /> */}
    </Box>
  );
};

export default CustomersList;