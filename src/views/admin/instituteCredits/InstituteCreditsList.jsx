import * as React from 'react';
import { Box, Tooltip, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Button, TablePagination } from '@mui/material';
import { IconEdit, IconTrash, IconPlus, IconEye } from '@tabler/icons-react';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import { getAllInstituteCredits } from '../../../services/instituteCreditsService';
import { useNavigate } from 'react-router';
import { format } from 'date-fns';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';
// Using generic axios wrapper for delete if no explicit delete written, or we can just view/edit since user did not define delete endpoint specifically for instituteCredits in controller, but requested "Delete API".
import axiosInstance from '../../../axios/axiosInstance';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Institute Credits' },
];

const InstituteCreditsList = () => {
    const navigate = useNavigate();
    const [tableData, setTableData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(20);
    const [totalRows, setTotalRows] = React.useState(0);

    const [deleteDialog, setDeleteDialog] = React.useState({
        open: false,
        itemId: null,
        itemName: '',
        isDeleting: false
    });

    const fetchCredits = async (currentPage, limit) => {
        setLoading(true);
        try {
            const response = await getAllInstituteCredits(currentPage + 1, limit);
            if (response.data && response.data.data) {
                setTableData(response.data.data);
                setTotalRows(response.data.total);
            }
        } catch (error) {
            console.error('Error fetching institute credits:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchCredits(page, rowsPerPage);
    }, [page, rowsPerPage]);

    const handleEditClick = (id) => {
        navigate(`/dashboard/institute-credits/edit/${id}`);
    };

    const handleDeleteClick = (id, instituteName) => {
        setDeleteDialog({
            open: true,
            itemId: id,
            itemName: `${instituteName}'s Credits`,
            isDeleting: false
        });
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({
            open: false,
            itemId: null,
            itemName: '',
            isDeleting: false
        });
    };

    const handleDeleteConfirm = async () => {
        setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
        try {
            // Check if backend supports delete, if not this might 404. Requested Delete functionality.
            await axiosInstance.delete(`/institute-credits/delete/${deleteDialog.itemId}`);
            setTableData(prevData => prevData.filter(item => item.id !== deleteDialog.itemId));
            handleDeleteCancel();
        } catch (error) {
            console.error('Error deleting institute credits:', error);
            setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
            alert("Failed to delete Institute Credits. Please try again.");
        }
    };

    const handleCreateClick = () => {
        navigate('/dashboard/institute-credits/create');
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Institute Credits" description="Manage Institute Credits">
            <Breadcrumb title="Institute Credits" items={BCrumb} />
            <Box sx={{ paddingTop: 2, paddingBottom: 2 }} mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Button variant="contained" color="primary" onClick={handleCreateClick} startIcon={<IconPlus />}>
                    Allocate Credits
                </Button>
            </Box>
            <Paper variant="outlined">
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="institute credits table">
                        <TableHead sx={{ backgroundColor: '#f0f8ff' }}>
                            <TableRow>
                                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}><strong>Actions</strong></TableCell>
                                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}><strong>Institute Name</strong></TableCell>
                                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}><strong>Credits Balance</strong></TableCell>
                                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}><strong>Created Date</strong></TableCell>
                                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}><strong>Updated Date</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : tableData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography variant="body1">No Institute Credits Found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tableData.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                                            <Box display="flex" gap={1}>
                                                <Tooltip title="View Institute">
                                                    <IconButton size="small" color="secondary" onClick={() => navigate(`/dashboard/institute/edit/${row.instituteId}`)}>
                                                        <IconEye size="1.1rem" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit Credits">
                                                    <IconButton size="small" color="primary" onClick={() => handleEditClick(row.id)}>
                                                        <IconEdit size="1.1rem" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Credits">
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(row.id, row.institute?.name)}>
                                                        <IconTrash size="1.1rem" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{row.institute?.name || 'Unknown Institute'}</TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{row.credits}</TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{format(new Date(row.created_at), 'E, MMM d yyyy')}</TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{format(new Date(row.updated_at), 'E, MMM d yyyy')}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 20, 50]}
                    component="div"
                    count={totalRows}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            <DeleteConfirmationDialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemName={deleteDialog.itemName}
                isDeleting={deleteDialog.isDeleting}
                itemType="Institute Credits Record"
            />
        </PageContainer>
    );
};

export default InstituteCreditsList;
