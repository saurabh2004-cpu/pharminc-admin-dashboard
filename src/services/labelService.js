import axiosInstance from '../axios/axiosInstance';

export const createLabel = async (data) => {
    return await axiosInstance.post('/labels/create-label', data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const getAllLabels = async (type) => {
    let url = '/labels/get-all-labels';
    if (type) {
        url += `?type=${encodeURIComponent(type)}`;
    }
    return await axiosInstance.get(url);
};

export const getLabelById = async (id) => {
    return await axiosInstance.get(`/labels/get-label-by-id/${id}`);
};

export const updateLabel = async (id, data) => {
    return await axiosInstance.put(`/labels/update-label/${id}`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const deleteLabel = async (id) => {
    return await axiosInstance.delete(`/labels/delete-label/${id}`);
};
