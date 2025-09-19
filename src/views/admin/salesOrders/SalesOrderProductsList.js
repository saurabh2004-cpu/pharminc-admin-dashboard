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
    Grid,
    Divider,
    MenuItem,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit, IconPlus } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
import ProductSelectionModal from './ProductSelectionModal'; // Import the modal
import { use } from 'react';

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
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, headCells } = props;
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
    const { numSelected, handleSearch, search, placeholder, onAddProduct } = props;

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
                    <Tooltip title="Add Product">
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<IconPlus size="1rem" />}
                            onClick={onAddProduct}
                        >
                            Product
                        </Button>
                    </Tooltip>
                </>
            )}
        </Toolbar>
    );
};

const CustomersSalesOrders = () => {
    const { filteredAndSortedProducts } = useContext(ProductContext);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(30);
    const [tableData, setTableData] = React.useState([]);
    const [error, setError] = useState('');
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState('');
    const [showProductModal, setShowProductModal] = useState(false); // Modal state
    const navigate = useNavigate();
    const { documentNo } = useParams();
    const [productList, setProductList] = useState([]);

    // Define headCells for the table
    const headCells = [
        {
            id: 'sku',
            numeric: false,
            disablePadding: false,
            label: 'SKU',
        },
        {
            id: 'amount',
            numeric: false,
            disablePadding: false,
            label: 'Amount',
        },

        {
            id: 'packQuantity',
            numeric: false,
            disablePadding: false,
            label: 'Pack Quantity',
        },
        {
            id: 'unitsQuantity',
            numeric: false,
            disablePadding: false,
            label: 'Units Quantity',
        },
    ];

    // Inside CustomersSalesOrders component

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        customerName: tableData[0]?.customerName || "",
        salesChannel: "",
        itemSku: "",
        packQuantity: "",
        amount: "",
        billingAddress: {},
        shippingAddress: {},
        trackingNumber: "",
        date: "",
    });
    const [loading, setLoading] = useState(false);
    const [editingRowId, setEditingRowId] = useState(null);  // Track which row is being edited
    const [packTypes, setPackTypes] = useState([]);

    // Update form data to handle individual row updates
    const [updateFormData, setUpdateFormData] = React.useState({});

    useEffect(() => {
        if (tableData[0]) {
            setFormData({
                customerName: tableData[0]?.customerName || "",
                salesChannel: tableData[0]?.salesChannel || "",
                itemSku: tableData[0]?.itemSku || "",
                packQuantity: tableData[0]?.packQuantity || "",
                amount: tableData[0]?.amount || "",
                billingAddress: tableData[0]?.billingAddress || "",
                shippingAddress: tableData[0]?.shippingAddress || "",
                trackingNumber: tableData[0]?.trackingNumber || "",
                date: tableData[0]?.date
                    ? new Date(tableData[0].date).toISOString().split("T")[0]
                    : "",
            });
        }
    }, [tableData]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // ✅ your validation logic here
        if (!formData.customerName.trim()) return setError("Customer name is required");
        if (!formData.salesChannel.trim()) return setError("Sales channel is required");
        if (!formData.itemSku.trim()) return setError("Item SKU is required");
        if (!formData.packQuantity || formData.packQuantity <= 0)
            return setError("Pack quantity is required");
        if (!formData.amount) return setError("Amount is required");

        setLoading(true);
        setError("");

        try {
            const res = await axiosInstance.put(
                `/sales-order/update-sales-order/${documentNo}`,
                formData,
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("updated sales order response ", res);

            if (res.data.statusCode === 200) {
                setIsEditing(false);
                fetchSalesOrdersProducts(); // refresh
            } else {
                setError(res.data.message || "Update failed");
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };


    const fetchSalesOrdersProducts = async () => {
        try {
            const response = await axiosInstance.get(`/sales-order/get-products-by-sales-document-number/${documentNo}`);
            console.log("response sales order products ", response);

            if (response.data.statusCode === 200) {
                const data = response.data.data;

                const uniqueData = Array.from(
                    new Map(data.map(item => [item.itemSku, item])).values()
                );

                setTableData(uniqueData);
                setRows(uniqueData);
            }
        } catch (error) {
            console.error('Error fetching products by sales order list:', error);
            setError(error.message);
        }
    };

    const fetchProductsList = async () => {
        try {
            const response = await axiosInstance.get('/products/get-all-products');
            console.log("response products", response.data);

            if (response.data.statusCode === 200) {
                const productsData = response.data.data?.docs || response.data.data || response.data;

                // Filter out duplicates based on _id
                const getUniqueProducts = (products) => {
                    if (!Array.isArray(products)) return [];

                    const uniqueProducts = [];
                    const seenIds = new Set();

                    products.forEach(product => {
                        if (product._id && !seenIds.has(product._id)) {
                            seenIds.add(product._id);
                            uniqueProducts.push(product);
                        }
                    });

                    return uniqueProducts;
                };

                setProductList(getUniqueProducts(productsData));
            }

        } catch (error) {
            console.error('Error fetching products list:', error);
            setError(error.message);
        }
    };

    const fetchProductsAvailablePackTypes = async (itemSku) => {
        try {
            const response = await axiosInstance.get(`/products/get-products-pack-types/${itemSku}`);
            console.log("response products pack types", response);

            if (response.status === 200) {
                setPackTypes(response.data.data);
            }

        } catch (error) {
            console.error('Error fetching products pack types:', error);
            setError(error.message);
        }
    };

    React.useEffect(() => {
        fetchProductsList();
    }, []);

    React.useEffect(() => {
        fetchSalesOrdersProducts();
    }, [documentNo]);

    const handleSearch = (event) => {
        const searchValue = event.target.value.toLowerCase();
        setSearch(searchValue);

        const filteredRows = tableData.filter((row) => {
            return (
                row?.itemSku?.toLowerCase().includes(searchValue) ||
                row?.amount?.toString().toLowerCase().includes(searchValue)
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

    // Handle add product button click
    const handleAddProduct = () => {
        setShowProductModal(true);
    };

    // Handle modal close
    const handleCloseModal = () => {
        setShowProductModal(false);
    };

    // Handle successful sales order creation
    const handleSalesOrderCreated = () => {
        // Refresh the data
        fetchSalesOrdersProducts();
    };

    const isSelected = (name) => selected.indexOf(name) !== -1;
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
    const theme = useTheme();
    const borderColor = theme.palette.divider;
    const [rowId, setRowId] = React.useState(null);
    const [billingAddresses, setBillingAddresses] = useState([]);
    const [shippingAddresses, setShippingAddresses] = useState([]);
    const [selectedBillingAddress, setSelectedBillingAddress] = useState('');
    const [selectedShippingAddress, setSelectedShippingAddress] = useState('');



    // Add this function to fetch customer addresses
    const fetchCustomerAddresses = async (customerName) => {
        try {
            const response = await axiosInstance.get(`/admin/customer-addresses/${customerName}`);
            console.log("response customer addresses", response.data);

            if (response.data.statusCode === 200) {
                setBillingAddresses(response.data.data.billingAddresses || []);
                setShippingAddresses(response.data.data.shippingAddresses || []);
            }
        } catch (error) {
            console.error('Error fetching customer addresses:', error);
        }
    };

    useEffect(() => {
        if (formData.customerName) {
            fetchCustomerAddresses(formData.customerName);
        }
    }, [formData.customerName]);

    // Add these handler functions for address selection
    const handleBillingAddressChange = (event) => {
        const addressId = event.target.value;
        setSelectedBillingAddress(addressId);

        const selectedAddress = billingAddresses.find(addr => addr._id === addressId);
        if (selectedAddress) {
            setFormData(prev => ({
                ...prev,
                billingAddress: selectedAddress
            }));
        }
    };

    const handleShippingAddressChange = (event) => {
        const addressId = event.target.value;
        setSelectedShippingAddress(addressId);

        const selectedAddress = shippingAddresses.find(addr => addr._id === addressId);
        if (selectedAddress) {
            setFormData(prev => ({
                ...prev,
                shippingAddress: selectedAddress
            }));
        }
    };

    useEffect(() => {
        if (formData.billingAddress && formData.billingAddress._id) {
            setSelectedBillingAddress(formData.billingAddress._id);
        }
        if (formData.shippingAddress && formData.shippingAddress._id) {
            setSelectedShippingAddress(formData.shippingAddress._id);
        }
    }, [formData.billingAddress, formData.shippingAddress]);


    const handleEditSalesOrder = (order) => {
        setRowId(order._id);
        setEditingRowId(order._id);
        fetchProductsAvailablePackTypes(order.itemSku);

        // Initialize form data for this specific row
        setUpdateFormData({
            date: order?.date || null,
            documentNumber: order.documentNumber || '',
            customerName: order.customerName || '',
            salesChannel: order.salesChannel || '',
            trackingNumber: order.trackingNumber || '',
            shippingAddress: order.shippingAddress || '',
            billingAddress: order.billingAddress || '',
            customerPO: order.customerPO || '',
            itemSku: order.itemSku || '',
            packQuantity: order.packQuantity || 1,
            unitsQuantity: order.unitsQuantity || 0,
            finalAmount: order.finalAmount || 0,
            amount: order.amount || 0,
        });
    };

    const handleDeleteSalesOrder = async (id) => {
        try {
            const res = await axiosInstance.delete(`/sales-order/delete-sales-order/${id}`);

            console.log("deleted", res.data);

            if (res.data.statusCode === 200) {
                setTableData((prevData) => prevData.filter((item) => item._id !== id));
                setRows((prevRows) => prevRows.filter((item) => item._id !== id));
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const stickyCellStyle = {
        position: "sticky",
        left: 0,
        zIndex: 5,
        backgroundColor: '#f0f8ff',
    };

    // Updated handleSaveUpdate function with correct amount calculation
    const handleSaveUpdate = async (rowId) => {
        try {
            setLoading(true);
            setError('');

            // Get the current row data
            const currentRow = rows.find(row => row._id === rowId);
            if (!currentRow) {
                setError('Row not found');
                return;
            }

            // Calculate the new amount based on the formula:
            // First get the unit price: previousAmount / (previousPackQuantity * previousUnitsQuantity)
            // Then calculate new amount: unitPrice * (newPackQuantity * newUnitsQuantity)
            const previousAmount = currentRow.amount || 0;
            const previousPackQuantity = currentRow.packQuantity || 1;
            const previousUnitsQuantity = currentRow.unitsQuantity || 1;

            // Get unit price
            const unitPrice = previousAmount / (previousPackQuantity * previousUnitsQuantity);

            // Calculate new amount with updated quantities
            const newPackQuantity = updateFormData.packQuantity || previousPackQuantity;
            const newUnitsQuantity = updateFormData.unitsQuantity || previousUnitsQuantity;
            const newAmount = unitPrice * (newPackQuantity * newUnitsQuantity);

            const updatedData = {
                ...updateFormData,
                amount: newAmount
            };

            const res = await axiosInstance.put(`/sales-order/update-sales-order-item/${rowId}`, updatedData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Update sales order response:", res);

            if (res.data.statusCode === 200) {
                // Update the rows with the new data
                setRows(prevRows =>
                    prevRows.map(row =>
                        row._id === rowId
                            ? { ...row, ...updatedData, amount: newAmount }
                            : row
                    )
                );

                // Exit edit mode
                setEditingRowId(null);
                setUpdateFormData({});

                // Refresh the data
                fetchSalesOrdersProducts();
            } else {
                setError(res.data.message || 'Update failed');
            }

        } catch (error) {
            console.error('Update sales order error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to update sales order');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (editingRowId && updateFormData.packQuantity !== undefined && updateFormData.unitsQuantity !== undefined) {
            const currentRow = rows.find(row => row._id === editingRowId);
            if (!currentRow) return;

            // Calculate the new amount based on the formula:
            // First get the unit price: previousAmount / (previousPackQuantity * previousUnitsQuantity)
            // Then calculate new amount: unitPrice * (newPackQuantity * newUnitsQuantity)
            const previousAmount = currentRow.amount || 0;
            const previousPackQuantity = currentRow.packQuantity || 1;
            const previousUnitsQuantity = currentRow.unitsQuantity || 1;

            // Get unit price
            const unitPrice = previousAmount / (previousPackQuantity * previousUnitsQuantity);

            // Calculate new amount with updated quantities
            const newPackQuantity = updateFormData.packQuantity || previousPackQuantity;
            const newUnitsQuantity = updateFormData.unitsQuantity || previousUnitsQuantity;
            const newAmount = unitPrice * (newPackQuantity * newUnitsQuantity);

            // Update the form data with the new amount
            setUpdateFormData(prev => ({ ...prev, amount: newAmount }));
        }
    }, [updateFormData.packQuantity, updateFormData.unitsQuantity, editingRowId, rows]);

    // Helper function to update form data for specific fields
    const handleUpdateFormChange = (field, value) => {
        setUpdateFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="h4" component="h1">
                    Order #{documentNo}
                </Typography>
                <Button onClick={() => setIsEditing(true)} variant="contained" color="primary">
                    Edit Order
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Left Side - Products Table */}
                <Grid item xs={12} lg={7}>
                    <Paper variant="outlined" sx={{ border: `1px solid ${borderColor}` }}>
                        <EnhancedTableToolbar
                            numSelected={selected.length}
                            search={search}
                            handleSearch={handleSearch}
                            placeholder="Search products..."
                            onAddProduct={handleAddProduct}
                        />
                        <TableContainer>
                            <Table
                                sx={{
                                    minWidth: 650,
                                    borderCollapse: "collapse",
                                    "& td, & th": {
                                        borderRight: "1px solid rgba(224, 224, 224, 1)",
                                        fontSize: '0.875rem',
                                    },
                                    "& td:last-child, & th:last-child": {
                                        borderRight: "none",
                                    },
                                }}
                                aria-labelledby="tableTitle"
                                size="small"
                            >
                                <EnhancedTableHead
                                    numSelected={selected.length}
                                    order={order}
                                    orderBy={orderBy}
                                    onSelectAllClick={handleSelectAllClick}
                                    onRequestSort={handleRequestSort}
                                    rowCount={rows.length}
                                    headCells={headCells}
                                />
                                <TableBody>
                                    {stableSort(rows, getComparator(order, orderBy))
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => {
                                            const isItemSelected = isSelected(row?.ProductName || row.title);
                                            const isRowEditing = editingRowId === row._id;

                                            return (
                                                <TableRow
                                                    hover
                                                    role="checkbox"
                                                    aria-checked={isItemSelected}
                                                    tabIndex={-1}
                                                    key={row._id || row.title}
                                                    selected={isItemSelected}
                                                >
                                                    {/* Actions Column */}
                                                    <TableCell sx={{ ...stickyCellStyle, width: 100 }}>
                                                        <Box display="flex" gap={0.5}>
                                                            {isRowEditing ? (
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    color="primary"
                                                                    onClick={() => handleSaveUpdate(row._id)}
                                                                    disabled={loading}
                                                                >
                                                                    Save
                                                                </Button>
                                                            ) : (
                                                                <>
                                                                    <Tooltip title="Edit">
                                                                        <IconButton
                                                                            size="small"
                                                                            color="primary"
                                                                            onClick={() => handleEditSalesOrder(row)}
                                                                        >
                                                                            <IconEdit size="1rem" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Delete">
                                                                        <IconButton
                                                                            size="small"
                                                                            color="error"
                                                                            onClick={() => handleDeleteSalesOrder(row._id)}
                                                                        >
                                                                            <IconTrash size="1rem" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </>
                                                            )}
                                                        </Box>
                                                    </TableCell>

                                                    {/* SKU - stays readonly */}
                                                    <TableCell sx={{ width: 120 }}>
                                                        <Typography fontWeight="500" variant="body2">
                                                            {row.itemSku || "N/A"}
                                                        </Typography>
                                                    </TableCell>

                                                    {/* Amount */}
                                                    <TableCell sx={{ width: 100 }}>
                                                        {isRowEditing ? (
                                                            <Typography variant="body2">
                                                                ${updateFormData.amount ? updateFormData.amount.toFixed(2) : row.amount || "0.00"}
                                                            </Typography>
                                                        ) : (
                                                            <Typography variant="body2">${row.amount || "0.00"}</Typography>
                                                        )}
                                                    </TableCell>

                                                    {/* Pack Quantity */}
                                                    <TableCell sx={{ width: 100 }}>
                                                        {isRowEditing ? (
                                                            <TextField
                                                                select
                                                                size="small"
                                                                value={updateFormData.packQuantity || row.packQuantity || ""}
                                                                onChange={(e) => handleUpdateFormChange('packQuantity', e.target.value)}
                                                            >
                                                                {packTypes?.map((pack) => (
                                                                    <MenuItem key={pack._id} value={pack.quentity}>
                                                                        {pack.name}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                        ) : (
                                                            <Typography variant="body2">
                                                                {row.packQuantity || "N/A"}
                                                            </Typography>
                                                        )}
                                                    </TableCell>

                                                    {/* Units Quantity */}
                                                    <TableCell sx={{ width: 100 }}>
                                                        {isRowEditing ? (
                                                            <TextField
                                                                type="number"
                                                                size="small"
                                                                value={updateFormData.unitsQuantity || row.unitsQuantity || ""}
                                                                onChange={(e) => handleUpdateFormChange('unitsQuantity', e.target.value)}
                                                            />
                                                        ) : (
                                                            <Typography variant="body2">
                                                                {row.unitsQuantity || "N/A"}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    {emptyRows > 0 && (
                                        <TableRow style={{ height: 33 * emptyRows }}>
                                            <TableCell colSpan={headCells.length + 1} />
                                        </TableRow>
                                    )}
                                </TableBody>

                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={rows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />

                        {/* Total Row */}
                        <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Total
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    ${rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0).toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Side - Order Details */}
                {!isEditing ?
                    <Grid item xs={12} lg={5} minWidth={400}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Order Details */}
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Order Details
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                                            Order Number :
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            #{documentNo}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 120 }}>
                                            Customer Name :
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: 200 }}>
                                            {tableData[0]?.customerName || 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                                            Order Date :
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {tableData[0]?.date ? new Date(tableData[0].date).toLocaleDateString() : 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                                            Sales Channel :
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {tableData[0]?.salesChannel || 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                                            Total Items :
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {rows.length}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                                            Order Total :
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            ${rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Delivery Address Details */}
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Delivery Address Details :
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                                            Billing Address:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'left', maxWidth: 200 }}>
                                            {tableData[0]?.billingAddress instanceof Object ?
                                                `${tableData[0]?.billingAddress.billingAddressLineOne || ''}, ${tableData[0]?.billingAddress.billingAddressLineTwo || ''}, ${tableData[0]?.billingAddress.billingAddressLineThree || ''}, ${tableData[0]?.billingAddress.billingCity || ''}, ${tableData[0]?.billingAddress.billingState || ''}, ${tableData[0]?.billingAddress.billingZip || ''}`.trim()
                                                : `${tableData[0]?.billingAddress || ''}`}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                                            Shipping Address:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'left', maxWidth: 200 }}>
                                            {tableData[0]?.shippingAddress instanceof Object ?
                                                `${tableData[0]?.shippingAddress.shippingAddressLineOne || ''}, ${tableData[0]?.shippingAddress.shippingAddressLineTwo || ''}, ${tableData[0]?.shippingAddress.shippingAddressLineThree || ''}, ${tableData[0]?.shippingAddress.shippingCity || ''}, ${tableData[0]?.shippingAddress.shippingState || ''}, ${tableData[0]?.shippingAddress.shippingZip || ''}`.trim()
                                                : `${tableData[0]?.shippingAddress || ''}`
                                            }
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                                            trackingNumber :
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {tableData[0]?.trackingNumber || 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>
                    </Grid>
                    :
                    // --- Editable Form
                    <Grid item xs={12} lg={5} minWidth={400}  >
                        <Typography variant="h6" gutterBottom color="primary">
                            Edit Order Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {/* Customer Name */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 80 }}>
                                    Customer Name :
                                </Typography>
                                <TextField
                                    size="small"
                                    value={formData.customerName}
                                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                                    sx={{ minWidth: 270 }}
                                />
                            </Box>

                            {/* Sales Channel */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 80 }}>
                                    Sales Channel:
                                </Typography>
                                <TextField
                                    size="small"
                                    value={formData.salesChannel}
                                    onChange={(e) => handleInputChange("salesChannel", e.target.value)}
                                    sx={{ minWidth: 270 }}
                                />
                            </Box>

                            {/* Amount */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 80 }}>
                                    Amount :
                                </Typography>
                                <TextField
                                    type="number"
                                    size="small"
                                    value={formData.amount}
                                    onChange={(e) => handleInputChange("amount", e.target.value)}
                                    sx={{ minWidth: 270 }}
                                />
                            </Box>

                            {/* Billing Address */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 80 }}>
                                    Billing Address :
                                </Typography>
                                <TextField
                                    select
                                    size="small"
                                    value={selectedBillingAddress}
                                    onChange={handleBillingAddressChange}
                                    sx={{ minWidth: 270 }}
                                >
                                    <MenuItem value="">
                                        <em>Select Billing Address</em>
                                    </MenuItem>
                                    {billingAddresses.map((address) => (
                                        <MenuItem key={address._id} value={address._id}>
                                            {`${address.billingAddressOne}, ${address.billingCity}, ${address.billingState}`}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            {/* // Replace the Shipping Address section in the editable form with this: */}
                            {/* Shipping Address */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 80 }}>
                                    Shipping Address :
                                </Typography>
                                <TextField
                                    select
                                    size="small"
                                    value={selectedShippingAddress}
                                    onChange={handleShippingAddressChange}
                                    sx={{ minWidth: 270 }}
                                >
                                    <MenuItem value="">
                                        <em>Select Shipping Address</em>
                                    </MenuItem>
                                    {shippingAddresses.map((address) => (
                                        <MenuItem key={address._id} value={address._id}>
                                            {`${address.shippingAddressOne}, ${address.shippingCity}, ${address.shippingState}`}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            {/* Error */}
                            {error && <Typography color="error">{error}</Typography>}

                            {/* Actions */}
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                <Button variant="outlined" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </Box>
                        </Box>
                    </Grid>

                }
            </Grid>

            {/* Product Selection Modal */}
            <ProductSelectionModal
                open={showProductModal}
                onClose={handleCloseModal}
                tableData={tableData}
                documentNo={documentNo}
                onSalesOrderCreated={handleSalesOrderCreated}
            />

            {/* Show error if any */}
            {error && (
                <Box sx={{ mt: 2 }}>
                    <Typography color="error">Error: {error}</Typography>
                </Box>
            )}
        </Box>
    );
};

export default CustomersSalesOrders;