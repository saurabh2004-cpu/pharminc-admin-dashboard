import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    TextField,
    InputAdornment,
    List,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Divider,
    Paper,
    IconButton,
    CircularProgress,
    Tabs,
    Tab,
    Badge,
    Tooltip
} from '@mui/material';
import {
    IconSearch,
    IconSend,
    IconPaperclip,
    IconChecks,
    IconCheck,
    IconPhoto,
    IconFileText,
    IconClock,
    IconVolume,
    IconMicrophone,
    IconMessage
} from '@tabler/icons-react';
import Cookies from 'js-cookie';
import { formatDistanceToNow } from 'date-fns';
import axiosInstance from '../../../axios/axiosInstance';
import PageContainer from '../../../components/container/PageContainer';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import { connectSocket, getSocket } from '../../../utils/socket';

const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Messages' },
];

const SUPER_ADMIN_ID = '00000000-0000-0000-0000-000000000000';

const AdminMessages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Filters & Search
    const [filter, setFilter] = useState('ALL'); // 'ALL' | 'USER' | 'INSTITUTE'
    const [search, setSearch] = useState('');

    // Message input
    const [inputValue, setInputValue] = useState('');
    const [sending, setSending] = useState(false);
    const [typingParticipants, setTypingParticipants] = useState({});

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);

        const socket = getSocket();
        if (!socket || !selectedConversationId) return;

        socket.emit('typing_start', selectedConversationId);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing_stop', selectedConversationId);
        }, 1500);
    };

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 50);
    };

    // Fetch Conversations
    const fetchConversations = async (showLoading = false) => {
        if (showLoading) setLoadingConvos(true);
        try {
            const res = await axiosInstance.get(`/admin/conversations/all?type=${filter}&search=${search}`);
            setConversations(res.data.conversations || []);
        } catch (err) {
            console.error('Error fetching admin conversations:', err);
        } finally {
            if (showLoading) setLoadingConvos(false);
        }
    };

    useEffect(() => {
        fetchConversations(true);
    }, [filter, search]);

    // Fetch messages for active conversation
    const fetchMessages = async (convoId) => {
        setLoadingMessages(true);
        try {
            const res = await axiosInstance.get(`/admin/conversations/${convoId}/messages?limit=50`);
            setMessages(res.data.messages || []);
            scrollToBottom();

            // Mark conversation as read in backend
            await axiosInstance.patch(`/messages/${convoId}/read`);

            // Reset unread count locally
            setConversations(prev => prev.map(c =>
                c.id === convoId ? { ...c, unreadCount: 0 } : c
            ));
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setLoadingMessages(false);
        }
    };

    // Socket message handlers
    const handleNewMessage = useCallback((message) => {
        setConversations(prev => {
            const exists = prev.find(c => c.id === message.conversationId);
            if (exists) {
                return prev.map(c =>
                    c.id === message.conversationId
                        ? {
                            ...c,
                            lastMessage: message,
                            unreadCount: (c.id === selectedConversationId || message.senderId === SUPER_ADMIN_ID) ? c.unreadCount : c.unreadCount + 1,
                            updatedAt: message.createdAt
                        }
                        : c
                ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            } else {
                fetchConversations();
                return prev;
            }
        });

        if (selectedConversationId === message.conversationId) {
            setMessages(prev => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });
            scrollToBottom();

            // Mark as read immediately since chat is active
            axiosInstance.patch(`/messages/${message.conversationId}/read`);
        }
    }, [selectedConversationId]);

    const handleMessagesRead = useCallback(({ conversationId }) => {
        if (selectedConversationId === conversationId) {
            setMessages(prev => prev.map(m => !m.isRead ? { ...m, isRead: true } : m));
        }
    }, [selectedConversationId]);

    const handleTypingStart = useCallback(({ conversationId }) => {
        if (selectedConversationId === conversationId) {
            setTypingParticipants(prev => ({ ...prev, [conversationId]: true }));
        }
    }, [selectedConversationId]);

    const handleTypingStop = useCallback(({ conversationId }) => {
        if (selectedConversationId === conversationId) {
            setTypingParticipants(prev => ({ ...prev, [conversationId]: false }));
        }
    }, [selectedConversationId]);

    // Socket Connection Setup
    useEffect(() => {
        const token = Cookies.get('adminAccessToken');
        const socket = connectSocket(token);

        socket.on('new_message', handleNewMessage);
        socket.on('messages_read', handleMessagesRead);
        socket.on('typing_start', handleTypingStart);
        socket.on('typing_stop', handleTypingStop);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('messages_read', handleMessagesRead);
            socket.off('typing_start', handleTypingStart);
            socket.off('typing_stop', handleTypingStop);
        };
    }, [handleNewMessage, handleMessagesRead, handleTypingStart, handleTypingStop]);

    // Room join/leave handling
    useEffect(() => {
        if (!selectedConversationId) return;

        fetchMessages(selectedConversationId);

        const socket = getSocket();
        if (socket) {
            socket.emit('join_conversation', selectedConversationId);
        }

        return () => {
            if (socket) {
                socket.emit('leave_conversation', selectedConversationId);
            }
        };
    }, [selectedConversationId]);

    // Send text message
    const handleSend = async () => {
        if (!inputValue.trim() || !selectedConversationId || sending) return;

        setSending(true);
        try {
            // Stop typing status
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            const socket = getSocket();
            if (socket) {
                socket.emit('typing_stop', selectedConversationId);
            }

            const res = await axiosInstance.post('/messages', {
                conversationId: selectedConversationId,
                content: inputValue
            });

            setMessages(prev => {
                if (prev.some(m => m.id === res.data.id)) return prev;
                return [...prev, res.data];
            });
            setInputValue('');
            scrollToBottom();

            // Update conversations list last message
            setConversations(prev => prev.map(c =>
                c.id === selectedConversationId ? { ...c, lastMessage: res.data, updatedAt: res.data.createdAt } : c
            ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));

        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    // Send file attachment
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !selectedConversationId) return;

        const formData = new FormData();
        formData.append('conversationId', selectedConversationId);
        formData.append('media', file);

        try {
            const res = await axiosInstance.post('/messages', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessages(prev => {
                if (prev.some(m => m.id === res.data.id)) return prev;
                return [...prev, res.data];
            });
            scrollToBottom();

            setConversations(prev => prev.map(c =>
                c.id === selectedConversationId ? { ...c, lastMessage: res.data, updatedAt: res.data.createdAt } : c
            ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));

        } catch (err) {
            console.error('Failed to upload file:', err);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const activeConversation = conversations.find(c => c.id === selectedConversationId);
    const otherParticipant = activeConversation?.participant;

    const formatLastMessagePreview = (content) => {
        if (!content) return '';
        if (content.startsWith('**Feedback Type:**\n')) {
            const parts = content.split('\n\n**Message:**\n');
            if (parts.length === 2) {
                return parts[1];
            }
        }
        return content;
    };

    return (
        <PageContainer title="Messages" description="Real-time Admin Chat Support">

            <Card sx={{ height: 'calc(100vh - 120px)', p: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid', borderColor: '#e0e0e0', boxShadow: 'none' }}>
                <Grid container sx={{ height: '100%' }}>
                    {/* LEFT PANEL: Conversation List */}
                    <Grid item size={{ xs: 4 }} sx={{ borderRight: '1px solid', borderColor: '#e0e0e0', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
                        <Box sx={{ p: 2, pb: 1 }}>
                            <Typography variant="h3" fontWeight={700} sx={{ mb: 2, color: 'text.primary', fontSize: '1.4rem' }}>
                                Messages
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Search"
                                size="small"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ pl: 0.5 }}>
                                            <IconSearch size={18} color="#9e9e9e" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '24px',
                                        bgcolor: '#f1f3f5',
                                        '& fieldset': { border: 'none' },
                                        height: '40px'
                                    }
                                }}
                            />
                        </Box>
                        <Tabs
                            value={filter}
                            onChange={(e, v) => setFilter(v)}
                            variant="fullWidth"
                            indicatorColor="primary"
                            textColor="primary"
                            sx={{ borderBottom: '1px solid', borderColor: '#e0e0e0', minHeight: '36px', height: '36px', '& .MuiTab-root': { minHeight: '36px', height: '36px', py: 0, fontSize: '0.8rem', fontWeight: 600 } }}
                        >
                            <Tab label="All" value="ALL" />
                            <Tab label="Users" value="USER" />
                            <Tab label="Institutes" value="INSTITUTE" />
                        </Tabs>

                        <Box sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': { width: '6px' },
                            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '10px' },
                            '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' }
                        }}>
                            {loadingConvos ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress size={30} />
                                </Box>
                            ) : conversations.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="textSecondary">No conversations found.</Typography>
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {conversations.map((convo) => {
                                        const isSelected = convo.id === selectedConversationId;
                                        const part = convo.participant;
                                        if (!part) return null;

                                        const avatarInitials = part.displayName?.substring(0, 2).toUpperCase() || 'PH';

                                        return (
                                            <React.Fragment key={convo.id}>
                                                <ListItemButton
                                                    selected={isSelected}
                                                    onClick={() => setSelectedConversationId(convo.id)}
                                                    sx={{
                                                        p: 2,
                                                        borderLeft: isSelected ? '4px solid #1976D2' : '4px solid transparent',
                                                        borderColor: '#1976D2',
                                                        bgcolor: isSelected ? '#F0F7FF !important' : 'transparent',
                                                        transition: 'all 0.15s ease-in-out',
                                                        '&:hover': {
                                                            bgcolor: '#f8f9fa',
                                                        }
                                                    }}
                                                >
                                                    <ListItemAvatar sx={{ minWidth: '56px' }}>
                                                        <Badge color="error" badgeContent={convo.unreadCount} invisible={convo.unreadCount === 0}>
                                                            <Avatar sx={{ width: 44, height: 44, bgcolor: '#e91e63', color: 'white', fontWeight: 700, fontSize: '1rem' }} src={part.profile_picture}>
                                                                {avatarInitials}
                                                            </Avatar>
                                                        </Badge>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Box display="flex" justifyContent="space-between" alignItems="baseline">
                                                                <Typography variant="subtitle2" fontWeight={700} color="text.primary" noWrap sx={{ maxWidth: '170px', fontSize: '0.9rem' }}>
                                                                    {part.displayName}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '11px' }}>
                                                                    {convo.lastMessage ? new Date(convo.lastMessage.createdAt).toLocaleDateString() : ''}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Typography variant="body2" color={convo.unreadCount > 0 ? 'text.primary' : 'textSecondary'} fontWeight={convo.unreadCount > 0 ? 600 : 400} noWrap sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                                                                {formatLastMessagePreview(convo.lastMessage?.content) || (convo.lastMessage?.mediaUrl ? 'Sent a file' : 'No messages')}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItemButton>
                                                <Divider sx={{ borderColor: '#f1f3f5' }} />
                                            </React.Fragment>
                                        );
                                    })}
                                </List>
                            )}
                        </Box>
                    </Grid>

                    {/* RIGHT PANEL: Chat Window */}
                    <Grid item size={{ xs: 8 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fa' }}>
                        {selectedConversationId ? (
                            <>
                                {/* Conversation Header */}
                                <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'none' }}>
                                    <Box display="flex" alignItems="center">
                                        <Avatar sx={{ mr: 2, width: 44, height: 44, bgcolor: '#e91e63', color: 'white', fontWeight: 700, fontSize: '1rem' }} src={otherParticipant?.profile_picture}>
                                            {otherParticipant?.displayName?.substring(0, 2).toUpperCase() || 'PH'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1rem', color: '#111827' }}>
                                                {otherParticipant?.displayName}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                {otherParticipant?.participantType || 'SUPER_ADMIN'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton size="small" sx={{ color: '#9e9e9e' }}>
                                        <IconSearch size={20} />
                                    </IconButton>
                                </Box>

                                {/* Messages History */}
                                <Box sx={{
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2.5,
                                    animation: 'fadeIn 0.25s ease-out',
                                    '@keyframes fadeIn': {
                                        from: { opacity: 0, transform: 'translateY(10px)' },
                                        to: { opacity: 1, transform: 'translateY(0)' }
                                    },
                                    '&::-webkit-scrollbar': { width: '6px' },
                                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '10px' },
                                    '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' }
                                }}>
                                    {loadingMessages ? (
                                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                            <CircularProgress />
                                        </Box>
                                    ) : (
                                        <>
                                            {messages.map((msg) => {
                                                const isMe = msg.senderId === SUPER_ADMIN_ID;

                                                return (
                                                    <Box
                                                        key={msg.id}
                                                        sx={{
                                                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                                                            display: 'flex',
                                                            alignItems: 'flex-end',
                                                            gap: 1.5,
                                                            maxWidth: '80%',
                                                        }}
                                                    >
                                                        {!isMe && (
                                                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#e91e63', color: 'white', fontWeight: 700, fontSize: '0.85rem' }} src={otherParticipant?.profile_picture}>
                                                                {otherParticipant?.displayName?.substring(0, 2).toUpperCase() || 'PH'}
                                                            </Avatar>
                                                        )}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Paper
                                                                elevation={0}
                                                                sx={{
                                                                    p: 1.8,
                                                                    bgcolor: isMe ? '#E3F2FD' : '#EAECEF',
                                                                    color: '#212529',
                                                                    borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                                                    boxShadow: 'none',
                                                                }}
                                                            >
                                                                {msg.mediaUrl && (
                                                                    <Box sx={{ mb: 1 }}>
                                                                        {msg.mediaType === 'IMAGE' ? (
                                                                            <img src={msg.mediaUrl} alt="media" style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: 8 }} />
                                                                        ) : msg.mediaType === 'VOICE' ? (
                                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                                <IconVolume size={18} />
                                                                                <audio src={msg.mediaUrl} controls style={{ maxWidth: '200px', height: '32px' }} />
                                                                            </Box>
                                                                        ) : (
                                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                                <IconFileText size={18} />
                                                                                <a href={msg.mediaUrl} target="_blank" rel="noreferrer" style={{ color: '#169BA4', fontSize: '14px', fontWeight: 600 }}>
                                                                                    View Document attachment
                                                                                </a>
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                )}
                                                                {msg.content && (
                                                                    (() => {
                                                                        let isFeedback = false;
                                                                        let feedbackTitle = '';
                                                                        let feedbackMsg = msg.content;
                                                                        
                                                                        if (msg.content.startsWith('**Feedback Type:**\n')) {
                                                                            const parts = msg.content.split('\n\n**Message:**\n');
                                                                            if (parts.length === 2) {
                                                                                isFeedback = true;
                                                                                feedbackTitle = parts[0].replace('**Feedback Type:**\n', '');
                                                                                feedbackMsg = parts[1];
                                                                            }
                                                                        }
                                                                        
                                                                        return isFeedback ? (
                                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                                <Box sx={{
                                                                                    borderLeft: '4px solid #E85D04',
                                                                                    bgcolor: 'rgba(0, 0, 0, 0.05)',
                                                                                    p: 1.2,
                                                                                    borderRadius: '4px 8px 8px 4px',
                                                                                }}>
                                                                                    <Typography variant="caption" sx={{ color: '#E85D04', fontWeight: 700, display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                                                                                        {otherParticipant?.displayName || 'Feedback Type'}
                                                                                    </Typography>
                                                                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', fontStyle: 'italic', lineHeight: 1.3 }}>
                                                                                        {feedbackTitle}
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.4, fontSize: '0.885rem' }}>
                                                                                    {feedbackMsg}
                                                                                </Typography>
                                                                            </Box>
                                                                        ) : (
                                                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.4, fontSize: '0.885rem' }}>
                                                                                {msg.content}
                                                                            </Typography>
                                                                        );
                                                                    })()
                                                                )}
                                                            </Paper>
                                                            <Box display="flex" alignItems="center" gap={0.5} sx={{ minWidth: isMe ? '65px' : '55px' }}>
                                                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '10px' }}>
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </Typography>
                                                                {isMe && (
                                                                    msg.isRead ? <IconChecks size={14} color="#1976D2" /> : <IconCheck size={14} color="#9e9e9e" />
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                            {typingParticipants[selectedConversationId] && (
                                                <Box sx={{ alignSelf: 'flex-start', bgcolor: '#EAECEF', px: 2, py: 1.5, borderRadius: '15px', display: 'flex', alignItems: 'center', gap: 0.5, ml: 6 }}>
                                                    <Box sx={{ width: 6, height: 6, bgcolor: 'text.secondary', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0s' }} />
                                                    <Box sx={{ width: 6, height: 6, bgcolor: 'text.secondary', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0.2s' }} />
                                                    <Box sx={{ width: 6, height: 6, bgcolor: 'text.secondary', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out', animationDelay: '0.4s' }} />
                                                    <style>{`
                                                        @keyframes bounce {
                                                            0%, 80%, 100% { transform: scale(0); }
                                                            40% { transform: scale(1.0); }
                                                        }
                                                    `}</style>
                                                </Box>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </Box>

                                {/* Input Bar */}
                                <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: '#e0e0e0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <input
                                        type="file"
                                        style={{ display: 'none' }}
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*,video/*,application/pdf"
                                    />
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        placeholder="Type something..."
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        disabled={sending}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                bgcolor: '#f8f9fa',
                                                height: '42px',
                                                '& fieldset': { borderColor: '#e0e0e0' }
                                            }
                                        }}
                                    />
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <Tooltip title="Attach File">
                                            <IconButton onClick={() => fileInputRef.current?.click()} sx={{ color: '#169BA4' }}>
                                                <IconFileText size={22} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Voice Message">
                                            <IconButton sx={{ color: '#169BA4' }}>
                                                <IconMicrophone size={22} />
                                            </IconButton>
                                        </Tooltip>
                                        <IconButton onClick={handleSend} disabled={!inputValue.trim() || sending} sx={{ bgcolor: inputValue.trim() ? '#169BA4' : 'transparent', color: inputValue.trim() ? 'white' : '#169BA4', '&:hover': { bgcolor: inputValue.trim() ? '#127e85' : 'rgba(22, 155, 164, 0.04)' }, p: 1 }}>
                                            <IconSend size={20} />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </>
                        ) : (
                            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%" bgcolor="#f8f9fa" sx={{ animation: 'fadeIn 0.3s ease-out' }}>
                                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                    <IconMessage size={40} color="#1976D2" />
                                </Box>
                                <Typography color="text.primary" variant="h6" fontWeight={600} mb={1}>
                                    Your Messages
                                </Typography>
                                <Typography color="textSecondary" variant="body2" align="center" maxWidth="300px">
                                    Select a conversation from the list to start messaging or view history.
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Card>
        </PageContainer>
    );
};

export default AdminMessages;
