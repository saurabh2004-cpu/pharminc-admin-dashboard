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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Backdrop
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { IconFilter, IconSearch, IconTrash, IconEdit, IconPlus } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
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
  const { order, orderBy, onRequestSort, headCells } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const headCellStyle = {
    backgroundColor: '#f0f8ff',
    fontWeight: 600,
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
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

const EnhancedTableToolbar = ({ handleSearch, search, placeholder, onAddNew }) => {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Box sx={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', gap: 2 }}>
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
          sx={{ width: 300 }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,width:400 }}>
        <Button
          variant="contained"
          onClick={onAddNew}
          startIcon={<IconPlus size="1.1rem" />}
          sx={{ backgroundColor: '#2E2F7F' }}
        >
          Add New Email
        </Button>
       
      </Box>
    </Toolbar>
  );
};

const AdminEmailsManager = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Table states
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('email');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '' });
  const [editingEmail, setEditingEmail] = useState({ oldEmail: '', newEmail: '' });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    email: '',
    isDeleting: false
  });

  const headCells = [
    {
      id: 'actions',
      numeric: false,
      disablePadding: false,
      label: 'Actions',
    },
    {
      id: 'email',
      numeric: false,
      disablePadding: false,
      label: 'Email Address',
    },
    {
      id: 'updatedAt',
      numeric: false,
      disablePadding: false,
      label: 'Updated At',
    },
  ];

  // Fetch all admin emails on component mount
  useEffect(() => {
    fetchAdminEmails();
  }, []);

  useEffect(() => {
    setRows(emails);
    setPage(0);
  }, [emails]);

  const fetchAdminEmails = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/admin-emails/get-all-admin-emails');
      if (res.data.statusCode === 200) {
        setEmails(res.data.data.email || []);
      }
    } catch (error) {
      setError('Failed to fetch admin emails');
      console.error('Error fetching admin emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearch(searchValue);

    const filteredRows = emails.filter((email) =>
      email.toLowerCase().includes(searchValue)
    );
    setRows(filteredRows);
    setPage(0);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Email operations
  const handleAddEmail = async () => {
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await axiosInstance.post('/admin-emails/add-admin-email',
        { email: formData.email },
        {
          headers: { 'Content-Type': 'application/json' },
          transformRequest: [(data) => JSON.stringify(data)]
        }
      );

      if (res.data.statusCode === 201) {
        setEmails(res.data.data.email);
        setFormData({ email: '' });
        setAddDialogOpen(false);
        setSuccess('Email added successfully!');
      } else {
        setError(res.data.message || 'Failed to add email');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add email';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = (oldEmail) => {
    setEditingEmail({ oldEmail, newEmail: oldEmail });
    setEditDialogOpen(true);
  };

  const handleUpdateEmail = async () => {
    if (!editingEmail.newEmail) {
      setError('New email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingEmail.newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const params = new URLSearchParams();
      params.append('newEmail', editingEmail.newEmail);
      const encodedOldEmail = encodeURIComponent(editingEmail.oldEmail);

      const res = await axiosInstance.put(
        `/admin-emails/update-admin-email/${encodedOldEmail}`,
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (res.data.statusCode === 200) {
        setEmails(res.data.data.email);
        setEditDialogOpen(false);
        setSuccess('Email updated successfully!');
      } else {
        setError(res.data.message || 'Failed to update email');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update email';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (event, email) => {
    event.stopPropagation();
    setDeleteDialog({
      open: true,
      email: email,
      isDeleting: false
    });
  };

  const handleDeleteEmail = async () => {
    try {
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
      const res = await axiosInstance.delete(`/admin-emails/remove-admin-email/${encodeURIComponent(deleteDialog.email)}`);

      if (res.data.statusCode === 200) {
        setEmails(res.data.data.email);
        setSuccess('Email deleted successfully!');
        handleDeleteCancel();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete email');
    } finally {
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      email: '',
      isDeleting: false
    });
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setFormData({ email: '' });
    setError('');
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingEmail({ oldEmail: '', newEmail: '' });
    setError('');
  };

  const theme = useTheme();
  const borderColor = theme.palette.divider;

  return (
    <Box>
      {/* Messages */}
      {(error || success) && (
        <Box sx={{ mb: 2 }}>
          <Typography
            color={error ? 'error' : 'success'}
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: error ? 'error.light' : 'success.light'
            }}
          >
            {error || success}
          </Typography>
        </Box>
      )}

      <Box>
        <EnhancedTableToolbar
          search={search}
          handleSearch={handleSearch}
          placeholder="Search emails"
          onAddNew={() => setAddDialogOpen(true)}
        />
        <Paper variant="outlined" sx={{ mx: 2, mt: 1, border: `1px solid ${borderColor}` }}>
          <TableContainer>
            <Table
              sx={{
                minWidth: 1000,
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
            >
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                headCells={headCells}
              />
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((email, index) => (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={index}
                    >
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditEmail(email)}
                            >
                              <IconEdit size="1.1rem" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => handleDeleteClick(e, email)}
                            >
                              <IconTrash size="1.1rem" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600">{email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {format(new Date(), 'E, MMM d yyyy')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                
                {rows.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography color="textSecondary" py={3}>
                        No admin emails found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {loading && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <CircularProgress />
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

      {/* Add Email Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Admin Email</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ email: e.target.value })}
              placeholder="Enter email address"
              error={!!error}
              helperText={error}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            onClick={handleAddEmail}
            variant="contained"
            disabled={loading || !formData.email}
            sx={{ backgroundColor: '#2E2F7F' }}
          >
            {loading ? 'Adding...' : 'Add Email'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Email Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Admin Email</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="email"
              label="New Email Address"
              value={editingEmail.newEmail}
              onChange={(e) => setEditingEmail(prev => ({ ...prev, newEmail: e.target.value }))}
              placeholder="Enter new email address"
              error={!!error}
              helperText={error}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateEmail}
            variant="contained"
            disabled={loading || !editingEmail.newEmail}
            sx={{ backgroundColor: '#2E2F7F' }}
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteEmail}
        itemName={deleteDialog.email}
        isDeleting={deleteDialog.isDeleting}
        itemType="Admin Email"
      />
    </Box>
  );
};

export default AdminEmailsManager;