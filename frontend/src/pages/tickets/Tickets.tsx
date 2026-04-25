import { useState, useEffect } from 'react';
import { ticketService, resourceService } from '../../services/api';
import './Tickets.css';

interface Ticket {
  id: number;
  resourceId: number;
  resourceName: string;
  location: string;
  reporterId: string;
  assigneeId: string;
  preferredContact: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  image1: string;
  image2: string;
  image3: string;
  resolutionNotes: string;
  createdAt: string;
}

interface Comment {
  id: number;
  ticketId: number;
  authorId: string;
  content: string;
  createdAt: string;
}

const Tickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const getStoredRole = () => {
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
  const userRole = getStoredRole();
  const currentUser = JSON.parse(localStorage.getItem('hubUser') || '{}');

  useEffect(() => {
    fetchResources();
    fetchTickets();
  }, [filterStatus]);

  const fetchResources = async () => {
    try {
      const response = await resourceService.getAll();
      setResources(response.data);
    } catch (err) {
      console.error('Failed to load resources');
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      if (userRole === 'ADMIN' || userRole === 'TECHNICIAN') {
        const response = await ticketService.getAll(filterStatus);
        setTickets(response.data);
      } else {
        const response = await ticketService.getMyTickets(String(currentUser.id));
        setTickets(response.data);
      }
    } catch (err: any) {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = {
        resourceId: formData.get('resourceId') ? Number(formData.get('resourceId')) : null,
        subject: formData.get('subject'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        category: formData.get('category'),
        location: formData.get('location'),
        preferredContact: formData.get('preferredContact'),
        reporterId: String(currentUser.id),
        status: 'OPEN',
      };
      
      await ticketService.create(data);
      setShowModal(false);
      fetchTickets();
    } catch (err: any) {
      console.error('Ticket error:', err);
      setError(err.response?.data?.message || 'Failed to create ticket');
    }
  };

  const handleViewDetail = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
    try {
      const response = await ticketService.getComments(ticket.id);
      setComments(response.data);
    } catch (err) {
      console.error('Failed to load comments');
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;
    try {
      await ticketService.addComment(selectedTicket.id, {
        authorId: String(currentUser.id),
        content: newComment,
      });
      setNewComment('');
      // Reload comments
      const response = await ticketService.getComments(selectedTicket.id);
      setComments(response.data);
    } catch (err: any) {
      console.error('Add comment error:', err);
      setError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleStatusUpdate = async (ticketId: number, status: string) => {
    try {
      await ticketService.updateStatus(ticketId, status);
      fetchTickets();
      setShowDetailModal(false);
    } catch (err: any) {
      setError('Failed to update ticket');
    }
  };

  const handleAssign = async (ticketId: number) => {
    try {
      await ticketService.assignTechnician(ticketId, String(currentUser.id));
      fetchTickets();
      setShowDetailModal(false);
    } catch (err: any) {
      setError('Failed to assign technician');
    }
  };

  const handleResolve = async (ticketId: number, resolutionNotes: string) => {
    try {
      await ticketService.addResolutionNotes(ticketId, resolutionNotes);
      fetchTickets();
      setShowDetailModal(false);
    } catch (err: any) {
      setError('Failed to resolve ticket');
    }
  };

  const isAdmin = userRole === 'ADMIN';
  const isTechnician = userRole === 'TECHNICIAN';

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'priority-critical';
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      default: return 'priority-low';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'status-resolved';
      case 'CLOSED': return 'status-closed';
      case 'IN_PROGRESS': return 'status-progress';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-open';
    }
  };

  return (
    <div className="tickets-page">
      <div className="page-header">
        <h1>Maintenance Tickets</h1>
        <div className="header-actions">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
          
          <button 
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            Report Issue
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading tickets...</div>
      ) : (
        <div className="tickets-grid">
          {tickets.length === 0 ? (
            <p className="no-data">No tickets found</p>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card" onClick={() => handleViewDetail(ticket)}>
                <div className="ticket-header">
                  <h3>{ticket.subject}</h3>
                  <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="ticket-details">
                  <p><strong>Category:</strong> {ticket.category}</p>
                  {ticket.location && <p><strong>Location:</strong> {ticket.location}</p>}
                  {ticket.resourceName && <p><strong>Resource:</strong> {ticket.resourceName}</p>}
                  <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(ticket.status)}`}>{ticket.status}</span></p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Report an Issue</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" name="subject" required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" required>
                  <option value="">Select Category</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="FURNITURE">Furniture</option>
                  <option value="CLEANING">Cleaning</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Resource (Optional)</label>
                <select name="resourceId">
                  <option value="">General Location</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} - {resource.location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" required>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label>Preferred Contact</label>
                <input type="text" name="preferredContact" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <h2>{selectedTicket.subject}</h2>
            <div className="ticket-detail">
              <p><strong>Category:</strong> {selectedTicket.category}</p>
              <p><strong>Priority:</strong> <span className={`priority-badge ${getPriorityClass(selectedTicket.priority)}`}>{selectedTicket.priority}</span></p>
              <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(selectedTicket.status)}`}>{selectedTicket.status}</span></p>
              {selectedTicket.location && <p><strong>Location:</strong> {selectedTicket.location}</p>}
              {selectedTicket.resourceName && <p><strong>Resource:</strong> {selectedTicket.resourceName}</p>}
              {selectedTicket.description && <p><strong>Description:</strong> {selectedTicket.description}</p>}
              {selectedTicket.resolutionNotes && <p><strong>Resolution:</strong> {selectedTicket.resolutionNotes}</p>}
              <p><strong>Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
            </div>

            <div className="comments-section">
              <h3>Comments</h3>
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet</p>
              ) : (
                <div className="comments-list">
                  {comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <p><strong>User {comment.authorId}:</strong> {comment.content}</p>
                      <small>{new Date(comment.createdAt).toLocaleString()}</small>
                    </div>
                  ))}
                </div>
              )}
              <div className="add-comment">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button className="btn-primary" onClick={handleAddComment}>Send</button>
              </div>
            </div>

            <div className="detail-actions">
              {(isAdmin || isTechnician) && selectedTicket.status === 'OPEN' && (
                <button className="btn-primary" onClick={() => handleAssign(selectedTicket.id)}>
                  Assign to Me
                </button>
              )}
              {(isAdmin || isTechnician) && selectedTicket.status === 'IN_PROGRESS' && (
                <button className="btn-success" onClick={() => handleResolve(selectedTicket.id, 'Issue resolved')}>
                  Mark Resolved
                </button>
              )}
              {(isAdmin || isTechnician) && selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'REJECTED' && (
                <button className="btn-danger" onClick={() => handleStatusUpdate(selectedTicket.id, 'REJECTED')}>
                  Reject
                </button>
              )}
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;