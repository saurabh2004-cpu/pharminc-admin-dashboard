import axiosInstance from '../axios/axiosInstance';

export const createBlog = async (data) => {
    const isFormData = data instanceof FormData;
    return await axiosInstance.post('/blogs/create-blog', data, {
        headers: isFormData ? {} : {
            'Content-Type': 'application/json'
        }
    });
};

export const getAllBlogs = async () => {
    return await axiosInstance.get(`/blogs/get-all-blogs`);
};

export const getBlogById = async (id) => {
    return await axiosInstance.get(`/blogs/get-blog-by-id/${id}`);
};

export const updateBlog = async (id, data) => {
    const isFormData = data instanceof FormData;
    return await axiosInstance.put(`/blogs/update-blog/${id}`, data, {
        headers: isFormData ? {} : {
            'Content-Type': 'application/json'
        }
    });
};

export const deleteBlog = async (id) => {
    return await axiosInstance.delete(`/blogs/delete-blog/${id}`);
};
