import axios from "axios";

const baseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD
    ? "https://takashi-photos.fly.dev"
    : // In dev, prefer same-origin + Vite proxy (see `client/vite.config.js`).
      "");

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
