import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/apiClient';

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

export function formatUserFromBackend(userRecord, isDemo = false) {
  const initials = userRecord.full_name
    ? userRecord.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AG';

  const roleTitle = userRecord.role === 'admin'
    ? 'Security Administrator'
    : userRecord.role === 'ciso'
      ? 'Chief Information Security Officer'
      : userRecord.role === 'legal'
        ? 'Head of Legal & Compliance'
        : 'Senior Threat Analyst';

  const permissions = userRecord.role === 'admin' || userRecord.role === 'ciso'
    ? ['ALL_PERMISSIONS', 'MANAGE_USERS', 'SET_THRESHOLDS', 'SOC2_AUDIT_EXPORT', 'BILLING']
    : userRecord.role === 'legal'
      ? ['REVIEW_AFFIDAVITS', 'APPROVE_TAKEDOWNS', 'DISPATCH_API', 'EXPORT_EVIDENCE']
      : ['READ_THREATS', 'TRIAGE_EVIDENCE', 'AUDIT_DIFF', 'CLUSTER_SYNDICATE'];

  return {
    id: userRecord.id,
    name: userRecord.full_name,
    title: roleTitle,
    email: userRecord.email,
    role: userRecord.role,
    department: userRecord.organization ? userRecord.organization.name : 'Corporate Security',
    avatar: initials,
    organizationId: userRecord.organization_id,
    organization: userRecord.organization,
    permissions,
    isDemoSession: isDemo
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeBrandId, setActiveBrandId] = useState('razorpay');

  // Verify stored session on initial mount using authoritative backend GET /api/auth/me
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = api.getAuthToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsAuthLoading(false);
        }
        return;
      }

      try {
        const me = await api.getMe();
        if (isMounted && me && me.id) {
          const backendUser = formatUserFromBackend(me, false);
          setUser(backendUser);
        } else {
          if (isMounted) {
            api.setAuthToken(null);
            setUser(null);
            localStorage.removeItem('aegis_auth_user');
          }
        }
      } catch (err) {
        if (isMounted) {
          api.setAuthToken(null);
          setUser(null);
          localStorage.removeItem('aegis_auth_user');
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }

    initAuth();
    return () => { isMounted = false; };
  }, []);

  // Listen for session expiration events dispatched by apiClient on 401
  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      api.setAuthToken(null);
      localStorage.removeItem('aegis_auth_user');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('aegis:auth_expired', handleAuthExpired);
      return () => window.removeEventListener('aegis:auth_expired', handleAuthExpired);
    }
  }, []);

  // Sync user object to local cache
  useEffect(() => {
    if (user) {
      localStorage.setItem('aegis_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aegis_auth_user');
    }
  }, [user]);

  // Standard corporate login using backend API
  const login = async (email, password) => {
    const normalized = email.trim().toLowerCase();

    try {
      const resp = await api.login(normalized, password);
      if (resp && resp.access_token) {
        api.setAuthToken(resp.access_token);
        const backendUser = formatUserFromBackend(resp.user, false);
        setUser(backendUser);
        return { success: true, user: backendUser };
      }
      return { success: false, message: 'Invalid response from authentication server.' };
    } catch (err) {
      return { success: false, message: err.message || 'Invalid email or password.' };
    }
  };

  // Instant 1-click persona quick-switch for evaluations
  const loginAsRole = async (roleKey) => {
    const persona = DEMO_PERSONAS[roleKey];
    if (!persona) return { success: false, message: 'Unknown role persona.' };

    try {
      // First attempt real API login using seeded demo credentials
      const resp = await api.login(persona.email, 'AegisDemo2026!');
      if (resp && resp.access_token) {
        api.setAuthToken(resp.access_token);
        const backendUser = formatUserFromBackend(resp.user, true);
        setUser(backendUser);
        return { success: true, user: backendUser };
      }
    } catch (err) {
      // Offline fallback: only permitted in non-production local development
      if (!import.meta.env.PROD) {
        const demoUser = {
          ...persona,
          isDemoSession: true
        };
        setUser(demoUser);
        return { success: true, user: demoUser };
      }
      return { success: false, message: 'Demo persona authentication is disabled in production.' };
    }
    return { success: false, message: 'Could not complete demo authentication.' };
  };

  const logout = () => {
    api.setAuthToken(null);
    setUser(null);
    localStorage.removeItem('aegis_auth_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthLoading,
      login,
      loginAsRole,
      logout,
      activeBrandId,
      setActiveBrandId,
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
