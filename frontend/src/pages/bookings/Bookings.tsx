import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  X, 
  ChevronRight,
  User,
  MapPin,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { bookingService, resourceService } from '../../services/api';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import './Bookings.css';

interface Booking {
  id: number;
  resourceId: number;
  resource?: {
    id: number;
    name: string;
    location: string;
  };
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  purpose: string;
  rejectionReason?: string;
}

interface Resource {
  id: number;
  name: string;
  location: string;
  type: string;
  status: string;
}

const Bookings = () => {
  const { role, user } = useUser();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });

  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    fetchBookings();
    fetchResources();
    
    const resourceIdParam = searchParams.get('resourceId');
    if (resourceIdParam) {
      setFormData(prev => ({ ...prev, resourceId: resourceIdParam }));
      setShowModal(true);
      searchParams.delete('resourceId');
      setSearchParams(searchParams);
    }
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAll();
      setBookings(response.data);
    } catch (err) {
      toast('error', 'Ops Sync Failed', 'Could not retrieve reservation ledger.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await resourceService.getAll();
      setResources(response.data);
    } catch (err) {}
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formattedStartTime = `${formData.date}T${formData.startTime}:00`;
      const formattedEndTime = `${formData.date}T${formData.endTime}:00`;

      const requestData = {
        ...formData,
        userId: user?.email,
        resourceId: parseInt(formData.resourceId),
        startTime: formattedStartTime,
        endTime: formattedEndTime
      };
      await bookingService.create(requestData);
      setShowModal(false);
      setFormData({ resourceId: '', date: '', startTime: '', endTime: '', purpose: '' });
      fetchBookings();
      toast('success', 'Protocol Initiated', 'Booking request submitted for authorization.');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.errors ? JSON.stringify(err.response?.data?.errors) : 'Requested time-slot unavailable or logic error.';
      toast('error', 'Conflict Detected', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatus = async (id: number, status: string) => {
    try {
      await bookingService.updateStatus(id, status);
      fetchBookings();
      toast('success', 'Status Overridden', `Reservation ${status.toLowerCase()} by ${user?.name}`);
    } catch (err) {
      toast('error', 'Command Failed', 'Failed to update reservation state.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle2 size={16} />;
      case 'REJECTED': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="bookings-container-v2">
      <header className="page-header-v2">
        <div className="header-content">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            Nexus <span>Reservations</span>
          </motion.h1>
          <p>Personnel Booking Ledger & Resource Scheduling Control</p>
        </div>
        {!isAdmin && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="action-btn-primary" 
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} /> Request Reservation
          </motion.button>
        )}
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bookings-glass-table-wrap"
      >
        <table className="nexus-table">
          <thead>
            <tr>
              <th>Asset Information</th>
              <th>Temporal Coordinates</th>
              <th>Personnel</th>
              <th>Logic Status</th>
              <th>Interface</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan={5}><div className="skeleton-bar" /></td>
                </tr>
              ))
            ) : bookings.length === 0 ? (
              <tr><td colSpan={5} className="empty-cell">Reservations registry is empty.</td></tr>
            ) : bookings.map((b) => (
              <motion.tr 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={b.id}
                className={`table-row-v2 ${b.status.toLowerCase()}`}
              >
                <td className="asset-cell">
                  <div className="asset-main">
                    <span className="asset-name">{b.resource?.name || 'Unknown Asset'}</span>
                    <span className="asset-loc"><MapPin size={12} /> {b.resource?.location || 'Unmapped'}</span>
                  </div>
                </td>
                <td className="time-cell">
                  <div className="time-entry">
                    <Calendar size={14} className="icon-dim" />
                    <span>{b.date}</span>
                  </div>
                  <div className="time-range">
                    <Clock size={14} className="icon-dim" />
                    <span>{b.startTime} - {b.endTime}</span>
                  </div>
                </td>
                <td className="user-cell">
                  <div className="personnel-tag">
                    <div className="tag-avatar"><User size={12} /></div>
                    <span>{b.userId}</span>
                  </div>
                </td>
                <td className="status-cell">
                  <div className={`status-pill-v2 ${b.status.toLowerCase()}`}>
                    {getStatusIcon(b.status)}
                    <span>{b.status}</span>
                  </div>
                </td>
                <td className="action-cell">
                  <div className="action-stack">
                    {isAdmin && b.status === 'PENDING' ? (
                      <div className="admin-actions">
                        <button className="btn-approve" onClick={() => handleStatus(b.id, 'APPROVED')} title="Authorize">
                          <CheckCircle2 size={18} />
                        </button>
                        <button className="btn-reject" onClick={() => handleStatus(b.id, 'REJECTED')} title="Decline">
                          <XCircle size={18} />
                        </button>
                      </div>
                    ) : (
                      <button className="btn-view-details" onClick={() => setSelectedBooking(b)}>
                        Inspect Logic <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Detail Inspector Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="modal-portal">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-backdrop"
              onClick={() => setSelectedBooking(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="elite-modal-panel"
            >
              <div className="modal-top">
                <h3><FileText size={18}/> Reservation Manifest</h3>
                <button className="close-portal" onClick={() => setSelectedBooking(null)}><X size={20}/></button>
              </div>
              
              <div className="manifest-content">
                <div className={`manifest-header-card ${selectedBooking.status.toLowerCase()}`}>
                  <div className="manifest-icon"><Calendar size={32} /></div>
                  <div className="manifest-main">
                    <h2>{selectedBooking.resource?.name || 'Asset Identification Failure'}</h2>
                    <p>{selectedBooking.resource?.location}</p>
                  </div>
                  <div className="token-id">#RES-{selectedBooking.id}</div>
                </div>

                <div className="manifest-specs">
                  <div className="spec-item">
                    <span className="spec-label">PERSONNEL ID</span>
                    <span className="spec-value">{selectedBooking.userId}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">LOGIC STATUS</span>
                    <div className={`status-pill-v2 ${selectedBooking.status.toLowerCase()}`}>
                        {getStatusIcon(selectedBooking.status)}
                        {selectedBooking.status}
                    </div>
                  </div>
                  <div className="spec-item wide">
                    <span className="spec-label">TEMPORAL WINDOW</span>
                    <span className="spec-value">{selectedBooking.date} • {selectedBooking.startTime} - {selectedBooking.endTime}</span>
                  </div>
                </div>

                <div className="intent-section">
                  <span className="spec-label">EXPRESSED INTENT</span>
                  <p>{selectedBooking.purpose || 'Null intent provided'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reservation Request Portal */}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="elite-modal-panel wide"
            >
              <div className="modal-top">
                <h2>Reservation Request Protocol</h2>
                <button className="close-portal" onClick={() => setShowModal(false)}><X size={24}/></button>
              </div>
              <form onSubmit={handleRequest} className="elite-form">
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Target Asset Designation</label>
                    <select 
                      required
                      value={formData.resourceId}
                      onChange={(e) => setFormData({...formData, resourceId: e.target.value})}
                    >
                      <option value="">Scan for compatible resources...</option>
                      {resources.map(r => (
                        <option key={r.id} value={r.id}>{r.name} • {r.location}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Operational Date</label>
                    <input 
                      type="date" required 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="form-field">
                    <div className="time-inputs">
                      <div className="time-wrap">
                        <label>Start Window</label>
                        <input type="time" required value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
                      </div>
                      <div className="time-wrap">
                        <label>End Window</label>
                        <input type="time" required value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div className="form-field full">
                    <label>Objective / Intent</label>
                    <textarea 
                      rows={3} required
                      value={formData.purpose}
                      onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                      placeholder="Define the operational requirement for this asset..."
                    />
                  </div>
                </div>
                <div className="form-warning">
                  <AlertTriangle size={14}/>
                  <span>All reservations are subject to central authorization protocols.</span>
                </div>
                <div className="form-submit-row">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} disabled={isSubmitting}>ABORT</button>
                  <button type="submit" className="btn-submit-init" disabled={isSubmitting}>
                    {isSubmitting ? 'INITIATING...' : 'INITIATE REQUEST'}
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

export default Bookings;


