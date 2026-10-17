import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Send, 
  X, 
  ShieldCheck, 
  FolderGit2, 
  ArrowRight,
  UserCheck,
  UserPlus,
  MessageSquare,
  Award,
  ChevronRight
} from 'lucide-react';
import { 
  getTeams, 
  getUsers, 
  createTeam, 
  getJoinRequests, 
  submitJoinRequest, 
  handleJoinRequest, 
  getCurrentUser, 
  calculateMatchScore 
} from '../services/storage';
import { HackathonTeam, TeamJoinRequest, User } from '../types';
import { useToast } from '../components/common/Toast';
import confetti from 'canvas-confetti';

interface HackathonPageProps {
  onNavigate: (page: string) => void;
  selectedTeamId?: string;
}

export const HackathonPage: React.FC<HackathonPageProps> = ({ selectedTeamId }) => {
  const teams = getTeams();
  const allUsers = getUsers();
  const joinRequests = getJoinRequests();
  const currentUser = getCurrentUser();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'teams' | 'teammates' | 'my-requests'>('teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');

  // Modals state
  const [activeTeamDetail, setActiveTeamDetail] = useState<HackathonTeam | null>(() => {
    if (selectedTeamId) {
      return teams.find((t) => t.id === selectedTeamId) || null;
    }
    return null;
  });
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);
  const [targetJoinTeam, setTargetJoinTeam] = useState<HackathonTeam | null>(null);

  // Join Request form fields
  const [joinRole, setJoinRole] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [joinPortfolio, setJoinPortfolio] = useState(currentUser.portfolioUrl || '');

  // Create Team form fields
  const [teamName, setTeamName] = useState('');
  const [hackathonName, setHackathonName] = useState('HackVerse 2026');
  const [projectIdea, setProjectIdea] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [techStackStr, setTechStackStr] = useState('React, Python, FastAPI');
  const [requiredRolesStr, setRequiredRolesStr] = useState('UI/UX Designer, ML Engineer');
  const [maxSize, setMaxSize] = useState(4);
  const [teamLogo, setTeamLogo] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80');

  // Filtered Teams
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.projectIdea.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.problemStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.techStack.some((ts) => ts.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchRole = roleFilter === 'All' || t.requiredRoles.some((r) => r.toLowerCase().includes(roleFilter.toLowerCase()));
      const matchSkill = skillFilter === 'All' || t.techStack.some((ts) => ts.toLowerCase().includes(skillFilter.toLowerCase()));

      return matchSearch && matchRole && matchSkill;
    });
  }, [teams, searchQuery, roleFilter, skillFilter]);

  // Teammates directory with Smart Matching calculation
  const candidatesWithScore = useMemo(() => {
    return allUsers
      .filter((u) => u.id !== currentUser.id)
      .map((user) => ({
        user,
        score: calculateMatchScore(currentUser, user),
      }))
      .filter(({ user }) => {
        const matchSearch =
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
          user.department.toLowerCase().includes(searchQuery.toLowerCase());

        const matchSkill = skillFilter === 'All' || user.skills.some((s) => s.toLowerCase() === skillFilter.toLowerCase());
        const matchExp = experienceFilter === 'All' || user.experienceLevel === experienceFilter;

        return matchSearch && matchSkill && matchExp;
      })
      .sort((a, b) => b.score - a.score);
  }, [allUsers, currentUser, searchQuery, skillFilter, experienceFilter]);

  // Incoming join requests for teams I own
  const myOwnedTeamIds = teams.filter((t) => t.ownerId === currentUser.id).map((t) => t.id);
  const incomingRequests = joinRequests.filter((r) => myOwnedTeamIds.includes(r.teamId));
  const mySentRequests = joinRequests.filter((r) => r.userId === currentUser.id);

  // Handle Create Team Submit
  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const techStack = techStackStr.split(',').map((s) => s.trim()).filter(Boolean);
    const requiredRoles = requiredRolesStr.split(',').map((s) => s.trim()).filter(Boolean);

    createTeam({
      name: teamName,
      hackathonName,
      logo: teamLogo,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerAvatar: currentUser.avatar,
      projectIdea,
      problemStatement,
      proposedSolution,
      techStack,
      requiredRoles,
      maxTeamSize: Number(maxSize),
    });

    setIsCreateTeamOpen(false);
    confetti({ particleCount: 50, spread: 60 });
    showToast('Team Created! 🚀', `"${teamName}" is now open for recruitments.`, 'success');
  };

  // Handle Join Request Submit
  const handleSendJoinRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetJoinTeam) return;

    const res = submitJoinRequest(targetJoinTeam.id, joinRole || targetJoinTeam.requiredRoles[0] || 'Contributor', joinMessage, joinPortfolio);
    if (res) {
      confetti({ particleCount: 30, spread: 45 });
      showToast('Join Request Sent! 🤝', `Sent application to ${targetJoinTeam.name}.`, 'success');
      setIsJoinRequestModalOpen(false);
      setJoinMessage('');
    } else {
      showToast('Request Failed', 'You have already submitted a pending request to this team.', 'error');
    }
  };

  // Handle Accept/Reject Join Request
  const handleRespondRequest = (reqId: string, action: 'Accepted' | 'Rejected') => {
    handleJoinRequest(reqId, action);
    if (action === 'Accepted') {
      confetti({ particleCount: 50, spread: 60 });
      showToast('Member Accepted! 🎉', 'New teammate added to your hackathon roster.', 'success');
    } else {
      showToast('Request Declined', 'Join request was rejected.', 'info');
    }
  };

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Hackathon Team Finder
            </h1>
            <span className="badge badge-indigo">MODULE C</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Discover hackathon teams, find teammates with smart matching, and manage join invitations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsCreateTeamOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={16} /> Create Team
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', padding: '0 8px' }}>
        <button
          onClick={() => setActiveTab('teams')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'teams' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'teams' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={16} /> Browse Teams ({teams.length})
        </button>
        <button
          onClick={() => setActiveTab('teammates')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'teammates' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'teammates' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={16} color="var(--secondary)" /> Find Teammates (Smart Match)
        </button>
        <button
          onClick={() => setActiveTab('my-requests')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'my-requests' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'my-requests' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <UserPlus size={16} /> Collaboration Hub {incomingRequests.filter((r) => r.status === 'Pending').length > 0 && (
            <span className="badge badge-rose">{incomingRequests.filter((r) => r.status === 'Pending').length}</span>
          )}
        </button>
      </div>

      {/* Tab 1: Teams Directory */}
      {activeTab === 'teams' && (
        <div>
          {/* Search & Filter Bar */}
          <div className="card" style={{ padding: '14px', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search team name, project idea, tech stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <div style={{ minWidth: '150px' }}>
              <select className="select-field" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="All">All Open Roles</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Frontend">Frontend Dev</option>
                <option value="Backend">Backend Dev</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Hardware">Hardware / IoT</option>
              </select>
            </div>
          </div>

          {/* Teams Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {filteredTeams.map((team) => {
              const isOwner = team.ownerId === currentUser.id;
              const isMember = team.members.some((m) => m.userId === currentUser.id);
              const hasRequested = mySentRequests.some((r) => r.teamId === team.id && r.status === 'Pending');

              return (
                <div key={team.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Top Row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={team.logo} alt={team.name} style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.25 }}>{team.name}</h3>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Target: <strong>{team.hackathonName}</strong>
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${team.isOpen ? 'badge-emerald' : 'badge-neutral'}`}>
                        {team.isOpen ? 'Recruiting' : 'Full'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                      {team.problemStatement}
                    </p>

                    {/* Tech stack */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                      {team.techStack.map((tech, i) => (
                        <span key={i} style={{ fontSize: '0.7rem', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '2px 6px' }}>
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Open roles needed */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                        OPEN ROLES NEEDED ({team.requiredRoles.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {team.requiredRoles.map((role, idx) => (
                          <span key={idx} className="badge badge-violet" style={{ fontSize: '0.72rem' }}>
                            + {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Members avatars */}
                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ display: 'flex', marginLeft: '6px' }}>
                          {team.members.map((m, idx) => (
                            <img
                              key={idx}
                              src={m.avatar}
                              alt={m.name}
                              title={`${m.name} (${m.role})`}
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid var(--bg-card)',
                                marginLeft: idx > 0 ? '-8px' : '0',
                              }}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {team.members.length}/{team.maxTeamSize} members
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setActiveTeamDetail(team)}
                          className="btn btn-outline btn-sm"
                        >
                          Pitch & Roster
                        </button>

                        {isMember ? (
                          <span className="badge badge-indigo">You're in!</span>
                        ) : hasRequested ? (
                          <span className="badge badge-amber">Request Pending</span>
                        ) : (
                          <button
                            disabled={!team.isOpen}
                            onClick={() => {
                              setTargetJoinTeam(team);
                              setJoinRole(team.requiredRoles[0] || 'Contributor');
                              setIsJoinRequestModalOpen(true);
                            }}
                            className="btn btn-primary btn-sm"
                          >
                            Join Team
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Teammates Directory with Smart Matching */}
      {activeTab === 'teammates' && (
        <div>
          {/* Smart Match Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--secondary-light) 100%)',
              border: '1px solid var(--primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Smart Algorithmic Matchmaker Active
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Matching candidates with your profile based on complementary technical skill gaps, collaboration format, and time availability.
              </p>
            </div>
            <span className="badge badge-indigo" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
              Recommendation Algorithm
            </span>
          </div>

          {/* Teammates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {candidatesWithScore.map(({ user, score }) => (
              <div key={user.id} className="card card-hover" style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={user.avatar} alt={user.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{user.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {user.department} • {user.year}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      background: 'var(--secondary-light)',
                      color: 'var(--secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                    }}
                    title="Computed skill overlap & complementary synergy"
                  >
                    {score}% Match
                  </span>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '12px' }}>
                  {user.bio}
                </p>

                {/* Preferred Roles & Availability */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {user.preferredRoles?.map((role, idx) => (
                    <span key={idx} className="badge badge-violet" style={{ fontSize: '0.7rem' }}>{role}</span>
                  ))}
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>⏰ {user.availability}</span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>📍 {user.collaborationPreference}</span>
                </div>

                {/* Skills tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                  {user.skills.map((skill, idx) => (
                    <span key={idx} style={{ fontSize: '0.7rem', background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '4px' }}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Level: <strong>{user.experienceLevel || 'Intermediate'}</strong>
                  </span>
                  <button
                    onClick={() => {
                      showToast('Invitation Sent', `Sent a team collaboration invite to ${user.name}.`, 'success');
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    <Send size={13} /> Invite to Team
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Collaboration Hub (Join Requests & Invitations) */}
      {activeTab === 'my-requests' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Incoming Join Requests (For teams I own) */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              Incoming Applicant Requests ({incomingRequests.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Review students applying to join your hackathon teams:
            </p>

            {incomingRequests.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>No pending join requests</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {incomingRequests.map((req) => (
                  <div key={req.id} style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={req.userAvatar} alt={req.userName} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{req.userName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{req.userDepartment}</div>
                        </div>
                      </div>
                      <span className={`badge ${req.status === 'Accepted' ? 'badge-emerald' : req.status === 'Rejected' ? 'badge-rose' : 'badge-amber'}`}>
                        {req.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
                      Applying for: {req.roleAppliedFor} on "{req.teamName}"
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.45, marginBottom: '10px' }}>
                      "{req.message}"
                    </p>

                    {req.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleRespondRequest(req.id, 'Rejected')}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', color: 'var(--error)' }}
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.id, 'Accepted')}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Accept Teammate
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests Sent by Me */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              My Outgoing Join Requests ({mySentRequests.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Status of your applications to join hackathon teams:
            </p>

            {mySentRequests.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Users size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>No active team applications</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {mySentRequests.map((req) => (
                  <div key={req.id} style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{req.teamName}</div>
                      <span className={`badge ${req.status === 'Accepted' ? 'badge-emerald' : req.status === 'Rejected' ? 'badge-rose' : 'badge-amber'}`}>
                        {req.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Role applied: <strong>{req.roleAppliedFor}</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Submitted {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Detail Modal */}
      {activeTeamDetail && (
        <div className="modal-overlay" onClick={() => setActiveTeamDetail(null)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={activeTeamDetail.logo} alt={activeTeamDetail.name} style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)' }} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{activeTeamDetail.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Hackathon: <strong>{activeTeamDetail.hackathonName}</strong>
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveTeamDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PROJECT IDEA</h4>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                  {activeTeamDetail.projectIdea}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PROBLEM STATEMENT</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                  {activeTeamDetail.problemStatement}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PROPOSED SOLUTION</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                  {activeTeamDetail.proposedSolution}
                </p>
              </div>

              {/* Roster */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  CURRENT MEMBERS ({activeTeamDetail.members.length}/{activeTeamDetail.maxTeamSize})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeTeamDetail.members.map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-hover)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={m.avatar} alt={m.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{m.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setActiveTeamDetail(null)}>
                Close
              </button>
              {activeTeamDetail.isOpen && !activeTeamDetail.members.some((m) => m.userId === currentUser.id) && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setTargetJoinTeam(activeTeamDetail);
                    setJoinRole(activeTeamDetail.requiredRoles[0] || 'Contributor');
                    setIsJoinRequestModalOpen(true);
                  }}
                >
                  Apply to Join Team
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Join Request Modal */}
      {isJoinRequestModalOpen && targetJoinTeam && (
        <div className="modal-overlay" onClick={() => setIsJoinRequestModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Request to Join {targetJoinTeam.name}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Send pitch to team lead</div>
              </div>
              <button onClick={() => setIsJoinRequestModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendJoinRequest}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Role Applying For *</label>
                  <select
                    className="select-field"
                    value={joinRole}
                    onChange={(e) => setJoinRole(e.target.value)}
                  >
                    {targetJoinTeam.requiredRoles.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                    <option value="General Contributor">General Contributor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Note to Team Lead *</label>
                  <textarea
                    required
                    className="textarea-field"
                    rows={3}
                    placeholder="Describe your relevant projects, experience, and what you will build..."
                    value={joinMessage}
                    onChange={(e) => setJoinMessage(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Portfolio / GitHub Link</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://github.com/..."
                    value={joinPortfolio}
                    onChange={(e) => setJoinPortfolio(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsJoinRequestModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Send Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {isCreateTeamOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateTeamOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Form New Hackathon Team</h3>
              <button onClick={() => setIsCreateTeamOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Team Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. EcoTrack: Smart IoT Waste Segregator"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Hackathon Name *</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={hackathonName}
                      onChange={(e) => setHackathonName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Team Size *</label>
                    <select
                      className="select-field"
                      value={maxSize}
                      onChange={(e) => setMaxSize(Number(e.target.value))}
                    >
                      <option value={2}>2 Members</option>
                      <option value={3}>3 Members</option>
                      <option value={4}>4 Members (Standard)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Project Concept / Elevator Pitch *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="1-sentence pitch of what you will build"
                    value={projectIdea}
                    onChange={(e) => setProjectIdea(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Problem Statement *</label>
                  <textarea
                    required
                    className="textarea-field"
                    rows={2}
                    placeholder="What specific campus or global problem are you solving?"
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Proposed Solution *</label>
                  <textarea
                    required
                    className="textarea-field"
                    rows={2}
                    placeholder="How does your tech stack solve it?"
                    value={proposedSolution}
                    onChange={(e) => setProposedSolution(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tech Stack (comma-separated) *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="React, Python, OpenCV, Raspberry Pi..."
                    value={techStackStr}
                    onChange={(e) => setTechStackStr(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Roles You Are Recruiting (comma-separated) *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="UI/UX Designer, IoT Specialist, Backend..."
                    value={requiredRolesStr}
                    onChange={(e) => setRequiredRolesStr(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsCreateTeamOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Launch Team & Open Recruitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
