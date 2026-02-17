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
  Chip,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconSearch, IconTrash, IconEdit, IconFilter, IconEye } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

function descendingComparator(a, b, orderBy) {
  let aValue = a[orderBy];
  let bValue = b[orderBy];

  // Specific handling for customersCount based on the length of the customers array
  if (orderBy === 'customersCount') {
    aValue = a.customers?.length || 0;
    bValue = b.customers?.length || 0;
  }
  // Handle date fields by converting to timestamps
  else if (orderBy === 'createdAt' || orderBy === 'updatedAt') {
    aValue = aValue ? new Date(aValue).getTime() : 0;
    bValue = bValue ? new Date(bValue).getTime() : 0;
  }
  // Standardize strings for alphabetical sorting
  else if (typeof aValue === 'string') {
    aValue = aValue.toLowerCase();
    bValue = (bValue || '').toLowerCase();
  }

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return (a, b) => {
    const comp = descendingComparator(a, b, orderBy);
    return order === 'desc' ? comp : -comp;
  };
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
              sx={{
                userSelect: 'text',
                '& .MuiTableSortLabel-icon': {
                  opacity: 0.5,
                },
              }}
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
  const { numSelected, handleSearch, search, placeholder } = props;

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
            placeholder={placeholder || "Search Sales Representatives"}
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
          {/* Add export functionality if needed */}
        </>
      )}
    </Toolbar>
  );
};

const ListSalesRep = () => {
  const { filteredAndSortedProducts } = useContext(ProductContext);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('email');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();

  // Updated headCells to match schema fields
  const headCells = [
    {
      id: 'email',
      label: 'Email',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'name',
      label: 'Name',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'role',
      label: 'Role',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'customersCount',
      label: 'Customers Count',
      numeric: true,
      disablePadding: false,
    },
    {
      id: 'createdAt',
      label: 'Created At',
      numeric: false,
      disablePadding: false,
    }
  ];

  const fetchSalesAllRep = async () => {
    try {
      const response = await axiosInstance.get(`/sales-rep/get-sales-reps`);
      // console.log("fetch all sales reps ", response);

      if (response.data.statusCode === 200) {
        setTableData(response.data.data);
        setRows(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching Sales Representatives list:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchSalesAllRep();
  }, []);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    const filteredRows = tableData.filter((row) => {
      return (
        row?.email?.toLowerCase().includes(searchValue) ||
        row?.name?.toLowerCase().includes(searchValue) ||
        row?.role?.toLowerCase().includes(searchValue) ||
        row?.customers?.length?.toString().includes(searchValue)
      );
    });
    setRows(filteredRows);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0); // Always reset page to 0 on sort
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

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

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

  const handleDeleteClick = (event, id, email) => {
    event.stopPropagation();
    setDeleteDialog({
      open: true,
      itemId: id,
      itemName: email,
      isDeleting: false
    });
  };

  const handleDeleteSalesRep = async () => {
    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

      const res = await axiosInstance.delete(`/sales-rep/delete-sales-rep/${deleteDialog.itemId}`);

      // console.log("deleted", res.data);

      if (res.data.statusCode === 200) {
        setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
        setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));
        handleDeleteCancel();
        setError('Sales representative deleted successfully!');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting sales representative:', error);
      setError('Failed to delete sales representative: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleEditSalesRep = (id) => {
    navigate(`/dashboard/SalesRep/edit/${id}`);
  };

  const handleViewCustomers = (id) => {
    navigate(`/dashboard/SalesRep/customers/${id}`);
  };

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5,
    backgroundColor: '#ffffff',
  };

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Sales Rep List',
    },
  ];

  return (
    <Box>

      <Breadcrumb title="Sales Rep List" items={BCrumb} />
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder="Search by Email, Name, or Role"
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
                    const isItemSelected = isSelected(row._id);
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
                        <TableCell sx={stickyCellStyle}>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Customers">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleViewCustomers(row._id)}
                              >
                                <IconEye size="1.1rem" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditSalesRep(row._id)}
                              >
                                <IconEdit size="1.1rem" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => handleDeleteClick(e, row._id, row.email)}
                              >
                                <IconTrash size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>

                        {/* Email */}
                        <TableCell
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              color: 'blue',
                            },
                          }}
                          onClick={() => handleViewCustomers(row._id)}>
                          <Typography fontWeight="600">
                            {row?.email || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Name */}
                        <TableCell>
                          <Typography>
                            {row?.name || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <Chip
                            label={row?.role || 'Sales-Rep'}
                            size="small"
                            color="secondary"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>

                        {/* Customers Count */}
                        <TableCell align="center">
                          <Chip
                            label={row?.customers?.length || 0}
                            size="small"
                            color="primary"
                            variant="outlined"
                            onClick={() => handleViewCustomers(row._id)}
                            sx={{
                              cursor: 'pointer',
                              fontWeight: 600,
                              '&:hover': {
                                backgroundColor: theme.palette.primary.light,
                              },
                            }}
                          />
                        </TableCell>

                        {/* Created At */}
                        <TableCell>
                          <Typography variant="body2">
                            {row.createdAt ? format(new Date(row.createdAt), 'E, MMM d yyyy') : 'N/A'}
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
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={headCells.length + 1} align="center" sx={{ py: 3 }}>
                      <Typography variant="h6" color="textSecondary">
                        {search
                          ? 'No sales representatives found matching your search'
                          : 'No sales representatives found'}
                      </Typography>
                    </TableCell>
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
        onConfirm={handleDeleteSalesRep}
        itemName={deleteDialog.itemName}
        isDeleting={deleteDialog.isDeleting}
        itemType={"Sales Representative"}
      />
    </Box>
  );
};

export default ListSalesRep;