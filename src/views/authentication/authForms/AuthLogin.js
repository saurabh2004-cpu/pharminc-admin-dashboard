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



const AuthLogin = ({ title, subtitle, subtext }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/admin/login', formData,{
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if(res.data.statusCode === 200){
        dispatch(login(res.data.user));
        navigate('/')
      }

      console.log("res", res.data);
    } catch (error) {
      console.error(error);
    }
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
        <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
          <FormGroup>
            <FormControlLabel
              control={<CustomCheckbox defaultChecked />}
              label="Remeber this Device"
            />
          </FormGroup>
          <Typography
            component={Link}
            to="/auth/register"
            fontWeight="500"
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
            }}
          >
            Register 
          </Typography>
        </Stack>
      </Stack>
      <Box>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          // component={Link}
          // to="/"
          onClick={handleLogin}
          type="submit"
          sx={{ backgroundColor: '#2E2F7F' }}
        >
          Sign In
        </Button>
      </Box>
      {subtitle}
    </>
  )
};

export default AuthLogin;
