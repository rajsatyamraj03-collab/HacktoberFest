import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  ShoppingBag, 
  CheckSquare, 
  MessageSquare, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  ChevronDown, 
  Zap, 
  GraduationCap, 
  Flame,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';
import { getEvents, getPosts, getTeams, getMarketplaceItems } from '../services/storage';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuth }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [benefitTab, setBenefitTab] = useState<'students' | 'organizers'>('students');

  const events = getEvents().slice(0, 3);
  const posts = getPosts().slice(0, 3);
  const teams = getTeams().slice(0, 3);
  const items = getMarketplaceItems().slice(0, 4);

  const faqs = [
    {
      q: 'Who can join CampusVerse?',
      a: 'CampusVerse is designed for all undergraduate and graduate college students, student clubs, hackathon organizers, and faculty administrators.',
    },
    {
      q: 'Is CampusVerse completely free for students?',
      a: 'Yes! Access to discover events, join clubs, find teammates, manage tasks, and browse the marketplace is 100% free.',
    },
    {
      q: 'How does the Hackathon Teammate Matchmaker work?',
      a: 'Our smart matching algorithm compares your declared skills, target hackathon tracks, availability (weekends/evenings), and complementary roles to recommend compatible partners with a transparent match score.',
    },
    {
      q: 'How does the campus marketplace keep transactions safe?',
      a: 'CampusVerse operates as a verified peer-to-peer campus discovery directory. We encourage meeting in designated public campus zones (like library lobbies or student union cafes) and inspecting items in person before exchange.',
    },
    {
      q: 'Can club organizers manage attendance and export participant lists?',
      a: 'Yes. Organizers have dedicated management dashboards to view registered participants, check in attendees with one click, and export privacy-conscious CSV rosters.',
    },
  ];

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      {/* Landing Navbar */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '14px 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          onClick={() => onNavigate('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FFFFFF" />
              <path d="M2 17L12 22L22 17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
              CampusVerse
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button onClick={() => onNavigate('events')} className="btn btn-ghost btn-sm">Explore Events</button>
          <button onClick={() => onNavigate('community')} className="btn btn-ghost btn-sm">Community</button>
          <button onClick={() => onNavigate('hackathon')} className="btn btn-ghost btn-sm">Find Teammates</button>
          <button onClick={() => onNavigate('marketplace')} className="btn btn-ghost btn-sm">Marketplace</button>
          <button onClick={onOpenAuth} className="btn btn-outline btn-sm">Sign In</button>
          <button onClick={() => onNavigate('dashboard')} className="btn btn-primary btn-sm">
            Launch App <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '5rem 2rem 4rem', maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
          }}
        >
          <Sparkles size={14} /> ONE CAMPUS. EVERY OPPORTUNITY.
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: 'var(--text-main)',
            maxWidth: '900px',
            margin: '0 auto 1.5rem',
          }}
        >
          Your Campus Life,{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            All in One Place.
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}
        >
          Discover events, meet your people, build winning hackathon teams, trade campus essentials, and organize your student life — all from one unified platform.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <button onClick={() => onNavigate('dashboard')} className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
            Explore CampusVerse <ArrowRight size={18} />
          </button>
          <button onClick={onOpenAuth} className="btn btn-outline btn-lg">
            Join Your Campus
          </button>
        </div>

        {/* Floating Mockup / Live Preview Container */}
        <div
          style={{
            background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-subtle) 100%)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)',
            maxWidth: '1060px',
            margin: '0 auto',
            position: 'relative',
          }}
        >
          {/* Mock Dashboard Top Ribbon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ marginLeft: '12px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                campusverse.app/dashboard
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-emerald">● Live Ecosystem</span>
              <span className="badge badge-indigo">5 Modules Active</span>
            </div>
          </div>

          {/* 4 Interactive Feature Cards in Hero */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', textAlign: 'left' }}>
            <div className="card card-hover" style={{ padding: '16px' }} onClick={() => onNavigate('events')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Calendar size={18} color="var(--primary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>EVENT DISCOVERY</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>HackVerse 2026</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>36-Hour National Hackathon • 184 registered</div>
            </div>

            <div className="card card-hover" style={{ padding: '16px' }} onClick={() => onNavigate('hackathon')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Users size={18} color="var(--secondary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)' }}>TEAM FINDER</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>DevPulse AI Assistant</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>94% Smart Match • +2 open positions</div>
            </div>

            <div className="card card-hover" style={{ padding: '16px' }} onClick={() => onNavigate('marketplace')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShoppingBag size={18} color="var(--accent)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>MARKETPLACE</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>iPad 9th Gen + Pencil</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>$240 • Verified Student Seller</div>
            </div>

            <div className="card card-hover" style={{ padding: '16px' }} onClick={() => onNavigate('tasks')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckSquare size={18} color="var(--success)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>PRODUCTIVITY</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>OS Lab 4 Submission</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Due in 2 days • High Priority</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Featured Events Preview */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              MODULE A: EVENT HUB
            </div>
            <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>Featured Upcoming Events</h2>
          </div>
          <button onClick={() => onNavigate('events')} className="btn btn-outline btn-sm">
            View All Events <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {events.map((e) => (
            <div key={e.id} className="card card-interactive" onClick={() => onNavigate('events')}>
              <img src={e.coverImage} alt={e.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-indigo">{e.category}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{e.format}</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>{e.title}</h3>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {e.date} at {e.time}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Compass size={14} /> {e.venue}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <strong>{e.registeredCount}</strong> / {e.capacity} seats filled
                  </span>
                  <button className="btn btn-primary btn-sm">Register Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 & 3: Community & Hackathon highlights */}
      <section style={{ padding: '4rem 2rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '40px' }}>
          {/* Community Feed preview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge badge-violet" style={{ marginBottom: '6px' }}>MODULE B</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Trending Student Discussions</h3>
              </div>
              <button onClick={() => onNavigate('community')} className="btn btn-outline btn-sm">Join Feed</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {posts.map((p) => (
                <div key={p.id} className="card card-hover" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => onNavigate('community')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <img src={p.authorAvatar} alt={p.authorName} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.authorName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {p.category}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>{p.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '16px' }}>
                    <span>👍 {p.likes.length} Upvotes</span>
                    <span>💬 {p.commentsCount} Comments</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hackathon Teams preview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge badge-indigo" style={{ marginBottom: '6px' }}>MODULE C</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Find Teammates with Smart Matching</h3>
              </div>
              <button onClick={() => onNavigate('hackathon')} className="btn btn-outline btn-sm">Browse Teams</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {teams.map((t) => (
                <div key={t.id} className="card card-hover" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => onNavigate('hackathon')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target: {t.hackathonName}</div>
                    </div>
                    <span className="badge badge-emerald">Open for members</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '8px 0', lineHeight: 1.4 }}>
                    {t.problemStatement.slice(0, 110)}...
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {t.requiredRoles.map((r, i) => (
                      <span key={i} className="badge badge-violet" style={{ fontSize: '0.7rem' }}>+ Needs {r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Student Marketplace Highlights */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              MODULE D: BUY & SELL
            </div>
            <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>Campus Marketplace Highlights</h2>
          </div>
          <button onClick={() => onNavigate('marketplace')} className="btn btn-outline btn-sm">
            Explore All Listings <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {items.map((item) => (
            <div key={item.id} className="card card-interactive" onClick={() => onNavigate('marketplace')}>
              <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '170px', objectFit: 'cover' }} />
              <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>${item.price}</span>
                  <span className="badge badge-neutral">{item.condition}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px', lineHeight: 1.3 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  📍 {item.pickupLocation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 6: How It Works */}
      <section style={{ padding: '4rem 2rem', background: 'var(--bg-subtle)' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>How CampusVerse Works</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
            Empowering students from day one to graduation in 3 simple steps.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '14px' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Build Your Student Profile</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Add your degree, skills, project links, and interests to unlock personalized teammate matching and event recommendations.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '14px' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Engage, Compete & Trade</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Register for hackathons, share insights on the community forum, collaborate on projects, and trade textbooks safely on campus.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '14px' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Stay Organized & Ahead</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Sync event deadlines to your personal Kanban task board with automated reminders to never miss a submission or interview.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Benefits for Students & Organizers */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Engineered for Campus Success</h2>
          <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', padding: '4px', marginTop: '1rem' }}>
            <button
              onClick={() => setBenefitTab('students')}
              className={`chip ${benefitTab === 'students' ? 'chip-active' : ''}`}
            >
              For College Students
            </button>
            <button
              onClick={() => setBenefitTab('organizers')}
              className={`chip ${benefitTab === 'organizers' ? 'chip-active' : ''}`}
            >
              For Clubs & Organizers
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {benefitTab === 'students' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>🚀 1-Click Event Passes</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Instant ticket codes with automatic event reminder task generation.</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>🤝 Transparent Teammate Match</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Algorithmic scoring based on skill complementarity and project availability.</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>📚 Budget-Friendly Marketplace</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Save up to 80% on textbooks and lab kits traded directly with seniors.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>📊 Live Attendance Management</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monitor registrations in real-time and toggle check-in statuses seamlessly.</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>📄 Privacy-Preserving CSV Rosters</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Export participant rosters for official university event audits.</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>🛡️ Content Moderation Tools</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ensure campus discussions remain healthy, safe, and academically focused.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 8: FAQ Accordion */}
      <section style={{ padding: '4rem 2rem', background: 'var(--bg-subtle)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="card" style={{ overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      color="var(--text-muted)"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 200ms ease',
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 20px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: '#FFFFFF' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
          Ready to Elevate Your Campus Experience?
        </h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>
          Join thousands of students and clubs collaborating across events, hackathons, and academics.
        </p>
        <button onClick={() => onNavigate('dashboard')} className="btn btn-lg" style={{ background: '#FFFFFF', color: 'var(--primary)', fontWeight: 700 }}>
          Launch CampusVerse Now <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-subtle)', padding: '3rem 2rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>CampusVerse</div>
            <div>One Campus. Every Opportunity. Built for Hackathons & University Life.</div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ cursor: 'pointer' }}>About</span>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer' }}>Help & Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
