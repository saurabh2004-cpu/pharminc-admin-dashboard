import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';

const AuthWrapper = ({ children }) => {
    const adminUser = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const verifyAuthentication = () => {
            const currentPath = window.location.pathname;

            // 1. Perform explicit token verification directly on the HTTP cookie string
            const adminAccessToken = Cookies.get('adminAccessToken');
            const hasAdminCookie = !!adminAccessToken;

            // 2. Establish final authentication booleans
            const isAdminAuthenticated = !!adminUser || hasAdminCookie;

            // 3. Handle Authenticated Users
            if (isAdminAuthenticated) {
                // If authenticated admin tries to visit login page or the root path, send to dashboard
                if (currentPath === '/auth/login' || currentPath === '/auth/login/' || currentPath === '/') {
                    window.location.href = '/dashboards/modern';
                }
                return;
            }

            // 4. Handle Unauthenticated Users (Free passes for login routes)
            if (
                currentPath.includes('/auth/') ||
                currentPath === '/reset-password'
            ) {
                // Allow them to stay on login page
                return;
            }

            // 5. At this point, NO state and NO cookie exists AND they are on a protected route. Safe to eject.
            console.warn("AuthWrapper [Reload]: No valid session detected, ejecting to login.");
            window.location.href = '/auth/login';
        };

        verifyAuthentication();

    }, [adminUser]);

    return children;
};

export default AuthWrapper;