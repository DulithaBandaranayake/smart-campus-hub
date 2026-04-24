import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, GraduationCap, ClipboardList, FileText, Shield,
  CheckCircle2, XCircle, Plus, Edit, Trash2, X, Save,
  BookOpen, TrendingUp
} from 'lucide-react';
import {
  userService, subjectService, leaveService,
  attendanceService
} from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Dashboard.css';
import './StudentDashboard.css';

const AdminDashboard = () => {
  const { toast } = useToast();

  const [tab, setTab] = useState<'overview' | 'users' | 'subjects' | 'leaves' | 'attendance'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [_loading, setLoading] = useState(true);

  // Subject modal
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editSubject, setEditSubject] = useState<any>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', gradeLevel: '', lecturerId: '', description: '' });

  // Attendance modal
  const [showAttModal, setShowAttModal] = useState(false);
  const [attForm, setAttForm] = useState({ studentId: '', date: new Date().toISOString().slice(0, 10), status: 'PRESENT', note: '' });

  // Admin leave review comment
  const [adminComment, setAdminComment] = useState<Record<number, string>>({});

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [usersRes, subjectsRes, leavesRes, attRes] = await Promise.all([
        userService.getAll(),
        subjectService.getAll(),
        leaveService.getAll(),
        attendanceService.getAll(),
      ]);
      const allUsers = usersRes.data;
      setUsers(allUsers);
      setStudents(allUsers.filter((u: any) => u.role === 'STUDENT'));
      setLecturers(allUsers.filter((u: any) => u.role === 'LECTURER'));
      setParents(allUsers.filter((u: any) => u.role === 'PARENT'));
      setSubjects(subjectsRes.data);
      setLeaves(leavesRes.data);
      setAttendance(attRes.data);
    } catch (err) {
      toast('error', 'Load Error', 'Could not load admin data');
    } finally {
      setLoading(false);
    }
  };

  // Subject CRUD
  const openSubjectModal = (subj?: any) => {
    if (subj) {
      setEditSubject(subj);
      setSubjectForm({ name: subj.name, code: subj.code || '', gradeLevel: subj.gradeLevel || '', lecturerId: subj.lecturerId || '', description: subj.description || '' });
    } else {
      setEditSubject(null);
      setSubjectForm({ name: '', code: '', gradeLevel: '', lecturerId: '', description: '' });
    }
    setShowSubjectModal(true);
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...subjectForm, lecturerId: subjectForm.lecturerId ? Number(subjectForm.lecturerId) : null };
      if (editSubject) {
        await subjectService.update(editSubject.id, payload);
        toast('success', 'Updated', 'Subject updated');
      } else {
        await subjectService.create(payload);
        toast('success', 'Created', 'Subject added');
      }
      setShowSubjectModal(false);
      loadAll();
    } catch (err) {
      toast('error', 'Failed', 'Could not save subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!window.confirm('Delete this subject?')) return;
    await subjectService.delete(id);
    toast('success', 'Deleted', 'Subject removed');
    loadAll();
  };

  // Attendance CRUD
  const handleAttSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await attendanceService.upsert({
        studentId: Number(attForm.studentId),
        date: attForm.date,
        status: attForm.status,
        note: attForm.note,
      });
      toast('success', 'Saved', 'Attendance recorded');
      setShowAttModal(false);
      setAttForm({ studentId: '', date: new Date().toISOString().slice(0, 10), status: 'PRESENT', note: '' });
      loadAll();
    } catch (err) {
      toast('error', 'Failed', 'Could not save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAtt = async (id: number) => {
    if (!window.confirm('Delete this attendance record?')) return;
    await attendanceService.delete(id);
    toast('success', 'Deleted', 'Record removed');
    loadAll();
  };

  // Leave admin review
  const handleAdminReview = async (leaveId: number, approved: boolean) => {
    try {
      await leaveService.adminReview(leaveId, approved, adminComment[leaveId] || '');
      toast('success', approved ? 'Approved' : 'Rejected', 'Leave request processed');
      setAdminComment(prev => ({ ...prev, [leaveId]: '' }));
      loadAll();
    } catch (err) {
      toast('error', 'Failed', 'Could not process leave');
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm('Permanently delete this user?')) return;
    await userService.delete(id);
    toast('success', 'Deleted', 'User removed');
    loadAll();
  };

  const pendingAdminLeaves = leaves.filter((l: any) => l.status === 'PENDING_ADMIN');
  const attColor = (s: string) => ({ PRESENT: '#10B981', ABSENT: '#EF4444', LATE: '#F59E0B', EXCUSED: '#6366F1' }[s] || '#94A3B8');

  return (
    <div className="dashboard-container-v2">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="welcome-banner">
        <div className="welcome-text">
          <h1>Admin <span>Control Panel</span></h1>
          <p>Full System Management</p>
        </div>
        <div className="banner-actions">
          {pendingAdminLeaves.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 16px', borderRadius: '20px', color: '#EF4444', fontWeight: 600 }}>
              <FileText size={16} /> {pendingAdminLeaves.length} leave{pendingAdminLeaves.length > 1 ? 's' : ''} need review
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="stats-row-v2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { label: 'Students', value: students.length, icon: <GraduationCap size={20} />, theme: 'indigo' },
          { label: 'Parents', value: parents.length, icon: <Users size={20} />, theme: 'emerald' },
          { label: 'Lecturers', value: lecturers.length, icon: <Shield size={20} />, theme: 'rose' },
          { label: 'Subjects', value: subjects.length, icon: <BookOpen size={20} />, theme: 'indigo' },
          { label: 'Pending Leaves', value: pendingAdminLeaves.length, icon: <FileText size={20} />, theme: 'rose' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className={`stat-card-v2 ${s.theme}`}>
            <div className="stat-card-inner">
              <div className="stat-icon-box">{s.icon}</div>
              <div className="stat-data">
                <div className="stat-title">{s.label}</div>
                <h2 className="stat-number">{s.value}</h2>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="sms-tabs">
        {[
          { key: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
          { key: 'users', label: 'All Users', icon: <Users size={16} /> },
          { key: 'subjects', label: 'Subjects', icon: <BookOpen size={16} /> },
          { key: 'leaves', label: `Leaves ${pendingAdminLeaves.length > 0 ? `(${pendingAdminLeaves.length})` : ''}`, icon: <FileText size={16} /> },
          { key: 'attendance', label: 'Attendance', icon: <ClipboardList size={16} /> },
        ].map(t => (
          <button key={t.key} className={`sms-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key as any)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-content-panel">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="children-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="subject-marks-card">
              <div className="subject-marks-header"><h3><Users size={18} /> Recent Users</h3></div>
              <table className="marks-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                <tbody>
                  {users.slice(0, 8).map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td className="text-muted">{u.email}</td>
                      <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'LECTURER' ? 'badge-info' : u.role === 'PARENT' ? 'badge-warning' : 'badge-success'}`}>{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="subject-marks-card">
              <div className="subject-marks-header"><h3><FileText size={18} /> Leave Pipeline</h3></div>
              {leaves.length === 0 ? <div className="empty-state" style={{ padding: '2rem' }}><p>No leave requests</p></div> :
                <div className="leave-list">
                  {leaves.slice(0, 5).map((lr: any) => (
                    <div key={lr.id} className="leave-card" style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{lr.studentName}</strong>
                          <p style={{ margin: '2px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lr.reason}</p>
                        </div>
                        <span className={`badge ${lr.status === 'APPROVED' ? 'badge-success' : lr.status === 'REJECTED' ? 'badge-danger' : lr.status === 'PENDING_PARENT' ? 'badge-warning' : 'badge-info'}`}>
                          {lr.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div>
            <table className="marks-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Grade/Dept</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="text-muted">#{u.id}</td>
                    <td><strong>{u.name}</strong></td>
                    <td className="text-muted">{u.email}</td>
                    <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'LECTURER' ? 'badge-info' : u.role === 'PARENT' ? 'badge-warning' : 'badge-success'}`}>{u.role}</span></td>
                    <td className="text-muted">{u.grade || u.department || '—'}</td>
                    <td>
                      <button className="icon-btn danger" onClick={() => deleteUser(u.id)} title="Delete user"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUBJECTS TAB */}
        {tab === 'subjects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn-glow-primary" onClick={() => openSubjectModal()}>
                <Plus size={16} /> Add Subject
              </button>
            </div>
            <table className="marks-table">
              <thead><tr><th>Name</th><th>Code</th><th>Grade Level</th><th>Lecturer</th><th>Actions</th></tr></thead>
              <tbody>
                {subjects.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No subjects yet</td></tr>
                ) : subjects.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td><span className="exam-badge">{s.code || '—'}</span></td>
                    <td>{s.gradeLevel || '—'}</td>
                    <td>{s.lecturerName || 'Unassigned'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="icon-btn" onClick={() => openSubjectModal(s)}><Edit size={14} /></button>
                        <button className="icon-btn danger" onClick={() => handleDeleteSubject(s.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LEAVES TAB */}
        {tab === 'leaves' && (
          <div>
            {pendingAdminLeaves.length > 0 && (
              <>
                <h3 style={{ marginBottom: '1rem', color: '#EF4444' }}>🔴 Awaiting Admin Decision</h3>
                <div className="leave-list" style={{ marginBottom: '2rem' }}>
                  {pendingAdminLeaves.map(lr => (
                    <div key={lr.id} className="leave-card" style={{ borderLeft: '3px solid #EF4444' }}>
                      <div className="leave-card-top">
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <strong>{lr.studentName}</strong>
                            {lr.studentGrade && <span className="grade-badge">{lr.studentGrade}</span>}
                            {lr.parentName && <span className="text-muted" style={{ fontSize: '0.8rem' }}>Parent: {lr.parentName}</span>}
                          </div>
                          <p className="leave-reason">{lr.reason}</p>
                          <div className="leave-dates">{lr.startDate} → {lr.endDate}</div>
                          {lr.parentComment && <p style={{ marginTop: '4px', fontSize: '0.82rem', color: 'var(--text-dim)' }}>Parent note: {lr.parentComment}</p>}
                        </div>
                        <span className="badge badge-info">PENDING ADMIN</span>
                      </div>
                      <div style={{ marginTop: '1rem' }}>
                        <textarea
                          placeholder="Admin decision comment (optional)..."
                          value={adminComment[lr.id] || ''}
                          onChange={e => setAdminComment(prev => ({ ...prev, [lr.id]: e.target.value }))}
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', marginBottom: '8px', resize: 'vertical', fontFamily: 'inherit' }}
                          rows={2}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-approve" onClick={() => handleAdminReview(lr.id, true)}>
                            <CheckCircle2 size={16} /> Final Approve
                          </button>
                          <button className="btn-reject" onClick={() => handleAdminReview(lr.id, false)}>
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <h3 style={{ marginBottom: '1rem' }}>All Leave Requests</h3>
            <table className="marks-table">
              <thead><tr><th>Student</th><th>Reason</th><th>Dates</th><th>Status</th><th>Parent</th></tr></thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No leave requests</td></tr>
                ) : leaves.map(lr => (
                  <tr key={lr.id}>
                    <td><strong>{lr.studentName}</strong></td>
                    <td className="text-muted" style={{ maxWidth: '200px' }}>{lr.reason}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{lr.startDate} → {lr.endDate}</td>
                    <td>
                      <span className={`badge ${lr.status === 'APPROVED' ? 'badge-success' : lr.status === 'REJECTED' ? 'badge-danger' : lr.status === 'PENDING_PARENT' ? 'badge-warning' : 'badge-info'}`}>
                        {lr.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-muted">{lr.parentName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {tab === 'attendance' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn-glow-primary" onClick={() => setShowAttModal(true)}>
                <Plus size={16} /> Mark Attendance
              </button>
            </div>
            <table className="marks-table">
              <thead><tr><th>Student</th><th>Grade</th><th>Date</th><th>Status</th><th>Note</th><th>Actions</th></tr></thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No attendance records</td></tr>
                ) : [...attendance].sort((a, b) => b.date.localeCompare(a.date)).map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.studentName}</strong></td>
                    <td className="text-muted">{a.studentGrade || '—'}</td>
                    <td>{a.date}</td>
                    <td><span className="att-badge" style={{ background: attColor(a.status) + '22', color: attColor(a.status), border: `1px solid ${attColor(a.status)}` }}>{a.status}</span></td>
                    <td className="text-muted">{a.note || '—'}</td>
                    <td>
                      <button className="icon-btn danger" onClick={() => handleDeleteAtt(a.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Subject Modal */}
      <AnimatePresence>
        {showSubjectModal && (
          <div className="modal-portal">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowSubjectModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="elite-modal-panel wide">
              <div className="modal-top">
                <h2>{editSubject ? 'Edit Subject' : 'Add Subject'}</h2>
                <button className="close-portal" onClick={() => setShowSubjectModal(false)}><X size={22} /></button>
              </div>
              <form onSubmit={handleSubjectSubmit} className="elite-form">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Subject Name</label>
                    <input type="text" required value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Code</label>
                    <input type="text" placeholder="e.g. CS101" value={subjectForm.code} onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Grade Level</label>
                    <input type="text" placeholder="e.g. Year 1, Freshman" value={subjectForm.gradeLevel} onChange={e => setSubjectForm({ ...subjectForm, gradeLevel: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Assign Lecturer</label>
                    <select value={subjectForm.lecturerId} onChange={e => setSubjectForm({ ...subjectForm, lecturerId: e.target.value })}>
                      <option value="">Unassigned</option>
                      {lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="form-field full">
                    <label>Description</label>
                    <textarea rows={2} value={subjectForm.description} onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })} />
                  </div>
                </div>
                <div className="form-submit-row">
                  <button type="button" className="btn-cancel" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                  <button type="submit" className="btn-glow-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : <><Save size={14} /> Save Subject</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attendance Modal */}
      <AnimatePresence>
        {showAttModal && (
          <div className="modal-portal">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowAttModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="elite-modal-panel">
              <div className="modal-top">
                <h2>Mark Attendance</h2>
                <button className="close-portal" onClick={() => setShowAttModal(false)}><X size={22} /></button>
              </div>
              <form onSubmit={handleAttSubmit} className="elite-form">
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Student</label>
                    <select required value={attForm.studentId} onChange={e => setAttForm({ ...attForm, studentId: e.target.value })}>
                      <option value="">Select Student</option>
                      {students.map(s => <option key={s.id} value={s.studentId || s.id}>{s.name} {s.grade ? `(${s.grade})` : ''}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Date</label>
                    <input type="date" required value={attForm.date} onChange={e => setAttForm({ ...attForm, date: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Status</label>
                    <select value={attForm.status} onChange={e => setAttForm({ ...attForm, status: e.target.value })}>
                      {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-field full">
                    <label>Note (optional)</label>
                    <input type="text" placeholder="e.g. Medical, Field trip..." value={attForm.note} onChange={e => setAttForm({ ...attForm, note: e.target.value })} />
                  </div>
                </div>
                <div className="form-submit-row">
                  <button type="button" className="btn-cancel" onClick={() => setShowAttModal(false)}>Cancel</button>
                  <button type="submit" className="btn-glow-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : <><Save size={14} /> Save Attendance</>}
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

export default AdminDashboard;
