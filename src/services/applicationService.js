import axiosInstance from '../axios/axiosInstance';

export const getApplicationsByJobId = async (jobId, page = 1, limit = 10, status = '') => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status && status !== 'All') params.append('status', status);

    return await axiosInstance.get(`/application/get-applications-by-job/${jobId}?${params.toString()}`);
};

export const getApplicationsByUserId = async (userId) => {
    return await axiosInstance.get(`/application/get-applications-by-user/${userId}`);
};


export const deleteApplicationById = async (id) => {
    return await axiosInstance.delete(`/application/delete-application/${id}`);
}
