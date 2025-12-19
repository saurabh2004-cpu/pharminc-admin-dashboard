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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit, IconX } from '@tabler/icons-react';
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
    const { numSelected, handleSearch, search, placeholder, roleFilter, handleRoleFilter, statusFilter, handleStatusFilter } = props;

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
                <Box sx={{ flex: '1 1 100%', display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        placeholder={placeholder || "Search Admin"}
                        size="small"
                        onChange={handleSearch}
                        value={search}
                        sx={{ minWidth: 250 }}
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

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Role Filter</InputLabel>
                        <Select
                            value={roleFilter}
                            label="Role Filter"
                            onChange={handleRoleFilter}
                        >
                            <MenuItem value="ALL">All Roles</MenuItem>
                            <MenuItem value="MASTER ADMIN">Master Admin</MenuItem>
                            <MenuItem value="SUB ADMIN">Sub Admin</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status Filter</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status Filter"
                            onChange={handleStatusFilter}
                        >
                            <MenuItem value="ALL">All Status</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                        </Select>
                    </FormControl>
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

const ListAdmins = () => {
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('username');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    const [tableData, setTableData] = useState([]);
    const [error, setError] = useState('');
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const navigate = useNavigate();

    // Define headCells for the table - Updated to match admin schema
    const headCells = [
        {
            key: 1,
            id: 'username',
            label: 'Admin Name',
            numeric: false,
            disablePadding: false
        },
        {
            key: 2,
            id: 'email',
            label: 'Email',
            numeric: false,
            disablePadding: false
        },
        {
            key: 3,
            id: 'role',
            label: 'Role',
            numeric: false,
            disablePadding: false
        },
        {
            key: 4,
            id: 'status',
            label: 'Status',
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

    // Apply all filters (search, role, status)
    const applyFilters = () => {
        let filteredData = [...tableData];

        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filteredData = filteredData.filter((row) => {
                const username = row?.username?.toLowerCase() || '';
                const email = row?.email?.toLowerCase() || '';
                const role = row?.role?.toLowerCase() || '';
                const status = row?.status?.toLowerCase() || '';

                return (
                    username.includes(searchLower) ||
                    email.includes(searchLower) ||
                    role.includes(searchLower) ||
                    status.includes(searchLower)
                );
            });
        }

        // Apply role filter
        if (roleFilter !== 'ALL') {
            filteredData = filteredData.filter((row) => row?.role === roleFilter);
        }

        // Apply status filter
        if (statusFilter !== 'ALL') {
            filteredData = filteredData.filter((row) => row?.status === statusFilter);
        }

        setRows(filteredData);
        setPage(0); // Reset to first page when filters change
    };

    // Update filters whenever search, roleFilter, statusFilter, or tableData changes
    useEffect(() => {
        applyFilters();
    }, [search, roleFilter, statusFilter, tableData]);

    const handleSearch = (event) => {
        setSearch(event.target.value);
    };

    const handleRoleFilter = (event) => {
        setRoleFilter(event.target.value);
    };

    const handleStatusFilter = (event) => {
        setStatusFilter(event.target.value);
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
        adminId: null,
        adminName: '',
        isDeleting: false
    });

    const handleDeleteCancel = () => {
        setDeleteDialog({
            open: false,
            adminId: null,
            adminName: '',
            isDeleting: false
        });
    };

    const handleDeleteClick = (event, adminId, adminName) => {
        event.stopPropagation();
        setDeleteDialog({
            open: true,
            adminId: adminId,
            adminName: adminName,
            isDeleting: false
        });
    };

    const handleDeleteAdmin = async () => {
        if (!deleteDialog.adminId) return;

        setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

        try {
            const response = await axiosInstance.delete(`/admin/delete-admin/${deleteDialog.adminId}`);

            if (response.data.statusCode === 200) {
                // Remove the deleted admin from the local state
                setTableData(prev => prev.filter(admin => admin._id !== deleteDialog.adminId));

                // Show success message (you can add a toast notification here)
                // console.log('Admin deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting admin:', error);
            setError('Failed to delete admin');
        } finally {
            setDeleteDialog({
                open: false,
                adminId: null,
                adminName: '',
                isDeleting: false
            });
        }
    };

    const fetchAdminsList = async () => {
        try {
            const response = await axiosInstance.get('/admin/get-all-admins');
            // console.log("admins list Response", response);

            if (response.data.statusCode === 200) {
                setTableData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
            setError('Failed to load admins list');
        }
    };

    useEffect(() => {
        fetchAdminsList();
    }, []);

    const handleEditAdmin = (adminData) => {
        navigate(`/dashboard/admin/Edit/${adminData._id}`);
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
            title: 'Admins List',
        },
    ];


    return (
        <Box>
            <Breadcrumb title="Admins List" items={BCrumb} />
            <Box>
                <EnhancedTableToolbar
                    numSelected={selected.length}
                    search={search}
                    handleSearch={handleSearch}
                    placeholder="Search Admin Name, Email, Role or Status"
                    roleFilter={roleFilter}
                    handleRoleFilter={handleRoleFilter}
                    statusFilter={statusFilter}
                    handleStatusFilter={handleStatusFilter}
                />

                {/* Active Filters Display */}
                {(roleFilter !== 'ALL' || statusFilter !== 'ALL' || search) && (
                    <Box sx={{ mx: 2, mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {search && (
                            <Chip
                                label={`Search: "${search}"`}
                                onDelete={() => setSearch('')}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        )}
                        {roleFilter !== 'ALL' && (
                            <Chip
                                label={`Role: ${roleFilter}`}
                                onDelete={() => setRoleFilter('ALL')}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        )}
                        {statusFilter !== 'ALL' && (
                            <Chip
                                label={`Status: ${statusFilter}`}
                                onDelete={() => setStatusFilter('ALL')}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        )}
                    </Box>
                )}

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
                                                                onClick={() => handleEditAdmin(row)}
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
                                                                    row.username
                                                                )}
                                                            >
                                                                <IconTrash size="1.1rem" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>

                                                {/* Admin Name */}
                                                <TableCell>
                                                    <Typography fontWeight="600">
                                                        {row.username || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                {/* Email */}
                                                <TableCell>
                                                    <Typography>
                                                        {row.email || 'N/A'}
                                                    </Typography>
                                                </TableCell>

                                                {/* Role */}
                                                <TableCell>
                                                    <Chip
                                                        label={row.role || 'N/A'}
                                                        size="small"
                                                        color={row.role === 'MASTER ADMIN' ? 'primary' : 'secondary'}
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    <Chip
                                                        label={row.status || 'N/A'}
                                                        size="small"
                                                        color={row.status === 'ACTIVE' ? 'success' : 'error'}
                                                        sx={{ fontWeight: 600 }}
                                                    />
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
                                                {search || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                                                    ? 'No admins found matching your filters'
                                                    : 'No admins found'}
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
                onConfirm={handleDeleteAdmin}
                itemName={deleteDialog.adminName}
                isDeleting={deleteDialog.isDeleting}
                itemType="Admin"
            />
        </Box>
    );
};

export default ListAdmins;