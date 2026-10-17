import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  ShoppingBag, 
  CheckSquare, 
  MessageSquare, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Ticket, 
  Flame, 
  Compass, 
  Filter, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  getCurrentUser, 
  getEvents, 
  getUserRegistrations, 
  getTeams, 
  getMarketplaceItems, 
  getTasks, 
  getPosts,
  getUsers,
  calculateMatchScore,
  updateTask
} from '../services/storage';
import { useToast } from '../components/common/Toast';
import confetti from 'canvas-confetti';

interface DashboardPageProps {
  onNavigate: (page: string, entityId?: string) => void;
  onOpenCreateTask: () => void;
  onOpenCreateEvent: () => void;
  onOpenCreateListing: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenCreateTask,
  onOpenCreateEvent,
  onOpenCreateListing,
}) => {
  const currentUser = getCurrentUser();
  const allEvents = getEvents();
  const registrations = getUserRegistrations();
  const teams = getTeams();
  const marketplaceItems = getMarketplaceItems();
  const tasks = getTasks();
  const posts = getPosts();
  const allUsers = getUsers();
  const { showToast } = useToast();

  // Registered events details
  const registeredEventIds = registrations.filter((r) => r.status === 'Confirmed').map((r) => r.eventId);
  const myUpcomingEvents = allEvents.filter((e) => registeredEventIds.includes(e.id));

  // Today's & Pending Tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed');
  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Suggested Teammates (calculated match scores)
  const candidateUsers = allUsers.filter((u) => u.id !== currentUser.id);
  const suggestedTeammates = candidateUsers.map((candidate) => ({
    user: candidate,
    score: calculateMatchScore(currentUser, candidate),
  })).sort((a, b) => b.score - a.score).slice(0, 3);

  // Quick toggle task completion right on dashboard
  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'Todo' : 'Completed';
    updateTask(taskId, { status: nextStatus as any });
    if (nextStatus === 'Completed') {
      confetti({ particleCount: 35, spread: 45, origin: { y: 0.7 } });
      showToast('Task Completed! 🎯', 'Great progress on your student goals.', 'success');
    }
  };

  // Get current hour for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="content-wrapper">
      {/* Personalized Welcome Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {greeting}, {currentUser.name.split(' ')[0]}! 👋
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {currentUser.role}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {currentUser.college} • {currentUser.department} • Fall Semester
          </p>
        </div>

        {/* Quick Actions Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={onOpenCreateTask} className="btn btn-primary btn-sm">
            <Plus size={15} /> Add Task
          </button>
          <button onClick={() => onNavigate('events')} className="btn btn-outline btn-sm">
            <Calendar size={15} /> Discover Events
          </button>
          <button onClick={() => onNavigate('hackathon')} className="btn btn-outline btn-sm">
            <Users size={15} /> Find Team
          </button>
          <button onClick={onOpenCreateListing} className="btn btn-outline btn-sm">
            <ShoppingBag size={15} /> Sell Gear
          </button>
        </div>
      </div>

      {/* 4 Connected Module Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '2rem' }}>
        {/* Module A Metric */}
        <div 
          className="card card-hover" 
          style={{ padding: '18px', cursor: 'pointer' }}
          onClick={() => onNavigate('registrations')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Registered Events</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {myUpcomingEvents.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Ticket size={12} color="var(--primary)" /> View digital event passes <ArrowRight size={12} />
          </div>
        </div>

        {/* Module C Metric */}
        <div 
          className="card card-hover" 
          style={{ padding: '18px', cursor: 'pointer' }}
          onClick={() => onNavigate('hackathon')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hackathon Teams</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {teams.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Open recruitment active on campus
          </div>
        </div>

        {/* Module E Metric */}
        <div 
          className="card card-hover" 
          style={{ padding: '18px', cursor: 'pointer' }}
          onClick={() => onNavigate('tasks')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tasks Due</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {pendingTasks.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {completionPercentage}% completed this week
          </div>
        </div>

        {/* Module D Metric */}
        <div 
          className="card card-hover" 
          style={{ padding: '18px', cursor: 'pointer' }}
          onClick={() => onNavigate('marketplace')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Marketplace Items</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {marketplaceItems.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Active student listings on campus
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Dashboard Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.25fr)', gap: '24px' }}>
        
        {/* Left Column: Events & Productivity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Upcoming Registered Events Widget */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>My Upcoming Event Passes</h3>
              </div>
              <button onClick={() => onNavigate('registrations')} className="btn btn-ghost btn-sm">
                View All ({myUpcomingEvents.length}) <ChevronRight size={14} />
              </button>
            </div>

            {myUpcomingEvents.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                <Calendar size={24} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>No active registrations yet</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', marginBottom: '12px' }}>
                  Discover upcoming hackathons, tech workshops, and guest seminars on campus.
                </div>
                <button onClick={() => onNavigate('events')} className="btn btn-primary btn-sm">
                  Discover Events
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myUpcomingEvents.map((evt) => {
                  const reg = registrations.find((r) => r.eventId === evt.id && r.status === 'Confirmed');
                  return (
                    <div
                      key={evt.id}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px',
                      }}
                      className="card-hover"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={evt.coverImage}
                          alt={evt.title}
                          style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                        />
                        <div>
                          <span className="badge badge-indigo" style={{ marginBottom: '4px' }}>{evt.category}</span>
                          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.25 }}>
                            {evt.title}
                          </h4>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📅 {evt.date}</span>
                            <span>📍 {evt.venue}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>TICKET CODE</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                          {reg?.ticketCode || 'CONFIRMED'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's Tasks & Productivity Widget */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={18} color="var(--success)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Priority Tasks</h3>
                <span className="badge badge-emerald">{pendingTasks.length} Pending</span>
              </div>
              <button onClick={() => onNavigate('tasks')} className="btn btn-ghost btn-sm">
                Open Task Board <ChevronRight size={14} />
              </button>
            </div>

            {/* Completion Progress Bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Weekly Student Goal</span>
                <span style={{ fontWeight: 700, color: 'var(--success-text)' }}>{completionPercentage}% complete</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'var(--success)', transition: 'width 250ms ease' }} />
              </div>
            </div>

            {/* Task list with 1-click checkoff */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasks.slice(0, 4).map((task) => {
                const isDone = task.status === 'Completed';
                return (
                  <div
                    key={task.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isDone ? 'var(--bg-hover)' : 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => handleToggleTask(task.id, task.status)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: 'var(--success)',
                        cursor: 'pointer',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          textDecoration: isDone ? 'line-through' : 'none',
                          color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
                        }}
                      >
                        {task.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                        <span>Due: {task.dueDate}</span>
                        <span>•</span>
                        <span style={{ color: task.priority === 'Urgent' ? 'var(--error)' : 'var(--text-secondary)' }}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trending Community Discussions */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={18} color="#EF4444" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Trending on Campus Feed</h3>
              </div>
              <button onClick={() => onNavigate('community')} className="btn btn-ghost btn-sm">
                View Forum <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {posts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  onClick={() => onNavigate('community', post.id)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                  className="card-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <img src={post.authorAvatar} alt={post.authorName} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{post.authorName}</span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{post.category}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>{post.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {post.likes.length} students upvoted • {post.commentsCount} comments
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Suggested Teammates & Marketplace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Smart Match Teammates Widget */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--secondary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Teammate Matches</h3>
              </div>
              <button onClick={() => onNavigate('hackathon')} className="btn btn-ghost btn-sm">
                Explore <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Calculated based on your complementary tech skills, availability, and hackathon interests:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {suggestedTeammates.map(({ user, score }) => (
                <div
                  key={user.id}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-hover)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={user.avatar} alt={user.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {user.preferredRoles?.[0] || user.department}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        background: 'var(--secondary-light)',
                        color: 'var(--secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                      }}
                      title="Algorithmic match score"
                    >
                      {score}% Match
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {user.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} style={{ fontSize: '0.68rem', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onNavigate('hackathon')}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fresh Campus Marketplace Listings */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={18} color="var(--accent)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Marketplace Radar</h3>
              </div>
              <button onClick={() => onNavigate('marketplace')} className="btn btn-ghost btn-sm">
                Shop All <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {marketplaceItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('marketplace', item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                  className="card-hover"
                >
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>${item.price}</span>
                      <span>•</span>
                      <span>{item.condition}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
