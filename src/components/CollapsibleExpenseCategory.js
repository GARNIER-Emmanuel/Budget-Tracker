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
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Calculate total for this category
  const calculateCategoryTotal = () => {
    return expenseKeys.reduce((total, key) => {
      const value = expenses[key] || 0;
      const isShared = sharedExpenses[key];
      
      // Special handling for APL (housing allowance)
      if (key === 'apl') {
        const aplReduction = isShared ? value / 2 : value;
        return total - aplReduction;
      }
      
      // If shared, divide by 2 (assuming equal split)
      const adjustedValue = isShared ? value / 2 : value;
      return total + adjustedValue;
    }, 0);
  };

  const categoryTotal = calculateCategoryTotal();

  return (
    <div className="collapsible-card" style={{ marginBottom: '0' }}>
      <div 
        className={`collapsible-header ${!isExpanded ? 'collapsed' : ''}`}
        onClick={toggleExpanded}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <h3>{category}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <div style={{ 
              fontSize: 'var(--font-size-sm)', 
              fontWeight: 600, 
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-1)'
            }}>
              <span>{translations[currentLanguage]?.total || 'Total'}:</span>
              <span style={{ 
                color: categoryTotal > 0 ? 'var(--error-color)' : 'var(--text-tertiary)',
                fontWeight: 700
              }}>
                €{categoryTotal.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
              </span>
            </div>
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
        </div>
      </div>
      
      {isExpanded && (
        <div className="collapsible-content">
          {expenseKeys.map(key => (
            <div key={key} style={{ marginBottom: '1rem' }}>
              <ExpenseInput
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollapsibleExpenseCategory; 