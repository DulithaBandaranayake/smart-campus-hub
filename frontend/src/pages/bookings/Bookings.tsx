import { useState, useEffect } from 'react';
import { bookingService, resourceService } from '../../services/api';
import './Bookings.css';

interface Booking {
  id: number;
  resourceId: number;
  resourceName: string;
  userId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  rejectionReason: string;
  expectedAttendees: number;
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
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
    fetchBookings();
  }, [filterStatus]);

  const fetchResources = async () => {
    try {
      const response = await resourceService.getAll({ status: 'ACTIVE' });
      setResources(response.data);
    } catch (err) {
      console.error('Failed to load resources');
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      if (userRole === 'ADMIN' || userRole === 'TECHNICIAN') {
        const response = await bookingService.getAll(filterStatus);
        setBookings(response.data);
      } else {
        const response = await bookingService.getMyBookings(String(currentUser.id));
        setBookings(response.data);
      }
    } catch (err: any) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const dateInput = form.querySelector('input[name="date"]') as HTMLInputElement;
      const startTimeInput = form.querySelector('input[name="startTime"]') as HTMLInputElement;
      const endTimeInput = form.querySelector('input[name="endTime"]') as HTMLInputElement;
      
      const date = dateInput?.value || '';
      const startTimeVal = startTimeInput?.value || '';
      const endTimeVal = endTimeInput?.value || '';
      
      // Validate date is not in the past
      const bookingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        setError('Cannot book for past dates');
        return;
      }
      
      // Validate start time is before end time
      if (startTimeVal >= endTimeVal) {
        setError('End time must be after start time');
        return;
      }
      
      const startTime = date + 'T' + startTimeVal + ':00';
      const endTime = date + 'T' + endTimeVal + ':00';
      
      const data = {
        resourceId: Number(formData.get('resourceId')),
        userId: String(currentUser.id),
        startTime: startTime,
        endTime: endTime,
        purpose: formData.get('purpose') || '',
        expectedAttendees: formData.get('expectedAttendees') ? parseInt(formData.get('expectedAttendees') as string) : 1,
      };
      
      await bookingService.create(data);
      setShowModal(false);
      fetchBookings();
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await bookingService.updateStatus(id, status);
      fetchBookings();
    } catch (err: any) {
      setError('Failed to update booking');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.delete(id);
        fetchBookings();
      } catch (err: any) {
        setError('Failed to cancel booking');
      }
    }
  };

  const isAdmin = userRole === 'ADMIN';

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  return (
    <div className="bookings-page">
      <div className="page-header">
        <h1>Bookings</h1>
        <div className="header-actions">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          
          <button 
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            New Booking
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading bookings...</div>
      ) : (
        <div className="bookings-grid">
          {bookings.length === 0 ? (
            <p className="no-data">No bookings found</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.resourceName}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-details">
                  <p><strong>Date:</strong> {new Date(booking.startTime).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}</p>
                  {booking.purpose && <p><strong>Purpose:</strong> {booking.purpose}</p>}
                  {booking.expectedAttendees && <p><strong>Attendees:</strong> {booking.expectedAttendees}</p>}
                  {booking.rejectionReason && (
                    <p><strong>Reason:</strong> {booking.rejectionReason}</p>
                  )}
                </div>
                <div className="booking-actions">
                  {isAdmin && booking.status === 'PENDING' && (
                    <>
                      <button 
                        className="btn-success"
                        onClick={() => handleStatusUpdate(booking.id, 'APPROVED')}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleStatusUpdate(booking.id, 'REJECTED')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'APPROVED' && (
                    <button 
                      className="btn-secondary"
                      onClick={() => handleDelete(booking.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>New Booking Request</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Resource</label>
                <select name="resourceId" required>
                  <option value="">Select Resource</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} ({resource.location})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" name="startTime" required min="08:00" max="20:00" />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="time" name="endTime" required min="08:00" max="20:00" />
              </div>
              <div className="form-group">
                <label>Purpose</label>
                <textarea name="purpose" required />
              </div>
              <div className="form-group">
                <label>Expected Attendees</label>
                <input type="number" name="expectedAttendees" min="1" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;