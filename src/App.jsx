
import { ThemeSettings } from './theme/Theme';
import RTL from './layouts/full/shared/customizer/RTL';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { RouterProvider, useNavigate } from 'react-router';
import router from './routes/Router'
import { CustomizerContext } from 'src/context/CustomizerContext';
import { useContext, useEffect } from 'react';
import axiosInstance from './axios/axiosInstance';
import{useDispatch} from 'react-redux';
import { login } from './store/authSlice';

function App() {

  const theme = ThemeSettings();
  const { activeDir } = useContext(CustomizerContext);
  const dispatch = useDispatch();

  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get('/admin/get-current-admin');

      console.log('current user', response);

      if (response.data.statusCode === 200) {
        const userData = response.data.data;
        dispatch(login(userData));
        console.log("Current user:", response);
      } else {
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <RTL direction={activeDir}>
        <CssBaseline />
        <RouterProvider router={router} />
      </RTL>
    </ThemeProvider>
  );
}

export default App
