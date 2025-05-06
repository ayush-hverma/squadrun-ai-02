import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export type UserRole = 'superadmin' | 'admin' | 'user';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: UserRole;
}

interface AllowedUser {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credential: string) => void;
  logout: () => void;
  allowedUsers: AllowedUser[];
  addAllowedUser: (email: string, role: UserRole) => void;
  removeAllowedUser: (email: string) => void;
  updateUserRole: (email: string, role: UserRole) => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial superadmin user - this will be the first user who can access the admin panel
const INITIAL_SUPERADMIN: AllowedUser = {
  email: "ayu5hh.verma03@gmail.com",
  role: 'superadmin'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>(() => {
    const stored = localStorage.getItem('allowedUsers');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure superadmin is always present
      if (!parsed.some((u: AllowedUser) => u.email === INITIAL_SUPERADMIN.email)) {
        return [...parsed, INITIAL_SUPERADMIN];
      }
      return parsed;
    }
    return [INITIAL_SUPERADMIN];
  });

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Save allowed users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('allowedUsers', JSON.stringify(allowedUsers));
  }, [allowedUsers]);

  const login = (credential: string) => {
    try {
      const decodedToken: any = jwtDecode(credential);
      console.log('Decoded token:', decodedToken);
      
      // Check if user email is in allowed list
      const allowedUser = allowedUsers.find(u => u.email === decodedToken.email);
      if (!allowedUser) {
        throw new Error('User not authorized');
      }

      const userData: User = {
        id: decodedToken.sub,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        role: allowedUser.role
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const addAllowedUser = (email: string, role: UserRole) => {
    // Prevent adding superadmin role
    if (role === 'superadmin') {
      throw new Error('Cannot add superadmin role');
    }
    setAllowedUsers(prev => [...prev, { email, role }]);
  };

  const removeAllowedUser = (email: string) => {
    const userToRemove = allowedUsers.find(u => u.email === email);
    if (userToRemove?.role === 'superadmin') {
      throw new Error('Cannot remove superadmin');
    }
    setAllowedUsers(prev => prev.filter(user => user.email !== email));
  };

  const updateUserRole = (email: string, role: UserRole) => {
    const userToUpdate = allowedUsers.find(u => u.email === email);
    if (userToUpdate?.role === 'superadmin') {
      throw new Error('Cannot modify superadmin role');
    }
    if (role === 'superadmin') {
      throw new Error('Cannot assign superadmin role');
    }
    setAllowedUsers(prev => 
      prev.map(user => user.email === email ? { ...user, role } : user)
    );
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      allowedUsers,
      addAllowedUser,
      removeAllowedUser,
      updateUserRole,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 