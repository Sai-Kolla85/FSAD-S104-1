import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock users for demo - in real app, this would come from API
  const mockUsers = [
    {
      id: 1,
      email: 'patient@hospital.com',
      password: 'password123',
      role: 'patient',
      name: 'John Doe',
      phone: '+1-234-567-8900',
      address: '123 Main St, City, State'
    },
    {
      id: 2,
      email: 'doctor@hospital.com',
      password: 'password123',
      role: 'doctor',
      name: 'Dr. Sarah Smith',
      specialization: 'Cardiology',
      phone: '+1-234-567-8901'
    },
    {
      id: 3,
      email: 'receptionist@hospital.com',
      password: 'password123',
      role: 'receptionist',
      name: 'Mary Johnson',
      phone: '+1-234-567-8902'
    }
  ];

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = (userData) => {
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'User already exists with this email' };
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      ...userData,
      role: 'patient' // Default role for registration
    };

    // In a real app, this would be sent to backend
    mockUsers.push(newUser);
    
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    setCurrentUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    return { success: true, user: userWithoutPassword };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
