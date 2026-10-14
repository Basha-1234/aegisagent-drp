import React, { createContext, useContext, useState, useEffect } from 'react';

// Pre-configured enterprise demo personas for 1-click evaluation
export const DEMO_PERSONAS = {
  analyst: {
    id: 'usr-analyst-01',
    name: 'Alex Chen',
    title: 'Senior Threat Analyst',
    email: 'alex.chen@razorpay.com',
    role: 'analyst',
    department: 'Security Operations (SOC)',
    avatar: 'AC',
    permissions: ['READ_THREATS', 'TRIAGE_EVIDENCE', 'AUDIT_DIFF', 'CLUSTER_SYNDICATE']
  },
  legal: {
    id: 'usr-legal-02',
    name: 'Sarah Vance',
    title: 'Head of Legal & Compliance',
    email: 'sarah.vance@razorpay.com',
    role: 'legal',
    department: 'Legal & Intellectual Property',
    avatar: 'SV',
    permissions: ['REVIEW_AFFIDAVITS', 'APPROVE_TAKEDOWNS', 'DISPATCH_API', 'EXPORT_EVIDENCE']
  },
  support: {
    id: 'usr-support-03',
    name: 'Marcus Brooks',
    title: 'Customer Trust & Brand Ops',
    email: 'marcus.brooks@razorpay.com',
    role: 'support',
    department: 'Frontline Customer Operations',
    avatar: 'MB',
    permissions: ['VERIFY_HANDLES', 'LOOKUP_APPS', 'READ_BRAND_REGISTRY']
  },
  ciso: {
    id: 'usr-ciso-04',
    name: 'Elena Rostova',
    title: 'Chief Information Security Officer (CISO)',
    email: 'elena.rostova@razorpay.com',
    role: 'ciso',
    department: 'Executive Security Leadership',
    avatar: 'ER',
    permissions: ['ALL_PERMISSIONS', 'MANAGE_USERS', 'SET_THRESHOLDS', 'SOC2_AUDIT_EXPORT', 'BILLING']
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Check local storage or default to null (unauthenticated)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aegis_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeBrandId, setActiveBrandId] = useState('razorpay');

  // Simulated organization pending access requests
  const [accessRequests, setAccessRequests] = useState([
    {
      id: 'req-101',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@razorpay.com',
      department: 'Fraud Investigations',
      requestedRole: 'analyst',
      submittedAt: '10 minutes ago',
      status: 'PENDING_APPROVAL'
    },
    {
      id: 'req-102',
      name: 'Priya Patel',
      email: 'priya.patel@razorpay.com',
      department: 'Customer Escalations',
      requestedRole: 'support',
      submittedAt: '45 minutes ago',
      status: 'PENDING_APPROVAL'
    }
  ]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('aegis_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aegis_auth_user');
    }
  }, [user]);

  // Standard corporate login
  const login = (email, password) => {
    const normalized = email.trim().toLowerCase();
    
    // Check against demo accounts
    const matchedRole = Object.values(DEMO_PERSONAS).find(p => p.email.toLowerCase() === normalized);
    if (matchedRole) {
      setUser(matchedRole);
      return { success: true, user: matchedRole };
    }

    // Default corporate tenant login fallback
    if (
      normalized.endsWith('@razorpay.com') || 
      normalized.endsWith('@phonepe.com') || 
      normalized.endsWith('@revolut.com') ||
      normalized.endsWith('@quickpay.com')
    ) {
      const newUser = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        title: 'Security Operator',
        email: normalized,
        role: 'analyst',
        department: 'Security Operations',
        avatar: 'SO',
        permissions: ['READ_THREATS', 'TRIAGE_EVIDENCE']
      };
      setUser(newUser);
      return { success: true, user: newUser };
    }

    return { success: false, message: 'Please use an approved corporate email (e.g., @razorpay.com, @phonepe.com, @revolut.com)' };
  };

  // Instant 1-click persona quick-switch for presentations/evaluations
  const loginAsRole = (roleKey) => {
    if (DEMO_PERSONAS[roleKey]) {
      setUser(DEMO_PERSONAS[roleKey]);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  // Submit a new employee workspace access request
  const submitAccessRequest = (requestData) => {
    const newReq = {
      id: `req-${Date.now()}`,
      ...requestData,
      submittedAt: 'Just now',
      status: 'PENDING_APPROVAL'
    };
    setAccessRequests(prev => [newReq, ...prev]);
    return { success: true, request: newReq };
  };

  // CISO action: approve a pending request
  const approveAccessRequest = (requestId, assignedRole = 'analyst') => {
    setAccessRequests(prev => prev.filter(r => r.id !== requestId));
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginAsRole,
      logout,
      activeBrandId,
      setActiveBrandId,
      accessRequests,
      submitAccessRequest,
      approveAccessRequest,
      demoPersonas: DEMO_PERSONAS
    }}>
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
