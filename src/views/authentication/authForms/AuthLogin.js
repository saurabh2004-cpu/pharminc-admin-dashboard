import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Link } from 'react-router';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import axiosInstance from '../../../axios/axiosInstance';
import { login } from '../../../store/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { IconEye, IconEyeOff } from '@tabler/icons';

const AuthLogin = ({ subtitle }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success' | 'error' | 'warning' | 'info'
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Show notification helper
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate email
    if (!formData.email || !formData.email.trim()) {
      showNotification('Please enter your email address', 'error');
      return;
    }

    if (!formData.password) {
      showNotification('Please enter your password', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post('/admin/login', formData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true // ensure HTTP-only cookies are processed
      });

      // API responses with success
      if (res.data.statusCode === 200 || res.status === 200) {
        dispatch(login(res.data.user || { email: formData.email, role: 'admin' }));
        showNotification('Login successful! Redirecting...', 'success');

        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        showNotification(res.data.message || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);

      // Handle different error scenarios
      if (error.response) {
        const statusCode = error.response.status || error.response.data?.statusCode;
        const message = error.response.data?.message;

        if (statusCode === 404) {
          showNotification('Admin not found. Please check your email.', 'error');
        } else if (statusCode === 401) {
          showNotification('Invalid password. Please try again.', 'error');
        } else if (statusCode === 400) {
          showNotification(message || 'Invalid request.', 'error');
        } else {
          showNotification(message || 'Login failed. Please try again.', 'error');
        }
      } else if (error.request) {
        showNotification('Network error. Please check your connection.', 'error');
      } else {
        showNotification('Something went wrong. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack>
        <Box>
          <CustomFormLabel htmlFor="email">E-mail</CustomFormLabel>
          <CustomTextField
            id="email"
            variant="outlined"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleLogin(e);
            }}
          />
        </Box>

        <Box>
          <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
          <CustomTextField
            id="password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleLogin(e);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <IconEyeOff size="20" /> : <IconEye size="20" />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
          <Typography
            component={Link}
            to="/salas-rep/login"
            fontWeight="500"
            sx={{ textDecoration: 'none', color: 'primary.main' }}
          >
            Login as Sales Rep
          </Typography>
        </Stack>
      </Stack>

      <Box>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          onClick={handleLogin}
          disabled={loading}
          sx={{ backgroundColor: '#2E2F7F' }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Login'}
        </Button>
      </Box>

      {subtitle}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AuthLogin;