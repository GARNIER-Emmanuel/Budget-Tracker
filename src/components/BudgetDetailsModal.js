import React from 'react';

const BudgetDetailsModal = ({ budget, isOpen, onClose, translations, currentLanguage }) => {
  if (!isOpen || !budget) return null;

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

  const expenseCategories = {
    [translations[currentLanguage]?.fixedExpenses || 'Fixed Expenses']: ['rent', 'apl', 'electricity', 'internet', 'phone', 'subscriptions', 'insuranceHome', 'insuranceCar', 'gym'],
    [translations[currentLanguage]?.variableExpenses || 'Variable Expenses']: ['food', 'gas', 'catFood', 'leisure', 'shopping'],
    [translations[currentLanguage]?.savingsEmergency || 'Savings & Emergency']: ['savings', 'unforeseen']
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{budget.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Summary */}
          <div className="budget-summary-section">
            <h3>{translations[currentLanguage]?.monthlySummary || 'Monthly Summary'}</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span>{translations[currentLanguage]?.income || 'Income'}:</span>
                <span className="amount income">€{income.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>{translations[currentLanguage]?.totalExpenses || 'Total Expenses'}:</span>
                <span className="amount expense">€{totalExpenses.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>{translations[currentLanguage]?.balance || 'Balance'}:</span>
                <span className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
                  €{balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Expenses */}
          <div className="expenses-details">
            <h3>{translations[currentLanguage]?.expenseBreakdown || 'Expense Breakdown'}</h3>
            
            {Object.entries(expenseCategories).map(([category, expenseKeys]) => (
              <div key={category} className="expense-category">
                <h4>{category}</h4>
                <div className="expense-list">
                  {expenseKeys.map(key => (
                    <div key={key} className="expense-item">
                      <div className="expense-info">
                        <span className="expense-label">
                          {translations[currentLanguage]?.[key] || key}
                        </span>
                        {budget.sharedExpenses && budget.sharedExpenses[key] && (
                          <span className="shared-badge">
                            {translations[currentLanguage]?.shared || 'Shared'}
                          </span>
                        )}
                      </div>
                      <span className="expense-amount">€{(budget.expenses[key] || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Financial Goals Information */}
          {budget.goalAchievements && (
            <div className="goals-info">
              <h3>{translations[currentLanguage]?.financialGoals || 'Financial Goals'}</h3>
              <div className="goals-details">
                <div className="goal-detail">
                  <div className="goal-header">
                    <span>{translations[currentLanguage]?.monthlySavingsGoal || 'Monthly Savings Goal'}</span>
                    <span className={`goal-status ${budget.goalAchievements.monthlySavings.achieved ? 'achieved' : 'not-achieved'}`}>
                      {budget.goalAchievements.monthlySavings.achieved ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${budget.goalAchievements.monthlySavings.progress}%`,
                          backgroundColor: budget.goalAchievements.monthlySavings.achieved ? '#10b981' : '#ef4444'
                        }}
                      />
                    </div>
                    <div className="goal-values">
                      <span>€{budget.goalAchievements.monthlySavings.current.toFixed(2)}</span>
                      <span>/</span>
                      <span>€{budget.goalAchievements.monthlySavings.target.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="goal-detail">
                  <div className="goal-header">
                    <span>{translations[currentLanguage]?.leisureSpendingLimit || 'Leisure Spending Limit'}</span>
                    <span className={`goal-status ${budget.goalAchievements.maxLeisureSpending.achieved ? 'achieved' : 'not-achieved'}`}>
                      {budget.goalAchievements.maxLeisureSpending.achieved ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${budget.goalAchievements.maxLeisureSpending.progress}%`,
                          backgroundColor: budget.goalAchievements.maxLeisureSpending.achieved ? '#10b981' : '#ef4444'
                        }}
                      />
                    </div>
                    <div className="goal-values">
                      <span>€{budget.goalAchievements.maxLeisureSpending.current.toFixed(2)}</span>
                      <span>/</span>
                      <span>€{budget.goalAchievements.maxLeisureSpending.target.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="goal-detail">
                  <div className="goal-header">
                    <span>{translations[currentLanguage]?.emergencyFund || 'Emergency Fund'}</span>
                    <span className={`goal-status ${budget.goalAchievements.emergencyFundTarget.achieved ? 'achieved' : 'not-achieved'}`}>
                      {budget.goalAchievements.emergencyFundTarget.achieved ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${budget.goalAchievements.emergencyFundTarget.progress}%`,
                          backgroundColor: budget.goalAchievements.emergencyFundTarget.achieved ? '#10b981' : '#ef4444'
                        }}
                      />
                    </div>
                    <div className="goal-values">
                      <span>€{budget.goalAchievements.emergencyFundTarget.current.toFixed(2)}</span>
                      <span>/</span>
                      <span>€{budget.goalAchievements.emergencyFundTarget.target.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Date Information */}
          <div className="date-info">
            <p><strong>{translations[currentLanguage]?.savedOn || 'Saved on'}:</strong> {new Date(budget.date).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetDetailsModal; 