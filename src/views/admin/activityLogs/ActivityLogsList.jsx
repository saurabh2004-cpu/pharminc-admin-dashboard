import React, { useState, useEffect } from 'react';
import {
    Box, CircularProgress, Alert, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Button,
    Select, MenuItem, FormControl, InputLabel, Typography
} from '@mui/material';
import { useNavigate } from 'react-router';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import axiosInstance from '../../../axios/axiosInstance';
import { format } from 'date-fns';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Activity Logs' },
];

const ActivityLogsList = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [moduleFilter, setModuleFilter] = useState('All');
    const [actionFilter, setActionFilter] = useState('All');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
            };
            if (moduleFilter !== 'All') params.module = moduleFilter;
            if (actionFilter !== 'All') params.action = actionFilter;

            const response = await axiosInstance.get('/activity-logs', { params });
            if (response.data) {
                setLogs(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (err) {
            console.error('Error fetching activity logs:', err);
            setError(err.message || 'Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, limit, moduleFilter, actionFilter]);

    const handleModuleChange = (e) => {
        setModuleFilter(e.target.value);
        setPage(1);
    };

    const handleActionChange = (e) => {
        setActionFilter(e.target.value);
        setPage(1);
    };

    const handleViewDetails = (id) => {
        navigate(`/admin/activity-logs/${id}`);
    };

    const headCellStyle = { fontWeight: 600, backgroundColor: '#f0f8ff' };

    return (
        <PageContainer title="Activity Logs" description="View system activity logs">
            <Breadcrumb title="Activity Logs" items={BCrumb} />

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Module</InputLabel>
                    <Select value={moduleFilter} onChange={handleModuleChange} label="Module">
                        <MenuItem value="All">All Modules</MenuItem>
                        <MenuItem value="USER">USER</MenuItem>
                        <MenuItem value="INSTITUTE">INSTITUTE</MenuItem>
                        <MenuItem value="JOB">JOB</MenuItem>
                        <MenuItem value="SAVED_JOB">SAVED_JOB</MenuItem>
                        <MenuItem value="APPLICATION">APPLICATION</MenuItem>
                        <MenuItem value="CREDITS_WALLET">CREDITS_WALLET</MenuItem>
                        <MenuItem value="INSTITUTE_VERIFICATIONS">INSTITUTE_VERIFICATIONS</MenuItem>
                        <MenuItem value="USER_VERIFICATIONS">USER_VERIFICATIONS</MenuItem>
                        <MenuItem value="INSTITUTE_CREDITS">INSTITUTE_CREDITS</MenuItem>
                    </Select>
                </FormControl>

                <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Action</InputLabel>
                    <Select value={actionFilter} onChange={handleActionChange} label="Action">
                        <MenuItem value="All">All Actions</MenuItem>
                        <MenuItem value="CREATE">CREATE</MenuItem>
                        <MenuItem value="UPDATE">UPDATE</MenuItem>
                        <MenuItem value="DELETE">DELETE</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Box>
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={5}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box mt={3}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                ) : (
                    <Paper variant="outlined" sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={headCellStyle}>Date</TableCell>
                                        <TableCell sx={headCellStyle}>Module</TableCell>
                                        <TableCell sx={headCellStyle}>Action</TableCell>
                                        <TableCell sx={headCellStyle}>Description</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {logs.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            hover
                                            onClick={() => handleViewDetails(row.id)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell>{format(new Date(row.createdAt), 'E, MMM d yyyy HH:mm')}</TableCell>
                                            <TableCell>{row.module}</TableCell>
                                            <TableCell>{row.action}</TableCell>
                                            <TableCell>{row.description || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {logs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">No activity logs found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2, gap: 2 }}>
                            <Typography variant="body2">
                                Page {page} of {totalPages || 1}
                            </Typography>
                            <Button
                                disabled={page <= 1}
                                onClick={() => setPage(page - 1)}
                                variant="outlined"
                                size="small"
                            >
                                Previous
                            </Button>
                            <Button
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                                variant="outlined"
                                size="small"
                            >
                                Next
                            </Button>
                        </Box>
                    </Paper>
                )}
            </Box>
        </PageContainer>
    );
};

export default ActivityLogsList;
