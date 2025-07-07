import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import BudgetDetailsModal from './BudgetDetailsModal';
import { useBudget, BUDGET_ACTIONS } from '../contexts/BudgetContext';
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const BudgetComparison = ({ translations, currentLanguage, savedBudgets, isDarkMode = false }) => {
  const { dispatch } = useBudget();
  const [analysis, setAnalysis] = useState(null);
  const [detailedComparison, setDetailedComparison] = useState(null);
  const [selectedBudgets, setSelectedBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBudgetsMobile, setShowBudgetsMobile] = useState(window.innerWidth >= 768);

  // Analyze budgets when savedBudgets changes
  useEffect(() => {
    // Clean up and recalculate budgets
    const updatedBudgets = savedBudgets.map(budget => {
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
    if (JSON.stringify(updatedBudgets) !== JSON.stringify(savedBudgets)) {
      console.log('Updating budgets with recalculated values...');
      // Update each budget individually through the context
      updatedBudgets.forEach(budget => {
        dispatch({ type: BUDGET_ACTIONS.SAVE_BUDGET, payload: budget });
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
  }, [savedBudgets]);

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
    dispatch({ type: BUDGET_ACTIONS.DELETE_BUDGET, payload: id });
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
    if (savedBudgets.length === 0) return null;

    // Filter out invalid budgets for charts
    const validBudgets = savedBudgets.filter(budget => 
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
          label: translations[currentLanguage]?.income || 'Income',
          data: sortedBudgets.map(b => b.income),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1
        },
        {
          label: translations[currentLanguage]?.totalExpenses || 'Total Expenses',
          data: sortedBudgets.map(b => b.totalExpenses),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.1
        },
        {
          label: translations[currentLanguage]?.balance || 'Balance',
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
          color: isDarkMode ? '#f9fafb' : '#374151',
        }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
        titleColor: isDarkMode ? '#f9fafb' : '#374151',
        bodyColor: isDarkMode ? '#f9fafb' : '#374151',
        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
      }
    },
    scales: isLineChart ? {
      y: { 
        beginAtZero: true,
        ticks: {
          color: isDarkMode ? '#f9fafb' : '#374151',
        },
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb',
        }
      },
      x: {
        ticks: {
          color: isDarkMode ? '#f9fafb' : '#374151',
        },
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb',
        }
      }
    } : undefined
  });

  const chartData = prepareChartData();

  return (
    <div className="budget-comparison">
      <div className="comparison-header">
        <h2>{translations[currentLanguage]?.budgetComparison || 'Budget Comparison'}</h2>
        <p>{translations[currentLanguage]?.comparisonDescription || 'Analyze your saved budgets and track your financial evolution'}</p>
      </div>

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
            ? (translations[currentLanguage]?.hideSavedBudgets || 'Cacher les budgets sauvegardés')
            : (translations[currentLanguage]?.showSavedBudgets || 'Afficher les budgets sauvegardés')}
        </button>
      )}

      {savedBudgets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>{translations[currentLanguage]?.noBudgets || 'No saved budgets yet'}</h3>
          <p>{translations[currentLanguage]?.saveFirstBudget || 'Save your first budget in the tracker page to start comparing'}</p>
        </div>
      ) : (
        <>
          {/* Saved Budgets List */}
          {(showBudgetsMobile || window.innerWidth >= 768) && (
            <div className="saved-budgets-section">
              <h3>{translations[currentLanguage]?.savedBudgets || 'Saved Budgets'}</h3>
              <div className="budgets-grid">
                {[...savedBudgets].sort((a, b) => new Date(a.date) - new Date(b.date)).map((budget, index) => {
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
                            title={translations[currentLanguage]?.viewDetails || 'View details'}
                          >
                            👁️
                          </button>
                          <button 
                            onClick={() => removeBudget(budget.id)}
                            className="remove-button"
                            title={translations[currentLanguage]?.removeBudget || 'Remove budget'}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                                          <div className="budget-summary">
                      <div className="budget-item">
                        <span>{translations[currentLanguage]?.income || 'Income'}:</span>
                        <span className="amount income">€{income.toFixed(2)}</span>
                      </div>
                      <div className="budget-item">
                        <span>{translations[currentLanguage]?.totalExpenses || 'Expenses'}:</span>
                        <span className="amount expense">€{totalExpenses.toFixed(2)}</span>
                      </div>
                      <div className="budget-item">
                        <span>{translations[currentLanguage]?.balance || 'Balance'}:</span>
                        <span className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
                          €{balance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Financial Goals Status */}
                    {budget.goalAchievements && (
                      <div className="budget-goals">
                        <h5>{translations[currentLanguage]?.financialGoals || 'Financial Goals'}</h5>
                        <div className="goals-status">
                          <div className="goal-status-item">
                            <span className="goal-label">{translations[currentLanguage]?.monthlySavingsGoal || 'Savings'}:</span>
                            <span className={`goal-status ${budget.goalAchievements.monthlySavings.achieved ? 'achieved' : 'not-achieved'}`}>
                              {budget.goalAchievements.monthlySavings.achieved ? '✅' : '❌'}
                            </span>
                          </div>
                          <div className="goal-status-item">
                            <span className="goal-label">{translations[currentLanguage]?.leisureSpendingLimit || 'Leisure'}:</span>
                            <span className={`goal-status ${budget.goalAchievements.maxLeisureSpending.achieved ? 'achieved' : 'not-achieved'}`}>
                              {budget.goalAchievements.maxLeisureSpending.achieved ? '✅' : '❌'}
                            </span>
                          </div>
                          <div className="goal-status-item">
                            <span className="goal-label">{translations[currentLanguage]?.emergencyFund || 'Emergency'}:</span>
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

          {savedBudgets.filter(budget => 
            typeof budget.totalExpenses === 'number' && 
            !isNaN(budget.totalExpenses) &&
            typeof budget.balance === 'number' && 
            !isNaN(budget.balance) &&
            typeof budget.income === 'number' && 
            !isNaN(budget.income)
          ).length >= 2 && (
            <>
              {/* Charts */}
              <div className="charts-section" style={{ marginBottom: '2rem' }}>
                <div className="chart-container">
                  <h3>{translations[currentLanguage]?.evolutionChart || 'Budget Evolution'}</h3>
                  {chartData && <Line data={chartData} options={getChartOptions(true)} />}
                </div>
              </div>

              {/* Analysis */}
              {analysis && (
                <div className="analysis-section">
                  <h3>{translations[currentLanguage]?.analysis || 'Analysis'}</h3>
                  <div className="analysis-grid">
                    <div className="analysis-card">
                      <h4>{translations[currentLanguage]?.overview || 'Overview'}</h4>
                      <div className="analysis-item">
                        <span>{translations[currentLanguage]?.totalBudgets || 'Total budgets'}:</span>
                        <span>{analysis.totalBudgets}</span>
                      </div>
                      <div className="analysis-item">
                        <span>{translations[currentLanguage]?.period || 'Period'}:</span>
                        <span>{analysis.dateRange.start} - {analysis.dateRange.end}</span>
                      </div>
                      <div className="analysis-item">
                        <span>{translations[currentLanguage]?.averageIncome || 'Average income'}:</span>
                        <span>€{analysis.averageIncome.toFixed(0)}</span>
                      </div>
                      <div className="analysis-item">
                        <span>{translations[currentLanguage]?.averageExpenses || 'Average expenses'}:</span>
                        <span>€{analysis.averageExpenses.toFixed(0)}</span>
                      </div>
                      <div className="analysis-item">
                        <span>{translations[currentLanguage]?.totalSavings || 'Total savings'}:</span>
                        <span className={analysis.totalSavings >= 0 ? 'positive' : 'negative'}>
                          €{analysis.totalSavings.toFixed(0)}
                        </span>
                      </div>
                    </div>

                    {detailedComparison && (
                      <div className="analysis-card">
                        <h4>{translations[currentLanguage]?.trends || 'Trends'}</h4>
                        <div className="trend-item">
                          <span>{translations[currentLanguage]?.income || 'Income'}:</span>
                          <span className={`trend ${detailedComparison.trends.income.trend}`}>
                            {detailedComparison.trends.income.change > 0 ? '+' : ''}{detailedComparison.trends.income.change.toFixed(1)}%
                          </span>
                        </div>
                        <div className="trend-item">
                          <span>{translations[currentLanguage]?.expenses || 'Expenses'}:</span>
                          <span className={`trend ${detailedComparison.trends.expenses.trend}`}>
                            {detailedComparison.trends.expenses.change > 0 ? '+' : ''}{detailedComparison.trends.expenses.change.toFixed(1)}%
                          </span>
                        </div>
                        <div className="trend-item">
                          <span>{translations[currentLanguage]?.balance || 'Balance'}:</span>
                          <span className={`trend ${detailedComparison.trends.balance.trend}`}>
                            {detailedComparison.trends.balance.change > 0 ? '+' : ''}{detailedComparison.trends.balance.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {detailedComparison?.recommendations?.length > 0 && (
                    <div className="recommendations">
                      <h4>{translations[currentLanguage]?.recommendations || 'Recommendations'}</h4>
                      <ul>
                        {detailedComparison.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

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