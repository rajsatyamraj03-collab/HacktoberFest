import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Sparkles, 
  GraduationCap, 
  UserCheck, 
  ChevronDown, 
  ShieldCheck, 
  Plus, 
  Calendar, 
  Users, 
  ShoppingBag, 
  CheckSquare, 
  LogOut,
  Settings as SettingsIcon,
  RotateCcw
} from 'lucide-react';
import { getCurrentUser, switchRole, initializeStore, getNotifications } from '../../services/storage';
import { NotificationPopover } from '../notifications/NotificationPopover';
import { useToast } from '../common/Toast';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenAuth,
  onOpenProfile,
  onNavigate,
  currentPage,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

  const currentUser = getCurrentUser();
  const notifications = getNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const { showToast } = useToast();

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    setIsUserMenuOpen(false);
    showToast(`Switched Role: ${role.toUpperCase()}`, `Permissions updated for ${role}`, 'info');
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'organizer': return { bg: 'var(--secondary-light)', color: 'var(--secondary)' };
      case 'moderator': return { bg: 'var(--info-light)', color: 'var(--info)' };
      case 'admin': return { bg: 'var(--warning-light)', color: 'var(--warning-text)' };
      default: return { bg: 'var(--primary-light)', color: 'var(--primary)' };
    }
  };

  const roleStyle = getRoleBadgeColor(currentUser.role);

  return (
    <header className="top-navbar">
      {/* Brand logo & mobile title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          onClick={() => onNavigate('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          {/* Custom CampusVerse SVG Logo */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FFFFFF" />
              <path d="M2 17L12 22L22 17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="7" r="1.5" fill="#FBBF24" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.03em', color: 'var(--text-main)', lineHeight: 1.1 }}>
              CampusVerse
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
              ONE CAMPUS. EVERY OPPORTUNITY.
            </div>
          </div>
        </div>

        {/* Role Pill Badge */}
        <div
          onClick={onOpenAuth}
          style={{
            cursor: 'pointer',
            background: roleStyle.bg,
            color: roleStyle.color,
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginLeft: '8px',
          }}
          title="Click to switch persona/role"
        >
          <Sparkles size={11} /> {currentUser.role}
        </div>
      </div>

      {/* Global Search trigger bar */}
      <div style={{ flex: 1, maxWidth: '440px', margin: '0 20px' }}>
        <button
          onClick={onOpenSearch}
          style={{
            width: '100%',
            height: '38px',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} color="var(--text-muted)" />
            <span>Search events, teams, posts, marketplace...</span>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '1px 6px',
              color: 'var(--text-muted)',
            }}
          >
            ⌘K
          </span>
        </button>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Quick Create Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', padding: '6px 12px' }}
          >
            <Plus size={15} /> <span>Create</span>
          </button>

          {isQuickCreateOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                onClick={() => setIsQuickCreateOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  zIndex: 50,
                  width: '200px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '6px',
                }}
              >
                <button
                  onClick={() => {
                    setIsQuickCreateOpen(false);
                    onNavigate('events');
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <Calendar size={14} color="var(--primary)" /> New Event
                </button>
                <button
                  onClick={() => {
                    setIsQuickCreateOpen(false);
                    onNavigate('hackathon');
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <Users size={14} color="var(--secondary)" /> Find/Build Team
                </button>
                <button
                  onClick={() => {
                    setIsQuickCreateOpen(false);
                    onNavigate('marketplace');
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <ShoppingBag size={14} color="var(--warning)" /> List Product
                </button>
                <button
                  onClick={() => {
                    setIsQuickCreateOpen(false);
                    onNavigate('tasks');
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <CheckSquare size={14} color="var(--success)" /> Quick Task
                </button>
              </div>
            </>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="btn btn-ghost btn-sm"
          style={{ width: '36px', height: '36px', padding: 0, borderRadius: 'var(--radius-full)' }}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} />}
        </button>

        {/* Notifications Icon & Popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="btn btn-ghost btn-sm"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: 'var(--radius-full)', position: 'relative' }}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  boxShadow: '0 0 0 2px var(--bg-card)',
                }}
              />
            )}
          </button>

          <NotificationPopover
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            onNavigate={onNavigate}
          />
        </div>

        {/* User Avatar & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px',
            }}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border-subtle)',
              }}
            />
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {isUserMenuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  zIndex: 50,
                  width: '240px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-xl)',
                  padding: '8px',
                  animation: 'slideUp 150ms ease-out',
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {currentUser.email}
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span
                      style={{
                        background: roleStyle.bg,
                        color: roleStyle.color,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '6px 0' }}>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <UserCheck size={14} /> Profile & Settings
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <Sparkles size={14} color="#F59E0B" /> Switch Persona / Role
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('settings');
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <SettingsIcon size={14} /> Preferences
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset demo state back to factory default?')) {
                        initializeStore(true);
                        setIsUserMenuOpen(false);
                        onNavigate('dashboard');
                        showToast('Demo Reset', 'Reset all entities to initial sample data.', 'info');
                      }
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-muted)' }}
                  >
                    <RotateCcw size={14} /> Reset Demo Data
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
