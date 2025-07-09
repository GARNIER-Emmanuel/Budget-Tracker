import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const widgetLabels = {
  summary: 'Résumé rapide',
  balance: 'Solde',
  goals: 'Objectifs',
  charts: 'Graphiques',
  ai: 'Prédictions IA',
  budgetList: 'Budgets précédents',
  recentTransactions: 'Transactions récentes',
  tips: 'Astuces & Conseils',
};

const SummaryWidget = () => {
  const { state } = useBudget();
  const { selectedMonth, savedBudgets } = state;
  
  // Get data for selected month
  const getSelectedMonthData = () => {
    if (selectedMonth) {
      const selectedMonthBudget = savedBudgets.find(budget => budget.name === selectedMonth);
      if (selectedMonthBudget) {
        return {
          income: selectedMonthBudget.income - (selectedMonthBudget.autreArgentRecu || 0),
          autreArgentRecu: selectedMonthBudget.autreArgentRecu || 0,
          expenses: selectedMonthBudget.expenses || {},
          sharedExpenses: selectedMonthBudget.sharedExpenses || {}
        };
      }
    }
    // Fallback to current state data
    return {
      income: state.income,
      autreArgentRecu: state.autreArgentRecu || 0,
      expenses: state.expenses,
      sharedExpenses: state.sharedExpenses
    };
  };

  const monthData = getSelectedMonthData();
  const { income, autreArgentRecu, expenses, sharedExpenses } = monthData;
  
  const totalExpenses = React.useMemo(() => {
    return Object.entries(expenses).reduce((total, [key, value]) => {
      const isShared = sharedExpenses[key];
      if (key === 'apl') {
        const aplReduction = isShared ? value / 2 : value;
        return total - aplReduction;
      }
      const adjustedValue = isShared ? value / 2 : value;
      return total + adjustedValue;
    }, 0);
  }, [expenses, sharedExpenses]);
  
  const totalIncome = (Number(income) || 0) + (Number(autreArgentRecu) || 0);
  const balance = totalIncome - totalExpenses;
  
  return (
    <div className="widget-summary">
      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-icon success">💰</div>
          <div className="summary-label success">Solde</div>
          <div className={`summary-value ${balance >= 0 ? 'success' : 'error'}`}>
            €{balance.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-icon primary">⬆️</div>
          <div className="summary-label primary">Revenus</div>
          <div className="summary-value primary">
            €{totalIncome.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-icon error">⬇️</div>
          <div className="summary-label error">Dépenses</div>
          <div className="summary-value error">
            €{totalExpenses.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalsWidget = () => {
  const { state, dispatch } = useBudget();
  const { selectedMonth, savedBudgets, financialGoals = {}, currentLanguage } = state;
  const [editMode, setEditMode] = React.useState(false);
  const [goals, setGoals] = React.useState({
    monthlySavings: financialGoals.monthlySavings || 0,
    maxLeisureSpending: financialGoals.maxLeisureSpending || 0,
    emergencyFundTarget: financialGoals.emergencyFundTarget || 0,
  });

  // Get data for selected month
  const getSelectedMonthData = () => {
    if (selectedMonth) {
      const selectedMonthBudget = savedBudgets.find(budget => budget.name === selectedMonth);
      if (selectedMonthBudget) {
        return selectedMonthBudget.expenses || {};
      }
    }
    // Fallback to current state data
    return state.expenses;
  };

  const monthExpenses = getSelectedMonthData();

  // Valeurs réelles
  const savings = monthExpenses.savings || 0;
  const leisure = monthExpenses.leisure || 0;
  const unforeseen = monthExpenses.unforeseen || 0;

  // Progressions
  const savingsProgress = goals.monthlySavings > 0 ? Math.min((savings / goals.monthlySavings) * 100, 100) : 0;
  const leisureProgress = goals.maxLeisureSpending > 0 ? Math.min((leisure / goals.maxLeisureSpending) * 100, 100) : 0;
  const emergencyProgress = goals.emergencyFundTarget > 0 ? Math.min((unforeseen / goals.emergencyFundTarget) * 100, 100) : 0;

  // Alertes
  const savingsAlert = goals.monthlySavings > 0 && savings < goals.monthlySavings;
  const leisureAlert = goals.maxLeisureSpending > 0 && leisure > goals.maxLeisureSpending;
  const emergencyAlert = goals.emergencyFundTarget > 0 && unforeseen < goals.emergencyFundTarget;

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_FINANCIAL_GOALS',
      payload: {
        monthlySavings: Number(goals.monthlySavings) || 0,
        maxLeisureSpending: Number(goals.maxLeisureSpending) || 0,
        emergencyFundTarget: Number(goals.emergencyFundTarget) || 0,
      },
    });
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    setGoals(financialGoals);
  };

  return (
    <>
      <div className="widget-goals">
        <div className="widget-title">Objectifs financiers du mois</div>
        
        <div className="goal-item">
          <div className="goal-header">
            <span className="goal-label success">Épargne</span>
            <span className="goal-values">
              <span className="current-value">€{savings.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</span>
              <span className="separator">/</span>
              <span className="target-value">€{goals.monthlySavings}</span>
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill success" style={{ width: `${savingsProgress}%` }} />
          </div>
          {savingsAlert && <div className="goal-alert">Objectif d'épargne non atteint</div>}
        </div>
        
        <div className="goal-item">
          <div className="goal-header">
            <span className="goal-label warning">Loisirs</span>
            <span className="goal-values">
              <span className="current-value">€{leisure.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</span>
              <span className="separator">/</span>
              <span className="target-value">€{goals.maxLeisureSpending}</span>
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill warning" style={{ width: `${leisureProgress}%` }} />
          </div>
          {leisureAlert && <div className="goal-alert">Plafond loisirs dépassé</div>}
        </div>
        
        <div className="goal-item">
          <div className="goal-header">
            <span className="goal-label info">Fonds d'urgence</span>
            <span className="goal-values">
              <span className="current-value">€{unforeseen.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</span>
              <span className="separator">/</span>
              <span className="target-value">€{goals.emergencyFundTarget}</span>
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill info" style={{ width: `${emergencyProgress}%` }} />
          </div>
          {emergencyAlert && <div className="goal-alert">Objectif fonds d'urgence non atteint</div>}
        </div>
        
        <button onClick={() => setEditMode(true)} className="btn btn-primary btn-block">
          Modifier les objectifs
        </button>
      </div>
      
      {/* Modal d'édition des objectifs */}
      {editMode && (
        <div className="modal-backdrop">
          <div className="modal goals-modal">
            <button 
              onClick={handleCancel}
              className="modal-close"
            >
              ×
            </button>
            <h3 className="modal-title">Modifier les objectifs</h3>
            
            <div className="form-group">
              <label className="form-label">Épargne visée (€)</label>
              <input
                type="number"
                value={goals.monthlySavings}
                onChange={e => setGoals(g => ({ ...g, monthlySavings: e.target.value }))}
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Plafond loisirs (€)</label>
              <input
                type="number"
                value={goals.maxLeisureSpending}
                onChange={e => setGoals(g => ({ ...g, maxLeisureSpending: e.target.value }))}
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Fonds d'urgence visé (€)</label>
              <input
                type="number"
                value={goals.emergencyFundTarget}
                onChange={e => setGoals(g => ({ ...g, emergencyFundTarget: e.target.value }))}
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="modal-actions">
              <button onClick={handleSave} className="btn btn-primary">
                Sauvegarder
              </button>
              <button onClick={handleCancel} className="btn btn-secondary">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ChartsWidget = () => {
  const { state } = useBudget();
  const { selectedMonth, savedBudgets } = state;
  
  // Get data for selected month
  const getSelectedMonthData = () => {
    if (selectedMonth) {
      const selectedMonthBudget = savedBudgets.find(budget => budget.name === selectedMonth);
      if (selectedMonthBudget) {
        return selectedMonthBudget.expenses || {};
      }
    }
    // Fallback to current state data
    return state.expenses;
  };

  const monthExpenses = getSelectedMonthData();
  
  // Catégories à afficher (hors APL, savings, unforeseen, autreArgentRecu, income)
  const exclude = ['apl', 'savings', 'unforeseen', 'autreArgentRecu', 'income'];
  const filtered = Object.entries(monthExpenses)
    .filter(([key, value]) => !exclude.includes(key) && value > 0);
  const labels = filtered.map(([key]) => key);
  const dataValues = filtered.map(([, value]) => value);
  
  // Couleurs plus intuitives et visibles pour le graphique
  const colors = [
    '#3B82F6', // Bleu
    '#10B981', // Vert
    '#F59E0B', // Orange
    '#EF4444', // Rouge
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Vert lime
    '#F97316', // Orange foncé
    '#EC4899', // Rose
    '#14B8A6', // Teal
    '#F472B6', // Pink
    '#6366F1', // Indigo
    '#22C55E'  // Vert émeraude
  ];
  
  const chartData = {
    labels: labels.length ? labels : ['Aucune dépense'],
    datasets: [
      {
        data: dataValues.length ? dataValues : [1],
        backgroundColor: colors.slice(0, labels.length || 1),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };
  
  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: 'var(--text-primary)',
          font: { size: 11, weight: '500' },
          padding: 8,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        backgroundColor: 'var(--bg-primary)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-primary)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        callbacks: {
          label: function(context) {
            if (!labels.length) return 'Aucune dépense';
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: €${context.parsed.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} (${percentage}%)`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };
  
  return (
    <div className="widget-charts">
      <div className="widget-title">Répartition des dépenses</div>
      <div className="chart-container">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

const RecentTransactionsWidget = () => {
  const { state, dispatch } = useBudget();
  const { expenses, income, autreArgentRecu, selectedMonth, savedBudgets } = state;
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Récupérer le budget du mois sélectionné
  const monthKey = selectedMonth || (() => {
    const currentDate = new Date();
    const month = currentDate.toLocaleString('en-US', { month: 'long' });
    const year = currentDate.getFullYear();
    return `${month} ${year}`;
  })();
  const currentBudget = savedBudgets.find(b => b.name === monthKey);

  // Transactions simulées à partir des dépenses (pour démo)
  let transactions = [];
  if (currentBudget) {
    // Dépenses
    transactions = Object.entries(currentBudget.expenses || {})
      .filter(([key, value]) => value > 0)
      .map(([key, value]) => ({
        type: 'expense',
        category: key,
        amount: value,
        date: new Date().toLocaleDateString(),
        description: `${key} - ${new Date().toLocaleDateString()}`
      }));
    
    // Revenus
    if (currentBudget.income > 0) {
      transactions.push({
        type: 'income',
        category: 'income',
        amount: currentBudget.income,
        date: new Date().toLocaleDateString(),
        description: `Revenus - ${new Date().toLocaleDateString()}`
      });
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setEditValue(transaction.amount.toString());
  };

  const handleSave = () => {
    if (editingTransaction && editValue) {
      const newAmount = parseFloat(editValue);
      if (!isNaN(newAmount)) {
        // Mettre à jour la transaction (simulation)
        console.log('Transaction updated:', { ...editingTransaction, amount: newAmount });
      }
    }
    setEditingTransaction(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingTransaction(null);
    setEditValue('');
  };

  return (
    <div className="widget-transactions">
      <div className="widget-title">Transactions récentes</div>
      
      {transactions.length === 0 ? (
        <div className="empty-state">
          <div className="text-secondary text-sm">Aucune transaction récente</div>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.slice(0, 5).map((transaction, index) => (
            <div key={index} className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-description">
                  {transaction.description}
                </div>
                <div className="transaction-date">
                  {transaction.date}
                </div>
              </div>
              
              <div className="transaction-amount">
                <span className={`amount ${transaction.type === 'income' ? 'positive' : 'negative'}`}>
                  {transaction.type === 'income' ? '+' : '-'}€{transaction.amount.toFixed(2)}
                </span>
                
                {editingTransaction === transaction ? (
                  <div className="edit-controls">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="form-input edit-input"
                    />
                    <button onClick={handleSave} className="btn btn-sm btn-success">✓</button>
                    <button onClick={handleCancel} className="btn btn-sm btn-secondary">✗</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleEdit(transaction)}
                    className="btn btn-sm btn-ghost"
                  >
                    ✏️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PreviousBudgetsWidget = () => {
  const { state } = useBudget();
  const { savedBudgets } = state;
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewBudget = (budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBudget(null);
  };

  return (
    <div className="widget-budgets">
      <div className="widget-title">Budgets précédents</div>
      
      {savedBudgets.length === 0 ? (
        <div className="empty-state">
          <div className="text-secondary text-sm">Aucun budget sauvegardé</div>
        </div>
      ) : (
        <div className="budgets-list">
          {savedBudgets.slice(0, 5).map((budget, index) => {
            // Calculate and validate values for display
            const income = typeof budget.income === 'number' && !isNaN(budget.income) ? budget.income : 0;
            
            // Calculate total expenses with shared cost adjustment and APL reduction
            const totalExpenses = budget.expenses && budget.sharedExpenses ? 
              Object.entries(budget.expenses).reduce((total, [key, value]) => {
                const isShared = budget.sharedExpenses[key];
                const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
                
                // Special handling for APL (housing allowance)
                if (key === 'apl') {
                  const aplReduction = isShared ? numValue / 2 : numValue;
                  return total - aplReduction;
                }
                
                // If shared, divide by 2 (assuming equal split)
                const adjustedValue = isShared ? numValue / 2 : numValue;
                return total + adjustedValue;
              }, 0) : (budget.totalExpenses || 0);
            
            const balance = income - totalExpenses;
            
            return (
              <div key={budget.id || index} className="budget-item">
                <div className="budget-header">
                  <h4 className="budget-name">{budget.name}</h4>
                  <button 
                    onClick={() => handleViewBudget(budget)}
                    className="btn btn-primary btn-sm"
                  >
                    Voir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Modal */}
      {isModalOpen && selectedBudget && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal budget-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedBudget.name}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="budget-details">
                <div className="detail-item">
                  <span className="detail-label">Revenus:</span>
                  <span className="detail-value success">
                    €{(selectedBudget.income || 0).toFixed(2)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Dépenses totales:</span>
                  <span className="detail-value error">
                    €{(selectedBudget.totalExpenses || 0).toFixed(2)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Solde:</span>
                  <span className={`detail-value ${(selectedBudget.balance || 0) >= 0 ? 'success' : 'error'}`}>
                    €{(selectedBudget.balance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BalanceWidget = () => {
  const { state } = useBudget();
  const { selectedMonth, savedBudgets } = state;
  
  // Get data for selected month
  const getSelectedMonthData = () => {
    if (selectedMonth) {
      const selectedMonthBudget = savedBudgets.find(budget => budget.name === selectedMonth);
      if (selectedMonthBudget) {
        return {
          income: selectedMonthBudget.income - (selectedMonthBudget.autreArgentRecu || 0),
          autreArgentRecu: selectedMonthBudget.autreArgentRecu || 0,
          expenses: selectedMonthBudget.expenses || {},
          sharedExpenses: selectedMonthBudget.sharedExpenses || {}
        };
      }
    }
    // Fallback to current state data
    return {
      income: state.income,
      autreArgentRecu: state.autreArgentRecu || 0,
      expenses: state.expenses,
      sharedExpenses: state.sharedExpenses
    };
  };

  const monthData = getSelectedMonthData();
  const { income, autreArgentRecu, expenses, sharedExpenses } = monthData;
  
  const totalExpenses = React.useMemo(() => {
    return Object.entries(expenses).reduce((total, [key, value]) => {
      const isShared = sharedExpenses[key];
      if (key === 'apl') {
        const aplReduction = isShared ? value / 2 : value;
        return total - aplReduction;
      }
      const adjustedValue = isShared ? value / 2 : value;
      return total + adjustedValue;
    }, 0);
  }, [expenses, sharedExpenses]);
  
  const totalIncome = (Number(income) || 0) + (Number(autreArgentRecu) || 0);
  const balance = totalIncome - totalExpenses;
  
  return (
    <div className="widget-balance">
      <div className="widget-title">Solde actuel</div>
      <div className={`balance-amount ${balance >= 0 ? 'success' : 'error'}`}>
        €{balance.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
      </div>
      <div className="balance-details">
        <div className="balance-detail">
          <div className="detail-label">Revenus</div>
          <div className="detail-value success">
            €{totalIncome.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="balance-detail">
          <div className="detail-label">Dépenses</div>
          <div className="detail-value error">
            €{totalExpenses.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
};

const AIWidget = () => {
  const { state } = useBudget();
  const { selectedMonth, savedBudgets } = state;
  
  // Get data for selected month
  const getSelectedMonthData = () => {
    if (selectedMonth) {
      const selectedMonthBudget = savedBudgets.find(budget => budget.name === selectedMonth);
      if (selectedMonthBudget) {
        return {
          income: selectedMonthBudget.income - (selectedMonthBudget.autreArgentRecu || 0),
          autreArgentRecu: selectedMonthBudget.autreArgentRecu || 0,
          expenses: selectedMonthBudget.expenses || {},
          sharedExpenses: selectedMonthBudget.sharedExpenses || {}
        };
      }
    }
    // Fallback to current state data
    return {
      income: state.income,
      autreArgentRecu: state.autreArgentRecu || 0,
      expenses: state.expenses,
      sharedExpenses: state.sharedExpenses
    };
  };

  const monthData = getSelectedMonthData();
  const { income, expenses, sharedExpenses } = monthData;
  
  const totalExpenses = React.useMemo(() => {
    return Object.entries(expenses).reduce((total, [key, value]) => {
      const isShared = sharedExpenses[key];
      if (key === 'apl') {
        const aplReduction = isShared ? value / 2 : value;
        return total - aplReduction;
      }
      const adjustedValue = isShared ? value / 2 : value;
      return total + adjustedValue;
    }, 0);
  }, [expenses, sharedExpenses]);
  
  const balance = (Number(income) || 0) - totalExpenses;
  const savingsRate = (Number(income) || 0) > 0 ? (balance / (Number(income) || 0)) * 100 : 0;

  // Prédictions IA basées sur les données actuelles
  const predictions = {
    monthlySavings: Math.max(0, balance),
    nextMonthBalance: balance + (balance * 0.1), // +10% si positif
    spendingTrend: totalExpenses > (Number(income) || 0) * 0.8 ? 'Élevé' : 'Normal',
    recommendation: balance < 0 ? 'Réduire les dépenses' : 'Continuer à épargner'
  };

  return (
    <div className="widget-ai">
      <div className="widget-title">Prédictions IA</div>
      
      <div className="ai-predictions">
        <div className="prediction-item">
          <div className="prediction-label">Épargne mensuelle</div>
          <div className="prediction-value success">
            €{predictions.monthlySavings.toFixed(2)}
          </div>
        </div>
        
        <div className="prediction-item">
          <div className="prediction-label">Solde prévu (mois prochain)</div>
          <div className={`prediction-value ${predictions.nextMonthBalance >= 0 ? 'success' : 'error'}`}>
            €{predictions.nextMonthBalance.toFixed(2)}
          </div>
        </div>
        
        <div className="prediction-item">
          <div className="prediction-label">Tendance dépenses</div>
          <div className={`prediction-value ${predictions.spendingTrend === 'Élevé' ? 'warning' : 'success'}`}>
            {predictions.spendingTrend}
          </div>
        </div>
        
        <div className="prediction-item">
          <div className="prediction-label">Recommandation</div>
          <div className="prediction-recommendation">
            {predictions.recommendation}
          </div>
        </div>
      </div>
    </div>
  );
};

const TipsWidget = () => {
  const tips = [
    "Établissez un budget mensuel et respectez-le",
    "Payez-vous en premier : épargnez avant de dépenser",
    "Suivez vos dépenses quotidiennement",
    "Évitez les achats impulsifs",
    "Négociez vos factures régulièrement",
    "Construisez un fonds d'urgence de 3-6 mois de dépenses"
  ];
  
  return (
    <div className="widget-tips">
      <div className="widget-title">Astuces & Conseils</div>
      
      <div className="tips-list">
        {tips.map((tip, index) => (
          <div key={index} className="tip-item">
            <span className="tip-icon">💡</span>
            <div className="tip-text">
              {tip}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Widget = ({ type }) => {
  if (type === 'summary') {
    return <SummaryWidget />;
  }
  if (type === 'goals') {
    return <GoalsWidget />;
  }
  if (type === 'charts') {
    return <ChartsWidget />;
  }
  if (type === 'recentTransactions') {
    return <RecentTransactionsWidget />;
  }
  if (type === 'budgetList') {
    return <PreviousBudgetsWidget />;
  }
  if (type === 'balance') {
    return <BalanceWidget />;
  }
  if (type === 'ai') {
    return <AIWidget />;
  }
  if (type === 'tips') {
    return <TipsWidget />;
  }
  return (
    <div className={`widget widget-${type} widget-placeholder`}>
      <span className="widget-placeholder-icon">🧩</span>
      {widgetLabels[type] || 'Widget'}
      <div className="widget-placeholder-subtitle">
        (à personnaliser)
      </div>
    </div>
  );
};

export default Widget; 