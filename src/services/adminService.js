import axiosInstance from '../axios/axiosInstance';

export const getAllAdmins = () => {
    return axiosInstance.get('/admin/get-all-admins');
};

export const getAdminById = (id) => {
    return axiosInstance.get(`/admin/get-admin/${id}`);
};

export const createAdmin = (adminData) => {
    return axiosInstance.post('/admin/signup', adminData);
};

export const updateAdmin = (id, adminData) => {
    return axiosInstance.put(`/admin/edit-admin/${id}`, adminData);
};

export const deleteAdmin = (id) => {
    return axiosInstance.delete(`/admin/delete-admin/${id}`);
};
