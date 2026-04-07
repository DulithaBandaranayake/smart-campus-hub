import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  Plus, 
  X, 
  MapPin, 
  Tag, 
  ChevronRight, 
  Send,
  AlertOctagon,
  ShieldAlert,
  Zap,
  User,
  History
} from 'lucide-react';
import { ticketService } from '../../services/api';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import './Incidents.css';

interface Ticket {
  id: number;
  subject: string;
  description: string;
  category: string;
  location: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | string;
  reporterId: string;
  assigneeId?: string;
  createdAt: string;
}

interface TicketComment {
  id: number;
  ticketId: number;
  authorId: string;
  content: string;
  createdAt: string;
}

const Incidents = () => {
  const { role, user } = useUser();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'ELECTRICAL',
    location: '',
    priority: 'MEDIUM',
    reporterId: user?.email || 'anonymous'
  });

  const isTechnician = role === 'TECHNICIAN' || role === 'ADMIN';

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getAll();
      setTickets(response.data);
    } catch (err) {
      toast('error', 'Sync Failure', 'Failed to synchronize with central maintenance ledger.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await ticketService.create(formData);
      setShowModal(false);
      setFormData({ subject: '', description: '', category: 'ELECTRICAL', location: '', priority: 'MEDIUM', reporterId: user?.email || 'anonymous' });
      fetchTickets();
      toast('success', 'Incident Logged', 'Maintenance dispatch protocol initiated.');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.errors ? JSON.stringify(err.response?.data?.errors) : 'System could not record the incident report.';
      toast('error', 'Transmission Error', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return <ShieldAlert size={18} />;
      case 'MEDIUM': return <AlertOctagon size={18} />;
      default: return <Zap size={18} />;
    }
  };

  const handleAssign = async (id: number) => {
    try {
      await ticketService.assign(id, user?.name || 'Technician-Alpha');
      fetchTickets();
      toast('success', 'Assigned', 'Operational responsibility accepted.');
    } catch (err) {
      toast('error', 'Command Error', 'Failed to accept operational assignment.');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await ticketService.updateStatus(id, status);
      fetchTickets();
      if (selectedTicket?.id === id) {
        setSelectedTicket({...selectedTicket, status});
      }
      toast('success', 'State Change', `Incident marked as ${status.toLowerCase()}`);
    } catch (err) {
      toast('error', 'Logic Error', 'Could not override incident state.');
    }
  };

  const fetchComments = async (ticketId: number) => {
    try {
      const response = await ticketService.getComments(ticketId);
      setComments(response.data);
    } catch (err) {
      console.error('Failed to fetch communications trace');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTicket) return;
    
    try {
      const commentData = {
        authorId: user?.name || user?.email || 'Unknown Operative',
        content: newComment
      };
      await ticketService.addComment(selectedTicket.id, commentData);
      setNewComment('');
      fetchComments(selectedTicket.id);
      toast('success', 'Comm Logged', 'Message recorded in incident timeline.');
    } catch (err) {
      toast('error', 'Comm Failure', 'Failed to transmit message through the portal.');
    }
  };

  return (
    <div className="incidents-container-v2">
      <header className="page-header-v2">
        <div className="header-content">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            Maintenance <span>Ops</span>
          </motion.h1>
          <p>Campus Infrastructure Support & Real-time Incident Monitoring</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="action-btn-primary" 
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} /> Report Infrastructure Fault
        </motion.button>
      </header>

      <div className="ticket-telemetry">
        <div className="tele-card">
          <span className="tele-val">{tickets.length}</span>
          <span className="tele-label">Incoming Faults</span>
        </div>
        <div className="tele-card active">
          <span className="tele-val">{tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length}</span>
          <span className="tele-label">Under Resolution</span>
        </div>
        <div className="tele-card resolved">
          <span className="tele-val">{tickets.filter(t => t.status === 'RESOLVED').length}</span>
          <span className="tele-label">Operations Restored</span>
        </div>
      </div>

      <div className="ops-board-grid">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="skeleton-ticket-card" />)
        ) : tickets.length === 0 ? (
          <div className="board-empty-state">
            <ShieldAlert size={64} className="fade-icon" />
            <h3>No Active Incidents</h3>
            <p>Infrastructure is operating at 100% capacity within standard parameters.</p>
          </div>
        ) : (
          <AnimatePresence>
            {tickets.map((t, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={t.id} 
                className={`ops-ticket-card ${t.status.toLowerCase()} ${t.priority.toLowerCase()}`}
              >
                <div className="card-severity-glow" />
                <div className="card-top">
                  <span className="priority-pill">
                    {getPriorityIcon(t.priority)}
                    {t.priority}
                  </span>
                  <div className="status-badge">
                    {t.status === 'RESOLVED' ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                    {t.status}
                  </div>
                </div>
                
                <div className="card-mid">
                  <h3>{t.subject}</h3>
                  <p>{t.description}</p>
                </div>

                <div className="card-meta-belt">
                  <div className="meta-point">
                    <MapPin size={14}/> <span>{t.location}</span>
                  </div>
                  <div className="meta-point">
                    <Tag size={14}/> <span>{t.category}</span>
                  </div>
                </div>

                <div className="card-footer-v2">
                  <div className="operative-info">
                    <div className="operative-avatar">
                        <User size={12}/>
                    </div>
                    <span>{t.assigneeId || 'Unassigned'}</span>
                  </div>
                  <button className="btn-open-comms" onClick={() => {
                      setSelectedTicket(t);
                      fetchComments(t.id);
                  }}>
                    Open Comms <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Incident Command Center Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="modal-portal">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-backdrop"
              onClick={() => setSelectedTicket(null)}
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              className="ops-command-panel"
            >
              <div className="panel-header">
                <div className="ticket-id-strip">
                  <span>LOG ID: #TIC-{selectedTicket.id}</span>
                  <button className="panel-close" onClick={() => setSelectedTicket(null)}><X size={20}/></button>
                </div>
                <h2>{selectedTicket.subject}</h2>
                <div className="panel-badges">
                  <span className={`badge-prio ${selectedTicket.priority.toLowerCase()}`}>
                    {getPriorityIcon(selectedTicket.priority)} {selectedTicket.priority} PRIORITY
                  </span>
                  <span className={`badge-stat ${selectedTicket.status.toLowerCase()}`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              <div className="panel-body">
                <div className="intel-section">
                  <h4><MapPin size={16}/> SECTOR LOGISTICS</h4>
                  <p>{selectedTicket.location} • Category: {selectedTicket.category}</p>
                  <p className="intel-desc">{selectedTicket.description}</p>
                </div>

                <div className="control-strip">
                  {isTechnician && selectedTicket.status === 'OPEN' && (
                    <button className="btn-action-engage" onClick={() => handleAssign(selectedTicket.id)}>ENGAGE INCIDENT</button>
                  )}
                  {isTechnician && selectedTicket.status === 'IN_PROGRESS' && (
                    <button className="btn-action-resolve" onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}>MARK AS RESTORED</button>
                  )}
                  {selectedTicket.status === 'RESOLVED' && (
                    <button className="btn-action-close" onClick={() => handleUpdateStatus(selectedTicket.id, 'CLOSED')}>CLOSE PROTOCOL</button>
                  )}
                </div>

                <div className="comms-hub">
                  <h4><History size={16}/> COMMUNICATION TRANSCRIPT</h4>
                  <div className="comms-stream">
                    {comments.map((comment) => (
                      <div key={comment.id} className="comm-bubble">
                        <div className="comm-top">
                          <span className="comm-author">{comment.authorId}</span>
                          <span className="comm-time">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p>{comment.content}</p>
                      </div>
                    ))}
                    {comments.length === 0 && <p className="no-comms">No communications recorded in manifest.</p>}
                  </div>
                </div>
              </div>

              <div className="panel-input-area">
                <form onSubmit={handleAddComment} className="comm-form">
                  <input 
                    type="text" 
                    placeholder="Transmit message to resolution team..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button type="submit" className="btn-send-comm">
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Incident Report Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-portal">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-backdrop"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="elite-modal-panel wide"
            >
              <div className="modal-top">
                <h2>Initialize Maintenance Ticket</h2>
                <button className="close-portal" onClick={() => setShowModal(false)}><X size={24}/></button>
              </div>
              <form onSubmit={handleCreate} className="elite-form">
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Incident Designation</label>
                    <input 
                      type="text" required 
                      placeholder="e.g. Critical Server Rack Overheat"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>
                  <div className="form-field">
                    <label>Systems Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="ELECTRICAL">Electrical Grid</option>
                      <option value="PLUMBING">Hydraulic / Plumbing</option>
                      <option value="FURNITURE">Structural / Furniture</option>
                      <option value="IT">IT Infrastructure</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Severity Protocol</label>
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="LOW">Routine Monitoring</option>
                      <option value="MEDIUM">Operational Warning</option>
                      <option value="HIGH">CRITICAL ALERT</option>
                    </select>
                  </div>
                  <div className="form-field full">
                    <label>Detailed Intel</label>
                    <textarea 
                      rows={3} required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe the nature of the fault per standard protocol..."
                    />
                  </div>
                  <div className="form-field full">
                    <label>Sector Coordinates</label>
                    <input 
                      type="text" required
                      placeholder="Sector, Level, Grid Reference"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-submit-row">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} disabled={isSubmitting}>ABORT MISSION</button>
                  <button type="submit" className="btn-submit-init" disabled={isSubmitting}>
                    {isSubmitting ? 'COMMITTING...' : 'COMMIT REPORT'}
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

export default Incidents;

