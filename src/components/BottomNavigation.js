import React, { useState } from 'react';
import { LayoutDashboard, Activity, Target, PieChart, Plus, Menu, X, Calendar, Repeat, Settings, ChevronRight, LogOut, Sun, Moon } from 'lucide-react';

const BottomNavigation = ({ activeTab, setActiveTab, resetModal, isDarkMode, setIsDarkMode, logout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const mainNavItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Accueil' },
        { id: 'transactions', icon: Activity, label: 'Activité' },
        { id: 'add', icon: Plus, label: 'Ajouter', isAction: true },
        { id: 'analysis', icon: PieChart, label: 'Analyses' },
        { id: 'more', icon: Menu, label: 'Menu', isMenuTrigger: true },
    ];

    const menuItems = [
        { id: 'calendar', icon: Calendar, label: 'Calendrier', desc: 'Vue mensuelle' },
        { id: 'goals', icon: Target, label: 'Objectifs', desc: 'Épargne & Projets' },
        { id: 'subscriptions', icon: Repeat, label: 'Abonnements', desc: 'Gestion récurrente' },
        { id: 'settings', icon: Settings, label: 'Paramètres', desc: 'Préférences & Data' },
    ];

    const handleTabClick = (id) => {
        setActiveTab(id);
        setIsMenuOpen(false);
    };

    return (
        <>
            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden flex flex-col justify-end animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                    <div className={`relative z-10 w-full rounded-t-[2rem] p-6 pb-28 shadow-2xl transition-transform duration-300 transform translate-y-0 ${isDarkMode ? 'bg-slate-900 border-t border-slate-700' : 'bg-white border-t border-gray-100'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Menu</h3>
                            <button onClick={() => setIsMenuOpen(false)} className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabClick(item.id)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive
                                            ? (isDarkMode ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100')
                                            : (isDarkMode ? 'bg-slate-800/50 text-slate-300 border border-transparent' : 'bg-gray-50 text-gray-700 border border-transparent')
                                            }`}
                                    >
                                        <div className={`p-3 rounded-xl ${isActive ? 'bg-blue-500/20' : (isDarkMode ? 'bg-slate-700' : 'bg-white shadow-sm')}`}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-bold text-sm">{item.label}</p>
                                            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>{item.desc}</p>
                                        </div>
                                        <ChevronRight size={16} className="opacity-30" />
                                    </button>
                                )
                            })}
                        </div>

                        <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'} space-y-3`}>
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-700 shadow-sm'}`}
                            >
                                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-bold text-sm">{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Changer l'apparence</p>
                                </div>
                            </button>

                            <button
                                onClick={logout}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${isDarkMode ? 'bg-rose-900/20 text-rose-400' : 'bg-rose-50 text-rose-600'}`}
                            >
                                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-rose-900/20' : 'bg-white shadow-sm'}`}>
                                    <LogOut size={20} />
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-bold text-sm">Déconnexion</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-rose-400/70' : 'text-rose-400'}`}>Fermer la session</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Bottom Bar */}
            <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none`}>
                <nav className={`pointer-events-auto mx-auto max-w-sm rounded-[2rem] shadow-2xl backdrop-blur-xl border border-white/10 ${isDarkMode
                    ? 'bg-slate-900/90 text-slate-400'
                    : 'bg-white/90 text-gray-500'
                    } flex items-center justify-between px-2 py-2`}>

                    {mainNavItems.map((item) => {
                        const isActive = activeTab === item.id || (item.isMenuTrigger && isMenuOpen);
                        const Icon = item.icon;

                        if (item.isAction) {
                            return (
                                <button
                                    key={item.id}
                                    onClick={resetModal}
                                    className={`relative -top-5 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transform transition-transform active:scale-95 ${isDarkMode
                                        ? 'bg-blue-600 text-white shadow-blue-900/50'
                                        : 'bg-blue-600 text-white shadow-blue-200'
                                        }`}
                                >
                                    <Icon size={24} strokeWidth={2.5} />
                                </button>
                            );
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={() => item.isMenuTrigger ? setIsMenuOpen(!isMenuOpen) : handleTabClick(item.id)}
                                className={`relative flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all duration-300 ${isActive
                                    ? (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                                    : 'hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <div className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                                    <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                {isActive && !item.isMenuTrigger && (
                                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-current animate-fade-in" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </>
    );
};

export default BottomNavigation;
