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
import axios from 'axios';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';

function descendingComparator(a, b, orderBy) {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    // Handle date fields by converting to timestamps
    if (orderBy === 'createdAt' || orderBy === 'updatedAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
    }
    // Handle string fields for case-insensitive comparison
    else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue || '').toLowerCase();
    }

    if (bValue < aValue) {
        return -1;
    }
    if (bValue > aValue) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return (a, b) => {
        const comp = descendingComparator(a, b, orderBy);
        return order === 'desc' ? comp : -comp;
    };
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const orderResult = comparator(a[0], b[0]);
        if (orderResult !== 0) return orderResult;
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
            </TableRow>
        </TableHead>
    );
}

const EnhancedTableToolbar = (props) => {
    const { numSelected, handleSearch, search, placeholder } = props;

    const handleExportCSV = async () => {
        try {
            const response = await axiosInstance.get(
                '/contact-us-data/export-contact-us',
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "contact_us_data_export.csv");
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
                    <Tooltip title="Export CSV">
                        <Button size="small" variant="outlined" onClick={handleExportCSV}>Export</Button>
                    </Tooltip>
                </>
            )}
        </Toolbar>
    );
};

const ListContactUsData = () => {
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('createdAt');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    const [tableData, setTableData] = React.useState([]);
    const [error, setError] = useState('');
    const sourceData = tableData || [];
    const [rows, setRows] = useState(sourceData);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    // Define headCells for contact us data
    const headCells = [
        {
            id: 'FullName',
            label: 'Full Name',
            numeric: false,
            disablePadding: false,
        },
        {
            id: 'Company',
            label: 'Company',
            numeric: false,
            disablePadding: false,
        },
        {
            id: 'Email',
            label: 'Email',
            numeric: false,
            disablePadding: false,
        },
        {
            id: 'PhoneNumber',
            label: 'Phone Number',
            numeric: false,
            disablePadding: false,
        },
        {
            id: 'Address',
            label: 'Address',
            numeric: false,
            disablePadding: false,
        },
        {
            id: 'Message',
            label: 'Message',
            numeric: false,
            disablePadding: false,
        },
        {
            id: 'createdAt',
            label: 'Submitted Date',
            numeric: false,
            disablePadding: false,
        },
    ];

    const fetchContactUsData = async () => {
        try {
            const response = await axiosInstance.get(`/contact-us-data/get-all-contact-us`);
            // console.log("contact us data response:- ", response);

            if (response.data.statusCode === 200) {
                // Updated to match your API response structure
                setTableData(response.data.data.contactUsEntries || []);
                setRows(response.data.data.contactUsEntries || []);
            }

        } catch (error) {
            console.error('Error fetching contact us data:', error);
            setError(error.message);
        }
    };

    React.useEffect(() => {
        fetchContactUsData();
    }, []);

    useEffect(() => {
        setRows(sourceData);
    }, [sourceData]);

    const handleSearch = (event) => {
        const searchValue = event.target.value.toLowerCase();
        setSearch(searchValue);

        const filteredRows = sourceData.filter((row) => {
            return (
                row?.FullName?.toLowerCase().includes(searchValue) ||
                row?.Company?.toLowerCase().includes(searchValue) ||
                row?.Email?.toLowerCase().includes(searchValue) ||
                row?.PhoneNumber?.toLowerCase().includes(searchValue) ||
                row?.Address?.toLowerCase().includes(searchValue) ||
                row?.Message?.toLowerCase().includes(searchValue)
            );
        });
        setRows(filteredRows);
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        setPage(0);
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

    const handleChangeDense = (event) => {
        setDense(event.target.checked);
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

    const handleDeleteContactUsData = async () => {
        try {
            setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

            const res = await axiosInstance.delete(`/contact-us-data/delete-contact-us/${deleteDialog.itemId}`);

            // console.log("deleted", res.data);

            if (res.data.statusCode === 200) {
                setTableData((prevData) => prevData.filter((item) => item._id !== deleteDialog.itemId));
                setRows((prevRows) => prevRows.filter((item) => item._id !== deleteDialog.itemId));
                handleDeleteCancel();
            }
        } catch (error) {
            console.error('Error deleting contact us entry:', error);
            setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
        }
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
            title: 'Contact Us Data',
        },
    ];



    return (
        <Box>
            <Breadcrumb title="Contact Us Data" items={BCrumb} />
            <Box>
                <EnhancedTableToolbar
                    numSelected={selected.length}
                    search={search}
                    handleSearch={handleSearch}
                    placeholder="Search Contact Us Entries"
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
                                                {/* Contact Us Data View */}
                                                <>
                                                    <TableCell sx={stickyCellStyle}>
                                                        <Box display="flex" gap={1}>
                                                            <Tooltip title="Delete">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={(e) => handleDeleteClick(e, row?._id, row?.FullName)}
                                                                >
                                                                    <IconTrash size="1.1rem" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Typography fontWeight="600">
                                                            {row?.FullName || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography>
                                                            {row?.Company || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography>
                                                            {row?.Email || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ minWidth: '200px' }}>
                                                        {row?.PhoneNumber &&
                                                            <Typography>
                                                                +61 {row?.PhoneNumber || 'N/A'}
                                                            </Typography>
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            sx={{
                                                                maxWidth: 200,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {row?.Address || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            sx={{
                                                                minWidth: 400,
                                                                maxWidth: 400,
                                                                whiteSpace: 'normal',
                                                                wordBreak: 'break-word',
                                                            }}
                                                        >
                                                            {row?.Message || 'N/A'}
                                                        </Typography>
                                                    </TableCell>


                                                    <TableCell>
                                                        <Typography>
                                                            {row.createdAt ? format(new Date(row.createdAt), 'E, MMM d yyyy') : 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                </>
                                            </TableRow>
                                        );
                                    })}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                                        <TableCell colSpan={headCells.length + 2} />
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
                onConfirm={handleDeleteContactUsData}
                itemName={deleteDialog.itemName}
                isDeleting={deleteDialog.isDeleting}
                itemType={"Contact Us Entry"}
            />
        </Box>
    );
};

export default ListContactUsData;