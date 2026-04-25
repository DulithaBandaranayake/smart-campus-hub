import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Resources from './pages/resources/Resources';
import Bookings from './pages/bookings/Bookings';
import Tickets from './pages/tickets/Tickets';
import Notifications from './pages/notifications/Notifications';
import Management from './pages/management/Management';
import LeaveRequests from './pages/leaverequests/LeaveRequests';
import Subjects from './pages/subjects/Subjects';
import Lectures from './pages/lectures/Lectures';
import Marks from './pages/marks/Marks';
import Attendance from './pages/attendance/Attendance';
import Login from './pages/login/Login';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useUser();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { role, isAuthenticated } = useUser();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const TechnicianRoute = ({ children }: { children: React.ReactNode }) => {
  const { role, isAuthenticated } = useUser();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'ADMIN' && role !== 'TECHNICIAN') return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />

            <Route path="manage" element={
              <AdminRoute><Management /></AdminRoute>
            } />

            <Route path="leave-requests" element={
              <ProtectedRoute><LeaveRequests /></ProtectedRoute>
            } />

            <Route path="resources" element={<Resources />} />
            
            <Route path="bookings" element={<Bookings />} />
            
            <Route path="tickets" element={<Tickets />} />
            
            <Route path="notifications" element={<Notifications />} />

            <Route path="admin-resources" element={
              <AdminRoute><Resources /></AdminRoute>
            } />
            <Route path="admin-bookings" element={
              <AdminRoute><Bookings /></AdminRoute>
            } />
            <Route path="admin-tickets" element={
              <TechnicianRoute><Tickets /></TechnicianRoute>
            } />

            <Route path="academic" element={
              <AdminRoute><Subjects /></AdminRoute>
            } />
            <Route path="lectures" element={
              <ProtectedRoute><Lectures /></ProtectedRoute>
            } />
            <Route path="marks" element={
              <ProtectedRoute><Marks /></ProtectedRoute>
            } />
            <Route path="attendance" element={
              <AdminRoute><Attendance /></AdminRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;