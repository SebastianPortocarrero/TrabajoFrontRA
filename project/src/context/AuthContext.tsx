import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user exists in localStorage
    const storedUser = localStorage.getItem('arEdUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API request
    setIsLoading(true);
    try {
      // In a real app, we would call an API here
      // For demo purposes, let's just check if the email exists in localStorage
      const users = JSON.parse(localStorage.getItem('arEdUsers') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email
        };
        localStorage.setItem('arEdUser', JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API request
    setIsLoading(true);
    try {
      // In a real app, we would call an API here
      const users = JSON.parse(localStorage.getItem('arEdUsers') || '[]');
      const userExists = users.some((user: any) => user.email === email);
      
      if (userExists) {
        return false;
      }
      
      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        password // In a real app, you would NEVER store the password in localStorage
      };
      
      users.push(newUser);
      localStorage.setItem('arEdUsers', JSON.stringify(users));
      
      const userData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      };
      
      localStorage.setItem('arEdUser', JSON.stringify(userData));
      setUser(userData);
      
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('arEdUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, isLoading }}>
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