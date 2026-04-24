import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, CalendarCheck, GraduationCap, Plus, Edit, Trash2, X, Save
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import {
  subjectService, markService, scheduleService, userService
} from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Dashboard.css';
import './StudentDashboard.css';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

const LecturerDashboard = () => {
  const { user } = useUser();
  const { toast } = useToast();

  const [tab, setTab] = useState<'marks' | 'schedule' | 'subjects'>('marks');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [lecturerId, setLecturerId] = useState<number | null>(null);

  // Mark form
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [editMark, setEditMark] = useState<any>(null);
  const [markForm, setMarkForm] = useState({
    studentId: '', subjectId: '', score: '', maxScore: '100',
    examType: 'Midterm', semester: '', remarks: ''
  });

  // Schedule form
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editSchedule, setEditSchedule] = useState<any>(null);
  const [schedForm, setSchedForm] = useState({
    subjectId: '', dayOfWeek: 'MON', startTime: '08:00', endTime: '09:30',
    room: '', semester: '', gradeLevel: ''
  });

  // Subject form
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editSubject, setEditSubject] = useState<any>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', gradeLevel: '', description: '' });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        subjectService.getAll(),
        markService.getAll(),
        userService.getAll('STUDENT'),
        userService.getAll('LECTURER')
      ]);

      const subjectsRes = results[0].status === 'fulfilled' ? results[0].value : { data: [] };
      const marksRes = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
      const studentsRes = results[2].status === 'fulfilled' ? results[2].value : { data: [] };
      const usersRes = results[3].status === 'fulfilled' ? results[3].value : { data: [] };

      setStudents(studentsRes.data);

      // Identify the lecturer's entity ID
      let lecturerEntityId = user?.lecturerId;
      
      if (!lecturerEntityId && user?.id) {
        // Fallback: Find lecturer by matching user id
        const myProfile = usersRes.data?.find((u: any) => u.id === Number(user.id));
        if (myProfile) lecturerEntityId = myProfile.lecturerId;
      }
      
      if (lecturerEntityId) setLecturerId(lecturerEntityId);

      // Filter subjects by lecturerId (robust) or fallback to name
      const mySubjects = subjectsRes.data.filter((s: any) => 
        (lecturerEntityId && s.lecturerId === lecturerEntityId) || 
        (s.lecturerName === user!.name)
      );
      
      setSubjects(mySubjects);

      if (lecturerEntityId) {
        const schedRes = await scheduleService.getAll({ lecturerId: lecturerEntityId });
        setSchedule(schedRes.data);
      }

      const mySubjectIds = mySubjects.map((s: any) => s.id);
      const myMarks = marksRes.data.filter((m: any) => mySubjectIds.includes(m.subjectId));
      setMarks(myMarks);
      setStudents(studentsRes.data);
    } catch (err) {
      toast('error', 'Load Error', 'Could not load data');
    }
  };

  const openMarkModal = (mark?: any) => {
    if (mark) {
      setEditMark(mark);
      setMarkForm({
        studentId: mark.studentId, subjectId: mark.subjectId,
        score: mark.score, maxScore: mark.maxScore, examType: mark.examType,
        semester: mark.semester || '', remarks: mark.remarks || ''
      });
    } else {
      setEditMark(null);
      setMarkForm({ studentId: '', subjectId: subjects[0]?.id || '', score: '', maxScore: '100', examType: 'Midterm', semester: '', remarks: '' });
    }
    setShowMarkModal(true);
  };

  const handleMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        studentId: Number(markForm.studentId),
        subjectId: Number(markForm.subjectId),
        score: Number(markForm.score),
        maxScore: Number(markForm.maxScore),
        examType: markForm.examType,
        semester: markForm.semester,
        remarks: markForm.remarks
      };
      if (editMark) {
        await markService.update(editMark.id, payload);
        toast('success', 'Updated', 'Mark updated successfully');
      } else {
        await markService.create(payload);
        toast('success', 'Added', 'Mark recorded successfully');
      }
      setShowMarkModal(false);
      loadData();
    } catch (err) {
      toast('error', 'Failed', 'Could not save mark');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMark = async (id: number) => {
    if (!window.confirm('Delete this mark?')) return;
    await markService.delete(id);
    toast('success', 'Deleted', 'Mark removed');
    loadData();
  };

  const openScheduleModal = (sched?: any) => {
    if (sched) {
      setEditSchedule(sched);
      setSchedForm({
        subjectId: sched.subjectId, dayOfWeek: sched.dayOfWeek,
        startTime: sched.startTime, endTime: sched.endTime,
        room: sched.room || '', semester: sched.semester || '', gradeLevel: sched.gradeLevel || ''
      });
    } else {
      setEditSchedule(null);
      setSchedForm({ subjectId: subjects[0]?.id || '', dayOfWeek: 'MON', startTime: '08:00', endTime: '09:30', room: '', semester: '', gradeLevel: '' });
    }
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...schedForm, subjectId: Number(schedForm.subjectId) };
      if (editSchedule) {
        await scheduleService.update(editSchedule.id, payload);
        toast('success', 'Updated', 'Schedule updated');
      } else {
        await scheduleService.create(payload);
        toast('success', 'Added', 'Class scheduled');
      }
      setShowScheduleModal(false);
      loadData();
    } catch (err) {
      toast('error', 'Failed', 'Could not save schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!window.confirm('Delete this class slot?')) return;
    await scheduleService.delete(id);
    toast('success', 'Deleted', 'Schedule removed');
    loadData();
  };

  const openSubjectModal = (subj?: any) => {
    if (subj) {
      setEditSubject(subj);
      setSubjectForm({ name: subj.name, code: subj.code || '', gradeLevel: subj.gradeLevel || '', description: subj.description || '' });
    } else {
      setEditSubject(null);
      setSubjectForm({ name: '', code: '', gradeLevel: '', description: '' });
    }
    setShowSubjectModal(true);
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = { 
        ...subjectForm, 
        lecturerId: lecturerId || user?.lecturerId || null 
      };
      
      if (editSubject) {
        await subjectService.update(editSubject.id, payload);
        toast('success', 'Updated', 'Subject updated');
      } else {
        await subjectService.create(payload);
        toast('success', 'Created', 'Subject added to your roster');
      }
      setShowSubjectModal(false);
      loadData();
    } catch (err) {
      toast('error', 'Failed', 'Could not save subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await subjectService.delete(id);
      toast('success', 'Deleted', 'Subject removed');
      loadData();
    } catch {
      toast('error', 'Failed', 'Could not delete subject');
    }
  };

  return (
    <div className="dashboard-container-v2">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="welcome-banner">
        <div className="welcome-text">
          <h1>Lecturer <span>Portal</span></h1>
          <p>Manage marks, schedules & subjects</p>
        </div>
        <div className="banner-actions">
          <div className="uptime-pill"><div className="dot" /> {subjects.length} Subjects</div>
        </div>
      </motion.div>

      <div className="stats-row-v2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { label: 'My Subjects', value: subjects.length, icon: <BookOpen size={22} />, theme: 'indigo' },
          { label: 'Marks Recorded', value: marks.length, icon: <GraduationCap size={22} />, theme: 'emerald' },
          { label: 'Scheduled Classes', value: schedule.length, icon: <CalendarCheck size={22} />, theme: 'rose' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`stat-card-v2 ${s.theme}`}>
            <div className="stat-card-inner">
              <div className="stat-icon-box">{s.icon}</div>
              <div className="stat-data">
                <div className="stat-title">{s.label}</div>
                <div className="stat-row"><h2 className="stat-number">{s.value}</h2></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="sms-tabs">
        {[
          { key: 'marks', label: 'Student Marks', icon: <GraduationCap size={16} /> },
          { key: 'schedule', label: 'Class Schedule', icon: <CalendarCheck size={16} /> },
          { key: 'subjects', label: 'My Subjects', icon: <BookOpen size={16} /> },
        ].map(t => (
          <button key={t.key} className={`sms-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key as any)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-content-panel">

        {/* MARKS TAB */}
        {tab === 'marks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn-glow-primary" onClick={() => openMarkModal()}>
                <Plus size={16} /> Add Mark
              </button>
            </div>
            <table className="marks-table">
              <thead>
                <tr>
                  <th>Student</th><th>Subject</th><th>Exam</th><th>Score</th><th>Max</th><th>%</th><th>Semester</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {marks.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No marks recorded yet</td></tr>
                ) : marks.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.studentName}</strong></td>
                    <td>{m.subjectName}</td>
                    <td><span className="exam-badge">{m.examType}</span></td>
                    <td>{m.score}</td>
                    <td>{m.maxScore}</td>
                    <td><span className={`pct-pill ${(m.score/m.maxScore)*100 >= 50 ? 'pass' : 'fail'}`}>{Math.round((m.score/m.maxScore)*100)}%</span></td>
                    <td>{m.semester || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="icon-btn" onClick={() => openMarkModal(m)}><Edit size={14} /></button>
                        <button className="icon-btn danger" onClick={() => handleDeleteMark(m.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {tab === 'schedule' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn-glow-primary" onClick={() => openScheduleModal()}>
                <Plus size={16} /> Add Class
              </button>
            </div>
            <div className="schedule-grid">
              {DAYS.map(day => {
                const dayClasses = schedule.filter(s => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
                return (
                  <div key={day} className="schedule-day-col">
                    <div className="schedule-day-header">{day}</div>
                    {dayClasses.length === 0 ? (
                      <div className="schedule-empty">Free</div>
                    ) : dayClasses.map((s: any) => (
                      <div key={s.id} className="schedule-slot" style={{ position: 'relative' }}>
                        <div className="slot-subject">{s.subjectName}</div>
                        <div className="slot-time">{s.startTime} – {s.endTime}</div>
                        {s.room && <div className="slot-room">Room: {s.room}</div>}
                        {s.gradeLevel && <div className="slot-room">{s.gradeLevel}</div>}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                          <button className="icon-btn small" onClick={() => openScheduleModal(s)}><Edit size={12} /></button>
                          <button className="icon-btn danger small" onClick={() => handleDeleteSchedule(s.id)}><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBJECTS TAB */}
        {tab === 'subjects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <button className="btn-glow-primary" onClick={() => openSubjectModal()}>
                <Plus size={16} /> Add New Subject
              </button>
            </div>
            <div className="children-grid">
              {subjects.length === 0 ? (
                <div className="empty-state"><BookOpen size={48} /><p>No subjects assigned to you yet</p></div>
              ) : subjects.map(s => (
                <div key={s.id} className="child-card">
                  <div className="child-avatar" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}>
                    {s.code ? s.code[0] : s.name[0]}
                  </div>
                  <div className="child-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3>{s.name}</h3>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="icon-btn small" onClick={() => openSubjectModal(s)}><Edit size={12} /></button>
                        <button className="icon-btn danger small" onClick={() => handleDeleteSubject(s.id)}><Trash2 size={12} /></button>
                      </div>
                    </div>
                    {s.code && <p>Code: {s.code}</p>}
                    {s.gradeLevel && <span className="grade-badge">{s.gradeLevel}</span>}
                    {s.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{s.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Mark Modal */}
      <AnimatePresence>
        {showMarkModal && (
          <div className="modal-portal">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowMarkModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="elite-modal-panel wide">
              <div className="modal-top">
                <h2>{editMark ? 'Edit Mark' : 'Record Mark'}</h2>
                <button className="close-portal" onClick={() => setShowMarkModal(false)}><X size={22} /></button>
              </div>
              <form onSubmit={handleMarkSubmit} className="elite-form">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Student</label>
                    <select required value={markForm.studentId} onChange={e => setMarkForm({ ...markForm, studentId: e.target.value })}>
                      <option value="">Select Student</option>
                      {students.map(s => <option key={s.id} value={s.studentId || s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Subject</label>
                    <select required value={markForm.subjectId} onChange={e => setMarkForm({ ...markForm, subjectId: e.target.value })}>
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Exam Type</label>
                    <select value={markForm.examType} onChange={e => setMarkForm({ ...markForm, examType: e.target.value })}>
                      {['Midterm', 'Final', 'Assignment', 'Quiz', 'Practical'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Semester</label>
                    <input type="text" placeholder="e.g. Semester 1 2024" value={markForm.semester} onChange={e => setMarkForm({ ...markForm, semester: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Score</label>
                    <input type="number" required step="0.1" min="0" value={markForm.score} onChange={e => setMarkForm({ ...markForm, score: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Max Score</label>
                    <input type="number" required step="0.1" min="1" value={markForm.maxScore} onChange={e => setMarkForm({ ...markForm, maxScore: e.target.value })} />
                  </div>
                  <div className="form-field full">
                    <label>Remarks</label>
                    <input type="text" placeholder="Optional remarks..." value={markForm.remarks} onChange={e => setMarkForm({ ...markForm, remarks: e.target.value })} />
                  </div>
                </div>
                <div className="form-submit-row">
                  <button type="button" className="btn-cancel" onClick={() => setShowMarkModal(false)}>Cancel</button>
                  <button type="submit" className="btn-glow-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : <><Save size={14} /> Save Mark</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="modal-portal">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowScheduleModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="elite-modal-panel wide">
              <div className="modal-top">
                <h2>{editSchedule ? 'Edit Schedule' : 'Add Class Slot'}</h2>
                <button className="close-portal" onClick={() => setShowScheduleModal(false)}><X size={22} /></button>
              </div>
              <form onSubmit={handleScheduleSubmit} className="elite-form">
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Subject</label>
                    <select required value={schedForm.subjectId} onChange={e => setSchedForm({ ...schedForm, subjectId: e.target.value })}>
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Day of Week</label>
                    <select value={schedForm.dayOfWeek} onChange={e => setSchedForm({ ...schedForm, dayOfWeek: e.target.value })}>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Grade Level</label>
                    <input type="text" placeholder="e.g. Year 1" value={schedForm.gradeLevel} onChange={e => setSchedForm({ ...schedForm, gradeLevel: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Start Time</label>
                    <input type="time" required value={schedForm.startTime} onChange={e => setSchedForm({ ...schedForm, startTime: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>End Time</label>
                    <input type="time" required value={schedForm.endTime} onChange={e => setSchedForm({ ...schedForm, endTime: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Room</label>
                    <input type="text" placeholder="e.g. A101" value={schedForm.room} onChange={e => setSchedForm({ ...schedForm, room: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Semester</label>
                    <input type="text" placeholder="e.g. Semester 1 2024" value={schedForm.semester} onChange={e => setSchedForm({ ...schedForm, semester: e.target.value })} />
                  </div>
                </div>
                <div className="form-submit-row">
                  <button type="button" className="btn-cancel" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                  <button type="submit" className="btn-glow-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : <><Save size={14} /> Save Schedule</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subject Modal */}
      <AnimatePresence>
        {showSubjectModal && (
          <div className="modal-portal">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowSubjectModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="elite-modal-panel wide">
              <div className="modal-top">
                <h2>{editSubject ? 'Edit Subject' : 'Create New Subject'}</h2>
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
                    <label>Grade / Year Level</label>
                    <input type="text" placeholder="e.g. Year 1" value={subjectForm.gradeLevel} onChange={e => setSubjectForm({ ...subjectForm, gradeLevel: e.target.value })} />
                  </div>
                  <div className="form-field full">
                    <label>Description</label>
                    <textarea rows={2} value={subjectForm.description} onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })} />
                  </div>
                </div>
                <div className="form-submit-row">
                  <button type="button" className="btn-cancel" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                  <button type="submit" className="btn-glow-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : <><Save size={14} /> {editSubject ? 'Update Subject' : 'Create Subject'}</>}
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

export default LecturerDashboard;
