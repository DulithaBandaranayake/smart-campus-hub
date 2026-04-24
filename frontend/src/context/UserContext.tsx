import React, { createContext, useContext, useState } from 'react';

type Role = 'STUDENT' | 'PARENT' | 'LECTURER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  role: Role;
  email?: string;
  studentId?: number;
  parentId?: number;
  lecturerId?: number;
}

interface UserContextType {
  user: User | null;
  role: Role | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('hubUser');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('hubUser', JSON.stringify(userData));
    localStorage.setItem('hubToken', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hubUser');
    localStorage.removeItem('hubToken');
    window.location.href = '/login';
  };

  return (
    <UserContext.Provider value={{
      user,
      role: user?.role || null,
      login,
      logout,
      isAuthenticated: !!user && !!localStorage.getItem('hubToken')
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
