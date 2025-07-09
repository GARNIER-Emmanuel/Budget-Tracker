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
  const { state, dispatch } = useBudget();
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

  const prepareChartData = (type = 'all') => {
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

    if (type === 'balance') {
      return {
        labels: sortedBudgets.map(b => b.name),
        datasets: [
          {
            label: t.balance || 'Balance',
            data: sortedBudgets.map(b => b.balance),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1
          }
        ]
      };
    }

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
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: isLineChart ? 'top' : 'bottom',
        labels: {
          color: 'var(--text-primary)',
          font: { size: 12, weight: '500' },
          padding: 8,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: 'var(--bg-primary)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-primary)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
      }
    },
    scales: isLineChart ? {
      y: { 
        beginAtZero: true,
        ticks: {
          color: 'var(--text-primary)',
          font: { size: 11 }
        },
        grid: {
          color: 'var(--border-color)',
        }
      },
      x: {
        ticks: {
          color: 'var(--text-primary)',
          font: { size: 11 }
        },
        grid: {
          color: 'var(--border-color)',
        }
      }
    } : undefined
  });

  const chartData = prepareChartData();

  return (
    <div className="comparison-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{t.comparisonTitle || 'Budget Comparison'}</h1>
        <p className="page-description">{t.comparisonSubtitle || 'Analysez l\'évolution de vos finances sur plusieurs mois'}</p>
      </div>

      {/* Charts Section */}
      {analysis && (
        <div className="section">
          <h2 className="heading-2">{t.chartsTitle || 'Graphiques d\'évolution'}</h2>
          <div className="charts-container">
            <div className="card">
              <h3 className="heading-3">{t.expenseTrend || 'Évolution des finances'}</h3>
              <div className="chart-container">
                <Line data={prepareChartData()} options={getChartOptions(true)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget List Section */}
      <div className="section">
        <div className="budget-list-header">
                      <h2 className="heading-2">{t.budgetList || 'Budget List'}</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowBudgetsMobile(!showBudgetsMobile)}
          >
            {showBudgetsMobile ? t.hideBudgets : t.showBudgets}
          </button>
        </div>

        <div className="budget-grid">
          {state.savedBudgets.map((budget, index) => (
            <div key={budget.id || index} className="card">
              <div className="budget-header">
                <h3 className="heading-3">{budget.name}</h3>
                <div className="budget-actions">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => showBudgetDetails(budget)}
                  >
                    {t.view || 'Voir'}
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => removeBudget(budget.id)}
                  >
                    {t.delete || 'Supprimer'}
                  </button>
                </div>
              </div>
              
              <div className="budget-summary">
                <div className="summary-item">
                  <div className="summary-label">{t.income || 'Revenus'}</div>
                  <div className="summary-value success">
                    €{(budget.income || 0).toFixed(2)}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">{t.expenses || 'Dépenses'}</div>
                  <div className="summary-value error">
                    €{(budget.totalExpenses || 0).toFixed(2)}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">{t.balance || 'Solde'}</div>
                  <div className={`summary-value ${(budget.balance || 0) >= 0 ? 'success' : 'error'}`}>
                    €{(budget.balance || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analysis Section */}
      {detailedComparison && (
        <div className="section">
          <h2 className="heading-2">{t.detailedAnalysis || 'Analyse détaillée'}</h2>
          
          {/* Trends Summary */}
          <div className="trends-summary card">
            <h3 className="heading-3">{t.trendsSummary || 'Résumé des tendances'}</h3>
            <div className="trends-grid">
              <div className="trend-item">
                <div className="summary-label">{t.income || 'Revenus'}</div>
                <div className={`summary-value ${detailedComparison.trends.income.trend === 'increase' ? 'success' : 'error'}`}>
                  {detailedComparison.trends.income.change > 0 ? '+' : ''}{detailedComparison.trends.income.change.toFixed(1)}%
                </div>
              </div>
              <div className="trend-item">
                <div className="summary-label">{t.expenses || 'Dépenses'}</div>
                <div className={`summary-value ${detailedComparison.trends.expenses.trend === 'decrease' ? 'success' : 'error'}`}>
                  {detailedComparison.trends.expenses.change > 0 ? '+' : ''}{detailedComparison.trends.expenses.change.toFixed(1)}%
                </div>
              </div>
              <div className="trend-item">
                <div className="summary-label">{t.balance || 'Solde'}</div>
                <div className={`summary-value ${detailedComparison.trends.balance.trend === 'increase' ? 'success' : 'error'}`}>
                  {detailedComparison.trends.balance.change > 0 ? '+' : ''}{detailedComparison.trends.balance.change.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {detailedComparison.recommendations.length > 0 && (
            <div className="recommendations card">
              <h3 className="heading-3">{t.recommendations || 'Recommandations'}</h3>
              <div className="recommendations-list">
                {detailedComparison.recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-item">
                    <span className="recommendation-icon">💡</span>
                    <span className="recommendation-text">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
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