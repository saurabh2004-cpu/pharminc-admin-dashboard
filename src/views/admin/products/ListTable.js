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
  Dialog,
  Backdrop,
  CircularProgress,
  DialogTitle,
  DialogContent,
  FormControl,
  Select,
  MenuItem,
  DialogActions,
  Chip,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
// import CustomSwitch from '../../../forms/theme-elements/CustomSwitch';
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit, IconDownload } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';
import { IconCheck, IconX } from '@tabler/icons';

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
    onExportAll,
    onExportByCategories
  } = props;

  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get(
        '/products/export-products',
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "product_list.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  return (
    <>
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
            <Tooltip title="Export Options">
              <Button
                size="small"
                variant="outlined"
                onClick={() => setExportDialogOpen(true)}
                startIcon={<IconDownload size="1.1rem" />}
              >
                Export
              </Button>
            </Tooltip>
          </>
        )}
      </Toolbar>

      {/* Export Options Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Products</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Choose how you want to export products:
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <Button
              variant="outlined"
              onClick={() => {
                handleExportCSV();
                setExportDialogOpen(false);
              }}
              startIcon={<IconDownload size="1.1rem" />}
            >
              Export All Products
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                onExportByCategories();
                setExportDialogOpen(false);
              }}
              startIcon={<IconDownload size="1.1rem" />}
              sx={{ backgroundColor: '#2E2F7F' }}
            >
              Export by Categories
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const ListTable = ({
  showCheckBox,
  headCells,
  tableData,
  isProductsList = true,
  isBrandsList = true,
  setTableData
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

  const sourceData = tableData || [];
  const [rows, setRows] = useState(sourceData);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const [exportCategoriesDialogOpen, setExportCategoriesDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoriesTwo, setSubCategoriesTwo] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSubCategoryTwo, setSelectedSubCategoryTwo] = useState('');
  const [togglingProductId, setTogglingProductId] = useState(null);



  const handleToggleProductStatus = async (productId, currentStatus) => {
    try {
      setTogglingProductId(productId);

      const response = await axiosInstance.post('/products/change-product-status', {
        productId: productId
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.statusCode === 200) {
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === productId ? { ...item, inactive: !item.inactive } : item
          )
        );

        // Update the rows with the new status
        setRows((prevRows) =>
          prevRows.map((item) =>
            item._id === productId ? { ...item, inactive: !item.inactive } : item
          )
        );
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
    } finally {
      setTogglingProductId(null);
    }
  };


  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get(
        '/products/export-products',
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "product_list.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };


  // Fetch brands for export dialog
  const fetchBrands = async () => {
    try {
      const response = await axiosInstance.get('/brand/get-brands-list');
      if (response.data.statusCode === 200) {
        setBrands(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  // Fetch categories based on selected brand
  const fetchCategories = async (brandId) => {
    if (!brandId) {
      setCategories([]);
      return;
    }
    try {
      const response = await axiosInstance.get(`/category/get-categories-by-brand-id/${brandId}`);
      if (response.data.statusCode === 200) {
        setCategories(response.data.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // Fetch subcategories based on selected category
  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await axiosInstance.get(`/subcategory/get-sub-categories-by-category-id/${categoryId}`);
      if (response.data.statusCode === 200) {
        setSubCategories(response.data.data);
      } else {
        setSubCategories([]);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubCategories([]);
    }
  };

  // Fetch subcategories two based on selected subcategory
  const fetchSubCategoriesTwo = async (subCategoryId) => {
    if (!subCategoryId) {
      setSubCategoriesTwo([]);
      return;
    }
    try {
      const response = await axiosInstance.get(`/subcategoryTwo/get-sub-categories-two-by-category-id/${subCategoryId}`);
      if (response.data.statusCode === 200) {
        setSubCategoriesTwo(response.data.data);
      } else {
        setSubCategoriesTwo([]);
      }
    } catch (error) {
      console.error('Error fetching subcategories two:', error);
      setSubCategoriesTwo([]);
    }
  };

  // Handle brand change in export dialog
  const handleBrandChange = (event) => {
    const brandId = event.target.value;
    setSelectedBrand(brandId);
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedSubCategoryTwo('');
    setCategories([]);
    setSubCategories([]);
    setSubCategoriesTwo([]);
    if (brandId) {
      fetchCategories(brandId);
    }
  };

  // Handle category change in export dialog
  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    setSelectedSubCategory('');
    setSelectedSubCategoryTwo('');
    setSubCategories([]);
    setSubCategoriesTwo([]);
    if (categoryId) {
      fetchSubCategories(categoryId);
    }
  };

  // Handle subcategory change in export dialog
  const handleSubCategoryChange = (event) => {
    const subCategoryId = event.target.value;
    setSelectedSubCategory(subCategoryId);
    setSelectedSubCategoryTwo('');
    setSubCategoriesTwo([]);
    if (subCategoryId) {
      fetchSubCategoriesTwo(subCategoryId);
    }
  };

  // Handle subcategory two change in export dialog
  const handleSubCategoryTwoChange = (event) => {
    setSelectedSubCategoryTwo(event.target.value);
  };

  // Export products by selected categories
  const handleExportByCategories = async () => {
    setExportLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedBrand) params.append('brandId', selectedBrand);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedSubCategory) params.append('subCategoryId', selectedSubCategory);
      if (selectedSubCategoryTwo) params.append('subCategoryTwoId', selectedSubCategoryTwo);

      const response = await axiosInstance.get(
        `/products/export-products-by-categories?${params.toString()}`,
        { responseType: 'blob' }
      );

      // Generate filename from response headers or create custom one
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'products_export.csv';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close dialog and reset selections
      setExportCategoriesDialogOpen(false);
      resetExportSelections();

    } catch (error) {
      console.error("Error exporting products by categories:", error);
    } finally {
      setExportLoading(false);
    }
  };

  // Reset export selections
  const resetExportSelections = () => {
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedSubCategoryTwo('');
    setCategories([]);
    setSubCategories([]);
    setSubCategoriesTwo([]);
  };

  // Open export by categories dialog
  const handleOpenExportByCategories = () => {
    setExportCategoriesDialogOpen(true);
    fetchBrands();
  };

  // Close export by categories dialog
  const handleCloseExportByCategories = () => {
    setExportCategoriesDialogOpen(false);
    resetExportSelections();
  };


  // Define column widths for products table
  const columnWidths = {
    serial: { minWidth: '80px' },
    sku: { minWidth: '150px' },
    productName: { minWidth: '280px' },
    stockLevel: { minWidth: '160px' },
    pricingGroup: { minWidth: '220px' },
    brand: { minWidth: '220px' },
    category: { minWidth: '220px' },
    subCategory: { minWidth: '220px' },
    storeDescription: { minWidth: '300px' },
    pageTitle: { minWidth: '300px' },
    eachBarcodes: { minWidth: '150px' },
    packBarcodes: { minWidth: '150px' },
    createdAt: { minWidth: '160px' },
    actions: { minWidth: '160px' },
  };

  useEffect(() => {
    let baseData = isBrandsList ? sourceData : filteredAndSortedProducts;

    if (search) {
      const searchValue = search.toLowerCase();
      const filteredRows = baseData.filter((row) => {
        const values = [
          ...Object.values(row).map((val) => (typeof val === "object" ? "" : String(val))),
          row.pricingGroup?.name,
          row.commerceCategoriesOne?.name,
          row.commerceCategoriesTwo?.name,
          row.commerceCategoriesThree?.name,
          row.commerceCategoriesFour?.name,
          format(new Date(row.createdAt), "E, MMM d yyyy"), // also searchable date
        ];

        return values.some((val) =>
          String(val || "")
            .toLowerCase()
            .includes(searchValue)
        );
      });
      setRows(filteredRows);
    } else {
      setRows(baseData);
    }
  }, [sourceData, filteredAndSortedProducts, isBrandsList, search]);


  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    let baseData = isBrandsList ? sourceData : filteredAndSortedProducts;

    if (searchValue) {
      const filteredRows = baseData.filter((row) => {
        // Helper function to search in a value
        const searchInValue = (value) => {
          if (!value) return false;

          // Handle arrays
          if (Array.isArray(value)) {
            return value.some(item =>
              item?.toString().toLowerCase().includes(searchValue)
            );
          }

          // Handle objects - search through all properties
          if (typeof value === 'object') {
            return Object.values(value).some(val =>
              searchInValue(val)
            );
          }

          // Handle primitive values
          return value.toString().toLowerCase().includes(searchValue);
        };

        // Check all relevant fields
        return (
          // SKU and Product Identification
          searchInValue(row.sku) ||
          searchInValue(row.itemSku) ||
          searchInValue(row.productCode) ||
          searchInValue(row.productId) ||

          // Product Names and Titles
          searchInValue(row.title) ||
          searchInValue(row.productName) ||
          searchInValue(row.name) ||
          searchInValue(row.displayName) ||

          // Product Type and Classification
          searchInValue(row.type) ||
          searchInValue(row.productType) ||
          searchInValue(row.category) ||

          // Pricing Information
          searchInValue(row.pricingGroup) ||
          searchInValue(row.priceGroup) ||
          searchInValue(row.costGroup) ||

          // Commerce Categories
          searchInValue(row.commerceCategoryOne) ||
          searchInValue(row.commerceCategoryTwo) ||
          searchInValue(row.commerceCategoryThree) ||
          searchInValue(row.commerceCategoryFour) ||
          searchInValue(row.categoryOne) ||
          searchInValue(row.categoryTwo) ||
          searchInValue(row.categoryThree) ||
          searchInValue(row.categoryFour) ||

          // Barcodes
          searchInValue(row.barcode) ||
          searchInValue(row.barcodes) ||
          searchInValue(row.eachBarcode) ||
          searchInValue(row.eachBarcodes) ||
          searchInValue(row.packBarcode) ||
          searchInValue(row.packBarcodes) ||
          searchInValue(row.ean) ||
          searchInValue(row.upc) ||
          searchInValue(row.gtin) ||
          searchInValue(row.isbn) ||

          // Additional Product Details
          searchInValue(row.description) ||
          searchInValue(row.brand) ||
          searchInValue(row.manufacturer) ||
          searchInValue(row.supplier) ||
          searchInValue(row.supplierCode) ||
          searchInValue(row.vendor) ||

          // Search in nested objects (if your data structure has them)
          (row.commerceCategories && searchInValue(row.commerceCategories)) ||
          (row.categories && searchInValue(row.categories)) ||
          (row.barcodeData && searchInValue(row.barcodeData))
        );
      });

      setRows(filteredRows);
    } else {
      setRows(baseData);
    }
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
      const res = await axiosInstance.delete(`/products/delete-product/${deleteDialog.itemId}`);

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
    navigate(`/dashboard/products/edit/${id}`);
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
          placeholder={isBrandsList ? "Search Product" : "Search Product"}
          onExportAll={handleExportCSV}
          onExportByCategories={handleOpenExportByCategories}
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
              <TableBody>
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
                            <TableCell sx={{ ...columnWidths.actions, ...stickyCellStyle }} >
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit">
                                  <IconButton size="small" color="primary" onClick={() => handleEdit(row._id)}>
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(e) => handleDeleteClick(e, row._id, row.ProductName)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>

                            <TableCell
                              sx={{ ...columnWidths.sku, cursor: "pointer" }}
                              onClick={() => handleEdit(row._id)}
                            >
                              <Box display="flex" alignItems="center" >
                                <Box>
                                  <img
                                    src={row.images}
                                    alt={row.sku}
                                    style={{ width: "70px", height: "70px", objectFit: "cover" }}
                                  />
                                </Box>

                              </Box>
                            </TableCell>


                            <TableCell sx={{ ...columnWidths.sku, cursor: "pointer" }} onClick={() => handleEdit(row._id)}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="500" variant="subtitle2">
                                    {row.sku}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.productName}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400" variant="body2">
                                    {row.ProductName}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.stockLevel}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400" variant="body2">
                                    {row.eachPrice || ''}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.stockLevel}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400" variant="body2">
                                    {row.comparePrice || ''}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.stockLevel}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400" variant="body2">
                                    {row.type || ''}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.stockLevel}>
                              <Box display="flex" alignItems="center">
                                <Box sx={{ ml: 10 }}>
                                  <Typography fontWeight="400">
                                    {row.stockLevel}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.pricingGroup}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400">
                                    {row.pricingGroup?.name || 'ANY'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.brand}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400">
                                    {row.commerceCategoriesOne?.name || 'ANY'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.category}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400">
                                    {row.commerceCategoriesTwo?.name || 'ANY'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.subCategory}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400">
                                    {row.commerceCategoriesThree?.name || 'ANY'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.subCategory}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400">
                                    {row.commerceCategoriesFour?.name || 'ANY'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.subCategory}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400">
                                    {row?.badge?.name || 'ANY'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.storeDescription}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400" variant="body2">
                                    {row.storeDescription ?
                                      row.storeDescription.replace(/<[^>]*>/g, '').substring(0, 50) + '...' :
                                      'No description'
                                    }
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.pageTitle}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400">
                                    {row.pageTitle || ''}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.eachBarcodes}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400">
                                    {row.eachBarcodes || ''}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.packBarcodes}>
                              <Box display="flex" alignItems="center">
                                <Box>
                                  <Typography fontWeight="400">
                                    {row.packBarcodes || ''}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell sx={columnWidths.packBarcodes}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Tooltip title={row.inactive ? "Click to activate" : "Click to deactivate"}>
                                  <Box
                                    onClick={() => handleToggleProductStatus(row._id, row.inactive)}
                                    sx={{
                                      cursor: togglingProductId === row._id ? 'wait' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      opacity: togglingProductId === row._id ? 0.6 : 1,
                                      transition: 'all 0.3s ease',
                                    }}
                                  >
                                    {togglingProductId === row._id ? (
                                      <CircularProgress size={20} />
                                    ) : (
                                      <Chip
                                        label={row.inactive ? 'Inactive' : 'Active'}
                                        color={row.inactive ? 'error' : 'success'}
                                        variant="filled"
                                        icon={row.inactive ? <IconX size={16} /> : <IconCheck size={16} />}
                                        sx={{
                                          cursor: 'pointer',
                                          '&:hover': {
                                            opacity: 0.8,
                                            transform: 'scale(1.05)',
                                          },
                                          transition: 'all 0.2s ease',
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Tooltip>
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

      {/* Export by Categories Dialog */}
      <Dialog
        open={exportCategoriesDialogOpen}
        onClose={handleCloseExportByCategories}
        maxWidth="md"
        fullWidth
      >
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            position: 'absolute',
            borderRadius: 1
          }}
          open={exportLoading}
        >
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress color="inherit" size={50} />
            <Typography variant="body2" color="inherit">
              Exporting products, please wait...
            </Typography>
          </Box>
        </Backdrop>

        <DialogTitle>
          Export Products by Categories
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Select categories to filter products for export. Leave all fields empty to export all products.
          </Typography>

          <Box display="flex" flexDirection="column" gap={3}>
            {/* Brand Selection */}
            <FormControl fullWidth>
              <Typography variant="subtitle2" gutterBottom>
                Brand (Commerce Category Level 1)
              </Typography>
              <Select
                value={selectedBrand}
                onChange={handleBrandChange}
                displayEmpty
                disabled={exportLoading}
              >
                <MenuItem value="">All Brands</MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand._id} value={brand._id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Category Selection */}
            <FormControl fullWidth>
              <Typography variant="subtitle2" gutterBottom>
                Category (Commerce Category Level 2)
              </Typography>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                displayEmpty
                disabled={exportLoading || !selectedBrand}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* SubCategory Selection */}
            <FormControl fullWidth>
              <Typography variant="subtitle2" gutterBottom>
                Sub Category (Commerce Category Level 3)
              </Typography>
              <Select
                value={selectedSubCategory}
                onChange={handleSubCategoryChange}
                displayEmpty
                disabled={exportLoading || !selectedCategory}
              >
                <MenuItem value="">All Sub Categories</MenuItem>
                {subCategories.map((subCategory) => (
                  <MenuItem key={subCategory._id} value={subCategory._id}>
                    {subCategory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* SubCategory Two Selection */}
            <FormControl fullWidth>
              <Typography variant="subtitle2" gutterBottom>
                Sub Category Two (Commerce Category Level 4)
              </Typography>
              <Select
                value={selectedSubCategoryTwo}
                onChange={handleSubCategoryTwoChange}
                displayEmpty
                disabled={exportLoading || !selectedSubCategory}
              >
                <MenuItem value="">All Sub Categories Two</MenuItem>
                {subCategoriesTwo.map((subCategoryTwo) => (
                  <MenuItem key={subCategoryTwo._id} value={subCategoryTwo._id}>
                    {subCategoryTwo.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseExportByCategories}
            disabled={exportLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExportByCategories}
            variant="contained"
            disabled={exportLoading}
            startIcon={exportLoading ? <CircularProgress size={16} color="inherit" /> : <IconDownload size="1.1rem" />}
            sx={{ backgroundColor: '#2E2F7F' }}
          >
            {exportLoading ? 'Exporting...' : 'Export Products'}
          </Button>
        </DialogActions>
      </Dialog>


      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDelete}
        itemName={deleteDialog.itemName}
        isDeleting={deleteDialog.isDeleting}
        itemType={"Products"}
      />
    </Box>
  );
};

export default ListTable;