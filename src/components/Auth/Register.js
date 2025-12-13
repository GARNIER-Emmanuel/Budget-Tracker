import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, UserPlus } from 'lucide-react';
import { getTheme } from '../../constants/theme';

export default function Register({ onSwitch, isDarkMode, toggleTheme }) {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const theme = getTheme(isDarkMode);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Les mots de passe ne correspondent pas');
        }
        setLoading(true);
        setError('');
        try {
            await register(email, password);
        } catch (err) {
            setError(err.message || "Échec de l'inscription");
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
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                        <UserPlus size={24} />
                    </div>
                </div>
                <h2 className={`text-3xl font-bold text-center mb-2 ${theme.textMain}`}>Créer un compte</h2>
                <p className={`text-center mb-8 ${theme.textMuted}`}>Rejoignez NovaBudget gratuitement</p>

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
                            className={`w-full p-4 outline-none transition-colors border ${theme.input} focus:border-purple-500`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            className={`w-full p-4 outline-none transition-colors border ${theme.input} focus:border-purple-500`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Confirmer le mot de passe"
                            className={`w-full p-4 outline-none transition-colors border ${theme.input} focus:border-purple-500`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 font-semibold transition-all flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-600/25`}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "S'inscrire"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className={theme.textMuted}>
                        Déjà un compte ?{' '}
                        <button onClick={onSwitch} className="text-purple-500 hover:text-purple-400 font-medium transition-colors">
                            Se connecter
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
