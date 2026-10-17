import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  MessageSquare, 
  Users, 
  ShoppingBag, 
  CheckSquare, 
  ShieldAlert, 
  Sliders, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { getCurrentUser, getTasks, getUserRegistrations } from '../../services/storage';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}) => {
  const currentUser = getCurrentUser();
  const tasks = getTasks();
  const pendingTasksCount = tasks.filter((t) => t.status !== 'Completed').length;
  const registrationsCount = getUserRegistrations().filter((r) => r.status !== 'Cancelled').length;

  const isModeratorOrAdmin = currentUser.role === 'moderator' || currentUser.role === 'admin';
  const isAdmin = currentUser.role === 'admin';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'events',
      label: 'Explore Events',
      icon: Calendar,
      badge: 'Live',
    },
    {
      id: 'registrations',
      label: 'My Registrations',
      icon: Ticket,
      badge: registrationsCount > 0 ? registrationsCount : null,
    },
    {
      id: 'community',
      label: 'Community Hub',
      icon: MessageSquare,
      badge: null,
    },
    {
      id: 'hackathon',
      label: 'Find Teammates',
      icon: Users,
      badge: 'Hot',
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: ShoppingBag,
      badge: null,
    },
    {
      id: 'tasks',
      label: 'Tasks & Focus',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
    },
  ];

  return (
    <aside
      style={{
        width: isCollapsed ? '72px' : '240px',
        transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: '64px',
        height: 'calc(100vh - 64px)',
        zIndex: 30,
        userSelect: 'none',
      }}
    >
      {/* Navigation List */}
      <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={isCollapsed ? item.label : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: isCollapsed ? '10px 0' : '9px 12px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  position: 'relative',
                }}
              >
                <Icon size={19} color={isActive ? 'var(--primary)' : 'currentColor'} />
                {!isCollapsed && (
                  <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {!isCollapsed && item.badge && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      background: typeof item.badge === 'number' ? 'var(--primary)' : 'var(--accent)',
                      color: '#FFFFFF',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Moderator & Admin Section */}
        {isModeratorOrAdmin && (
          <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            {!isCollapsed && (
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  padding: '4px 12px 8px',
                  letterSpacing: '0.04em',
                }}
              >
                Admin & Safety
              </div>
            )}
            <button
              onClick={() => onNavigate('admin-moderation')}
              title={isCollapsed ? 'Moderation & Reports' : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isCollapsed ? '10px 0' : '9px 12px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: currentPage === 'admin-moderation' ? 'var(--warning-light)' : 'transparent',
                color: currentPage === 'admin-moderation' ? 'var(--warning-text)' : 'var(--text-secondary)',
                fontWeight: currentPage === 'admin-moderation' ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <ShieldAlert size={19} color="currentColor" />
              {!isCollapsed && <span>Content Moderation</span>}
            </button>
          </div>
        )}

        {/* Public Landing Switcher for demo */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => onNavigate('landing')}
            title={isCollapsed ? 'Landing Page' : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: isCollapsed ? '10px 0' : '9px 12px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: currentPage === 'landing' ? 'var(--bg-subtle)' : 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <BookOpen size={19} />
            {!isCollapsed && <span>Public Landing</span>}
          </button>
        </div>
      </div>

      {/* Collapse/Expand Footer Button */}
      <div
        style={{
          padding: '10px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: isCollapsed ? 'center' : 'flex-end',
        }}
      >
        <button
          onClick={onToggleCollapse}
          className="btn btn-ghost btn-sm"
          style={{ width: '32px', height: '32px', padding: 0 }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
