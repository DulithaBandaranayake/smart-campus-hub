import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Shield,
  User as UserIcon,
  LogOut,
  Gem
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useUser();

  const allNavItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/', roles: ['STUDENT', 'ADMIN', 'LECTURER', 'PARENT'], exact: true },
    { icon: <GraduationCap size={20} />, label: 'Students', path: '/students', roles: ['ADMIN', 'LECTURER'] },
    { icon: <Users size={20} />, label: 'Parents', path: '/parents', roles: ['ADMIN'] },
    { icon: <Shield size={20} />, label: 'Lecturers', path: '/lecturers', roles: ['ADMIN'] },
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
              <GraduationCap size={28} className="logo-svg" />
            </motion.div>
            <div className="logo-text">
              <span className="brand-primary">SmartCampus</span>
              <span className="brand-secondary">Hub</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Main Menu</div>
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-text">{item.label}</span>
              <motion.div layoutId={`nav-active-${item.path}`} className="active-indicator" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="premium-badge">
              <Gem size={12} /> {user?.role || 'User'}
            </div>
            <div className="user-main">
              <div className="user-avatar">
                <UserIcon size={20} />
              </div>
              <div className="user-meta">
                <p className="user-name">{user?.name || 'Guest'}</p>
                <p className="user-role-label">{user?.email || ''}</p>
              </div>
            </div>
            <button className="logout-action-btn" onClick={logout} title="Logout">
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
