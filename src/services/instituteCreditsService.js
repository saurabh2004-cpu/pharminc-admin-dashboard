import axiosInstance from "../axios/axiosInstance";

export const createInstituteCredits = async (data) => {
    return await axiosInstance.post("/institute-credits/create", data, {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const updateInstituteCredits = async (id, data) => {
    return await axiosInstance.put(`/institute-credits/update/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const getInstituteCredits = async (id) => {
    return await axiosInstance.get(`/institute-credits/get/${id}`);
};

export const getAllInstituteCredits = async (page = 1, limit = 10) => {
    return await axiosInstance.get(`/institute-credits/get-all?page=${page}&limit=${limit}`);
};

export const deleteInstituteCredits = async (id) => {
    return await axiosInstance.delete(`/institute-credits/delete/${id}`);
};

