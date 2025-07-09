import React, { useState } from 'react';
import { FaPalette, FaCheck } from 'react-icons/fa';

const ThemeSelector = ({ currentTheme, onThemeChange, translations, currentLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    {
      id: 'default',
      name: translations[currentLanguage]?.defaultTheme || 'Par défaut',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }
    },
    {
      id: 'blue',
      name: translations[currentLanguage]?.blueTheme || 'Bleu',
      colors: {
        primary: '#3b82f6',
        secondary: '#1d4ed8',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
      }
    },
    {
      id: 'green',
      name: translations[currentLanguage]?.greenTheme || 'Vert',
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      }
    },
    {
      id: 'orange',
      name: translations[currentLanguage]?.orangeTheme || 'Orange',
      colors: {
        primary: '#f59e0b',
        secondary: '#d97706',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      }
    },
    {
      id: 'gray',
      name: translations[currentLanguage]?.grayTheme || 'Gris',
      colors: {
        primary: '#6b7280',
        secondary: '#4b5563',
        gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
      }
    }
  ];

  const handleThemeSelect = (theme) => {
    onThemeChange(theme);
    setIsOpen(false);
  };

  const currentThemeData = themes.find(theme => theme.id === currentTheme) || themes[0];

  return (
    <div className="theme-selector">
      <button
        className="theme-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={translations[currentLanguage]?.selectTheme || 'Sélectionner un thème'}
      >
        <FaPalette className="theme-icon" />
        <span className="theme-label">{translations[currentLanguage]?.theme || 'Thème'}</span>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeSelect(theme)}
            >
              <div 
                className="theme-preview"
                style={{ background: theme.colors.gradient }}
              />
              <span className="theme-name">{theme.name}</span>
              {currentTheme === theme.id && <FaCheck className="theme-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector; 