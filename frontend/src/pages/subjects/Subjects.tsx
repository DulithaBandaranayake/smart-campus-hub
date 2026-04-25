import { useState, useEffect } from 'react';
import { subjectService } from '../../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './Subjects.css';

interface Subject {
  id: number;
  name: string;
  code: string;
  gradeLevel: string;
  lecturerId: number;
  lecturerName: string;
  description: string;
}

const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const getRole = () => {
    const role = localStorage.getItem('hubUserRole');
    if (role) return role;
    const user = localStorage.getItem('hubUser');
    if (user) {
      try {
        return JSON.parse(user).role || '';
      } catch {
        return '';
      }
    }
    return '';
  };
  const userRole = getRole();
  const isAdmin = userRole === 'ADMIN' || userRole === 'TECHNICIAN';

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await subjectService.getAll();
      setSubjects(res.data);
    } catch (err: any) {
      setError('Failed to load subjects');
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
        name: formData.get('name'),
        code: formData.get('code'),
        gradeLevel: formData.get('gradeLevel'),
        lecturerId: formData.get('lecturerId') ? Number(formData.get('lecturerId')) : null,
        description: formData.get('description'),
      };

      if (editingSubject) {
        await subjectService.update(editingSubject.id, data);
      } else {
        await subjectService.create(data);
      }

      setShowModal(false);
      setEditingSubject(null);
      fetchSubjects();
    } catch (err: any) {
      setError('Failed to save subject');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await subjectService.delete(id);
      fetchSubjects();
    } catch (err: any) {
      setError('Failed to delete');
    }
  };

  return (
    <div className="subjects-page">
      <div className="page-header">
        <h1>Subjects</h1>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setEditingSubject(null); setShowModal(true); }}>
            <Plus size={18} /> Add Subject
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="subjects-grid">
          {subjects.map(s => (
            <div key={s.id} className="subject-card">
              <div className="subject-header">
                <h3>{s.name}</h3>
                <span className="subject-code">{s.code}</span>
              </div>
              <div className="subject-details">
                <p><strong>Grade:</strong> {s.gradeLevel || '-'}</p>
                <p><strong>Lecturer:</strong> {s.lecturerName || '-'}</p>
                {s.description && <p><strong>Description:</strong> {s.description}</p>}
              </div>
              {isAdmin && (
                <div className="subject-actions">
                  <button className="btn-secondary btn-sm" onClick={() => { setEditingSubject(s); setShowModal(true); }}>
                    <Edit size={14} /> Edit
                  </button>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {subjects.length === 0 && <div className="no-data">No subjects found</div>}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingSubject ? 'Edit Subject' : 'Add Subject'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input name="name" required defaultValue={editingSubject?.name} />
              </div>
              <div className="form-group">
                <label>Code</label>
                <input name="code" required defaultValue={editingSubject?.code} />
              </div>
              <div className="form-group">
                <label>Grade Level</label>
                <input name="gradeLevel" defaultValue={editingSubject?.gradeLevel} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" defaultValue={editingSubject?.description} />
              </div>
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

export default Subjects;