import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Read existing session from localStorage
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('smartbus_auth_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading auth session:', e);
    }
    return null;
  });

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'
  const [authPromptMessage, setAuthPromptMessage] = useState('');
  const [postAuthCallback, setPostAuthCallback] = useState(null);

  // Sync session changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('smartbus_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smartbus_auth_user');
    }
  }, [user]);

  const openAuthModal = useCallback(({ mode = 'login', prompt = '', onAuthenticated = null } = {}) => {
    setAuthModalMode(mode);
    setAuthPromptMessage(prompt);
    if (typeof onAuthenticated === 'function') {
      setPostAuthCallback(() => onAuthenticated);
    } else {
      setPostAuthCallback(null);
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage('');
    setPostAuthCallback(null);
  }, []);

  // Login handler
  const login = useCallback(async ({ identifier, password, otp, isOtpMode }) => {
    // Generate clean user session
    const isEmail = identifier && identifier.includes('@');
    const cleanIdentifier = (identifier || '').trim();
    
    // Check if it's our known demo user or custom
    let displayName = 'Diwansh Sharma';
    let userEmail = isEmail ? cleanIdentifier : 'diwansh.sharma@example.com';
    let userPhone = !isEmail && cleanIdentifier ? cleanIdentifier : '+91 98765 43210';

    if (cleanIdentifier.toLowerCase().includes('alex')) {
      displayName = 'Alex Rivera';
      userEmail = 'alex.commuter@gmail.com';
    } else if (isEmail) {
      // Derive name from email prefix
      const prefix = cleanIdentifier.split('@')[0];
      displayName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    const sessionData = {
      id: `usr_${Date.now().toString(36)}`,
      name: displayName,
      email: userEmail,
      phone: userPhone,
      token: `sb_tok_live_${Math.random().toString(36).substring(2, 10)}`,
      role: 'commuter',
      loginTime: new Date().toISOString()
    };

    setUser(sessionData);
    setIsAuthModalOpen(false);

    if (postAuthCallback) {
      postAuthCallback(sessionData);
      setPostAuthCallback(null);
    }

    return sessionData;
  }, [postAuthCallback]);

  // Signup handler
  const signup = useCallback(async ({ fullName, email, phone, password }) => {
    const sessionData = {
      id: `usr_${Date.now().toString(36)}`,
      name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      token: `sb_tok_live_${Math.random().toString(36).substring(2, 10)}`,
      role: 'commuter',
      loginTime: new Date().toISOString()
    };

    setUser(sessionData);
    setIsAuthModalOpen(false);

    if (postAuthCallback) {
      postAuthCallback(sessionData);
      setPostAuthCallback(null);
    }

    return sessionData;
  }, [postAuthCallback]);

  // Logout handler
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('smartbus_auth_user');
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAuthModalOpen,
    authModalMode,
    authPromptMessage,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
