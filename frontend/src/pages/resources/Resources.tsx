import { useState, useEffect } from 'react';
import { resourceService } from '../../services/api';
import './Resources.css';

interface Resource {
  id: number;
  name: string;
  type: string;
  capacity: number;
  location: string;
  status: string;
  description: string;
  availabilityStart: string;
  availabilityEnd: string;
  equipmentDetails: string;
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  
  const getStoredRole = () => {
    const role = localStorage.getItem('hubUserRole');
    if (role) return role;
    const user = localStorage.getItem('hubUser');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.role || '';
      } catch {
        return '';
      }
    }
    return '';
  };
  const userRole = getStoredRole();

  useEffect(() => {
    fetchResources();
  }, [filterType]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = filterType ? { type: filterType, status: 'ACTIVE' } : { status: 'ACTIVE' };
      const response = await resourceService.getAll(params);
      setResources(response.data);
    } catch (err: any) {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const capacityVal = Number(formData.get('capacity'));
      const data = {
        name: formData.get('name') || '',
        type: formData.get('type') || 'LECTURE_HALL',
        capacity: isNaN(capacityVal) ? null : capacityVal,
        location: formData.get('location') || '',
        status: formData.get('status') || 'ACTIVE',
        description: formData.get('description') || '',
      };
      
      if (editingResource) {
        await resourceService.update(editingResource.id, data);
      } else {
        await resourceService.create(data);
      }
      
      setShowModal(false);
      setEditingResource(null);
      fetchResources();
    } catch (err: any) {
      console.error('Save error:', err);
      setError('Failed to save resource: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.delete(id);
        fetchResources();
      } catch (err: any) {
        setError('Failed to delete resource');
      }
    }
  };

  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="resources-page">
      <div className="page-header">
        <h1>Resources & Facilities</h1>
        <div className="header-actions">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
          
          {isAdmin && (
            <button 
              className="btn-primary"
              onClick={() => { setEditingResource(null); setShowModal(true); }}
            >
              Add Resource
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading resources...</div>
      ) : (
        <div className="resources-grid">
          {resources.map((resource) => (
            <div key={resource.id} className="resource-card">
              <div className="resource-header">
                <h3>{resource.name}</h3>
                <span className={`status-badge ${resource.status.toLowerCase()}`}>
                  {resource.status}
                </span>
              </div>
              <div className="resource-details">
                <p><strong>Type:</strong> {resource.type}</p>
                <p><strong>Location:</strong> {resource.location}</p>
                <p><strong>Capacity:</strong> {resource.capacity || 'N/A'}</p>
                {resource.availabilityStart && (
                  <p><strong>Available:</strong> {resource.availabilityStart} - {resource.availabilityEnd}</p>
                )}
                {resource.description && (
                  <p><strong>Description:</strong> {resource.description}</p>
                )}
              </div>
              {isAdmin && (
                <div className="resource-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => { setEditingResource(resource); setShowModal(true); }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => handleDelete(resource.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingResource ? 'Edit Resource' : 'Add Resource'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  defaultValue={editingResource?.name} 
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select name="type" required defaultValue={editingResource?.type}>
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="LAB">Lab</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  name="location" 
                  defaultValue={editingResource?.location} 
                />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input 
                  type="number" 
                  name="capacity" 
                  defaultValue={editingResource?.capacity} 
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" required defaultValue={editingResource?.status || 'ACTIVE'}>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
              <div className="form-group">
                <label>Availability Start</label>
                <input 
                  type="time" 
                  name="availabilityStart" 
                  defaultValue={editingResource?.availabilityStart} 
                />
              </div>
              <div className="form-group">
                <label>Availability End</label>
                <input 
                  type="time" 
                  name="availabilityEnd" 
                  defaultValue={editingResource?.availabilityEnd} 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  defaultValue={editingResource?.description} 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;