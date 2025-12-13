import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Briefcase } from 'lucide-react';

export default function Login({ onSwitch }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 font-sans">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <Briefcase size={24} />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-center text-white mb-2">Bienvenue</h2>
                <p className="text-blue-200 text-center mb-8">Connectez-vous pour gérer votre budget</p>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl p-4 outline-none focus:border-blue-500 transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl p-4 outline-none focus:border-blue-500 transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Se connecter'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400">
                        Pas encore de compte ?{' '}
                        <button onClick={onSwitch} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Créer un compte
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
