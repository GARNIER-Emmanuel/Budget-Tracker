import React, { useState } from 'react';
import { FaChartPie, FaThLarge, FaExchangeAlt, FaWallet, FaBars, FaTimes } from 'react-icons/fa';
import LanguageSelector from './LanguageSelector';
import DarkModeToggle from './DarkModeToggle';

const Navigation = ({ 
  currentPage, 
  onPageChange, 
  translations, 
  currentLanguage,
  onLanguageChange,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      key: 'tracker',
      icon: <FaChartPie />,
      label: translations[currentLanguage]?.tracker || 'Saisie Dépenses',
      description: translations[currentLanguage]?.trackerDescription || 'Gérer vos dépenses'
    },
    {
      key: 'dashboard',
      icon: <FaThLarge />,
      label: translations[currentLanguage]?.customizableDashboard || 'Dashboard',
      description: translations[currentLanguage]?.dashboardDescription || 'Vue d\'ensemble'
    },
    {
      key: 'comparison',
      icon: <FaExchangeAlt />,
      label: translations[currentLanguage]?.comparison || 'Budgets Sauvegardés',
      description: translations[currentLanguage]?.comparisonDescription || 'Comparer vos budgets'
    }
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = (page) => {
    onPageChange(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="mobile-menu-button"
        onClick={toggleMobileMenu}
        aria-label="Menu"
      >
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Navigation */}
      <nav className={`modern-navigation ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Logo/Brand */}
        <div className="nav-brand">
          <div className="brand-icon">
            <FaWallet />
          </div>
          <div className="brand-text">
            <h1>BudgetTracker</h1>
            <span>Finance Management</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="nav-items">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`nav-item ${currentPage === item.key ? 'active' : ''}`}
              onClick={() => handleNavClick(item.key)}
              title={item.description}
            >
              <div className="nav-item-icon">
                {item.icon}
              </div>
              <div className="nav-item-content">
                <span className="nav-item-label">{item.label}</span>
                <span className="nav-item-description">{item.description}</span>
              </div>
              {currentPage === item.key && <div className="nav-item-indicator" />}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="nav-actions">
          <LanguageSelector 
            currentLanguage={currentLanguage} 
            onLanguageChange={onLanguageChange} 
            translations={translations} 
          />
          <DarkModeToggle 
            isDarkMode={isDarkMode} 
            onToggle={onToggleDarkMode} 
            translations={translations} 
            currentLanguage={currentLanguage} 
          />
        </div>
      </nav>
    </>
  );
};

export default Navigation; 