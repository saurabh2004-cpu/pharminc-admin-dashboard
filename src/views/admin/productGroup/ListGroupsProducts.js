// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconFilter, IconSearch, IconTrash, IconEdit, IconArrowLeft } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

function descendingComparator(a, b, orderBy) {
  const getVal = (item, id) => {
    let val;
    if (id.startsWith('product.')) {
      const field = id.split('.')[1];
      val = item.product?.[field];

      if (field === 'eachPrice' || field === 'stockLevel') {
        return parseFloat(val) || 0;
      }
      if (field === 'pricingGroup') {
        return (val?.name || 'ANY').toLowerCase();
      }
      if (field === 'commerceCategoriesOne') {
        if (Array.isArray(val)) {
          return val.map(cat => cat.name || '').join(', ').toLowerCase();
        }
        return (val?.name || '').toLowerCase();
      }
      if (field === 'createdAt') {
        return val ? new Date(val).getTime() : 0;
      }
      if (typeof val === 'string') {
        return val.toLowerCase();
      }
    } else {
      val = item[id];
      if (id === 'packQuantity' || id === 'unitsQuantity') {
        return parseFloat(val) || 0;
      }
      if (typeof val === 'string') {
        return val.toLowerCase();
      }
    }
    return val || '';
  };

  const aValue = getVal(a, orderBy);
  const bValue = getVal(b, orderBy);

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

  const stickyCellStyle = {
    ...headCellStyle,
    position: "sticky",
    left: 0,
    zIndex: 5,
  };

  return (
    <TableHead>
      <TableRow>
        {showCheckBox && (
          <TableCell padding="checkbox">
            <CustomCheckbox
              color="primary"
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all desserts',
              }}
            />
          </TableCell>
        )}

        {/* Actions column */}
        <TableCell sx={stickyCellStyle}>
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
      </TableRow>
    </TableHead>
  );
}

const EnhancedTableToolbar = (props) => {
  const { numSelected, handleSearch, search, placeholder, productGroupInfo, onBack } = props;

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
          <Tooltip title="Back to Product Groups">
            <IconButton onClick={onBack}>
              <IconArrowLeft size="1.2rem" />
            </IconButton>
          </Tooltip>

          {productGroupInfo && (
            <Box>
              <Typography variant="h6" fontWeight="600">
                {productGroupInfo.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                SKU: {productGroupInfo.sku} | Total Products: {productGroupInfo.products?.length || 0}
              </Typography>
            </Box>
          )}

          <TextField
            placeholder={placeholder || "Search Products"}
            size="small"
            onChange={handleSearch}
            value={search}
            sx={{ ml: 'auto', width: 300 }}
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
        <Tooltip title="Filter list">
          <IconButton>
            <IconFilter size="1.2rem" />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

const ListProductGroupProducts = () => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('product.sku');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [productGroupInfo, setProductGroupInfo] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  // Define headCells for products in product group
  const headCells = [
    {
      id: 'image',
      label: 'Image',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'product.sku',
      label: 'SKU',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'product.ProductName',
      label: 'Product Name',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'packType',
      label: 'Pack Type',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'packQuantity',
      label: 'Pack Qty',
      numeric: true,
      disablePadding: false,
    },
    {
      id: 'unitsQuantity',
      label: 'Units Qty',
      numeric: true,
      disablePadding: false,
    },
    {
      id: 'product.eachPrice',
      label: 'Price',
      numeric: true,
      disablePadding: false,
    },
    {
      id: 'product.type',
      label: 'Type',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'product.stockLevel',
      label: 'Stock',
      numeric: true,
      disablePadding: false,
    },
    {
      id: 'product.pricingGroup',
      label: 'Pricing Group',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'product.commerceCategoriesOne',
      label: 'Brand',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'product.createdAt',
      label: 'Created Date',
      numeric: false,
      disablePadding: false,
    },
  ];

  // Fetch product group details and products
  const fetchProductGroupProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get(`/product-group/get-products-of-product-group/${id}`);
      // console.log("response product group products", response);

      if (response.data.statusCode === 200) {
        setProductGroupInfo(response.data.data);
        const products = response.data.data.products || [];
        setTableData(products);
        setRows(products);
      } else {
        setError('Failed to fetch product group products');
      }
    } catch (error) {
      console.error('Error fetching product group products:', error);
      setError(error.response?.data?.message || error.message || 'Error fetching product group products');
      setTableData([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductGroupProducts();
    }
  }, [id]);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    const filteredRows = tableData.filter((row) => {
      const product = row.product || {};
      return (
        product.sku?.toLowerCase().includes(searchValue) ||
        product.ProductName?.toLowerCase().includes(searchValue) ||
        product.pricingGroup?.name?.toLowerCase().includes(searchValue) ||
        product.commerceCategoriesOne?.name?.toLowerCase().includes(searchValue) ||
        product.type?.toLowerCase().includes(searchValue) ||
        row.packType?.toLowerCase().includes(searchValue)
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

  const handleClick = (event, itemId) => {
    const selectedIndex = selected.indexOf(itemId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, itemId);
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

  const isSelected = (itemId) => selected.indexOf(itemId) !== -1;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const theme = useTheme();
  const borderColor = theme.palette.divider;

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    itemId: null,
    productName: '',
    isDeleting: false
  });

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      itemId: null,
      productName: '',
      isDeleting: false
    });
  };

  const handleRemoveClick = (event, itemId, productName) => {
    event.stopPropagation();
    setDeleteDialog({
      open: true,
      itemId,
      productName,
      isDeleting: false
    });
  };

  // Remove product from product group
  const handleRemoveFromGroup = async () => {
    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

      const res = await axiosInstance.delete(
        `/product-group/remove-product-from-product-group/${id}/${deleteDialog.itemId}`
      );

      // console.log("removed product from group", res.data);

      if (res.data.statusCode === 200) {
        // Remove product from local state
        setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
        setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));

        // Update product group info
        if (productGroupInfo) {
          setProductGroupInfo(prev => ({
            ...prev,
            products: prev.products.filter(item => item._id !== deleteDialog.itemId)
          }));
        }

        handleDeleteCancel();
      }
    } catch (error) {
      console.error('Error removing product from group:', error);
      setError(error.response?.data?.message || error.message || 'Error removing product from group');
    } finally {
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Edit product
  const handleEditProduct = (productId) => {
    navigate(`/dashboard/products/edit/${productId}`);
  };

  // Back to product groups list
  const handleBack = () => {
    navigate('/dashboard/productGroup/list');
  };

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5,
    backgroundColor: '#ffffff',
  };

  // Column widths for better layout
  const columnWidths = {
    actions: { minWidth: '120px' },
    image: { minWidth: '100px' },
    sku: { minWidth: '150px' },
    ProductName: { minWidth: '250px' },
    packType: { minWidth: '150px' },
    packQuantity: { minWidth: '100px' },
    unitsQuantity: { minWidth: '100px' },
    eachPrice: { minWidth: '100px' },
    type: { minWidth: '150px' },
    stockLevel: { minWidth: '100px' },
    pricingGroup: { minWidth: '180px' },
    brand: { minWidth: '180px' },
    createdAt: { minWidth: '150px' },
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading product group products...</Typography>
      </Box>
    );
  }
  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Product Kits Products List',
    },
  ];

  return (
    <Box>
      <Breadcrumb title="Product Kits Products List" items={BCrumb} />
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder="Search Products in Group"
          productGroupInfo={productGroupInfo}
          onBack={handleBack}
        />

        <Paper variant="outlined" sx={{ mx: 2, mt: 1, border: `1px solid ${borderColor}` }}>
          <TableContainer>
            <Table
              sx={{
                minWidth: 1500,
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
                    const product = row.product || {};

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
                        <TableCell sx={{ ...columnWidths.actions, ...stickyCellStyle }}>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Edit Product">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditProduct(product._id)}
                              >
                                <IconEdit size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove from Group">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => handleRemoveClick(e, row._id, product.ProductName)}
                              >
                                <IconTrash size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>

                        {/* Product Image */}
                        <TableCell sx={columnWidths.image}>
                          <Box
                            component="img"
                            src={product.thumbnailUrl || product.images || '/default-product.png'}
                            alt={product.ProductName}
                            onError={(e) => {
                              e.target.src = '/default-product.png';
                            }}
                            sx={{
                              width: 60,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid #e0e0e0'
                            }}
                          />
                        </TableCell>

                        {/* SKU */}
                        <TableCell sx={columnWidths.sku}>
                          <Typography fontWeight="600" variant="body2">
                            {product.sku || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Product Name */}
                        <TableCell sx={columnWidths.ProductName}>
                          <Typography fontWeight="500">
                            {product.ProductName || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Pack Type */}
                        <TableCell sx={columnWidths.packType}>
                          <Chip
                            label={row.packType || 'N/A'}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>

                        {/* Pack Quantity */}
                        <TableCell align="center" sx={columnWidths.packQuantity}>
                          <Typography fontWeight="600">
                            {row.packQuantity || 0}
                          </Typography>
                        </TableCell>

                        {/* Units Quantity */}
                        <TableCell align="center" sx={columnWidths.unitsQuantity}>
                          <Typography fontWeight="600" color="primary">
                            {row.unitsQuantity || 0}
                          </Typography>
                        </TableCell>

                        {/* Price */}
                        <TableCell align="center" sx={columnWidths.eachPrice}>
                          <Typography fontWeight="600">
                            ${product.eachPrice ? parseFloat(product.eachPrice).toFixed(2) : '0.00'}
                          </Typography>
                        </TableCell>

                        {/* Type */}
                        <TableCell sx={columnWidths.type}>
                          <Typography fontWeight="600">
                            {product.type || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Stock Level */}
                        <TableCell align="center" sx={columnWidths.stockLevel}>
                          <Chip
                            label={product.stockLevel || 0}
                            size="small"
                            color={product.stockLevel > 50 ? 'success' : product.stockLevel > 0 ? 'warning' : 'error'}
                          />
                        </TableCell>

                        {/* Pricing Group */}
                        <TableCell sx={columnWidths.pricingGroup}>
                          <Typography variant="body2">
                            {product.pricingGroup?.name || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Brand */}
                        <TableCell sx={columnWidths.brand}>
                          <Typography variant="body2">
                            {product.commerceCategoriesOne?.map((cat) => cat.name).join(', ') || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Created Date */}
                        <TableCell sx={columnWidths.createdAt}>
                          <Typography variant="body2">
                            {product.createdAt ? format(new Date(product.createdAt), 'E, MMM d yyyy') : 'N/A'}
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
                {rows.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={headCells.length + 2} align="center" sx={{ py: 3 }}>
                      <Typography variant="h6" color="textSecondary">
                        {search ? 'No products found matching your search' : 'No products in this group'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 30, 50, 100]}
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
        onConfirm={handleRemoveFromGroup}
        itemName={deleteDialog.productName}
        isDeleting={deleteDialog.isDeleting}
        itemType={"Product from Group"}
        actionText="Remove"
        message="Are you sure you want to remove this product from the product group?"
      />
    </Box>
  );
};

export default ListProductGroupProducts;