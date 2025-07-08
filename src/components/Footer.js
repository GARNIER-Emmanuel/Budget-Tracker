import React from 'react';

const Footer = ({ translations, currentLanguage, style }) => {
  const currentYear = new Date().getFullYear();
  return (
    <footer
      className="footer"
      style={{
        marginLeft: style?.marginLeft || 0,
        width: style?.width || '100%',
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1)',
        textAlign: 'center',
        background: 'transparent',
        color: '#6b7280',
        fontSize: '0.98rem',
        padding: '1.2rem 0 0.7rem 0',
        boxSizing: 'border-box',
      }}
    >
      <span style={{ fontWeight: 600 }}>
        {translations[currentLanguage]?.appName || 'Budget Tracker'}
      </span>
      {' '}| © {currentYear} | {translations[currentLanguage]?.allRightsReserved || 'All rights reserved.'}
    </footer>
  );
};

export default Footer; 