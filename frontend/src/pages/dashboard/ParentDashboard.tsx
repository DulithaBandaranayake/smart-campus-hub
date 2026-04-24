import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FileText, GraduationCap, ClipboardList,
  CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import {
  leaveService, markService, attendanceService, userService
} from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Dashboard.css';
import './StudentDashboard.css';

const ParentDashboard = () => {
  const { user } = useUser();
  const { toast } = useToast();

  const [tab, setTab] = useState<'children' | 'leaves' | 'marks' | 'attendance'>('children');
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [allLeaves, setAllLeaves] = useState<any[]>([]);
  const [childMarks, setChildMarks] = useState<any[]>([]);
  const [childAttendance, setChildAttendance] = useState<any[]>([]);
  const [_parentEntityId, setParentEntityId] = useState<number | null>(null);
  const [comment, setComment] = useState<Record<number, string>>({});
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadParentData();
  }, [user]);

  useEffect(() => {
    if (selectedChild) loadChildData(selectedChild);
  }, [selectedChild]);

  const loadParentData = async () => {
    setLoading(true);
    try {
      // Get all students and find children of this parent
      const studentsRes = await userService.getAll('STUDENT');
      const allStudents = studentsRes.data;
      
      // Use parentId from user context to fetch leaves directly
      const params: any = {};
      if (user?.parentId) {
        params.parentId = user.parentId;
      }
      
      const leavesRes = await leaveService.getAll(params);
      let myLeaves = leavesRes.data;
      
      // If we don't have parentId yet (e.g. legacy session), fallback to name filter
      if (!user?.parentId) {
        myLeaves = myLeaves.filter((lr: any) => lr.parentName === user!.name);
      }
      
      // Get unique children linked to this parent's leaves
      const childNames = [...new Set(myLeaves.map((lr: any) => lr.studentName))];
      
      // Also filter by student entity's parentId if possible
      const myChildren = allStudents.filter((s: any) => 
        childNames.includes(s.name) || (user?.parentId && s.parentId === user.parentId)
      );
      
      setChildren(myChildren);
      if (myChildren.length > 0 && !selectedChild) setSelectedChild(myChildren[0]);

      if (myLeaves.length > 0) {
        setParentEntityId(myLeaves[0].parentId);
        const pending = myLeaves.filter((lr: any) => lr.status === 'PENDING_PARENT');
        setPendingLeaves(pending);
      }
      setAllLeaves(myLeaves);
    } catch (err) {
      toast('error', 'Load Error', 'Could not load your data');
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async (child: any) => {
    try {
      // Use the student entity ID for accurate filtering
      const studentEntityId = child.studentId || child.id;
      
      const [marksRes, attRes] = await Promise.all([
        markService.getAll({ studentId: studentEntityId }),
        attendanceService.getAll({ studentId: studentEntityId })
      ]);
      
      setChildMarks(marksRes.data);
      setChildAttendance(attRes.data);
    } catch (err) {
      toast('error', 'Error', 'Could not load student data');
    }
  };

  const handleParentReview = async (leaveId: number, approved: boolean) => {
    try {
      await leaveService.parentReview(leaveId, approved, comment[leaveId] || '');
      toast('success', approved ? 'Approved' : 'Rejected', `Leave request has been ${approved ? 'approved and sent to admin' : 'rejected'}`);
      setComment(prev => ({ ...prev, [leaveId]: '' }));
      loadParentData();
    } catch (err) {
      toast('error', 'Failed', 'Could not process review');
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

  const groupMarksBySubject = (marks: any[]) => {
    const grouped: Record<string, any[]> = {};
    marks.forEach(m => {
      if (!grouped[m.subjectName]) grouped[m.subjectName] = [];
      grouped[m.subjectName].push(m);
    });
    return grouped;
  };

  const presentCount = childAttendance.filter(a => a.status === 'PRESENT').length;
  const attPct = childAttendance.length > 0 ? Math.round((presentCount / childAttendance.length) * 100) : 0;

  return (
    <div className="dashboard-container-v2">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="welcome-banner">
        <div className="welcome-text">
          <h1>Parent <span>Portal</span></h1>
          <p>Manage your {children.length} {children.length === 1 ? 'child' : 'children'}'s information</p>
        </div>
        {pendingLeaves.length > 0 && (
          <div className="banner-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: '8px 16px', borderRadius: '20px', color: '#D97706', fontWeight: 600 }}>
              <AlertTriangle size={16} /> {pendingLeaves.length} leave{pendingLeaves.length > 1 ? 's' : ''} awaiting approval
            </div>
          </div>
        )}
      </motion.div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div className="child-selector">
          <label>Viewing:</label>
          <select value={selectedChild?.id} onChange={e => setSelectedChild(children.find(c => c.id === Number(e.target.value)))}>
            {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* Stats Row */}
      <div className="stats-row-v2" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '1rem' }}>
        {[
          { label: 'Children', value: children.length, icon: <Users size={22} />, theme: 'indigo' },
          { label: 'Pending Leaves', value: pendingLeaves.length, icon: <AlertTriangle size={22} />, theme: 'rose' },
          { label: 'Attendance', value: `${attPct}%`, icon: <ClipboardList size={22} />, theme: 'emerald' },
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

      {/* Tabs */}
      <div className="sms-tabs">
        {[
          { key: 'children', label: "Children's Details", icon: <Users size={16} /> },
          { key: 'leaves', label: `Leave Approvals ${pendingLeaves.length > 0 ? `(${pendingLeaves.length})` : ''}`, icon: <FileText size={16} /> },
          { key: 'marks', label: 'Academic Performance', icon: <GraduationCap size={16} /> },
          { key: 'attendance', label: 'Attendance', icon: <ClipboardList size={16} /> },
        ].map(t => (
          <button key={t.key} className={`sms-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key as any)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-content-panel">

        {/* CHILDREN DETAILS */}
        {tab === 'children' && (
          <div className="children-grid">
            {children.length === 0 ? (
              <div className="empty-state"><Users size={48} /><p>No children linked to your account</p></div>
            ) : children.map(child => (
              <div key={child.id} className="child-card" onClick={() => setSelectedChild(child)}>
                <div className="child-avatar">{child.name[0].toUpperCase()}</div>
                <div className="child-info">
                  <h3>{child.name}</h3>
                  <p>{child.email}</p>
                  {child.grade && <span className="grade-badge">{child.grade}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LEAVE APPROVALS */}
        {tab === 'leaves' && (
          <div>
            {pendingLeaves.length > 0 && (
              <>
                <h3 style={{ marginBottom: '1rem', color: '#D97706' }}>⚠ Awaiting Your Approval</h3>
                <div className="leave-list" style={{ marginBottom: '2rem' }}>
                  {pendingLeaves.map(lr => (
                    <div key={lr.id} className="leave-card" style={{ borderLeft: '3px solid #F59E0B' }}>
                      <div className="leave-card-top">
                        <div>
                          <strong>{lr.studentName}</strong>
                          <p className="leave-reason">{lr.reason}</p>
                          <div className="leave-dates">{lr.startDate} → {lr.endDate}</div>
                        </div>
                        <span className="badge badge-warning">PENDING</span>
                      </div>
                      <div style={{ marginTop: '1rem' }}>
                        <textarea
                          placeholder="Add a comment (optional)..."
                          value={comment[lr.id] || ''}
                          onChange={e => setComment(prev => ({ ...prev, [lr.id]: e.target.value }))}
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', marginBottom: '8px', resize: 'vertical' }}
                          rows={2}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-approve" onClick={() => handleParentReview(lr.id, true)}>
                            <CheckCircle2 size={16} /> Approve
                          </button>
                          <button className="btn-reject" onClick={() => handleParentReview(lr.id, false)}>
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h3 style={{ marginBottom: '1rem' }}>All Leave History</h3>
            {allLeaves.length === 0 ? (
              <div className="empty-state"><FileText size={48} /><p>No leave requests</p></div>
            ) : (
              <div className="leave-list">
                {allLeaves.filter(lr => lr.status !== 'PENDING_PARENT').map(lr => (
                  <div key={lr.id} className="leave-card">
                    <div className="leave-card-top">
                      <div>
                        <strong>{lr.studentName}</strong>
                        <span className={`badge ${lr.status === 'APPROVED' ? 'badge-success' : lr.status === 'REJECTED' ? 'badge-danger' : 'badge-info'}`} style={{ marginLeft: '8px' }}>
                          {lr.status.replace('_', ' ')}
                        </span>
                        <p className="leave-reason">{lr.reason}</p>
                      </div>
                      <div className="leave-dates">{lr.startDate} → {lr.endDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MARKS */}
        {tab === 'marks' && (
          <div>
            {selectedChild && <h3 style={{ marginBottom: '1rem' }}>{selectedChild.name}'s Academic Record</h3>}
            {Object.entries(groupMarksBySubject(childMarks)).length === 0 ? (
              <div className="empty-state"><GraduationCap size={48} /><p>No marks recorded</p></div>
            ) : Object.entries(groupMarksBySubject(childMarks)).map(([subject, marks]: any) => (
              <div key={subject} className="subject-marks-card">
                <div className="subject-marks-header">
                  <h3>{subject}</h3>
                  <span className="avg-badge">Avg: {Math.round(marks.reduce((s: number, m: any) => s + (m.score / m.maxScore) * 100, 0) / marks.length)}%</span>
                </div>
                <table className="marks-table">
                  <thead><tr><th>Exam</th><th>Score</th><th>Max</th><th>%</th><th>Remarks</th></tr></thead>
                  <tbody>
                    {marks.map((m: any) => (
                      <tr key={m.id}>
                        <td><span className="exam-badge">{m.examType}</span></td>
                        <td><strong>{m.score}</strong></td>
                        <td>{m.maxScore}</td>
                        <td><span className={`pct-pill ${(m.score/m.maxScore)*100 >= 50 ? 'pass' : 'fail'}`}>{Math.round((m.score/m.maxScore)*100)}%</span></td>
                        <td className="text-muted">{m.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* ATTENDANCE */}
        {tab === 'attendance' && (
          <div>
            {selectedChild && <h3 style={{ marginBottom: '1rem' }}>{selectedChild.name}'s Attendance</h3>}
            <div className="att-summary-row">
              {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(s => (
                <div key={s} className="att-summary-pill" style={{ borderColor: attColor(s) }}>
                  <span style={{ color: attColor(s), fontWeight: 700 }}>{childAttendance.filter(a => a.status === s).length}</span>
                  <span>{s}</span>
                </div>
              ))}
              <div className="att-summary-pill" style={{ borderColor: '#065F46' }}>
                <span style={{ color: '#065F46', fontWeight: 700 }}>{attPct}%</span>
                <span>Overall</span>
              </div>
            </div>
            <table className="marks-table" style={{ marginTop: '1rem' }}>
              <thead><tr><th>Date</th><th>Status</th><th>Note</th></tr></thead>
              <tbody>
                {childAttendance.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No records</td></tr>
                ) : childAttendance.map((a: any) => (
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
    </div>
  );
};

export default ParentDashboard;
