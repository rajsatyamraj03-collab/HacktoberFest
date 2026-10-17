import React, { useState } from 'react';
import { 
  Settings, 
  RotateCcw, 
  User, 
  Bell, 
  Moon, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import { getCurrentUser, initializeStore } from '../services/storage';
import { useToast } from '../components/common/Toast';

interface SettingsPageProps {
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onNavigate: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onOpenProfile,
  onOpenAuth,
  onNavigate,
}) => {
  const currentUser = getCurrentUser();
  const { showToast } = useToast();

  const handleResetDemoData = () => {
    if (window.confirm('Reset all demo data back to default state? This will restore sample hackathons, tasks, posts, and marketplace items.')) {
      initializeStore(true);
      showToast('Demo Environment Reset', 'Restored initial sample campus data.', 'info');
      onNavigate('dashboard');
    }
  };

  return (
    <div className="content-wrapper" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Platform Settings & Preferences
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Manage your account profile, notification delivery channels, role simulator, and demo environment.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Account Profile Card */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{currentUser.name}</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {currentUser.email} • {currentUser.department}
                </div>
              </div>
            </div>
            <button onClick={onOpenProfile} className="btn btn-outline btn-sm">
              Edit Profile
            </button>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            College: <strong>{currentUser.college}</strong> • Role: <span className="badge badge-indigo">{currentUser.role}</span>
          </div>
        </div>

        {/* Role Switcher Persona Card */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#F59E0B" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Switch Role Simulator</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Switch between Student, Club Organizer, Moderator, and Admin personas in 1 click to test permissions.
              </p>
            </div>
            <button onClick={onOpenAuth} className="btn btn-secondary btn-sm">
              Open Persona Picker
            </button>
          </div>
        </div>

        {/* Notification Alert Toggles */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Bell size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Notification Delivery Channels</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'In-App Alerts', desc: 'Real-time notifications for ticket passes, teammate requests, and comments.' },
              { title: 'Task Deadline Reminders', desc: 'Overdue task notifications on the unified dashboard.' },
              { title: 'Marketplace Buyer Notifications', desc: 'Alerts when other students inquire or offer on your listings.' },
            ].map((pref, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{pref.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{pref.desc}</div>
                </div>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }} />
              </label>
            ))}
          </div>
        </div>

        {/* Factory Reset Demo Environment */}
        <div className="card" style={{ padding: '20px', border: '1px solid var(--error-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={18} color="var(--error)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--error)' }}>
                  Reset Hackathon Demo Data
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Restores default sample events, hackathon teams, community posts, marketplace gear, and tasks.
              </p>
            </div>
            <button onClick={handleResetDemoData} className="btn btn-danger btn-sm">
              Reset Demo State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
