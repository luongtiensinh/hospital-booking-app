import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const storedSession = localStorage.getItem("session");
    const storedUser = localStorage.getItem("user");

    if (storedSession && storedUser) {
      try {
        setSession(JSON.parse(storedSession));
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Lỗi khi parse dữ liệu session:", e);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, sessionData) => {
    setUser(userData);
    setSession(sessionData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("session", JSON.stringify(sessionData));
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem("user");
    localStorage.removeItem("session");
  };

  const value = {
    user,
    session,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
