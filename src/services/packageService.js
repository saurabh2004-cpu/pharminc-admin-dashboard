import axiosInstance from '../axios/axiosInstance';

export const createPackage = async (data) => {
    return await axiosInstance.post('/packages/create-package', data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const getPackages = async () => {
    return await axiosInstance.get('/packages/get-all-packages');
};

export const getPackageById = async (id) => {
    return await axiosInstance.get(`/packages/get-package-by-id/${id}`);
};

export const updatePackage = async (id, data) => {
    return await axiosInstance.put(`/packages/update-package/${id}`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const deletePackage = async (id) => {
    return await axiosInstance.delete(`/packages/delete-package/${id}`);
};
