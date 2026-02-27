import axiosInstance from '../axios/axiosInstance';

export const getJobsByInstituteId = async (instituteId, page = 1, limit = 10, status = '') => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status && status !== 'All') params.append('status', status);

    return await axiosInstance.get(`/job/institute-jobs/${instituteId}?${params.toString()}`);
};
export const getAllJobs = async (page = 1, limit = 10, status = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', limit); // Backend uses pageSize
    if (status && status !== 'All') params.append('status', status);

    return await axiosInstance.get(`/job/all-jobs?${params.toString()}`);
};

export const getJobById = async (id) => {
    return await axiosInstance.get(`/job/get-job/${id}`);
};

export const updateJob = async (id, data) => {
    return await axiosInstance.put(`/job/update-job/${id}`, data);
};

export const deleteJob = async (id) => {
    return await axiosInstance.delete(`/job/delete-job/${id}`);
};

export const toggleJobStatus = async (id) => {
    return await axiosInstance.patch(`/job/toggle-job-status/${id}`);
};
