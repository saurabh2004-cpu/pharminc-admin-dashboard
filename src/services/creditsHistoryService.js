import axiosInstance from '../axios/axiosInstance';

export const getAllCreditsHistory = (page = 1, limit = 10) => {
    return axiosInstance.get(`/credits-history/all-credits-history`, {
        params: {
            page,
            limit
        },
    });
};

export const getCreditsHistoryByInstituteId = (instituteId) => {
    return axiosInstance.get(`/credits-history/credits-history/institute/${instituteId}`);
};

export const getCreditsHistoryById = (id) => {
    return axiosInstance.get(`/credits-history/credits-history/${id}`);
};
