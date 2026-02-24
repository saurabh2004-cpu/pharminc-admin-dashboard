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
  Avatar,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit, IconEye } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
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

  // Column width configuration
  const columnWidths = {
    actions: { minWidth: '120px', maxWidth: '120px' },
    thumbnail: { minWidth: '100px', maxWidth: '100px' },
    name: { minWidth: '200px', maxWidth: '200px' },
    slug: { minWidth: '180px', maxWidth: '180px' },
    productsCount: { minWidth: '160px', maxWidth: '160px' },
    commerceCategoriesOne: { minWidth: '180px', maxWidth: '180px' },
    commerceCategoriesTwo: { minWidth: '180px', maxWidth: '180px' },
    commerceCategoriesThree: { minWidth: '180px', maxWidth: '180px' },
    commerceCategoriesFour: { minWidth: '180px', maxWidth: '180px' },
    eachPrice: { minWidth: '120px', maxWidth: '120px' },
    price: { minWidth: '120px', maxWidth: '120px' },
    taxable: { minWidth: '100px', maxWidth: '100px' },
    updatedAt: { minWidth: '150px', maxWidth: '150px' },
  };

  return (
    <TableHead>
      <TableRow>
        {showCheckBox && (
          <TableCell padding="checkbox" sx={{ minWidth: '60px', maxWidth: '60px' }}>
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
        <TableCell sx={{ ...stickyCellStyle, ...columnWidths.actions }}>
          Actions
        </TableCell>

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.key || headCell.id}
            align={headCell.numeric ? 'left' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ ...headCellStyle, ...columnWidths[headCell.id], userSelect: 'text', }}
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

        {/* Last Updated Date column */}
        <TableCell sx={{ ...headCellStyle, ...columnWidths.updatedAt }}>
          Last Updated Date
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

const EnhancedTableToolbar = (props) => {
  const { numSelected, handleSearch, search, placeholder } = props;

  const navigate = useNavigate();

  const handleCreateProductGroup = () => {
    navigate('/dashboard/product-groups/create');
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
            placeholder={placeholder || "Search Product Groups"}
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
        </>
      )}
    </Toolbar>
  );
};

const ListProductGroup = () => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, rowsPerPage]);

  // Corrected headCells based on API response
  const headCells = [
    {
      id: 'thumbnail',
      label: 'Thumbnail',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'sku',
      label: 'SKU',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'name',
      label: 'Group Name',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'slug',
      label: 'Slug',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'productsCount',
      label: 'Products Count',
      numeric: true,
      disablePadding: false,
    },
    {
      id: 'commerceCategoriesOne',
      label: 'commerce Categories One',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'commerceCategoriesTwo',
      label: 'Commerce Categories Two',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'commerceCategoriesThree',
      label: 'Commerce Categories Three',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'commerceCategoriesFour',
      label: 'Commerce Categories Four',
      numeric: false,
      disablePadding: false,
    },
    {
      id: 'eachPrice',
      label: 'Each Price',
      numeric: true,
      disablePadding: false,
    },

    {
      id: 'taxable',
      label: 'Taxable',
      numeric: false,
      disablePadding: false,
    },
  ];

  // Column width configuration for table body
  const columnWidths = {
    sku: { minWidth: '100px', maxWidth: '200px' },
    actions: { minWidth: '120px', maxWidth: '120px' },
    thumbnail: { minWidth: '100px', maxWidth: '100px' },
    name: { minWidth: '100px', maxWidth: '300px' },
    slug: { minWidth: '200px', maxWidth: '300px' },
    productsCount: { minWidth: '150px', maxWidth: '180px' },
    commerceCategoriesOne: { minWidth: '250px', maxWidth: '300px' },
    commerceCategoriesTwo: { minWidth: '250px', maxWidth: '300px' },
    commerceCategoriesThree: { minWidth: '250px', maxWidth: '300px' },
    commerceCategoriesFour: { minWidth: '250px', maxWidth: '300px' },
    eachPrice: { minWidth: '120px', maxWidth: '120px' },
    price: { minWidth: '120px', maxWidth: '120px' },
    taxable: { minWidth: '100px', maxWidth: '100px' },
    updatedAt: { minWidth: '150px', maxWidth: '150px' },
  };

  // Fetch product groups
  const fetchProductGroups = async () => {
    try {
      setError('');
      const response = await axiosInstance.get('/product-group/get-all-product-groups');
      // console.log("response product groups", response);

      if (response.data.statusCode === 200) {
        setTableData(response.data.data);
        setRows(response.data.data);
      } else {
        setError('Failed to fetch product groups');
      }
    } catch (error) {
      console.error('Error fetching product groups:', error);
      setError(error.response?.data?.message || error.message || 'Error fetching product groups');
      setTableData([]);
      setRows([]);
    }
  };

  useEffect(() => {
    fetchProductGroups();
  }, []);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    const filteredRows = tableData.filter((row) => {
      return (
        row.sku?.toLowerCase().includes(searchValue) ||
        row?.name?.toLowerCase().includes(searchValue) ||
        row?.slug?.toLowerCase().includes(searchValue) ||
        row?.eachPrice?.toString().includes(searchValue) ||
        row?.price?.toString().includes(searchValue) ||
        row?.commerceCategoriesOne?.name?.toLowerCase().includes(searchValue) ||
        row?.commerceCategoriesTwo?.name?.toLowerCase().includes(searchValue) ||
        row?.commerceCategoriesThree?.name?.toLowerCase().includes(searchValue) ||
        row?.commerceCategoriesFour?.name?.toLowerCase().includes(searchValue)
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

  const isSelected = (id) => selected.indexOf(id) !== -1;

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

  // Delete product group
  const handleDeleteProductGroup = async () => {
    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

      const res = await axiosInstance.delete(`/product-group/delete-product-group/${deleteDialog.itemId}`);
      // console.log("deleted product group", res.data);

      if (res.data.statusCode === 200) {
        setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
        setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));
        handleDeleteCancel();
      }
    } catch (error) {
      console.error('Error deleting product group:', error);
      setError(error.response?.data?.message || error.message || 'Error deleting product group');
    } finally {
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Edit product group
  const handleEditProductGroup = (id) => {
    navigate(`/dashboard/productGroup/edit/${id}`);
  };

  // View product group details
  const handleViewProductGroup = (id) => {
    navigate(`/dashboard/productGroup/products/${id}`);
  };

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5,
    backgroundColor: '#ffffff',
    ...columnWidths.actions
  };

  const BCrumb = [
    {
      to: '/',
      title: 'Home',
    },
    {
      title: 'Create Product Kit',
    },
  ];

  return (
    <Box>
      <Breadcrumb title="Create Product Kit" items={BCrumb} />
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder="Search Product Groups"
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
                    const productsCount = row.products ? (Array.isArray(row.products) ? row.products.length : 0) : 0;

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
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleViewProductGroup(row._id)}
                              >
                                <IconEye size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditProductGroup(row._id)}
                              >
                                <IconEdit size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => handleDeleteClick(e, row._id, row.name)}
                              >
                                <IconTrash size="1.1rem" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>

                        {/* Thumbnail */}
                        <TableCell sx={columnWidths.thumbnail}>
                          <Box display="flex" alignItems="center" >
                            <Box>
                              <img
                                src={row.thumbnailUrl}
                                alt={row.sku}
                                style={{ width: "70px", height: "70px", objectFit: "cover" }}
                              />
                            </Box>

                          </Box>
                        </TableCell>

                        <TableCell sx={columnWidths.sku}>
                          <Typography
                            fontWeight="500"
                            variant="body1"
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                color: 'primary.main'
                              }
                            }}
                            onClick={() => handleViewProductGroup(row._id)}
                          >
                            {row.sku || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Group Name */}
                        <TableCell sx={columnWidths.name}>
                          <Typography
                            fontWeight="500"
                            variant="body1"
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                color: 'primary.main'
                              }
                            }}
                            onClick={() => handleViewProductGroup(row._id)}
                          >
                            {row.name || 'N/A'}
                          </Typography>
                        </TableCell>


                        {/* Slug */}
                        <TableCell sx={columnWidths.slug}>
                          <Typography variant="body2" color="textSecondary">
                            {row.slug || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Products Count */}
                        <TableCell align="center" sx={columnWidths.productsCount}>
                          <Typography fontWeight="600">
                            {productsCount}
                          </Typography>
                        </TableCell>

                        {/* Commerce Category One (Brand) */}
                        <TableCell sx={columnWidths.commerceCategoriesOne}>
                          <Typography variant="body2">
                            {row?.commerceCategoriesOne?.map((category) => category.name).join(', ') || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Commerce Category Two (Category) */}
                        <TableCell sx={columnWidths.commerceCategoriesTwo}>
                          <Typography variant="body2">
                            {row?.commerceCategoriesTwo?.map((category) => category.name).join(', ') || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Commerce Category Three (Sub Category) */}
                        <TableCell sx={columnWidths.commerceCategoriesThree}>
                          <Typography variant="body2">
                            {row?.commerceCategoriesThree?.map((category) => category.name).join(', ') || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Commerce Category Four (Sub Sub Category) */}
                        <TableCell sx={columnWidths.commerceCategoriesFour}>
                          <Typography variant="body2">
                            {row?.commerceCategoriesFour?.map((category) => category.name).join(', ') || 'N/A'}
                          </Typography>
                        </TableCell>

                        {/* Each Price */}
                        <TableCell align="center" sx={columnWidths.eachPrice}>
                          <Typography fontWeight="500">
                            ${row.eachPrice ? parseFloat(row.eachPrice).toFixed(2) : '0.00'}
                          </Typography>
                        </TableCell>



                        {/* Taxable */}
                        <TableCell align="center" sx={columnWidths.taxable}>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor: row.taxable ? '#e8f5e8' : '#ffebee',
                              color: row.taxable ? '#2e7d32' : '#d32f2f',
                              fontWeight: 500,
                              fontSize: '0.75rem'
                            }}
                          >
                            {row.taxable ? 'Taxable' : 'Non-Taxable'}
                          </Box>
                        </TableCell>

                        {/* Last Updated Date */}
                        <TableCell sx={columnWidths.updatedAt}>
                          <Typography variant="body2">
                            {row.updatedAt ? format(new Date(row.updatedAt), 'E, MMM d yyyy') : 'N/A'}
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
                    <TableCell colSpan={headCells.length + 2} align="center" sx={{ py: 3 }}>
                      <Typography variant="h6" color="textSecondary">
                        {search ? 'No product groups found matching your search' : 'No product groups found'}
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

      {/* Show error if any */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      )}

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteProductGroup}
        itemName={deleteDialog.itemName}
        isDeleting={deleteDialog.isDeleting}
        itemType={"Product Group"}
      />
    </Box>
  );
};

export default ListProductGroup;