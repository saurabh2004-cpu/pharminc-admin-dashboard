import axiosInstance from '../axios/axiosInstance';

export const importKeywords = async (formData) => {
    return await axiosInstance.post('/keywords/import-csv', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const getAllKeywords = async (status) => {
    let url = '/keywords/get-all-keywords';
    if (status) {
        url += `?status=${encodeURIComponent(status)}`;
    }
    return await axiosInstance.get(url);
};

export const updateKeyword = async (id, data) => {
    return await axiosInstance.put(`/keywords/update-keyword/${id}`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const deleteKeyword = async (id) => {
    return await axiosInstance.delete(`/keywords/delete-keyword/${id}`);
};
