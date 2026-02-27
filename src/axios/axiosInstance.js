import axios from 'axios';

const axiosInstance = axios.create({

  // for production uncomment this line
  // baseURL: '/api/v1/',

  //for the local setup
  baseURL: import.meta.env.VITE_BASE_BACKEND_URL,

  headers: {},
  withCredentials: true
});

export default axiosInstance;