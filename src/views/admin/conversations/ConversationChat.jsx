import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Avatar,
    CircularProgress,
    Paper,
    IconButton,
    Stack,
    Divider,
    Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router';
import { IconChevronLeft, IconClock } from '@tabler/icons-react';
import axiosInstance from '../../../axios/axiosInstance';
import PageContainer from '../../../components/container/PageContainer';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import { format } from 'date-fns';

const BCrumb = [
    { to: '/admin/conversations', title: 'Conversations' },
    { title: 'Chat Details' },
];

const ConversationChat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);
    const [conversation, setConversation] = useState(null);
    const scrollRef = useRef(null);
    const topObserverRef = useRef(null);

    // Fetch conversation details and initial messages
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // First get messages
            const msgRes = await axiosInstance.get(`/admin/conversations/${id}/messages?limit=30`);
            setMessages(msgRes.data.messages);
            setNextCursor(msgRes.data.nextCursor);

            // Fetch conversation info from current list or separate api if needed
            // For now we assume we have conversation ID and we can just show messages
            // Alternatively, we could have an endpoint for conversation info.
            // Let's try to find it in the messages if possible or just show headers
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            // Scroll to bottom on initial load
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100);
        }
    };

    const fetchMoreMessages = async () => {
        if (!nextCursor || loadingMore) return;

        setLoadingMore(true);
        const currentScrollHeight = scrollRef.current.scrollHeight;

        try {
            const res = await axiosInstance.get(`/admin/conversations/${id}/messages?cursor=${nextCursor}&limit=30`);
            setMessages(prev => [...res.data.messages, ...prev]);
            setNextCursor(res.data.nextCursor);

            // Maintain scroll position after loading older messages
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight - currentScrollHeight;
                }
            }, 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && nextCursor && !loading && !loadingMore) {
                    fetchMoreMessages();
                }
            },
            { threshold: 1.0 }
        );

        if (topObserverRef.current) {
            observer.observe(topObserverRef.current);
        }

        return () => observer.disconnect();
    }, [nextCursor, loading, loadingMore]);

    const renderMessage = (msg) => {
        const isFromUser = msg.senderType === 'USER';

        return (
            <Box
                key={msg.id}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isFromUser ? 'flex-start' : 'flex-end',
                    mb: 2,
                    px: 2
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: 1.5,
                        bgcolor: isFromUser ? 'grey.100' : 'primary.light',
                        color: isFromUser ? 'text.primary' : 'primary.contrastText',
                        borderRadius: 2,
                        maxWidth: '70%',
                        position: 'relative'
                    }}
                >
                    <Typography variant="body1">
                        {msg.content}
                    </Typography>
                    {msg.mediaUrl && (
                        <Box mt={1}>
                            {msg.mediaType === 'IMAGE' ? (
                                <img src={msg.mediaUrl} alt="media" style={{ maxWidth: '100%', borderRadius: 4 }} />
                            ) : (
                                <a href={msg.mediaUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
                                    View Media Attachment
                                </a>
                            )}
                        </Box>
                    )}
                </Paper>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <IconClock size={12} style={{ opacity: 0.6 }} />
                    <Typography variant="caption" color="textSecondary">
                        {format(new Date(msg.createdAt), 'HH:mm')} • {isFromUser ? 'User' : 'Institute'}
                    </Typography>
                </Stack>
            </Box>
        );
    };

    return (
        <PageContainer title="Chat History" description="View Conversation History">
            <Breadcrumb title="Chat History" items={BCrumb} />

            <Card sx={{ height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                        <IconChevronLeft />
                    </IconButton>
                    <Typography variant="h6">Conversation History</Typography>
                </Box>

                <CardContent
                    ref={scrollRef}
                    sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        p: 0,
                        backgroundColor: '#fafafa',
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '10px' }
                    }}
                >
                    <Box sx={{ p: 2 }}>
                        {/* Sentinel for infinite scroll */}
                        <div ref={topObserverRef} style={{ height: '20px', textAlign: 'center' }}>
                            {loadingMore && <CircularProgress size={20} />}
                        </div>

                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <CircularProgress />
                            </Box>
                        ) : messages.length === 0 ? (
                            <Box p={5} textAlign="center">
                                <Typography color="textSecondary">No messages yet</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={2} sx={{ mt: 2 }}>
                                {messages.map(renderMessage)}
                            </Stack>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </PageContainer>
    );
};

export default ConversationChat;
