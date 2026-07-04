import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "queueease_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, trust whatever's in localStorage optimistically so the
  // UI doesn't flash a logged-out state, then quietly verify with the server.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      api
        .get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const normalized = {
      ...data,
      department: data.department && typeof data.department === "object"
        ? data.department
        : data.department
          ? { _id: data.department, name: data.department }
          : null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    setUser(normalized);
    return normalized;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
