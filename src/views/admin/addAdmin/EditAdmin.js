import React, { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from '../../../components/forms/theme-elements/CustomOutlinedInput';
import axiosInstance from '../../../axios/axiosInstance';
import { useNavigate, useParams } from 'react-router';

const EditAdmin = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    status: 'ACTIVE'
  });
  const { id } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roles] = useState(["MASTER ADMIN", "SUB ADMIN"]);
  const [statuses] = useState(["ACTIVE", "INACTIVE"]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Remove password field if it's empty (don't update password if not changed)
      const submitData = { ...formData };
      if (!submitData.password) {
        delete submitData.password;
      }

      const res = await axiosInstance.put(`/admin/update-admin/${id}`, submitData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Admin update response:", res);

      if (res.data.statusCode === 200) {
        setSuccess('Admin updated successfully!');
        setTimeout(() => {
          navigate('/dashboard/admin/list');
        }, 1500);
      } else {
        setError(res.data.message || 'Failed to update admin');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminById = async () => {
    setFetchLoading(true);
    try {
      const response = await axiosInstance.get(`/admin/get-admin-by-id/${id}`);
      console.log("Admin data response:", response);

      if (response.data.statusCode === 200) {
        const adminData = response.data.data;
        setFormData({
          username: adminData.username || '',
          email: adminData.email || '',
          password: '',
          role: adminData.role || '',
          status: adminData.status || 'ACTIVE'
        });

      } else {
        setError('Failed to fetch admin data');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAdminById();
    }
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (fetchLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading admin data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Edit Admin
      </Typography>

      {/* Username Field */}
      <Box sx={{ mb: 3 }}>
        <CustomFormLabel htmlFor="username" sx={{ mt: 0 }}>
          Username
          <span style={{ color: 'red' }}>*</span>
        </CustomFormLabel>
        <CustomOutlinedInput
          id="username"
          fullWidth
          value={formData.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          placeholder="Enter username"
        />
      </Box>

      {/* Email Field */}
      <Box sx={{ mb: 3 }}>
        <CustomFormLabel htmlFor="email" sx={{ mt: 0 }}>
          Email
          <span style={{ color: 'red' }}>*</span>
        </CustomFormLabel>
        <CustomOutlinedInput
          id="email"
          fullWidth
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Enter email address"
        />
      </Box>

      {/* Role Field */}
      <Box sx={{ mb: 3 }}>
        <CustomFormLabel htmlFor="role-select">
          Select Role
          <span style={{ color: 'red' }}>*</span>
        </CustomFormLabel>
        <FormControl fullWidth>
          <Select
            id="role-select"
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            displayEmpty
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.87)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          >
            <MenuItem value="" disabled>
              Select a role
            </MenuItem>
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Status Field */}
      <Box sx={{ mb: 3 }}>
        <CustomFormLabel htmlFor="status-select">
          Status
          <span style={{ color: 'red' }}>*</span>
        </CustomFormLabel>
        <FormControl fullWidth>
          <Select
            id="status-select"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            displayEmpty
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.87)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          >
            <MenuItem value="" disabled>
              Select status
            </MenuItem>
            {statuses.map((status) => (
              <MenuItem 
                key={status} 
                value={status}
                sx={{
                  color: status === 'ACTIVE' ? 'success.main' : 'error.main',
                  fontWeight: 600
                }}
              >
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
          {formData.status === 'ACTIVE' 
            ? 'Admin will be able to log in and access the system' 
            : 'Admin will not be able to log in to the system'}
        </Typography>
      </Box>

      {/* Password Field */}
      {/* <Box sx={{ mb: 3 }}>
        <CustomFormLabel htmlFor="password" sx={{ mt: 0 }}>
          Password
          <span style={{ color: 'gray', fontSize: '0.8rem', marginLeft: '5px' }}>
            (Leave blank to keep current password)
          </span>
        </CustomFormLabel>
        <CustomOutlinedInput
          id="password"
          fullWidth
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          placeholder="Enter new password (optional)"
        />
      </Box> */}

      {/* Messages */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="error">
            {error}
          </Alert>
        </Box>
      )}

      {success && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="success">
            {success}
          </Alert>
        </Box>
      )}

      {/* Action Buttons */}
      <Box display="flex" gap={2} mt={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ backgroundColor: '#2E2F7F', minWidth: '120px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Update Admin'}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate('/dashboard/admin/list')}
          disabled={loading}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default EditAdmin;