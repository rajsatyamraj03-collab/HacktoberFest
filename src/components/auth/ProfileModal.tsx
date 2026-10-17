import React, { useState } from 'react';
import { X, Save, User as UserIcon, GraduationCap, Github, Linkedin, Globe, Sparkles } from 'lucide-react';
import { getCurrentUser, updateCurrentUserProfile } from '../../services/storage';
import { useToast } from '../common/Toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const currentUser = getCurrentUser();
  const { showToast } = useToast();

  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [department, setDepartment] = useState(currentUser.department);
  const [year, setYear] = useState(currentUser.year);
  const [bio, setBio] = useState(currentUser.bio);
  const [skillsStr, setSkillsStr] = useState(currentUser.skills.join(', '));
  const [interestsStr, setInterestsStr] = useState(currentUser.interests.join(', '));
  const [githubUrl, setGithubUrl] = useState(currentUser.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser.linkedinUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(currentUser.portfolioUrl || '');
  const [availability, setAvailability] = useState(currentUser.availability || 'Flexible');
  const [collaborationPreference, setCollaborationPreference] = useState(currentUser.collaborationPreference || 'Hybrid');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
    const interests = interestsStr.split(',').map((i) => i.trim()).filter(Boolean);

    updateCurrentUserProfile({
      name,
      avatar,
      department,
      year,
      bio,
      skills,
      interests,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      availability: availability as any,
      collaborationPreference: collaborationPreference as any,
    });

    showToast('Profile Updated', 'Your campus profile details have been saved.', 'success');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserIcon size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Edit Student Profile</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <img
                src={avatar}
                alt={name}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
              />
              <div style={{ flex: 1 }}>
                <label className="form-label">Profile Image URL</label>
                <input
                  type="text"
                  className="input-field"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <input
                  type="text"
                  className="input-field"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Collaboration Preference</label>
                <select
                  className="select-field"
                  value={collaborationPreference}
                  onChange={(e) => setCollaborationPreference(e.target.value as any)}
                >
                  <option value="In-Person">In-Person</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio / Elevator Pitch</label>
              <textarea
                className="textarea-field"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="What are you currently building or learning?"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Skills (comma-separated)</label>
              <input
                type="text"
                className="input-field"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="React, TypeScript, Python, Figma, Docker..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Interests & Topics (comma-separated)</label>
              <input
                type="text"
                className="input-field"
                value={interestsStr}
                onChange={(e) => setInterestsStr(e.target.value)}
                placeholder="AI/ML, Web3, Mobile Apps, Open Source..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">GitHub URL</label>
                <input
                  type="url"
                  className="input-field"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input
                  type="url"
                  className="input-field"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Save size={14} /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
