import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    CircularProgress,
    Box,
    Typography,
    Alert
} from '@mui/material';

const documentOptions = [
    { value: 'registrationCertificate', label: 'Registration Certificate' }
];

const RejectInstituteVerificationModal = ({ open, handleClose, handleReject, isSubmitting }) => {

    // Form State
    const [selectedDocument, setSelectedDocument] = useState('');
    const [customNote, setCustomNote] = useState('');
    const [error, setError] = useState('');

    // Reset form when opened/closed
    useEffect(() => {
        if (!open) {
            setSelectedDocument('');
            setCustomNote('');
            setError('');
        }
    }, [open]);

    const onSubmit = () => {
        if (!selectedDocument) {
            setError('Please select a document.');
            return;
        }

        handleReject({
            documentField: selectedDocument,
            customNote: customNote.trim() || undefined
        });
    };

    return (
        <Dialog open={open} onClose={!isSubmitting ? handleClose : undefined} fullWidth maxWidth="sm">
            <DialogTitle sx={{ pb: 1 }}>Reject Institute Verification</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Please specify which document failed verification and provide a reason. This will be recorded and the institute's verification will be marked as rejected.
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="document-select-label">Document Rejected *</InputLabel>
                    <Select
                        labelId="document-select-label"
                        value={selectedDocument}
                        label="Document Rejected *"
                        onChange={(e) => setSelectedDocument(e.target.value)}
                        disabled={isSubmitting}
                    >
                        {documentOptions.map((doc) => (
                            <MenuItem key={doc.value} value={doc.value}>
                                {doc.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>


                <TextField
                    fullWidth
                    label="Custom Note (Optional)"
                    multiline
                    rows={3}
                    placeholder="Provide any additional context for the rejection..."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    disabled={isSubmitting}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} color="inherit" disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button
                    onClick={onSubmit}
                    color="error"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RejectInstituteVerificationModal;
