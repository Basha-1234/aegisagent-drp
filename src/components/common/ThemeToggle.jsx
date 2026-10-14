import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
        isDark
          ? 'bg-slate-950/80 border-blue-500/30 text-amber-300 hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
          : 'bg-white border-slate-300 text-blue-600 hover:border-blue-500 hover:shadow-md'
      } ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
      aria-label="Toggle Theme"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-blue-600 animate-in spin-in-90 duration-300" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-mono font-bold">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
