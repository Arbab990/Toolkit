import { motion } from 'framer-motion';
import { LogOut, User, Bell, Shield, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const settingsGroups = [
    {
      title: 'Account',
      icon: User,
      items: [
        { label: 'Profile Information', value: user?.fullName },
        { label: 'Email Address', value: user?.email },
      ],
    },
    {
      title: 'Preferences',
      icon: Moon,
      items: [
        { label: 'Dark Mode', value: 'Coming Soon' },
        { label: 'Notifications', value: 'Enabled' },
      ],
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { label: 'Password', value: '••••••••' },
        { label: 'Two-Factor Auth', value: 'Disabled' },
      ],
    },
  ];

  return (
    <motion.div 
      className="settings-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-header__title">Settings</h1>
          <p className="page-header__subtitle">Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="settings-container">
        {settingsGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="settings-group">
            <div className="settings-group__header">
              <group.icon size={18} />
              <h3>{group.title}</h3>
            </div>
            <div className="settings-card">
              {group.items.map((item, itemIdx) => (
                <div key={itemIdx} className="settings-item">
                  <span className="settings-item__label">{item.label}</span>
                  <span className="settings-item__value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="settings-group">
          <div className="settings-group__header">
            <LogOut size={18} color="#ef4444" />
            <h3>Session</h3>
          </div>
          <div className="settings-card logout-card">
            <p className="logout-text">Logging out will end your current session. Don't worry, your data is stored locally and will be here when you return.</p>
            <motion.button
              className="btn-logout"
              onClick={handleLogout}
              whileHover={{ scale: 1.02, backgroundColor: '#fee2e2' }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut size={18} />
              Logout from EOH 2.0
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
