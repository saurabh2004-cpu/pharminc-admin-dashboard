'use client';
import React, { useEffect, useState } from 'react';
import { Grid, MenuItem, Select, FormControl, Snackbar, Alert } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CustomFormLabel from '../.../../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../.../../../../components/forms/theme-elements/CustomOutlinedInput';
import { IconBuildingArch, IconMail, IconMessage2, IconPhone, IconUser } from '@tabler/icons';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';

const ChangePassword = () => {
  const [formData, setFormData] = React.useState({
    newPassword: '',
  });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success' | 'error' | 'warning' | 'info'
  });
  const navigate = useNavigate();
  const { id, email } = useParams();

  // Show notification
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.newPassword) {
      setError('Please Enter new password');
      showNotification('Please enter new password', 'error');
      return;
    }

    if (formData.newPassword.length < 4) {
      setError('Password must be at least 4 characters long');
      showNotification('Password must be at least 4 characters long', 'error');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.patch(`/admin/chnage-user-password/${id}`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("customer password changed:", res);

      if (res.data.statusCode === 200) {
        // Reset form on success
        setFormData({
          newPassword: '',
        });

        showNotification('Password updated successfully!', 'success');
        
        // Navigate after a short delay to show the success message
        setTimeout(() => {
          navigate('/dashboard/customers/list');
        }, 2000);

      } else if (res.data.statusCode === 400) {
        console.log("Failed to update password", res.data.message);
        setError(res.data.message);
        showNotification(res.data.message || 'Failed to update password', 'error');
      }

    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMail = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post('/admin/send-password-email', {
        email: email
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("email sent to user:", res);

      if (res.data.statusCode === 200) {
        showNotification('Password reset email sent successfully!', 'success');
        
        // Navigate after a short delay to show the success message
        setTimeout(() => {
          navigate('/dashboard/customers/list');
        }, 2000);

      } else if (res.data.statusCode === 400) {
        console.log("Failed to send email", res.data.message);
        setError(res.data.message);
        showNotification(res.data.message || 'Failed to send email', 'error');
      }

    } catch (error) {
      console.error('Send email error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send password reset email';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ newPassword: '' });
    setError('');
    showNotification('Form cleared', 'info');
  };

  return (
    <div>
      <Grid container spacing={2}>

        {/* New password */}
        <Grid size={12}>
          <CustomFormLabel htmlFor="category-slug" sx={{ mt: 2 }}>
            New Password
          </CustomFormLabel>
        </Grid>
        <Grid size={12}>
          <CustomOutlinedInput
            id="category-slug"
            fullWidth
            value={formData.newPassword}
            onChange={(e) => {
              setFormData({ ...formData, newPassword: e.target.value });
              // Clear error when user starts typing
              if (error) setError('');
            }}
            placeholder="Enter Password"
            type="password"
          />
        </Grid>

        {/* Error Message */}
        {error && (
          <Grid size={12} mt={2}>
            <div
              style={{
                color: 'red',
                padding: '10px',
                backgroundColor: '#ffebee',
                borderRadius: '4px',
                border: '1px solid #ffcdd2'
              }}
            >
              {error}
            </div>
          </Grid>
        )}

        {/* Submit Buttons */}
        <Grid size={12} mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ minWidth: '120px' }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClear}
            disabled={loading}
            sx={{ ml: 2, minWidth: '120px' }}
          >
            Clear
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleSendMail}
            disabled={loading}
            sx={{ ml: 2, minWidth: '120px' }}
          >
            Send Reset Email
          </Button>
        </Grid>
      </Grid>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ChangePassword;