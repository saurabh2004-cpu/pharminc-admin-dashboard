import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Box, Avatar, Typography, Divider, Button, IconButton, Alert, Menu } from '@mui/material';
import * as dropdownData from './data';
import { IconMail } from '@tabler/icons';
import { Stack } from '@mui/system';
import ProfileImg from 'src/assets/images/profile/user-1.jpg';
import Scrollbar from 'src/components/custom-scroll/Scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import { logout, salesRepLogout } from '../../../../store/authSlice';
import axiosInstance from 'src/axios/axiosInstance';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.userData);
  const salesRep = useSelector((state) => state.auth.salesRepData);

  console.log("sales rep data in prodfile", salesRep);

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
    setError(null); // clear error when menu closes
  };

  const handleLogout = async () => {
    setError(null); // clear previous error
    try {
      const res = await axiosInstance.post('/admin/logout', {});

      if (res.data.statusCode === 200) {
        dispatch(logout());
        navigate('/auth/login');
      } else {
        setError(res.data.message || 'Logout failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    }
  };

  const handleSalesRepLogout = async () => {
    setError(null); // clear previous error
    try {
      const res = await axiosInstance.post('/sales-rep/logout-sales-rep', {});

      if (res.data.statusCode === 200) {
        dispatch(salesRepLogout());
        navigate('/auth/login');
      } else {
        setError(res.data.message || 'Logout failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    }
  };

  return (
    <Box>
      <IconButton
        size="large"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={ProfileImg}
          alt="Profile"
          sx={{ width: 35, height: 35 }}
        />
      </IconButton>

      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{ '& .MuiMenu-paper': { width: '360px' } }}
      >
        <Scrollbar sx={{ height: '100%', maxHeight: '85vh' }}>
          <Box p={3}>
            <Typography variant="h5">User Profile</Typography>

            {/* ✅ Show error inside dropdown */}
            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}

            <Stack direction="row" py={3} spacing={2} alignItems="center">
              <Avatar src={ProfileImg} alt="User" sx={{ width: 95, height: 95 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.username || salesRep?.salesRepId}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {user ? 'Admin' : 'Sales Rep'}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <IconMail width={15} height={15} />
                  {user?.email}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            {dropdownData.profile.map((profile) => (
              <Box key={profile.title} sx={{ py: 2 }}>
                <Link to={profile.href}>
                  <Stack direction="row" spacing={2}>
                    <Box
                      width="45px"
                      height="45px"
                      bgcolor="primary.light"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Avatar
                        src={profile.icon}
                        alt={profile.icon}
                        sx={{ width: 24, height: 24, borderRadius: 0 }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        noWrap
                        sx={{ width: '240px' }}
                      >
                        {profile.title}
                      </Typography>
                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        noWrap
                        sx={{ width: '240px' }}
                      >
                        {profile.subtitle}
                      </Typography>
                    </Box>
                  </Stack>
                </Link>
              </Box>
            ))}

            <Box mt={2}>
              {user && salesRep == null &&
                <Button Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={handleLogout}
                  sx={{ backgroundColor: '#2E2F7F', color: 'white', ":hover": { backgroundColor: '#2E2F7F' } }}
                >
                  Logout
                </Button>}

              {salesRep != null && user == null &&
                <Button Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={handleSalesRepLogout}
                  sx={{ backgroundColor: '#2E2F7F', color: 'white', ":hover": { backgroundColor: '#2E2F7F' } }}
                >
                  Logout
                </Button>}
            </Box>
          </Box>
        </Scrollbar>
      </Menu>
    </Box >
  );
};

export default Profile;
