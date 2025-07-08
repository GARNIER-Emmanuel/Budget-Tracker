import React, { useState } from 'react';
import { FaWallet, FaChartPie, FaExchangeAlt, FaThLarge, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import LanguageSelector from './LanguageSelector';
import DarkModeToggle from './DarkModeToggle';
import './Sidebar.css';

function Sidebar({ currentPage, onPageChange, currentLanguage, onLanguageChange, isDarkMode, onToggleDarkMode, collapsed, setCollapsed, translations }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isCollapsed = collapsed && !mobileOpen;

  const handleCollapse = () => setCollapsed(!collapsed);
  const handleMobileToggle = () => setMobileOpen(!mobileOpen);

  const navItems = [
    { key: 'tracker', icon: <FaChartPie size={22} />, label: translations[currentLanguage]?.tracker || 'Suivi' },
    { key: 'comparison', icon: <FaExchangeAlt size={22} />, label: translations[currentLanguage]?.comparison || 'Comparaison' },
    { key: 'dashboard', icon: <FaThLarge size={22} />, label: translations[currentLanguage]?.dashboard || 'Tableau de bord' },
  ];

  return (
    <>
      <button className="sidebar-burger" onClick={handleMobileToggle} aria-label="Ouvrir la navigation">
        <span />
        <span />
        <span />
      </button>
      <aside
        className={`sidebar-modern-cd${isCollapsed ? ' collapsed' : ''}${mobileOpen ? ' open' : ''}`}
        style={{ width: isCollapsed ? 70 : 240 }}
      >
        <div className="sidebar-logo-area-cd">
          <div className="sidebar-logo-circle-cd">
            <FaWallet size={isCollapsed ? 26 : 32} />
          </div>
          {!isCollapsed && <div className="sidebar-title-cd">CDesign</div>}
        </div>
        <nav className="sidebar-nav-modern-cd">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`sidebar-nav-btn-cd${currentPage === item.key ? ' active' : ''}`}
              onClick={() => { onPageChange(item.key); setMobileOpen(false); }}
              aria-label={item.label}
            >
              <span className="sidebar-nav-icon-cd">{item.icon}</span>
              {!isCollapsed && <span className="sidebar-nav-label-cd">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-separator-cd" />
        <div className="sidebar-actions-bottom-cd">
          {!isCollapsed && <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} translations={translations} />}
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} translations={translations} currentLanguage={currentLanguage} />
        </div>
        <button className="sidebar-collapse-modern-cd" onClick={handleCollapse} aria-label="Réduire la sidebar">
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </aside>
    </>
  );
}

export default Sidebar; 