import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api",
});

// Attach the JWT (if we have one) to every outgoing request automatically,
// rather than remembering to pass it manually in each call site.
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("queueease_user");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
