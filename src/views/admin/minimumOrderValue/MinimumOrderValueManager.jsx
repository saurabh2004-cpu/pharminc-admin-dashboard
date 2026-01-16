import React, { useEffect, useState } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import axiosInstance from "../../../axios/axiosInstance";
import Breadcrumb from "../../../layouts/full/shared/breadcrumb/Breadcrumb";
import { set } from "lodash";

const MinimumOrderValueManager = () => {
    const [value, setValue] = useState("");
    const [freeShippingAmount, setFreeShippingAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deleteDialog, setDeleteDialog] = useState(false);

    // Fetch existing value
    useEffect(() => {
        fetchMinimumOrderValue();
    }, []);

    const fetchMinimumOrderValue = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(
                "/minimum-order-value/get-minimum-order-value"
            );

            if (res.data?.minimumOrderValue !== undefined) {
                setValue(res.data.minimumOrderValue.toString());
                setFreeShippingAmount(res.data.freeShippingAmount.toString());
            }
        } catch (err) {
            setError("Failed to fetch minimum order value");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!value || isNaN(value)) {
            setError("Please enter a valid number");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            await axiosInstance.post(
                "/minimum-order-value/upsert-minimum-order-value",
                {
                    minimumOrderValue: Number(value),
                    freeShippingAmount: Number(freeShippingAmount),
                }, {
                headers: { 'Content-Type': 'application/json' },
            }
            );

            setSuccess("Minimum order value saved successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Failed to save minimum order value");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            await axiosInstance.delete(
                "/minimum-order-value/delete-minimum-order-value"
            );

            setValue("");
            setDeleteDialog(false);
            setSuccess("Minimum order value deleted");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Failed to delete minimum order value");
        } finally {
            setLoading(false);
        }
    };

    const BCrumb = [
        { to: "/", title: "Home" },
        { title: "Minimum Order Value" },
    ];

    return (
        <Box>
            <Breadcrumb title="Minimum Order Value" items={BCrumb} />

            {(error || success) && (
                <Typography
                    sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: error ? "error.light" : "success.light",
                    }}
                    color={error ? "error" : "success"}
                >
                    {error || success}
                </Typography>
            )}

            <Paper sx={{ p: 4, maxWidth: 500 }}>
                <Typography variant="h6" mb={2}>
                    Set Minimum Order Value
                </Typography>

                <TextField
                    fullWidth
                    label="Minimum Order Value"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter amount"
                    inputProps={{ min: 0, step: "0.01" }}
                />

                <Typography variant="h6" mb={2}>
                    Free Shipping Amount
                </Typography>

                <TextField
                    fullWidth
                    label="Free Shipping Amount"
                    type="number"
                    value={freeShippingAmount}
                    onChange={(e) => setFreeShippingAmount(e.target.value)}
                    placeholder="Enter amount"
                    inputProps={{ min: 0, step: "0.01" }}
                />

                <Box display="flex" gap={2} mt={3}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading}
                        sx={{ backgroundColor: "#2E2F7F" }}
                    >
                        {loading ? <CircularProgress size={22} /> : "Save"}
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setDeleteDialog(true)}
                        disabled={loading || !value}
                    >
                        Delete
                    </Button>
                </Box>
            </Paper>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Delete Minimum Order Value</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the minimum order value?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
                    <Button color="error" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MinimumOrderValueManager;
