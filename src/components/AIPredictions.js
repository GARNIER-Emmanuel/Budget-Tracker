import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useBudget } from '../contexts/BudgetContext';

const AIPredictions = ({ translations, currentLanguage, isDarkMode }) => {
  const { state } = useBudget();
  const { savedBudgets, expenses } = state;
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Generate predictions based on historical data
  const generatePredictions = () => {
    setLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      // Filter valid budgets for predictions
      const validBudgets = savedBudgets.filter(budget => 
        budget &&
        typeof budget.totalExpenses === 'number' && 
        !isNaN(budget.totalExpenses) &&
        typeof budget.balance === 'number' && 
        !isNaN(budget.balance) &&
        typeof budget.income === 'number' && 
        !isNaN(budget.income) &&
        budget.expenses &&
        typeof budget.expenses === 'object'
      );
      
      const historicalData = validBudgets.slice(-6); // Last 6 months
      
      if (historicalData.length < 2) {
        setPredictions({
          error: translations[currentLanguage].insufficientData || 'Insufficient data for predictions'
        });
        setLoading(false);
        return;
      }

      // Validate current expenses
      const validCurrentExpenses = {};
      if (expenses && typeof expenses === 'object') {
        Object.entries(expenses).forEach(([key, value]) => {
          validCurrentExpenses[key] = typeof value === 'number' && !isNaN(value) ? value : 0;
        });
      }

      // Calculate trends and predictions
      const predictions = calculatePredictions(historicalData, validCurrentExpenses);
      setPredictions(predictions);
      setLoading(false);
    }, 2000);
  };

  const calculatePredictions = (historicalData, currentExpenses) => {
    const categories = {
      fixed: ['rent', 'electricity', 'internet', 'phone', 'subscriptions', 'insuranceHome', 'insuranceCar', 'gym'],
      variable: ['food', 'gas', 'catFood', 'leisure', 'shopping'],
      savings: ['savings', 'unforeseen']
    };

    const predictions = {
      nextMonth: {},
      trends: {},
      insights: [],
      chartData: {
        labels: [],
        datasets: []
      }
    };

    // Calculate trends for each category
    Object.entries(categories).forEach(([categoryType, expenseKeys]) => {
      const categoryData = historicalData.map(budget => {
        if (!budget.expenses || typeof budget.expenses !== 'object') {
          return 0;
        }
        const total = expenseKeys.reduce((sum, key) => {
          const value = budget.expenses[key];
          return sum + (typeof value === 'number' && !isNaN(value) ? value : 0);
        }, 0);
        return total;
      }).filter(value => typeof value === 'number' && !isNaN(value));

      if (categoryData.length >= 2) {
        const trend = calculateTrend(categoryData);
        const currentTotal = expenseKeys.reduce((sum, key) => {
          const value = currentExpenses[key];
          return sum + (typeof value === 'number' && !isNaN(value) ? value : 0);
        }, 0);
        
        // Ensure currentTotal is valid
        const validCurrentTotal = typeof currentTotal === 'number' && !isNaN(currentTotal) ? currentTotal : 0;
        const validTrend = typeof trend === 'number' && !isNaN(trend) ? trend : 0;
        const predictedNext = validCurrentTotal * (1 + validTrend);

        // Calculate percentage change safely
        let changePercent = 0;
        if (validCurrentTotal > 0) {
          changePercent = ((predictedNext - validCurrentTotal) / validCurrentTotal * 100);
        }

        predictions.trends[categoryType] = {
          current: validCurrentTotal,
          predicted: predictedNext,
          trend: validTrend,
          change: changePercent.toFixed(1)
        };

        // Add insights
        if (validTrend > 0.05) {
          predictions.insights.push({
            type: 'warning',
            message: translations[currentLanguage][`${categoryType}TrendWarning`] || 
                     `${categoryType} expenses are trending upward`
          });
        } else if (validTrend < -0.05) {
          predictions.insights.push({
            type: 'positive',
            message: translations[currentLanguage][`${categoryType}TrendPositive`] || 
                     `${categoryType} expenses are decreasing`
          });
        }
      }
    });

    // Generate chart data with validation
    const months = historicalData.map(budget => budget.month || 'Unknown').filter(month => month);
    const totalExpenses = historicalData.map(budget => {
      const value = budget.totalExpenses;
      return typeof value === 'number' && !isNaN(value) ? value : 0;
    }).filter(value => value > 0); // Only include positive values
    
    if (totalExpenses.length > 0) {
      const lastValue = totalExpenses[totalExpenses.length - 1];
      const predictedValue = typeof lastValue === 'number' && !isNaN(lastValue) ? lastValue * 1.02 : 0;
      
      predictions.chartData = {
        labels: [...months, 'Next Month'],
        datasets: [
          {
            label: translations[currentLanguage].actualExpenses || 'Actual Expenses',
            data: totalExpenses,
            borderColor: isDarkMode ? '#60a5fa' : '#3b82f6',
            backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          },
          {
            label: translations[currentLanguage].predictedExpenses || 'Predicted Expenses',
            data: [...totalExpenses, predictedValue],
            borderColor: isDarkMode ? '#f59e0b' : '#f97316',
            backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(249, 115, 22, 0.1)',
            borderDash: [5, 5],
            tension: 0.4
          }
        ]
      };
    }

    return predictions;
  };

  const calculateTrend = (data) => {
    if (!Array.isArray(data) || data.length < 2) return 0;
    
    // Filter out invalid values
    const validData = data.filter(value => typeof value === 'number' && !isNaN(value) && value > 0);
    
    if (validData.length < 2) return 0;
    
    const recent = validData.slice(-3);
    const older = validData.slice(-6, -3);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    // Avoid division by zero
    if (olderAvg === 0) return 0;
    
    const trend = (recentAvg - olderAvg) / olderAvg;
    
    // Return valid trend or 0
    return typeof trend === 'number' && !isNaN(trend) ? trend : 0;
  };

  useEffect(() => {
    // Only generate predictions if we have valid budgets
    const validBudgets = savedBudgets.filter(budget => 
      typeof budget.totalExpenses === 'number' && 
      !isNaN(budget.totalExpenses) &&
      typeof budget.balance === 'number' && 
      !isNaN(budget.balance) &&
      typeof budget.income === 'number' && 
      !isNaN(budget.income)
    );
    
    if (validBudgets.length >= 2) {
      generatePredictions();
    }
  }, [savedBudgets]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#374151'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: isDarkMode ? '#e5e7eb' : '#374151'
        },
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb'
        }
      },
      y: {
        ticks: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          callback: function(value) {
            return '€' + value;
          }
        },
        grid: {
          color: isDarkMode ? '#374151' : '#e5e7eb'
        }
      }
    }
  };

  if (!predictions && !loading) {
    return (
      <div className="card">
        <h2>🤖 {translations[currentLanguage].aiPredictions || 'AI Predictions'}</h2>
        <div className="empty-state">
          <p>{translations[currentLanguage].noDataForPredictions || 'No data available for predictions'}</p>
          <button 
            onClick={generatePredictions}
            className="primary-button"
            disabled={savedBudgets.length < 2}
          >
            {translations[currentLanguage].generatePredictions || 'Generate Predictions'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <h2>🤖 {translations[currentLanguage].aiPredictions || 'AI Predictions'}</h2>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{translations[currentLanguage].analyzingData || 'Analyzing your data...'}</p>
        </div>
      </div>
    );
  }

  if (predictions.error) {
    return (
      <div className="card">
        <h2>🤖 {translations[currentLanguage].aiPredictions || 'AI Predictions'}</h2>
        <div className="error-state">
          <p>{predictions.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>🤖 {translations[currentLanguage].aiPredictions || 'AI Predictions'}</h2>
      
      {/* Insights */}
      {predictions.insights.length > 0 && (
        <div className="insights-section">
          <h3>{translations[currentLanguage].aiInsights || 'AI Insights'}</h3>
          <div className="insights-grid">
            {predictions.insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <span className="insight-icon">
                  {insight.type === 'warning' ? '⚠️' : '✅'}
                </span>
                <p>{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends */}
      <div className="trends-section">
        <h3>{translations[currentLanguage].expenseTrends || 'Expense Trends'}</h3>
        <div className="trends-grid">
          {Object.entries(predictions.trends).map(([category, data]) => {
            // Validate data before rendering
            const current = typeof data.current === 'number' && !isNaN(data.current) ? data.current : 0;
            const predicted = typeof data.predicted === 'number' && !isNaN(data.predicted) ? data.predicted : 0;
            const change = typeof data.change === 'string' ? parseFloat(data.change) : 0;
            const isValidChange = !isNaN(change);
            
            return (
              <div key={category} className="trend-card">
                <h4>{translations[currentLanguage][category] || category}</h4>
                <div className="trend-data">
                  <div className="trend-current">
                    <span>{translations[currentLanguage].current || 'Current'}</span>
                    <strong>€{current.toFixed(2)}</strong>
                  </div>
                  <div className="trend-predicted">
                    <span>{translations[currentLanguage].predicted || 'Predicted'}</span>
                    <strong>€{predicted.toFixed(2)}</strong>
                  </div>
                  <div className={`trend-change ${isValidChange && change > 0 ? 'positive' : 'negative'}`}>
                    <span>{isValidChange ? (change > 0 ? '+' : '') + change.toFixed(1) : '0.0'}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      {predictions.chartData && predictions.chartData.labels && predictions.chartData.labels.length > 0 && (
        <div className="chart-section">
          <h3>{translations[currentLanguage].expenseForecast || 'Expense Forecast'}</h3>
          <div className="chart-container" style={{ height: '300px' }}>
            <Line data={predictions.chartData} options={chartOptions} />
          </div>
        </div>
      )}

      <button 
        onClick={generatePredictions}
        className="secondary-button"
        style={{ marginTop: '1rem' }}
      >
        🔄 {translations[currentLanguage].refreshPredictions || 'Refresh Predictions'}
      </button>
    </div>
  );
};

export default AIPredictions; 