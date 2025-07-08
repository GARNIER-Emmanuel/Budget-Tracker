import React from 'react';
import { FaRegListAlt } from 'react-icons/fa';
import './RightSidebar.css';

export default function RightSidebar({ title = 'Outils', children, collapsed = false }) {
  return (
    <aside className={`right-sidebar-modern${collapsed ? ' collapsed' : ''}`}
      style={{ width: collapsed ? 70 : 320 }}>
      <div className="rsb-header">
        <div className="rsb-logo">
          <FaRegListAlt size={collapsed ? 26 : 32} />
        </div>
        {!collapsed && <div className="rsb-title">{title}</div>}
      </div>
      {!collapsed && <div className="rsb-divider" />}
      <div className="rsb-content">
        {children}
      </div>
    </aside>
  );
} 