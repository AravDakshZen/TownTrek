import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  authModalOpen: boolean;
  openAuthModal: (msg?: string) => void;
  closeAuthModal: () => void;
  authModalMessage: string;
  hasSkippedAuth: boolean;
  setHasSkippedAuth: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  authModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  authModalMessage: '',
  hasSkippedAuth: false,
  setHasSkippedAuth: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('towntrek_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('towntrek_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [hasSkippedAuth, setHasSkippedAuth] = useState(false);

  useEffect(() => {
    if (token && !user) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('towntrek_user', JSON.stringify(res.data));
          if (res.data?.city && !localStorage.getItem('towntrek_selected_city')) {
            localStorage.setItem('towntrek_selected_city', res.data.city);
          }
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('towntrek_token', newToken);
    localStorage.setItem('towntrek_user', JSON.stringify(newUser));
    if (newUser.city) {
      localStorage.setItem('towntrek_selected_city', newUser.city);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('towntrek_token');
    localStorage.removeItem('towntrek_user');
  };

  const openAuthModal = (msg?: string) => {
    setAuthModalMessage(msg || 'Please sign in to proceed with this booking.');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMessage,
        hasSkippedAuth,
        setHasSkippedAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
