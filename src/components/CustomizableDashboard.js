import React from 'react';
import { useBudget, BUDGET_ACTIONS } from '../contexts/BudgetContext';
import ExpenseSummary from './ExpenseSummary';
import ExpenseCharts from './ExpenseCharts';
import AIPredictions from './AIPredictions';
import FinancialGoals from './FinancialGoals';

const CustomizableDashboard = ({ translations, currentLanguage, isDarkMode }) => {
  const { state, dispatch } = useBudget();
  const { income, expenses, sharedExpenses, savedBudgets } = state;

  // Calculate totals with validation
  const totalExpenses = Object.entries(expenses).reduce((total, [key, value]) => {
    const isShared = sharedExpenses[key];
    const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    
    if (key === 'apl') {
      const aplReduction = isShared ? numValue / 2 : numValue;
      return total - aplReduction;
    }
    const adjustedValue = isShared ? numValue / 2 : numValue;
    return total + adjustedValue;
  }, 0);
  
  const balance = (typeof income === 'number' && !isNaN(income) ? income : 0) - totalExpenses;

  // Calcul du total annuel sur tous les budgets sauvegardés
  const annualTotals = React.useMemo(() => {
    if (!savedBudgets || savedBudgets.length === 0) return null;
    let totalIncome = 0, totalExpenses = 0, totalBalance = 0;
    savedBudgets.forEach(budget => {
      totalIncome += typeof budget.income === 'number' && !isNaN(budget.income) ? budget.income : 0;
      totalExpenses += typeof budget.totalExpenses === 'number' && !isNaN(budget.totalExpenses) ? budget.totalExpenses : 0;
      totalBalance += typeof budget.balance === 'number' && !isNaN(budget.balance) ? budget.balance : 0;
    });
    return { totalIncome, totalExpenses, totalBalance };
  }, [savedBudgets]);

  // Fixed widget configuration
  const widgets = [
    {
      id: 'summary',
      title: translations[currentLanguage].expenseSummary || 'Expense Summary',
      type: 'summary',
      size: 'medium'
    },
    {
      id: 'charts',
      title: translations[currentLanguage].expenseCharts || 'Expense Charts',
      type: 'charts',
      size: 'large'
    },
    {
      id: 'ai-predictions',
      title: translations[currentLanguage].aiPredictions || 'AI Predictions',
      type: 'ai-predictions',
      size: 'large'
    },
    {
      id: 'goals',
      title: translations[currentLanguage].financialGoals || 'Financial Goals',
      type: 'goals',
      size: 'medium'
    },

  ];

  // Render widget content
  const renderWidgetContent = (widget) => {
    const commonProps = {
      translations,
      currentLanguage,
      isDarkMode
    };

    switch (widget.type) {
      case 'summary':
        return (
          annualTotals && (
            <ExpenseSummary
              totalExpenses={annualTotals.totalExpenses}
              balance={annualTotals.totalBalance}
              income={annualTotals.totalIncome}
              translations={translations}
              currentLanguage={currentLanguage}
            />
          )
        );
      case 'charts':
        return (
          <ExpenseCharts 
            expenses={expenses}
            balance={balance}
            {...commonProps}
          />
        );
      case 'ai-predictions':
        return <AIPredictions {...commonProps} />;
      case 'goals':
        return <FinancialGoalsAnnual translations={translations} currentLanguage={currentLanguage} savedBudgets={savedBudgets} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  // Get widget size classes
  const getWidgetSizeClass = (size) => {
    switch (size) {
      case 'small': return 'widget-small';
      case 'medium': return 'widget-medium';
      case 'large': return 'widget-large';
      default: return 'widget-medium';
    }
  };

  // Composant Objectifs Financiers annuels
  const FinancialGoalsAnnual = ({ translations, currentLanguage, savedBudgets }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    // Objectifs annuels (somme des objectifs mensuels)
    const goals = savedBudgets.reduce((acc, b) => {
      if (b.financialGoals) {
        acc.savings += b.financialGoals.monthlySavings || 0;
        acc.leisure += b.financialGoals.maxLeisureSpending || 0;
        acc.emergency += b.financialGoals.emergencyFundTarget || 0;
      }
      return acc;
    }, { savings: 0, leisure: 0, emergency: 0 });
    // Valeurs éditables
    const [editGoals, setEditGoals] = React.useState(goals);
    // Somme annuelle réelle
    const totalSavings = savedBudgets.reduce((sum, b) => sum + (b.expenses?.savings || 0), 0);
    const totalLeisure = savedBudgets.reduce((sum, b) => sum + (b.expenses?.leisure || 0), 0);
    const totalEmergency = savedBudgets.reduce((sum, b) => sum + (b.expenses?.unforeseen || 0), 0);
    // Progressions
    const savingsNum = parseFloat(String(editGoals.savings).replace(',', '.'));
    const leisureNum = parseFloat(String(editGoals.leisure).replace(',', '.'));
    const emergencyNum = parseFloat(String(editGoals.emergency).replace(',', '.'));
    const savingsProgress = !isNaN(savingsNum) && savingsNum > 0 ? Math.min((totalSavings / savingsNum) * 100, 100) : 0;
    const leisureProgress = !isNaN(leisureNum) && leisureNum > 0 ? Math.min((totalLeisure / leisureNum) * 100, 100) : 0;
    const emergencyProgress = !isNaN(emergencyNum) && emergencyNum > 0 ? Math.min((totalEmergency / emergencyNum) * 100, 100) : 0;
    // Handler save (conversion en nombre à l'enregistrement)
    const handleSave = () => {
      const savingsNum = parseFloat(String(editGoals.savings).replace(',', '.'));
      const leisureNum = parseFloat(String(editGoals.leisure).replace(',', '.'));
      const emergencyNum = parseFloat(String(editGoals.emergency).replace(',', '.'));
      if (isNaN(savingsNum) && isNaN(leisureNum) && isNaN(emergencyNum)) {
        setIsEditing(false);
        return;
      }
      savedBudgets.forEach(budget => {
        if (budget.financialGoals) {
          const nb = { ...budget, financialGoals: { ...budget.financialGoals } };
          nb.financialGoals.monthlySavings = !isNaN(savingsNum) ? (savingsNum / savedBudgets.length) : budget.financialGoals.monthlySavings;
          nb.financialGoals.maxLeisureSpending = !isNaN(leisureNum) ? (leisureNum / savedBudgets.length) : budget.financialGoals.maxLeisureSpending;
          nb.financialGoals.emergencyFundTarget = !isNaN(emergencyNum) ? (emergencyNum / savedBudgets.length) : budget.financialGoals.emergencyFundTarget;
          dispatch({ type: BUDGET_ACTIONS.SAVE_BUDGET, payload: nb });
        }
      });
      setIsEditing(false);
    };
    return (
      <div className="card">
        <h3>{translations[currentLanguage].financialGoals || 'Objectifs Financiers'} (Annuel)</h3>
        {isEditing ? (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 12 }}>
              <div>
                <label>Épargne annuelle</label>
                <input type="text" value={editGoals.savings} onChange={e => {
                  setEditGoals(g => ({ ...g, savings: e.target.value }));
                }} style={{ width: 120, marginLeft: 8 }} />
              </div>
              <div>
                <label>Loisirs annuels</label>
                <input type="text" value={editGoals.leisure} onChange={e => {
                  setEditGoals(g => ({ ...g, leisure: e.target.value }));
                }} style={{ width: 120, marginLeft: 8 }} />
              </div>
              <div>
                <label>Fonds d'urgence annuel</label>
                <input type="text" value={editGoals.emergency} onChange={e => {
                  setEditGoals(g => ({ ...g, emergency: e.target.value }));
                }} style={{ width: 120, marginLeft: 8 }} />
              </div>
            </div>
            <button onClick={handleSave} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.5rem', fontWeight: 600, cursor: 'pointer', marginRight: 8 }}>Enregistrer</button>
            <button onClick={() => { setIsEditing(false); setEditGoals(goals); }} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 4, padding: '0.5rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, padding: '0.4rem 1.2rem', fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}>Modifier les objectifs annuels</button>
        )}
        <div className="summary-grid">
          <div className="summary-card savings">
            <div className="amount">€{totalSavings.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} / €{editGoals.savings}</div>
            <div className="label">{translations[currentLanguage].monthlySavings || 'Épargne annuelle'}</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${savingsProgress}%` }}></div></div>
          </div>
          <div className="summary-card leisure">
            <div className="amount">€{totalLeisure.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} / €{editGoals.leisure}</div>
            <div className="label">{translations[currentLanguage].maxLeisureSpending || 'Loisirs annuels'}</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${leisureProgress}%` }}></div></div>
          </div>
          <div className="summary-card emergency">
            <div className="amount">€{totalEmergency.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} / €{editGoals.emergency}</div>
            <div className="label">{translations[currentLanguage].emergencyFundTarget || 'Fonds d\'urgence annuel'}</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${emergencyProgress}%` }}></div></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="customizable-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h2>📊 {translations[currentLanguage].customizableDashboard || 'Customizable Dashboard'}</h2>
        <p>{translations[currentLanguage].dashboardDescription || 'Your personalized financial overview'}</p>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {widgets.map(widget => (
          <div
            key={widget.id}
            className={`dashboard-widget ${getWidgetSizeClass(widget.size)}`}
          >
            <div className="widget-header">
              <h3>{widget.title}</h3>
            </div>
            <div className="widget-content">
              {renderWidgetContent(widget)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomizableDashboard; 