import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_ORIGIN || "http://localhost:5000"}/api`
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("scp_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("scp_token");
      localStorage.removeItem("scp_user");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
