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
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
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

const CustomersByPricingGroups = () => {
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('customerId');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    const [tableData, setTableData] = useState([]);
    const [flattenedCustomerData, setFlattenedCustomerData] = useState([]);
    const [error, setError] = useState('');
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const { pricingGroupId } = useParams();

    // Define headCells for the table
    const headCells = [
        {
            key: 1,
            id: 'customerId',
            label: 'Customer ID',
            numeric: false,
            disablePadding: false
        },
        {
            key: 2,
            id: 'customerName',
            label: 'Customer Name',
            numeric: false,
            disablePadding: false
        },
        {
            key: 3,
            id: 'customerEmail',
            label: 'Customer Email',
            numeric: false,
            disablePadding: false
        },
        {
            key: 4,
            id: 'percentage',
            label: 'Discount Percentage',
            numeric: false,
            disablePadding: false
        },
        {
            key: 5,
            id: 'updatedAt',
            label: 'Last Updated Date',
            numeric: false,
            disablePadding: false
        }
    ];

    // Function to flatten the nested customer data
    const flattenCustomerData = (apiData) => {
        const flattened = [];

        apiData.forEach(pricingGroupDiscount => {
            if (pricingGroupDiscount.customers && Array.isArray(pricingGroupDiscount.customers)) {
                pricingGroupDiscount.customers.forEach(customer => {
                    flattened.push({
                        // Customer details
                        _id: customer._id, // The customer discount entry ID
                        customerId: customer.user?.customerId,
                        customerName: customer.user?.customerName,
                        customerEmail: customer.user?.customerEmail,
                        percentage: customer.percentage,
                        userId: customer.user?._id, // Add user ID for deletion

                        // Pricing group discount details
                        pricingGroupDiscountId: pricingGroupDiscount._id,
                        pricingGroupId: pricingGroupDiscount.pricingGroup,
                        createdAt: pricingGroupDiscount.createdAt,
                        updatedAt: pricingGroupDiscount.updatedAt
                    });
                });
            }
        });

        return flattened;
    };

    const fetchCustomersByPricingGroupId = async () => {
        try {
            const res = await axiosInstance.get(`/pricing-groups-discount/get-customers-by-pricing-group-id/${pricingGroupId}`);
            // console.log("response customers by pricing group id ", res);

            if (res.data.statusCode === 200) {
                setTableData(res.data.data);

                // Flatten the nested customer data
                const flattenedData = flattenCustomerData(res.data.data);
                setFlattenedCustomerData(flattenedData);
                setRows(flattenedData);


            } else {
                console.error(res.data.message);
                setError(res.data.message);
            }
        } catch (error) {
            console.error(error.message);
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchCustomersByPricingGroupId();
    }, [pricingGroupId]);

    const handleSearch = (event) => {
        const searchValue = event.target.value.toLowerCase();
        setSearch(searchValue);

        const filteredRows = flattenedCustomerData.filter((row) => {
            return (
                row?.customerId?.toLowerCase().includes(searchValue) ||
                row?.customerName?.toLowerCase().includes(searchValue) ||
                row?.customerEmail?.toLowerCase().includes(searchValue) ||
                row?.percentage?.toString().includes(searchValue)
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
        userId: null,
        pricingGroupDiscountId: null,
        itemName: '',
        isDeleting: false
    });

    const handleDeleteCancel = () => {
        setDeleteDialog({
            open: false,
            itemId: null,
            userId: null,
            pricingGroupDiscountId: null,
            itemName: '',
            isDeleting: false
        });
    };

    const handleDeleteClick = (event, discountEntryId, customerName, userId, pricingGroupDiscountId) => {
        event.stopPropagation();
        setDeleteDialog({
            open: true,
            itemId: discountEntryId,
            userId: userId,
            pricingGroupDiscountId: pricingGroupDiscountId,
            itemName: customerName,
            isDeleting: false
        });
    };

    const handleDeleteCustomerDiscount = async () => {
        try {
            setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

            const res = await axiosInstance.delete(
                `/pricing-groups-discount/remove-customer-from-pricingGroup-discount/${deleteDialog.userId}/${deleteDialog.pricingGroupDiscountId}`
            );

            // console.log("deleted customer from discount", res.data);

            if (res.data.statusCode === 200) {
                // Refresh the data after deletion
                fetchCustomersByPricingGroupId();
                handleDeleteCancel();
            }
        } catch (error) {
            console.error('Error deleting customer discount:', error);
            setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const handleEditCustomerDiscount = (customerData) => {
        navigate(`/dashboard/edit-customers-percentage/${customerData.userId}/${customerData.pricingGroupDiscountId}/${pricingGroupId}`);
    };

    const stickyCellStyle = {
        position: "sticky",
        left: 0,
        zIndex: 5,
        backgroundColor: '#f0f8ff',
    };

    const BCrumb = [
        {
            to: '/',
            title: 'Home',
        },
        {
            title: 'Pricing Groups Customers List',
        },
    ];


    return (
        <Box>
            <Breadcrumb title="Pricing Groups Customers List" items={BCrumb} />

            <Box>
                <EnhancedTableToolbar
                    numSelected={selected.length}
                    search={search}
                    handleSearch={handleSearch}
                    placeholder="Search Customer ID, Name, Email or Percentage"
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
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => handleEditCustomerDiscount(row)}
                                                            >
                                                                <IconEdit size="1.1rem" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={(e) => handleDeleteClick(
                                                                    e,
                                                                    row._id,
                                                                    row.customerName || 'Customer',
                                                                    row.userId,
                                                                    row.pricingGroupDiscountId
                                                                )}
                                                            >
                                                                <IconTrash size="1.1rem" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>

                                                {/* Customer ID */}
                                                <TableCell>
                                                    <Typography fontWeight="600">
                                                        {row.customerId || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                {/* Customer Name */}
                                                <TableCell>
                                                    <Typography>
                                                        {row.customerName || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                {/* Customer Email */}
                                                <TableCell>
                                                    <Typography>
                                                        {row.customerEmail || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                {/* Discount Percentage */}
                                                <TableCell>
                                                    <Typography
                                                        fontWeight="600"
                                                        color={row.percentage?.startsWith('+') ? 'success.main' : 'error.main'}
                                                    >
                                                        {row.percentage || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                {/* Last Updated Date */}
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {row.updatedAt ? format(new Date(row.updatedAt), 'E, MMM d yyyy') : 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                                        <TableCell colSpan={headCells.length + 1} />
                                    </TableRow>
                                )}
                                {rows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={headCells.length + 1} align="center" sx={{ py: 3 }}>
                                            <Typography variant="h6" color="textSecondary">
                                                {search ? 'No customers found matching your search' : 'No customers found for this pricing group'}
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
                onConfirm={handleDeleteCustomerDiscount}
                itemName={deleteDialog.itemName}
                isDeleting={deleteDialog.isDeleting}
                itemType="Customer Discount"
            />
        </Box>
    );
};

export default CustomersByPricingGroups;