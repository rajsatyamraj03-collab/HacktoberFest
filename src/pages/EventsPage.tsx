import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Grid, 
  List, 
  MapPin, 
  Clock, 
  UserCheck, 
  Plus, 
  Share2, 
  CheckCircle2, 
  X, 
  FileSpreadsheet, 
  Users, 
  Sparkles,
  Ticket,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Download
} from 'lucide-react';
import { 
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  registerForEvent, 
  getRegistrations, 
  getCurrentUser, 
  getEventRegistrations,
  updateRegistrationStatus
} from '../services/storage';
import { CampusEvent, EventCategory, EventFormat, EventRegistration } from '../types';
import { useToast } from '../components/common/Toast';
import confetti from 'canvas-confetti';

interface EventsPageProps {
  onNavigate: (page: string) => void;
  selectedEventId?: string;
}

const CATEGORIES: EventCategory[] = [
  'Hackathons',
  'Technical workshops',
  'Cultural fests',
  'Sports',
  'Seminars and guest lectures',
  'Competitions',
  'Club activities',
  'Career and placement events',
];

export const EventsPage: React.FC<EventsPageProps> = ({ onNavigate, selectedEventId }) => {
  const events = getEvents();
  const currentUser = getCurrentUser();
  const registrations = getRegistrations();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'newest'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [activeDetailEvent, setActiveDetailEvent] = useState<CampusEvent | null>(() => {
    if (selectedEventId) {
      return events.find((e) => e.id === selectedEventId) || null;
    }
    return null;
  });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isOrganizerManageOpen, setIsOrganizerManageOpen] = useState(false);
  const [registeredConfirmedTicket, setRegisteredConfirmedTicket] = useState<EventRegistration | null>(null);

  // Registration form inputs
  const [regStudentId, setRegStudentId] = useState('AIT-2023-CS-042');
  const [regDepartment, setRegDepartment] = useState(currentUser.department);
  const [regYear, setRegYear] = useState('3rd Year');
  const [regTeamName, setRegTeamName] = useState('');
  const [regNotes, setRegNotes] = useState('');
  const [autoAddPrepTask, setAutoAddPrepTask] = useState(true);

  // Create Event Form inputs
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventCat, setNewEventCat] = useState<EventCategory>('Hackathons');
  const [newEventFormat, setNewEventFormat] = useState<EventFormat>('In-Person');
  const [newEventDate, setNewEventDate] = useState('2026-11-25');
  const [newEventTime, setNewEventTime] = useState('10:00 AM');
  const [newEventVenue, setNewEventVenue] = useState('Main Campus Auditorium');
  const [newEventCapacity, setNewEventCapacity] = useState(150);
  const [newEventDeadline, setNewEventDeadline] = useState('2026-11-20');
  const [newEventCover, setNewEventCover] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80');

  const isOrganizer = currentUser.role === 'organizer' || currentUser.role === 'admin';

  // Filter & sort logic
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchSearch =
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'All' || evt.category === selectedCategory;
      const matchFormat = selectedFormat === 'All' || evt.format === selectedFormat;

      return matchSearch && matchCategory && matchFormat;
    }).sort((a, b) => {
      if (sortBy === 'popularity') return b.registeredCount - a.registeredCount;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [events, searchQuery, selectedCategory, selectedFormat, sortBy]);

  // Check if current user is registered
  const isUserRegisteredFor = (eventId: string) => {
    return registrations.some((r) => r.eventId === eventId && r.userId === currentUser.id && r.status === 'Confirmed');
  };

  // Handle Event Registration Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDetailEvent) return;

    const res = registerForEvent(activeDetailEvent.id, {
      studentId: regStudentId,
      department: regDepartment,
      year: regYear,
      teamName: regTeamName,
      notes: regNotes,
      createPrepTask: autoAddPrepTask,
    });

    if (res.success && res.registration) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setRegisteredConfirmedTicket(res.registration);
      setIsRegisterModalOpen(false);
      showToast('Registration Confirmed! 🎟️', `Your ticket code is ${res.registration.ticketCode}`, 'success');
      if (autoAddPrepTask) {
        showToast('Task Created', 'Added event prep task to your productivity manager.', 'info');
      }
    } else {
      showToast('Registration Failed', res.message, 'error');
    }
  };

  // Handle Create Event Submit
  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent({
      title: newEventTitle,
      description: newEventDesc,
      category: newEventCat,
      organizerId: currentUser.id,
      organizerName: currentUser.name,
      organizerAvatar: currentUser.avatar,
      organizerClub: currentUser.department,
      date: newEventDate,
      time: newEventTime,
      venue: newEventVenue,
      format: newEventFormat,
      registrationDeadline: newEventDeadline,
      capacity: Number(newEventCapacity),
      coverImage: newEventCover,
      tags: ['Campus', newEventCat, 'Official'],
      eligibility: 'All students with valid college ID.',
      participationRules: ['Bring valid college ID', 'Follow campus code of conduct'],
      schedule: [{ time: newEventTime, activity: 'Event Kickoff & Sessions' }],
      contactEmail: currentUser.email,
      status: 'Published',
    });

    setIsCreateModalOpen(false);
    confetti({ particleCount: 40, spread: 50 });
    showToast('Event Published! 🚀', `"${newEventTitle}" is now live for registration.`, 'success');
  };

  // Export CSV of participants (privacy-conscious, authorized)
  const handleExportCSV = (eventId: string, eventTitle: string) => {
    const list = getEventRegistrations(eventId);
    if (list.length === 0) {
      showToast('No registrations', 'There are no registered participants yet.', 'warning');
      return;
    }

    const headers = 'Ticket Code,Student Name,Email,Department,Year,Status,Registered At\n';
    const rows = list.map((r) => `"${r.ticketCode}","${r.userName}","${r.userEmail}","${r.department}","${r.year}","${r.status}","${r.registeredAt}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle.slice(0, 20).replace(/\s+/g, '_')}_participants.csv`;
    a.click();
    showToast('CSV Exported', 'Downloaded participant roster.', 'success');
  };

  return (
    <div className="content-wrapper">
      {/* Top Banner & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Campus Event Hub
            </h1>
            <span className="badge badge-indigo">MODULE A</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Discover hackathons, workshops, cultural fests, sports tourneys, and guest lectures across campus.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => onNavigate('registrations')} className="btn btn-outline btn-sm">
            <Ticket size={16} /> My Registrations ({registrations.filter((r) => r.userId === currentUser.id && r.status === 'Confirmed').length})
          </button>
          {isOrganizer && (
            <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> Create Event
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by title, organizer, topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Format dropdown */}
          <div style={{ minWidth: '130px' }}>
            <select
              className="select-field"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="All">All Formats</option>
              <option value="In-Person">In-Person</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Virtual">Virtual</option>
            </select>
          </div>

          {/* Sort dropdown */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="select-field"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date">Sort: Upcoming Date</option>
              <option value="popularity">Sort: Most Popular</option>
              <option value="newest">Sort: Recently Added</option>
            </select>
          </div>

          {/* Grid/List View Toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--bg-hover)' : 'transparent',
                border: 'none',
                padding: '6px 10px',
                cursor: 'pointer',
                color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-secondary)',
              }}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'var(--bg-hover)' : 'transparent',
                border: 'none',
                padding: '6px 10px',
                cursor: 'pointer',
                color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-secondary)',
              }}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Category Filter Chips Bar */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '12px', paddingBottom: '4px' }}>
          <button
            className={`chip ${selectedCategory === 'All' ? 'chip-active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`chip ${selectedCategory === cat ? 'chip-active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Results Count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div>Showing <strong>{filteredEvents.length}</strong> campus events</div>
        {selectedCategory !== 'All' && (
          <button onClick={() => setSelectedCategory('All')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
            Reset Category
          </button>
        )}
      </div>

      {/* Events Grid or List */}
      {filteredEvents.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Calendar size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No events found</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Try adjusting your search query or category filters.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredEvents.map((evt) => {
            const isRegistered = isUserRegisteredFor(evt.id);
            const isFull = evt.registeredCount >= evt.capacity;
            const percentFilled = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));

            return (
              <div key={evt.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={evt.coverImage}
                    alt={evt.title}
                    style={{ width: '100%', height: '175px', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                    <span className="badge badge-indigo">{evt.category}</span>
                    {evt.isTrending && <span className="badge badge-rose">🔥 Trending</span>}
                  </div>
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                    <span
                      style={{
                        background: 'rgba(15, 23, 42, 0.75)',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {evt.format}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3
                    style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3, cursor: 'pointer' }}
                    onClick={() => setActiveDetailEvent(evt)}
                  >
                    {evt.title}
                  </h3>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <img src={evt.organizerAvatar} alt={evt.organizerName} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                    <span>Organized by <strong>{evt.organizerName}</strong></span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="var(--primary)" />
                      <span>{evt.date} at {evt.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--text-muted)" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{evt.venue}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Capacity: {evt.registeredCount}/{evt.capacity}</span>
                      <span style={{ fontWeight: 600, color: isFull ? 'var(--error)' : 'var(--text-main)' }}>
                        {isFull ? 'Sold Out' : `${evt.capacity - evt.registeredCount} seats left`}
                      </span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
                      <div
                        style={{
                          width: `${percentFilled}%`,
                          height: '100%',
                          background: isFull ? 'var(--error)' : percentFilled > 80 ? 'var(--warning)' : 'var(--primary)',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setActiveDetailEvent(evt)}
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1 }}
                      >
                        Details
                      </button>

                      {isRegistered ? (
                        <button
                          className="btn btn-sm"
                          style={{ flex: 1, background: 'var(--success-light)', color: 'var(--success-text)', border: '1px solid var(--success)' }}
                          onClick={() => onNavigate('registrations')}
                        >
                          <CheckCircle2 size={14} /> Registered
                        </button>
                      ) : (
                        <button
                          disabled={isFull}
                          onClick={() => {
                            setActiveDetailEvent(evt);
                            setIsRegisterModalOpen(true);
                          }}
                          className={`btn btn-sm ${isFull ? 'btn-ghost' : 'btn-primary'}`}
                          style={{ flex: 1 }}
                        >
                          {isFull ? 'Event Full' : 'Register Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredEvents.map((evt) => {
            const isRegistered = isUserRegisteredFor(evt.id);
            return (
              <div
                key={evt.id}
                className="card card-hover"
                style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
                  <img src={evt.coverImage} alt={evt.title} style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  <div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                      <span className="badge badge-indigo">{evt.category}</span>
                      <span className="badge badge-neutral">{evt.format}</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => setActiveDetailEvent(evt)}>
                      {evt.title}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                      <span>📅 {evt.date}</span>
                      <span>📍 {evt.venue}</span>
                      <span>👥 {evt.registeredCount}/{evt.capacity}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setActiveDetailEvent(evt)} className="btn btn-outline btn-sm">
                    View Details
                  </button>
                  {isRegistered ? (
                    <button onClick={() => onNavigate('registrations')} className="btn btn-sm" style={{ background: 'var(--success-light)', color: 'var(--success-text)' }}>
                      <CheckCircle2 size={14} /> Registered
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveDetailEvent(evt);
                        setIsRegisterModalOpen(true);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Detail Modal */}
      {activeDetailEvent && !isRegisterModalOpen && (
        <div className="modal-overlay" onClick={() => setActiveDetailEvent(null)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative' }}>
              <img
                src={activeDetailEvent.coverImage}
                alt={activeDetailEvent.title}
                style={{ width: '100%', height: '220px', objectFit: 'cover' }}
              />
              <button
                onClick={() => setActiveDetailEvent(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span className="badge badge-indigo">{activeDetailEvent.category}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Format: <strong>{activeDetailEvent.format}</strong>
                </span>
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.25 }}>
                {activeDetailEvent.title}
              </h2>

              {/* Key metadata grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: 'var(--bg-hover)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>DATE & TIME</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{activeDetailEvent.date} • {activeDetailEvent.time}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>VENUE / LOCATION</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{activeDetailEvent.venue}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>REGISTRATION DEADLINE</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{activeDetailEvent.registrationDeadline}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>SEATS / CAPACITY</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{activeDetailEvent.registeredCount} / {activeDetailEvent.capacity} Filled</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>About This Event</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {activeDetailEvent.description}
                </p>
              </div>

              {/* Schedule Timeline */}
              {activeDetailEvent.schedule && activeDetailEvent.schedule.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>Event Schedule</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {activeDetailEvent.schedule.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', fontSize: '0.8125rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', width: '130px', flexShrink: 0 }}>{item.time}</span>
                        <span style={{ color: 'var(--text-main)' }}>{item.activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility & Rules */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>Eligibility & Rules</h4>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {activeDetailEvent.eligibility}
                </div>
                {activeDetailEvent.participationRules?.map((rule, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>•</span> {rule}
                  </div>
                ))}
              </div>

              {/* Organizer Profile */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={activeDetailEvent.organizerAvatar} alt={activeDetailEvent.organizerName} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{activeDetailEvent.organizerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{activeDetailEvent.organizerClub || 'Campus Organizer'}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('Link Copied', 'Shareable event URL copied to clipboard.', 'success');
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              {isOrganizer ? (
                <button
                  onClick={() => {
                    setIsOrganizerManageOpen(true);
                  }}
                  className="btn btn-outline btn-sm"
                >
                  <Users size={14} /> Manage Registrations ({activeDetailEvent.registeredCount})
                </button>
              ) : <div />}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setActiveDetailEvent(null)}>
                  Close
                </button>
                {isUserRegisteredFor(activeDetailEvent.id) ? (
                  <button className="btn btn-sm" style={{ background: 'var(--success-light)', color: 'var(--success-text)' }} onClick={() => onNavigate('registrations')}>
                    <CheckCircle2 size={14} /> View Ticket Pass
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsRegisterModalOpen(true)}
                  >
                    Register for Event
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Workflow Form Modal */}
      {isRegisterModalOpen && activeDetailEvent && (
        <div className="modal-overlay" onClick={() => setIsRegisterModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Confirm Event Registration</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {activeDetailEvent.title}
                </div>
              </div>
              <button onClick={() => setIsRegisterModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" disabled className="input-field" value={currentUser.name} />
                </div>

                <div className="form-group">
                  <label className="form-label">College Email</label>
                  <input type="email" disabled className="input-field" value={currentUser.email} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Student ID Number *</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value)}
                      placeholder="e.g. AIT-2023-CS-042"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year of Study *</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={regYear}
                      onChange={(e) => setRegYear(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Department / Major *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                  />
                </div>

                {activeDetailEvent.category === 'Hackathons' && (
                  <div className="form-group">
                    <label className="form-label">Team Name (Optional if seeking team)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. ByteBuilders"
                      value={regTeamName}
                      onChange={(e) => setRegTeamName(e.target.value)}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Special Requirements / Notes</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Dietary, hardware kit requests, etc."
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                  />
                </div>

                {/* Auto create prep task in Module E */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', cursor: 'pointer', background: 'var(--primary-light)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                  <input
                    type="checkbox"
                    checked={autoAddPrepTask}
                    onChange={(e) => setAutoAddPrepTask(e.target.checked)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>
                    <strong>Auto-add reminder task:</strong> Create an preparation task in Module E with deadline {activeDetailEvent.date}.
                  </span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsRegisterModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration Confirmation Ticket Modal */}
      {registeredConfirmedTicket && (
        <div className="modal-overlay" onClick={() => setRegisteredConfirmedTicket(null)}>
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ padding: '32px 24px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Registration Confirmed! 🎉</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '20px' }}>
                Your seat has been reserved. Show your ticket pass at venue check-in.
              </p>

              <div style={{ background: 'var(--bg-hover)', border: '2px dashed var(--primary)', borderRadius: 'var(--radius-lg)', padding: '18px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>OFFICIAL TICKET CODE</div>
                <div style={{ fontSize: '1.4rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em', margin: '6px 0' }}>
                  {registeredConfirmedTicket.ticketCode}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Name: {registeredConfirmedTicket.userName} • ID: {registeredConfirmedTicket.studentId}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setRegisteredConfirmedTicket(null)}
                >
                  Close
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setRegisteredConfirmedTicket(null);
                    onNavigate('registrations');
                  }}
                >
                  View My Passes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organizer Dashboard: Manage Registered Participants Table Modal */}
      {isOrganizerManageOpen && activeDetailEvent && (
        <div className="modal-overlay" onClick={() => setIsOrganizerManageOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  Manage Participants: {activeDetailEvent.title}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Total: {getEventRegistrations(activeDetailEvent.id).length} registered / {activeDetailEvent.capacity} capacity
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleExportCSV(activeDetailEvent.id, activeDetailEvent.title)}
                  className="btn btn-outline btn-sm"
                >
                  <FileSpreadsheet size={15} /> Export CSV
                </button>
                <button onClick={() => setIsOrganizerManageOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px' }}>Ticket Code</th>
                    <th style={{ padding: '10px 14px' }}>Student Name</th>
                    <th style={{ padding: '10px 14px' }}>Dept / Year</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                    <th style={{ padding: '10px 14px' }}>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {getEventRegistrations(activeDetailEvent.id).map((reg) => (
                    <tr key={reg.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600 }}>{reg.ticketCode}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600 }}>{reg.userName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{reg.userEmail}</div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>{reg.department} ({reg.year})</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className={`badge ${reg.status === 'Attended' ? 'badge-emerald' : reg.status === 'Cancelled' ? 'badge-rose' : 'badge-indigo'}`}>
                          {reg.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <button
                          onClick={() => {
                            const next = reg.status === 'Attended' ? 'Confirmed' : 'Attended';
                            updateRegistrationStatus(reg.id, next);
                            showToast('Attendance Updated', `${reg.userName} marked as ${next}.`, 'success');
                          }}
                          className={`btn btn-sm ${reg.status === 'Attended' ? 'btn-outline' : 'btn-primary'}`}
                          style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                        >
                          {reg.status === 'Attended' ? 'Unmark Attended' : 'Mark Attended'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setIsOrganizerManageOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal for Organizers */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Publish New Campus Event</h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. HackVerse 2026: Campus Hackathon"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="select-field"
                      value={newEventCat}
                      onChange={(e) => setNewEventCat(e.target.value as any)}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Format *</label>
                    <select
                      className="select-field"
                      value={newEventFormat}
                      onChange={(e) => setNewEventFormat(e.target.value as any)}
                    >
                      <option value="In-Person">In-Person</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Virtual">Virtual</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      required
                      className="input-field"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time *</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="e.g. 10:00 AM"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Venue / Room / Stream URL *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Campus Innovation Center, Auditorium 3"
                    value={newEventVenue}
                    onChange={(e) => setNewEventVenue(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Participant Capacity *</label>
                    <input
                      type="number"
                      required
                      min={10}
                      className="input-field"
                      value={newEventCapacity}
                      onChange={(e) => setNewEventCapacity(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration Deadline *</label>
                    <input
                      type="date"
                      required
                      className="input-field"
                      value={newEventDeadline}
                      onChange={(e) => setNewEventDeadline(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description *</label>
                  <textarea
                    required
                    className="textarea-field"
                    rows={3}
                    placeholder="Provide full event overview, rules, prizes..."
                    value={newEventDesc}
                    onChange={(e) => setNewEventDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Image URL</label>
                  <input
                    type="url"
                    className="input-field"
                    value={newEventCover}
                    onChange={(e) => setNewEventCover(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
