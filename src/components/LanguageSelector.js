import React from 'react';

const LanguageSelector = ({ currentLanguage, onLanguageChange, translations }) => {
  return (
    <div className="language-selector">
      <label htmlFor="language-select" className="language-label">
        {translations[currentLanguage].language}:
      </label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="language-select"
      >
        <option value="en">{translations[currentLanguage].english}</option>
        <option value="fr">{translations[currentLanguage].french}</option>
      </select>
    </div>
  );
};

export default LanguageSelector; 