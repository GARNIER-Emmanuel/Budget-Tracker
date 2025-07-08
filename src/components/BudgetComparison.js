import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import BudgetDetailsModal from './BudgetDetailsModal';
import { useBudget, BUDGET_ACTIONS } from '../contexts/BudgetContext';
import { translations } from '../translations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const BudgetComparison = (props) => {
  const { state } = useBudget();
  const currentLanguage = state?.currentLanguage || 'fr';
  const t = translations[currentLanguage] || {};
  const [analysis, setAnalysis] = useState(null);
  const [detailedComparison, setDetailedComparison] = useState(null);
  const [selectedBudgets, setSelectedBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBudgetsMobile, setShowBudgetsMobile] = useState(window.innerWidth >= 768);

  // Analyze budgets when savedBudgets changes
  useEffect(() => {
    // Clean up and recalculate budgets
    const updatedBudgets = state.savedBudgets.map(budget => {
      if (!budget || !budget.expenses || !budget.sharedExpenses) {
        return budget;
      }

      // Recalculate totalExpenses and balance
      const totalExpenses = Object.entries(budget.expenses).reduce((total, [key, value]) => {
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
      }, 0);

      const income = typeof budget.income === 'number' && !isNaN(budget.income) ? budget.income : 0;
      const balance = income - totalExpenses;

      return {
        ...budget,
        totalExpenses,
        balance
      };
    });

    // Filter out completely invalid budgets
    const validBudgets = updatedBudgets.filter(budget => 
      budget &&
      typeof budget.income === 'number' && 
      !isNaN(budget.income) &&
      typeof budget.totalExpenses === 'number' && 
      !isNaN(budget.totalExpenses) &&
      typeof budget.balance === 'number' && 
      !isNaN(budget.balance)
    );

    // Update budgets if values changed
    if (JSON.stringify(updatedBudgets) !== JSON.stringify(state.savedBudgets)) {
      console.log('Updating budgets with recalculated values...');
      // Update each budget individually through the context
      updatedBudgets.forEach(budget => {
        state.dispatch({ type: BUDGET_ACTIONS.SAVE_BUDGET, payload: budget });
      });
      return;
    }

    if (validBudgets.length >= 2) {
      analyzeBudgets(validBudgets);
      generateDetailedComparison(validBudgets);
    } else {
      setAnalysis(null);
      setDetailedComparison(null);
    }
  }, [state.savedBudgets]);

  // Responsive toggle for saved budgets
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowBudgetsMobile(false);
      } else {
        setShowBudgetsMobile(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const generateDetailedComparison = (budgets) => {
    if (budgets.length < 2) return;

    // Filter out invalid budgets
    const validBudgets = budgets.filter(budget => 
      typeof budget.totalExpenses === 'number' && 
      !isNaN(budget.totalExpenses) &&
      typeof budget.balance === 'number' && 
      !isNaN(budget.balance) &&
      typeof budget.income === 'number' && 
      !isNaN(budget.income)
    );

    if (validBudgets.length < 2) return;

    const comparison = {
      expenseChanges: {},
      categoryAnalysis: {},
      trends: {},
      recommendations: []
    };

    // Sort budgets by date
    const sortedBudgets = validBudgets.sort((a, b) => new Date(a.date) - new Date(b.date));

    const firstBudget = sortedBudgets[0];
    const lastBudget = sortedBudgets[sortedBudgets.length - 1];

    // Analyze each expense category
    Object.keys(firstBudget.expenses).forEach(category => {
      const firstValue = firstBudget.expenses[category];
      const lastValue = lastBudget.expenses[category];
      const change = lastValue - firstValue;
      const changePercent = firstValue > 0 ? ((change / firstValue) * 100) : 0;

      comparison.expenseChanges[category] = {
        firstValue,
        lastValue,
        change,
        changePercent,
        trend: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable'
      };

      // Category-specific analysis
      if (category === 'rent' && changePercent > 5) {
        comparison.recommendations.push(`Loyer augmenté de ${changePercent.toFixed(1)}%. Considérez renégocier ou déménager.`);
      }
      
      if (category === 'food' && changePercent > 20) {
        comparison.recommendations.push(`Dépenses alimentaires augmentées de ${changePercent.toFixed(1)}%. Vérifiez vos habitudes d'achat.`);
      }
      
      if (category === 'leisure' && changePercent > 30) {
        comparison.recommendations.push(`Dépenses de loisirs augmentées de ${changePercent.toFixed(1)}%. Réévaluez vos priorités.`);
      }
    });

    // Overall trends
    const incomeChange = firstBudget.income > 0 ? ((lastBudget.income - firstBudget.income) / firstBudget.income) * 100 : 0;
    const expenseChange = firstBudget.totalExpenses > 0 ? ((lastBudget.totalExpenses - firstBudget.totalExpenses) / firstBudget.totalExpenses) * 100 : 0;
    const balanceChange = firstBudget.balance !== 0 ? ((lastBudget.balance - firstBudget.balance) / Math.abs(firstBudget.balance)) * 100 : 0;

    comparison.trends = {
      income: { change: incomeChange, trend: incomeChange > 0 ? 'increase' : 'decrease' },
      expenses: { change: expenseChange, trend: expenseChange > 0 ? 'increase' : 'decrease' },
      balance: { change: balanceChange, trend: balanceChange > 0 ? 'increase' : 'decrease' }
    };

    // Savings analysis
    const avgSavingsRate = validBudgets.map(b => (b.balance / b.income) * 100).reduce((a, b) => a + b, 0) / validBudgets.length;
    if (avgSavingsRate < 10) {
      comparison.recommendations.push(`Taux d'épargne moyen de ${avgSavingsRate.toFixed(1)}%. Objectif recommandé: 20%.`);
    }

    setDetailedComparison(comparison);
  };

  const analyzeBudgets = (budgets) => {
    if (budgets.length < 2) return;

    // Filter out invalid budgets (missing totalExpenses or balance)
    const validBudgets = budgets.filter(budget => 
      typeof budget.totalExpenses === 'number' && 
      !isNaN(budget.totalExpenses) &&
      typeof budget.balance === 'number' && 
      !isNaN(budget.balance) &&
      typeof budget.income === 'number' && 
      !isNaN(budget.income)
    );

    if (validBudgets.length < 2) {
      console.warn('Not enough valid budgets for analysis');
      return;
    }

    const analysis = {
      totalBudgets: validBudgets.length,
      dateRange: {
        start: validBudgets[0].name,
        end: validBudgets[validBudgets.length - 1].name
      },
      averageIncome: validBudgets.reduce((sum, b) => sum + (b.income || 0), 0) / validBudgets.length,
      averageExpenses: validBudgets.reduce((sum, b) => sum + (b.totalExpenses || 0), 0) / validBudgets.length,
      averageBalance: validBudgets.reduce((sum, b) => sum + (b.balance || 0), 0) / validBudgets.length,
      totalSavings: validBudgets.reduce((sum, b) => sum + (b.balance || 0), 0),
      expenseBreakdown: {}
    };

    // Calculate average expenses by category
    if (validBudgets[0].expenses) {
      const expenseCategories = Object.keys(validBudgets[0].expenses);
      expenseCategories.forEach(category => {
        analysis.expenseBreakdown[category] = validBudgets.reduce((sum, b) => sum + (b.expenses?.[category] || 0), 0) / validBudgets.length;
      });
    }

    setAnalysis(analysis);
  };

  const removeBudget = (id) => {
    state.dispatch({ type: BUDGET_ACTIONS.DELETE_BUDGET, payload: id });
  };

  const showBudgetDetails = (budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBudget(null);
  };

  const prepareChartData = () => {
    if (state.savedBudgets.length === 0) return null;

    // Filter out invalid budgets for charts
    const validBudgets = state.savedBudgets.filter(budget => 
      typeof budget.totalExpenses === 'number' && 
      !isNaN(budget.totalExpenses) &&
      typeof budget.balance === 'number' && 
      !isNaN(budget.balance) &&
      typeof budget.income === 'number' && 
      !isNaN(budget.income)
    );

    if (validBudgets.length === 0) return null;

    // Trie uniquement les budgets existants, pas de mois "vides"
    const sortedBudgets = validBudgets.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      labels: sortedBudgets.map(b => b.name),
      datasets: [
        {
          label: t.income || 'Income',
          data: sortedBudgets.map(b => b.income),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1
        },
        {
          label: t.totalExpenses || 'Total Expenses',
          data: sortedBudgets.map(b => b.totalExpenses),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.1
        },
        {
          label: t.balance || 'Balance',
          data: sortedBudgets.map(b => b.balance),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1
        }
      ]
    };
  };

  const getChartOptions = (isLineChart = false) => ({
    responsive: true,
    plugins: {
      legend: { 
        position: isLineChart ? 'top' : 'bottom',
        labels: {
          color: '#374151',
        }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
      }
    },
    scales: isLineChart ? {
      y: { 
        beginAtZero: true,
        ticks: {
          color: '#374151',
        },
        grid: {
          color: '#e5e7eb',
        }
      },
      x: {
        ticks: {
          color: '#374151',
        },
        grid: {
          color: '#e5e7eb',
        }
      }
    } : undefined
  });

  const chartData = prepareChartData();

  return (
    <div className="comparison-root" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{t.comparisonTitle || 'Comparaison des budgets'}</h1>
        <p style={{ color: '#64748b', marginTop: 8 }}>{t.comparisonDesc || 'Comparez vos budgets sauvegardés et visualisez votre évolution financière.'}</p>
      </header>
      <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', color: '#2563eb', marginBottom: 12 }}>{t.comparisonCharts || 'Évolution graphique'}</h2>
        {chartData && <Line data={chartData} options={getChartOptions(true)} />}
      </section>
      <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', color: '#10b981', marginBottom: 12 }}>{t.comparisonBudgets || 'Liste des budgets sauvegardés'}</h2>
        {/* Toggle button for mobile */}
        {window.innerWidth < 768 && (
          <button
            className="toggle-budgets-button"
            style={{
              margin: '0 auto 1rem auto',
              display: 'block',
              padding: '0.75rem 1.25rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
              maxWidth: 400,
            }}
            onClick={() => setShowBudgetsMobile((v) => !v)}
          >
            {showBudgetsMobile
              ? (t.hideSavedBudgets || 'Cacher les budgets sauvegardés')
              : (t.showSavedBudgets || 'Afficher les budgets sauvegardés')}
          </button>
        )}

        {state.savedBudgets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>{t.noBudgets || 'No saved budgets yet'}</h3>
            <p>{t.saveFirstBudget || 'Save your first budget in the tracker page to start comparing'}</p>
          </div>
        ) : (
          <>
            {/* Saved Budgets List */}
            {(showBudgetsMobile || window.innerWidth >= 768) && (
              <div className="saved-budgets-section">
                <h3>{t.savedBudgets || 'Saved Budgets'}</h3>
                <div className="budgets-grid">
                  {[...state.savedBudgets].sort((a, b) => new Date(a.date) - new Date(b.date)).map((budget, index) => {
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
                      <div key={budget.id} className="budget-card">
                        <div className="budget-header">
                          <h4>{budget.name}</h4>
                          <div className="budget-actions">
                            <button 
                              onClick={() => showBudgetDetails(budget)}
                              className="details-button"
                              title={t.viewDetails || 'View details'}
                            >
                              👁️
                            </button>
                            <button 
                              onClick={() => removeBudget(budget.id)}
                              className="remove-button"
                              title={t.removeBudget || 'Remove budget'}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <div className="budget-summary">
                          <div className="budget-item">
                            <span>{t.income || 'Income'}:</span>
                            <span className="amount income">€{income.toFixed(2)}</span>
                          </div>
                          <div className="budget-item">
                            <span>{t.totalExpenses || 'Expenses'}:</span>
                            <span className="amount expense">€{totalExpenses.toFixed(2)}</span>
                          </div>
                          <div className="budget-item">
                            <span>{t.balance || 'Balance'}:</span>
                            <span className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
                              €{balance.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Financial Goals Status */}
                        {budget.goalAchievements && (
                          <div className="budget-goals">
                            <h5>{t.financialGoals || 'Financial Goals'}</h5>
                            <div className="goals-status">
                              <div className="goal-status-item">
                                <span className="goal-label">{t.monthlySavingsGoal || 'Savings'}:</span>
                                <span className={`goal-status ${budget.goalAchievements.monthlySavings.achieved ? 'achieved' : 'not-achieved'}`}>
                                  {budget.goalAchievements.monthlySavings.achieved ? '✅' : '❌'}
                                </span>
                              </div>
                              <div className="goal-status-item">
                                <span className="goal-label">{t.leisureSpendingLimit || 'Leisure'}:</span>
                                <span className={`goal-status ${budget.goalAchievements.maxLeisureSpending.achieved ? 'achieved' : 'not-achieved'}`}>
                                  {budget.goalAchievements.maxLeisureSpending.achieved ? '✅' : '❌'}
                                </span>
                              </div>
                              <div className="goal-status-item">
                                <span className="goal-label">{t.emergencyFund || 'Emergency'}:</span>
                                <span className={`goal-status ${budget.goalAchievements.emergencyFundTarget.achieved ? 'achieved' : 'not-achieved'}`}>
                                  {budget.goalAchievements.emergencyFundTarget.achieved ? '✅' : '❌'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </section>
      <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24 }}>
        <h2 style={{ fontSize: '1.2rem', color: '#f59e42', marginBottom: 12 }}>{t.comparisonTips || 'Conseils IA & alertes'}</h2>
        {/* Analysis */}
        {analysis && (
          <div className="analysis-section">
            <h3>{t.analysis || 'Analysis'}</h3>
            <div className="analysis-grid">
              <div className="analysis-card">
                <h4>{t.overview || 'Overview'}</h4>
                <div className="analysis-item">
                  <span>{t.totalBudgets || 'Total budgets'}:</span>
                  <span>{analysis.totalBudgets}</span>
                </div>
                <div className="analysis-item">
                  <span>{t.period || 'Period'}:</span>
                  <span>{analysis.dateRange.start} - {analysis.dateRange.end}</span>
                </div>
                <div className="analysis-item">
                  <span>{t.averageIncome || 'Average income'}:</span>
                  <span>€{analysis.averageIncome.toFixed(0)}</span>
                </div>
                <div className="analysis-item">
                  <span>{t.averageExpenses || 'Average expenses'}:</span>
                  <span>€{analysis.averageExpenses.toFixed(0)}</span>
                </div>
                <div className="analysis-item">
                  <span>{t.totalSavings || 'Total savings'}:</span>
                  <span className={analysis.totalSavings >= 0 ? 'positive' : 'negative'}>
                    €{analysis.totalSavings.toFixed(0)}
                  </span>
                </div>
              </div>

              {detailedComparison && (
                <div className="analysis-card">
                  <h4>{t.trends || 'Trends'}</h4>
                  <div className="trend-item">
                    <span>{t.income || 'Income'}:</span>
                    <span className={`trend ${detailedComparison.trends.income.trend}`}>
                      {detailedComparison.trends.income.change > 0 ? '+' : ''}{detailedComparison.trends.income.change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="trend-item">
                    <span>{t.expenses || 'Expenses'}:</span>
                    <span className={`trend ${detailedComparison.trends.expenses.trend}`}>
                      {detailedComparison.trends.expenses.change > 0 ? '+' : ''}{detailedComparison.trends.expenses.change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="trend-item">
                    <span>{t.balance || 'Balance'}:</span>
                    <span className={`trend ${detailedComparison.trends.balance.trend}`}>
                      {detailedComparison.trends.balance.change > 0 ? '+' : ''}{detailedComparison.trends.balance.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {detailedComparison?.recommendations?.length > 0 && (
              <div className="recommendations">
                <h4>{t.recommendations || 'Recommendations'}</h4>
                <ul>
                  {detailedComparison.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Budget Details Modal */}
      <BudgetDetailsModal
        budget={selectedBudget}
        isOpen={isModalOpen}
        onClose={closeModal}
        translations={translations}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};

export default BudgetComparison; 