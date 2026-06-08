import axiosInstance from '../axios/axiosInstance';

export const loginAdmin = async (email, password) => {
    return await axiosInstance.post('/admin/login', { email, password }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const logoutAdmin = async () => {
    return await axiosInstance.post('/admin/logout', {}, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const deleteAdmin = async (id) => {
    return await axiosInstance.delete(`/admin/delete/${id}`);
};
