import { useState, useEffect } from 'react';
import { markService, peopleService, subjectService } from '../../services/api';
import { Plus, Trash2 } from 'lucide-react';
import './Marks.css';

interface Mark {
  id: number;
  studentId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
  score: number;
  maxScore: number;
  examType: string;
  semester: string;
}

const Marks = () => {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const getRole = () => {
    const role = localStorage.getItem('hubUserRole');
    if (role) return role;
    const user = localStorage.getItem('hubUser');
    if (user) {
      try {
        return JSON.parse(user).role || '';
      } catch { return ''; }
    }
    return '';
  };
  const userRole = getRole();
  const isAdmin = userRole === 'ADMIN';
  const isLecturer = userRole === 'LECTURER';
  const isParent = userRole === 'PARENT';
  const canEdit = isAdmin || isLecturer;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const requests: Promise<any>[] = [markService.getAll()];
      
      // Only fetch students and subjects for admin and lecturer
      if (isAdmin || isLecturer) {
        requests.push(peopleService.getStudents(), subjectService.getAll());
      }
      
      const results = await Promise.all(requests);
      setMarks(results[0].data);
      if (results[1]) setStudents(results[1].data);
      if (results[2]) setSubjects(results[2].data);
    } catch (err) {
      console.error(err);
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
        subjectId: Number(formData.get('subjectId')),
        score: Number(formData.get('score')),
        maxScore: Number(formData.get('maxScore')) || 100,
        examType: formData.get('examType'),
        semester: formData.get('semester'),
      };
      await markService.create(data);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to save mark');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this mark?')) return;
    try {
      await markService.delete(id);
      fetchData();
    } catch (err) {
      setError('Failed to delete');
    }
  };

  return (
    <div className="marks-page">
      <div className="page-header">
        <h1>Marks & Grades</h1>
        {canEdit && <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Add Mark</button>}
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading ? <div className="loading">Loading...</div> : (
        <div className="marks-table">
          <table>
            <thead><tr><th>Student</th><th>Subject</th><th>Score</th><th>Exam</th><th>Semester</th>{canEdit && <th>Actions</th>}</tr></thead>
            <tbody>
              {marks.map(m => (
                <tr key={m.id}>
                  <td>{m.studentName}</td>
                  <td>{m.subjectName}</td>
                  <td>{m.score}/{m.maxScore}</td>
                  <td>{m.examType}</td>
                  <td>{m.semester}</td>
                  {canEdit && <td><button className="btn-danger btn-sm" onClick={() => handleDelete(m.id)}><Trash2 size={14} /></button></td>}
                </tr>
              ))}
              {marks.length === 0 && <tr><td colSpan={canEdit ? 6 : 5}>No marks found</td></tr>}
            </tbody>
          </table>
          {isParent && marks.length > 0 && (
            <p className="info-text">Showing marks for your children only</p>
          )}
        </div>
      )}
      {showModal && canEdit && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Mark</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Student</label><select name="studentId" required><option value="">Select</option>{students.map(s => <option key={s.id} value={s.id}>{s.userName}</option>)}</select></div>
              <div className="form-group"><label>Subject</label><select name="subjectId" required><option value="">Select</option>{subjects.filter(s => !isLecturer || s.lecturerName).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              <div className="form-group"><label>Score</label><input name="score" type="number" required /></div>
              <div className="form-group"><label>Max Score</label><input name="maxScore" type="number" defaultValue={100} /></div>
              <div className="form-group"><label>Exam Type</label><input name="examType" placeholder="Midterm, Final, etc." /></div>
              <div className="form-group"><label>Semester</label><input name="semester" placeholder="Semester 1 2026" /></div>
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

export default Marks;