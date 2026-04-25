import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, Calendar, Wrench, Bell, Plus, ClipboardList, Users, BookOpen, TrendingUp, GraduationCap, ClipboardCheck } from 'lucide-react';
import { resourceService, bookingService, ticketService, userService, statsService, attendanceService, markService } from '../../services/api';
import './Dashboard.css';

interface DashboardStats {
  resources: number;
  bookings: number;
  tickets: number;
  users: number;
  attendance?: any[];
  marks?: any[];
}

interface ActivityData {
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    resources:0,
    bookings:0,
    tickets:0,
    users:0,
    attendance: [],
    marks: []
  });
  const [activityData, setActivityData] = useState<ActivityData>({
    mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange] = useState<'week' | 'month'>('week');
  const [, setDayOfWeek] = useState(0);

  const role = localStorage.getItem('hubUserRole') || 
    (localStorage.getItem('hubUser') ? JSON.parse(localStorage.getItem('hubUser') || '{}').role : 'USER');
  const userName = localStorage.getItem('hubUser') ? JSON.parse(localStorage.getItem('hubUser') || '{}').name : 'User';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const requests: Promise<any>[] = [
          resourceService.getAll(),
          bookingService.getAll(),
          ticketService.getAll()
        ];
        
        // Only fetch users for admin
        if (role === 'ADMIN') {
          requests.push(userService.getAll());
        }
        
        // Fetch attendance and marks for parents and students
        if (role === 'PARENT' || role === 'STUDENT') {
          requests.push(attendanceService.getAll());
          requests.push(markService.getAll());
        }
        
        const results = await Promise.all(requests);
        
        const resourcesRes = results[0];
        const bookingsRes = results[1];
        const ticketsRes = results[2];
        let resultIndex = 3;
        
        setStats({
          resources: resourcesRes.data.length || 0,
          bookings: bookingsRes.data.length || 0,
          tickets: ticketsRes.data.length || 0,
          users: role === 'ADMIN' ? (results[resultIndex++]?.data?.length || 0) : 0,
          attendance: (role === 'PARENT' || role === 'STUDENT') ? results[resultIndex++]?.data || [] : [],
          marks: (role === 'PARENT' || role === 'STUDENT') ? results[resultIndex++]?.data || [] : []
        });

        // Fetch activity data
        if (role === 'ADMIN' || role === 'TECHNICIAN') {
          const activityRes = timeRange === 'week' 
            ? await statsService.getWeekly() 
            : await statsService.getMonthly();
          
          const activity = activityRes.data;
          const dailyActivity = activity.bookings || activity.tickets || activity.users || {};
          setActivityData({
            mon: dailyActivity.mon || 0,
            tue: dailyActivity.tue || 0,
            wed: dailyActivity.wed || 0,
            thu: dailyActivity.thu || 0,
            fri: dailyActivity.fri || 0,
            sat: dailyActivity.sat || 0,
            sun: dailyActivity.sun || 0
          });
        }
        
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const today = new Date().getDay();
        setDayOfWeek(days.indexOf(days[today]));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  const adminCards = [
    { icon: <Building size={24} />, title: 'Resources', count: stats.resources, path: '/resources', color: 'emerald' },
    { icon: <Calendar size={24} />, title: 'Bookings', count: stats.bookings, path: '/bookings', color: 'indigo' },
    { icon: <Wrench size={24} />, title: 'Tickets', count: stats.tickets, path: '/tickets', color: 'rose' },
    { icon: <Users size={24} />, title: 'Users', count: stats.users, path: '/users', color: 'amber' },
  ];

  const userCards = [
    { icon: <Building size={24} />, title: 'Resources', count: stats.resources, path: '/resources', color: 'emerald' },
    { icon: <Calendar size={24} />, title: 'My Bookings', count: '-', path: '/bookings', color: 'indigo' },
    { icon: <Wrench size={24} />, title: 'Report Issue', count: '-', path: '/tickets', color: 'rose' },
    { icon: <Bell size={24} />, title: 'Notifications', count: '-', path: '/notifications', color: 'amber' },
  ];

  const techCards = [
    { icon: <ClipboardList size={24} />, title: 'Assigned Tickets', count: stats.tickets, path: '/tickets', color: 'indigo' },
    { icon: <Building size={24} />, title: 'Resources', count: stats.resources, path: '/resources', color: 'emerald' },
    { icon: <Wrench size={24} />, title: 'All Tickets', count: stats.tickets, path: '/tickets', color: 'rose' },
    { icon: <Bell size={24} />, title: 'Notifications', count: '-', path: '/notifications', color: 'amber' },
  ];

  const parentStudentCards = [
    { icon: <Building size={24} />, title: 'Resources', count: stats.resources, path: '/resources', color: 'emerald' },
    { icon: <ClipboardCheck size={24} />, title: 'Attendance', count: stats.attendance?.length || 0, path: '/attendance', color: 'indigo' },
    { icon: <GraduationCap size={24} />, title: 'Marks', count: stats.marks?.length || 0, path: '/marks', color: 'rose' },
    { icon: <Bell size={24} />, title: 'Notifications', count: '-', path: '/notifications', color: 'amber' },
  ];

  const getCards = () => {
    switch (role) {
      case 'ADMIN': return adminCards;
      case 'TECHNICIAN': return techCards;
      case 'PARENT': 
      case 'STUDENT': return parentStudentCards;
      default: return userCards;
    }
  };

  const renderActivityOverview = () => {
    if (role === 'PARENT' || role === 'STUDENT') {
      // Show attendance and marks for parents and students
      const recentAttendance = stats.attendance?.slice(0, 5) || [];
      const recentMarks = stats.marks?.slice(0, 5) || [];
      
      return (
        <div className="bento-card-v2 activity-panel">
          <div className="bento-card-header">
            <h3><ClipboardCheck size={20} /> Attendance & Marks</h3>
          </div>
          <div className="activity-split">
            <div className="activity-section">
              <h4>Recent Attendance</h4>
              {recentAttendance.length > 0 ? (
                <div className="activity-list">
                  {recentAttendance.map((a: any) => (
                    <div key={a.id} className="activity-item">
                      <span className={`status-dot ${a.status?.toLowerCase()}`}></span>
                      <div>
                        <p className="activity-title">{a.studentName}</p>
                        <p className="activity-meta">{a.date} - {a.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data-text">No attendance records</p>
              )}
            </div>
            <div className="activity-section">
              <h4>Recent Marks</h4>
              {recentMarks.length > 0 ? (
                <div className="activity-list">
                  {recentMarks.map((m: any) => (
                    <div key={m.id} className="activity-item">
                      <span className="status-dot optimal"></span>
                      <div>
                        <p className="activity-title">{m.subjectName} - {m.score}/{m.maxScore}</p>
                        <p className="activity-meta">{m.studentName} - {m.examType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data-text">No marks available</p>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      // Show chart for admin/technician
      return (
        <div className="bento-card-v2 chart-panel">
          <div className="bento-card-header">
            <h3><TrendingUp size={20} /> Activity Overview</h3>
            <div className="time-range">
              <span className="time-btn active">Week</span>
              <span className="time-btn">Month</span>
            </div>
          </div>
          <div className="chart-visualization">
            <div className="bars-container">
              <div className="data-bar" style={{ height: `${activityData.mon || 0}%` }}></div>
              <div className="data-bar" style={{ height: `${activityData.tue || 0}%` }}></div>
              <div className="data-bar" style={{ height: `${activityData.wed || 0}%` }}></div>
              <div className="data-bar" style={{ height: `${activityData.thu || 0}%` }}></div>
              <div className="data-bar" style={{ height: `${activityData.fri || 0}%` }}></div>
              <div className="data-bar" style={{ height: `${activityData.sat || 0}%` }}></div>
              <div className="data-bar" style={{ height: `${activityData.sun || 0}%` }}></div>
            </div>
            <div className="chart-legend">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="dashboard-container-v2">
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, <span>{userName}</span></h1>
          <p>Here's what's happening with your campus today</p>
        </div>
        <div className="banner-actions">
          <span className="badge-auth">{role}</span>
          <div className="uptime-pill">
            <span className="dot"></span>
            {loading ? 'Loading...' : 'System Online'}
          </div>
        </div>
      </div>

      <div className="stats-row-v2">
        {getCards().map((card, index) => (
          <Link key={index} to={card.path} className={`stat-card-v2 ${card.color}`}>
            <div className="stat-card-inner">
              <div className="stat-icon-box">{card.icon}</div>
              <div className="stat-data">
                <div className="stat-title">{card.title}</div>
                <div className="stat-row">
                  <p className="stat-number">
                    {typeof card.count === 'number' ? card.count : card.count}
                  </p>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {card.title === 'Resources' ? 'Campus facilities' :
                   card.title === 'Bookings' ? 'Booking requests' :
                   card.title === 'Tickets' ? 'Support tickets' :
                   card.title === 'Users' ? 'System users' :
                   card.title === 'Attendance' ? 'Attendance records' :
                   card.title === 'Marks' ? 'Grades & marks' :
                   'Click to view'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bento-master-grid">
        {renderActivityOverview()}

        <div className="bento-card-v2 quick-access-panel">
          <div className="bento-card-header">
            <h3><Plus size={20} /> Quick Actions</h3>
          </div>
          <div className="module-grid">
            <Link to="/bookings" className="module-tile-v2">
              <div className="tile-icon-v2"><Calendar size={20} /></div>
              <div className="tile-info">
                <span className="tile-label">New Booking</span>
                <span className="tile-desc">Request a room or facility</span>
              </div>
            </Link>
            <Link to="/tickets" className="module-tile-v2">
              <div className="tile-icon-v2"><Wrench size={20} /></div>
              <div className="tile-info">
                <span className="tile-label">Report Issue</span>
                <span className="tile-desc">Submit maintenance request</span>
              </div>
            </Link>
            <Link to="/resources" className="module-tile-v2">
              <div className="tile-icon-v2"><Building size={20} /></div>
              <div className="tile-info">
                <span className="tile-label">Browse Facilities</span>
                <span className="tile-desc">View all resources</span>
              </div>
            </Link>
            {(role === 'ADMIN' || role === 'TECHNICIAN') && (
              <Link to="/subjects" className="module-tile-v2">
                <div className="tile-icon-v2"><BookOpen size={20} /></div>
                <div className="tile-info">
                  <span className="tile-label">Subjects</span>
                  <span className="tile-desc">Manage subjects</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="bento-card-v2 recent-feed-panel">
          <div className="bento-card-header">
            <h3><Bell size={20} /> Recent Activity</h3>
            <button className="view-all-link">View All →</button>
          </div>
          <div className="telemetry-list">
            <div className="telemetry-item">
              <span className="status-dot optimal"></span>
              <div>
                <p className="feed-title">Database Connected</p>
                <p className="feed-meta">{stats.users} users, {stats.resources} resources</p>
              </div>
            </div>
            <div className="telemetry-item">
              <span className="status-dot optimal"></span>
              <div>
                <p className="feed-title">System Operational</p>
                <p className="feed-meta">{stats.bookings} bookings, {stats.tickets} tickets</p>
              </div>
            </div>
            <div className="telemetry-item">
              <span className="status-dot warning"></span>
              <div>
                <p className="feed-title">Active Tickets</p>
                <p className="feed-meta">{stats.tickets} open support requests</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;