import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

const CalendarView = ({ transactions, theme, isDarkMode }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        // 0 = Sunday, 1 = Monday, etc.
        // Adjust to make Monday = 0, Sunday = 6 for European calendar
        let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    // Helper to format currency
    const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

    return (
        <div className={`rounded-3xl border ${theme.glass} p-4 animate-fade-in`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${theme.textMain}`}>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className={`p-1.5 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                        <ChevronLeft size={18} className={theme.textMain} />
                    </button>
                    <button onClick={nextMonth} className={`p-1.5 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                        <ChevronRight size={18} className={theme.textMain} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map(day => (
                    <div key={day} className={`text-center text-xs font-medium ${theme.textMuted}`}>
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 lg:gap-2">
                {[...Array(firstDay)].map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[80px] lg:min-h-[100px]"></div>
                ))}

                {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                    const dayTransactions = transactions.filter(t => t.date === dateStr);
                    const dailyExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
                    const dailyIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
                    const hasTransactions = dayTransactions.length > 0;

                    // Check if today
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                    return (
                        <div
                            key={day}
                            className={`min-h-[80px] lg:min-h-[100px] rounded-xl border p-1.5 flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer
                ${isToday ? (isDarkMode ? 'bg-blue-600/20 border-blue-500' : 'bg-blue-50 border-blue-500') :
                                    (isDarkMode ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800' : 'bg-white/60 border-gray-200 hover:bg-white')}
              `}
                            onClick={() => {
                                if (hasTransactions) {
                                    // Simple alert or log for now, could open modal later
                                    // alert(`Transactions du ${dateStr}:\n${dayTransactions.map(t => `- ${t.title}: ${formatCurrency(t.amount)}`).join('\n')}`);
                                }
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`text-xs font-medium ${isToday ? 'text-blue-500' : theme.textMain}`}>{day}</span>
                                {hasTransactions && (
                                    <div className="flex gap-0.5">
                                        {dailyIncome > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                                        {dailyExpense > 0 && <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>}
                                    </div>
                                )}
                            </div>

                            {hasTransactions && (
                                <div className="text-[10px]">
                                    {dailyIncome > 0 && (
                                        <div className="text-emerald-500 font-medium truncate">+{Math.round(dailyIncome)}</div>
                                    )}
                                    {dailyExpense > 0 && (
                                        <div className="text-rose-500 font-medium truncate">-{Math.round(dailyExpense)}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
