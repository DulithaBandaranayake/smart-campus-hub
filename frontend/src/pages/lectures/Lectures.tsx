import { useState, useEffect } from 'react';
import { scheduleService, subjectService } from '../../services/api';
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, BookOpen } from 'lucide-react';
import './Lectures.css';

interface Schedule {
  id: number;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  lecturerId: number;
  lecturerName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  semester: string;
  gradeLevel: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  lecturerName: string;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const Lectures = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [filterGrade, setFilterGrade] = useState('');

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
  const isAdmin = userRole === 'ADMIN' || userRole === 'TECHNICIAN';
  const isLecturer = userRole === 'LECTURER';
  const canEdit = isAdmin || isLecturer;

  useEffect(() => {
    fetchSubjects();
    fetchSchedules();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data);
    } catch (err: any) {
      console.error('Failed to load subjects');
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterGrade) params.gradeLevel = filterGrade;
      if (isLecturer) {
        const user = JSON.parse(localStorage.getItem('hubUser') || '{}');
        params.lecturerId = user.id;
      }
      const res = await scheduleService.getAll(params);
      setSchedules(res.data);
    } catch (err: any) {
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [filterGrade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const data = {
        subjectId: Number(formData.get('subjectId')),
        dayOfWeek: formData.get('dayOfWeek'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        room: formData.get('room'),
        semester: formData.get('semester'),
        gradeLevel: formData.get('gradeLevel'),
      };

      if (editingSchedule) {
        await scheduleService.update(editingSchedule.id, data);
      } else {
        await scheduleService.create(data);
      }

      setShowModal(false);
      setEditingSchedule(null);
      fetchSchedules();
    } catch (err: any) {
      setError('Failed to save schedule');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await scheduleService.delete(id);
      fetchSchedules();
    } catch (err: any) {
      setError('Failed to delete');
    }
  };

  const getDayLabel = (day: string) => {
    return day.charAt(0) + day.slice(1).toLowerCase();
  };

  return (
    <div className="lectures-page">
      <div className="page-header">
        <h1>Lectures & Schedules</h1>
        {canEdit && (
          <button className="btn-primary" onClick={() => { setEditingSchedule(null); setShowModal(true); }}>
            <Plus size={18} /> Add Schedule
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-bar">
        <label>Filter by Grade:</label>
        <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
          <option value="">All Grades</option>
          <option value="Grade 1">Grade 1</option>
          <option value="Grade 2">Grade 2</option>
          <option value="Grade 3">Grade 3</option>
          <option value="Grade 4">Grade 4</option>
          <option value="Grade 5">Grade 5</option>
          <option value="Grade 6">Grade 6</option>
          <option value="Grade 7">Grade 7</option>
          <option value="Grade 8">Grade 8</option>
          <option value="Grade 9">Grade 9</option>
          <option value="Grade 10">Grade 10</option>
          <option value="Grade 11">Grade 11</option>
          <option value="Grade 12">Grade 12</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="schedules-container">
          {schedules.length === 0 ? (
            <div className="no-data">No schedules found</div>
          ) : (
            <div className="schedules-grid">
              {schedules.map(s => (
                <div key={s.id} className="schedule-card">
                  <div className="schedule-header">
                    <div className="subject-info">
                      <h3>{s.subjectName}</h3>
                      <span className="subject-code">{s.subjectCode}</span>
                    </div>
                    {canEdit && (
                      <div className="schedule-actions">
                        <button className="btn-secondary btn-sm" onClick={() => { setEditingSchedule(s); setShowModal(true); }}>
                          <Edit size={14} />
                        </button>
                        <button className="btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="schedule-details">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>{getDayLabel(s.dayOfWeek)}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>{s.startTime} - {s.endTime}</span>
                    </div>
                    {s.room && (
                      <div className="detail-item">
                        <MapPin size={16} />
                        <span>{s.room}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <BookOpen size={16} />
                      <span>{s.lecturerName || 'No lecturer assigned'}</span>
                    </div>
                    {s.gradeLevel && (
                      <div className="detail-item">
                        <span className="grade-badge">{s.gradeLevel}</span>
                      </div>
                    )}
                    {s.semester && (
                      <div className="detail-item">
                        <span className="semester-badge">{s.semester}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingSchedule(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject *</label>
                <select name="subjectId" required defaultValue={editingSchedule?.subjectId || ''}>
                  <option value="">Select Subject</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code}) - {sub.lecturerName || 'No lecturer'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Day of Week *</label>
                  <select name="dayOfWeek" required defaultValue={editingSchedule?.dayOfWeek || ''}>
                    <option value="">Select Day</option>
                    {DAYS.map(day => (
                      <option key={day} value={day}>{getDayLabel(day)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Grade Level</label>
                  <select name="gradeLevel" defaultValue={editingSchedule?.gradeLevel || ''}>
                    <option value="">Select Grade</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time *</label>
                  <input name="startTime" type="time" required defaultValue={editingSchedule?.startTime || ''} />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input name="endTime" type="time" required defaultValue={editingSchedule?.endTime || ''} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Room</label>
                  <input name="room" placeholder="e.g., Room 101" defaultValue={editingSchedule?.room || ''} />
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <input name="semester" placeholder="e.g., Semester 1" defaultValue={editingSchedule?.semester || ''} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setEditingSchedule(null); }}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lectures;
