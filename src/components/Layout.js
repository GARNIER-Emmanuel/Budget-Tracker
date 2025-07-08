import React from 'react';
import './Layout.css';

function Layout({ sidebarLeft, main, sidebarRight, className = '' }) {
  return (
    <div className={`layout-root ${className}`}>
      <aside className="layout-sidebar-left">
        {sidebarLeft}
      </aside>
      <div className="layout-main-area">
        <div className="layout-content-row">
          {/* Contenu principal */}
          <main className="layout-main-content">
            {main}
          </main>
          {/* Sidebar droite */}
          <aside className="layout-sidebar-right">
            {sidebarRight}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Layout; 