import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Avatar,
    Grid,
    TextField,
    Autocomplete,
    CircularProgress,
    Badge,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Pagination,
    Stack
} from '@mui/material';
import { useNavigate } from 'react-router';
import { IconMessage, IconSearch } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import PageContainer from '../../../components/container/PageContainer';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import { formatDistanceToNow } from 'date-fns';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Conversations' },
];

const ConversationsList = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [institutes, setInstitutes] = useState([]);
    const [users, setUsers] = useState([]);

    // Filters
    const [selectedInstitute, setSelectedInstitute] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [instituteSearch, setInstituteSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const [instLoading, setInstLoading] = useState(false);
    const [userLoading, setUserLoading] = useState(false);

    // Fetch Institutes for Dropdown
    useEffect(() => {
        const fetchInstitutes = async () => {
            setInstLoading(true);
            try {
                const res = await axiosInstance.get(`/admin/conversations/institutes?search=${instituteSearch}`);
                setInstitutes(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setInstLoading(false);
            }
        };
        const timeoutId = setTimeout(fetchInstitutes, 500);
        return () => clearTimeout(timeoutId);
    }, [instituteSearch]);

    // Fetch Users for Dropdown
    useEffect(() => {
        const fetchUsers = async () => {
            setUserLoading(true);
            try {
                const res = await axiosInstance.get(`/admin/conversations/users?search=${userSearch}`);
                setUsers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setUserLoading(false);
            }
        };
        const timeoutId = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timeoutId);
    }, [userSearch]);

    // Fetch Conversations
    const fetchConversations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit,
                ...(selectedInstitute && { instituteId: selectedInstitute.id }),
                ...(selectedUser && { userId: selectedUser.id })
            });
            const res = await axiosInstance.get(`/admin/conversations/all?${params.toString()}`);
            setConversations(res.data.conversations);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [selectedInstitute, selectedUser, page]);

    return (
        <PageContainer title="Conversations" description="Manage Conversations">
            <Breadcrumb title="Conversations" items={BCrumb} />

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={5} size={{ xs: 12, md: 4 }}>
                            <Autocomplete
                                options={institutes}
                                getOptionLabel={(option) => option.name || ""}
                                loading={instLoading}
                                value={selectedInstitute}
                                onChange={(event, newValue) => {
                                    setSelectedInstitute(newValue);
                                    setPage(1);
                                }}
                                onInputChange={(event, newInputValue) => setInstituteSearch(newInputValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Institute"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {instLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item size={{ xs: 12, md: 4 }}>
                            <Autocomplete
                                options={users}
                                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})` || ""}
                                loading={userLoading}
                                value={selectedUser}
                                onChange={(event, newValue) => {
                                    setSelectedUser(newValue);
                                    setPage(1);
                                }}
                                onInputChange={(event, newInputValue) => setUserSearch(newInputValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select User"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {userLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={2} display="flex" alignItems="center">
                            <Button
                                variant="outlined"
                                color="error"
                                fullWidth
                                onClick={() => {
                                    setSelectedInstitute(null);
                                    setSelectedUser(null);
                                    setPage(1);
                                }}
                            >
                                Reset Filters
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={5}>
                            <CircularProgress />
                        </Box>
                    ) : conversations.length === 0 ? (
                        <Box p={5} textAlign="center">
                            <Typography variant="h6">No conversations found</Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer component={Paper} elevation={0}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Institute</TableCell>
                                            <TableCell>User</TableCell>
                                            <TableCell>Last Message</TableCell>
                                            <TableCell>Total Msgs</TableCell>
                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {conversations.map((conv) => (
                                            <TableRow key={conv.id} hover>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <Avatar src={conv.institute.profileImage} sx={{ mr: 2, bgcolor: 'primary.light' }}>
                                                            {conv.institute.name.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {conv.institute.name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <Avatar src={conv.user.profileImage} sx={{ mr: 2, bgcolor: 'secondary.light' }}>
                                                            {conv.user.firstName.charAt(0)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight={600}>
                                                                {conv.user.firstName} {conv.user.lastName}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: 250 }}>
                                                    <Typography variant="body2" color="textSecondary" noWrap>
                                                        {conv.lastMessage?.content || "No text"}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {conv.lastMessage ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true }) : ''}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="subtitle2">{conv.totalMessages}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        startIcon={<IconMessage size={18} />}
                                                        onClick={() => navigate(`/dashboard/conversations/${conv.id}`)}
                                                    >
                                                        Open Chat
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box p={2} display="flex" justifyContent="center">
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(e, v) => setPage(v)}
                                    color="primary"
                                />
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>
        </PageContainer>
    );
};

export default ConversationsList;
