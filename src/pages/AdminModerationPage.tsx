import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Trash2, 
  EyeOff, 
  AlertTriangle, 
  Users, 
  Calendar, 
  ShoppingBag, 
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  getReports, 
  updateReportStatus, 
  getPosts, 
  getEvents, 
  getMarketplaceItems, 
  getUsers, 
  getCurrentUser,
  deletePost 
} from '../services/storage';
import { useToast } from '../components/common/Toast';

interface AdminModerationPageProps {
  onNavigate: (page: string) => void;
}

export const AdminModerationPage: React.FC<AdminModerationPageProps> = ({ onNavigate }) => {
  const currentUser = getCurrentUser();
  const reports = getReports();
  const posts = getPosts();
  const events = getEvents();
  const items = getMarketplaceItems();
  const users = getUsers();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'queue' | 'users' | 'stats'>('queue');

  // Permission check
  const isAuthorized = currentUser.role === 'moderator' || currentUser.role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="content-wrapper" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <ShieldAlert size={48} color="var(--error)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '8px auto 20px' }}>
          This control center requires Community Moderator or Platform Administrator privileges.
        </p>
        <button onClick={() => onNavigate('dashboard')} className="btn btn-primary btn-sm">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Handle report dismiss
  const handleDismiss = (reportId: string) => {
    updateReportStatus(reportId, 'Dismissed');
    showToast('Report Dismissed', 'Marked report as reviewed with no action required.', 'info');
  };

  // Handle report action taken (remove post)
  const handleTakeAction = (reportId: string) => {
    updateReportStatus(reportId, 'Action Taken', true);
    showToast('Content Removed', 'Offending post removed from campus feed and report closed.', 'success');
  };

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Safety & Administration Console
            </h1>
            <span className="badge badge-amber">STAFF ACCESS</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Review flagged community reports, monitor campus platform metrics, and manage user roles.
          </p>
        </div>

        <span className="badge badge-indigo" style={{ padding: '4px 10px' }}>
          Signed in as {currentUser.name} ({currentUser.role.toUpperCase()})
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', padding: '0 8px' }}>
        <button
          onClick={() => setActiveTab('queue')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'queue' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'queue' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldAlert size={16} /> Moderation Queue ({reports.filter((r) => r.status === 'Pending').length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'stats' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'stats' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={16} /> CampusVerse Ecosystem Health
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={16} /> User Directory ({users.length})
        </button>
      </div>

      {activeTab === 'queue' && (
        <div>
          {reports.length === 0 ? (
            <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
              <CheckCircle2 size={40} color="var(--success)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Moderation Queue is Clean! ✨</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '4px auto 0' }}>
                There are no open reports from students. When users flag abusive posts or suspicious marketplace items, they will appear here for review.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reports.map((rep) => {
                const targetPost = rep.contentType === 'post' ? posts.find((p) => p.id === rep.contentId) : null;

                return (
                  <div key={rep.id} className="card" style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-rose">Flagged for {rep.reason}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Reported by {rep.reporterName} on {new Date(rep.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`badge ${rep.status === 'Pending' ? 'badge-amber' : rep.status === 'Action Taken' ? 'badge-rose' : 'badge-neutral'}`}>
                        {rep.status}
                      </span>
                    </div>

                    {targetPost ? (
                      <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '14px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>{targetPost.title}</div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {targetPost.content.slice(0, 180)}...
                        </p>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Author: {targetPost.authorName} ({targetPost.authorDepartment})
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        Content has already been removed or hidden.
                      </div>
                    )}

                    {rep.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleDismiss(rep.id)}
                          className="btn btn-outline btn-sm"
                        >
                          Dismiss (No Violation)
                        </button>
                        <button
                          onClick={() => handleTakeAction(rep.id)}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={14} /> Remove Content & Warn Author
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Calendar size={20} color="var(--primary)" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Total Events Hosted</h4>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{events.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Hackathons, workshops, cultural galas
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <MessageSquare size={20} color="var(--secondary)" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Community Discussions</h4>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{posts.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Project showcases & study tips
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <ShoppingBag size={20} color="var(--accent)" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Marketplace Gear</h4>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{items.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Textbooks, electronics & kits
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Users size={20} color="var(--success)" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Registered Students</h4>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{users.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Active on Apex Institute campus
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Student / Staff</th>
                <th style={{ padding: '12px 16px' }}>Department</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Joined Clubs</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={u.avatar} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{u.department}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-indigo">{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{u.joinedClubs.length} clubs</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span className="badge badge-emerald">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
