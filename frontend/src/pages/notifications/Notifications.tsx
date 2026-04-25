import { useState, useEffect } from 'react';
import { notificationService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Notifications.css';

interface Notification {
  id: number;
  userId: string;
  message: string;
  title: string;
  type: string;
  priority: string;
  read: boolean;
  createdAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem('hubUser');
      const parsedUser = stored ? JSON.parse(stored) : null;
      if (!parsedUser?.id) {
        setError('User not found. Please login again.');
        setLoading(false);
        return;
      }
      const response = await notificationService.getMy(String(parsedUser.id));
      setNotifications(response.data);
    } catch (err: any) {
      setError('Failed to load notifications');
      toast('error', 'Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err: any) {
      setError('Failed to mark notification as read');
      toast('error', 'Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const stored = localStorage.getItem('hubUser');
      const parsedUser = stored ? JSON.parse(stored) : null;
      if (!parsedUser?.id) return;
      await notificationService.markAllAsRead(String(parsedUser.id));
      fetchNotifications();
    } catch (err: any) {
      setError('Failed to mark all notifications as read');
      toast('error', 'Error', 'Failed to mark all notifications as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'BOOKING': return 'type-booking';
      case 'TICKET': return 'type-ticket';
      case 'COMMENT': return 'type-comment';
      default: return 'type-notice';
    }
  };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}</h1>
        {unreadCount > 0 && (
          <button className="btn-secondary" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="no-notifications">
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <div className="notification-header">
                <span className={`notification-type ${getTypeClass(notification.type)}`}>
                  {notification.type}
                </span>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="notification-content">
                {notification.title && <h4>{notification.title}</h4>}
                <p>{notification.message}</p>
              </div>
              {!notification.read && <div className="unread-indicator"></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;