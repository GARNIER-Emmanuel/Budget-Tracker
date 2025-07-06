import React from 'react';

// Component for individual expense input fields
const ExpenseInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "0", 
  isShared = false,
  onSharedChange,
  sharedValue = false,
  translations,
  currentLanguage,
  isApl = false
}) => {
  return (
    <div className={`card ${isApl ? 'apl-card' : ''}`}>
      <div className="input-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className="input-group label">
            {translations[currentLanguage][label] || label.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          {isShared && (
            <div className="checkbox-group">
              <input
                type="checkbox"
                id={`shared-${label}`}
                checked={sharedValue}
                onChange={(e) => onSharedChange(e.target.checked)}
              />
              <label htmlFor={`shared-${label}`}>
                {translations[currentLanguage].shared}
              </label>
            </div>
          )}
        </div>
        <div className="input-wrapper">
          <span className="currency">{isApl ? '-' : '€'}</span>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            placeholder={placeholder}
            className={`input-field ${isApl ? 'apl-input' : ''}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseInput; 