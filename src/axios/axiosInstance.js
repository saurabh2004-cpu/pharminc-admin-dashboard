import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: '/api/v1/',  ..
  baseURL: import.meta.env.VITE_BASE_BACKEND_URL,
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  withCredentials: true
});

export default axiosInstance;