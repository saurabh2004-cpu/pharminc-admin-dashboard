import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import { Link } from 'react-router';

import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import axiosInstance from '../../../axios/axiosInstance';
import {login} from '../../../store/authSlice';
import {useDispatch} from 'react-redux';
import { useNavigate } from 'react-router';



const SalesRepLogin = ({ title, subtitle, subtext }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/sales-rep/login-sales-rep', formData,{
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if(res.data.statusCode === 200){
        dispatch(login(res.data.user));
        navigate('/salesrep/dashboards/ecommerce')
      }

      // console.log("res", res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>

      <Stack>
        <Box>
          <CustomFormLabel htmlFor="username">Sales Rep Email</CustomFormLabel>
          <CustomTextField
            id="username"
            variant="outlined"
            fullWidth
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </Box>
        <Box>
          <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
          <CustomTextField
            id="password"
            type="password"
            variant="outlined"
            fullWidth
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </Box>
      </Stack>
      <Box>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          onClick={handleLogin}
          type="submit"
          sx={{ backgroundColor: '#2E2F7F',marginTop: '20px' }}
        >
          Sign In
        </Button>
      </Box>
      {subtitle}
    </>
  )
};

export default SalesRepLogin;
