import axiosInstance from '../axios/axiosInstance';
import { logout } from '../store/authSlice';

export const adminLogout = async (dispatch, navigate) => {
    try {
        await axiosInstance.post('/admin/logout', {});
    } catch (err) {
        console.warn("Logout API failed, forcing local session clear:", err);
    } finally {
        // ALWAYS execute local cleanup, even if backend fails
        document.cookie = "adminAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        dispatch(logout());
        navigate('/auth/login');
    }
};
