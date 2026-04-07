import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellOff, 
  Trash2, 
  RefreshCw,
  Search,
  Plus,
  Edit2,
  X,
  AlertTriangle,
  Calendar,
  Info
} from 'lucide-react';
import { notificationService } from '../../services/api';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import './Notifications.css';

interface Notification {
  id: number;
  userId: string;
  title?: string;
  message: string;
  priority: 'URGENT' | 'EVENT' | 'INFO' | string;
  global: boolean;
  type: string;
  read: boolean;
  createdAt: string;
}

const Notifications = () => {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  
  // Admin Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingNotif, setEditingNotif] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({ title: '', message: '', priority: 'INFO' });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchData();
  }, [searchQuery, filterPriority]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getPublic(searchQuery, filterPriority);
      setNotifications(response.data);
    } catch (err) {
      toast('error', 'Sync Failure', 'Failed to fetch public notices.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNotif) {
        await notificationService.update(editingNotif.id, formData);
        toast('success', 'Registry Updated', 'Notification updated successfully.');
      } else {
        await notificationService.create(formData);
        toast('success', 'Broadcast Sent', 'New notification published to the feed.');
      }
      setShowModal(false);
      setEditingNotif(null);
      setFormData({ title: '', message: '', priority: 'INFO' });
      fetchData();
    } catch (err) {
      toast('error', 'Operation Failed', 'Could not save notification.');
    }
  };

  const deleteNotif = async (id: number) => {
    if (!window.confirm('Permanent delete this entry?')) return;
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast('success', 'Entry Purged', 'Notification removed from the cloud feed.');
    } catch (err) {
      toast('error', 'Delete Failed', 'Check permissions or connectivity.');
    }
  };

  const openEdit = (n: Notification) => {
    setEditingNotif(n);
    setFormData({ title: n.title || '', message: n.message, priority: n.priority });
    setShowModal(true);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT': return <AlertTriangle size={18} className="text-danger" />;
      case 'EVENT': return <Calendar size={18} className="text-success" />;
      default: return <Info size={18} className="text-secondary" />;
    }
  };

  return (
    <div className="notifications-container-v3">
      <header className="page-header-v2">
        <div className="header-content">
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            Nexus <span>Broadcasts</span>
          </motion.h1>
          <p>Global intelligence and operational status updates</p>
        </div>
        
        {isAdmin && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-add-broadcast"
            onClick={() => { setEditingNotif(null); setShowModal(true); }}
          >
            <Plus size={18} /> New Broadcast
          </motion.button>
        )}
      </header>

      {/* Search & Filter Toolbar */}
      <div className="feed-toolbar">
        <div className="search-box-v2">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by keywords (e.g. 'Today', 'Maintenance')..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="priority-filters">
          {['ALL', 'URGENT', 'EVENT', 'INFO'].map(p => (
            <button 
              key={p}
              className={`filter-chip ${filterPriority === p ? 'active' : ''}`}
              onClick={() => setFilterPriority(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="feed-timeline-v3">
        {loading ? (
          <div className="loading-sync">
            <RefreshCw className="animate-spin" size={32} />
            <p>Syncing Manifest...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="feed-empty-state">
            <BellOff size={48} className="text-muted" />
            <p>No notices matching criteria found in registry.</p>
          </div>
        ) : (
          <div className="feed-grid">
            <AnimatePresence>
              {notifications.map((n, idx) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  key={idx}
                  className={`notice-card ${n.priority.toLowerCase()}`}
                >
                  <div className="card-accent" />
                  <div className="card-body">
                    <div className="card-top">
                      <div className="priority-tag">
                        {getPriorityIcon(n.priority)}
                        <span>{n.priority}</span>
                      </div>
                      <span className="card-date">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="notice-title">{n.title || 'Inbound Intelligence'}</h3>
                    <p className="notice-msg">{n.message}</p>
                    
                    {isAdmin && (
                      <div className="card-admin-actions">
                        <button onClick={() => openEdit(n)} className="btn-edit" title="Edit Entry">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteNotif(n.id)} className="btn-delete" title="Delete Entry">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Admin Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="modal-glass"
            >
              <div className="modal-header">
                <h2>{editingNotif ? 'Edit Broadcast' : 'Deploy New Broadcast'}</h2>
                <button onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateOrUpdate} className="broadcast-form">
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="E.g. Server Maintenance"
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea 
                    required 
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Details about the broadcast..."
                  />
                </div>
                <div className="form-group">
                  <label>Priority Protocol</label>
                  <div className="priority-selector">
                    {['URGENT', 'EVENT', 'INFO'].map(p => (
                      <button 
                        type="button"
                        key={p}
                        className={`p-btn ${formData.priority === p ? 'active' : ''} ${p.toLowerCase()}`}
                        onClick={() => setFormData({...formData, priority: p})}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-submit-form">
                  {editingNotif ? 'Sync Updates' : 'Authorize Broadcast'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;


