export const getTheme = (isDarkMode) => ({
    bg: isDarkMode
        ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0F19] to-slate-950 text-slate-100'
        : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/50 via-slate-50 to-indigo-100/50 text-slate-800',
    glass: isDarkMode
        ? 'bg-slate-900/60 backdrop-blur-xl border-white/5 shadow-2xl'
        : 'bg-white/60 backdrop-blur-xl border-white/40 shadow-xl shadow-indigo-100/20',
    panel: isDarkMode
        ? 'bg-slate-900/80 backdrop-blur-2xl border-r border-white/5'
        : 'bg-white/70 backdrop-blur-2xl border-r border-white/40',
    textMain: isDarkMode ? 'text-white' : 'text-slate-800',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    accentVar: isDarkMode ? 'text-indigo-300' : 'text-indigo-600',
    input: isDarkMode
        ? 'bg-slate-800/50 border-white/5 text-white focus:border-indigo-400/50 rounded-2xl'
        : 'bg-white/50 border-white/60 text-slate-800 focus:border-indigo-300 focus:bg-white/80 rounded-2xl shadow-sm',
    buttonPrimary: isDarkMode
        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/20 hover:from-indigo-500 hover:to-violet-500 rounded-xl'
        : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-200/40 hover:from-indigo-600 hover:to-violet-600 rounded-xl',
    modal: isDarkMode
        ? 'bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl'
        : 'bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl'
});
