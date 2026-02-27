import React from 'react';
import { Box, Avatar, Typography, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { useContext } from 'react';
import img1 from 'src/assets/images/profile/user-1.jpg';
import { IconPower } from '@tabler/icons';
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../../../../axios/axiosInstance';
import { adminLogout } from 'src/utils/adminLogout';

export const Profile = () => {
  const { isSidebarHover, isCollapse } = useContext(CustomizerContext);
  const [error, setError] = React.useState(null);

  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? isCollapse == 'mini-sidebar' && !isSidebarHover : '';

  const user = useSelector((state) => state.auth.userData);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setError(null);
    await adminLogout(dispatch, navigate);
  };

  return (
    <Box
      display={'flex'}
      alignItems="center"
      gap={2}
      sx={{ m: 3, p: 2, bgcolor: `${'secondary.light'}` }}
    >
      {!hideMenu ? (
        <>
          <Avatar alt="Remy Sharp" src={img1} />

          <Box>
            <Typography variant="h6" color="textPrimary"> {user?.username}</Typography>
            <Typography variant="caption" color="textSecondary">Admin</Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            {user &&
              <Tooltip title="Logout" placement="top" onClick={handleLogout}>
                <IconButton color="primary" component={Link} to="/auth/login" aria-label="logout" size="small">
                  <IconPower size="20" />
                </IconButton>
              </Tooltip>
            }
          </Box>
        </>
      ) : (
        ''
      )}
    </Box>
  );
};
