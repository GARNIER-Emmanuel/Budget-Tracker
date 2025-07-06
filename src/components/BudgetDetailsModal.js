import React from 'react';

const BudgetDetailsModal = ({ budget, isOpen, onClose, translations, currentLanguage }) => {
  if (!isOpen || !budget) return null;

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
                <span className="amount income">€{budget.income}</span>
              </div>
              <div className="summary-item">
                <span>{translations[currentLanguage]?.totalExpenses || 'Total Expenses'}:</span>
                <span className="amount expense">€{budget.totalExpenses}</span>
              </div>
              <div className="summary-item">
                <span>{translations[currentLanguage]?.balance || 'Balance'}:</span>
                <span className={`amount ${budget.balance >= 0 ? 'positive' : 'negative'}`}>
                  €{budget.balance}
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
                      <span className="expense-amount">€{budget.expenses[key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

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