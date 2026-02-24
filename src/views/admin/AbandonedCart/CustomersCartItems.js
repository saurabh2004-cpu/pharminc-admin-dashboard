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
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconSearch, IconTrash, IconEdit } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';

import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

function descendingComparator(a, b, orderBy) {
  if (!orderBy) return 0;
  let aValue = a[orderBy];
  let bValue = b[orderBy];

  // Handle numeric fields for accurate comparison
  if (['unitsQuantity', 'totalQuantity', 'eachPrice', 'totalPrice'].includes(orderBy)) {
    aValue = parseFloat(aValue) || 0;
    bValue = parseFloat(bValue) || 0;
  }
  // Handle string fields for case-insensitive comparison
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
              'aria-label': 'select all items',
            }}
          />
        </TableCell>}

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.key || headCell.id}
            align={headCell.numeric ? 'center' : 'center'}
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

const CustomersCartItems = () => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [tableData, setTableData] = useState([]);
  const [customerData, setCustomerData] = useState(null); // Store customer details
  const [cartTotals, setCartTotals] = useState(null); // Store cart totals
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { customerId } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);


  // Define headCells for the table
  const headCells = [
    {
      id: 'sku',
      label: 'Item SKU',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'Image',
      label: 'Image',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'productName',
      label: 'Product Name',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'packQuantity',
      label: 'Pack Type',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'unitsQuantity',
      label: 'Units Quantity',
      numeric: true,
      disablePadding: false,
    },
    {
      id: 'totalQuantity',
      label: 'Total Quantity',
      numeric: true,
      disablePadding: false,
    },
    {
      id: 'eachPrice',
      label: 'Each Price',
      numeric: true,
      disablePadding: false,
    },
    {
      id: 'totalPrice',
      label: 'Total Price',
      numeric: true,
      disablePadding: false,
    },
  ];

  const fetchCustomersCart = async () => {
    try {
      const res = await axiosInstance.get(`/cart/get-cart-by-customer-id/${customerId}`);

      console.log("customers cart response ", res);

      if (res.data.statusCode === 200) {
        // Transform the data to flat structure
        const transformedData = res.data.data.items.map(item => {
          let productId, sku, productName, eachPrice, taxable, taxPercentages, stockLevel, images;

          if (item.product) {
            productId = item.product._id;
            sku = item.product.sku;
            productName = item.product.ProductName;
            eachPrice = item.product.eachPrice;
            taxable = item.product.taxable;
            taxPercentages = item.product.taxPercentages;
            stockLevel = item.product.stockLevel;
            images = item.product.images;
          } else if (item.productGroup) {
            productId = item.productGroup._id;
            sku = item.productGroup.sku; // Product groups might not have a single SKU
            productName = item.productGroup.name;
            eachPrice = item.productGroup.price;
            taxable = item.productGroup.taxable;
            taxPercentages = item.productGroup.taxPercentages;

            const groupProducts = item.productGroup.products || [];
            stockLevel = groupProducts.length > 0
              ? groupProducts.reduce((min, p) => Math.min(min, p.product?.stockLevel || 0), Infinity)
              : 0;

            images = item.productGroup.thumbnail ? [item.productGroup.thumbnail] : [];
          }

          // Safe parsing for calculations
          const packQuantity = parseInt(item.packQuentity || 0);
          const unitsQuantity = parseInt(item.unitsQuantity || 0);
          const currentEachPrice = parseFloat(eachPrice || 0);

          // Calculate total price: (packQuantity * unitsQuantity) * eachPrice
          const totalPrice = (packQuantity * unitsQuantity) * currentEachPrice;

          return {
            _id: item._id,
            productId,
            sku: sku || 'N/A',
            productName: productName || 'Unknown Product',
            packQuantity,
            packType: item.packType || 'N/A',
            unitsQuantity,
            totalQuantity: item.totalQuantity || 0,
            eachPrice: currentEachPrice,
            totalPrice,
            taxable: !!taxable,
            taxPercentages: parseFloat(taxPercentages || 0),
            stockLevel: stockLevel || 0,
            images: images || [],
          };
        });

        setTableData(transformedData);
        setRows(transformedData);
        setCustomerData(res.data.data.customer);
        setCartTotals(res.data.data.totals);
      } else {
        console.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomersCart();
    }
  }, [customerId]);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    const filteredRows = tableData.filter((row) => {
      return (
        row?.sku?.toLowerCase().includes(searchValue) ||
        row?.productName?.toLowerCase().includes(searchValue)
      );
    });
    setRows(filteredRows);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0); // Reset page to 0 when sorting changes
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

  const theme = useTheme();
  const borderColor = theme.palette.divider;

  // Calculate grand total
  const grandTotal = rows.reduce((sum, row) => sum + row.totalPrice, 0);

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Abandoned Cart Items',
    },
  ];

  return (
    <Box>
      <Breadcrumb title="Cart Items List" items={BCrumb} />
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder="Search Cart Items"
          rows={rows}
          headCells={headCells}
        />

        <Grid container spacing={3}>
          {/* Left Side - Cart Items Table */}
          <Grid item xs={12} lg={7}>
            <Paper variant="outlined" sx={{ mx: 0, mt: 1, border: `1px solid ${borderColor}` }}>
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
                            {/* Item SKU */}
                            <TableCell>
                              <Typography fontWeight="600">
                                {row?.sku || 'N/A'}
                              </Typography>
                            </TableCell>

                            {/* Image Cell */}
                            <TableCell>
                              <Box display="flex" justifyContent="center" alignItems="center">
                                {row?.images && row.images.length > 0 ? (
                                  <Box
                                    component="img"
                                    src={typeof row.images[0] === 'string' ? row.images[0] : (row.images[0]?.url || '')}
                                    alt={row.productName}
                                    sx={{
                                      width: 50,
                                      height: 50,
                                      objectFit: 'cover',
                                      borderRadius: 1,
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2250%22%20height%3D%2250%22%20viewBox%3D%220%200%2050%2050%22%3E%3Crect%20width%3D%2250%22%20height%3D%2250%22%20fill%3D%22%23eeeeee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%2210%22%20fill%3D%22%23999%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%3ENo%20Img%3C%2Ftext%3E%3C%2Fsvg%3E';
                                    }}
                                  />
                                ) : (
                                  <Box sx={{ width: 50, height: 50, bgcolor: 'grey.200', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <IconSearch size="1.2rem" opacity={0.5} />
                                  </Box>
                                )}
                              </Box>
                            </TableCell>

                            {/* Product Name */}
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={2}>

                                <Box>
                                  <Typography fontWeight="600">
                                    {row?.productName || 'N/A'}
                                  </Typography>
                                  {row?.taxable && (
                                    <Chip
                                      label={`Tax: ${row.taxPercentages}%`}
                                      size="small"
                                      color="warning"
                                      sx={{ mt: 0.5 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </TableCell>

                            {/* Pack Quantity */}
                            <TableCell align="left">
                              <Typography fontWeight="600">
                                {row?.packType || 'N/A'}
                              </Typography>
                            </TableCell>

                            {/* Units Quantity */}
                            <TableCell align="center">
                              <Typography fontWeight="600">
                                {row?.unitsQuantity || 0}
                              </Typography>
                            </TableCell>

                            {/* Total Quantity */}
                            <TableCell align="center">
                              <Typography fontWeight="600" color="primary">
                                {row?.totalQuantity || 0}
                              </Typography>
                            </TableCell>

                            {/* Each Price */}
                            <TableCell align="center">
                              <Typography>
                                ${row?.eachPrice?.toFixed(2) || '0.00'}
                              </Typography>
                            </TableCell>

                            {/* Total Price */}
                            <TableCell align="center">
                              <Typography fontWeight="600" color="success.main">
                                ${row?.totalPrice?.toFixed(2) || '0.00'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                        <TableCell colSpan={8} />
                      </TableRow>
                    )}

                    {/* Grand Total Row */}
                    {/* {rows.length > 0 && (
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell colSpan={6} align="left">
                      <Typography variant="h6" fontWeight="700">
                        Final Amount:
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="h6" fontWeight="700" color="success.main">
                        ${grandTotal.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )} */}
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
          </Grid>

          {/* Right Side - Customer Details */}
          <Grid item xs={12} lg={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Customer Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {customerData ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                        Customer Name :
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {customerData.customerName || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                        Contact Name :
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {customerData.contactName || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                        Customer ID :
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {customerData.customerId || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                        Email :
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {customerData.customerEmail || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                        Phone :
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {customerData.CustomerPhoneNo || 'N/A'}
                      </Typography>
                    </Box>

                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">No customer details available.</Typography>
                )}
              </Paper>

              {/* Cart Sumary */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Cart Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {cartTotals ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        Total Items:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {cartTotals.totalItems || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        Total Quantity:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {cartTotals.totalQuantity || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        Subtotal:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${cartTotals.subtotal?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        Tax:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${cartTotals.tax?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #e0e0e0' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Total :
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                        ${cartTotals.grandTotal?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2">No summary available</Typography>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid >
      </Box>

      {/* Show error if any */}
      {
        error && (
          <Box sx={{ p: 2 }}>
            <Typography color="error">Error: {error}</Typography>
          </Box>
        )
      }
    </Box >
  );
};

export default CustomersCartItems;