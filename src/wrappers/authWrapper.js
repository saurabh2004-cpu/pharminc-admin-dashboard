// AuthWrapper.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axiosInstance from '../axios/axiosInstance';
import { login, salesRepLogin } from '../store/authSlice';

const AuthWrapper = ({ children }) => {
    const dispatch = useDispatch();
    // const navigate = useNavigate();

    useEffect(() => {
        const checkUserAndNavigate = async () => {
            try {
                // Skip auth check for auth routes
                if (location.pathname.includes('/auth/') ||
                    location.pathname.includes('/salas-rep/login') ||
                    location.pathname === '/reset-password') {
                    return;
                }

                // First, try to fetch current admin
                const adminResponse = await axiosInstance.get('/admin/get-current-admin');

                if (adminResponse.data.statusCode === 200 && adminResponse.data.data) {
                    const userData = adminResponse.data.data;
                    dispatch(login(userData));
                    console.log("Current admin user logged in:", userData);

                    // Only navigate if we're on a non-admin route and not already there
                    if (location.pathname.startsWith('/salesrep/')) {
                        navigate('/dashboards/ecommerce', { replace: true });
                    }
                    return;
                } else {
                    throw new Error('Admin not authenticated');
                }
            } catch (adminError) {
                console.log('No admin user found, checking for sales rep...');

                try {
                    // If admin fetch fails, try to fetch current sales rep
                    const salesRepResponse = await axiosInstance.get('/sales-rep/get-current-sales-rep');

                    if (salesRepResponse.data.statusCode === 200 && salesRepResponse.data.data) {
                        const salesRepData = salesRepResponse.data.data;
                        dispatch(salesRepLogin(salesRepData));
                        console.log("Current salesRep logged in:", salesRepData);

                        // Only navigate if we're on a non-salesrep route and not already there
                        if (!location.pathname.startsWith('/salesrep/')) {
                            // navigate('/salesrep/dashboards/ecommerce', { replace: true });
                            window.location.href = '/salesrep/dashboards/ecommerce';
                        }
                        return;
                    } else {
                        throw new Error('Sales rep not authenticated');
                    }
                } catch (salesRepError) {
                    console.error('No sales rep found either:', salesRepError);
                    // If both fail, redirect to login
                    if (!location.pathname.includes('/auth/') &&
                        !location.pathname.includes('/salas-rep/login')) {
                        // navigate('/auth/login', { replace: true });
                        window.location.href = '/auth/login';
                    }
                }
            }
        };

        checkUserAndNavigate();
    }, [dispatch, window.location.pathname]);

    return children;
};

export default AuthWrapper;