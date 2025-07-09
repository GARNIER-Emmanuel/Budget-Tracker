import React, { useState, useEffect } from 'react';
import Widget from './Widget';
import './Dashboard.css';
import { translations } from '../translations';
import { useBudget, BUDGET_ACTIONS } from '../contexts/BudgetContext';
import { FaCalendarAlt, FaChevronDown } from 'react-icons/fa';

const DEFAULT_WIDGETS = [
  { type: 'summary', visible: true },
  { type: 'balance', visible: true },
  { type: 'goals', visible: true },
  { type: 'charts', visible: true },
  { type: 'ai', visible: true },
  { type: 'budgetList', visible: true },
  { type: 'recentTransactions', visible: true },
  { type: 'tips', visible: true },
];

const WIDGET_LABELS = (t) => ({
  summary: t.summary || 'Résumé rapide',
  balance: t.balance || 'Solde',
  goals: t.goals || 'Objectifs',
  charts: t.charts || 'Graphiques',
  ai: t.ai || 'Prédictions IA',
  budgetList: t.budgetList || 'Budgets précédents',
  recentTransactions: t.recentTransactions || 'Transactions récentes',
  tips: t.tips || 'Astuces & Conseils',
});

const LOCAL_KEY = 'dashboard_widgets_v1';

const CustomizableDashboard = () => {
  const { state, dispatch } = useBudget();
  const currentLanguage = state?.currentLanguage || 'fr';
  const t = translations[currentLanguage] || {};
  const widgetLabels = WIDGET_LABELS(t);

  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(widgets));
  }, [widgets]);

  const [draggedIdx, setDraggedIdx] = useState(null);
  const handleDragStart = idx => setDraggedIdx(idx);
  const handleDragOver = idx => {
    if (draggedIdx === null || draggedIdx === idx) return;
    const newWidgets = [...widgets];
    const [dragged] = newWidgets.splice(draggedIdx, 1);
    newWidgets.splice(idx, 0, dragged);
    setWidgets(newWidgets);
    setDraggedIdx(idx);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  const toggleWidget = idx => {
    setWidgets(widgets => widgets.map((w, i) => i === idx ? { ...w, visible: !w.visible } : w));
  };

  // Month selector logic
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonthName, setSelectedMonthName] = useState(new Date().toLocaleString('en-US', { month: 'long' }));
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  // Available months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years (current year ± 5 years)
  const generateYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;
    const endYear = currentYear + 5;
    
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    
    return years;
  };

  const years = generateYears();

  // Handle month change
  const handleMonthChange = (month) => {
    setSelectedMonthName(month);
    const monthKey = `${month} ${selectedYear}`;
    dispatch({ type: BUDGET_ACTIONS.SET_SELECTED_MONTH, payload: monthKey });
    setShowMonthSelector(false);
  };

  // Handle year change
  const handleYearChange = (year) => {
    setSelectedYear(parseInt(year));
    const monthKey = `${selectedMonthName} ${year}`;
    dispatch({ type: BUDGET_ACTIONS.SET_SELECTED_MONTH, payload: monthKey });
  };

  // Check if selected month has data
  const hasDataForSelectedMonth = () => {
    const monthKey = `${selectedMonthName} ${selectedYear}`;
    return state.savedBudgets.some(budget => budget.name === monthKey);
  };

  // Get saved months for quick access
  const getSavedMonths = () => {
    const savedMonths = new Set();
    
    // Add current month
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    savedMonths.add(`${currentMonth} ${currentYear}`);
    
    // Add months from saved budgets
    state.savedBudgets.forEach(budget => {
      savedMonths.add(budget.name);
    });
    
    return Array.from(savedMonths).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB - dateA; // Most recent first
    });
  };

  const savedMonths = getSavedMonths();

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <h1 className="page-title">{t.dashboardTitle || 'My Dashboard'}</h1>
          
          {/* Month selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMonthSelector(!showMonthSelector)}
                className="btn btn-secondary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-2)',
                  minWidth: '200px',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                  <FaCalendarAlt />
                  <span>{selectedMonthName} {selectedYear}</span>
                </div>
                <FaChevronDown style={{ 
                  transform: showMonthSelector ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} />
              </button>
              
              {showMonthSelector && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: 'var(--spacing-4)',
                  minWidth: '280px',
                  zIndex: 1000,
                  marginTop: 'var(--spacing-2)'
                }}>
                  {/* Year selector */}
                  <div style={{ marginBottom: 'var(--spacing-3)' }}>
                    <label style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      fontWeight: 600, 
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--spacing-2)',
                      display: 'block'
                    }}>
                      {t.selectYear || 'Select Year'}
                    </label>
                    <select
                      className="form-select"
                      value={selectedYear}
                      onChange={(e) => handleYearChange(e.target.value)}
                    >
                      {years.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Quick access to saved months */}
                  {savedMonths.length > 0 && (
                    <div style={{ marginBottom: 'var(--spacing-3)' }}>
                      <label style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        fontWeight: 600, 
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--spacing-2)',
                        display: 'block'
                      }}>
                        {t.quickAccess || 'Quick Access'}
                      </label>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                        gap: 'var(--spacing-2)' 
                      }}>
                        {savedMonths.slice(0, 6).map(monthKey => (
                          <button
                            key={monthKey}
                            className="btn btn-sm"
                            style={{ 
                              fontSize: 'var(--font-size-xs)',
                              padding: 'var(--spacing-1) var(--spacing-2)'
                            }}
                            onClick={() => {
                              const [month, year] = monthKey.split(' ');
                              setSelectedMonthName(month);
                              setSelectedYear(parseInt(year));
                              dispatch({ type: BUDGET_ACTIONS.SET_SELECTED_MONTH, payload: monthKey });
                              setShowMonthSelector(false);
                            }}
                          >
                            {monthKey}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* All months grid */}
                  <div>
                    <label style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      fontWeight: 600, 
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--spacing-2)',
                      display: 'block'
                    }}>
                      {t.allMonths || 'All Months'}
                    </label>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gap: 'var(--spacing-1)' 
                    }}>
                      {months.map(month => (
                        <button
                          key={month}
                          className="btn btn-sm"
                          style={{ 
                            fontSize: 'var(--font-size-xs)',
                            padding: 'var(--spacing-1) var(--spacing-2)',
                            background: month === selectedMonthName ? 'var(--primary-color)' : 'var(--bg-secondary)',
                            color: month === selectedMonthName ? 'var(--text-inverse)' : 'var(--text-primary)'
                          }}
                          onClick={() => handleMonthChange(month)}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="dashboard-actions">
              <button 
                onClick={() => setWidgets(DEFAULT_WIDGETS)} 
                tabIndex={0} 
                aria-label={t.resetDashboard || 'Réinitialiser la disposition du dashboard'} 
                className="btn btn-primary"
              >
                {t.resetDashboard || 'Réinitialiser'}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <section className="dashboard-widgets">
        {widgets.map((w, idx) => w.visible && (
          <div
            key={w.type}
            className={`widget-draggable ${draggedIdx === idx ? 'dragging' : ''}`}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => { e.preventDefault(); handleDragOver(idx); }}
            onDragEnd={handleDragEnd}
          >
            <button
              aria-label={w.visible ? `${t.hideWidget || 'Hide widget'} ${widgetLabels[w.type]}` : `${t.showWidget || 'Show widget'} ${widgetLabels[w.type]}`}
              tabIndex={0}
              onClick={() => toggleWidget(idx)}
              className="widget-toggle-btn"
            >
              {w.visible ? '×' : '+'}
            </button>
            <Widget type={w.type} />
          </div>
        ))}
      </section>
      
      <section className="dashboard-custom">
        <h2 className="heading-2">{t.addWidgets || 'Add/Show Widgets'}</h2>
        <div className="custom-widgets-grid">
          {widgets.map((w, idx) => !w.visible && (
            <button 
              key={w.type} 
              tabIndex={0} 
              aria-label={`${t.showWidget || 'Show widget'} ${widgetLabels[w.type]}`} 
              onClick={() => toggleWidget(idx)} 
              className="btn btn-secondary widget-add-btn"
            >
              {widgetLabels[w.type]}
            </button>
        ))}
      </div>
      </section>
    </div>
  );
};

export default CustomizableDashboard; 