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
    Collapse,
    IconButton as MuiIconButton,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit, IconPlus, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
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
                {/* Expand/Collapse column */}
                <TableCell sx={{ ...headCellStyle, ...stickyCellStyle, width: 60 }}>
                    Expand
                </TableCell>

                {/* Actions column */}
                <TableCell sx={{ ...headCellStyle, ...stickyCellStyle, width: 100 }}>
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

// Mini table for product group products
const ProductGroupProductsTable = ({ products, productGroupsData }) => {
    return (
        <TableContainer component={Box} sx={{ mt: 1, mb: 2, backgroundColor: '#fafafa', borderRadius: 1 }}>
            <Table size="small" sx={{ minWidth: 400 }}>
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>SKU</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Product Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">Tax %</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Pack Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">Units Quantity</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map((productItem, index) => (
                        <TableRow key={productItem._id || index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row" sx={{ fontSize: '0.75rem' }}>
                                {productItem.product?.sku || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>
                                {productItem.product?.ProductName || 'N/A'}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem' }}>
                                {productItem.product?.taxPercentages || 0}%
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>
                                {productItem.packType || 'N/A'}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.75rem' }}>
                                {productItem.unitsQuantity || 0}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
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
    const [expandedRows, setExpandedRows] = useState(new Set());

    const [billingDropdownOpen, setBillingDropdownOpen] = useState(false);
    const [shippingDropdownOpen, setShippingDropdownOpen] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        customerName: "",
        salesChannel: "",
        packQuantity: "",
        amount: "",
        billingAddress: {},
        shippingAddress: {},
        trackingNumber: "",
        date: "",
        deliveryVendor: "",
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
        documentNumber: '',
        itemName: '',
        isDeleting: false
    });
    const [deliveryVendors, setDeliveryVendors] = useState([]);
    const [selectedDeliveryVendor, setSelectedDeliveryVendor] = useState('');
    const [productGroupsIds, setProductGroupsIds] = useState([]);
    const [productGroupsData, setProductGroupsData] = useState([]);


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

    // Toggle expanded row
    const toggleRowExpansion = (rowId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(rowId)) {
            newExpanded.delete(rowId);
        } else {
            newExpanded.add(rowId);
        }
        setExpandedRows(newExpanded);
    };

    // Check if a product group has products
    const getProductGroupProducts = (itemSku) => {
        const productGroup = productGroupsData.find(pg => pg.sku === itemSku);
        return productGroup?.products || [];
    };

    // Check if row is a product group
    const isProductGroup = (row) => {
        return productGroupsIds.includes(row.itemSku);
    };

    // Calculate tax and total amounts
    const calculateOrderTotals = (products) => {

        console.log("products", products);

        const orderTotal = products.reduce((sum, product) => {
            const quantity = parseInt(product.packQuantity) * parseInt(product.unitsQuantity);
            const itemTotal = parseFloat(product.amount) * quantity;
            return sum + (itemTotal || 0);
        }, 0);

        const taxAmount = products.reduce((sum, product) => {
            if (product.taxApplied && product.taxPercentages > 0) {
                const quantity = parseInt(product.packQuantity) * parseInt(product.unitsQuantity);
                const itemSubtotal = parseFloat(product.amount) * quantity;
                const itemTax = itemSubtotal * (product.taxPercentages / 100);
                return sum + itemTax;
            }
            return sum;
        }, 0);

        const finalAmount = orderTotal + taxAmount;

        return {
            orderTotal: parseFloat(orderTotal.toFixed(2)),
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            finalAmount: parseFloat(finalAmount.toFixed(2))
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

        if (selectedPack) {
            setUpdateFormData(prev => ({
                ...prev,
                packQuantity: selectedPackQuantity.toString(),
                packType: selectedPack.name
            }));
        }
    };

    useEffect(() => {
        if (tableData[0]) {
            // Format sales order address for display
            const formatSalesOrderAddress = (address) => {
                if (!address) return "";

                if (typeof address === 'string') return address;

                if (typeof address === 'object') {
                    // Handle sales order address format
                    if (address.shippingAddressOne || address.billingAddressOne) {
                        const addressOne = address.shippingAddressOne || address.billingAddressOne;
                        const addressTwo = address.shippingAddressTwo || address.billingAddressTwo;
                        const addressThree = address.shippingAddressThree || address.billingAddressThree;
                        const city = address.shippingCity || address.billingCity;
                        const state = address.shippingState || address.billingState;
                        const zip = address.shippingZip || address.billingZip;

                        return [
                            addressOne,
                            addressTwo,
                            addressThree,
                            city,
                            state,
                            zip
                        ].filter(Boolean).join(", ");
                    }
                    // Handle other object formats if any
                    return Object.values(address).filter(val =>
                        val && typeof val === 'string'
                    ).join(", ");
                }

                return "";
            };

            setFormData({
                customerName: tableData[0]?.customerName || "",
                salesChannel: tableData[0]?.salesChannel || "",
                packQuantity: tableData[0]?.packQuantity || "",
                amount: tableData[0]?.amount || "",
                billingAddress: formatSalesOrderAddress(tableData[0]?.billingAddress),
                shippingAddress: formatSalesOrderAddress(tableData[0]?.shippingAddress),
                trackingNumber: tableData[0]?.trackingNumber || "",
                deliveryVendor: tableData[0]?.deliveryVendor || "",
                date: tableData[0]?.date
                    ? new Date(tableData[0].date).toISOString().split("T")[0]
                    : "",
            });

            if (tableData[0]?.deliveryVendor) {
                setSelectedDeliveryVendor(tableData[0].deliveryVendor._id || tableData[0].deliveryVendor);
            }
        }
    }, [tableData]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDeliveryVendorChange = (event) => {
        const vendorId = event.target.value;
        setSelectedDeliveryVendor(vendorId);

        const selectedVendor = deliveryVendors.find(vendor => vendor._id === vendorId);
        if (selectedVendor) {
            setFormData(prev => ({
                ...prev,
                deliveryVendor: selectedVendor
            }));
        }
    };

    useEffect(() => {
        // Set current addresses as default selection
        setSelectedBillingAddress('current');
        setSelectedShippingAddress('current');
    }, [tableData]);

    const handleSubmit = async () => {
        if (!formData.customerName?.trim()) return setError("Customer name is required");
        if (!formData.salesChannel?.trim()) return setError("Sales channel is required");

        setLoading(true);
        setError("");

        try {
            // Determine which addresses to use
            const billingAddress = selectedBillingAddress === 'current'
                ? tableData[0]?.billingAddress
                : formData.billingAddress;

            const shippingAddress = selectedShippingAddress === 'current'
                ? tableData[0]?.shippingAddress
                : formData.shippingAddress;

            const res = await axiosInstance.put(
                `/sales-order/update-sales-order/${documentNo}`,
                {
                    customerName: formData.customerName,
                    salesChannel: formData.salesChannel,
                    billingAddress: billingAddress,
                    shippingAddress: shippingAddress,
                    trackingNumber: formData.trackingNumber,
                    date: formData.date,
                    deliveryVendor: selectedDeliveryVendor,
                },
                { headers: { "Content-Type": "application/json" } }
            );

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

    // Helper function to display sales order addresses
    const displaySalesOrderAddress = (address) => {
        if (!address) return "N/A";

        if (typeof address === 'string') return address;

        if (typeof address === 'object') {
            if (address.shippingAddressOne || address.billingAddressOne) {
                const addressOne = address.shippingAddressOne || address.billingAddressOne;
                const addressTwo = address.shippingAddressTwo || address.billingAddressTwo;
                const addressThree = address.shippingAddressThree || address.billingAddressThree;
                const city = address.shippingCity || address.billingCity;
                const state = address.shippingState || address.billingState;
                const zip = address.shippingZip || address.billingZip;

                return [addressOne, addressTwo, addressThree, city, state, zip]
                    .filter(Boolean)
                    .join(", ");
            }
            return Object.values(address).filter(val => val && typeof val === 'string').join(", ");
        }

        return "N/A";
    };

    const fetchSalesOrdersProducts = async () => {
        try {
            const response = await axiosInstance.get(`/sales-order/get-products-by-sales-document-number-dashboard/${documentNo}`);
            console.log("response sales order products ", response.data.data);

            if (response.data.statusCode === 200) {
                const data = response.data.data;
                const productGroupsSkus = data
                    .filter(item => item.isProductGroup)
                    .map(item => item.itemSku);

                setProductGroupsIds(productGroupsSkus);

                const uniqueMap = new Map();

                data.forEach(item => {
                    const existing = uniqueMap.get(item.itemSku);

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
            console.log("product group data", productGroupsData);

            // Check if it's a product group
            const productGroup = productGroupsData.find(pg => pg.sku === itemSku);

            if (productGroup) {
                console.log("Found product group:", productGroup.name);

                // For product groups, find the lowest stock level among all products
                let lowestStock = Infinity;

                if (productGroup.products && productGroup.products.length > 0) {
                    for (const groupProduct of productGroup.products) {
                        const product = groupProduct.product;
                        if (product && product.stockLevel !== undefined) {
                            console.log(`Product ${product.sku} stock: ${product.stockLevel}`);
                            lowestStock = Math.min(lowestStock, product.stockLevel);
                        }
                    }

                    // If found valid stock levels, use the lowest one
                    if (lowestStock !== Infinity) {
                        setProductQuantity(lowestStock);
                        console.log(`Lowest stock in product group: ${lowestStock}`);
                    } else {
                        // If no stock levels found, set to 0 or a default value
                        setProductQuantity(0);
                        console.log("No stock levels found in product group");
                    }
                } else {
                    setProductQuantity(0);
                    console.log("No products found in product group");
                }
            } else {
                // It's a regular product, fetch it normally
                const response = await axiosInstance.get(`/products/get-product-by-sku/${itemSku}`);

                if (response.status === 200) {
                    const productData = response.data.data;
                    setProductQuantity(productData.stockLevel || 0);
                    console.log(`Regular product ${itemSku} stock: ${productData.stockLevel}`);
                } else {
                    setProductQuantity(0);
                    console.log(`Product ${itemSku} not found or error`);
                }
            }
        } catch (error) {
            console.error('Error fetching product by sku:', error);

            // Try to find the product in the already loaded product group data
            const productGroup = productGroupsData.find(pg => pg.sku === itemSku);
            if (productGroup?.products?.length > 0) {
                // Use the first product's stock as fallback
                const firstProductStock = productGroup.products[0]?.product?.stockLevel || 0;
                setProductQuantity(firstProductStock);
                console.log(`Fallback - Using first product stock: ${firstProductStock}`);
            } else {
                setProductQuantity(0);
            }

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

    const fetchProdutGroupsBySku = async () => {
        try {
            const response = await axiosInstance.post(`/product-group/get-product-group-by-skus`,
                {
                    skus: productGroupsIds
                },
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.data.statusCode === 200) {
                setProductGroupsData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching customer addresses:', error);
        }
    }

    useEffect(() => {
        if (productGroupsIds.length > 0) {
            fetchProdutGroupsBySku();
        }
    }, [productGroupsIds]);

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

            // Get the per-unit price from the current row
            const perUnitPrice = parseFloat(currentRow.amount);

            const newPackQuantity = parseInt(updateFormData.packQuantity) || 1;
            const newUnitsQuantity = parseInt(updateFormData.unitsQuantity) || 1;

            // Calculate new total amount = per-unit price * pack quantity * units quantity
            const newTotalAmount = perUnitPrice * newPackQuantity * newUnitsQuantity;

            setUpdateFormData(prev => ({
                ...prev,
                calculatedTotalAmount: newTotalAmount // Store calculated total for display
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

        if (addressId === 'current') {
            setBillingDropdownOpen(false);
        } else {
            const selectedAddress = billingAddresses.find(addr => addr._id === addressId);
            if (selectedAddress) {
                setFormData(prev => ({
                    ...prev,
                    billingAddress: selectedAddress
                }));
                setBillingDropdownOpen(false);
            }
        }
    };

    const handleShippingAddressChange = (event) => {
        const addressId = event.target.value;
        setSelectedShippingAddress(addressId);

        if (addressId === 'current') {
            setShippingDropdownOpen(false);
        } else {
            const selectedAddress = shippingAddresses.find(addr => addr._id === addressId);
            if (selectedAddress) {
                setFormData(prev => ({
                    ...prev,
                    shippingAddress: selectedAddress
                }));
                setShippingDropdownOpen(false);
            }
        }
    };

    // Format address for display in input field
    const formatAddressForDisplay = (address) => {
        if (!address) return "No address available";

        if (typeof address === 'string') return address;

        if (typeof address === 'object') {
            if (address.shippingAddressOne || address.billingAddressOne) {
                const addressOne = address.shippingAddressOne || address.billingAddressOne;
                const addressTwo = address.shippingAddressTwo || address.billingAddressTwo;
                const addressThree = address.shippingAddressThree || address.billingAddressThree;
                const city = address.shippingCity || address.billingCity;
                const state = address.shippingState || address.billingState;
                const zip = address.shippingZip || address.billingZip;

                const formatted = [addressOne, addressTwo, addressThree, city, state, zip]
                    .filter(Boolean)
                    .join(", ");

                return formatted || "No address available";
            }
            // Fallback for other object formats
            const values = Object.values(address).filter(val =>
                val && typeof val === 'string' && val.trim() !== ''
            );
            return values.join(", ") || "No address available";
        }

        return "No address available";
    };

    // FIXED: Initialize edit form with proper data
    const handleEditSalesOrder = (order) => {
        console.log("order in handle edit sales order", order);

        setRowId(order._id);
        setEditingRowId(order._id);
        fetchProductsAvailablePackTypes(order.itemSku);
        fetchProductBySku(order.itemSku);

        setUpdateFormData({
            date: order?.date || null,
            documentNumber: order.documentNumber || '',
            customerName: order.customerName || '',
            salesChannel: order.salesChannel || '',
            trackingNumber: order.trackingNumber || '',
            deliveryVendor: order.deliveryVendor || '',
            shippingAddress: order.shippingAddress || '',
            billingAddress: order.billingAddress || '',
            customerPO: order.customerPO || '',
            itemSku: order.itemSku || '',
            packQuantity: order.packQuantity || '',
            unitsQuantity: parseInt(order.unitsQuantity) || 0,
            finalAmount: order.finalAmount || 0,
            amount: order.amount || 0,
            packType: order.packType || '',
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
            documentNumber: null,
            itemName: '',
            isDeleting: false
        });
    };

    const handleDeleteClick = (event, id, name, row) => {

        event.stopPropagation();
        setDeleteDialog({
            open: true,
            itemId: id,
            documentNumber: row.documentNumber,
            itemName: name,
            isDeleting: false
        });
    };

    const handleDeleteSalesOrder = async () => {

        console.log("document number", deleteDialog.documentNumber)

        try {
            const res = await axiosInstance.delete(`/sales-order/delete-sales-order-by-id/${deleteDialog.itemId}/${deleteDialog.documentNumber}`);

            console.log("resposne of delect sales order", res)

            if (res.data.statusCode === 200) {
                setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
                setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));
                handleDeleteCancel();
                await fetchSalesOrdersProducts();
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

    const handleSaveUpdate = async (rowId, documentNumber) => {
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

            const updatedData = {
                ...updateFormData,
                packQuantity: updateFormData.packQuantity.toString(),
                unitsQuantity: updateFormData.unitsQuantity,
                packType: updateFormData.packType || currentRow.packType
                // Remove amount calculation - backend handles it
            };

            const res = await axiosInstance.put(
                `/sales-order/update-sales-order-item/${rowId}/${documentNumber}`,
                updatedData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (res.data.statusCode === 200) {
                handleCancelUpdate(rowId);
                await fetchSalesOrdersProducts(); // Refresh data from server
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
        setUpdateFormData(prev => ({ ...prev, [field]: value }));
    };

    const fetchDeliveryVendorList = async () => {
        try {
            const response = await axiosInstance.get('/delivery-vendor/get-all-delivery-vendors');
            if (response.status === 200) {
                setDeliveryVendors(response.data);
            }
        } catch (error) {
            console.error('Error fetching delivery vendors list:', error);
            setError(error.message);
        }
    };

    React.useEffect(() => {
        fetchDeliveryVendorList();
    }, []);

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
                                            const isProductGroupRow = isProductGroup(row);
                                            const isExpanded = expandedRows.has(row._id);
                                            const productGroupProducts = isProductGroupRow ? getProductGroupProducts(row.itemSku) : [];

                                            return (
                                                <React.Fragment key={row._id || row.title}>
                                                    <TableRow
                                                        hover
                                                        role="checkbox"
                                                        aria-checked={isItemSelected}
                                                        tabIndex={-1}
                                                        selected={isItemSelected}
                                                        sx={{
                                                            backgroundColor: isProductGroupRow ? '#f0f8ff' : 'inherit',
                                                            '&:hover': {
                                                                backgroundColor: isProductGroupRow ? '#e3f2fd' : 'rgba(0, 0, 0, 0.04)',
                                                            }
                                                        }}
                                                    >
                                                        {/* Expand/Collapse Column */}
                                                        <TableCell sx={{ ...stickyCellStyle, width: 60 }}>
                                                            {isProductGroupRow && (
                                                                <MuiIconButton
                                                                    size="small"
                                                                    onClick={() => toggleRowExpansion(row._id)}
                                                                >
                                                                    {isExpanded ? <IconChevronUp size="1rem" /> : <IconChevronDown size="1rem" />}
                                                                </MuiIconButton>
                                                            )}
                                                        </TableCell>

                                                        {/* Actions Column */}
                                                        <TableCell sx={{ ...stickyCellStyle, width: 100 }}>
                                                            <Box display="flex" gap={0.5}>
                                                                {isRowEditing ? (
                                                                    <>
                                                                        <Button
                                                                            size="small"
                                                                            variant="contained"
                                                                            color="primary"
                                                                            onClick={() => handleSaveUpdate(row._id, row.documentNumber)}
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
                                                                                onClick={(e) => handleDeleteClick(e, row._id, row.itemSku, row)}
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
                                                                {isProductGroupRow && (
                                                                    <Typography variant="caption" color="primary" display="block">
                                                                        Product Kit
                                                                    </Typography>
                                                                )}
                                                            </Typography>
                                                        </TableCell>

                                                        {/* Amount */}
                                                        <TableCell sx={{ width: 100 }}>
                                                            {isRowEditing ? (
                                                                <Typography variant="body2">
                                                                    ${(updateFormData.calculatedTotalAmount || (row.amount * row.unitsQuantity * row.packQuantity)).toFixed(2)}
                                                                </Typography>
                                                            ) : (
                                                                <Typography variant="body2">${(row.amount * row.unitsQuantity * row.packQuantity || 0).toFixed(2)}</Typography>
                                                            )}
                                                        </TableCell>

                                                        {/* Tax Column */}
                                                        <TableCell sx={{ width: 100 }}>
                                                            <Box>
                                                                {isRowEditing ? (
                                                                    <Typography variant="body2">
                                                                        {(() => {
                                                                            const totalAmount = updateFormData.calculatedTotalAmount || (row.amount * row.unitsQuantity * row.packQuantity);
                                                                            const tax = row.taxApplied && row.taxPercentages > 0
                                                                                ? (totalAmount * row.taxPercentages) / 100
                                                                                : 0;
                                                                            return `${tax.toFixed(2)} (${row.taxApplied ? `${row.taxPercentages}%` : 'No Tax'})`;
                                                                        })()}
                                                                    </Typography>
                                                                ) : (
                                                                    <Typography variant="body2">
                                                                        {(() => {
                                                                            const totalAmount = row.amount * row.unitsQuantity * row.packQuantity;
                                                                            const tax = row.taxApplied && row.taxPercentages > 0
                                                                                ? (totalAmount * row.taxPercentages) / 100
                                                                                : 0;
                                                                            return `${tax.toFixed(2)} (${row.taxApplied ? `${row.taxPercentages}%` : 'No Tax'})`;
                                                                        })()}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </TableCell>

                                                        {/* Pack Type - FIXED */}
                                                        <TableCell sx={{ width: 150 }}>
                                                            {isRowEditing ? (
                                                                <Box>
                                                                    {packTypes && packTypes.length > 0 ? (
                                                                        <TextField
                                                                            select
                                                                            size="small"
                                                                            value={updateFormData.packQuantity || row.packQuantity || ""}
                                                                            onChange={handlePackTypeChange}
                                                                            error={!!validationError}
                                                                            fullWidth
                                                                        >
                                                                            {packTypes.map((pack) => (
                                                                                <MenuItem key={pack._id} value={parseInt(pack.quantity)}>
                                                                                    {pack.name}
                                                                                </MenuItem>
                                                                            ))}
                                                                        </TextField>
                                                                    ) : (
                                                                        <TextField
                                                                            size="small"
                                                                            value={updateFormData.packType || row.packType || ""}
                                                                            onChange={(e) => handleUpdateFormChange('packType', e.target.value)}
                                                                            error={!!validationError}
                                                                            fullWidth
                                                                        />
                                                                    )}
                                                                    {updateFormData.packType && (
                                                                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                                                                            Selected: {updateFormData.packType}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="body2">
                                                                    {row.packType || "N/A"}
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
                                                                    {row.discountType?.trim() === "Compare Price" ? `$ ${row.discountPercentages}` : row.discountPercentages + "%"}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>

                                                    {/* Expanded Row for Product Group Products */}
                                                    {isProductGroupRow && isExpanded && (
                                                        <TableRow>
                                                            <TableCell colSpan={2} sx={{ padding: 0, border: 'none' }} />
                                                            <TableCell colSpan={6} sx={{ padding: 0, border: 'none' }}>
                                                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                                    <ProductGroupProductsTable
                                                                        products={productGroupProducts}
                                                                        productGroupsData={productGroupsData}
                                                                    />
                                                                </Collapse>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    {emptyRows > 0 && (
                                        <TableRow style={{ height: 33 * emptyRows }}>
                                            <TableCell colSpan={headCells.length + 2} />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[50, 100, 200]}
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
                                            ${tableData[0]?.subTotal?.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                                            Tax Amount:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'secondary.main' }}>
                                            ${tableData[0]?.taxAmount?.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
                                            Shipping Rate:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'secondary.main' }}>
                                            ${tableData[0]?.shippingRate?.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #e0e0e0' }}>
                                        <Typography variant="body1" color="textSecondary" sx={{ minWidth: 120, fontWeight: 'bold' }}>
                                            Final Amount:
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            ${tableData[0]?.totalAmount?.toFixed(2)}
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
                                            {displaySalesOrderAddress(tableData[0]?.billingAddress)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                                            Shipping Address:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'left', maxWidth: 200 }}>
                                            {displaySalesOrderAddress(tableData[0]?.shippingAddress)}
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

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                                            Delivery Vendor:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {tableData[0]?.deliveryVendor?.vendorName ||
                                                (typeof tableData[0]?.deliveryVendor === 'string' ?
                                                    deliveryVendors.find(v => v._id === tableData[0]?.deliveryVendor)?.vendorName : 'N/A')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            {order.creditCard && <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Credit Cards Details :
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                                            Card Number:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'left', maxWidth: 200 }}>
                                            {tableData[0]?.creditCard?.cardNumber.slice(-4).padStart(tableData[0]?.creditCard?.cardNumber.length, '*') || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                                            Expires In:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'left', maxWidth: 200 }}>
                                            {tableData[0]?.creditCard?.expiryMonth} / {tableData[0]?.creditCard?.expiryYear}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                                            fullName:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {tableData[0]?.creditCard?.fullName || 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                                            Transaction Id:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {tableData[0]?.creditCard?.transactionId || 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                                            Transaction Status:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {tableData[0]?.creditCard?.transactionStatus || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 100 }}>
                                            Authorisation Code:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {tableData[0]?.creditCard?.authorisationCode || 'N/A'}
                                        </Typography>
                                    </Box>

                                </Box>
                            </Paper>}

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

                            {/* Delivery Vendor */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 80 }}>
                                    Delivery Vendor:
                                </Typography>
                                <TextField
                                    select
                                    size="small"
                                    value={selectedDeliveryVendor}
                                    onChange={handleDeliveryVendorChange}
                                    sx={{ minWidth: 270 }}
                                >
                                    <MenuItem value="">
                                        <em>Select Delivery Vendor</em>
                                    </MenuItem>
                                    {deliveryVendors.map((vendor) => (
                                        <MenuItem key={vendor._id} value={vendor._id}>
                                            {vendor.vendorName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>


                            {/* Billing Address - Alternative Approach */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 80 }}>
                                    Billing Address :
                                </Typography>
                                <Box sx={{ minWidth: 270 }}>
                                    {!billingDropdownOpen ? (
                                        <TextField
                                            size="small"
                                            value={formatAddressForDisplay(
                                                selectedBillingAddress === 'current'
                                                    ? tableData[0]?.billingAddress
                                                    : billingAddresses.find(addr => addr._id === selectedBillingAddress)
                                            )}
                                            onFocus={() => setBillingDropdownOpen(true)}
                                            sx={{ width: '100%' }}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                    ) : (
                                        <TextField
                                            select
                                            size="small"
                                            value={selectedBillingAddress}
                                            onChange={handleBillingAddressChange}
                                            onBlur={() => setBillingDropdownOpen(false)}
                                            sx={{ width: '100%' }}
                                            SelectProps={{
                                                open: true,
                                                onClose: () => setBillingDropdownOpen(false),
                                            }}
                                        >
                                            {/* <MenuItem value="current" >
                                                Current: {formatAddressForDisplay(tableData[0]?.billingAddress)}
                                            </MenuItem> */}
                                            {billingAddresses.map((address) => (
                                                <MenuItem key={address._id} value={address._id}>
                                                    {`${address.billingAddressOne}, ${address.billingCity}, ${address.billingState}`}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                </Box>
                            </Box>

                            {/* Shipping Address - Alternative Approach */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 80 }}>
                                    Shipping Address :
                                </Typography>
                                <Box sx={{ minWidth: 270 }}>
                                    {!shippingDropdownOpen ? (
                                        <TextField
                                            size="small"
                                            value={formatAddressForDisplay(
                                                selectedShippingAddress === 'current'
                                                    ? tableData[0]?.shippingAddress
                                                    : shippingAddresses.find(addr => addr._id === selectedShippingAddress)
                                            )}
                                            onFocus={() => setShippingDropdownOpen(true)}
                                            sx={{ width: '100%' }}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                    ) : (
                                        <TextField
                                            select
                                            size="small"
                                            value={selectedShippingAddress}
                                            onChange={handleShippingAddressChange}
                                            onBlur={() => setShippingDropdownOpen(false)}
                                            sx={{ width: '100%' }}
                                            SelectProps={{
                                                open: true,
                                                onClose: () => setShippingDropdownOpen(false),
                                            }}
                                        >
                                            {/* <MenuItem value="current">
                                                Current: {formatAddressForDisplay(tableData[0]?.shippingAddress)}
                                            </MenuItem> */}
                                            {shippingAddresses.map((address) => (
                                                <MenuItem key={address._id} value={address._id}>
                                                    {`${address.shippingAddressOne}, ${address.shippingCity}, ${address.shippingState}`}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                </Box>
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
                customerName={tableData[0]?.customerName || ''}
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