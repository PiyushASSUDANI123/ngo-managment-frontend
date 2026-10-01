import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ngo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (user?.token) {
        try {
          const { data } = await API.get('/auth/me');
          setUser((prev) => ({ ...prev, ...data }));
        } catch (error) {
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const loginAdmin = async (username, password) => {
    const { data } = await API.post('/auth/admin/login', { username, password });
    localStorage.setItem('ngo_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const loginVolunteer = async (volunteerId, password) => {
    const { data } = await API.post('/auth/volunteer/login', { volunteerId, password });
    localStorage.setItem('ngo_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('ngo_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAdmin, loginVolunteer, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
