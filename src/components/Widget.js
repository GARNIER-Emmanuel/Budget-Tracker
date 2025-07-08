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
  const { income, autreArgentRecu = 0, expenses, sharedExpenses } = state;
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
    <div className="widget-summary" style={{ width: '100%', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, color: '#10b981', marginBottom: 4 }}>💰</div>
          <div style={{ fontWeight: 600, color: '#10b981', fontSize: 18 }}>Solde</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: balance >= 0 ? '#10b981' : '#ef4444' }}>€{balance.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, color: '#2563eb', marginBottom: 4 }}>⬆️</div>
          <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 18 }}>Revenus</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#2563eb' }}>€{totalIncome.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, color: '#ef4444', marginBottom: 4 }}>⬇️</div>
          <div style={{ fontWeight: 600, color: '#ef4444', fontSize: 18 }}>Dépenses</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#ef4444' }}>€{totalExpenses.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</div>
        </div>
      </div>
    </div>
  );
};

const GoalsWidget = () => {
  const { state, dispatch } = useBudget();
  const { expenses, financialGoals = {}, currentLanguage } = state;
  const [editMode, setEditMode] = React.useState(false);
  const [goals, setGoals] = React.useState({
    monthlySavings: financialGoals.monthlySavings || 0,
    maxLeisureSpending: financialGoals.maxLeisureSpending || 0,
    emergencyFundTarget: financialGoals.emergencyFundTarget || 0,
  });

  // Valeurs réelles
  const savings = expenses.savings || 0;
  const leisure = expenses.leisure || 0;
  const unforeseen = expenses.unforeseen || 0;

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
      <div className="widget-goals" style={{ width: '100%', maxWidth: 340, margin: '0 auto' }}>
        <div style={{ fontWeight: 600, color: '#a21caf', fontSize: 18, marginBottom: 8, textAlign: 'center' }}>
          Objectifs financiers du mois
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 500, color: '#10b981' }}>Épargne&nbsp;: <span style={{ fontWeight: 700 }}>€{savings.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</span> / <span style={{ color: '#64748b' }}>€{goals.monthlySavings}</span></div>
          <div className="progress-bar" style={{ background: '#e5e7eb', borderRadius: 8, height: 8, marginTop: 4, marginBottom: 4 }}>
            <div style={{ width: `${savingsProgress}%`, background: '#10b981', height: 8, borderRadius: 8, transition: 'width 0.4s' }} />
          </div>
          {savingsAlert && <div style={{ color: '#ef4444', fontSize: 13 }}>Objectif d'épargne non atteint</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 500, color: '#f59e42' }}>Loisirs&nbsp;: <span style={{ fontWeight: 700 }}>€{leisure.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</span> / <span style={{ color: '#64748b' }}>€{goals.maxLeisureSpending}</span></div>
          <div className="progress-bar" style={{ background: '#e5e7eb', borderRadius: 8, height: 8, marginTop: 4, marginBottom: 4 }}>
            <div style={{ width: `${leisureProgress}%`, background: '#f59e42', height: 8, borderRadius: 8, transition: 'width 0.4s' }} />
          </div>
          {leisureAlert && <div style={{ color: '#ef4444', fontSize: 13 }}>Plafond loisirs dépassé</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 500, color: '#6366f1' }}>Fonds d'urgence&nbsp;: <span style={{ fontWeight: 700 }}>€{unforeseen.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</span> / <span style={{ color: '#64748b' }}>€{goals.emergencyFundTarget}</span></div>
          <div className="progress-bar" style={{ background: '#e5e7eb', borderRadius: 8, height: 8, marginTop: 4, marginBottom: 4 }}>
            <div style={{ width: `${emergencyProgress}%`, background: '#6366f1', height: 8, borderRadius: 8, transition: 'width 0.4s' }} />
          </div>
          {emergencyAlert && <div style={{ color: '#ef4444', fontSize: 13 }}>Objectif fonds d'urgence non atteint</div>}
        </div>
        <button onClick={() => setEditMode(true)} style={{ background: '#a21caf', color: 'white', border: 'none', borderRadius: 4, padding: '0.5rem 1.5rem', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>Modifier les objectifs</button>
      </div>
      {/* Modal d'édition des objectifs */}
      {editMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            maxWidth: 400,
            padding: 24,
            position: 'relative'
          }}>
            <button 
              onClick={handleCancel}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: 16 }}>Modifier les objectifs</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#374151', fontWeight: 500 }}>
                Épargne visée (€)
              </label>
              <input
                type="number"
                value={goals.monthlySavings}
                onChange={e => setGoals(g => ({ ...g, monthlySavings: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box',
                  marginBottom: 12
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <label style={{ display: 'block', marginBottom: 8, color: '#374151', fontWeight: 500 }}>
                Plafond loisirs (€)
              </label>
              <input
                type="number"
                value={goals.maxLeisureSpending}
                onChange={e => setGoals(g => ({ ...g, maxLeisureSpending: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box',
                  marginBottom: 12
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <label style={{ display: 'block', marginBottom: 8, color: '#374151', fontWeight: 500 }}>
                Fonds d'urgence visé (€)
              </label>
              <input
                type="number"
                value={goals.emergencyFundTarget}
                onChange={e => setGoals(g => ({ ...g, emergencyFundTarget: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box',
                  marginBottom: 12
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                onClick={handleCancel}
                style={{
                  background: '#f1f5f9',
                  color: '#374151',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Enregistrer
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
  const { expenses } = state;
  // Catégories à afficher (hors APL, savings, unforeseen, autreArgentRecu, income)
  const exclude = ['apl', 'savings', 'unforeseen', 'autreArgentRecu', 'income'];
  const filtered = Object.entries(expenses)
    .filter(([key, value]) => !exclude.includes(key) && value > 0);
  const labels = filtered.map(([key]) => key);
  const dataValues = filtered.map(([, value]) => value);
  // Couleurs harmonieuses
  const colors = [
    '#2563eb', '#10b981', '#f59e42', '#ef4444', '#a21caf', '#fbbf24', '#0ea5e9', '#6366f1', '#e11d48', '#84cc16', '#f472b6', '#14b8a6'
  ];
  const chartData = {
    labels: labels.length ? labels : ['Aucune dépense'],
    datasets: [
      {
        data: dataValues.length ? dataValues : [1],
        backgroundColor: colors.slice(0, labels.length || 1),
        borderWidth: 1,
      },
    ],
  };
  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#334155',
          font: { size: 14, weight: 'bold' },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (!labels.length) return 'Aucune dépense';
            return `${context.label}: €${context.parsed.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };
  return (
    <div className="widget-charts" style={{ width: '100%', height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 18, marginBottom: 8 }}>Répartition des dépenses</div>
      <div style={{ width: '100%', maxWidth: 320, height: 180 }}>
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
        amount: -Math.abs(value),
        date: currentBudget.date || '',
      }));
    // Revenus
    if (currentBudget.income > 0) {
      transactions.push({
        type: 'income',
        category: 'Revenus',
        amount: currentBudget.income,
        date: currentBudget.date || '',
      });
    }
    if (currentBudget.autreArgentRecu > 0) {
      transactions.push({
        type: 'income',
        category: 'Autre argent reçu',
        amount: currentBudget.autreArgentRecu,
        date: currentBudget.date || '',
      });
    }
  }
  // Trier par date (ici, toutes les transactions du mois, donc on prend les 5 plus récentes)
  const lastTransactions = transactions.slice(-5).reverse();

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setEditValue(Math.abs(transaction.amount).toString());
  };

  const handleSave = () => {
    if (editingTransaction && editValue) {
      const newValue = Number(editValue);
      if (!isNaN(newValue) && newValue >= 0) {
        dispatch({ type: 'UPDATE_EXPENSE', payload: { key: editingTransaction.category, value: newValue } });
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
    <>
      <div className="widget-transactions" style={{ width: '100%', maxWidth: 340, margin: '0 auto' }}>
        <div style={{ fontWeight: 600, color: '#0ea5e9', fontSize: 18, marginBottom: 8, textAlign: 'center' }}>
          Transactions récentes
        </div>
        {lastTransactions.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', fontSize: 15, marginTop: 16 }}>Aucune transaction ce mois-ci.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {lastTransactions.map((tx, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontWeight: 500, color: tx.type === 'income' ? '#10b981' : '#ef4444' }}>{tx.category}</span>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{tx.date ? new Date(tx.date).toLocaleDateString('fr-FR') : ''}</span>
                </div>
                <span style={{ fontWeight: 700, color: tx.type === 'income' ? '#10b981' : '#ef4444', marginRight: 8 }}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €
                </span>
                {tx.type === 'expense' && (
                  <button onClick={() => handleEdit(tx)} style={{ background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 4, padding: '0.2rem 0.7rem', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Modifier</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal de modification */}
      {editingTransaction && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            maxWidth: 400,
            padding: 24,
            position: 'relative'
          }}>
            <button 
              onClick={handleCancel}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
            
            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: 16 }}>Modifier la transaction</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#374151', fontWeight: 500 }}>
                Catégorie : {editingTransaction.category}
              </label>
              <label style={{ display: 'block', marginBottom: 8, color: '#374151', fontWeight: 500 }}>
                Nouveau montant (€)
              </label>
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  boxSizing: 'border-box'
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                onClick={handleCancel}
                style={{
                  background: '#f1f5f9',
                  color: '#374151',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const PreviousBudgetsWidget = () => {
  const { state, dispatch } = useBudget();
  const { savedBudgets } = state;
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const budgets = [...(savedBudgets || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const handleViewBudget = (budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBudget(null);
  };

  return (
    <>
      <div className="widget-budgets" style={{ width: '100%', maxWidth: 340, margin: '0 auto' }}>
        <div style={{ fontWeight: 600, color: '#f59e42', fontSize: 18, marginBottom: 8, textAlign: 'center' }}>
          Budgets précédents
        </div>
        {budgets.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', fontSize: 15, marginTop: 16 }}>Aucun budget sauvegardé.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {budgets.map((b, idx) => (
              <li key={b.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: '#334155' }}>{b.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Solde : <span style={{ color: b.balance >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>€{b.balance.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</span></div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Dépenses : €{b.totalExpenses.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} | Revenus : €{b.income.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</div>
                </div>
                <button 
                  onClick={() => handleViewBudget(b)}
                  style={{ background: '#f59e42', color: 'white', border: 'none', borderRadius: 4, padding: '0.3rem 1rem', fontWeight: 600, cursor: 'pointer', fontSize: 13, marginLeft: 8 }}
                  title="Voir les détails de ce budget"
                >
                  Voir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal détaillé du budget */}
      {isModalOpen && selectedBudget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            padding: 24,
            position: 'relative'
          }}>
            <button 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
            
            <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: 16 }}>{selectedBudget.name}</h2>
            
            {/* Résumé du budget */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#64748b' }}>Revenus</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>€{selectedBudget.income.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#64748b' }}>Dépenses</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>€{selectedBudget.totalExpenses.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#64748b' }}>Solde</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: selectedBudget.balance >= 0 ? '#10b981' : '#ef4444' }}>€{selectedBudget.balance.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</div>
              </div>
            </div>

            {/* Dépenses par catégorie */}
            <h3 style={{ fontSize: '1.2rem', color: '#374151', marginBottom: 12 }}>Dépenses par catégorie</h3>
            <div style={{ marginBottom: 24 }}>
              {Object.entries(selectedBudget.expenses || {}).map(([category, amount]) => amount > 0 && (
                <div key={category} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#374151', textTransform: 'capitalize' }}>{category}</span>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>€{amount.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>

            {/* Objectifs financiers */}
            {selectedBudget.goalAchievements && (
              <>
                <h3 style={{ fontSize: '1.2rem', color: '#374151', marginBottom: 12 }}>Objectifs financiers</h3>
                <div style={{ marginBottom: 24 }}>
                  {Object.entries(selectedBudget.goalAchievements).map(([goal, data]) => (
                    <div key={goal} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#374151' }}>{goal}</span>
                      <span style={{ color: data.achieved ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                        {data.achieved ? '✅ Atteint' : '❌ Non atteint'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const BalanceWidget = () => {
  const { state } = useBudget();
  const { income, autreArgentRecu = 0, expenses, sharedExpenses } = state;
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
  const isPositive = balance >= 0;
  return (
    <div className="widget-balance" style={{ width: '100%', textAlign: 'center' }}>
      <div style={{ fontSize: 24, color: isPositive ? '#10b981' : '#ef4444', marginBottom: 8 }}>{isPositive ? '💰' : '⚠️'}</div>
      <div style={{ fontWeight: 600, color: isPositive ? '#10b981' : '#ef4444', fontSize: 20, marginBottom: 4 }}>Solde actuel</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: isPositive ? '#10b981' : '#ef4444', marginBottom: 8 }}>€{balance.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</div>
      <div style={{ fontSize: 14, color: '#64748b' }}>
        {isPositive ? 'Excellent ! Votre budget est équilibré.' : 'Attention : dépenses supérieures aux revenus.'}
      </div>
    </div>
  );
};

const AIWidget = () => {
  const { state } = useBudget();
  const { expenses, income, savedBudgets } = state;
  const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + (Number(val) || 0), 0);
  const savingsRate = income > 0 ? ((income - totalExpenses) / income) * 100 : 0;
  const avgExpenses = savedBudgets.length > 0 ? savedBudgets.reduce((sum, b) => sum + (b.totalExpenses || 0), 0) / savedBudgets.length : 0;
  const currentExpenses = totalExpenses;
  const recommendations = [];
  if (savingsRate < 10) {
    recommendations.push('Taux d\'épargne faible. Objectif recommandé : 20%');
  }
  if (currentExpenses > avgExpenses * 1.2) {
    recommendations.push('Dépenses supérieures à la moyenne. Vérifiez vos habitudes.');
  }
  if (expenses.leisure > income * 0.3) {
    recommendations.push('Dépenses de loisirs élevées. Réévaluez vos priorités.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Votre budget est bien géré ! Continuez ainsi.');
  }
  return (
    <div className="widget-ai" style={{ width: '100%', maxWidth: 340, margin: '0 auto' }}>
      <div style={{ fontWeight: 600, color: '#6366f1', fontSize: 18, marginBottom: 8, textAlign: 'center' }}>
        🤖 Prédictions IA
      </div>
      <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>
        {recommendations.map((rec, idx) => (
          <div key={idx} style={{ marginBottom: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 6, borderLeft: '3px solid #6366f1' }}>
            {rec}
          </div>
        ))}
      </div>
    </div>
  );
};

const TipsWidget = () => {
  const tips = [
    'Épargnez 20% de vos revenus pour un avenir serein.',
    'Créez un fonds d\'urgence équivalent à 3-6 mois de dépenses.',
    'Suivez vos dépenses quotidiennement pour identifier les fuites.',
    'Négociez vos contrats (assurance, téléphonie, énergie) régulièrement.',
    'Privilégiez l\'investissement long terme pour faire fructifier votre épargne.',
    'Évitez les achats impulsifs, attendez 24h avant tout achat important.',
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  return (
    <div className="widget-tips" style={{ width: '100%', maxWidth: 340, margin: '0 auto' }}>
      <div style={{ fontWeight: 600, color: '#f59e42', fontSize: 18, marginBottom: 8, textAlign: 'center' }}>
        💡 Astuce du jour
      </div>
      <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, textAlign: 'center', fontStyle: 'italic' }}>
        "{randomTip}"
      </div>
      <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 12 }}>
        Actualisé quotidiennement
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
    <div className={`widget widget-${type}`} style={{
      background: '#fff',
      borderRadius: '1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      padding: '2rem',
      minWidth: 220,
      minHeight: 120,
      margin: '1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.1rem',
      color: '#374151',
      fontWeight: 500
    }}>
      <span style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.3 }}>🧩</span>
      {widgetLabels[type] || 'Widget'}
      <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: 8, opacity: 0.7 }}>
        (à personnaliser)
      </div>
    </div>
  );
};

export default Widget; 