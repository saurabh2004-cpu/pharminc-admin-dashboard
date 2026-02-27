import axiosInstance from "../axios/axiosInstance";

export const createCreditsWallet = async (data) => {
    return await axiosInstance.post("/credits-wallet/create", data, {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const getAllCreditsWallets = async (page = 1, pageSize = 20) => {
    return await axiosInstance.get(`/credits-wallet/get-all?page=${page}&pageSize=${pageSize}`);
};

export const getCreditsWallet = async (id) => {
    return await axiosInstance.get(`/credits-wallet/get/${id}`);
};

export const updateCreditsWallet = async (id, data) => {
    return await axiosInstance.put(`/credits-wallet/update/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const deleteCreditsWallet = async (id) => {
    return await axiosInstance.delete(`/credits-wallet/delete/${id}`);
};
