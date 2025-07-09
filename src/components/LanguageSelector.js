import React from 'react';

const LanguageSelector = ({ currentLanguage, onLanguageChange, translations }) => {
  const t = translations[currentLanguage] || {};
  
  return (
    <div className="language-selector">
      <label htmlFor="language-select" className="language-label">
        {t.language || 'Language'}:
      </label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="language-select"
      >
        <option value="en">{t.english || 'English'}</option>
        <option value="fr">{t.french || 'French'}</option>
      </select>
    </div>
  );
};

export default LanguageSelector; 