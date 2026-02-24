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
// import CustomSwitch from '../../../forms/theme-elements/CustomSwitch';
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

function descendingComparator(a, b, orderBy) {
  let aValue = a[orderBy];
  let bValue = b[orderBy];

  // Sanitize and parse percentage strings
  if (orderBy === 'percentage') {
    const parse = (v) => {
      if (typeof v === 'number') return v;
      if (!v) return 0;
      const sanitized = v.toString().replace(/[^\d.-]/g, '');
      return parseFloat(sanitized) || 0;
    };
    aValue = parse(aValue);
    bValue = parse(bValue);
  }
  // Convert dates to timestamps for reliable comparison
  else if (orderBy === 'updatedAt' || orderBy === 'createdAt') {
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
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const orderResult = comparator(a[0], b[0]);
    if (orderResult !== 0) return orderResult;
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

        {/* Actions column */}
        <TableCell sx={{ ...headCellStyle, ...stickyCellStyle }}>
          Actions
        </TableCell>

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
  const { numSelected, handleSearch, search, placeholder, rows, headCells } = props;

  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get(
        '/pricing-groups-discount/export-pricing-group-discounts',
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "pricing_group_discounts_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
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
            <IconButton>
              <IconFilter size="1.2rem" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export CSV">
            <Button size="small" variant="outlined" onClick={handleExportCSV}>Export</Button>
          </Tooltip>
        </>
      )}
    </Toolbar>
  );
};

const CustomersItemsBasedDiscounts = () => {
  const {
    filteredAndSortedProducts,
  } = useContext(ProductContext);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('productSku');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const isBrandsList = true;

  const [tableData, setTableData] = React.useState([]);
  const [error, setError] = useState(''); // Added missing error state
  const sourceData = tableData || [];
  const [rows, setRows] = useState(sourceData);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // Define headCells for the table
  const headCells = [
    {
      id: 'productSku',
      label: 'Product SKU',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'percentage',
      label: 'Discount',
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


  const fetchItemsDiscounts = async () => {
    try {
      const response = await axiosInstance.get(`/item-based-discount/get-items-based-discount-by-customer-id/${id}`);
      // console.log("response item discounts ", response);

      if (response.data.statusCode === 200) {
        setTableData(response.data.data);
      }

    } catch (error) {
      console.error('Error fetching pricing groups list:', error);
      setError(error.message);
    }
  };


  React.useEffect(() => {
    fetchItemsDiscounts();
  }, [id]);

  useEffect(() => {
    if (isBrandsList) {
      setRows(sourceData);
    } else {
      setRows(filteredAndSortedProducts);
    }
  }, [sourceData, filteredAndSortedProducts, isBrandsList]);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    if (isBrandsList) {
      const filteredRows = sourceData.filter((row) => {
        return (
          row?.productSku?.toLowerCase().includes(searchValue) ||
          row?.pricingGroup?.name?.toLowerCase().includes(searchValue) ||
          row?.percentage?.includes(searchValue)
        );
      });
      setRows(filteredRows);
    } else {
      const filteredRows = filteredAndSortedProducts.filter((row) => {
        return row.title.toLowerCase().includes(searchValue);
      });
      setRows(filteredRows);
    }
  };


  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
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

  //delete pricing group
  const handleDeleteItemDiscounts = async () => {
    try {
      const res = await axiosInstance.delete(`/item-based-discount/delete-items-based-discount/${deleteDialog.itemId}`);

      // console.log("deleted", res.data);

      if (res.data.statusCode === 200) {
        setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
        setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));
        handleDeleteCancel();

      }
    } catch (error) {
      console.error('Error deleting item discounts:', error);
    }
  };

  //edit pricing group
  const handleEditItemDiscounts = (id) => {
    navigate(`/dashboard/items-based-discounts/edit/${id}`);
  };

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5, // higher than other cells so it stays on top
    backgroundColor: '#f0f8ff', // keeps background clean while scrolling
  };

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Customers Items Discounts',
    },
  ];


  return (
    <Box>
      <Breadcrumb title="Customers Items Discounts" items={BCrumb} />
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder={isBrandsList ? "Search Pricing Group Discount" : "Search Product"}
          rows={rows}
          headCells={headCells}
        />
        <Paper variant="outlined" sx={{ mx: 2, mt: 1, border: `1px solid ${borderColor}` }}>
          <TableContainer>
            <Table
              sx={{
                minWidth: 1000,
                borderCollapse: "collapse", // ensures borders connect
                "& td, & th": {
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
                showCheckBox={false}
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
                        {isBrandsList ? (
                          // Brands List View
                          <>
                            <TableCell sx={stickyCellStyle} >
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit">
                                  <IconButton size="small" color="primary" onClick={() => handleEditItemDiscounts(row?._id)}>
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(e) => handleDeleteClick(e, row?._id, row?.pricingGroup?.name)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>

                            <TableCell onClick={() => handleEditItemDiscounts(row._id)} sx={{ cursor: 'pointer' }}>
                              <Box display="flex" alignItems="center">
                                <Box sx={{ ml: 2 }}>
                                  <Typography fontWeight="600">
                                    {row?.productSku || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell onClick={() => handleEditItemDiscounts(row._id)} sx={{ cursor: 'pointer' }}>
                              <Box display="flex" alignItems="center">
                                <Box sx={{ ml: 2 }}>
                                  <Typography fontWeight="600">
                                    {row?.percentage || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            {/* <TableCell onClick={() => handleEditItemDiscounts(row._id)} sx={{ cursor: 'pointer' }}>
                              <Box display="flex" alignItems="center">
                                <Box sx={{ ml: 2 }}>
                                  <Typography fontWeight="600">
                                    {row?.pricingGroup?.name || ''}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell> */}

                            <TableCell>
                              <Typography>
                                {row.updatedAt ? format(new Date(row.updatedAt), 'E, MMM d yyyy') : 'N/A'}
                              </Typography>
                            </TableCell>
                          </>
                        ) : (
                          // Products List View (original code)
                          <TableCell colSpan={headCells.length + 2}>
                            <Typography>No product view implemented</Typography>
                          </TableCell>
                        )}
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

      {/* Show error if any */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      )}

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteItemDiscounts}
        itemName={deleteDialog.itemName}
        isDeleting={deleteDialog.isDeleting}
        itemType={"Customers Items Discount"}
      />
    </Box>
  );
};

export default CustomersItemsBasedDiscounts;