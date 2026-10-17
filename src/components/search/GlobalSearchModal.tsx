import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  Calendar, 
  MessageSquare, 
  Users, 
  ShoppingBag, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  getEvents, 
  getPosts, 
  getTeams, 
  getMarketplaceItems, 
  getClubs 
} from '../../services/storage';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, entityId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'events' | 'posts' | 'teams' | 'marketplace'>('all');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Handled by parent or toggled
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Query results across 5 modules
  const results = useMemo(() => {
    if (!query.trim()) {
      return { events: [], posts: [], teams: [], items: [], clubs: [], total: 0 };
    }
    const q = query.toLowerCase();

    const events = getEvents().filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );

    const posts = getPosts().filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );

    const teams = getTeams().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.projectIdea.toLowerCase().includes(q) ||
        t.techStack.some((ts) => ts.toLowerCase().includes(q)) ||
        t.requiredRoles.some((r) => r.toLowerCase().includes(q))
    );

    const items = getMarketplaceItems().filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );

    const clubs = getClubs().filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );

    const total = events.length + posts.length + teams.length + items.length + clubs.length;

    return { events, posts, teams, items, clubs, total };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '10vh' }}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', borderRadius: 'var(--radius-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Search size={20} color="var(--primary)" />
          <input
            autoFocus
            type="text"
            placeholder="Search events, community discussions, hackathon teams, marketplace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1rem',
              color: 'var(--text-main)',
              outline: 'none',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          )}
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '2px 6px',
            }}
          >
            ESC
          </span>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            padding: '8px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            background: 'var(--bg-hover)',
          }}
        >
          <button
            className={`chip ${activeTab === 'all' ? 'chip-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Results
          </button>
          <button
            className={`chip ${activeTab === 'events' ? 'chip-active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events ({results.events.length})
          </button>
          <button
            className={`chip ${activeTab === 'posts' ? 'chip-active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Community ({results.posts.length})
          </button>
          <button
            className={`chip ${activeTab === 'teams' ? 'chip-active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            Hackathon ({results.teams.length})
          </button>
          <button
            className={`chip ${activeTab === 'marketplace' ? 'chip-active' : ''}`}
            onClick={() => setActiveTab('marketplace')}
          >
            Marketplace ({results.items.length})
          </button>
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px 20px' }}>
          {!query.trim() ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Sparkles size={24} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                Type to instantly search across CampusVerse
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                Try searching "AI", "Hackathon", "LeetCode", "iPad", or "React"
              </div>
            </div>
          ) : results.total === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                No results found for "{query}"
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                Try checking for typos or searching a broader keyword.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Events Section */}
              {(activeTab === 'all' || activeTab === 'events') && results.events.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} /> Events ({results.events.length})
                  </div>
                  {results.events.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => {
                        onClose();
                        onNavigate('events', e.id);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background 150ms ease',
                      }}
                      className="card-hover"
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          {e.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {e.date} • {e.venue} • {e.category}
                        </div>
                      </div>
                      <ArrowRight size={16} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Community Posts */}
              {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={14} /> Community Posts ({results.posts.length})
                  </div>
                  {results.posts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onClose();
                        onNavigate('community', p.id);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      className="card-hover"
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          by {p.authorName} • {p.category} • {p.likes.length} likes
                        </div>
                      </div>
                      <ArrowRight size={16} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Hackathon Teams */}
              {(activeTab === 'all' || activeTab === 'teams') && results.teams.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} /> Hackathon Teams ({results.teams.length})
                  </div>
                  {results.teams.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        onClose();
                        onNavigate('hackathon', t.id);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      className="card-hover"
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          Looking for: {t.requiredRoles.join(', ')} • {t.members.length}/{t.maxTeamSize} members
                        </div>
                      </div>
                      <ArrowRight size={16} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Marketplace Items */}
              {(activeTab === 'all' || activeTab === 'marketplace') && results.items.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShoppingBag size={14} /> Campus Marketplace ({results.items.length})
                  </div>
                  {results.items.map((i) => (
                    <div
                      key={i.id}
                      onClick={() => {
                        onClose();
                        onNavigate('marketplace', i.id);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      className="card-hover"
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          {i.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          ${i.price} • {i.condition} • {i.pickupLocation}
                        </div>
                      </div>
                      <ArrowRight size={16} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
