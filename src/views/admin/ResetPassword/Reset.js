import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import Cookies from 'js-cookie';
import {
  Button,
  Grid,
  Box,
  Paper,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockReset,
  Security
} from '@mui/icons-material';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';

const Reset = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get('accessToken');

    if (accessToken) {
      Cookies.set('accessToken', accessToken, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      });
      console.log('Access token set in cookies');
    } else {
      console.error('No access token found in URL');
      setError('Invalid reset link. Please try again.');
    }
  }, [location]);

  const validatePasswords = () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (!validatePasswords()) return;

    setLoading(true);
    try {
      const response = await axiosInstance.put('/admin/change-password', {
        newPassword,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setSuccess('Password changed successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } else {
        setError('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleChangePassword();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #2E2F7F, #4A4CA8)',
          }
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2E2F7F, #4A4CA8)',
              color: 'white',
              mb: 2,
              boxShadow: '0 8px 32px rgba(46, 47, 127, 0.3)'
            }}
          >
            <LockReset fontSize="large" />
          </Box>
        </Box>

        {/* Form */}
        <Box component="form" onKeyPress={handleKeyPress}>
          <Grid container spacing={3}>


            <Grid item xs={12}>
              <CustomFormLabel htmlFor="new-password">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security fontSize="small" sx={{ color: '#2E2F7F' }} />
                  New Password
                  <Typography component="span" sx={{ color: 'red' }}>*</Typography>
                </Box>
              </CustomFormLabel>
              <CustomOutlinedInput
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#2E2F7F' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2E2F7F',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2E2F7F',
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>

            {/* Confirm Password */}
            <Grid item xs={12}>
              <CustomFormLabel htmlFor="confirm-password">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security fontSize="small" sx={{ color: '#2E2F7F' }} />
                  Confirm Password
                  <Typography component="span" sx={{ color: 'red' }}>*</Typography>
                </Box>
              </CustomFormLabel>
              <CustomOutlinedInput
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{ color: '#2E2F7F' }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2E2F7F',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2E2F7F',
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>



            {/* Error/Success Messages */}
            {error && (
              <Grid item xs={12}>
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 2,
                    '& .MuiAlert-icon': { color: '#d32f2f' }
                  }}
                >
                  {error}
                </Alert>
              </Grid>
            )}

            {success && (
              <Grid item xs={12}>
                <Alert
                  severity="success"
                  sx={{
                    borderRadius: 2,
                    '& .MuiAlert-icon': { color: '#2e7d32' }
                  }}
                >
                  {success}
                </Alert>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleChangePassword}
                disabled={loading || !newPassword || !confirmPassword}
                sx={{
                  backgroundColor: '#2E2F7F',
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(46, 47, 127, 0.3)',
                  '&:hover': {
                    backgroundColor: '#252669',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(46, 47, 127, 0.4)',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    boxShadow: 'none',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? 'Updating Password...' : 'Reset Password'}
              </Button>
            </Grid>

            {/* Back to Login */}
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="text"
                  onClick={() => navigate('/auth/login')}
                  sx={{
                    color: '#2E2F7F',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(46, 47, 127, 0.04)',
                    },
                  }}
                >
                  ← Back to Login
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Reset;