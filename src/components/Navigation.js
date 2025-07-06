import React from 'react';

const Navigation = ({ currentPage, onPageChange, translations, currentLanguage }) => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <button
          className={`nav-button ${currentPage === 'tracker' ? 'active' : ''}`}
          onClick={() => onPageChange('tracker')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
          </svg>
          {translations[currentLanguage].budgetTracker || 'Budget Tracker'}
        </button>
        <button
          className={`nav-button ${currentPage === 'comparison' ? 'active' : ''}`}
          onClick={() => onPageChange('comparison')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9,2V4H7V2H9M13,2V4H11V2H13M17,2V4H15V2H17M19,6V8H5V6H3V10H5V12H3V16H5V18H3V22H5V20H7V22H9V20H11V22H13V20H15V22H17V20H19V22H21V18H19V16H21V12H19V10H21V6H19M7,10H9V12H7V10M11,10H13V12H11V10M15,10H17V12H15V10M7,16H9V18H7V16M11,16H13V18H11V16M15,16H17V18H15V16Z"/>
          </svg>
          {translations[currentLanguage].budgetComparison || 'Budget Comparison'}
        </button>

      </div>
    </nav>
  );
};

export default Navigation; 