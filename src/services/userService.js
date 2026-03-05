import axiosInstance from '../axios/axiosInstance';

export const getAllUsers = (page = 1, limit = 10, role = '') => {
    return axiosInstance.get(`/user/get-all-users`, {
        params: {
            page,
            limit,
            role: role && role !== 'All' ? role : undefined,
        },
    });
};

export const getUnverifiedUsers = (page = 1, limit = 10, status = '') => {
    return axiosInstance.get(`/user/unverified-users`, {
        params: {
            page,
            limit,
            status: status && status !== 'All' ? status : undefined,
        },
    });
};

export const getUserById = (id) => {
    return axiosInstance.get(`/user/get-user/${id}`);
};

export const updateUser = (id, userData) => {
    return axiosInstance.put(`/user/update-user/${id}`, userData);
};

export const deleteUser = (id) => {
    return axiosInstance.delete(`/user/delete-user/${id}`);
};

export const verifyUser = (id, status) => {
    return axiosInstance.patch(`/user/verify/${id}`, { status }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const uploadUserImages = (formData) => {
    return axiosInstance.post('/user-images/upload-images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        params: {
            userId: formData.get('userId')
        }
    });
};
