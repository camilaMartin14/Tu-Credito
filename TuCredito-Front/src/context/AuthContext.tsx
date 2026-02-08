import React, { createContext, useContext, useState, useEffect } from 'react';
import { Prestamista, PrestamistaLoginResponse } from '../types';

interface AuthContextType {
  user: Prestamista | null;
  token: string | null;
  login: (data: PrestamistaLoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Prestamista | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('prestamista');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (data: PrestamistaLoginResponse) => {
    setToken(data.token);
    setUser(data.prestamista);
    localStorage.setItem('token', data.token);
    localStorage.setItem('prestamista', JSON.stringify(data.prestamista));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('prestamista');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
