import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  timeout: 10000,
  withCredentials: true, // ✅ This ensures cookies are sent
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 ||
      (error.response?.status === 403 &&
  !originalRequest.retry &&
        typeof window !== "undefined" &&
        localStorage.getItem("isLoggedIn") === "true")
    ) {
  originalRequest.retry = true;

      try {
        // Just call the refresh endpoint — no tokens passed in body or headers
        await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh-token`, { withCredentials: true });

        return api(originalRequest); // Retry original request after token refresh
      } catch (err) {
        localStorage.removeItem("isLoggedIn");
        window.location.href = "/auth/v2/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
