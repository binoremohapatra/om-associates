import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setAuthToken } from '../lib/api';

interface Organization {
  id: string;
  name: string;
}

interface User {
  id: string;
  userCode?: string;
  email: string;
  name: string;
  phone?: string;
  jobTitle?: string;
  avatarUrl?: string;
  role: string;
  organizationId: string;
  organization?: Organization;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Check if we came back from OAuth with a token in URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      let initialToken = urlToken || localStorage.getItem('access_token');
      
      if (initialToken) {
        setAuthToken(initialToken);
        setToken(initialToken);
        localStorage.setItem('access_token', initialToken);
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
        } catch (err) {
          // If /me fails, token might be expired. Try refresh.
          try {
            const refreshRes = await api.post('/auth/refresh');
            const newToken = refreshRes.data.data.accessToken;
            setAuthToken(newToken);
            setToken(newToken);
            localStorage.setItem('access_token', newToken);
            const userRes = await api.get('/auth/me');
            setUser(userRes.data.data.user);
          } catch (refreshErr) {
            setAuthToken(null);
            setToken(null);
            localStorage.removeItem('access_token');
          }
        }
      } else {
        // Try refresh just in case we have a cookie
        try {
          const refreshRes = await api.post('/auth/refresh');
          const newToken = refreshRes.data.data.accessToken;
          setAuthToken(newToken);
          setToken(newToken);
          localStorage.setItem('access_token', newToken);
          const userRes = await api.get('/auth/me');
          setUser(userRes.data.data.user);
        } catch (refreshErr) {
          setAuthToken(null);
          setToken(null);
          localStorage.removeItem('access_token');
        }
      }
      
      // Clean up URL if token was present
      if (urlToken) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      setIsLoaded(true);
    };

    initAuth();
  }, []);

  // Setup Axios interceptor to automatically refresh tokens
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
          originalRequest._retry = true;
          try {
            const res = await api.post('/auth/refresh');
            const newToken = res.data.data.accessToken;
            setAuthToken(newToken);
            setToken(newToken);
            localStorage.setItem('access_token', newToken);
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            setAuthToken(null);
            setToken(null);
            setUser(null);
            localStorage.removeItem('access_token');
          }
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setAuthToken(newToken);
    setToken(newToken);
    localStorage.setItem('access_token', newToken);
    setUser(newUser);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    setAuthToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0F]">
        <div className="w-12 h-12 border-4 border-[#C9A94B]/30 border-t-[#C9A94B] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!user, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
