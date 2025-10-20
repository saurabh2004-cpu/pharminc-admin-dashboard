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
import ProductSelectionModal from './ProductSelectionModal';
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
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [tableData, setTableData] = React.useState([]);
    const [error, setError] = useState('');
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState('');
    const [showProductModal, setShowProductModal] = useState(false);
    const navigate = useNavigate();
    const { documentNo } = useParams();
    const [productList, setProductList] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        customerName: "",
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
    const [editingRowId, setEditingRowId] = useState(null);
    const [packTypes, setPackTypes] = useState([]);
    const [updateFormData, setUpdateFormData] = React.useState({});
    const [productQuentity, setProductQuantity] = useState(0);
    const [rowId, setRowId] = React.useState(null);
    const [billingAddresses, setBillingAddresses] = useState([]);
    const [shippingAddresses, setShippingAddresses] = useState([]);
    const [selectedBillingAddress, setSelectedBillingAddress] = useState('');
    const [selectedShippingAddress, setSelectedShippingAddress] = useState('');
    const [validationError, setValidationError] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        itemId: null,
        itemName: '',
        isDeleting: false
    });

    const theme = useTheme();
    const borderColor = theme.palette.divider;

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
            id: 'tax',
            numeric: false,
            disablePadding: false,
            label: 'Tax',
        },
        {
            id: 'packQuantity',
            numeric: false,
            disablePadding: false,
            label: 'Type Of Pack',
        },
        {
            id: 'unitsQuantity',
            numeric: false,
            disablePadding: false,
            label: 'Units Quantity',
        },
        {
            id: 'discountType',
            numeric: false,
            disablePadding: false,
            label: 'Discount Type',
        },
        {
            id: 'discountPercentages',
            numeric: false,
            disablePadding: false,
            label: 'Discount Percentages',
        },

    ];

    // Calculate tax and total amounts
    const calculateOrderTotals = (products) => {
        const orderTotal = products.reduce((sum, product) => sum + (parseFloat(product.amount) || 0), 0);

        const taxAmount = products.reduce((sum, product) => {
            if (product.taxApplied && product.taxPercentages > 0) {
                return sum + (parseFloat(product.amount) || 0) * (product.taxPercentages / 100);
            }
            return sum;
        }, 0);

        const finalAmount = orderTotal + taxAmount;

        return {
            orderTotal: orderTotal,
            taxAmount: taxAmount,
            finalAmount: finalAmount
        };
    };

    // Calculate tax for individual product
    const calculateProductTax = (product) => {
        if (product.taxApplied && product.taxPercentages > 0) {
            return (parseFloat(product.amount) || 0) * (product.taxPercentages / 100);
        }
        return 0;
    };

    // FIXED: Handle pack type change - updates both packQuantity and packType
    const handlePackTypeChange = (e) => {
        const selectedPackQuantity = parseInt(e.target.value);
        const selectedPack = packTypes.find(pack => parseInt(pack.quantity) === selectedPackQuantity);

        console.log("Selected pack:", selectedPack);
        console.log("Available packs:", packTypes);

        if (selectedPack) {
            setUpdateFormData(prev => ({
                ...prev,
                packQuantity: selectedPackQuantity.toString(), // Keep as string to match your data structure
                packType: selectedPack.name  // Update both fields
            }));

            console.log("Updated form data:", {
                ...updateFormData,
                packQuantity: selectedPackQuantity.toString(),
                packType: selectedPack.name
            });
        }
    };

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
                fetchSalesOrdersProducts();
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
            console.log("response sales order products ", response.data.data);

            if (response.data.statusCode === 200) {
                const data = response.data.data;

                const uniqueMap = new Map();

                data.forEach(item => {
                    const existing = uniqueMap.get(item.itemSku);

                    console.log("item updated in edit sales order items ", item)
                    console.log("existing in update items function ", existing)

                    if (!existing || (item.packType && !existing.packType)) {
                        uniqueMap.set(item.itemSku, item);
                    }
                });

                const uniqueData = Array.from(uniqueMap.values());

                setTableData(uniqueData);
                setRows(uniqueData);
            }
        } catch (error) {
            console.error('Error fetching products by sales order list:', error);
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

    const fetchProductBySku = async (itemSku) => {
        try {
            const response = await axiosInstance.get(`/products/get-product-by-sku/${itemSku}`);
            console.log("response product by sku", response);

            if (response.status === 200) {
                setProductQuantity(response.data.data.stockLevel);
            }
        } catch (error) {
            console.error('Error fetching product by sku:', error);
            setError(error.message);
        }
    };

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

    React.useEffect(() => {
        fetchSalesOrdersProducts();
    }, [documentNo]);

    useEffect(() => {
        if (formData.customerName) {
            fetchCustomerAddresses(formData.customerName);
        }
    }, [formData.customerName]);

    useEffect(() => {
        if (formData.billingAddress && formData.billingAddress._id) {
            setSelectedBillingAddress(formData.billingAddress._id);
        }
        if (formData.shippingAddress && formData.shippingAddress._id) {
            setSelectedShippingAddress(formData.shippingAddress._id);
        }
    }, [formData.billingAddress, formData.shippingAddress]);

    // FIXED: Stock validation that recalculates when quantities change
    useEffect(() => {
        if (editingRowId && updateFormData.packQuantity && updateFormData.unitsQuantity) {
            const totalOrderQuantity = parseInt(updateFormData.packQuantity) * updateFormData.unitsQuantity;

            if (updateFormData.unitsQuantity < 1) {
                setValidationError('Units quantity must be at least 1');
                return;
            }

            if (totalOrderQuantity > productQuentity && productQuentity > 0) {
                setValidationError(
                    `Warning: Order quantity (${totalOrderQuantity}) exceeds available stock (${productQuentity})`
                );
            } else {
                setValidationError('');
            }
        }
    }, [updateFormData.packQuantity, updateFormData.unitsQuantity, productQuentity, editingRowId]);

    // FIXED: Recalculate amount when quantities change
    useEffect(() => {
        if (editingRowId && updateFormData.packQuantity !== undefined && updateFormData.unitsQuantity !== undefined) {
            const currentRow = rows.find(row => row._id === editingRowId);
            if (!currentRow) return;

            const previousAmount = currentRow.amount || 0;
            const previousPackQuantity = parseInt(currentRow.packQuantity) || 1; // Parse as int
            const previousUnitsQuantity = currentRow.unitsQuantity || 1;

            const unitPrice = previousAmount / (previousPackQuantity * previousUnitsQuantity);

            const newPackQuantity = parseInt(updateFormData.packQuantity) || previousPackQuantity; // Parse as int
            const newUnitsQuantity = updateFormData.unitsQuantity || previousUnitsQuantity;
            const newAmount = unitPrice * (newPackQuantity * newUnitsQuantity);

            setUpdateFormData(prev => ({
                ...prev,
                amount: newAmount
            }));
        }
    }, [updateFormData.packQuantity, updateFormData.unitsQuantity, editingRowId, rows]);

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

    const handleAddProduct = () => {
        setShowProductModal(true);
    };

    const handleCloseModal = () => {
        setShowProductModal(false);
    };

    const handleSalesOrderCreated = () => {
        fetchSalesOrdersProducts();
    };

    const isSelected = (name) => selected.indexOf(name) !== -1;
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

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

    // FIXED: Initialize edit form with proper data
    const handleEditSalesOrder = (order) => {
        console.log("order in handle edit sales order", order);

        setRowId(order._id);
        setEditingRowId(order._id);
        fetchProductsAvailablePackTypes(order.itemSku);
        fetchProductBySku(order.itemSku);

        // FIXED: Initialize form data with current values including packType
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
            packQuantity: order.packQuantity || '',  // Keep original format
            unitsQuantity: parseInt(order.unitsQuantity) || 0,
            finalAmount: order.finalAmount || 0,
            amount: order.amount || 0,
            packType: order.packType || '', // Ensure packType is initialized
        });

        console.log("Initialized update form data:", {
            packQuantity: order.packQuantity,
            packType: order.packType
        });
    };

    const handleCancelUpdate = (rowId) => {
        setEditingRowId(null);
        setUpdateFormData({});
        setValidationError('');
        setError('');
    };

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

    const handleDeleteSalesOrder = async () => {
        try {
            const res = await axiosInstance.delete(`/sales-order/delete-sales-order/${deleteDialog.itemId}`);

            console.log("deleted", res.data);

            if (res.data.statusCode === 200) {
                setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
                setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));
                handleDeleteCancel();
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

    // FIXED: Updated handleSaveUpdate to properly include packType
    const handleSaveUpdate = async (rowId) => {
        try {
            if (!updateFormData.unitsQuantity || updateFormData.unitsQuantity < 1) {
                setError('Units quantity must be at least 1');
                return;
            }

            if (!updateFormData.packQuantity || updateFormData.packQuantity < 1) {
                setError('Pack quantity must be at least 1');
                return;
            }

            const totalOrderQuantity = parseInt(updateFormData.packQuantity) * updateFormData.unitsQuantity;
            if (totalOrderQuantity > productQuentity) {
                setError(`Cannot save: Order quantity (${totalOrderQuantity}) exceeds available stock (${productQuentity})`);
                return;
            }

            setLoading(true);
            setError('');

            const currentRow = rows.find(row => row._id === rowId);
            if (!currentRow) {
                setError('Row not found');
                return;
            }

            const previousAmount = currentRow.amount || 0;
            const previousPackQuantity = parseInt(currentRow.packQuantity) || 1;
            const previousUnitsQuantity = currentRow.unitsQuantity || 1;

            const unitPrice = previousAmount / (previousPackQuantity * previousUnitsQuantity);

            const newPackQuantity = parseInt(updateFormData.packQuantity) || previousPackQuantity;
            const newUnitsQuantity = updateFormData.unitsQuantity || previousUnitsQuantity;
            const newAmount = unitPrice * (newPackQuantity * newUnitsQuantity);

            // FIXED: Ensure packType is properly included
            const updatedData = {
                ...updateFormData,
                packQuantity: newPackQuantity.toString(), // Ensure it's a string
                unitsQuantity: newUnitsQuantity,
                amount: newAmount,
                packType: updateFormData.packType || currentRow.packType // Ensure packType is included
            };

            console.log("Sending update data:", updatedData);
            console.log("Pack type being sent:", updatedData.packType);

            const res = await axiosInstance.put(
                `/sales-order/update-sales-order-item/${rowId}`,
                updatedData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Update sales order response:", res);
            console.log("Response data:", res.data);

            if (res.data.statusCode === 200) {
                // FIXED: Update local state with all fields including packType
                setRows(prevRows =>
                    prevRows.map(row =>
                        row._id === rowId
                            ? {
                                ...row,
                                ...updatedData,
                                amount: newAmount,
                                packType: updatedData.packType, // Ensure packType is updated
                                packQuantity: updatedData.packQuantity // Ensure packQuantity is updated
                            }
                            : row
                    )
                );

                // Also update tableData to ensure consistency
                setTableData(prevData =>
                    prevData.map(item =>
                        item._id === rowId
                            ? {
                                ...item,
                                ...updatedData,
                                amount: newAmount,
                                packType: updatedData.packType,
                                packQuantity: updatedData.packQuantity
                            }
                            : item
                    )
                );

                handleCancelUpdate(rowId);

                // Force refresh the data from server
                await fetchSalesOrdersProducts();

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

    const handleUpdateFormChange = (field, value) => {
        console.log("handleUpdateFormChange", field, value);
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
                                                                <>
                                                                    <Button
                                                                        size="small"
                                                                        variant="contained"
                                                                        color="primary"
                                                                        onClick={() => handleSaveUpdate(row._id)}
                                                                        disabled={loading || !!validationError || (updateFormData.unitsQuantity !== undefined && updateFormData.unitsQuantity < 1)}
                                                                    >
                                                                        {loading ? 'Saving...' : 'Save'}
                                                                    </Button>

                                                                    <Button
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color="secondary"
                                                                        onClick={() => handleCancelUpdate(row._id)}
                                                                        disabled={loading}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </>
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
                                                                            onClick={(e) => handleDeleteClick(e, row._id, row.itemSku)}
                                                                        >
                                                                            <IconTrash size="1rem" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </>
                                                            )}
                                                        </Box>
                                                    </TableCell>

                                                    {/* SKU */}
                                                    <TableCell sx={{ width: 120 }}>
                                                        <Typography fontWeight="500" variant="body2">
                                                            {row.itemSku || "N/A"}
                                                        </Typography>
                                                    </TableCell>

                                                    {/* Amount */}
                                                    <TableCell sx={{ width: 100 }}>
                                                        {isRowEditing ? (
                                                            <Typography variant="body2">
                                                                ${updateFormData.amount ? updateFormData.amount.toFixed(2) : (row.amount || 0).toFixed(2)}
                                                            </Typography>
                                                        ) : (
                                                            <Typography variant="body2">${(row.amount || 0).toFixed(2)}</Typography>
                                                        )}
                                                    </TableCell>

                                                    {/* Tax Column */}
                                                    <TableCell sx={{ width: 100 }}>
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {`${calculateProductTax(row).toFixed(2)} (${row.taxApplied ? `${row.taxPercentages}%` : 'No Tax'})`}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>

                                                    {/* Pack Type - FIXED */}
                                                    <TableCell sx={{ width: 150 }}>
                                                        {isRowEditing ? (
                                                            <Box>
                                                                <TextField
                                                                    select
                                                                    size="small"
                                                                    value={updateFormData.packQuantity || row.packQuantity || ""}
                                                                    onChange={handlePackTypeChange}
                                                                    error={!!validationError}
                                                                    fullWidth
                                                                >
                                                                    {packTypes?.map((pack) => (
                                                                        <MenuItem key={pack._id} value={parseInt(pack.quantity)}>
                                                                            {pack.name}
                                                                        </MenuItem>
                                                                    ))}
                                                                </TextField>
                                                                {updateFormData.packType && (
                                                                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                                                                        Selected: {updateFormData.packType}
                                                                    </Typography>
                                                                )}
                                                                {/* Debug info */}
                                                                {/* <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.6rem' }}>
                                                                    Debug: Qty: {updateFormData.packQuantity}, Type: {updateFormData.packType}
                                                                </Typography> */}
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="body2">
                                                                {row.packType || "N/A"}
                                                                {/* Debug info */}
                                                                {/* <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.6rem' }}>
                                                                    Current: {row.packType}
                                                                </Typography> */}
                                                            </Typography>
                                                        )}
                                                    </TableCell>

                                                    {/* Units Quantity */}
                                                    <TableCell sx={{ width: 50 }}>
                                                        {isRowEditing ? (
                                                            <Box>
                                                                <TextField
                                                                    type="number"
                                                                    size="small"
                                                                    value={updateFormData.unitsQuantity || row.unitsQuantity || ""}
                                                                    onChange={(e) => {
                                                                        const value = parseInt(e.target.value);
                                                                        if (value >= 1 || e.target.value === '') {
                                                                            handleUpdateFormChange('unitsQuantity', value);
                                                                        }
                                                                    }}
                                                                    inputProps={{ min: 1 }}
                                                                    error={!!validationError}
                                                                />
                                                                {validationError && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="error"
                                                                        sx={{
                                                                            display: 'block',
                                                                            mt: 0.5,
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    >
                                                                        {validationError}
                                                                    </Typography>
                                                                )}
                                                                {productQuentity > 0 && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="textSecondary"
                                                                        sx={{
                                                                            display: 'block',
                                                                            mt: 0.5,
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    >
                                                                        Available: {productQuentity}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="body2">
                                                                {row.unitsQuantity || "N/A"}
                                                            </Typography>
                                                        )}
                                                    </TableCell>

                                                    <TableCell sx={{ width: 100 }}>
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {row.discountType || ""}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ width: 100 }}>
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {row.discountPercentages || ""}
                                                            </Typography>
                                                        </Box>
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
                    </Paper>
                </Grid>

                {/* Right Side - Order Details */}
                {!isEditing ? (
                    <Grid item xs={12} lg={5} maxWidth={290}>
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
                                            Order Time :
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {tableData[0]?.date
                                                ? new Date(tableData[0].date).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })
                                                : "N/A"}
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
                                            ${calculateOrderTotals(rows).orderTotal.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                                            Tax Amount:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'secondary.main' }}>
                                            ${calculateOrderTotals(rows).taxAmount.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #e0e0e0' }}>
                                        <Typography variant="body1" color="textSecondary" sx={{ minWidth: 120, fontWeight: 'bold' }}>
                                            Final Amount:
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            ${calculateOrderTotals(rows).finalAmount.toFixed(2)}
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
                                                `${tableData[0]?.billingAddress.billingAddressLineOne || ''} ${tableData[0]?.billingAddress.billingAddressLineTwo || ''} ${tableData[0]?.billingAddress.billingAddressLineThree || ''} ${tableData[0]?.billingAddress.billingCity || ''} ${tableData[0]?.billingAddress.billingState || ''} ${tableData[0]?.billingAddress.billingZip || ''}`.trim()
                                                : `${tableData[0]?.billingAddress || ''}`}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                                            Shipping Address:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'left', maxWidth: 200 }}>
                                            {tableData[0]?.shippingAddress instanceof Object ?
                                                `${tableData[0]?.shippingAddress.shippingAddressLineOne || ''} ${tableData[0]?.shippingAddress.shippingAddressLineTwo || ''} ${tableData[0]?.shippingAddress.shippingAddressLineThree || ''} ${tableData[0]?.shippingAddress.shippingCity || ''} ${tableData[0]?.shippingAddress.shippingState || ''} ${tableData[0]?.shippingAddress.shippingZip || ''}`.trim()
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

                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Order Comments
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>

                                        <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'left', maxWidth: 200 }}>
                                            {tableData[0]?.comments || 'No Comments'}
                                        </Typography>
                                    </Box>

                                </Box>
                            </Paper>
                        </Box>
                    </Grid>
                ) : (
                    // Editable Form
                    <Grid item xs={12} lg={5} minWidth={400}>
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

                            {/* trackingNumber */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 80 }}>
                                    trackingNumber:
                                </Typography>
                                <TextField
                                    type="text"
                                    size="small"
                                    value={formData.trackingNumber}
                                    onChange={(e) => handleInputChange("trackingNumber", e.target.value)}
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
                )}
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

            <DeleteConfirmationDialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteSalesOrder}
                itemName={deleteDialog.itemName}
                isDeleting={deleteDialog.isDeleting}
                itemType={"Sales Order Item"}
            />
        </Box>
    );
};

export default CustomersSalesOrders;