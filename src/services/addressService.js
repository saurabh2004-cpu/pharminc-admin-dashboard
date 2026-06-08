import axiosInstance from '../axios/axiosInstance';

export const createAddress = async (data) => {
    return await axiosInstance.post('/addresses/create-address', data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const getAllAddresses = async () => {
    return await axiosInstance.get(`/addresses/get-all-addresses`);
};

export const getAddressById = async (id) => {
    return await axiosInstance.get(`/addresses/get-address-by-id/${id}`);
};

export const updateAddress = async (id, data) => {
    return await axiosInstance.put(`/addresses/update-address/${id}`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const deleteAddress = async (id) => {
    return await axiosInstance.delete(`/addresses/delete-address/${id}`);
};
