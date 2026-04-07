import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  MapPin, 
  Users, 
  Trash2, 
  X, 
  Filter,
  Monitor,
  FlaskConical,
  Library,
  Coffee,
  MoreVertical,
  Building2
} from 'lucide-react';
import { resourceService } from '../../services/api';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import './Facilities.css';

interface Resource {
  id: number;
  name: string;
  type: 'HALL' | 'LAB' | 'ROOM' | 'EQUIPMENT' | string;
  capacity: number;
  location: string;
  status: string;
  description?: string;
}

const Facilities = () => {
  const { role } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'ROOM',
    capacity: 0,
    location: '',
    status: 'AVAILABLE',
    description: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    let result = resources;
    if (filterType !== 'ALL') result = result.filter(res => res.type === filterType);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(res => 
        res.name.toLowerCase().includes(query) || 
        res.location.toLowerCase().includes(query)
      );
    }
    setFilteredResources(result);
  }, [searchQuery, filterType, resources]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourceService.getAll();
      setResources(response.data);
    } catch (err) {
      toast('error', 'Network Error', 'Could not sync with central assets database.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      await resourceService.create(formData);
      setShowModal(false);
      setFormData({ name: '', type: 'ROOM', capacity: 0, location: '', status: 'AVAILABLE', description: '' });
      fetchResources();
      toast('success', 'Asset Initialized', `${formData.name} has been added to the registry.`);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        toast('error', 'Protocol Failure', 'Registry update failed. Check constraints.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Confirm permanent removal from assets registry?')) {
      try {
        await resourceService.delete(id);
        setResources(resources.filter(r => r.id !== id));
        toast('success', 'Asset Deleted', 'Resource removed from operations.');
      } catch (err) {
        toast('error', 'Interference Detected', 'Could not complete deletion protocol.');
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'HALL': return <Library size={24} />;
      case 'LAB': return <FlaskConical size={24} />;
      case 'ROOM': return <Monitor size={24} />;
      case 'EQUIPMENT': return <Coffee size={24} />;
      default: return <Building2 size={24} />;
    }
  };

  return (
    <div className="facilities-container-v2">
      <header className="page-header-v2">
        <div className="header-content">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            Operational <span>Assets</span>
          </motion.h1>
          <p>Global Campus Resource Registry & Status Monitor</p>
        </div>
        {isAdmin && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="action-btn-primary" 
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} /> Initialize New Asset
          </motion.button>
        )}
      </header>

      <div className="discovery-bar">
        <div className="search-wrap-v2">
          <Search size={20} className="search-icon-fade" />
          <input 
            type="text" 
            placeholder="Scan registry by name or sector..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-scroll">
          <div className="filter-header"><Filter size={14}/> Sectors:</div>
          {['ALL', 'HALL', 'LAB', 'ROOM', 'EQUIPMENT'].map((type) => (
            <button 
              key={type}
              className={`sector-tab ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'ALL' ? 'Total Fleet' : type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <motion.div layout className="resource-display-grid">
          <AnimatePresence>
            {filteredResources.map((res) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={res.id} 
                className={`asset-card-v2 ${res.status.toLowerCase()}`}
              >
                <div className="asset-card-glow" />
                <div className="asset-header">
                  <div className="asset-type-icon">{getIcon(res.type)}</div>
                  <div className="asset-status-pill">
                    <div className="dot" />
                    {res.status}
                  </div>
                </div>
                
                <div className="asset-body">
                  <div className="body-top">
                    <h3>{res.name}</h3>
                    <button className="more-btn"><MoreVertical size={16}/></button>
                  </div>
                  <div className="asset-metadata">
                    <div className="meta-row">
                      <MapPin size={14} /> <span>{res.location}</span>
                    </div>
                    {res.capacity > 0 && (
                      <div className="meta-row">
                        <Users size={14} /> <span>Cap: {res.capacity} Personnel</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="asset-footer">
                  <button className="btn-detail" onClick={() => setSelectedResource(res)}>
                    Protocol Details
                  </button>
                  <button 
                    className="btn-reserve" 
                    onClick={() => navigate(`/bookings?resourceId=${res.id}`)}
                    disabled={res.status === 'MAINTENANCE' || res.status === 'OCCUPIED'}
                  >
                    Engage
                  </button>
                  {isAdmin && (
                    <button className="btn-delete-asset" onClick={() => handleDelete(res.id)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedResource && (
          <div className="modal-portal">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-backdrop"
              onClick={() => setSelectedResource(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="elite-modal-panel"
            >
              <div className="modal-top">
                <div className="modal-title-wrap">
                  <div className="title-icon">{getIcon(selectedResource.type)}</div>
                  <h2>Asset Intelligence</h2>
                </div>
                <button className="close-portal" onClick={() => setSelectedResource(null)}><X size={20}/></button>
              </div>
              
              <div className="modal-inner-content">
                <div className="asset-identity-card">
                  <span className="id-tag">#ASSET-{selectedResource.id}</span>
                  <h2>{selectedResource.name}</h2>
                  <p className="type-reveal">{selectedResource.type} • SECTOR {selectedResource.location.split(' ')[0]}</p>
                </div>

                <div className="spec-grid">
                  <div className="spec-item">
                    <span className="spec-label">COORDINATES</span>
                    <span className="spec-value">{selectedResource.location}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">PERSONNEL CAP</span>
                    <span className="spec-value">{selectedResource.capacity || 'FIELD DATA MISSING'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">OPERATIONAL STATUS</span>
                    <span className={`spec-value status-text-${selectedResource.status.toLowerCase()}`}>
                      {selectedResource.status}
                    </span>
                  </div>
                </div>

                {selectedResource.description && (
                  <div className="desc-section">
                    <span className="spec-label">LOGS / DESCRIPTION</span>
                    <p>{selectedResource.description}</p>
                  </div>
                )}
                
                <div className="modal-final-actions">
                  <button 
                    className="btn-prime-reserve" 
                    onClick={() => {
                        navigate(`/bookings?resourceId=${selectedResource.id}`);
                        setSelectedResource(null);
                    }}
                    disabled={selectedResource.status === 'MAINTENANCE'}
                  >
                    INITIATE RESERVATION PROTOCOL
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
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
                <h2>Asset Initialization</h2>
                <button className="close-portal" onClick={() => setShowModal(false)}><X size={24}/></button>
              </div>
              <form onSubmit={handleCreate} className="elite-form">
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Designation Name</label>
                    <input 
                      type="text" required placeholder="Asset ID / Common Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                  </div>
                  <div className="form-field">
                    <label>Sector Category</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="HALL">Lecture Intelligence</option>
                      <option value="LAB">Research Matrix</option>
                      <option value="ROOM">Strategic Room</option>
                      <option value="EQUIPMENT">Hardware Unit</option>
                    </select>
                    {formErrors.type && <span className="field-error">{formErrors.type}</span>}
                  </div>
                  <div className="form-field">
                    <label>Personnel Limit</label>
                    <input 
                      type="number" placeholder="00"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    />
                    {formErrors.capacity && <span className="field-error">{formErrors.capacity}</span>}
                  </div>
                  <div className="form-field full">
                    <label>Facility Coordinates</label>
                    <input 
                      type="text" required placeholder="Sub-sector, Level, Grid"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                    {formErrors.location && <span className="field-error">{formErrors.location}</span>}
                  </div>
                </div>
                <div className="form-submit-row">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} disabled={isSubmitting}>ABORT</button>
                  <button type="submit" className="btn-submit-init" disabled={isSubmitting}>
                    {isSubmitting ? 'COMMITTING...' : 'COMMIT TO REGISTRY'}
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

export default Facilities;


