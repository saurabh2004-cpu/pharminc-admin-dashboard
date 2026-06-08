// admin/src/components/apps/ecommerce/ProductTableList/ProductTableList.jsx
import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../forms/theme-elements/CustomCheckbox';
import { IconFilter, IconSearch, IconTrash, IconEdit, IconBriefcase, IconReceipt, IconEye, IconCheck } from '@tabler/icons-react';
import axiosInstance from '../../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { DeleteConfirmationDialog } from '../utils/ConfirmDeletePopUp';
import { deleteAdmin } from 'src/services/adminService';

// Keep getComparator, descendingComparator, stableSort
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
          />
        </TableCell>}
        {headCells.map((headCell, index) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : '2'}
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
              sx={{
                userSelect: 'text',
                '& .MuiTableSortLabel-icon': { opacity: 0.5 },
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
  const { numSelected, handleSearch, search, placeholder, statusFilter, onStatusFilterChange, statusFilterOptions } = props;
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
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
          <IconButton><IconTrash width="18" /></IconButton>
        </Tooltip>
      ) : (
        <Box display="flex" alignItems="center" gap={2}>
          {statusFilterOptions && (
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="status-filter-label">Status Filter</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                onChange={onStatusFilterChange}
                label="Status Filter"
              >
                {statusFilterOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Tooltip title="Filter list">
            <IconButton><IconFilter size="1.2rem" /></IconButton>
          </Tooltip>
        </Box>
      )}
    </Toolbar>
  );
};

const ProductTableList = ({
  showCheckBox,
  headCells,
  tableData,
  isInstitutesList = false,
  isAdminList = false,
  isPanelBrandsList = false,
  isServicesList = false,
  isAddressesList = false,
  isLocationsList = false,
  isBlogsList = false,
  isConsultationsList = false,
  isLabelsList = false,
  isKeywordsList = false,
  onStatusChange,
  setTableData,
  serverPagination = false,
  totalCount = 0,
  page: externalPage = 0,
  rowsPerPage: externalRowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  statusFilter,
  onStatusFilterChange,
  statusFilterOptions,
  onDelete
}) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState([]);
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  const page = serverPagination ? externalPage : internalPage;
  const rowsPerPage = serverPagination ? externalRowsPerPage : internalRowsPerPage;

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    itemId: null,
    itemName: '',
    isDeleting: false
  });

  useEffect(() => {
    if (!serverPagination) window.scrollTo(0, 0);
  }, [page, serverPagination]);

  const sourceData = tableData || [];
  const [rows, setRows] = useState(sourceData);
  const navigate = useNavigate();

  useEffect(() => {
    setRows(sourceData);
  }, [sourceData]);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    const filteredRows = sourceData.filter((row) => {
      if (row.name) return row.name.toLowerCase().includes(searchValue);
      if (row.email) return row.email.toLowerCase().includes(searchValue);
      return false;
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
      const newSelecteds = rows.map((n) => n.name || n.email || n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    if (serverPagination) {
      if (onPageChange) onPageChange(event, newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    if (serverPagination) {
      if (onRowsPerPageChange) onRowsPerPageChange(event);
    } else {
      setInternalRowsPerPage(parseInt(event.target.value, 10));
      setInternalPage(0);
    }
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;
  const emptyRows = serverPagination ? 0 : page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
  const theme = useTheme();
  const borderColor = theme.palette.divider;

  const handleDeleteClick = (event, id, name) => {
    event.stopPropagation();
    setDeleteDialog({
      open: true,
      itemId: id,
      itemName: name,
      isDeleting: false
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, itemId: null, itemName: '', isDeleting: false });
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
    try {
      const deleteId = deleteDialog.itemId;
      if (onDelete) {
        await onDelete(deleteId);
      } else {
        if (isAdminList) {
          await deleteAdmin(deleteId);
        } else if (isInstitutesList) {
          await axiosInstance.delete(`/institute/delete-institute/${deleteId}`);
        }
      }

      setTableData((prevData) => prevData.filter((item) => (item._id || item.id) !== deleteId));
      setRows((prevRows) => prevRows.filter((item) => (item._id || item.id) !== deleteId));
      handleDeleteCancel();
    } catch (error) {
      console.error('Error deleting:', error);
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
      alert("Failed to delete. Please try again.");
    }
  };

  const handleStatusToggle = async (event, id, newStatus) => {
    event.stopPropagation();
    try {
      if (onStatusChange) {
        await onStatusChange(id, newStatus);
      }
    } catch (err) {
      console.error("Failed to change status", err);
    }
  };

  const handleEditClick = (event, id) => {
    event.stopPropagation();
    if (isPanelBrandsList) {
      navigate(`/dashboard/panel-brands/edit/${id}`);
    } else if (isServicesList) {
      navigate(`/dashboard/services/edit/${id}`);
    } else if (isAddressesList) {
      navigate(`/dashboard/addresses/edit/${id}`);
    } else if (isLocationsList) {
      navigate(`/dashboard/locations/edit/${id}`);
    } else if (isBlogsList) {
      navigate(`/dashboard/blogs/edit/${id}`);
    } else if (isConsultationsList) {
      navigate(`/dashboard/consultations/view/${id}`);
    } else if (isLabelsList) {
      navigate(`/dashboard/labels/edit/${id}`);
    }
  };

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5,
    backgroundColor: '#f0f8ff',
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder={isInstitutesList ? "Search Institute" : isPanelBrandsList ? "Search Panel Brand" : isServicesList ? "Search Service" : isAddressesList ? "Search Address" : isLocationsList ? "Search Location" : isBlogsList ? "Search Blog" : isConsultationsList ? "Search Consultation" : isLabelsList ? "Search Label" : isKeywordsList ? "Search Keyword" : "Search"}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          statusFilterOptions={statusFilterOptions}
        />
        <Paper variant="outlined" sx={{ mt: 1, border: `1px solid ${borderColor}`, borderRadius: 0 }}>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table
              sx={{
                minWidth: "100%",
                tableLayout: "auto",
                borderCollapse: "collapse",
                "& td, & th": {
                  whiteSpace: "nowrap",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  borderRight: "1px solid rgba(224, 224, 224, 1)",
                },
                "& td:last-child, & th:last-child": {
                  borderRight: "none",
                },
              }}
              size="small"
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
                {(serverPagination ? rows : stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage))
                  .map((row, index) => {
                    const isItemSelected = isSelected(row.name || row.email || row.id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id || row._id}
                        selected={isItemSelected}
                      >
                        {showCheckBox && <TableCell padding="checkbox">
                          <CustomCheckbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{ 'aria-labelledby': labelId }}
                          />
                        </TableCell>}

                        {isPanelBrandsList ? (
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit">
                                  <IconButton size="small" color="primary" onClick={(event) => handleEditClick(event, row.id || row._id)}>
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(event) => handleDeleteClick(event, row.id || row._id, row.name)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="600">{row.name}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.rate}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{format(new Date(row.createdAt || new Date()), 'E, MMM d yyyy')}</Typography>
                            </TableCell>
                          </>
                        ) : isInstitutesList ? (
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit">
                                  <IconButton size="small" color="primary" onClick={(event) => handleEditClick(event, row.id || row._id)}>
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(event) => handleDeleteClick(event, row.id || row._id, row.name)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="600">{row.name}</Typography>
                            </TableCell>
                            <TableCell><Typography>{row.role}</Typography></TableCell>
                            <TableCell><Typography>{row.verified ? 'Yes' : 'No'}</Typography></TableCell>
                            <TableCell><Typography>{row.contactEmail}</Typography></TableCell>
                            <TableCell><Typography>{row.contactNumber}</Typography></TableCell>
                            <TableCell><Typography>{row.city}</Typography></TableCell>
                            <TableCell><Typography>{row.country}</Typography></TableCell>
                            <TableCell><Typography>{row.credits || 0}</Typography></TableCell>
                            <TableCell><Typography>{row.totalJobsPosted || 0}</Typography></TableCell>
                            <TableCell><Typography>{format(new Date(row.createdAt || new Date()), 'E, MMM d yyyy')}</Typography></TableCell>
                          </>
                        ) : isAdminList ? (
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit">
                                  <IconButton size="small" color="primary" onClick={(event) => handleEditClick(event, row.id || row._id)}>
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(event) => handleDeleteClick(event, row.id || row._id, row.email)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell><Typography fontWeight="600">{row.email}</Typography></TableCell>
                            <TableCell><Chip label={row.role} size="small" color={row.role === 'MASTER_ADMIN' ? 'secondary' : 'default'} /></TableCell>
                            <TableCell><Typography>{format(new Date(row.createdAt || new Date()), 'E, MMM d yyyy')}</Typography></TableCell>
                          </>
                        ) : isServicesList ? (
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit">
                                  <IconButton size="small" color="primary" onClick={(event) => handleEditClick(event, row.id || row._id)}>
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(event) => handleDeleteClick(event, row.id || row._id, row.name)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell><Typography fontWeight="600">{row.name}</Typography></TableCell>
                            <TableCell><Typography>{row.title}</Typography></TableCell>
                            <TableCell>
                              <Box display="flex" flexWrap="wrap" gap={0.5}>
                                {row.relatedServices && row.relatedServices.length > 0 ? (
                                  row.relatedServices.map((rel) => (
                                    <Chip 
                                      key={rel._id || rel.id} 
                                      label={rel.name || rel.title} 
                                      size="small" 
                                      variant="outlined" 
                                    />
                                  ))
                                ) : (
                                  <Typography variant="body2" color="textSecondary">-</Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell><Typography>{format(new Date(row.createdAt || new Date()), 'E, MMM d yyyy')}</Typography></TableCell>
                          </>
                        ) : isAddressesList ? (
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit">
                                  <IconButton size="small" color="primary" onClick={(event) => handleEditClick(event, row.id || row._id)}>
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(event) => handleDeleteClick(event, row.id || row._id, row.city)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell><Typography fontWeight="600">{row.city}</Typography></TableCell>
                            <TableCell><Typography>{row.state}</Typography></TableCell>
                            <TableCell><Typography>{row.country}</Typography></TableCell>
                            <TableCell><Typography>{row.pincode}</Typography></TableCell>
                          </>
                        ) : isLocationsList ? (
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit">
                                  <IconButton size="small" color="primary" onClick={(event) => handleEditClick(event, row.id || row._id)}>
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(event) => handleDeleteClick(event, row.id || row._id, row.name)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell><Typography fontWeight="600">{row.name}</Typography></TableCell>
                            <TableCell><Typography>{format(new Date(row.createdAt || new Date()), 'E, MMM d yyyy')}</Typography></TableCell>
                          </>
                        ) : isBlogsList ? (
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit">
                                  <IconButton size="small" color="primary" onClick={(event) => handleEditClick(event, row.id || row._id)}>
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(event) => handleDeleteClick(event, row.id || row._id, row.title)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {row.image ? (
                                <Box
                                  component="img"
                                  src={row.image.startsWith('http') ? row.image : `${import.meta.env.VITE_BASE_BACKEND_URL ? import.meta.env.VITE_BASE_BACKEND_URL.replace('/api/v1', '') : ''}${row.image}`}
                                  alt={row.title}
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '4px',
                                    objectFit: 'cover',
                                    border: '1px solid #ddd'
                                  }}
                                />
                              ) : (
                                <Typography variant="body2" color="textSecondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell><Typography fontWeight="600">{row.title}</Typography></TableCell>
                            <TableCell><Typography>{row.author}</Typography></TableCell>
                            <TableCell><Typography>{row.points ? row.points.length : 0} Points</Typography></TableCell>
                            <TableCell><Typography>{row.readTime}</Typography></TableCell>
                            <TableCell><Typography>{row.category}</Typography></TableCell>
                            <TableCell><Typography>{row.isFeatured ? 'Yes' : 'No'}</Typography></TableCell>
                            <TableCell><Typography>{format(new Date(row.createdAt || new Date()), 'E, MMM d yyyy')}</Typography></TableCell>
                          </>
                        ) : isConsultationsList ? (
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="View">
                                  <IconButton size="small" color="primary" onClick={(event) => handleEditClick(event, row.id || row._id)}>
                                    <IconEye size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(event) => handleDeleteClick(event, row.id || row._id, row.name)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell><Typography fontWeight="600">{row.name}</Typography></TableCell>
                            <TableCell><Typography>{row.email}</Typography></TableCell>
                            <TableCell><Typography>{row.phone}</Typography></TableCell>
                            <TableCell><Typography>{row.city}</Typography></TableCell>
                            <TableCell><Typography>{row.totalCreditCardDues || 'N/A'}</Typography></TableCell>
                            <TableCell><Typography>{row.totalLoanDues || 'N/A'}</Typography></TableCell>
                            <TableCell>
                              <Chip label={row.status || 'Pending'} size="small" color={row.status === 'Completed' ? 'success' : 'warning'} />
                            </TableCell>
                            <TableCell><Typography>{format(new Date(row.createdAt || new Date()), 'E, MMM d yyyy')}</Typography></TableCell>
                          </>
                        ) : isLabelsList ? (
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit">
                                  <IconButton size="small" color="primary" onClick={(event) => handleEditClick(event, row.id || row._id)}>
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(event) => handleDeleteClick(event, row.id || row._id, row.name)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell><Typography fontWeight="600">{row.name}</Typography></TableCell>
                            <TableCell>
                              <Chip 
                                label={row.type} 
                                size="small" 
                                color={row.type === 'city' ? 'primary' : row.type === 'state' ? 'secondary' : 'default'} 
                              />
                            </TableCell>
                            <TableCell><Typography>{row.isFeatured ? 'Yes' : 'No'}</Typography></TableCell>
                            <TableCell><Typography>{format(new Date(row.createdAt || new Date()), 'E, MMM d yyyy')}</Typography></TableCell>
                          </>
                        ) : isKeywordsList ? (
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                {row.status === 'pending' && (
                                  <Tooltip title="Mark Completed">
                                    <IconButton size="small" color="success" onClick={(event) => handleStatusToggle(event, row.id || row._id, 'completed')}>
                                      <IconCheck size="1.1rem" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(event) => handleDeleteClick(event, row.id || row._id, row.keyword)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell><Typography fontWeight="600">{row.keyword}</Typography></TableCell>
                            <TableCell>
                              <Chip 
                                label={row.status} 
                                size="small" 
                                color={row.status === 'completed' ? 'success' : 'warning'} 
                              />
                            </TableCell>
                            <TableCell><Typography>{format(new Date(row.createdAt || new Date()), 'E, MMM d yyyy')}</Typography></TableCell>
                          </>
                        ) : null}
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 33 * emptyRows }}>
                    <TableCell colSpan={headCells.length + (showCheckBox ? 1 : 0)} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 30, 50, 100, 200]}
            component="div"
            count={serverPagination ? totalCount : rows.length}
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
        onConfirm={handleDeleteConfirm}
        itemName={deleteDialog.itemName}
        isDeleting={deleteDialog.isDeleting}
        itemType={isInstitutesList ? "Institute" : isPanelBrandsList ? "Panel Brand" : isAdminList ? "Admin" : isServicesList ? "Service" : isAddressesList ? "Address" : isLocationsList ? "Location" : isBlogsList ? "Blog" : isConsultationsList ? "Consultation" : isLabelsList ? "Label" : isKeywordsList ? "Keyword" : "Item"}
      />
    </Box>
  );
};

export default ProductTableList;