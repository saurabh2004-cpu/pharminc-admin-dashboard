import axiosInstance from '../axios/axiosInstance';

export const createInstitute = async (data) => {
    return await axiosInstance.post('/institute/create-institute', data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const getInstitutes = async (page = 1, limit = 10, status = '') => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status && status !== 'All') params.append('status', status);

    return await axiosInstance.get(`/institute/get-all-institutes?${params.toString()}`);
};

export const getInstituteById = async (id) => {
    return await axiosInstance.get(`/institute/get-institute/${id}`);
};

export const updateInstitute = async (id, data) => {
    return await axiosInstance.put(`/institute/update-institute/${id}`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
