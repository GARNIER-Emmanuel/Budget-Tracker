import React from 'react';

// Component to display expense summary and balance
const ExpenseSummary = ({ totalExpenses, balance, income, translations, currentLanguage }) => {
  const isPositive = balance >= 0;
  
  return (
    <div className="card">
      <h3>{translations[currentLanguage].monthlySummary}</h3>
      
      <div className="summary-grid">
        {/* Income */}
        <div className="summary-card income">
          <div className="amount">€{income.toFixed(2)}</div>
          <div className="label">{translations[currentLanguage].monthlyIncome}</div>
        </div>
        
        {/* Total Expenses */}
        <div className="summary-card expenses">
          <div className="amount">€{totalExpenses.toFixed(2)}</div>
          <div className="label">{translations[currentLanguage].totalExpenses}</div>
        </div>
        
        {/* Balance */}
        <div className={`summary-card balance ${!isPositive ? 'negative' : ''}`}>
          <div className="amount">€{balance.toFixed(2)}</div>
          <div className="label">
            {isPositive ? translations[currentLanguage].remainingBalance : translations[currentLanguage].deficit}
          </div>
        </div>
      </div>
      
      {/* Progress bar showing income vs expenses */}
      <div className="progress-container">
        <div className="progress-labels">
          <span>Expenses: {((totalExpenses / income) * 100).toFixed(1)}%</span>
          <span>Remaining: {((balance / income) * 100).toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${Math.min((totalExpenses / income) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary; 