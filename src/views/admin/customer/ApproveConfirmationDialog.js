// components/apps/ecommerce/utils/ApproveConfirmationDialog.jsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Grid,
    Divider,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import { 
    CheckCircle, 
    Warning,
    Person,
    Email,
    Phone,
    Business,
    LocationOn,
    LocalShipping,
    Receipt,
    Store,
    Flag,
    Comment
} from '@mui/icons-material';

const ApproveConfirmationDialog = ({ 
    open, 
    onClose, 
    onConfirm, 
    customerData, 
    isApproving 
}) => {
    if (!customerData) return null;

    const {
        customerId,
        customerName,
        contactName,
        customerEmail,
        contactEmail,
        CustomerPhoneNo,
        contactPhone,
        category,
        storeName,
        orderApproval,
        userApproval,
        comments,
        inactive,
        abn,
        suburb,
        country,
        state,
        postcode,
        netTerms,
        defaultShippingRate,
        markupDiscount = [],
        shippingAddresses = [],
        billingAddresses = [],
        createdAt,
        updatedAt
    } = customerData;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="approve-confirmation-dialog"
            maxWidth="lg"
            fullWidth
            scroll="paper"
        >
            <DialogTitle id="approve-confirmation-dialog">
                <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle color="primary" />
                    <Typography variant="h6">Approve Customer - {customerName}</Typography>
                    <Chip 
                        label={orderApproval?.toUpperCase() || 'PENDING'} 
                        color={getStatusColor(orderApproval)}
                        size="small"
                    />
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <DialogContentText sx={{ mb: 3 }}>
                    Are you sure you want to approve this customer? This will grant them access to the system.
                </DialogContentText>

                <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom color="primary">
                                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Basic Information
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <Person fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Customer ID" 
                                        secondary={customerId} 
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Person fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Customer Name" 
                                        secondary={customerName} 
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Person fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Contact Name" 
                                        secondary={contactName || 'N/A'} 
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Email fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Email" 
                                        secondary={customerEmail || contactEmail} 
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Phone fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Phone" 
                                        secondary={CustomerPhoneNo || contactPhone} 
                                    />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>

                    {/* Business Information */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom color="primary">
                                <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Business Information
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <Store fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Store Name" 
                                        secondary={storeName || 'N/A'} 
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Business fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Category" 
                                        secondary={category || 'N/A'} 
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Receipt fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="ABN" 
                                        secondary={abn || 'N/A'} 
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Flag fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Net Terms" 
                                        secondary={netTerms || 'N/A'} 
                                    />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>

                    {/* Location Information */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom color="primary">
                                <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Location Details
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText 
                                        primary="Suburb" 
                                        secondary={suburb || 'N/A'} 
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText 
                                        primary="State" 
                                        secondary={state || 'N/A'} 
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText 
                                        primary="Country" 
                                        secondary={country || 'N/A'} 
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText 
                                        primary="Postcode" 
                                        secondary={postcode || 'N/A'} 
                                    />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>

                    {/* Pricing & Discounts */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom color="primary">
                                <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Pricing & Shipping
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText 
                                        primary="Default Shipping Rate" 
                                        secondary={defaultShippingRate || '0'} 
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText 
                                        primary="Markup/Discounts" 
                                        secondary={
                                            markupDiscount.length > 0 
                                                ? `${markupDiscount.length} pricing group(s) configured`
                                                : 'No discounts configured'
                                        } 
                                    />
                                </ListItem>
                                {markupDiscount.slice(0, 2).map((discount, index) => (
                                    <ListItem key={index}>
                                        <ListItemText 
                                            primary={`Pricing Group ${index + 1}`}
                                            secondary={`${discount.percentage || 'N/A'}`}
                                            sx={{ pl: 2 }}
                                        />
                                    </ListItem>
                                ))}
                                {markupDiscount.length > 2 && (
                                    <ListItem>
                                        <ListItemText 
                                            primary="..."
                                            secondary={`+${markupDiscount.length - 2} more`}
                                            sx={{ pl: 2, fontStyle: 'italic' }}
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Shipping Addresses */}
                    {shippingAddresses.length > 0 && (
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom color="primary">
                                    <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Shipping Addresses
                                </Typography>
                                {shippingAddresses.map((address, index) => (
                                    <Box key={index} sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Address {index + 1}
                                        </Typography>
                                        <Typography variant="body2">
                                            {address.shippingAddressOne}
                                            {address.shippingAddressTwo && `, ${address.shippingAddressTwo}`}
                                            {address.shippingAddressThree && `, ${address.shippingAddressThree}`}
                                        </Typography>
                                        <Typography variant="body2">
                                            {address.shippingCity}, {address.shippingState} {address.shippingZip}
                                        </Typography>
                                    </Box>
                                ))}
                            </Paper>
                        </Grid>
                    )}

                    {/* Billing Addresses */}
                    {billingAddresses.length > 0 && (
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom color="primary">
                                    <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Billing Addresses
                                </Typography>
                                {billingAddresses.map((address, index) => (
                                    <Box key={index} sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Address {index + 1}
                                        </Typography>
                                        <Typography variant="body2">
                                            {address.billingAddressOne}
                                            {address.billingAddressTwo && `, ${address.billingAddressTwo}`}
                                            {address.billingAddressThree && `, ${address.billingAddressThree}`}
                                        </Typography>
                                        <Typography variant="body2">
                                            {address.billingCity}, {address.billingState} {address.billingZip}
                                        </Typography>
                                    </Box>
                                ))}
                            </Paper>
                        </Grid>
                    )}

                    {/* Additional Information */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom color="primary">
                                <Comment sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Additional Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2">
                                        <strong>Comments:</strong> {comments || 'No comments'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2">
                                        <strong>Account Status:</strong> 
                                        <Chip 
                                            label={inactive ? 'INACTIVE' : 'ACTIVE'} 
                                            color={inactive ? 'error' : 'success'}
                                            size="small"
                                            sx={{ ml: 1 }}
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2">
                                        <strong>Created:</strong> {formatDate(createdAt)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2">
                                        <strong>Last Updated:</strong> {formatDate(updatedAt)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
                <Button 
                    onClick={onClose} 
                    disabled={isApproving}
                    color="inherit"
                    variant="outlined"
                    startIcon={<Warning />}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={onConfirm} 
                    disabled={isApproving}
                    variant="contained" 
                    color="success"
                    startIcon={isApproving ? null : <CheckCircle />}
                    size="large"
                >
                    {isApproving ? 'Approving...' : 'Approve Customer'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApproveConfirmationDialog;