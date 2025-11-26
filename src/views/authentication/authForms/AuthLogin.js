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
  CircularProgress
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
  const [alertMsg, setAlertMsg] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertMsg(null);

    try {
      const res = await axiosInstance.post('/admin/send-email-opt', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("response", res)

      if (res.data.statusCode === 200) {
        dispatch(login(res.data.user));
        setShowOtpPopup(true);
        setAlertMsg('OTP sent successfully!');
        setAlertType('success');
      } else {
        setAlertMsg(res.data.message || 'Failed to send OTP');
        setAlertType('error');
      }
    } catch (error) {
      setAlertMsg(error.response?.data?.message || 'Something went wrong');
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setOtpLoading(true);
    setAlertMsg(null);

    try {
      const res = await axiosInstance.post('/admin/verify-otp',
        {
          email: formData.email,
          otp
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        });

      if (res.data.statusCode === 200) {
        setAlertMsg('Logged in successfully!');
        setAlertType('success');

        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setAlertMsg(res.data.message || 'Invalid OTP');
        setAlertType('error');
      }
    } catch (err) {
      setAlertMsg(err.response?.data?.message || 'OTP verification failed');
      setAlertType('error');
    } finally {
      setOtpLoading(false);
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
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </Box>

        {alertMsg && (
          <Alert severity={alertType} sx={{ mt: 2 }}>
            {alertMsg}
          </Alert>
        )}

        <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
          <Typography
            component={Link}
            to="/salas-rep/login"
            fontWeight="500"
            sx={{ textDecoration: 'none', color: 'primary.main' }}
          >
            Log In As Sales Rep
          </Typography>

          <Typography
            component={Link}
            to="/auth/register"
            fontWeight="500"
            sx={{ textDecoration: 'none', color: 'primary.main' }}
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
          onClick={handleLogin}
          disabled={loading}
          sx={{ backgroundColor: '#2E2F7F' }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Get OTP'}
        </Button>
      </Box>

      {subtitle}

      {/* OTP POPUP */}
      <Dialog open={showOtpPopup} onClose={() => setShowOtpPopup(false)}>
        <DialogTitle>Enter OTP</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            We've sent a verification code to <b>{formData.email}</b>.
          </Typography>

          <TextField
            fullWidth
            label="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={verifyOtp}
            disabled={otpLoading}
          >
            {otpLoading ? <CircularProgress size={22} color="inherit" /> : 'Verify OTP'}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthLogin;
