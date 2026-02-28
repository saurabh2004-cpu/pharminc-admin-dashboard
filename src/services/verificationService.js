import axiosInstance from '../axios/axiosInstance';

// ----- USER VERIFICATIONS -----

export const getAllUserVerifications = (page = 1, limit = 10, status = '') => {
    return axiosInstance.get(`/user-verifications/get-all-verifications`, {
        params: {
            page,
            pageSize: limit,
            status: status && status !== 'All' ? status : undefined,
        },
    });
};

export const getUserVerificationById = (id) => {
    return axiosInstance.get(`/user-verifications/get-verification-by-id/${id}`);
};

export const deleteUserVerification = (id) => {
    return axiosInstance.delete(`/user-verifications/delete-verification/${id}`);
};

export const approveUserVerification = (id) => {
    return axiosInstance.patch(`/user-verifications/approve-verification/${id}`);
};

export const rejectUserVerification = (id) => {
    return axiosInstance.patch(`/user-verifications/reject-verification/${id}`);
};

// ----- INSTITUTE VERIFICATIONS -----

export const getAllInstituteVerifications = (page = 1, limit = 10, status = '') => {
    return axiosInstance.get(`/institute-verifications/get-all-verifications`, {
        params: {
            page,
            pageSize: limit,
            status: status && status !== 'All' ? status : undefined,
        },
    });
};

export const getInstituteVerificationById = (id) => {
    return axiosInstance.get(`/institute-verifications/get-verification-by-id/${id}`);
};

export const deleteInstituteVerification = (id) => {
    return axiosInstance.delete(`/institute-verifications/delete-verification/${id}`);
};

export const approveInstituteVerification = (id) => {
    return axiosInstance.put(`/institute-verifications/approve-verification/${id}`);
};

export const rejectInstituteVerification = (id) => {
    return axiosInstance.put(`/institute-verifications/reject-verification/${id}`);
};
