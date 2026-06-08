import axiosInstance from '../axios/axiosInstance';

export const createService = async (data) => {
    return await axiosInstance.post('/services/create-service', data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const getAllServices = async () => {
    return await axiosInstance.get(`/services/get-all-services`);
};

export const getServiceById = async (id) => {
    return await axiosInstance.get(`/services/get-service-by-id/${id}`);
};

export const updateService = async (id, data) => {
    return await axiosInstance.put(`/services/update-service/${id}`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const deleteService = async (id) => {
    return await axiosInstance.delete(`/services/delete-service/${id}`);
};
