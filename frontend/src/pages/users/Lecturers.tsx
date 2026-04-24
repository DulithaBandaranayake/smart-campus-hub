import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Edit, X, Shield, Save } from 'lucide-react';
import { userService, subjectService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useUser } from '../../context/UserContext';
import '../dashboard/Dashboard.css';
import '../dashboard/StudentDashboard.css';

const Lecturers = () => {
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '', employeeId: '' });
  const { toast } = useToast();
  const { role } = useUser();
  const isAdmin = role === 'ADMIN';

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [lectRes, subjRes] = await Promise.all([
        userService.getAll('LECTURER'),
        subjectService.getAll()
      ]);
      setLecturers(lectRes.data);
      setSubjects(subjRes.data);
    } catch {
      toast('error', 'Error', 'Could not load data');
    }
  };

  const openModal = (lecturer?: any) => {
    if (lecturer) {
      setEditUser(lecturer);
      setFormData({ name: lecturer.name, email: lecturer.email, password: '', department: lecturer.department || '', employeeId: lecturer.employeeId || '' });
    } else {
      setEditUser(null);
      setFormData({ name: '', email: '', password: '', department: '', employeeId: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = { ...formData, role: 'LECTURER' };
      if (editUser && !formData.password) delete payload.password;
      if (editUser) {
        await userService.update(editUser.id, payload);
        toast('success', 'Updated', 'Lecturer updated');
      } else {
        await userService.create(payload);
        toast('success', 'Added', 'Lecturer registered');
      }
      setShowModal(false);
      fetchAll();
    } catch (err: any) {
      toast('error', 'Failed', err.response?.data?.message || 'Could not save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this lecturer?')) return;
    await userService.delete(id);
    toast('success', 'Deleted', 'Lecturer removed');
    fetchAll();
  };

  return (
    <div className="dashboard-container-v2">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="welcome-banner">
        <div className="welcome-text">
          <h1>Faculty <span>Registry</span></h1>
          <p>{lecturers.length} registered faculty members</p>
        </div>
        {isAdmin && (
          <div className="banner-actions">
            <button className="btn-glow-primary" onClick={() => openModal()}>
              <UserPlus size={16} /> Add Lecturer
            </button>
          </div>
        )}
      </motion.div>

      <div className="bento-card-v2" style={{ marginTop: '1.5rem' }}>
        <table className="marks-table">
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Department</th><th>Subjects</th>{isAdmin && <th>Actions</th>}</tr>
          </thead>
          <tbody>
            {lecturers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No lecturers registered</td></tr>
            ) : lecturers.map(l => (
              <tr key={l.id}>
                <td className="text-muted">#{l.id}</td>
                <td><strong>{l.name}</strong></td>
                <td className="text-muted">{l.email}</td>
                <td>{l.department ? <span className="grade-badge" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1', borderColor: 'rgba(99,102,241,0.2)' }}>{l.department}</span> : '—'}</td>
                <td>
                  <span className="grade-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', borderColor: 'rgba(16,185,129,0.2)' }}>
                    {subjects.filter(s => s.lecturerId === l.lecturerId).length} Subjects
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="icon-btn" onClick={() => openModal(l)}><Edit size={14} /></button>
                      <button className="icon-btn danger" onClick={() => handleDelete(l.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="modal-portal">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="elite-modal-panel">
              <div className="modal-top">
                <h2><Shield size={20} /> {editUser ? 'Edit Lecturer' : 'Add Lecturer'}</h2>
                <button className="close-portal" onClick={() => setShowModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="elite-form">
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Full Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Email</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>{editUser ? 'New Password (leave blank)' : 'Password'}</label>
                    <input type="password" required={!editUser} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Department</label>
                    <input type="text" placeholder="e.g. Computer Science" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Employee ID</label>
                    <input type="text" placeholder="e.g. EMP-001" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} />
                  </div>
                </div>
                <div className="form-submit-row">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-glow-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : <><Save size={14} /> {editUser ? 'Save Changes' : 'Register Lecturer'}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lecturers;
