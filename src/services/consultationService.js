import axiosInstance from '../axios/axiosInstance';

export const getAllConsultations = async () => {
    return await axiosInstance.get(`/consultations/get-all-consultations`);
};

export const getConsultationById = async (id) => {
    return await axiosInstance.get(`/consultations/get-consultation-by-id/${id}`);
};

export const updateConsultationStatus = async (id, status) => {
    return await axiosInstance.put(`/consultations/update-consultation-status/${id}`, { status }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const deleteConsultation = async (id) => {
    return await axiosInstance.delete(`/consultations/delete-consultation/${id}`);
};
