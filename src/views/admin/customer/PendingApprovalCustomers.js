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
    Menu,
    MenuItem,
    ListItemText,
    Chip,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit, IconKey, IconMapPin } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';
import ApproveConfirmationDialog from './ApproveConfirmationDialog';
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
                {headCells.map((headCell, index) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{
                            ...headCellStyle,
                            ...(index === 0 ? stickyCellStyle : {}),
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
        approvalFilter,
        setApprovalFilter
    } = props;

    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const openFilterMenu = Boolean(filterAnchorEl);

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleFilterSelect = (filterValue) => {
        setApprovalFilter(filterValue);
        handleFilterClose();
    };

    const handleExportCSV = async () => {
        try {
            const response = await axiosInstance.get(
                '/admin/export-unapproved-customers',
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "unapproved-customers-list.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting CSV:", error);
        }
    };

    const getFilterLabel = () => {
        switch (approvalFilter) {
            case 'unapproved':
                return 'Unapproved Only';
            case 'approved':
                return 'Approved Only';
            default:
                return 'All Customers';
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
                    <Tooltip title="Export CSV">
                        <IconButton onClick={handleExportCSV}>
                            <Button size="small" variant="outlined" >Export</Button>
                        </IconButton>
                    </Tooltip>
                </>
            )}
        </Toolbar>
    );
};

// Helper function to format addresses
const formatAddress = (address) => {
    if (!address) return 'N/A';

    const parts = [
        address.shippingAddressOne || address.billingAddressOne,
        address.shippingAddressTwo || address.billingAddressTwo,
        address.shippingAddressThree || address.billingAddressThree,
        address.shippingCity || address.billingCity,
        address.shippingState || address.billingState,
        address.shippingZip || address.billingZip
    ].filter(Boolean);

    return parts.join(', ');
};

// Component to display multiple addresses
// Grid layout with tabs for many addresses
const AddressesDisplay = ({ addresses, type }) => {
    const [selectedTab, setSelectedTab] = React.useState(0);

    if (!addresses || !Array.isArray(addresses) || addresses?.length === 0) {
        return <Typography variant="body2">No {type} addresses</Typography>;
    }

    return (
        <Box sx={{ maxWidth: 350 }}>
            {/* Tabs for navigation */}
            {addresses?.length > 1 && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
                    <Box sx={{ display: 'flex', overflowX: 'auto' }}>
                        {addresses.map((_, index) => (
                            <Button
                                key={index}
                                size="small"
                                variant={selectedTab === index ? "contained" : "text"}
                                onClick={() => setSelectedTab(index)}
                                sx={{
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.7rem',
                                    mr: 0.5
                                }}
                            >
                                {index + 1}
                            </Button>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Address Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 1,
                }}
            >
                {addresses.slice(selectedTab, selectedTab + 1).map((address, index) => (
                    <Box
                        key={selectedTab}
                        sx={{
                            p: 1.5,
                            border: '1px solid',
                            borderColor: 'primary.light',
                            borderRadius: 1,
                            backgroundColor: 'primary.50',
                        }}
                    >
                        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                            <IconMapPin size={14} style={{ marginRight: 6 }} />
                            <Typography variant="subtitle2" fontWeight="600">
                                {type} Address {selectedTab + 1}
                            </Typography>
                        </Box>

                        {/* Compact address details */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {[
                                address.shippingAddressOne || address.billingAddressOne,
                                address.shippingAddressTwo || address.billingAddressTwo,
                                address.shippingAddressThree || address.billingAddressThree,
                            ].filter(Boolean).map((line, lineIndex) => (
                                <Typography key={lineIndex} variant="body2" sx={{ fontSize: '0.75rem' }}>
                                    {line}
                                </Typography>
                            ))}

                            <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                {[
                                    address.shippingCity || address.billingCity,
                                    address.shippingState || address.billingState,
                                    address.shippingZip || address.billingZip
                                ].filter(Boolean).join(', ')}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

const PendingApprovalCustomers = ({
    showCheckBox,
    isProductsList = true,
    isBrandsList = true,
    loading
}) => {

    const {
        filteredAndSortedProducts,
    } = useContext(ProductContext);
    const headCells = [
        {
            id: 'Actions',
            numeric: false,
            disablePadding: false,
            label: 'Actions',
        },
        {
            id: 'customerId',
            numeric: false,
            disablePadding: false,
            label: 'Customer ID',
        },
        {
            id: 'customerName',
            numeric: false,
            disablePadding: false,
            label: 'Customer Name',
        },
        {
            id: 'contactName',
            numeric: false,
            disablePadding: false,
            label: 'Contact Name',
        },
        {
            id: 'customerEmail',
            numeric: false,
            disablePadding: false,
            label: 'Customer Email',
        },
        {
            id: 'contactEmail',
            numeric: false,
            disablePadding: false,
            label: 'Contact Email',
        },
        {
            id: 'CustomerPhoneNo',
            numeric: false,
            disablePadding: false,
            label: 'Phone Number',
        },
        {
            id: 'category',
            numeric: false,
            disablePadding: false,
            label: 'Category',
        },
        {
            id: 'primaryBrand',
            numeric: false,
            disablePadding: false,
            label: 'Primary Brand',
        },
        {
            id: 'netTerms',
            numeric: false,
            disablePadding: false,
            label: 'Net Terms',
        },
        {
            id: 'orderApproval',
            numeric: false,
            disablePadding: false,
            label: 'Order Approval',
        },
        {
            id: 'defaultShippingRate',
            numeric: false,
            disablePadding: false,
            label: 'Shipping Rate',
        },
        {
            id: 'shippingAddresses',
            numeric: false,
            disablePadding: false,
            label: 'Shipping Addresses',
        },
        {
            id: 'billingAddresses',
            numeric: false,
            disablePadding: false,
            label: 'Billing Addresses',
        },
        {
            id: 'inactive',
            numeric: false,
            disablePadding: false,
            label: 'Status',
        },
        {
            id: 'createdAt',
            numeric: false,
            disablePadding: false,
            label: 'Created Date',
        },
    ];


    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('calories');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [approvalFilter, setApprovalFilter] = useState('all');
    const [tableData, setTableData] = useState([]);
    const [approveDialog, setApproveDialog] = useState({
        open: false,
        customerId: null,
        customerData: null,
        isApproving: false
    });

    const sourceData = tableData || [];
    const [rows, setRows] = useState(sourceData);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    // Define column widths
    const columnWidths = {
        serial: { minWidth: '80px' },
        sku: { minWidth: '150px' },
        productName: { minWidth: '280px' },
        stockLevel: { minWidth: '240px' },
        pricingGroup: { minWidth: '220px' },
        brand: { minWidth: '220px' },
        category: { minWidth: '220px' },
        subCategory: { minWidth: '220px' },
        storeDescription: { minWidth: '300px' },
        pageTitle: { minWidth: '300px' },
        eachBarcodes: { minWidth: '150px' },
        orderApprovel: { minWidth: '300px' },
        packBarcodes: { minWidth: '150px' },
        defaultShippingRate: { minWidth: '200px' },
        createdAt: { minWidth: '160px' },
        actions: { minWidth: '160px' },
        addresses: { minWidth: '300px' }, // Wider for addresses
    };

    useEffect(() => {
        let filteredData = sourceData;

        // Apply approval filter using inactive field
        if (approvalFilter === 'unapproved') {
            filteredData = filteredData.filter(row => row.inactive === true);
        } else if (approvalFilter === 'approved') {
            filteredData = filteredData.filter(row => row.inactive === false);
        }

        // Then apply search filter if search is active
        if (search.trim()) {
            const searchValue = search.toLowerCase();
            filteredData = filteredData.filter((row) => {
                // Search in addresses as well
                const shippingAddressesText = row.shippingAddresses?.map(addr =>
                    Object.values(addr).join(' ').toLowerCase()
                ).join(' ') || '';

                const billingAddressesText = row.billingAddresses?.map(addr =>
                    Object.values(addr).join(' ').toLowerCase()
                ).join(' ') || '';

                return (
                    row.customerId?.toLowerCase().includes(searchValue) ||
                    row.customerName?.toLowerCase().includes(searchValue) ||
                    row.contactName?.toLowerCase().includes(searchValue) ||
                    row.customerEmail?.toLowerCase().includes(searchValue) ||
                    row.contactEmail?.toLowerCase().includes(searchValue) ||
                    row.CustomerPhoneNo?.toString().toLowerCase().includes(searchValue) ||
                    row.category?.toLowerCase().includes(searchValue) ||
                    row.primaryBrand?.toLowerCase().includes(searchValue) ||
                    row.netTerms?.toString().toLowerCase().includes(searchValue) ||
                    row.orderApproval?.toLowerCase().includes(searchValue) ||
                    row.defaultShippingRate?.toString().toLowerCase().includes(searchValue) ||
                    shippingAddressesText.includes(searchValue) ||
                    billingAddressesText.includes(searchValue) ||
                    (row.inactive ? "unapproved" : "approved").includes(searchValue) ||
                    (row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString().toLowerCase().includes(searchValue)
                        : false)
                );
            });
        }

        // Set the filtered rows
        if (isBrandsList) {
            setRows(filteredData);
        } else {
            setRows(filteredAndSortedProducts);
        }
    }, [sourceData, filteredAndSortedProducts, isBrandsList, search, approvalFilter]);

    const handleSearch = (event) => {
        setSearch(event.target.value);
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

    const handleApproveClick = (event, customer) => {
        event.stopPropagation();
        setApproveDialog({
            open: true,
            customerId: customer._id,
            customerData: customer,
            isApproving: false
        });
    };

    const handleApproveConfirm = async () => {
        setApproveDialog(prev => ({ ...prev, isApproving: true }));

        try {
            const response = await axiosInstance.put(`/admin/approve-customer/${approveDialog.customerId}`);
            // console.log("response approval", response);

            if (response.data.statusCode === 200) {
                // Remove the approved customer from both tableData and rows
                setTableData((prevData) =>
                    prevData.filter((customer) => customer._id !== approveDialog.customerId)
                );
                setRows((prevRows) =>
                    prevRows.filter((customer) => customer._id !== approveDialog.customerId)
                );

                // console.log(`Customer ${approveDialog.customerId} approved and removed from pending list`);
            }
        } catch (error) {
            console.error('Error approving customer:', error);
        } finally {
            setApproveDialog({
                open: false,
                customerId: null,
                customerData: null,
                isApproving: false
            });
        }
    };

    const handleApproveCancel = () => {
        setApproveDialog({
            open: false,
            customerId: null,
            customerData: null,
            isApproving: false
        });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
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
        event.stopPropagation();
        setDeleteDialog({
            open: true,
            itemId: id,
            itemName: name,
            isDeleting: false
        });
    };

    const handleDelete = async () => {
        try {
            const res = await axiosInstance.delete(`/admin/delete-user/${deleteDialog.itemId}`);
            // console.log("deleted", res.data);

            if (res.data.statusCode === 200) {
                setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
                setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));
                handleDeleteCancel();
            }
        } catch (error) {
            console.error('Error deleting pack:', error);
        }
    };

    const handleEdit = (id) => {
        navigate(`/dashboard/customers/edit/${id}`);
    };

    const handleChangePassword = (email) => {
        navigate(`/dashboard/customers/change-password/${email}`);
    };

    const stickyCellStyle = {
        position: "sticky",
        left: 0,
        zIndex: 5,
        backgroundColor: '#f0f8ff',
    };

    const fetchCustomers = async () => {
        try {
            const response = await axiosInstance.get('/admin/get-unapproved-customers');
            // console.log("response customerssss", response);

            if (response.data.statusCode === 200) {
                setTableData(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error('Error fetching customers list:', error);
            setTableData([]);
        }
    }

    useEffect(() => {
        fetchCustomers();
    }, [])

    const BCrumb = [
        {
            to: '/',
            title: 'Home',
        },
        {
            title: 'Pending Customers List',
        },
    ];

    return (
        <Box>
            <Breadcrumb title="Pending Customers List" items={BCrumb} />
            <Box>
                <EnhancedTableToolbar
                    numSelected={selected?.length}
                    search={search}
                    handleSearch={handleSearch}
                    placeholder={isBrandsList ? "Search Brand" : "Search Customer"}
                    approvalFilter={approvalFilter}
                    setApprovalFilter={setApprovalFilter}
                />
                <Paper variant="outlined" sx={{ mx: 2, mt: 1, border: `1px solid ${borderColor}` }}>
                    <TableContainer sx={{ width: "100%" }}>
                        <Table
                            sx={{
                                minWidth: 1800,
                                borderCollapse: "collapse",
                                "& td, & th": {
                                    paddingTop: "4px",
                                    paddingBottom: "4px",
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
                                numSelected={selected?.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick}
                                onRequestSort={handleRequestSort}
                                rowCount={rows.length}
                                showCheckBox={showCheckBox}
                                headCells={headCells}
                            />
                            {loading ?
                                <Box sx={{
                                    display: 'flex',
                                    width: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    p: 3
                                }}>
                                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Loading ...
                                    </Typography>
                                </Box>
                                : <TableBody>
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
                                                        <>
                                                            <TableCell sx={stickyCellStyle}>
                                                                <Box display="flex" gap={1}>
                                                                    <Tooltip title="Edit">
                                                                        <IconButton size="small" color="primary" onClick={() => handleEdit(row._id)}>
                                                                            <IconEdit size="1.1rem" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Delete">
                                                                        <IconButton size="small" color="error" onClick={(e) => handleDeleteClick(e, row._id, row.customerName)}>
                                                                            <IconTrash size="1.1rem" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Change Password">
                                                                        <IconButton
                                                                            size="small"
                                                                            color="secondary"
                                                                            onClick={() => handleChangePassword(row.customerEmail ? row.customerEmail : row.contactEmail)}
                                                                        >
                                                                            <IconKey size="1.1rem" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </TableCell>

                                                            <TableCell sx={columnWidths.sku}>
                                                                <Typography fontWeight="500" variant="subtitle2">
                                                                    {row.customerId || 'N/A'}
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell sx={columnWidths.productName}>
                                                                <Typography fontWeight="400">
                                                                    {row.customerName || 'N/A'}
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell sx={columnWidths.stockLevel}>
                                                                <Typography fontWeight="400">
                                                                    {row.contactName || 'N/A'}
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell sx={columnWidths.pricingGroup}>
                                                                <Typography fontWeight="400">
                                                                    {row.customerEmail || 'N/A'}
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell sx={columnWidths.brand}>
                                                                <Typography fontWeight="400">
                                                                    {row.contactEmail || 'N/A'}
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell sx={columnWidths.category}>
                                                                <Typography fontWeight="400">
                                                                    {row.CustomerPhoneNo || 'N/A'}
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell sx={columnWidths.subCategory}>
                                                                <Typography fontWeight="400">
                                                                    {row.category || 'N/A'}
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell sx={columnWidths.storeDescription}>
                                                                <Typography fontWeight="400">
                                                                    {row.primaryBrand || 'N/A'}
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell sx={columnWidths.pageTitle}>
                                                                <Typography fontWeight="400">
                                                                    {isNaN(row.netTerms) ? 'N/A' : row.netTerms}
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell sx={columnWidths.eachBarcodes}>
                                                                <Typography fontWeight="400">
                                                                    {row.orderApproval || 'N/A'}
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell sx={columnWidths.defaultShippingRate}>
                                                                <Typography fontWeight="400">
                                                                    {isNaN(row.defaultShippingRate) ? 'N/A' : row.defaultShippingRate}
                                                                </Typography>
                                                            </TableCell>

                                                            {/* Shipping Addresses */}
                                                            <TableCell sx={columnWidths.addresses}>
                                                                <AddressesDisplay
                                                                    addresses={row.shippingAddresses}
                                                                    type="Shipping"
                                                                />
                                                            </TableCell>

                                                            {/* Billing Addresses */}
                                                            <TableCell sx={columnWidths.addresses}>
                                                                <AddressesDisplay
                                                                    addresses={row.billingAddresses}
                                                                    type="Billing"
                                                                />
                                                            </TableCell>

                                                            <TableCell sx={columnWidths.packBarcodes}>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <Chip
                                                                        label={row.inactive ? 'Unapproved' : 'Approved'}
                                                                        color={row.inactive ? 'warning' : 'success'}
                                                                        size="small"
                                                                    />
                                                                    {row.inactive && (
                                                                        <Tooltip title="Approve Customer">
                                                                            <Button
                                                                                size="small"
                                                                                variant="contained"
                                                                                color="success"
                                                                                onClick={(e) => handleApproveClick(e, row)}
                                                                                sx={{ minWidth: '90px', fontSize: '0.7rem' }}
                                                                            >
                                                                                Approve
                                                                            </Button>
                                                                        </Tooltip>
                                                                    )}
                                                                </Box>
                                                            </TableCell>

                                                            <TableCell sx={columnWidths.createdAt}>
                                                                <Typography fontWeight="400">
                                                                    {row.createdAt ? format(new Date(row.createdAt), 'E, MMM d yyyy') : 'N/A'}
                                                                </Typography>
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
                                            <TableCell colSpan={headCells?.length + (showCheckBox ? 1 : 0)} />
                                        </TableRow>
                                    )}
                                </TableBody>}
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 30, 50, 100, 200]}
                        component="div"
                        count={rows?.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Box>

            <DeleteConfirmationDialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                onConfirm={handleDelete}
                itemName={deleteDialog.itemName}
                isDeleting={deleteDialog.isDeleting}
                itemType={"Customers"}
            />

            <ApproveConfirmationDialog
                open={approveDialog.open}
                onClose={handleApproveCancel}
                onConfirm={handleApproveConfirm}
                customerData={approveDialog.customerData}
                isApproving={approveDialog.isApproving}
            />
        </Box>
    );
};

export default PendingApprovalCustomers;