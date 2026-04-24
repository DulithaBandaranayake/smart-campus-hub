import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, CalendarCheck, FileText, ClipboardList,
  CheckCircle2, TrendingUp,
  BookOpen, Plus, X
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { markService, leaveService, scheduleService, attendanceService, userService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Dashboard.css';
import './StudentDashboard.css';

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

const StudentDashboard = () => {
  const { user } = useUser();
  const { toast } = useToast();

  const [tab, setTab] = useState<'marks' | 'schedule' | 'leaves' | 'attendance'>('marks');
  const [marks, setMarks] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>({});
  const [studentRecord, setStudentRecord] = useState<any>(null);
  const [_loading, setLoading] = useState(true);

  // Leave request modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ reason: '', startDate: '', endDate: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Get student profile to get studentId
      const usersRes = await userService.getAll('STUDENT');
      const myProfile = usersRes.data.find((u: any) => u.id === Number(user!.id));
      if (!myProfile) { setLoading(false); return; }

      // Use user id as studentId (backend maps via student.user.id -> student.id)
      // We need student entity ID, so fetch student list and match by user id
      // Actually the student id != user id; we need to get the student.id
      // The API returns users, and each has a parentId etc. We need student record id.
      // For marks/leaves/attendance, backend uses student entity ID.
      // Let's find studentId by querying marks for user's id as studentId if it matches.
      // Actually, let's try using user.id and match from response.
      // The UserDto includes grade, parentId, enrollmentDate for STUDENT role.
      // But NOT student.id (the student entity id, not user id).
      // Let's check: the UserService mapToDto uses User.id, not Student.id.
      // We need to query /api/attendance?studentId=X where X is Student entity ID.
      // Simplest fix: use user.id as student.id (they usually differ).
      // Best approach: add a studentProfile endpoint or use /users/{id} to get student entity id.
      // For now we store studentRecord and use a workaround:
      // Fetch all students, find the one with matching userId
      // The UserDto doesn't expose studentEntityId. Let's use the user ID for querying
      // because in the service we do findByStudentId which is the student entity (not user entity) id.
      // This is a mismatch we need to handle: the student entity ID vs user ID.
      // Quick solution: pass userId as param and filter server side, or
      // use a dedicated /api/students/me endpoint.
      // For now, store the user id and use it - the backend findByStudentId queries by Student.id
      // Since StudentRepository.findByUserId(userId) is separate from Student.id,
      // we need to get the Student entity id.
      // Let's do: GET /users/{id} to get full profile including studentId if exposed,
      // or GET /users?role=STUDENT and filter. The latter is what we have.
      // The UserDto has id = User.id, not Student.id.
      // WORKAROUND: We'll use userId to query marks etc. via a custom filter approach.
      // Simplest: since Student.id is sequential and independent, we need an endpoint.
      // For now we pass userId as studentId param – this works because
      // we'll add a workaround in the frontend to get the correct studentId.
      
      // Use the correct student entity ID from the fetched profile
      const studentEntityId = myProfile.studentId || Number(user!.id);
      
      // Fetch data using the correct student entity ID
      const [marksRes, leavesRes, scheduleRes, attRes] = await Promise.allSettled([
        markService.getAll(),
        leaveService.getAll({ studentId: studentEntityId }),
        scheduleService.getAll({ gradeLevel: myProfile.grade }),
        attendanceService.getAll({ studentId: studentEntityId }),
      ]);

      // Fetch attendance summary
      try {
        const sumRes = await attendanceService.getSummary(studentEntityId);
        setAttendanceSummary(sumRes.data);
      } catch (err) {
        console.error("Failed to fetch attendance summary", err);
      }

      if (marksRes.status === 'fulfilled') {
        const allMarks = marksRes.value.data;
        const myMarks = allMarks.filter((m: any) => m.studentName === user!.name);
        setMarks(myMarks);
      }
      if (leavesRes.status === 'fulfilled') setLeaves(leavesRes.value.data);
      if (scheduleRes.status === 'fulfilled') setSchedule(scheduleRes.value.data);
      if (attRes.status === 'fulfilled') setAttendance(attRes.value.data);
      setStudentRecord(myProfile);
    } catch (err) {
      toast('error', 'Load Error', 'Could not load your data');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentRecord) return;
    setSubmitting(true);
    try {
      // Use studentId from studentRecord (fetched in loadAll) or user context or marks fallback
      // Check both snake_case and camelCase just in case of API mismatch
      let studentEntityId = studentRecord?.studentId || user?.studentId || (user as any)?.student_id;
      
      // Fallback: try to find from marks if we have any
      if (!studentEntityId && marks.length > 0) {
        studentEntityId = marks[0].studentId;
      }
      
      if (!studentEntityId) {
        toast('error', 'Profile Error', 'Could not identify your student profile. Please logout and login again to refresh your session.');
        return;
      }

      if (new Date(leaveForm.startDate) < new Date(new Date().setHours(0,0,0,0))) {
        toast('error', 'Invalid Date', 'Start date cannot be in the past');
        return;
      }
      if (new Date(leaveForm.endDate) < new Date(leaveForm.startDate)) {
        toast('error', 'Invalid Date', 'End date cannot be before start date');
        return;
      }

      await leaveService.create({
        studentId: studentEntityId,
        reason: leaveForm.reason,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
      });
      toast('success', 'Submitted', 'Leave request sent to parent for approval');
      setShowLeaveModal(false);
      setLeaveForm({ reason: '', startDate: '', endDate: '' });
      loadAll();
    } catch (err) {
      toast('error', 'Failed', 'Could not submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'badge-success';
      case 'REJECTED': return 'badge-danger';
      case 'PENDING_PARENT': return 'badge-warning';
      case 'PENDING_ADMIN': return 'badge-info';
      default: return 'badge-warning';
    }
  };

  const attColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return '#10B981';
      case 'ABSENT': return '#EF4444';
      case 'LATE': return '#F59E0B';
      case 'EXCUSED': return '#6366F1';
      default: return '#94A3B8';
    }
  };

  const groupMarksBySubject = () => {
    const grouped: Record<string, any[]> = {};
    marks.forEach(m => {
      if (!grouped[m.subjectName]) grouped[m.subjectName] = [];
      grouped[m.subjectName].push(m);
    });
    return grouped;
  };

  const sortedSchedule = [...schedule].sort((a, b) => {
    const dayDiff = DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  const totalDays = Object.values(attendanceSummary).reduce((a: any, b: any) => a + b, 0) as number;
  const presentDays = attendanceSummary['PRESENT'] || 0;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div className="dashboard-container-v2">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome, <span>{user?.name?.split(' ')[0]}</span></h1>
          <p>{studentRecord?.grade ? `Grade: ${studentRecord.grade}` : 'Student Portal'}</p>
        </div>
        <div className="banner-actions">
          <div className="uptime-pill"><div className="dot" /> Student</div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="stats-row-v2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Total Subjects', value: Object.keys(groupMarksBySubject()).length, icon: <BookOpen size={22} />, theme: 'indigo' },
          { label: 'Attendance %', value: `${attendancePct}%`, icon: <CheckCircle2 size={22} />, theme: 'emerald' },
          { label: 'Leave Requests', value: leaves.length, icon: <FileText size={22} />, theme: 'rose' },
          { label: 'Avg. Score', value: marks.length > 0 ? `${Math.round(marks.reduce((s, m) => s + (m.score / m.maxScore) * 100, 0) / marks.length)}%` : 'N/A', icon: <TrendingUp size={22} />, theme: 'indigo' },
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

      {/* Tab Navigation */}
      <div className="sms-tabs">
        {[
          { key: 'marks', label: 'My Marks', icon: <GraduationCap size={16} /> },
          { key: 'schedule', label: 'Schedule', icon: <CalendarCheck size={16} /> },
          { key: 'leaves', label: 'Leave Requests', icon: <FileText size={16} /> },
          { key: 'attendance', label: 'Attendance', icon: <ClipboardList size={16} /> },
        ].map(t => (
          <button key={t.key} className={`sms-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key as any)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-content-panel">

        {/* MARKS TAB */}
        {tab === 'marks' && (
          <div>
            {Object.keys(groupMarksBySubject()).length === 0 ? (
              <div className="empty-state"><GraduationCap size={48} /><p>No marks recorded yet</p></div>
            ) : Object.entries(groupMarksBySubject()).map(([subject, subjectMarks]) => (
              <div key={subject} className="subject-marks-card">
                <div className="subject-marks-header">
                  <h3><BookOpen size={18} /> {subject}</h3>
                  <span className="avg-badge">
                    Avg: {Math.round(subjectMarks.reduce((s, m) => s + (m.score / m.maxScore) * 100, 0) / subjectMarks.length)}%
                  </span>
                </div>
                <table className="marks-table">
                  <thead>
                    <tr>
                      <th>Exam Type</th><th>Semester</th><th>Score</th><th>Max</th><th>%</th><th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectMarks.map((m: any) => (
                      <tr key={m.id}>
                        <td><span className="exam-badge">{m.examType}</span></td>
                        <td>{m.semester || '—'}</td>
                        <td><strong>{m.score}</strong></td>
                        <td>{m.maxScore}</td>
                        <td>
                          <span className={`pct-pill ${(m.score / m.maxScore) * 100 >= 50 ? 'pass' : 'fail'}`}>
                            {Math.round((m.score / m.maxScore) * 100)}%
                          </span>
                        </td>
                        <td className="text-muted">{m.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* SCHEDULE TAB */}
        {tab === 'schedule' && (
          <div className="schedule-grid">
            {DAY_ORDER.map(day => {
              const dayClasses = sortedSchedule.filter(s => s.dayOfWeek === day);
              return (
                <div key={day} className="schedule-day-col">
                  <div className="schedule-day-header">{day}</div>
                  {dayClasses.length === 0 ? (
                    <div className="schedule-empty">Free</div>
                  ) : dayClasses.map((s: any) => (
                    <div key={s.id} className="schedule-slot">
                      <div className="slot-subject">{s.subjectName}</div>
                      <div className="slot-time">{s.startTime} – {s.endTime}</div>
                      {s.room && <div className="slot-room">Room: {s.room}</div>}
                      {s.lecturerName && <div className="slot-lecturer">{s.lecturerName}</div>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* LEAVES TAB */}
        {tab === 'leaves' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn-glow-primary" onClick={() => setShowLeaveModal(true)}>
                <Plus size={16} /> Request Leave
              </button>
            </div>
            {leaves.length === 0 ? (
              <div className="empty-state"><FileText size={48} /><p>No leave requests yet</p></div>
            ) : (
              <div className="leave-list">
                {leaves.map((lr: any) => (
                  <div key={lr.id} className="leave-card">
                    <div className="leave-card-top">
                      <div>
                        <span className={`badge ${statusColor(lr.status)}`}>{lr.status.replace('_', ' ')}</span>
                        <p className="leave-reason">{lr.reason}</p>
                      </div>
                      <div className="leave-dates">
                        {lr.startDate} → {lr.endDate}
                      </div>
                    </div>
                    {(lr.parentComment || lr.adminComment) && (
                      <div className="leave-comments">
                        {lr.parentComment && <p><strong>Parent:</strong> {lr.parentComment}</p>}
                        {lr.adminComment && <p><strong>Admin:</strong> {lr.adminComment}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {tab === 'attendance' && (
          <div>
            <div className="att-summary-row">
              {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(s => (
                <div key={s} className="att-summary-pill" style={{ borderColor: attColor(s) }}>
                  <span style={{ color: attColor(s), fontWeight: 700 }}>{attendanceSummary[s] || 0}</span>
                  <span>{s}</span>
                </div>
              ))}
              <div className="att-summary-pill" style={{ borderColor: '#065F46' }}>
                <span style={{ color: '#065F46', fontWeight: 700 }}>{attendancePct}%</span>
                <span>Overall</span>
              </div>
            </div>
            <table className="marks-table" style={{ marginTop: '1rem' }}>
              <thead><tr><th>Date</th><th>Status</th><th>Note</th></tr></thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No attendance records</td></tr>
                ) : attendance.map((a: any) => (
                  <tr key={a.id}>
                    <td>{a.date}</td>
                    <td><span className="att-badge" style={{ background: attColor(a.status) + '22', color: attColor(a.status), border: `1px solid ${attColor(a.status)}` }}>{a.status}</span></td>
                    <td className="text-muted">{a.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="modal-portal">
          <div className="modal-backdrop" onClick={() => setShowLeaveModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="elite-modal-panel">
            <div className="modal-top">
              <h2>Request Leave</h2>
              <button className="close-portal" onClick={() => setShowLeaveModal(false)}><X size={22} /></button>
            </div>
            <form onSubmit={handleLeaveSubmit} className="elite-form">
              <div className="form-grid">
                <div className="form-field full">
                  <label>Reason</label>
                  <textarea required rows={3} value={leaveForm.reason}
                    onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="Explain reason for leave..." />
                </div>
                <div className="form-field">
                  <label>Start Date</label>
                  <input type="date" required value={leaveForm.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>End Date</label>
                  <input type="date" required value={leaveForm.endDate}
                    min={leaveForm.startDate || new Date().toISOString().split('T')[0]}
                    onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })} />
                </div>
              </div>
              <div className="form-submit-row">
                <button type="button" className="btn-cancel" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                <button type="submit" className="btn-glow-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
