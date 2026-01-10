import { useMediaQuery, Box, Drawer, useTheme } from '@mui/material';
import SidebarItems from './SidebarItems';
// import Logo from '../../shared/logo/Logo';
import config from 'src/context/config';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { useContext, useEffect } from 'react';
import Scrollbar from 'src/components/custom-scroll/Scrollbar';
import { Profile } from './SidebarProfile/Profile';
import Logo from 'src/assets/images/logos/poiunt-aus-logo.png';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../../../axios/axiosInstance';
import { login, salesRepLogin } from '../../../../store/authSlice';



const Sidebar = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const {
    isCollapse,
    isSidebarHover,
    setIsSidebarHover,
    isMobileSidebar,
    setIsMobileSidebar,
  } = useContext(CustomizerContext);
  const MiniSidebarWidth = config.miniSidebarWidth;
  const SidebarWidth = config.sidebarWidth;


  const theme = useTheme();
  const toggleWidth =
    isCollapse == "mini-sidebar" && !isSidebarHover
      ? MiniSidebarWidth
      : SidebarWidth;

  const onHoverEnter = () => {
    if (isCollapse == "mini-sidebar") {
      setIsSidebarHover(true);
    }
  };

  const onHoverLeave = () => {
    setIsSidebarHover(false);
  };


  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const admin = useSelector((state) => state.auth.userData);
  // const salesRep = useSelector((state) => state.auth.salesRepData);

  // useEffect(() => {
  //   const checkUserAndNavigate = async () => {
  //     try {
  //       // First, try to fetch current admin
  //       const adminResponse = await axiosInstance.get('/admin/get-current-admin');

  //       console.log('Admin response:', adminResponse);

  //       // Check the inner statusCode (not the HTTP status)
  //       if (adminResponse.data.statusCode === 200 && adminResponse.data.data) {
  //         const userData = adminResponse.data.data;
  //         dispatch(login(userData));
  //         console.log("Current admin user logged in:", userData);

  //         // Navigate to admin dashboard if not already there
  //         if (window.location.pathname !== '/dashboards/ecommerce') {
  //           navigate('/dashboards/ecommerce');
  //         }
  //         return;
  //       } else {
  //         // Admin not authenticated, try sales rep
  //         console.log('Admin not authenticated, checking for sales rep...');
  //         throw new Error('Admin not authenticated');
  //       }
  //     } catch (adminError) {
  //       console.log('No admin user found, checking for sales rep...');

  //       try {
  //         // If admin fetch fails, try to fetch current sales rep
  //         const salesRepResponse = await axiosInstance.get('/sales-rep/get-current-sales-rep');

  //         console.log('Sales rep response:', salesRepResponse);

  //         // Check the inner statusCode (not the HTTP status)
  //         if (salesRepResponse.data.statusCode === 200 && salesRepResponse.data.data) {
  //           const salesRepData = salesRepResponse.data.data;
  //           dispatch(salesRepLogin(salesRepData));
  //           console.log("Current salesRep logged in:", salesRepData);

  //           // Navigate to sales rep dashboard
  //           navigate('/salesrep/dashboards/ecommerce');
  //           return;
  //         } else {
  //           // Sales rep not authenticated either
  //           console.log('Sales rep not authenticated');
  //           throw new Error('Sales rep not authenticated');
  //         }
  //       } catch (salesRepError) {
  //         console.error('No sales rep found either:', salesRepError);
  //         // If both fail, redirect to login
  //         window.location.href = '/auth/login';
  //       }
  //     }
  //   };

  //   checkUserAndNavigate();
  // }, [dispatch, navigate]);


  if (lgUp) {
    return (
      (<Box
        sx={{
          width: toggleWidth,
          flexShrink: 0,
          ...(isCollapse == "mini-sidebar" && {
            position: 'absolute',
          }),
        }}
      >
        {/* ------------------------------------------- */}
        {/* Sidebar for desktop */}
        {/* ------------------------------------------- */}
        <Drawer
          anchor="left"
          open
          onMouseEnter={onHoverEnter}
          onMouseLeave={onHoverLeave}
          variant="permanent"
          slotProps={{
            paper: {
              sx: {
                transition: theme.transitions.create('width', {
                  duration: theme.transitions.duration.shortest,
                }),
                width: toggleWidth,
                boxSizing: 'border-box',
              },
            }
          }}
        >
          {/* ------------------------------------------- */}
          {/* Sidebar Box */}
          {/* ------------------------------------------- */}
          <Box
            sx={{
              // backgroundColor:
              //   activeSidebarBg === '#ffffff' && activeMode === 'dark'
              //     ? darkBackground900
              //     : activeSidebarBg,
              // color: activeSidebarBg === '#ffffff' ? '' : 'white',
              height: '100%',
            }}
          >
            {/* ------------------------------------------- */}
            {/* Logo */}
            {/* ------------------------------------------- */}
            <Box px={3}>
              {/* <Logo /> */}
              <Box px={3}>
                <img src={Logo} alt="logo" style={{ height: 65, marginTop: 10 }} />
              </Box>
            </Box>
            <Scrollbar sx={{ height: 'calc(100% - 190px)' }}>
              {/* ------------------------------------------- */}
              {/* Sidebar Items */}
              {/* ------------------------------------------- */}
              <SidebarItems />
            </Scrollbar>
            <Profile />
          </Box>
        </Drawer>
      </Box>)
    );
  }

  return (
    (<Drawer
      anchor="left"
      open={isMobileSidebar}
      onClose={() => setIsMobileSidebar(false)}
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            width: SidebarWidth,
            // backgroundColor:
            //   activeMode === 'dark'
            //     ? darkBackground900
            //     : activeSidebarBg,
            // color: activeSidebarBg === '#ffffff' ? '' : 'white',
            border: '0 !important',
            boxShadow: (theme) => theme.shadows[8],
          },
        }
      }}
    >
      {/* ------------------------------------------- */}
      {/* Logo */}
      {/* ------------------------------------------- */}
      <Box px={2}>
        {/* <Logo /> */}
        <img src={Logo} alt="logo" style={{ height: 65, marginTop: 10 }} />
      </Box>
      {/* ------------------------------------------- */}
      {/* Sidebar For Mobile */}
      {/* ------------------------------------------- */}
      <SidebarItems />
    </Drawer>)
  );
};

export default Sidebar;
