import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Edit, X, Users, Save } from 'lucide-react';
import { userService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useUser } from '../../context/UserContext';
import '../dashboard/Dashboard.css';
import '../dashboard/StudentDashboard.css';

const Parents = () => {
  const [parents, setParents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phoneNumber: '', address: '', studentIds: [] as number[] });
  const { toast } = useToast();
  const { role } = useUser();
  const isAdmin = role === 'ADMIN';

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [pRes, sRes] = await Promise.all([userService.getAll('PARENT'), userService.getAll('STUDENT')]);
      setParents(pRes.data);
      setStudents(sRes.data);
    } catch {
      toast('error', 'Error', 'Could not load parents');
    }
  };

  const openModal = (parent?: any) => {
    if (parent) {
      setEditUser(parent);
      setFormData({
        name: parent.name,
        email: parent.email,
        password: '',
        phoneNumber: parent.phoneNumber || '',
        address: parent.address || '',
        studentIds: parent.studentIds || []
      });
    } else {
      setEditUser(null);
      setFormData({ name: '', email: '', password: '', phoneNumber: '', address: '', studentIds: [] });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = { ...formData, role: 'PARENT' };
      if (editUser && !formData.password) delete payload.password;
      if (editUser) {
        await userService.update(editUser.id, payload);
        toast('success', 'Updated', 'Parent updated');
      } else {
        await userService.create(payload);
        toast('success', 'Created', 'Parent account created');
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
    if (!window.confirm('Delete this parent?')) return;
    await userService.delete(id);
    toast('success', 'Deleted', 'Parent removed');
    fetchAll();
  };

  return (
    <div className="dashboard-container-v2">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="welcome-banner">
        <div className="welcome-text">
          <h1>Parent <span>Registry</span></h1>
          <p>{parents.length} registered parents</p>
        </div>
        {isAdmin && (
          <div className="banner-actions">
            <button className="btn-glow-primary" onClick={() => openModal()}>
              <UserPlus size={16} /> Add Parent
            </button>
          </div>
        )}
      </motion.div>

      <div className="bento-card-v2" style={{ marginTop: '1.5rem' }}>
        <table className="marks-table">
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Children</th>{isAdmin && <th>Actions</th>}</tr>
          </thead>
          <tbody>
            {parents.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No parents registered</td></tr>
            ) : parents.map(p => {
              const children = students.filter(s => s.parentId === p.id);
              return (
                <tr key={p.id}>
                  <td className="text-muted">#{p.id}</td>
                  <td><strong>{p.name}</strong></td>
                  <td className="text-muted">{p.email}</td>
                  <td className="text-muted">{p.phoneNumber || '—'}</td>
                  <td>
                    {children.length === 0
                      ? <span className="text-muted">None linked</span>
                      : children.map(c => <span key={c.id} className="grade-badge" style={{ marginRight: '4px' }}>{c.name}</span>)}
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="icon-btn" onClick={() => openModal(p)}><Edit size={14} /></button>
                        <button className="icon-btn danger" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="elite-modal-panel">
              <div className="modal-top">
                <h2><Users size={20} /> {editUser ? 'Edit Parent' : 'Add Parent'}</h2>
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
                    <label>Phone Number</label>
                    <input type="text" placeholder="+1 555 000 0000" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Address</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  </div>
                  <div className="form-field full">
                    <label>Link Children (Students)</label>
                    <select
                      multiple
                      style={{ height: '100px' }}
                      value={formData.studentIds.map(String)}
                      onChange={e => {
                        const values = Array.from(e.target.selectedOptions, option => Number(option.value));
                        setFormData({ ...formData, studentIds: values });
                      }}
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.grade || 'No Grade'})</option>
                      ))}
                    </select>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Hold Ctrl (or Cmd) to select multiple students.
                    </span>
                  </div>
                </div>
                <div className="form-submit-row">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-glow-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : <><Save size={14} /> {editUser ? 'Save Changes' : 'Create Account'}</>}
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

export default Parents;
