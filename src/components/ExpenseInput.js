import React, { useState, useEffect } from 'react';

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
  const [inputValue, setInputValue] = useState(value === 0 ? '' : String(value));

  useEffect(() => {
    // Met à jour le champ si la valeur externe change (ex: reset)
    setInputValue(value === 0 ? '' : String(value));
  }, [value]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    // Conversion lors de la perte de focus
    const val = inputValue.replace(',', '.');
    const num = Number(val);
    onChange(isNaN(num) ? 0 : num);
    setInputValue(isNaN(num) || num === 0 ? '' : String(num));
  };

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
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`input-field ${isApl ? 'apl-input' : ''}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseInput; 