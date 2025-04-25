import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage if available
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('user');
    
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      loading: !!token, // Only true if token exists
      error: null,
      isAdmin: storedUser ? JSON.parse(storedUser).role === 'admin' : false
    };
  });

  const normalizeUserData = (data) => ({
    ...(data.user || data.admin || data),
    id: (data.user || data.admin || data)?._id,
    name: (data.user || data.admin || data)?.name,
    email: (data.user || data.admin || data)?.email,
    role: (data.user || data.admin || data)?.role || 'user'
  });

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const storedUser = localStorage.getItem('user');

      if (!token) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return;
      }

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setAuthState(prev => ({
          ...prev,
          user: parsedUser,
          isAdmin: parsedUser.role === 'admin',
          loading: true
        }));
      }

      const endpoint = localStorage.getItem('adminToken') ? '/admin/data' : '/user';
      const response = await api.get(endpoint);
      
      const userData = normalizeUserData(response.data);
      
      setAuthState({
        user: userData,
        loading: false,
        error: null,
        isAdmin: userData.role === 'admin'
      });

      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err.response?.status === 401 
          ? 'Session expired. Please login again.' 
          : 'Failed to verify session'
      }));
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password, adminLogin = false) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = adminLogin 
        ? await api.adminLogin(email, password)
        : await api.login(email, password);
      
      // Handle both user and admin responses
      const userData = adminLogin 
        ? normalizeUserData(response.data.admin)
        : normalizeUserData(response.data.user);
      
      const token = response.data.token;
  
      if (!userData || !token) {
        throw new Error('Invalid response from server');
      }
  
      const tokenKey = adminLogin ? 'adminToken' : 'token';
      localStorage.setItem(tokenKey, token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setAuthState({
        user: userData,
        loading: false,
        error: null,
        isAdmin: adminLogin 
      });
      
      return { 
        success: true, 
        isAdmin: adminLogin,
        user: userData
      };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await api.register(name, email, password, role);
      const userData = normalizeUserData(response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setAuthState({
        user: userData,
        loading: false,
        error: null,
        isAdmin: userData.role === 'admin'
      });
      
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      loading: false,
      error: null,
      isAdmin: false
    });
  };

  const setError = (error) => setAuthState(prev => ({ ...prev, error }));

  const checkAdmin = () => authState.user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      loading: authState.loading,
      error: authState.error,
      isAdmin: authState.isAdmin,
      login,
      register,
      logout: handleLogout,
      setError,
      checkAdmin,
      refreshAuth: checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;