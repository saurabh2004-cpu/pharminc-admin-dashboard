import * as React from 'react';
import { Box, Tooltip, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Button } from '@mui/material';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import { getAllCreditsWallets, deleteCreditsWallet } from '../../../services/creditsWalletService';
import { useNavigate } from 'react-router';
import { format } from 'date-fns';
import { DeleteConfirmationDialog } from '../../../components/apps/ecommerce/utils/ConfirmDeletePopUp';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Credits Wallet' },
];

const CreditsWalletList = () => {
    const navigate = useNavigate();
    const [tableData, setTableData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const [deleteDialog, setDeleteDialog] = React.useState({
        open: false,
        itemId: null,
        itemName: '',
        isDeleting: false
    });

    const fetchWallets = async () => {
        setLoading(true);
        try {
            const response = await getAllCreditsWallets(1, 10);
            if (response.data && response.data.wallets) {
                setTableData(response.data.wallets);
            }
        } catch (error) {
            console.error('Error fetching credits wallets:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchWallets();
    }, []);

    const handleEditClick = (id) => {
        navigate(`/dashboard/credits-wallet/edit/${id}`);
    };

    const handleDeleteClick = (id) => {
        setDeleteDialog({
            open: true,
            itemId: id,
            itemName: 'Credits Wallet Configuration',
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
            await deleteCreditsWallet(deleteDialog.itemId);
            setTableData(prevData => prevData.filter(item => item.id !== deleteDialog.itemId));
            handleDeleteCancel();
        } catch (error) {
            console.error('Error deleting credits wallet:', error);
            setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
            alert("Failed to delete Credits Wallet. Please try again.");
        }
    };

    const handleCreateClick = () => {
        if (tableData.length > 0) {
            alert("A Credits Wallet already exists! You must edit or delete the existing one. Only one Wallet configuration is allowed.");
            return;
        }
        navigate('/dashboard/credits-wallet/create');
    };

    return (
        <PageContainer title="Credits Wallet" description="This is the Credits Wallet page">
            <Breadcrumb title="Credits Wallet" items={BCrumb} />
            <Box mb={2} display="flex" justifyContent="flex-end" sx={{ paddingTop: 2, paddingBottom: 2 }}>
                <Button variant="contained" color="primary" onClick={handleCreateClick} startIcon={<IconPlus />} disabled={tableData.length > 0}>
                    Create Credits Wallet
                </Button>
            </Box>
            <Paper variant="outlined">
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="credits wallet table">
                        <TableHead sx={{ backgroundColor: '#f0f8ff' }}>
                            <TableRow>
                                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}><strong>Actions</strong></TableCell>
                                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}><strong>New Job Credits Price</strong></TableCell>
                                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}><strong>Renew Job Credits Price</strong></TableCell>
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
                                        <Typography variant="body1">No Credits Wallet Configuration Found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tableData.map((row) => (
                                    <TableRow key={row.id} hover >
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                                            <Box display="flex" gap={1}>
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" color="primary" onClick={() => handleEditClick(row.id)}>
                                                        <IconEdit size="1.1rem" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(row.id)}>
                                                        <IconTrash size="1.1rem" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{row.newJobCreditsPrice}</TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{row.renewJobCreditsPrice}</TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{format(new Date(row.created_at), 'E, MMM d yyyy')}</TableCell>
                                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{format(new Date(row.updated_at), 'E, MMM d yyyy')}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <DeleteConfirmationDialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemName={deleteDialog.itemName}
                isDeleting={deleteDialog.isDeleting}
                itemType="Wallet"
            />
        </PageContainer>
    );
};

export default CreditsWalletList;
