import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api, { clearToken, getToken, setToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True while we check whether a saved login is still valid
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // When the website opens: if a token is saved, ask the server who we are
  useEffect(() => {
    if (!getToken()) return;

    api
      .get("/api/auth/me")
      .then((response) => setUser(response.data.user))
      .catch(() => {
        // an invalid token is cleared by the interceptor in api.js
      })
      .finally(() => setLoading(false));
  }, []);

  // api.js announces this when the server rejects the token
  useEffect(() => {
    window.addEventListener("scribwave:unauthorized", logout);
    return () => window.removeEventListener("scribwave:unauthorized", logout);
  }, [logout]);

  const login = async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/api/auth/register", {
      name,
      email,
      password,
    });
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);