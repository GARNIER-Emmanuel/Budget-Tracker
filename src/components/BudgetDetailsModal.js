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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)', paddingBottom: 'var(--spacing-4)', borderBottom: '1px solid var(--gray-200)' }}>
          <h2 className="heading-2">{budget.name}</h2>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', padding: 'var(--spacing-2)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Summary */}
          <div className="card mb-6">
            <h3 className="heading-3 mb-4">{translations[currentLanguage]?.monthlySummary || 'Monthly Summary'}</h3>
            <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-4)' }}>
              <div className="summary-item" style={{ textAlign: 'center', padding: 'var(--spacing-4)', background: 'var(--gray-50)', borderRadius: 'var(--border-radius-md)' }}>
                <div className="text-secondary text-sm mb-1">{translations[currentLanguage]?.income || 'Income'}</div>
                <div className="text-body text-bold" style={{ color: 'var(--success-color)', fontSize: 'var(--font-size-lg)' }}>€{income.toFixed(2)}</div>
              </div>
              <div className="summary-item" style={{ textAlign: 'center', padding: 'var(--spacing-4)', background: 'var(--gray-50)', borderRadius: 'var(--border-radius-md)' }}>
                <div className="text-secondary text-sm mb-1">{translations[currentLanguage]?.totalExpenses || 'Total Expenses'}</div>
                <div className="text-body text-bold" style={{ color: 'var(--error-color)', fontSize: 'var(--font-size-lg)' }}>€{totalExpenses.toFixed(2)}</div>
              </div>
              <div className="summary-item" style={{ textAlign: 'center', padding: 'var(--spacing-4)', background: 'var(--gray-50)', borderRadius: 'var(--border-radius-md)' }}>
                <div className="text-secondary text-sm mb-1">{translations[currentLanguage]?.balance || 'Balance'}</div>
                <div className="text-body text-bold" style={{ color: balance >= 0 ? 'var(--success-color)' : 'var(--error-color)', fontSize: 'var(--font-size-lg)' }}>
                  €{balance.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Expenses */}
          <div className="expenses-details mb-6">
            <h3 className="heading-3 mb-4">{translations[currentLanguage]?.expenseBreakdown || 'Expense Breakdown'}</h3>
            
            {Object.entries(expenseCategories).map(([category, expenseKeys]) => (
              <div key={category} className="card mb-4">
                <h4 className="heading-2 mb-3">{category}</h4>
                <div className="expense-list">
                  {expenseKeys.map(key => (
                    <div key={key} className="expense-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-2) 0', borderBottom: '1px solid var(--gray-100)' }}>
                      <div className="expense-info" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                        <span className="text-body">
                          {translations[currentLanguage]?.[key] || key}
                        </span>
                        {budget.sharedExpenses && budget.sharedExpenses[key] && (
                          <span className="shared-badge" style={{ 
                            background: 'var(--primary-color)', 
                            color: 'var(--text-inverse)', 
                            padding: 'var(--spacing-1) var(--spacing-2)', 
                            borderRadius: 'var(--border-radius-sm)', 
                            fontSize: 'var(--font-size-xs)', 
                            fontWeight: 600 
                          }}>
                            {translations[currentLanguage]?.shared || 'Shared'}
                          </span>
                        )}
                      </div>
                      <span className="text-body text-bold">€{(budget.expenses[key] || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Financial Goals Information */}
          {budget.goalAchievements && (
            <div className="goals-info mb-6">
              <h3 className="heading-3 mb-4">{translations[currentLanguage]?.financialGoals || 'Financial Goals'}</h3>
              <div className="goals-details">
                <div className="goal-detail card mb-4">
                  <div className="goal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                    <span className="text-body text-semibold">{translations[currentLanguage]?.monthlySavingsGoal || 'Monthly Savings Goal'}</span>
                    <span className={`goal-status ${budget.goalAchievements.monthlySavings.achieved ? 'achieved' : 'not-achieved'}`} style={{ fontSize: 'var(--font-size-lg)' }}>
                      {budget.goalAchievements.monthlySavings.achieved ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar" style={{ height: '8px', marginBottom: 'var(--spacing-2)' }}>
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${budget.goalAchievements.monthlySavings.progress}%`,
                          backgroundColor: budget.goalAchievements.monthlySavings.achieved ? 'var(--success-color)' : 'var(--error-color)'
                        }}
                      />
                    </div>
                    <div className="goal-values" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      <span>€{budget.goalAchievements.monthlySavings.current.toFixed(2)}</span>
                      <span>/</span>
                      <span>€{budget.goalAchievements.monthlySavings.target.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="goal-detail card mb-4">
                  <div className="goal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                    <span className="text-body text-semibold">{translations[currentLanguage]?.leisureSpendingLimit || 'Leisure Spending Limit'}</span>
                    <span className={`goal-status ${budget.goalAchievements.maxLeisureSpending.achieved ? 'achieved' : 'not-achieved'}`} style={{ fontSize: 'var(--font-size-lg)' }}>
                      {budget.goalAchievements.maxLeisureSpending.achieved ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar" style={{ height: '8px', marginBottom: 'var(--spacing-2)' }}>
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${budget.goalAchievements.maxLeisureSpending.progress}%`,
                          backgroundColor: budget.goalAchievements.maxLeisureSpending.achieved ? 'var(--success-color)' : 'var(--error-color)'
                        }}
                      />
                    </div>
                    <div className="goal-values" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      <span>€{budget.goalAchievements.maxLeisureSpending.current.toFixed(2)}</span>
                      <span>/</span>
                      <span>€{budget.goalAchievements.maxLeisureSpending.target.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="goal-detail card mb-4">
                  <div className="goal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                    <span className="text-body text-semibold">{translations[currentLanguage]?.emergencyFund || 'Emergency Fund'}</span>
                    <span className={`goal-status ${budget.goalAchievements.emergencyFundTarget.achieved ? 'achieved' : 'not-achieved'}`} style={{ fontSize: 'var(--font-size-lg)' }}>
                      {budget.goalAchievements.emergencyFundTarget.achieved ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar" style={{ height: '8px', marginBottom: 'var(--spacing-2)' }}>
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${budget.goalAchievements.emergencyFundTarget.progress}%`,
                          backgroundColor: budget.goalAchievements.emergencyFundTarget.achieved ? 'var(--success-color)' : 'var(--error-color)'
                        }}
                      />
                    </div>
                    <div className="goal-values" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
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
          <div className="date-info" style={{ textAlign: 'center', padding: 'var(--spacing-4)', background: 'var(--gray-50)', borderRadius: 'var(--border-radius-md)' }}>
            <p className="text-body text-secondary">
              <span className="text-semibold">{translations[currentLanguage]?.savedOn || 'Saved on'}:</span> {new Date(budget.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetDetailsModal; 