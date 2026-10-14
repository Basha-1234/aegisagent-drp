import React from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import AppHeader from './components/common/AppHeader';
import AnalystDashboard from './pages/AnalystDashboard';
import LegalDashboard from './pages/LegalDashboard';
import SupportDashboard from './pages/SupportDashboard';
import ExecutiveDashboard from './pages/ExecutiveDashboard';

function MainRouter() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  // If unauthenticated, show the confirmed 3D Emerald Auth Gateway
  if (!user) {
    return <AuthPage />;
  }

  // Render role-specific dashboard based on authenticated user's role
  const renderDashboard = () => {
    switch (user.role) {
      case 'legal':
        return <LegalDashboard />;
      case 'support':
        return <SupportDashboard />;
      case 'ciso':
        return <ExecutiveDashboard />;
      case 'analyst':
      default:
        return <AnalystDashboard />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#040914] text-slate-100' : 'bg-[#f1f5f9] text-slate-900'
    }`}>
      <AppHeader />
      <main className="flex-1">
        {renderDashboard()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}
