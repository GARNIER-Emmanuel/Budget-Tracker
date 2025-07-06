import React, { useState } from 'react';
import ExpenseInput from './ExpenseInput';

const CollapsibleExpenseCategory = ({ 
  category, 
  expenseKeys, 
  expenses, 
  onExpenseChange, 
  sharedExpenses, 
  onSharedChange, 
  translations, 
  currentLanguage 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="collapsible-card" style={{ marginBottom: '1.5rem' }}>
      <div 
        className={`collapsible-header ${!isExpanded ? 'collapsed' : ''}`}
        onClick={toggleExpanded}
      >
        <h3>{category}</h3>
        <div className="collapsible-toggle">
          <span>{isExpanded ? translations[currentLanguage].hide || 'Hide' : translations[currentLanguage].show || 'Show'}</span>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </div>
      </div>
      
      {isExpanded && (
        <div className="collapsible-content">
          {expenseKeys.map(key => (
            <ExpenseInput
              key={key}
              label={key}
              value={expenses[key]}
              onChange={(value) => onExpenseChange(key, value)}
              isShared={['rent', 'apl', 'electricity', 'internet', 'insuranceHome', 'food', 'catFood'].includes(key)}
              onSharedChange={(isShared) => onSharedChange(key, isShared)}
              sharedValue={sharedExpenses[key]}
              translations={translations}
              currentLanguage={currentLanguage}
              isApl={key === 'apl'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollapsibleExpenseCategory; 