import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout" id="app-layout">
      {/* Mobile Toggle Button */}
      <button 
        className="mobile-toggle" 
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle Menu"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} />
      
      <main className="main-content" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
