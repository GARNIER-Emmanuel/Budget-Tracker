import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import BudgetDetailsModal from './BudgetDetailsModal';
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

const BudgetComparison = ({ translations, currentLanguage, savedBudgets, setSavedBudgets, isDarkMode = false }) => {
  const [analysis, setAnalysis] = useState(null);
  const [detailedComparison, setDetailedComparison] = useState(null);
  const [selectedBudgets, setSelectedBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Analyze budgets when savedBudgets changes
  useEffect(() => {
    if (savedBudgets.length >= 2) {
      analyzeBudgets(savedBudgets);
      generateDetailedComparison(savedBudgets);
    } else {
      setAnalysis(null);
      setDetailedComparison(null);
    }
  }, [savedBudgets]);

  const generateDetailedComparison = (budgets) => {
    if (budgets.length < 2) return;

    const comparison = {
      expenseChanges: {},
      categoryAnalysis: {},
      trends: {},
      recommendations: []
    };

    // Sort budgets by date
    const sortedBudgets = budgets.sort((a, b) => new Date(a.date) - new Date(b.date));

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
    const avgSavingsRate = budgets.map(b => (b.balance / b.income) * 100).reduce((a, b) => a + b, 0) / budgets.length;
    if (avgSavingsRate < 10) {
      comparison.recommendations.push(`Taux d'épargne moyen de ${avgSavingsRate.toFixed(1)}%. Objectif recommandé: 20%.`);
    }

    setDetailedComparison(comparison);
  };

  const analyzeBudgets = (budgets) => {
    if (budgets.length < 2) return;

    const analysis = {
      totalBudgets: budgets.length,
      dateRange: {
        start: budgets[0].name,
        end: budgets[budgets.length - 1].name
      },
      averageIncome: budgets.reduce((sum, b) => sum + b.income, 0) / budgets.length,
      averageExpenses: budgets.reduce((sum, b) => sum + b.totalExpenses, 0) / budgets.length,
      averageBalance: budgets.reduce((sum, b) => sum + b.balance, 0) / budgets.length,
      totalSavings: budgets.reduce((sum, b) => sum + b.balance, 0),
      expenseBreakdown: {}
    };

    // Calculate average expenses by category
    const expenseCategories = Object.keys(budgets[0].expenses);
    expenseCategories.forEach(category => {
      analysis.expenseBreakdown[category] = budgets.reduce((sum, b) => sum + b.expenses[category], 0) / budgets.length;
    });

    setAnalysis(analysis);
  };

  const removeBudget = (id) => {
    const updatedBudgets = savedBudgets.filter(budget => budget.id !== id);
    setSavedBudgets(updatedBudgets);
    localStorage.setItem('savedBudgets', JSON.stringify(updatedBudgets));
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

    const sortedBudgets = savedBudgets.sort((a, b) => new Date(a.date) - new Date(b.date));

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

      {savedBudgets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>{translations[currentLanguage]?.noBudgets || 'No saved budgets yet'}</h3>
          <p>{translations[currentLanguage]?.saveFirstBudget || 'Save your first budget in the tracker page to start comparing'}</p>
        </div>
      ) : (
        <>
          {/* Saved Budgets List */}
          <div className="saved-budgets-section">
            <h3>{translations[currentLanguage]?.savedBudgets || 'Saved Budgets'}</h3>
            <div className="budgets-grid">
              {savedBudgets.map((budget, index) => (
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
                      <span className="amount income">€{budget.income}</span>
                    </div>
                    <div className="budget-item">
                      <span>{translations[currentLanguage]?.totalExpenses || 'Expenses'}:</span>
                      <span className="amount expense">€{budget.totalExpenses}</span>
                    </div>
                    <div className="budget-item">
                      <span>{translations[currentLanguage]?.balance || 'Balance'}:</span>
                      <span className={`amount ${budget.balance >= 0 ? 'positive' : 'negative'}`}>
                        €{budget.balance}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {savedBudgets.length >= 2 && (
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