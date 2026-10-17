import React, { useState } from 'react';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertCircle, 
  Download, 
  X, 
  ArrowLeft, 
  CheckCircle2, 
  Share2,
  Trash2
} from 'lucide-react';
import { getUserRegistrations, getEvents, cancelRegistration, getCurrentUser } from '../services/storage';
import { useToast } from '../components/common/Toast';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface MyRegistrationsPageProps {
  onNavigate: (page: string) => void;
}

export const MyRegistrationsPage: React.FC<MyRegistrationsPageProps> = ({ onNavigate }) => {
  const currentUser = getCurrentUser();
  const registrations = getUserRegistrations();
  const events = getEvents();
  const { showToast } = useToast();

  const [cancelModalId, setCancelModalId] = useState<string | null>(null);

  const activeRegistrations = registrations.filter((r) => r.status !== 'Cancelled');
  const pastCancelled = registrations.filter((r) => r.status === 'Cancelled');

  const handleConfirmCancel = () => {
    if (!cancelModalId) return;
    cancelRegistration(cancelModalId);
    setCancelModalId(null);
    showToast('Registration Cancelled', 'Your registration and pass have been cancelled.', 'info');
  };

  // Generate .ics calendar download
  const handleDownloadCalendar = (eventTitle: string, eventDate: string, eventVenue: string) => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusVerse//EN
BEGIN:VEVENT
SUMMARY:${eventTitle}
DESCRIPTION:Official CampusVerse Event
LOCATION:${eventVenue}
DTSTART:${eventDate.replace(/-/g, '')}T100000Z
DTEND:${eventDate.replace(/-/g, '')}T180000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${eventTitle.slice(0, 15).replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Calendar Downloaded', 'Added event to your calendar (.ics).', 'success');
  };

  return (
    <div className="content-wrapper">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button
            onClick={() => onNavigate('events')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Event Discovery
          </button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            My Event Passes & Registrations
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Your official digital tickets and campus check-in passes.
          </p>
        </div>

        <button onClick={() => onNavigate('events')} className="btn btn-primary btn-sm">
          Browse More Events
        </button>
      </div>

      {activeRegistrations.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Ticket size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>No active event passes</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '4px auto 18px' }}>
            You haven't registered for any campus events yet. Explore upcoming hackathons, workshops, and fests!
          </p>
          <button onClick={() => onNavigate('events')} className="btn btn-primary btn-sm">
            Explore Events
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {activeRegistrations.map((reg) => {
            const event = events.find((e) => e.id === reg.eventId);
            if (!event) return null;

            return (
              <div
                key={reg.id}
                className="card card-hover"
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Event Cover Image Header */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <span className="badge badge-emerald">● {reg.status}</span>
                  </div>
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#FFFFFF',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {event.format}
                    </span>
                  </div>
                </div>

                {/* Ticket Details */}
                <div style={{ padding: '18px' }}>
                  <span className="badge badge-indigo" style={{ marginBottom: '6px' }}>{event.category}</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.25, marginBottom: '8px' }}>
                    {event.title}
                  </h3>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="var(--primary)" />
                      <span>{event.date} at {event.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--text-muted)" />
                      <span>{event.venue}</span>
                    </div>
                  </div>

                  {/* Digital Pass Stub */}
                  <div
                    style={{
                      background: 'var(--bg-hover)',
                      border: '2px dashed var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          PASS HOLDER
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{reg.userName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          ID: {reg.studentId} • {reg.department}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          TICKET CODE
                        </div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
                          {reg.ticketCode}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleDownloadCalendar(event.title, event.date, event.venue)}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1 }}
                      title="Download .ics Calendar Event"
                    >
                      <Download size={14} /> Add to Calendar
                    </button>
                    <button
                      onClick={() => setCancelModalId(reg.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--error)' }}
                      title="Cancel Registration"
                    >
                      <Trash2 size={15} /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Cancelling Pass */}
      <ConfirmModal
        isOpen={!!cancelModalId}
        title="Cancel Event Registration?"
        message="Are you sure you want to cancel your seat? This ticket code will be invalidated and your seat will be released to other students."
        confirmLabel="Yes, Cancel Registration"
        isDestructive={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalId(null)}
      />
    </div>
  );
};
