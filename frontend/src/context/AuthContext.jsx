import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount
  const checkAuth = useCallback(async () => {
    // TEMPORARY BYPASS FOR CLIENT PREVIEW (Vercel/Deployment)
    if (import.meta.env.VITE_AUTH_BYPASS === 'true') {
      setUser({ 
        _id: 'preview-user', 
        fullName: 'Client Preview', 
        email: 'preview@heritage.com',
        role: 'admin' 
      });
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getCurrentUser();
      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    // TEMPORARY BYPASS FOR CLIENT PREVIEW
    if (import.meta.env.VITE_AUTH_BYPASS === 'true') {
      const dummyUser = { 
        _id: 'preview-user', 
        fullName: 'Client Preview', 
        email: 'preview@heritage.com',
        role: 'admin' 
      };
      setUser(dummyUser);
      setIsAuthenticated(true);
      return { success: true, user: dummyUser };
    }

    const data = await loginUser(email, password);
    if (data.success) {
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const register = async (fullName, email, password) => {
    const data = await registerUser(fullName, email, password);
    if (data.success) {
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Continue with local logout even if API fails
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
