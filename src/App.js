import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('nova_theme');
    return saved ? JSON.parse(saved) : true;
  });

  const toggleTheme = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    localStorage.setItem('nova_theme', JSON.stringify(newVal));
  };

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  if (!user) {
    return authMode === 'login'
      ? <Login onSwitch={() => setAuthMode('register')} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      : <Register onSwitch={() => setAuthMode('login')} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
  }

  return <Dashboard isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
}
