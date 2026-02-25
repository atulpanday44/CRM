import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('crmUser');
    const token = localStorage.getItem('crmToken');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = password != null ? String(password).trim() : '';
    try {
      const res = await fetch(`${API_BASE}/accounts/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        const u = {
          id: data.user.id,
          name: data.user.first_name ? `${data.user.first_name} ${data.user.last_name || ''}`.trim() : data.user.username,
          email: data.user.email,
          role: data.user.role,
          department: data.user.department,
        };
        setUser(u);
        localStorage.setItem('crmUser', JSON.stringify(u));
        localStorage.setItem('crmToken', data.access);
        if (data.refresh) localStorage.setItem('crmRefreshToken', data.refresh);
        return { success: true };
      }
      // Backend responded with an error (invalid credentials, disabled, etc.)
      const message = data.detail || data.message || data.error || 'Invalid email or password.';
      return { success: false, error: message };
    } catch {
      // Fallback to mock auth only when backend is unreachable
      const mockUsers = [
        { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
        { id: 2, name: 'Sales User', email: 'sales@example.com', role: 'user', department: 'Sales' },
      ];
      const foundUser = mockUsers.find((u) => u.email === email);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('crmUser', JSON.stringify(foundUser));
        return { success: true };
      }
      return { success: false, error: 'Cannot reach server. Is the backend running?' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crmUser');
    localStorage.removeItem('crmToken');
    localStorage.removeItem('crmRefreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
