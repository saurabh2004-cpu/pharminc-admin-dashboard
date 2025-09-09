import React, { useState } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import { Stack } from '@mui/system';
import axiosInstance from '../../../axios/axiosInstance';


const AuthRegister = ({ title, subtitle, subtext }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate()

   const handleSignUp = async () => {
    try {
      const res = await axiosInstance.post('/admin/signup', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if(res.data.statusCode === 200){
        navigate('/login')
      }
      
      console.log("res", res.data);
    } catch (error) {
      setError(error.message || 'An error occurred');
      console.error(error);
    }
  };

  return (
    <>
      {subtext}
      {/* <AuthSocialButtons title="Sign up with" /> */}

      <Box>
        <Stack mb={3}>
          {/* <CustomFormLabel htmlFor="name">Name</CustomFormLabel> */}
          {/* <CustomTextField id="name" variant="outlined" fullWidth /> */}

          <CustomFormLabel htmlFor="email">E-mail Adddress</CustomFormLabel>
          <CustomTextField
            id="email"
            variant="outlined"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
          <CustomTextField
            id="password"
            variant="outlined"
            fullWidth
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </Stack>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          // component={Link}
          // to="/auth/login"
          onClick={handleSignUp}
          sx={{ backgroundColor: '#2E2F7F' }}
        >
          Sign Up
        </Button>
      </Box>
      {subtitle}
    </>
  );
}

export default AuthRegister;