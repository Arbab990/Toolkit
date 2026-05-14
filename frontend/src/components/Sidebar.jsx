import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  ClipboardCheck,
  FileBarChart,
  Zap,
  BookOpen,
  Settings,
  HardDrive,
  Leaf,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Sites', icon: MapPin, path: '/' },
  { label: 'Assessments', icon: ClipboardCheck, path: '/assessments' },
  { label: 'Reports', icon: FileBarChart, path: '/reports' },
  { label: 'Actions', icon: Zap, path: '/actions' },
  { label: 'Library', icon: BookOpen, path: '/library' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`} id="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <Leaf />
        </div>
        <div className="sidebar__brand-info">
          <span className="sidebar__brand-name">EOH 2.0</span>
          <span className="sidebar__brand-status">Offline</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `sidebar__nav-item${isActive ? ' sidebar__nav-item--active' : ''}`
              }
              id={`nav-${item.label.toLowerCase()}`}
            >
              <Icon />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="sidebar__footer">
        <div className="sidebar__footer-title">
          <HardDrive />
          Data Stored Locally
        </div>
        <p className="sidebar__footer-text">
          All your data is saved on this device only.
        </p>
      </div>
    </aside>
  );
}
