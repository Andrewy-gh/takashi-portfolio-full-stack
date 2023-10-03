import axios from 'axios';
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'your-production-url.com'
    : 'http://localhost:3000';

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

let token = null;

export const setToken = (newToken) => {
  token = `Bearer ${newToken}`;
};

api.interceptors.request.use(
  (config) => {
    if (token) {
      config.headers.Authorization = token;
      config.headers['Cache-Control'] = 'public';
      config.headers['max-age'] = '3600';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.data.error === 'token expired') {
      return Promise.reject('token expired');
    }
    return Promise.reject(error);
  }
);

export default api;
