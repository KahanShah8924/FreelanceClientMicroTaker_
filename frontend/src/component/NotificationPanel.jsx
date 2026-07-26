import React, { useState, useEffect, useRef } from 'react';
import './ChatbotNotification.css';

const NotificationPanel = () => {
  const notifyKey = 'fcm_react_notifications';
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(notifyKey)) || [];
    setNotifications(stored);
  }, []);

  // Save to LocalStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem(notifyKey, JSON.stringify(notifications));
  }, [notifications]);

  // Event listener: Allow tracking/adding notifications globally
  useEffect(() => {
    const handleAddNotification = (e) => {
      const text = e.detail;
      setNotifications(prev => {
        // Prevent exact duplicates within 1 minute
        const isDuplicate = prev.some(n => n.text === text && (Date.now() - n.timestamp) < 60000);
        if (isDuplicate) return prev;
        
        // Add new notification to top of list
        return [{ id: Date.now().toString(), text, read: false, timestamp: Date.now() }, ...prev];
      });
    };

    window.addEventListener('addNotification', handleAddNotification);
    return () => window.removeEventListener('addNotification', handleAddNotification);
  }, []);

  // Close panel if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fcm-notifications-wrapper" ref={panelRef}>
      {/* Bell Icon */}
      <div className="fcm-notification-bell" onClick={() => setIsOpen(!isOpen)}>
        🔔
        {unreadCount > 0 && <span className="fcm-badge">{unreadCount}</span>}
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="fcm-notification-panel active">
          <div className="fcm-panel-header">
            <h4>Notifications</h4>
            <span onClick={markAllRead}>Mark all read</span>
          </div>
          <div className="fcm-panel-body">
            {notifications.length === 0 ? (
              <div className="fcm-empty-notif">No new notifications</div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`fcm-notification-item ${notif.read ? '' : 'unread'}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="notif-title">{notif.text}</div>
                  <div className="notif-time">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
