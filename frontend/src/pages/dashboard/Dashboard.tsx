import { useUser } from '../../context/UserContext';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import ParentDashboard from './ParentDashboard';
import LecturerDashboard from './LecturerDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { role } = useUser();

  switch (role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    case 'PARENT':
      return <ParentDashboard />;
    case 'LECTURER':
      return <LecturerDashboard />;
    default:
      return <div className="dashboard-container-v2"><h1>Invalid Role</h1></div>;
  }
};

export default Dashboard;
