import { useState, useEffect } from 'react';
import { peopleService, userService } from '../../services/api';
import { Users, BookOpen, GraduationCap, Clock, Edit, RefreshCw } from 'lucide-react';
import './Management.css';

type Tab = 'students' | 'parents' | 'lecturers' | 'pending' | 'passwordReset';

interface Student {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  grade: string;
  enrollmentDate: string;
  parentId: number;
  parentName: string;
}

interface Parent {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  phoneNumber: string;
  address: string;
}

interface Lecturer {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  department: string;
  employeeId: string;
}

interface PendingUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface PasswordResetRequest {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  requestedAt: string;
}

interface EditUser {
  id: number;
  name: string;
  email: string;
  role: string;
  grade?: string;
  department?: string;
}

const Management = () => {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [passwordResets, setPasswordResets] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModal, setEditModal] = useState<EditUser | null>(null);

  const getRole = () => {
    const role = localStorage.getItem('hubUserRole');
    if (role) return role;
    const user = localStorage.getItem('hubUser');
    if (user) {
      try { return JSON.parse(user).role || ''; } catch { return ''; }
    }
    return '';
  };
  const userRole = getRole();
  const isAdmin = userRole === 'ADMIN';

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'students') {
        const res = await peopleService.getStudents();
        setStudents(res.data);
      } else if (activeTab === 'parents') {
        const res = await peopleService.getParents();
        setParents(res.data);
      } else if (activeTab === 'lecturers') {
        const res = await peopleService.getLecturers();
        setLecturers(res.data);
      } else if (activeTab === 'pending') {
        const res = await userService.getPending();
        setPendingUsers(res.data);
      } else if (activeTab === 'passwordReset') {
        const res = await userService.getPasswordResetRequests();
        setPasswordResets(res.data);
      }
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, type: string) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      if (activeTab === 'students') await peopleService.deleteStudent(id);
      else if (activeTab === 'parents') await peopleService.deleteParent(id);
      else if (activeTab === 'lecturers') await peopleService.deleteLecturer(id);
      else if (activeTab === 'pending') await userService.reject(id);
      else if (activeTab === 'passwordReset') await userService.rejectPasswordReset(id);
      fetchData();
    } catch (err: any) {
      setError('Failed to delete');
    }
  };

  const handleApprove = async (id: number) => {
    if (!window.confirm('Approve this user?')) return;
    try {
      await userService.approve(id);
      fetchData();
    } catch (err: any) {
      setError('Failed to approve');
    }
  };

  const handleApprovePasswordReset = async (id: number) => {
    try {
      await userService.approvePasswordReset(id);
      fetchData();
    } catch (err: any) {
      setError('Failed to approve');
    }
  };

  const updateEditField = (field: keyof EditUser, value: string) => {
    if (editModal) setEditModal({ ...editModal, [field]: value });
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    try {
      await userService.update(editModal.id, editModal);
      setEditModal(null);
      fetchData();
    } catch (err: any) {
      setError('Failed to update');
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending', icon: <Clock size={18} /> },
    { id: 'passwordReset', label: 'Password Reset', icon: <RefreshCw size={18} /> },
    { id: 'students', label: 'Students', icon: <GraduationCap size={18} /> },
    { id: 'parents', label: 'Parents', icon: <Users size={18} /> },
    { id: 'lecturers', label: 'Lecturers', icon: <BookOpen size={18} /> },
  ];

  if (!isAdmin) return <div className="management-page"><h1>Access Denied</h1></div>;

  return (
    <div className="management-page">
      <div className="page-header"><h1>User Management</h1></div>
      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id as Tab)}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div className="data-table">
          {activeTab === 'students' && (
            <table><thead><tr><th>Name</th><th>Email</th><th>Grade</th><th>Parent</th><th>Actions</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}><td>{s.userName}</td><td>{s.userEmail}</td><td>{s.grade || '-'}</td><td>{s.parentName || '-'}</td>
                    <td><button className="btn-secondary btn-sm" onClick={() => setEditModal({ id: s.userId, name: s.userName, email: s.userEmail, role: 'STUDENT', grade: s.grade })}><Edit size={14}/></button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(s.id, 'student')}>Delete</button></td></tr>
                ))}
                {students.length === 0 && <tr><td colSpan={5}>No students</td></tr>}
              </tbody>
            </table>
          )}

          {activeTab === 'parents' && (
            <table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
              <tbody>
                {parents.map(p => (
                  <tr key={p.id}><td>{p.userName}</td><td>{p.userEmail}</td><td>{p.phoneNumber || '-'}</td>
                    <td><button className="btn-secondary btn-sm" onClick={() => setEditModal({ id: p.userId, name: p.userName, email: p.userEmail, role: 'PARENT' })}><Edit size={14}/></button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(p.id, 'parent')}>Delete</button></td></tr>
                ))}
                {parents.length === 0 && <tr><td colSpan={4}>No parents</td></tr>}
              </tbody>
            </table>
          )}

          {activeTab === 'lecturers' && (
            <table><thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Actions</th></tr></thead>
              <tbody>
                {lecturers.map(l => (
                  <tr key={l.id}><td>{l.userName}</td><td>{l.userEmail}</td><td>{l.department || '-'}</td>
                    <td><button className="btn-secondary btn-sm" onClick={() => setEditModal({ id: l.userId, name: l.userName, email: l.userEmail, role: 'LECTURER', department: l.department })}><Edit size={14}/></button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(l.id, 'lecturer')}>Delete</button></td></tr>
                ))}
                {lecturers.length === 0 && <tr><td colSpan={4}>No lecturers</td></tr>}
              </tbody>
            </table>
          )}

          {activeTab === 'pending' && (
            <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
              <tbody>
                {pendingUsers.map(u => (
                  <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                    <td><button className="btn-primary btn-sm" onClick={() => handleApprove(u.id)}>Approve</button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(u.id, 'user')}>Reject</button></td></tr>
                ))}
                {pendingUsers.length === 0 && <tr><td colSpan={4}>No pending users</td></tr>}
              </tbody>
            </table>
          )}

          {activeTab === 'passwordReset' && (
            <table><thead><tr><th>Name</th><th>Email</th><th>Requested</th><th>Actions</th></tr></thead>
              <tbody>
                {passwordResets.map(r => (
                  <tr key={r.id}><td>{r.userName}</td><td>{r.userEmail}</td><td>{r.requestedAt}</td>
                    <td><button className="btn-primary btn-sm" onClick={() => handleApprovePasswordReset(r.id)}>Approve</button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(r.id, 'request')}>Reject</button></td></tr>
                ))}
                {passwordResets.length === 0 && <tr><td colSpan={4}>No password reset requests</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}

      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit User</h2>
            <form onSubmit={handleEditUser}>
              <div className="form-group">
                <label>Name</label>
                <input value={editModal.name} onChange={e => updateEditField('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input value={editModal.email} onChange={e => updateEditField('email', e.target.value)} />
              </div>
              {editModal.role === 'STUDENT' && (
                <div className="form-group">
                  <label>Grade</label>
                  <input value={editModal.grade || ''} onChange={e => updateEditField('grade', e.target.value)} />
                </div>
              )}
              {editModal.role === 'LECTURER' && (
                <div className="form-group">
                  <label>Department</label>
                  <input value={editModal.department || ''} onChange={e => updateEditField('department', e.target.value)} />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Management;