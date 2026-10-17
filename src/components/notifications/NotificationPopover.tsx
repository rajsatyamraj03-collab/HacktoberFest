import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Calendar, 
  Users, 
  MessageSquare, 
  ShoppingBag, 
  CheckSquare, 
  Settings,
  X
} from 'lucide-react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../../services/storage';
import { Notification } from '../../types';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const notifications = getNotifications();

  if (!isOpen) return null;

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'event': return <Calendar size={16} color="var(--primary)" />;
      case 'team': return <Users size={16} color="var(--secondary)" />;
      case 'community': return <MessageSquare size={16} color="var(--accent)" />;
      case 'marketplace': return <ShoppingBag size={16} color="var(--warning)" />;
      case 'task': return <CheckSquare size={16} color="var(--success)" />;
      default: return <Bell size={16} color="var(--primary)" />;
    }
  };

  const handleClickItem = (notif: Notification) => {
    markNotificationAsRead(notif.id);
    if (notif.linkTo) {
      onNavigate(notif.linkTo);
      onClose();
    }
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 45,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'absolute',
          top: '60px',
          right: '16px',
          zIndex: 50,
          width: '360px',
          maxWidth: 'calc(100vw - 32px)',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          animation: 'slideUp 180ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
            {unreadCount > 0 && (
              <span
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}
              >
                {unreadCount} new
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Mark all as read"
              >
                <CheckCheck size={14} /> Mark read
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
              }}
              title="Notification Settings"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '8px 16px',
            background: 'var(--bg-hover)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <button
            className={`chip ${filter === 'all' ? 'chip-active' : ''}`}
            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`chip ${filter === 'unread' ? 'chip-active' : ''}`}
            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Bell size={28} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>No notifications</div>
              <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>You're all caught up!</div>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClickItem(item)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: item.isRead ? 'transparent' : 'var(--primary-light)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  transition: 'background 150ms ease',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  {getIcon(item.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: item.isRead ? 500 : 700, color: 'var(--text-main)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                    {item.message}
                  </div>
                </div>
                {!item.isRead && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Notification Preferences</h3>
              <button
                onClick={() => setShowSettings(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Customize your in-app and delivery alert triggers:
              </div>
              {[
                { label: 'Event Registrations & Ticket Passes', checked: true },
                { label: 'Hackathon Teammate Join Requests', checked: true },
                { label: 'Community Comments & Mentions', checked: true },
                { label: 'Campus Marketplace Buyer Inquiries', checked: true },
                { label: 'Task Due Date Reminders', checked: true },
              ].map((pref, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>{pref.label}</span>
                  <input type="checkbox" defaultChecked={pref.checked} style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }} />
                </label>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={() => setShowSettings(false)}>
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
