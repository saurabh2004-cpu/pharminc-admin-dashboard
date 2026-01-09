import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Link } from 'react-router';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import axiosInstance from '../../../axios/axiosInstance';
import { login } from '../../../store/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

const AuthLogin = ({ subtitle }) => {
  const [formData, setFormData] = useState({ email: '' });
  const [otp, setOtp] = useState('');
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  
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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post('/admin/send-email-opt', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // console.log("response", res);

      if (res.data.statusCode === 200) {
        dispatch(login(res.data.user));
        setShowOtpPopup(true);
        showNotification('OTP sent successfully! Check your email.', 'success');
      } else if (res.data.statusCode === 404) {
        showNotification('Admin account not found. Please check your email.', 'error');
      } else if (res.data.statusCode === 400) {
        showNotification('Your account is inactive. Please contact support.', 'error');
      } else {
        showNotification(res.data.message || 'Failed to send OTP', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error scenarios
      if (error.response) {
        const statusCode = error.response.data?.statusCode;
        const message = error.response.data?.message;
        
        if (statusCode === 404) {
          showNotification('Admin account not found. Please check your email.', 'error');
        } else if (statusCode === 400) {
          showNotification('Your account is inactive. Please contact support.', 'error');
        } else {
          showNotification(message || 'Failed to send OTP. Please try again.', 'error');
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

  const verifyOtp = async () => {
    // Validate OTP
    if (!otp || !otp.trim()) {
      showNotification('Please enter the OTP', 'error');
      return;
    }

    if (otp.length !== 6) {
      showNotification('OTP must be 6 digits', 'error');
      return;
    }

    setOtpLoading(true);

    try {
      const res = await axiosInstance.post('/admin/verify-otp',
        {
          email: formData.email,
          otp: otp.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        });

      // console.log("Verify OTP response:", res);

      if (res.data.statusCode === 200) {
        showNotification('Login successful! Redirecting...', 'success');
        setShowOtpPopup(false);
        
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else if (res.data.statusCode === 400) {
        showNotification('Invalid OTP. Please check and try again.', 'error');
      } else if (res.data.statusCode === 404) {
        showNotification('Admin account not found.', 'error');
      } else {
        showNotification(res.data.message || 'OTP verification failed', 'error');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      
      // Handle different error scenarios
      if (err.response) {
        const statusCode = err.response.data?.statusCode;
        const message = err.response.data?.message;
        
        if (statusCode === 400) {
          showNotification('Invalid OTP. Please check and try again.', 'error');
        } else if (statusCode === 404) {
          showNotification('Admin account not found.', 'error');
        } else {
          showNotification(message || 'OTP verification failed. Please try again.', 'error');
        }
      } else if (err.request) {
        showNotification('Network error. Please check your connection.', 'error');
      } else {
        showNotification('Something went wrong. Please try again.', 'error');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    setOtp(''); // Clear OTP input
    await handleLogin({ preventDefault: () => {} }); // Resend OTP
  };

  return (
    <>
      <Stack>
        <Box>
          <CustomFormLabel htmlFor="username">E-mail</CustomFormLabel>
          <CustomTextField
            id="username"
            variant="outlined"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLogin(e);
              }
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

          {/* <Typography
            component={Link}
            to="/auth/register"
            fontWeight="500"
            sx={{ textDecoration: 'none', color: 'primary.main' }}
          >
            Register
          </Typography> */}
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
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Get OTP'}
        </Button>
      </Box>

      {subtitle}

      {/* OTP POPUP */}
      <Dialog 
        open={showOtpPopup} 
        onClose={() => !otpLoading && setShowOtpPopup(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Enter OTP</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            We've sent a verification code to <b>{formData.email}</b>.
          </Typography>

          <TextField
            fullWidth
            label="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // Only allow digits
              if (value.length <= 6) {
                setOtp(value);
              }
            }}
            disabled={otpLoading}
            inputProps={{
              maxLength: 6,
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && otp.length === 6) {
                verifyOtp();
              }
            }}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={verifyOtp}
            disabled={otpLoading || otp.length !== 6}
          >
            {otpLoading ? <CircularProgress size={22} color="inherit" /> : 'Verify OTP'}
          </Button>

          <Button
            fullWidth
            variant="text"
            color="primary"
            sx={{ mt: 1 }}
            onClick={handleResendOtp}
            disabled={loading}
          >
            Resend OTP
          </Button>
        </DialogContent>
      </Dialog>

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