import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import {
  LayoutDashboard,
  Building,
  Calendar,
  Wrench,
  Bell,
  LogOut,
  Gem,
  Menu,
  Users,
  FileText,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const allNavItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/', roles: ['USER', 'ADMIN', 'TECHNICIAN', 'PARENT', 'STUDENT'], exact: true },
    { icon: <Users size={20} />, label: 'Manage', path: '/manage', roles: ['ADMIN'] },
    { icon: <Building size={20} />, label: 'Resources', path: '/resources', roles: ['USER', 'ADMIN', 'TECHNICIAN', 'PARENT', 'STUDENT'] },
    { icon: <Calendar size={20} />, label: 'Bookings', path: '/bookings', roles: ['USER', 'ADMIN', 'TECHNICIAN', 'PARENT', 'STUDENT'] },
    { icon: <FileText size={20} />, label: 'Leave Requests', path: '/leave-requests', roles: ['USER', 'ADMIN', 'PARENT', 'STUDENT'] },
    { icon: <Wrench size={20} />, label: 'Tickets', path: '/tickets', roles: ['USER', 'ADMIN', 'TECHNICIAN', 'PARENT', 'STUDENT'] },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications', roles: ['USER', 'ADMIN', 'TECHNICIAN', 'PARENT', 'STUDENT'] },
    { icon: <BookOpen size={20} />, label: 'Subjects', path: '/academic', roles: ['ADMIN'] },
    { icon: <Calendar size={20} />, label: 'Lectures', path: '/lectures', roles: ['USER', 'ADMIN', 'TECHNICIAN', 'LECTURER', 'PARENT', 'STUDENT'] },
    { icon: <GraduationCap size={20} />, label: 'Marks', path: '/marks', roles: ['ADMIN', 'LECTURER', 'PARENT'] },
    { icon: <ClipboardCheck size={20} />, label: 'Attendance', path: '/attendance', roles: ['ADMIN'] },
  ];

  const filteredItems = allNavItems.filter(item =>
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const closeSidebar = () => setIsOpen(false);

  const handleNavClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleLogout = () => {
    if (isMobile) {
      closeSidebar();
    }
    logout();
  };

  return (
    <>
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setIsOpen(true)} aria-label="Open menu">
          <Menu size={24} />
        </button>
        <div className="mobile-logo">
          <div className="logo-glow">
            <Building size={20} />
          </div>
          <span className="mobile-logo-text">SmartCampusHub</span>
        </div>
        <div style={{ width: 40 }}></div>
      </div>

      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div 
            className="sidebar-overlay open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isMobile ? (isOpen ? { x: 0 } : { x: -280 }) : { x: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className={`sidebar-container ${isMobile && isOpen ? 'open' : ''}`}
      >
        <div className="sidebar-glass">
          <div className="sidebar-header">
            <div className="logo-section">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
                className="logo-glow"
              >
                <Building size={28} className="logo-svg" />
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
                onClick={handleNavClick}
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
                  <Building size={20} />
                </div>
                <div className="user-meta">
                  <p className="user-name">{user?.name || 'Guest'}</p>
                  <p className="user-role-label">{user?.email || ''}</p>
                </div>
              </div>
              <button className="logout-action-btn" onClick={handleLogout} title="Logout">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;