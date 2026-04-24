import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Edit, X, GraduationCap, Save } from 'lucide-react';
import { userService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useUser } from '../../context/UserContext';
import '../dashboard/Dashboard.css';
import '../dashboard/StudentDashboard.css';

const Students = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', grade: '',
    enrollmentDate: new Date().toISOString().slice(0, 10),
    parentId: ''
  });
  const { toast } = useToast();
  const { role } = useUser();
  const isAdmin = role === 'ADMIN';

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [studRes, parentRes] = await Promise.all([
        userService.getAll('STUDENT'),
        userService.getAll('PARENT'),
      ]);
      setStudents(studRes.data);
      setParents(parentRes.data);
    } catch {
      toast('error', 'Error', 'Could not load data');
    }
  };

  const openModal = (student?: any) => {
    if (student) {
      setEditUser(student);
      setFormData({
        name: student.name, email: student.email, password: '',
        grade: student.grade || '',
        enrollmentDate: student.enrollmentDate || new Date().toISOString().slice(0, 10),
        parentId: student.parentId ? String(student.parentId) : '',
      });
    } else {
      setEditUser(null);
      setFormData({ name: '', email: '', password: '', grade: '', enrollmentDate: new Date().toISOString().slice(0, 10), parentId: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: 'STUDENT',
        grade: formData.grade,
        enrollmentDate: formData.enrollmentDate || null,
        parentId: formData.parentId ? Number(formData.parentId) : null,
      };
      if (formData.password) payload.password = formData.password;

      if (editUser) {
        await userService.update(editUser.id, payload);
        toast('success', 'Updated', 'Student updated successfully');
      } else {
        payload.password = formData.password;
        await userService.create(payload);
        toast('success', 'Enrolled', 'Student added to registry');
      }
      setShowModal(false);
      fetchAll();
    } catch (err: any) {
      toast('error', 'Failed', err.response?.data?.message || 'Could not save student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    try {
      await userService.delete(id);
      toast('success', 'Deleted', 'Student removed');
      fetchAll();
    } catch {
      toast('error', 'Failed', 'Could not delete student');
    }
  };

  return (
    <div className="dashboard-container-v2">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="welcome-banner">
        <div className="welcome-text">
          <h1>Student <span>Registry</span></h1>
          <p>{students.length} enrolled students</p>
        </div>
        {isAdmin && (
          <div className="banner-actions">
            <button className="btn-glow-primary" onClick={() => openModal()}>
              <UserPlus size={16} /> Enroll Student
            </button>
          </div>
        )}
      </motion.div>

      <div className="bento-card-v2" style={{ marginTop: '1.5rem' }}>
        <table className="marks-table">
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Email</th><th>Grade</th><th>Parent Linked</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No students enrolled yet</td></tr>
            ) : students.map(s => {
              const linkedParent = parents.find(p => p.id === s.parentId);
              return (
                <tr key={s.id}>
                  <td className="text-muted">#{s.id}</td>
                  <td><strong>{s.name}</strong></td>
                  <td className="text-muted">{s.email}</td>
                  <td>{s.grade ? <span className="grade-badge">{s.grade}</span> : '—'}</td>
                  <td>
                    {linkedParent
                      ? <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.85rem' }}>✓ {linkedParent.name}</span>
                      : <span className="text-muted">Not linked</span>}
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="icon-btn" onClick={() => openModal(s)}><Edit size={14} /></button>
                        <button className="icon-btn danger" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="modal-portal">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="elite-modal-panel wide">
              <div className="modal-top">
                <h2><GraduationCap size={20} /> {editUser ? 'Edit Student' : 'Enroll New Student'}</h2>
                <button className="close-portal" onClick={() => setShowModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="elite-form">
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Full Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Email Address</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>{editUser ? 'New Password (leave blank to keep)' : 'Password'}</label>
                    <input type="password" required={!editUser} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Grade / Year Level</label>
                    <input type="text" placeholder="e.g. Year 1, Freshman" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Enrollment Date</label>
                    <input type="date" value={formData.enrollmentDate} onChange={e => setFormData({ ...formData, enrollmentDate: e.target.value })} />
                  </div>
                  <div className="form-field full">
                    <label>Link Parent Account</label>
                    <select value={formData.parentId} onChange={e => setFormData({ ...formData, parentId: e.target.value })}>
                      <option value="">— No parent linked —</option>
                      {parents.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                      ))}
                    </select>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Parent must be registered first. You can link later by editing.
                    </span>
                  </div>
                </div>
                <div className="form-submit-row">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-glow-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : <><Save size={14} /> {editUser ? 'Save Changes' : 'Enroll Student'}</>}
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

export default Students;
