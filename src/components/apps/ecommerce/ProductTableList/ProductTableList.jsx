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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import CustomCheckbox from '../../../forms/theme-elements/CustomCheckbox';
import CustomSwitch from '../../../forms/theme-elements/CustomSwitch';
import { IconDotsVertical, IconFilter, IconSearch, IconTrash, IconEdit, IconBriefcase, IconUserPlus, IconEye, IconReceipt } from '@tabler/icons-react';
import { ProductContext } from "src/context/EcommerceContext";
import axiosInstance from '../../../../axios/axiosInstance';
import { useNavigate } from 'react-router';
import { DeleteConfirmationDialog } from '../utils/ConfirmDeletePopUp';
import { toggleJobStatus } from 'src/services/jobService';

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
            padding={headCell.disablePadding ? 'none' : '2'}
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
  const { numSelected, handleSearch, search, placeholder, statusFilter, onStatusFilterChange, statusFilterOptions } = props;

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
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Tooltip title="Filter list">
            <IconButton>
              <IconFilter size="1.2rem" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Toolbar>
  );
};



function stringToColor(string) {
  if (!string) return '#10163A';
  let hash = 0;
  let i;
  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */
  return color;
}

function stringAvatar(name) {
  if (!name) return { children: 'U', sx: { bgcolor: '#10163A' } };
  const splitName = name.split(' ').filter(Boolean);
  const firstLetter = splitName[0]?.[0] || '';
  const secondLetter = splitName[1]?.[0] || '';
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${firstLetter}${secondLetter}`.toUpperCase(),
  };
}

// Confirmation Dialog Component


const ProductTableList = ({
  showCheckBox,
  headCells,
  tableData,
  isBrandsList = false,
  isInstitutesList = false,
  isJobsList = false,
  isApplicantsList = false,
  isUsersList = false,
  isUserVerificationsList = false,
  isUserApplicationsList = false,
  isCreditsHistoryList = false,
  isInstituteVerificationsList = false,
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
  onVerifyStatusChange
}) => {

  const {
    filteredAndSortedProducts,
  } = useContext(ProductContext);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('calories');
  const [selected, setSelected] = useState([]);
  const [internalPage, setInternalPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(50);

  const page = serverPagination ? externalPage : internalPage;
  const rowsPerPage = serverPagination ? externalRowsPerPage : internalRowsPerPage;

  // Delete confirmation dialog state
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
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isBrandsList || isInstitutesList || isJobsList || isApplicantsList || isUsersList || isUserVerificationsList || isInstituteVerificationsList || isUserApplicationsList || isCreditsHistoryList) {
      setRows(sourceData);
    } else {
      setRows(filteredAndSortedProducts);
    }
  }, [sourceData, filteredAndSortedProducts, isBrandsList, isInstitutesList, isJobsList, isApplicantsList, isUsersList, isUserVerificationsList, isInstituteVerificationsList, isUserApplicationsList, isCreditsHistoryList]);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    if (isBrandsList || isInstitutesList) {
      const filteredRows = sourceData.filter((row) => {
        return row.name.toLowerCase().includes(searchValue);
      });
      setRows(filteredRows);
    } else if (isJobsList) {
      const filteredRows = sourceData.filter((row) => {
        return row.title.toLowerCase().includes(searchValue);
      });
      setRows(filteredRows);
    } else if (isApplicantsList || isUsersList || isUserVerificationsList) {
      const filteredRows = sourceData.filter((row) => {
        const fullName = `${row.firstName || ''} ${row.lastName || ''} ${row.user?.firstName || ''} ${row.user?.lastName || ''}`.trim();
        return fullName.toLowerCase().includes(searchValue) || (row.email && row.email.toLowerCase().includes(searchValue));
      });
      setRows(filteredRows);
    } else if (isInstituteVerificationsList) {
      const filteredRows = sourceData.filter((row) => {
        return (row.name && row.name.toLowerCase().includes(searchValue)) || (row.email && row.email.toLowerCase().includes(searchValue));
      });
      setRows(filteredRows);
    } else if (isUserApplicationsList) {
      const filteredRows = sourceData.filter((row) => {
        return row.job?.title?.toLowerCase().includes(searchValue) || row.job?.institute?.name?.toLowerCase().includes(searchValue);
      });
      setRows(filteredRows);
    } else if (isCreditsHistoryList) {
      const filteredRows = sourceData.filter((row) => {
        return row.institute?.name?.toLowerCase().includes(searchValue) || row.job?.title?.toLowerCase().includes(searchValue) || row.action?.toLowerCase().includes(searchValue);
      });
      setRows(filteredRows);
    } else {
      const filteredRows = filteredAndSortedProducts.filter((row) => {
        return row.title.toLowerCase().includes(searchValue);
      });
      setRows(filteredRows);
    }
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

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleJobStatus(id);
      if (res.data) {
        // Update local rows
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: res.data.status } : r))
        );
        // Also update source data if possible
        if (setTableData) {
          setTableData((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: res.data.status } : r))
          );
        }
      }
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = serverPagination ? 0 : page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const theme = useTheme();
  const borderColor = theme.palette.divider;

  // Open delete confirmation dialog
  const handleDeleteClick = (event, id, name) => {
    event.stopPropagation(); // Prevent row selection
    setDeleteDialog({
      open: true,
      itemId: id,
      itemName: name,
      isDeleting: false
    });
  };

  // Close delete confirmation dialog
  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      itemId: null,
      itemName: '',
      isDeleting: false
    });
  };

  // Confirm delete action
  const handleDeleteConfirm = async () => {
    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      const deleteId = deleteDialog.itemId;
      const endpoint = isInstitutesList
        ? `/institute/delete-institute/${deleteId}`
        : isJobsList
          ? `/job/delete-job/${deleteId}`
          : isApplicantsList || isUserApplicationsList
            ? `/application/delete/${deleteId}`
            : isUserVerificationsList
              ? `/user-verifications/delete-verification/${deleteId}`
              : isInstituteVerificationsList
                ? `/institute-verifications/delete-verification/${deleteId}`
                : isUsersList
                  ? `/user/delete-user/${deleteId}`
                  : `/brand/delete-brand/${deleteId}`;

      const res = await axiosInstance.delete(endpoint);

      if (res.status === 200 || res.status === 204 || res.data?.statusCode === 200) {
        // Remove item from both table data and rows
        setTableData((prevData) => prevData.filter((item) => (item._id || item.id) !== deleteId));
        setRows((prevRows) => prevRows.filter((item) => (item._id || item.id) !== deleteId));

        // Close dialog
        handleDeleteCancel();
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));

      // You might want to show an error message here
      alert("Failed to delete brand. Please try again.");
    }
  };

  // Edit item
  const handleEditClick = (event, id) => {
    event.stopPropagation(); // Prevent row selection
    if (isInstitutesList) {
      navigate(`/dashboard/institute/edit/${id}`);
    } else if (isUsersList || isUserVerificationsList) {
      navigate(`/dashboard/users/edit/${id}`);
    } else if (isJobsList) {
      navigate(`/dashboard/jobs/edit/${id}`);
    } else {
      navigate(`/dashboard/brand/edit/${id}`);
    }
  };

  const handleVerifyInstitute = async (id) => {
    try {
      const res = await axiosInstance.put(`/institute-verifications/approve-verification/${id}`);
      if (res.status === 200 || res.status === 204 || res.data?.success || res.data?.statusCode === 200) {
        setRows((prev) =>
          prev.map((r) => ((r.id || r._id) === id ? { ...r, verified: 'APPROVED' } : r))
        );
        if (setTableData) {
          setTableData((prev) =>
            prev.map((r) => ((r.id || r._id) === id ? { ...r, verified: 'APPROVED' } : r))
          );
        }
      }
    } catch (err) {
      console.error('Failed to verify institute', err);
      alert('Failed to verify institute. Please try again.');
    }
  };

  const stickyCellStyle = {
    position: "sticky",
    left: 0,
    zIndex: 5, // higher than other cells so it stays on top
    backgroundColor: '#f0f8ff', // keeps background clean while scrolling
  };

  return (
    <Box sx={{
      width: '100%',
    }}>
      <Box>
        <EnhancedTableToolbar
          numSelected={selected.length}
          search={search}
          handleSearch={handleSearch}
          placeholder={isInstitutesList ? "Search Institute" : isBrandsList ? "Search Brand" : isJobsList ? "Search Job" : isApplicantsList ? "Search Applicant" : "Search Product"}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          statusFilterOptions={statusFilterOptions}
        />
        <Paper variant="outlined" sx={{
          mt: 1,
          border: `1px solid ${borderColor}`,
          borderRadius: 0, // Remove border radius for full edge-to-edge
        }}>
          <TableContainer sx={{
            overflowX: "auto",
          }}>
            {/* Rest of your table code remains the same */}
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
                showCheckBox={showCheckBox}
                headCells={headCells}
              />
              <TableBody>
                {(serverPagination ? rows : stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage))
                  .map((row, index) => {
                    const isItemSelected = isSelected(row.name || row.title);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        // onClick={(event) => handleClick(event, row.name || row.title)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id || row._id || row.title}
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

                        {isBrandsList ? (
                          // Brands List View
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(event) => handleEditClick(event, row.id || row._id)}
                                  >
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(event) => handleDeleteClick(event, row.id || row._id, row.name)}
                                  >
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Box
                                  sx={{
                                    ml: 2,
                                  }}
                                >
                                  <Typography fontWeight="600">
                                    {row.name}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.slug}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{format(new Date(row.createAlt || row.createdAt), 'E, MMM d yyyy')}</Typography>
                            </TableCell>

                          </>
                        ) : isInstitutesList ? (
                          // Institutes List View
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="View Jobs">
                                  <IconButton
                                    size="small"
                                    color="secondary"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      navigate(`/dashboard/institutes/${row.id}/jobs`, { state: { instituteName: row.name } });
                                    }}
                                  >
                                    <IconBriefcase size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="View Credits History">
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      navigate(`/dashboard/institutes/${row.id}/credits-history`, { state: { instituteName: row.name } });
                                    }}
                                  >
                                    <IconReceipt size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(event) => handleEditClick(event, row.id)}
                                  >
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(event) => handleDeleteClick(event, row.id, row.name)}
                                  >
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="600">{row.name}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.role}</Typography>
                            </TableCell>
                            <TableCell sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                              {/* {row.verified === "" ? null : row.verified ? (
                                <Chip label={row.verified === "REJECTED" ? "Rejected" : row.verified === "APPROVED" ? "Approved" : null} color={row.verified === "REJECTED" ? "error" : "success"} size="small" />
                              ) : (
                                ''
                              )}
                              {row.verified !== "APPROVED" && row.verified !== "" ? (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleVerifyInstitute(row.id || row._id);
                                  }}
                                >
                                  Verify
                                </Button>
                              ) : (
                                ''
                              )} */}
                              {row.verified ? <Typography>{row.verified}</Typography> : <Typography>N/A</Typography>}
                            </TableCell>
                            <TableCell>
                              <Typography>{row.contactEmail}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.contactNumber}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.city}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.country}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.bedsCount}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.staffCount}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{format(new Date(row.created_at), 'E, MMM d yyyy')}</Typography>
                            </TableCell>
                          </>
                        ) : isJobsList ? (
                          // Jobs List View
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="View Applicants">
                                  <IconButton
                                    size="small"
                                    color="info"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      navigate(`/dashboard/jobs/${row.id}/applicants`);
                                    }}
                                  >
                                    <IconUserPlus size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(event) => handleEditClick(event, row.id)}
                                  >
                                    <IconEdit size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(event) => handleDeleteClick(event, row.id, row.title)}
                                  >
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography
                                fontWeight="600"
                                sx={{
                                  cursor: 'pointer',
                                  transition: 'color 0.2s',
                                  '&:hover': {
                                    color: 'primary.main',
                                    textDecoration: 'underline',
                                  },
                                }}
                                onClick={() => navigate(`/dashboard/jobs/${row.id}/applicants`)}
                              >
                                {row.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.role}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.jobType}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.workLocation}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.experienceLevel}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.salaryCurrency} {row.salaryMin} - {row.salaryMax}</Typography>
                            </TableCell>
                            <TableCell sx={{ minWidth: 160 }}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <CustomSwitch
                                  checked={row.status === 'active'}
                                  onChange={() => handleToggleStatus(row.id)}
                                  color="primary"
                                />
                                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                  {row.status}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.speciality || 'N/A'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.subSpeciality || 'N/A'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.city || row.institute?.city || 'N/A'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.country || row.institute?.country || 'N/A'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.applicationDeadline ? format(new Date(row.applicationDeadline), 'MMM d yyyy') : 'N/A'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.contactEmail}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.contactPhone}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.contactPerson}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{format(new Date(row.created_at), 'MMM d yyyy')}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{format(new Date(row.updated_at), 'MMM d yyyy')}</Typography>
                            </TableCell>
                          </>
                        ) : isApplicantsList ? (
                          // Applicants List View
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(event) => handleDeleteClick(event, row.id, `${row.user?.firstName || ''} ${row.user?.lastName || ''}`.trim())}
                                  >
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="600">{`${row.user?.firstName || ''} ${row.user?.lastName || ''}`.trim()}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.user?.email}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.currentPosition}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.currentInstitute}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.experienceYears ? row.experienceYears + " Years" : ""}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.status}
                                size="small"
                                color={
                                  row.status === 'HIRED' ? 'success' :
                                    row.status === 'REJECTED' || row.status === 'NEXT_ROUND_REJECTED' ? 'error' :
                                      row.status === 'APPLIED' ? 'primary' :
                                        row.status === 'SHORTLISTED' || row.status === 'INTERVIEW_SCHEDULED' ? 'secondary' : 'default'
                                }
                                variant="filled"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography>{format(new Date(row.appliedDate), 'E, MMM d yyyy')}</Typography>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  window.open(row.resumeUrl, '_blank');
                                }}
                              >
                                View Resume
                              </Button>
                            </TableCell>
                            <TableCell>
                              {/* Actions - View Details placeholder or simple placeholder */}
                              <Typography color="textSecondary">No Actions</Typography>
                            </TableCell>
                          </>
                        ) : isUsersList || isUserVerificationsList ? (
                          // Users / Verification Lists View
                          <>
                            <TableCell sx={stickyCellStyle}>

                              <Box display="flex" gap={1}>
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    color="secondary"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (isUserVerificationsList) {
                                        navigate(`/admin/user-verifications/${row.id || row._id}`);
                                      } else {
                                        navigate(`/dashboard/users/${row.id || row._id}`);
                                      }
                                    }}
                                  >
                                    <IconEye size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                {!isUserVerificationsList && (
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={(event) => handleEditClick(event, row.id || row._id)}
                                    >
                                      <IconEdit size="1.1rem" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(event) => handleDeleteClick(event, row.id || row._id, `${row.firstName} ${row.lastName}`.trim())}
                                  >
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                {isUserVerificationsList && (
                                  <>
                                    {row.status === 'PENDING' ? (
                                      <>
                                        <Tooltip title="Approve">
                                          <Button size="small" variant="contained" color="success" onClick={(e) => { e.stopPropagation(); onVerifyStatusChange(row.id || row._id, 'APPROVED'); }}>Approve</Button>
                                        </Tooltip>
                                        <Tooltip title="Reject">
                                          <Button size="small" variant="outlined" color="error" onClick={(e) => { e.stopPropagation(); onVerifyStatusChange(row.id || row._id, 'REJECTED'); }}>Reject</Button>
                                        </Tooltip>
                                      </>
                                    ) : row.status === 'REJECTED' ? (
                                      <Tooltip title="Approve">
                                        <Button size="small" variant="contained" color="success" onClick={(e) => { e.stopPropagation(); onVerifyStatusChange(row.id || row._id, 'APPROVED'); }}>Approve</Button>
                                      </Tooltip>
                                    ) : null}
                                  </>
                                )}



                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={2}>
                                {isUsersList && (
                                  <Avatar
                                    src={row.profile_picture || undefined}
                                    alt={row.firstName}
                                    {...(!row.profile_picture && stringAvatar(`${row.firstName || ''} ${row.lastName || ''}`.trim()))}
                                  />
                                )}
                                <Typography
                                  fontWeight="600"
                                  onClick={(e) => {
                                    if (isUsersList) {
                                      e.stopPropagation();
                                      navigate(`/dashboard/users/${row.id || row._id}/applications`, { state: { userName: `${row.firstName || ''} ${row.lastName || ''}`.trim() } });
                                    }
                                  }}
                                  sx={isUsersList ? { cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } } : {}}
                                >
                                  {`${row.firstName || ''} ${row.lastName || ''}`.trim()}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.email}</Typography>
                            </TableCell>
                            {isUserVerificationsList ? (
                              <>
                                <TableCell>
                                  <Chip
                                    label={row.status}
                                    size="small"
                                    color={row.status === 'APPROVED' ? 'success' : row.status === 'REJECTED' ? 'error' : 'warning'}
                                    variant="filled"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography>{format(new Date(row.created_at || row.createdAt || new Date()), 'E, MMM d yyyy')}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" gap={1}>
                                    {row.governMentId && (
                                      <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); window.open(row.governMentId, '_blank'); }}>Gov ID</Button>
                                    )}
                                    {row.degreeCertificate && (
                                      <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); window.open(row.degreeCertificate, '_blank'); }}>Degree</Button>
                                    )}
                                    {row.postGraduateDegreeCertificate && (
                                      <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); window.open(row.postGraduateDegreeCertificate, '_blank'); }}>PG Degree</Button>
                                    )}
                                  </Box>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>
                                  <Typography>{row.role}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography>{row.city}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography>{row.country}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography>{row.experience || 0} Years</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography>{format(new Date(row.created_at || row.createdAt), 'E, MMM d yyyy')}</Typography>
                                </TableCell>
                              </>
                            )}
                          </>
                        ) : isInstituteVerificationsList ? (
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    color="secondary"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      navigate(`/admin/institute-verifications/${row.id || row._id}`);
                                    }}
                                  >
                                    <IconEye size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={(event) => handleDeleteClick(event, row.id || row._id, row.institute?.name || row.adminName)}>
                                    <IconTrash size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                                {row.status === 'PENDING' ? (
                                  <>
                                    <Tooltip title="Approve">
                                      <Button size="small" variant="contained" color="success" onClick={(e) => { e.stopPropagation(); onVerifyStatusChange(row.institute.id || row._id, 'APPROVED'); }}>Approve</Button>
                                    </Tooltip>
                                    <Tooltip title="Reject">
                                      <Button size="small" variant="outlined" color="error" onClick={(e) => { e.stopPropagation(); onVerifyStatusChange(row.institute.id || row._id, 'REJECTED'); }}>Reject</Button>
                                    </Tooltip>
                                  </>
                                ) : row.status === 'REJECTED' ? (
                                  <Tooltip title="Approve">
                                    <Button size="small" variant="contained" color="success" onClick={(e) => { e.stopPropagation(); onVerifyStatusChange(row.institute.id || row._id, 'APPROVED'); }}>Approve</Button>
                                  </Tooltip>
                                ) : null}

                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="600">{row.institute?.name || row.adminName}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.email}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={row.status} size="small" color={row.status === 'APPROVED' ? 'success' : row.status === 'REJECTED' ? 'error' : 'warning'} variant="filled" />
                            </TableCell>
                            <TableCell>
                              <Typography>{format(new Date(row.created_at || row.createdAt || new Date()), 'E, MMM d yyyy')}</Typography>
                            </TableCell>
                            <TableCell>
                              {row.registrationCertificate && (
                                <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); window.open(row.registrationCertificate, '_blank'); }}>View Certificate</Button>
                              )}
                            </TableCell>
                          </>
                        ) : isUserApplicationsList ? (
                          <>
                            <TableCell>
                              <Typography fontWeight="600">{row.job?.title}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.job?.salaryCurrency} {row.job?.salaryMin} - {row.job?.salaryMax}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.status}
                                size="small"
                                color={
                                  row.status === 'HIRED' ? 'success' :
                                    row.status === 'REJECTED' || row.status === 'NEXT_ROUND_REJECTED' ? 'error' :
                                      row.status === 'APPLIED' ? 'primary' :
                                        row.status === 'SHORTLISTED' || row.status === 'INTERVIEW_SCHEDULED' ? 'secondary' : 'default'
                                }
                                variant="filled"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography>{format(new Date(row.created_at || row.appliedDate || new Date()), 'E, MMM d yyyy')}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.job?.jobType}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.job?.institute?.name}</Typography>
                            </TableCell>
                          </>
                        ) : isCreditsHistoryList ? (
                          // Credits History List View
                          <>
                            <TableCell sx={stickyCellStyle}>
                              <Box display="flex" gap={1}>
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      navigate(`/dashboard/credits-history/${row.id}`);
                                    }}
                                  >
                                    <IconEye size="1.1rem" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="600">{row.institute?.name || 'N/A'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.type}
                                size="small"
                                color={row.type === 'CREDIT' ? 'success' : 'error'}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.action.replace(/_/g, ' ')}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography>{row.cost || 0}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{row.purchasedCredits || 0}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="600">{row.currentCredits}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{format(new Date(row.created_at), 'MMM d yyyy HH:mm')}</Typography>
                            </TableCell>
                          </>
                        ) : (
                          // Products List View (original code)
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
            count={serverPagination ? totalCount : rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteDialog.itemName}
        isDeleting={deleteDialog.isDeleting}
        itemType={isInstitutesList ? "Institute" : isBrandsList ? "Brand" : isJobsList ? "Job" : isApplicantsList || isUserApplicationsList ? "Application" : isUsersList || isUserVerificationsList ? "User" : isInstituteVerificationsList ? "Verification" : "Product"}
      />
    </Box>
  );
};

export default ProductTableList;