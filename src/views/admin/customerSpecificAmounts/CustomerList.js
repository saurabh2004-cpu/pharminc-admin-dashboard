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
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconSearch, IconTrash } from '@tabler/icons-react';
import { ProductContext } from "../../../context/EcommerceContext";
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';
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
                            'aria-label': 'select all customers',
                        }}
                    />
                </TableCell>}

                <TableCell sx={{ ...headCellStyle, ...stickyCellStyle }}>
                    Actions
                </TableCell>

                {headCells.map((headCell) => (
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

const CustomerList = () => {
    const { filteredAndSortedProducts } = useContext(ProductContext);

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('customerId');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState('');
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const { id } = useParams(); // This is the groupId
    const theme = useTheme();

    // Updated headCells for customer list based on API response
    const headCells = [
        {
            id: 'customerId',
            label: 'Customer ID',
            numeric: false,
            disablePadding: false,
        },
        {
            id: 'customerName',
            label: 'Customer Name',
            numeric: false,
            disablePadding: false,
        },
        {
            id: 'customerEmail',
            label: 'Email',
            numeric: false,
            disablePadding: false,
        },
        {
            id: 'CustomerPhoneNo',
            label: 'Phone',
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

    const fetchCustomersOfGroup = async () => {
        try {
            const response = await axiosInstance.get(`/customer-secific-amounts/get-customers-of-customer-specific-amount/${id}`);
            console.log("fetch Customers of Group ", response);

            if (response.data.statusCode === 200) {
                // Extract customers array from the nested response
                const customers = response.data.data.customers || [];
                setTableData(customers);
                setRows(customers);
            }
        } catch (error) {
            console.error('Error fetching customers list:', error);
            setError(error.message);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCustomersOfGroup();
        }
    }, [id]);

    const handleSearch = (event) => {
        const searchValue = event.target.value.toLowerCase();
        setSearch(searchValue);

        const filteredRows = tableData.filter((row) => {
            return (
                row?.customerId?.toLowerCase().includes(searchValue) ||
                row?.customerName?.toLowerCase().includes(searchValue) ||
                row?.customerEmail?.toLowerCase().includes(searchValue) ||
                row?.CustomerPhoneNo?.toLowerCase().includes(searchValue) ||
                row?.contactName?.toLowerCase().includes(searchValue) ||
                row?.contactEmail?.toLowerCase().includes(searchValue)
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isSelected = (customerId) => selected.indexOf(customerId) !== -1;

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

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

    const handleDeleteClick = (event, customerId, customerName) => {
        event.stopPropagation();
        setDeleteDialog({
            open: true,
            itemId: customerId,
            itemName: customerName,
            isDeleting: false
        });
    };

    const handleRemoveCustomerFromGroup = async () => {
        try {
            setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
            
            // Updated endpoint to match the route
            const res = await axiosInstance.post(
                `/customer-secific-amounts/remove-customer-from-customer-specific-amount/${id}/${deleteDialog.itemId}`
            );

            console.log("Customer removed", res.data);

            if (res.data.statusCode === 200) {
                // Remove the customer from the local state
                setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
                setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));
                handleDeleteCancel();
            }
        } catch (error) {
            console.error('Error removing customer from group:', error);
            setError(error?.response?.data?.message || error.message);
            setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const stickyCellStyle = {
        position: "sticky",
        left: 0,
        zIndex: 5,
        backgroundColor: '#ffffff',
    };

    return (
        <Box>
            <Box>
                <EnhancedTableToolbar
                    numSelected={selected.length}
                    search={search}
                    handleSearch={handleSearch}
                    placeholder="Search Customers"
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
                                                <TableCell sx={stickyCellStyle}>
                                                    <Box display="flex" gap={1}>
                                                        <Tooltip title="Remove Customer">
                                                            <IconButton 
                                                                size="small" 
                                                                color="error" 
                                                                onClick={(e) => handleDeleteClick(e, row?._id, row?.customerName || row?.contactName)}
                                                            >
                                                                <IconTrash size="1.1rem" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography fontWeight="600">
                                                        {row?.customerId || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography>
                                                        {row?.customerName || row?.contactName || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography>
                                                        {row?.customerEmail || row?.contactEmail || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography>
                                                        {row?.CustomerPhoneNo || row?.contactPhone || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography>
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

            {error && (
                <Box sx={{ p: 2 }}>
                    <Typography color="error">Error: {error}</Typography>
                </Box>
            )}

            <DeleteConfirmationDialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                onConfirm={handleRemoveCustomerFromGroup}
                itemName={deleteDialog.itemName}
                isDeleting={deleteDialog.isDeleting}
                itemType={"Customer from Group"}
            />
        </Box>
    );
};

export default CustomerList;