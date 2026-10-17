import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  ShieldCheck, 
  Sparkles, 
  GraduationCap, 
  Calendar, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { getUsers, setCurrentUserId, getCurrentUser } from '../../services/storage';
import { useToast } from '../common/Toast';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'demo'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const users = getUsers();
  const currentUser = getCurrentUser();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSelectPersona = (userId: string) => {
    setCurrentUserId(userId);
    const selected = users.find((u) => u.id === userId);
    showToast(`Logged in as ${selected?.name}`, `Role: ${selected?.role.toUpperCase()} • ${selected?.department}`, 'success');
    if (onAuthSuccess) onAuthSuccess();
    onClose();
  };

  const handleCustomAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Validation Error', 'Please enter a valid campus email address.', 'error');
      return;
    }
    // Check if user exists or simulate
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUserId(existing.id);
      showToast('Welcome Back!', `Signed in as ${existing.name}`, 'success');
    } else {
      // Sign in as default student
      setCurrentUserId('user-satyam');
      showToast('Signed In', `Welcome to CampusVerse!`, 'success');
    }
    if (onAuthSuccess) onAuthSuccess();
    onClose();
  };

  const personas = [
    {
      id: 'user-satyam',
      name: 'Satyam Raj',
      role: 'student' as UserRole,
      title: 'Active Student',
      dept: 'Computer Science (3rd Year)',
      badge: 'Student Experience',
      badgeColor: 'var(--primary)',
      icon: GraduationCap,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-priya',
      name: 'Priya Sharma',
      role: 'organizer' as UserRole,
      title: 'Club & Event Organizer',
      dept: 'Google Developer Student Club Lead',
      badge: 'Organizer Dashboard',
      badgeColor: 'var(--secondary)',
      icon: Calendar,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-alex',
      name: 'Alex Chen',
      role: 'moderator' as UserRole,
      title: 'Community Moderator',
      dept: 'AI/ML Society Lead & Peer Mentor',
      badge: 'Moderator Controls',
      badgeColor: 'var(--accent)',
      icon: ShieldCheck,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-dean',
      name: 'Dr. Aris Thorne',
      role: 'admin' as UserRole,
      title: 'Campus Administrator',
      dept: 'Dean of Student Affairs & Innovation',
      badge: 'Full Platform Admin',
      badgeColor: 'var(--warning)',
      icon: ShieldAlert,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Welcome to CampusVerse</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              One Campus. Every Opportunity.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-hover)',
          }}
        >
          <button
            onClick={() => setTab('demo')}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              background: tab === 'demo' ? 'var(--bg-card)' : 'transparent',
              borderBottom: tab === 'demo' ? '2px solid var(--primary)' : 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: tab === 'demo' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} color="#F59E0B" /> 1-Click Role Personas
          </button>
          <button
            onClick={() => setTab('signin')}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              background: tab === 'signin' ? 'var(--bg-card)' : 'transparent',
              borderBottom: tab === 'signin' ? '2px solid var(--primary)' : 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: tab === 'signin' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('signup')}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              background: tab === 'signup' ? 'var(--bg-card)' : 'transparent',
              borderBottom: tab === 'signup' ? '2px solid var(--primary)' : 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: tab === 'signup' ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Sign Up
          </button>
        </div>

        <div className="modal-body">
          {tab === 'demo' ? (
            <div>
              <div
                style={{
                  background: 'var(--primary-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                }}
              >
                <Sparkles size={16} flex-shrink={0} />
                <span>
                  <strong>Hackathon Demo Mode:</strong> Select any persona below to immediately experience CampusVerse from their role's permissions.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {personas.map((p) => {
                  const isCurrent = currentUser.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPersona(p.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                        background: isCurrent ? 'var(--bg-hover)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 150ms ease',
                      }}
                      className="card-hover"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={p.avatar}
                          alt={p.name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                              {p.name}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'var(--bg-subtle)',
                                color: p.badgeColor,
                              }}
                            >
                              {p.badge}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {p.title} • {p.dept}
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={16} color={isCurrent ? 'var(--primary)' : 'var(--text-muted)'} />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomAuth}>
              {tab === 'signup' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Satyam Raj"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Campus Email Address</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="your.name@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                {tab === 'signin' ? 'Sign In to CampusVerse' : 'Create Student Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
