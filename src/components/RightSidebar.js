import React from 'react';
import { FaRegListAlt } from 'react-icons/fa';
import { useBudget } from '../contexts/BudgetContext';
import { translations } from '../translations';
import './RightSidebar.css';

export default function RightSidebar({ title, children, collapsed = false }) {
  const { currentLanguage } = useBudget();
  const t = translations[currentLanguage] || {};
  const defaultTitle = t.tools || 'Outils';
  return (
    <aside className={`right-sidebar-modern${collapsed ? ' collapsed' : ''}`}
      style={{ width: collapsed ? 70 : 320 }}>
      <div className="rsb-header">
        <div className="rsb-logo">
          <FaRegListAlt size={collapsed ? 26 : 32} />
        </div>
        {!collapsed && <div className="rsb-title">{title || defaultTitle}</div>}
      </div>
      {!collapsed && <div className="rsb-divider" />}
      <div className="rsb-content">
        {children}
      </div>
    </aside>
  );
} 