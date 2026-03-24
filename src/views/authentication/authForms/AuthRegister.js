import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, InputAdornment } from '@mui/material';
import { IconEye, IconEyeOff } from '@tabler/icons';
import { useNavigate } from 'react-router';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import { Stack } from '@mui/system';
import axiosInstance from '../../../axios/axiosInstance';

const AuthRegister = ({ title, subtitle, subtext }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    setError(''); // reset error before request
    try {
      const res = await axiosInstance.post('/admin/signup', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.data.statusCode === 200) {
        navigate('/auth/login');
      } else if (res.data.message) {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    }
  };

  return (
    <>
      {subtext}
      <Box>
        <Stack mb={3} spacing={2}>
          <Box>
            <CustomFormLabel htmlFor="username">Username</CustomFormLabel>
            <CustomTextField
              id="username"
              variant="outlined"
              fullWidth
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="email">E-mail Address</CustomFormLabel>
            <CustomTextField
              id="email"
              variant="outlined"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
            <CustomTextField
              id="password"
              variant="outlined"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          {/* Error message */}
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Stack>

        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSignUp}
          sx={{ backgroundColor: '#2E2F7F' }}
        >
          Sign Up
        </Button>
      </Box>
      {subtitle}
    </>
  );
};

export default AuthRegister;
