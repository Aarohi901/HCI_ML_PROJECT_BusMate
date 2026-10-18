import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEMO_STUDENTS, getAvailableBranches } from '../data/iiitBusData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Read existing session from localStorage, fallback to first demo student
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('iiit_campus_student');
      if (stored) return JSON.parse(stored);
      // Legacy fallback check
      const legacy = localStorage.getItem('smartbus_auth_user');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (parsed.misNumber) return parsed;
      }
    } catch (e) {
      console.error('Error reading auth session:', e);
    }
    // Default to Aditya Verma (B.Tech 2026-2030 AIDS)
    return DEMO_STUDENTS[0];
  });

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup' | 'profile'
  const [authPromptMessage, setAuthPromptMessage] = useState('');
  const [postAuthCallback, setPostAuthCallback] = useState(null);

  // Sync session changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('iiit_campus_student', JSON.stringify(user));
      localStorage.setItem('smartbus_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('iiit_campus_student');
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

  // Login handler with MIS or email/phone
  const login = useCallback(async ({ identifier, password, otp, isOtpMode }) => {
    const cleanId = (identifier || '').trim();

    // Check if matching any demo student by MIS
    let foundStudent = DEMO_STUDENTS.find(s => s.misNumber === cleanId || s.fullName.toLowerCase() === cleanId.toLowerCase());

    if (!foundStudent) {
      // Check if ID looks like an MIS number (e.g. 9 digits) or generic
      foundStudent = {
        misNumber: cleanId || `112603${Math.floor(100 + Math.random() * 900)}`,
        fullName: cleanId.includes('@') ? cleanId.split('@')[0] : (cleanId || 'IIIT Pune Scholar'),
        hostel: 'GODAVARI',
        roomNumber: 'G-101',
        course: 'B.Tech',
        batch: '2026-2030',
        branch: 'AIDS',
        canTravelStanding: true,
        declaredAccessibilityNeed: false,
        rejectedRequestsLast14Days: 0,
        confirmedBookingsThisWeek: 1,
        weeklyClassTimetable: [
          { day: 'Wednesday', startTime: '13:00', endTime: '15:30', subject: 'Machine Learning Lab' }
        ]
      };
    }

    const sessionData = {
      ...foundStudent,
      id: `usr_${foundStudent.misNumber}`,
      token: `iiit_tok_${Math.random().toString(36).substring(2, 10)}`,
      role: 'student',
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

  // Fast demo student switcher for testing evaluation criteria
  const switchDemoStudent = useCallback((misNumber) => {
    const found = DEMO_STUDENTS.find(s => s.misNumber === misNumber) || DEMO_STUDENTS[0];
    const sessionData = {
      ...found,
      id: `usr_${found.misNumber}`,
      token: `iiit_tok_${Math.random().toString(36).substring(2, 10)}`,
      role: 'student',
      loginTime: new Date().toISOString()
    };
    setUser(sessionData);
    return sessionData;
  }, []);

  // Update student profile (e.g. standing travel toggle, timetable slots)
  const updateStudentProfile = useCallback((updates = {}) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      // Enforce branch validity if course or batch changed
      const allowedBranches = getAvailableBranches(updated.course, updated.batch);
      if (!allowedBranches.includes(updated.branch)) {
        updated.branch = allowedBranches[0] || 'CSE';
      }
      return updated;
    });
  }, []);

  // Signup / Register handler with strict dependent branch enforcement
  const signup = useCallback(async ({ 
    misNumber, 
    fullName, 
    hostel = 'GODAVARI', 
    roomNumber = 'G-101', 
    course = 'B.Tech', 
    batch = '2026-2030', 
    branch = 'AIDS', 
    canTravelStanding = true,
    declaredAccessibilityNeed = false 
  }) => {
    // Validate dependent branch
    const allowed = getAvailableBranches(course, batch);
    const validBranch = allowed.includes(branch) ? branch : allowed[0];

    const sessionData = {
      id: `usr_${misNumber}`,
      misNumber: misNumber.trim(),
      fullName: fullName.trim(),
      hostel,
      roomNumber: roomNumber.trim(),
      course,
      batch,
      branch: validBranch,
      canTravelStanding: Boolean(canTravelStanding),
      declaredAccessibilityNeed: Boolean(declaredAccessibilityNeed),
      rejectedRequestsLast14Days: 0,
      confirmedBookingsThisWeek: 0,
      weeklyClassTimetable: [
        { day: 'Monday', startTime: '09:00', endTime: '12:00', subject: 'Programming Lab' }
      ],
      token: `iiit_tok_${Math.random().toString(36).substring(2, 10)}`,
      role: 'student',
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
    localStorage.removeItem('iiit_campus_student');
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
    switchDemoStudent,
    updateStudentProfile,
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
