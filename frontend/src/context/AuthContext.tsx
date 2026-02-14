import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "../api/client";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  // On mount, if token exists, fetch current user
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get<User>("/auth/me")
      .then((data) => setUser(data))
      .catch(() => {
        // Token is invalid — clean up
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    const data = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
