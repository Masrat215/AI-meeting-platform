import axios from "axios";

const TOKEN_KEY = "scribwave-token";

// Small helpers to keep the login token in the browser
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Add the login token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server says "you are not logged in" (except on the login and
// register forms), forget the token and tell the app to sign out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthForm =
      url.startsWith("/api/auth/login") || url.startsWith("/api/auth/register");

    if (error.response?.status === 401 && !isAuthForm) {
      clearToken();
      window.dispatchEvent(new Event("scribwave:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;