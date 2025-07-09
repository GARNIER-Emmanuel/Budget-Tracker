import React from 'react';
import { FaGlobe } from 'react-icons/fa';

const LanguageSelector = ({ currentLanguage, onLanguageChange, translations }) => {
  const t = translations[currentLanguage] || {};
  
  const handleLanguageToggle = () => {
    const newLanguage = currentLanguage === 'fr' ? 'en' : 'fr';
    onLanguageChange(newLanguage);
  };
  
  return (
    <button
      className="language-toggle"
      onClick={handleLanguageToggle}
      title={currentLanguage === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      <FaGlobe className="language-icon" />
      <span className="language-label">{currentLanguage.toUpperCase()}</span>
    </button>
  );
};

export default LanguageSelector; 