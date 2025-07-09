import React, { useState } from 'react';
import { FaPalette, FaSun, FaMoon, FaWater, FaLeaf } from 'react-icons/fa';

const ThemeSelector = ({ currentTheme, onThemeChange, translations, currentLanguage }) => {
  const t = translations[currentLanguage] || {};
  const [isOpen, setIsOpen] = useState(false);
  
  const themes = [
    {
      id: 'default',
      name: t.defaultTheme || 'Default',
      icon: <FaSun />,
      description: t.defaultThemeDesc || 'Light theme with orange accents'
    },
    {
      id: 'dark',
      name: t.darkTheme || 'Dark',
      icon: <FaMoon />,
      description: t.darkThemeDesc || 'Dark gray and black theme'
    },
    {
      id: 'blue',
      name: t.blueTheme || 'Blue',
      icon: <FaWater />,
      description: t.blueThemeDesc || 'Blue theme with ocean colors'
    },
    {
      id: 'green',
      name: t.greenTheme || 'Green',
      icon: <FaLeaf />,
      description: t.greenThemeDesc || 'Green theme with nature colors'
    }
  ];

  const handleThemeSelect = (themeId) => {
    onThemeChange(themeId);
    setIsOpen(false);
  };

  return (
    <div className="theme-selector">
      <div 
        className="theme-selector-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaPalette className="theme-icon" />
        <span className="theme-label">{t.theme || 'Theme'}</span>
      </div>
      
      {isOpen && (
        <div className="theme-options">
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeSelect(theme.id)}
              title={theme.description}
            >
              <div className="theme-option-icon">
                {theme.icon}
              </div>
              <div className="theme-option-content">
                <div className="theme-option-name">{theme.name}</div>
                <div className="theme-option-preview">
                  <div className={`theme-preview theme-preview-${theme.id}`}></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector; 