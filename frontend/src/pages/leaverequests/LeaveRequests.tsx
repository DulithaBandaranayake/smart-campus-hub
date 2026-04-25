import { useState, useEffect } from 'react';
import { leaveRequestService, peopleService } from '../../services/api';
import { FileText, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import './LeaveRequests.css';

interface LeaveRequest {
  id: number;
  studentId: number;
  studentName: string;
  studentGrade: string;
  parentId: number;
  parentName: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: string;
  parentComment: string;
  adminComment: string;
  createdAt: string;
  parentReviewedAt: string;
  adminReviewedAt: string;
}

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  
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
  const currentUser = JSON.parse(localStorage.getItem('hubUser') || '{}');
  const userId = currentUser.id;
  
  const isParent = userRole === 'PARENT';
  const isStudent = userRole === 'STUDENT';
  const isAdmin = userRole === 'ADMIN';

  useEffect(() => {
    fetchLeaveRequests();
    if (isStudent || isAdmin) {
      fetchStudents();
    }
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      let res;
      if (isParent) {
        res = await leaveRequestService.getByParent(userId);
      } else if (isStudent) {
        res = await leaveRequestService.getByStudent(userId);
      } else {
        res = await leaveRequestService.getAll();
      }
      setLeaveRequests(res.data);
    } catch (err: any) {
      console.error('Error fetching leave requests:', err);
      setError('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await peopleService.getStudents();
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const data = {
        studentId: isStudent ? userId : Number(formData.get('studentId')),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        reason: formData.get('reason'),
      };
      
      await leaveRequestService.create(data);
      setShowModal(false);
      fetchLeaveRequests();
    } catch (err: any) {
      console.error('Error creating leave request:', err);
      setError(err.response?.data?.message || 'Failed to create request');
    }
  };

  const handleAction = async (id: number, action: string, comment: string) => {
    try {
      if (action === 'parent-approve') {
        await leaveRequestService.parentApprove(id, comment);
      } else if (action === 'parent-reject') {
        await leaveRequestService.parentReject(id, comment);
      } else if (action === 'admin-approve') {
        await leaveRequestService.adminApprove(id, comment);
      } else if (action === 'admin-reject') {
        await leaveRequestService.adminReject(id, comment);
      }
      fetchLeaveRequests();
    } catch (err: any) {
      console.error('Error updating request:', err);
      setError('Failed to update request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PARENT':
        return <span className="badge badge-warning"><Clock size={14} /> Pending Parent</span>;
      case 'PENDING_ADMIN':
        return <span className="badge badge-info"><Clock size={14} /> Pending Admin</span>;
      case 'APPROVED':
        return <span className="badge badge-success"><CheckCircle size={14} /> Approved</span>;
      case 'REJECTED':
        return <span className="badge badge-danger"><XCircle size={14} /> Rejected</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const canParentApprove = (lr: LeaveRequest) => {
    return isParent && lr.parentId === Number(userId) && lr.status === 'PENDING_PARENT';
  };

  const canAdminApprove = (lr: LeaveRequest) => {
    return isAdmin && lr.status === 'PENDING_ADMIN';
  };

  return (
    <div className="leave-requests-page">
      <div className="page-header">
        <h1>Leave Requests</h1>
        {(isStudent || isAdmin) && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <FileText size={18} /> New Request
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="leave-requests-list">
          {leaveRequests.map(lr => (
            <div key={lr.id} className="leave-request-card">
              <div className="lr-header">
                <div className="lr-student">
                  <strong>{lr.studentName}</strong>
                  <span className="grade">{lr.studentGrade}</span>
                </div>
                {getStatusBadge(lr.status)}
              </div>
              
              <div className="lr-dates">
                <Calendar size={16} />
                <span>{lr.startDate} to {lr.endDate}</span>
              </div>
              
              <div className="lr-reason">
                <strong>Reason:</strong> {lr.reason}
              </div>
              
              {lr.parentComment && (
                <div className="lr-comment">
                  <strong>Parent:</strong> {lr.parentComment}
                </div>
              )}
              
              {lr.adminComment && (
                <div className="lr-comment">
                  <strong>Admin:</strong> {lr.adminComment}
                </div>
              )}
              
              <div className="lr-actions">
                {canParentApprove(lr) && (
                  <>
                    <button 
                      className="btn-success"
                      onClick={() => {
                        const c = prompt('Comment (optional):') || '';
                        handleAction(lr.id, 'parent-approve', c);
                      }}
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => {
                        const c = prompt('Reason for rejection:') || '';
                        handleAction(lr.id, 'parent-reject', c);
                      }}
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </>
                )}
                
                {canAdminApprove(lr) && (
                  <>
                    <button 
                      className="btn-success"
                      onClick={() => {
                        const c = prompt('Comment (optional):') || '';
                        handleAction(lr.id, 'admin-approve', c);
                      }}
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => {
                        const c = prompt('Reason for rejection:') || '';
                        handleAction(lr.id, 'admin-reject', c);
                      }}
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {leaveRequests.length === 0 && (
            <div className="no-data">No leave requests found</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>New Leave Request</h2>
            <form onSubmit={handleSubmit}>
              {!isStudent && (
                <div className="form-group">
                  <label>Student</label>
                  <select name="studentId" required>
                    <option value="">Select Student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.userName} ({s.grade})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" name="startDate" required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" name="endDate" required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea name="reason" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;