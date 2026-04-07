import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  CalendarCheck, 
  AlertCircle, 
  ArrowRight,
  Activity,
  ChevronRight,
  Zap,
  ShieldCheck,
  TrendingUp,
  Clock,
  Bell
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import './Dashboard.css';

const StatCard = ({ title, value, icon, trend, color, onClick, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5, scale: 1.02 }}
    className={`stat-card-v2 ${color}`}
    onClick={onClick}
  >
    <div className="stat-card-inner">
      <div className="stat-icon-box">{icon}</div>
      <div className="stat-data">
        <span className="stat-title">{title}</span>
        <div className="stat-row">
          <h2 className="stat-number">{value}</h2>
          {trend && (
            <div className="stat-trend-v2">
              <TrendingUp size={14} />
              <span>{trend}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user, role } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = role === 'ADMIN';

  const handleExport = () => {
    toast('info', 'Secure Export Initiated', 'Preparing encrypted operations report...');
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="dashboard-container-v2">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="welcome-banner"
      >
        <div className="welcome-text">
          <h1>Nexus <span>Control Unit</span></h1>
          <p>Personnel: <span className="highlight-text">{user?.name}</span> • Access Level: <span className="badge-auth">{role}</span></p>
        </div>
        <div className="banner-actions">
          <div className="uptime-pill">
            <div className="dot" />
            System Online: 99.98%
          </div>
          {isAdmin && (
            <button className="btn-glow-primary" onClick={handleExport}>
              Generate Ops Intelligence
            </button>
          )}
        </div>
      </motion.div>

      <div className="dashboard-layout-grid">
        <section className="stats-row-v2">
          <StatCard 
            title="Operational Assets" 
            value="48" 
            icon={<Building2 size={24} />} 
            trend="4"
            color="indigo"
            delay={0.1}
            onClick={() => navigate('/facilities')}
          />
          <StatCard 
            title="Current Protocol Load" 
            value="182" 
            icon={<CalendarCheck size={24} />} 
            trend="12"
            color="emerald"
            delay={0.2}
            onClick={() => navigate('/bookings')}
          />
          <StatCard 
            title="Integrity Incidents" 
            value="03" 
            icon={<AlertCircle size={24} />} 
            color="rose"
            delay={0.3}
            onClick={() => navigate('/incidents')}
          />
        </section>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="bento-master-grid"
        >
          <motion.div variants={item} className="bento-card-v2 chart-panel">
            <div className="bento-card-header">
              <h3><Activity size={18} className="text-secondary" /> Load Metrics</h3>
              <div className="time-range flex gap-2">
                <span className="time-btn active">24h</span>
                <span className="time-btn">7d</span>
              </div>
            </div>
            <div className="chart-visualization">
              <div className="bars-container">
                 {[45, 65, 85, 55, 75, 45, 95, 80, 60, 70, 50, 65, 85].map((h, i) => (
                   <motion.div 
                     key={i}
                     initial={{ height: 0 }}
                     animate={{ height: `${h}%` }}
                     transition={{ delay: 0.5 + (i * 0.05), duration: 0.6 }}
                     className="data-bar"
                     whileHover={{ filter: 'brightness(1.3)' }}
                   />
                 ))}
              </div>
              <div className="chart-legend">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="bento-card-v2 quick-access-panel">
            <h3>Satellite Modules</h3>
            <div className="module-grid">
              {[
                { label: 'Facility Ops', icon: <Zap size={18}/>, path: '/facilities', desc: 'Resource Monitoring' },
                { label: 'Incident Log', icon: <ShieldCheck size={18}/>, path: '/incidents', desc: 'Secure Audit' },
                { label: 'Booking Hub', icon: <Clock size={18}/>, path: '/bookings', desc: 'Time Logic' },
                { label: 'Alert Center', icon: <Bell size={18}/>, path: '/notifications', desc: 'Comms Unit' }
              ].map((mod) => (
                <button key={mod.path} className="module-tile-v2" onClick={() => navigate(mod.path)}>
                  <div className="tile-icon-v2">{mod.icon}</div>
                  <div className="tile-info">
                    <span className="tile-label">{mod.label}</span>
                    <span className="tile-desc">{mod.desc}</span>
                  </div>
                  <ChevronRight size={16} className="arrow-fade" />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item} className="bento-card-v2 recent-feed-panel">
            <div className="bento-card-header">
              <h3>System Telemetry</h3>
              <button className="view-all-link" onClick={() => navigate('/notifications')}>
                History <ArrowRight size={14} />
              </button>
            </div>
            <div className="telemetry-list">
              {[
                { title: 'Database Mirror Sync', time: 'Just Now', status: 'optimal' },
                { title: 'Security Patch v2.4.1', time: '2h ago', status: 'optimal' },
                { title: 'Facility B-4 HVAC Fault', time: '5h ago', status: 'warning' },
                { title: 'New Admin: Nexus_User', time: '8h ago', status: 'optimal' }
              ].map((feed, i) => (
                <div key={i} className="telemetry-item">
                  <div className={`status-dot ${feed.status}`} />
                  <div className="telemetry-info">
                    <p className="feed-title">{feed.title}</p>
                    <p className="feed-meta">{feed.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

