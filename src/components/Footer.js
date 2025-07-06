import React from 'react';

const Footer = ({ translations, currentLanguage }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>{translations[currentLanguage]?.appName || 'Budget Tracker'}</h4>
          <p>{translations[currentLanguage]?.footerDescription || 'Your personal finance companion for better budgeting and financial planning.'}</p>
        </div>
        
        <div className="footer-section">
          <h4>{translations[currentLanguage]?.features || 'Features'}</h4>
          <ul>
            <li>{translations[currentLanguage]?.monthlyTracking || 'Monthly Budget Tracking'}</li>
            <li>{translations[currentLanguage]?.expenseAnalysis || 'Expense Analysis'}</li>
            <li>{translations[currentLanguage]?.sharedExpenses || 'Shared Expenses'}</li>
            <li>{translations[currentLanguage]?.pdfReports || 'PDF Reports'}</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>{translations[currentLanguage]?.tips || 'Budgeting Tips'}</h4>
          <ul>
            <li>{translations[currentLanguage]?.tip1 || 'Track every expense'}</li>
            <li>{translations[currentLanguage]?.tip2 || 'Set realistic goals'}</li>
            <li>{translations[currentLanguage]?.tip3 || 'Review monthly'}</li>
            <li>{translations[currentLanguage]?.tip4 || 'Save for emergencies'}</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>{translations[currentLanguage]?.contact || 'Contact'}</h4>
          <div className="footer-links">
            <a href="#" className="footer-link">
              📧 {translations[currentLanguage]?.support || 'Support'}
            </a>
            <a href="#" className="footer-link">
              📖 {translations[currentLanguage]?.help || 'Help'}
            </a>
            <a href="#" className="footer-link">
              🔒 {translations[currentLanguage]?.privacy || 'Privacy'}
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {currentYear} {translations[currentLanguage]?.appName || 'Budget Tracker'}. {translations[currentLanguage]?.allRightsReserved || 'All rights reserved.'}</p>
          <div className="footer-version">
            <span>v1.0.0</span>
            <span className="footer-separator">•</span>
            <span>{translations[currentLanguage]?.madeWith || 'Made with'} ❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 