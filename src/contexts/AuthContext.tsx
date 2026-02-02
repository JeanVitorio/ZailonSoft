import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  storeName: string;
  role: 'admin' | 'seller';
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isActive: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (data: SignupData) => Promise<boolean>;
  activateAccount: () => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  storeName: string;
  whatsapp: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('autoconnect_user');
    const savedLoggedIn = localStorage.getItem('autoconnect_logged_in');
    const savedActive = localStorage.getItem('autoconnect_active');

    if (savedUser && savedLoggedIn === 'true') {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      setIsActive(savedActive !== 'false');
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Demo credentials
    if (email === 'demo@autoconnect.com' && password === 'demo123') {
      const userData: User = {
        id: 'user-1',
        name: 'Administrador Demo',
        email: email,
        storeName: 'AutoConnect Premium',
        role: 'admin',
        isActive: true
      };

      setUser(userData);
      setIsLoggedIn(true);
      setIsActive(true);

      localStorage.setItem('autoconnect_user', JSON.stringify(userData));
      localStorage.setItem('autoconnect_logged_in', 'true');
      localStorage.setItem('autoconnect_active', 'true');

      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('autoconnect_user');
    localStorage.removeItem('autoconnect_logged_in');
    localStorage.removeItem('autoconnect_active');
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userData: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      storeName: data.storeName,
      role: 'admin',
      isActive: true
    };

    setUser(userData);
    setIsLoggedIn(true);
    setIsActive(true);

    localStorage.setItem('autoconnect_user', JSON.stringify(userData));
    localStorage.setItem('autoconnect_logged_in', 'true');
    localStorage.setItem('autoconnect_active', 'true');

    return true;
  };

  const activateAccount = () => {
    setIsActive(true);
    localStorage.setItem('autoconnect_active', 'true');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      isActive,
      login,
      logout,
      signup,
      activateAccount
    }}>
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
