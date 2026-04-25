import { useState, useEffect } from 'react';
import { attendanceService, peopleService } from '../../services/api';
import { Plus, Trash2 } from 'lucide-react';
import './Attendance.css';

interface Attendance {
  id: number;
  studentId: number;
  studentName: string;
  studentGrade: string;
  date: string;
  status: string;
  note: string;
}

const Attendance = () => {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

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

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, studentsRes] = await Promise.all([
        attendanceService.getAll(),
        peopleService.getStudents()
      ]);
      setRecords(recordsRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const data = {
        studentId: Number(formData.get('studentId')),
        date: formData.get('date'),
        status: formData.get('status'),
        note: formData.get('note'),
      };
      await attendanceService.upsert(data);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to save');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await attendanceService.delete(id);
      fetchData();
    } catch (err) { setError('Failed to delete'); }
  };

  if (!isAdmin) {
    return <div className="attendance-page"><div className="page-header"><h1>Access Denied</h1></div></div>;
  }

  return (
    <div className="attendance-page">
      <div className="page-header">
        <h1>Attendance</h1>
        {isAdmin && <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Record Attendance</button>}
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading ? <div className="loading">Loading...</div> : (
        <div className="attendance-table">
          <table>
            <thead><tr><th>Date</th><th>Student</th><th>Grade</th><th>Status</th><th>Note</th><th>Actions</th></tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.studentName}</td>
                  <td>{r.studentGrade}</td>
                  <td><span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
                  <td>{r.note || '-'}</td>
                  <td><button className="btn-danger btn-sm" onClick={() => handleDelete(r.id)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan={6}>No records found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Record Attendance</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Student</label><select name="studentId" required><option value="">Select</option>{students.map(s => <option key={s.id} value={s.id}>{s.userName} ({s.grade})</option>)}</select></div>
              <div className="form-group"><label>Date</label><input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} /></div>
              <div className="form-group"><label>Status</label><select name="status" required><option value="PRESENT">Present</option><option value="ABSENT">Absent</option><option value="LATE">Late</option><option value="EXCUSED">Excused</option></select></div>
              <div className="form-group"><label>Note</label><input name="note" placeholder="Optional note" /></div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;