import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
});

// Attach the auth token (if present) to every outgoing request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Edge case: session expired or token invalid/user deleted elsewhere -
// clear stale local storage and bounce to login instead of leaving the
// user stuck on a broken page.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
