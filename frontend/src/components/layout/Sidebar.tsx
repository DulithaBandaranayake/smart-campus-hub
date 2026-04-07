import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { 
  LayoutDashboard, 
  Building2, 
  CalendarCheck, 
  AlertCircle, 
  Bell, 
  User as UserIcon,
  LogOut,
  Shield,
  Gem
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useUser();

  const allNavItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/', roles: ['STUDENT', 'ADMIN', 'TECHNICIAN'] },
    { icon: <Building2 size={20} />, label: 'Facilities', path: '/facilities', roles: ['STUDENT', 'ADMIN', 'TECHNICIAN'] },
    { icon: <CalendarCheck size={20} />, label: 'Bookings', path: '/bookings', roles: ['STUDENT', 'ADMIN'] },
    { icon: <AlertCircle size={20} />, label: 'Incidents', path: '/incidents', roles: ['ADMIN', 'TECHNICIAN', 'STUDENT'] },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications', roles: ['STUDENT', 'ADMIN', 'TECHNICIAN'] },
  ];

  const filteredItems = allNavItems.filter(item => 
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="sidebar-container"
    >
      <div className="sidebar-glass">
        <div className="sidebar-header">
          <div className="logo-section">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className="logo-glow"
            >
              <Shield size={28} className="logo-svg" />
            </motion.div>
            <div className="logo-text">
              <span className="brand-primary">Nexus</span>
              <span className="brand-secondary">Ops</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Main Menu</div>
          {filteredItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-text">{item.label}</span>
              <motion.div 
                layoutId="nav-active"
                className="active-indicator" 
              />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="premium-badge">
              <Gem size={12} /> Pro
            </div>
            <div className="user-main">
              <div className="user-avatar">
                <UserIcon size={20} />
              </div>
              <div className="user-meta">
                <p className="user-name">{user?.name || 'Guest User'}</p>
                <p className="user-role-label">{user?.role?.toLowerCase() || 'visitor'}</p>
              </div>
            </div>
            <button className="logout-action-btn" onClick={logout} title="Logout Session">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
