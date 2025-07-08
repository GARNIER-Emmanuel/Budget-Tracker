import React, { useState, useEffect } from 'react';
import Widget from './Widget';
import './Dashboard.css';
import { translations } from '../translations';
import { useBudget } from '../contexts/BudgetContext';

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
  const { state } = useBudget();
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

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <h1>{t.dashboardTitle || 'Mon tableau de bord'}</h1>
        <div className="dashboard-actions">
          <button onClick={() => setWidgets(DEFAULT_WIDGETS)} tabIndex={0} aria-label={t.resetDashboard || 'Réinitialiser la disposition du dashboard'}>
            {t.resetDashboard || 'Réinitialiser'}
          </button>
      </div>
      </header>
      <section className="dashboard-widgets">
        {widgets.map((w, idx) => w.visible && (
          <div
            key={w.type}
            className="widget-draggable"
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => { e.preventDefault(); handleDragOver(idx); }}
            onDragEnd={handleDragEnd}
            style={{ opacity: draggedIdx === idx ? 0.5 : 1, position: 'relative' }}
          >
            <button
              aria-label={w.visible ? `${t.hideWidget || 'Masquer le widget'} ${widgetLabels[w.type]}` : `${t.showWidget || 'Afficher le widget'} ${widgetLabels[w.type]}`}
              tabIndex={0}
              onClick={() => toggleWidget(idx)}
              style={{ position: 'absolute', top: 8, right: 8, background: '#f1f5f9', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer', zIndex: 2 }}
            >
              {w.visible ? '×' : '+'}
            </button>
            <Widget type={w.type} />
          </div>
        ))}
      </section>
      <section className="dashboard-custom">
        <h2>{t.addWidgets || 'Ajouter/afficher des widgets'}</h2>
        <div className="custom-widgets-grid">
          {widgets.map((w, idx) => !w.visible && (
            <button key={w.type} tabIndex={0} aria-label={`${t.showWidget || 'Afficher le widget'} ${widgetLabels[w.type]}`} onClick={() => toggleWidget(idx)} style={{ margin: 8, padding: '0.7rem 1.2rem', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
              {widgetLabels[w.type]}
            </button>
        ))}
      </div>
      </section>
    </div>
  );
};

export default CustomizableDashboard; 