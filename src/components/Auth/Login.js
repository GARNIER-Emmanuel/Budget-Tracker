import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Briefcase } from 'lucide-react';
import { getTheme } from '../../constants/theme';
import logo from '../../assets/logo.png';

export default function Login({ onSwitch, isDarkMode, toggleTheme }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const theme = getTheme(isDarkMode);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            setError(err.message || 'Échec de la connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${theme.bg} p-4 font-sans transition-colors duration-300`}>
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className={`absolute top-6 right-6 p-3 rounded-full shadow-lg transition-transform hover:scale-110 ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-700'}`}
                aria-label="Toggle Theme"
            >
                {isDarkMode ? '☀️' : '🌙'}
            </button>

            <div className={`w-full max-w-md ${theme.glass} p-8 rounded-3xl`}>
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Nova Budget" className="w-16 h-16 rounded-2xl shadow-lg shadow-blue-600/20 object-cover" />
                </div>
                <h2 className={`text-3xl font-bold text-center mb-2 ${theme.textMain}`}>Bienvenue</h2>
                <p className={`text-center mb-8 ${theme.textMuted}`}>Connectez-vous pour gérer votre budget</p>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-xl mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            className={`w-full p-4 outline-none transition-colors border ${theme.input}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            className={`w-full p-4 outline-none transition-colors border ${theme.input} `}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 font-semibold transition-all flex items-center justify-center ${theme.buttonPrimary}`}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Se connecter'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className={theme.textMuted}>
                        Pas encore de compte ?{' '}
                        <button onClick={onSwitch} className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
                            Créer un compte
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
