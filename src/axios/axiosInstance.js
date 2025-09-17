import axios from 'axios';

const axiosInstance = axios.create({
  baseURL:  '/api/v1/',
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  withCredentials: true
});

export default axiosInstance;