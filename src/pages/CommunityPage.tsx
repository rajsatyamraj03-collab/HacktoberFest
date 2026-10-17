import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Bookmark, 
  Flag, 
  Plus, 
  Search, 
  Users, 
  Sparkles, 
  Trash2, 
  Send, 
  X, 
  Flame, 
  Clock, 
  Tag, 
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { 
  getPosts, 
  createPost, 
  toggleLikePost, 
  addCommentToPost, 
  deletePost, 
  reportPost, 
  getClubs, 
  toggleClubMembership, 
  getCurrentUser,
  updateCurrentUserProfile
} from '../services/storage';
import { CommunityPost, PostCategory, PostType, StudentClub } from '../types';
import { useToast } from '../components/common/Toast';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface CommunityPageProps {
  onNavigate: (page: string) => void;
  selectedPostId?: string;
}

const CATEGORIES: PostCategory[] = [
  'Programming and DSA',
  'AI and machine learning',
  'Web development',
  'Startups and entrepreneurship',
  'Placements and internships',
  'Design and creativity',
  'Campus events',
  'General student discussions',
];

const POST_TYPES: PostType[] = [
  'Discussion',
  'Question',
  'Project Showcase',
  'Study Tip',
  'Announcement',
  'Internship',
];

export const CommunityPage: React.FC<CommunityPageProps> = ({ selectedPostId }) => {
  const posts = getPosts();
  const clubs = getClubs();
  const currentUser = getCurrentUser();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'feed' | 'clubs'>('feed');
  const [feedMode, setFeedMode] = useState<'trending' | 'latest'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterClubId, setFilterClubId] = useState<string>('All');

  // Modals & form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reportModalPostId, setReportModalPostId] = useState<string | null>(null);
  const [deleteModalPostId, setDeleteModalPostId] = useState<string | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(selectedPostId || null);
  const [commentInput, setCommentInput] = useState('');

  // Create Post fields
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<PostCategory>('Programming and DSA');
  const [newPostType, setNewPostType] = useState<PostType>('Discussion');
  const [newTagsStr, setNewTagsStr] = useState('React, Web');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newClubId, setNewClubId] = useState<string>('');

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (p.isHidden) return false;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchClub = filterClubId === 'All' || p.clubId === filterClubId;

      return matchSearch && matchCategory && matchClub;
    }).sort((a, b) => {
      if (feedMode === 'trending') {
        const scoreA = a.likes.length * 2 + a.commentsCount;
        const scoreB = b.likes.length * 2 + b.commentsCount;
        return scoreB - scoreA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [posts, searchQuery, selectedCategory, filterClubId, feedMode]);

  // Handle Create Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = newTagsStr.split(',').map((t) => t.trim()).filter(Boolean);
    const chosenClub = clubs.find((c) => c.id === newClubId);

    createPost({
      title: newTitle,
      content: newContent,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorDepartment: currentUser.department,
      category: newCategory,
      postType: newPostType,
      tags,
      imageUrl: newImageUrl.trim() || undefined,
      clubId: chosenClub ? chosenClub.id : undefined,
      clubName: chosenClub ? chosenClub.name : undefined,
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewImageUrl('');
    showToast('Post Published! 🚀', 'Your discussion is now visible to the student community.', 'success');
  };

  // Handle Comment Submission
  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;
    addCommentToPost(postId, commentInput.trim());
    setCommentInput('');
    showToast('Comment Added', 'Your reply has been posted.', 'success');
  };

  // Toggle Bookmark / Save Post
  const handleToggleBookmark = (postId: string) => {
    const isSaved = currentUser.savedPosts.includes(postId);
    const updated = isSaved
      ? currentUser.savedPosts.filter((id) => id !== postId)
      : [...currentUser.savedPosts, postId];
    updateCurrentUserProfile({ savedPosts: updated });
    showToast(isSaved ? 'Bookmark Removed' : 'Post Saved', isSaved ? 'Removed from saved items' : 'Saved to your profile bookmarks', 'info');
  };

  // Handle Report Post
  const handleReportPost = (reason: any) => {
    if (!reportModalPostId) return;
    reportPost(reportModalPostId, reason);
    setReportModalPostId(null);
    showToast('Report Submitted', 'Thank you for helping keep CampusVerse safe. Moderators will review this.', 'info');
  };

  // Handle Delete Post
  const handleConfirmDelete = () => {
    if (!deleteModalPostId) return;
    deletePost(deleteModalPostId);
    setDeleteModalPostId(null);
    showToast('Post Deleted', 'Your post has been removed.', 'info');
  };

  return (
    <div className="content-wrapper">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Student Community Hub
            </h1>
            <span className="badge badge-violet">MODULE B</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Connect with peers, share project milestones, ask DSA questions, and collaborate with student clubs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`btn btn-sm ${activeTab === 'clubs' ? 'btn-secondary' : 'btn-outline'}`}
          >
            <Users size={16} /> Student Clubs ({clubs.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('feed');
              setIsCreateModalOpen(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} /> New Discussion
          </button>
        </div>
      </div>

      {activeTab === 'clubs' ? (
        /* Clubs Directory Tab */
        <div>
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Campus Student Clubs & Societies</h3>
            <button onClick={() => setActiveTab('feed')} className="btn btn-outline btn-sm">
              Back to Feed
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {clubs.map((club) => {
              const isMember = currentUser.joinedClubs.includes(club.id);
              return (
                <div key={club.id} className="card card-hover" style={{ overflow: 'hidden' }}>
                  <img src={club.coverImage} alt={club.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '-34px', marginBottom: '10px' }}>
                      <img
                        src={club.logo}
                        alt={club.name}
                        style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', border: '2px solid #fff', objectFit: 'cover', background: '#fff' }}
                      />
                      <div>
                        <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{club.category}</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{club.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                      {club.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                      {club.tags.map((t, idx) => (
                        <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>#{t}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <strong>{club.memberCount}</strong> active members
                      </span>
                      <button
                        onClick={() => {
                          toggleClubMembership(club.id);
                          showToast(isMember ? 'Left Club' : 'Joined Club! 🎉', isMember ? `You left ${club.name}` : `You are now a member of ${club.name}`, 'success');
                        }}
                        className={`btn btn-sm ${isMember ? 'btn-outline' : 'btn-primary'}`}
                      >
                        {isMember ? 'Joined ✓' : 'Join Club'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Feed Tab */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) minmax(0, 1fr)', gap: '24px' }}>
          
          {/* Main Feed Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Filter & Search Bar */}
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Search posts, topics, questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>

                {/* Trending vs Latest Toggle */}
                <div style={{ display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <button
                    onClick={() => setFeedMode('trending')}
                    style={{
                      background: feedMode === 'trending' ? 'var(--primary-light)' : 'transparent',
                      color: feedMode === 'trending' ? 'var(--primary)' : 'var(--text-secondary)',
                      border: 'none',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Flame size={14} /> Trending
                  </button>
                  <button
                    onClick={() => setFeedMode('latest')}
                    style={{
                      background: feedMode === 'latest' ? 'var(--primary-light)' : 'transparent',
                      color: feedMode === 'latest' ? 'var(--primary)' : 'var(--text-secondary)',
                      border: 'none',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Clock size={14} /> Latest
                  </button>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginTop: '10px', paddingBottom: '2px' }}>
                <button
                  className={`chip ${selectedCategory === 'All' ? 'chip-active' : ''}`}
                  onClick={() => setSelectedCategory('All')}
                >
                  All Topics
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

            {/* Posts Stream */}
            {filteredPosts.length === 0 ? (
              <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
                <MessageSquare size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>No discussions found</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Be the first to share an insight or question!
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isLiked = post.likes.includes(currentUser.id);
                const isSaved = currentUser.savedPosts.includes(post.id);
                const isOwnPost = post.authorId === currentUser.id;
                const isCommentOpen = activeCommentPostId === post.id;

                return (
                  <div key={post.id} className="card" style={{ padding: '20px' }}>
                    {/* Post Top Row: Author, Category & Type Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                              {post.authorName}
                            </span>
                            {post.clubName && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>
                                in {post.clubName}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {post.authorDepartment} • {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge badge-violet">{post.postType}</span>
                        <span className="badge badge-neutral">{post.category}</span>
                      </div>
                    </div>

                    {/* Post Title & Content */}
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>
                      {post.title}
                    </h3>

                    <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '14px' }}>
                      {post.content}
                    </div>

                    {/* Optional Post Image */}
                    {post.imageUrl && (
                      <div style={{ marginBottom: '14px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <img src={post.imageUrl} alt={post.title} style={{ width: '100%', maxHeight: '380px', objectFit: 'cover' }} />
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        {post.tags.map((tag, idx) => (
                          <span key={idx} style={{ fontSize: '0.72rem', background: 'var(--bg-hover)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Bar (Upvote, Comment, Bookmark, Share, Report/Delete) */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => toggleLikePost(post.id)}
                          className="btn btn-ghost btn-sm"
                          style={{
                            color: isLiked ? '#EF4444' : 'var(--text-secondary)',
                            fontWeight: isLiked ? 700 : 500,
                          }}
                        >
                          <Heart size={16} fill={isLiked ? '#EF4444' : 'none'} /> {post.likes.length} Upvotes
                        </button>

                        <button
                          onClick={() => setActiveCommentPostId(isCommentOpen ? null : post.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <MessageSquare size={16} /> {post.commentsCount} Comments
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => handleToggleBookmark(post.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: isSaved ? 'var(--primary)' : 'var(--text-muted)', padding: '6px' }}
                          title={isSaved ? 'Remove Bookmark' : 'Bookmark Post'}
                        >
                          <Bookmark size={16} fill={isSaved ? 'var(--primary)' : 'none'} />
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            showToast('Link Copied', 'Copied discussion link to clipboard.', 'success');
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--text-muted)', padding: '6px' }}
                          title="Share"
                        >
                          <Share2 size={16} />
                        </button>

                        {isOwnPost ? (
                          <button
                            onClick={() => setDeleteModalPostId(post.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--error)', padding: '6px' }}
                            title="Delete My Post"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setReportModalPostId(post.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--text-muted)', padding: '6px' }}
                            title="Report Post"
                          >
                            <Flag size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Comment Thread Section */}
                    {isCommentOpen && (
                      <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                        {/* New Comment Input */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Add a helpful reply or question..."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                          />
                          <button onClick={() => handleAddComment(post.id)} className="btn btn-primary btn-sm">
                            <Send size={14} /> Reply
                          </button>
                        </div>

                        {/* Existing Comments */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {post.comments.map((comm) => (
                            <div key={comm.id} style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <img src={comm.authorAvatar} alt={comm.authorName} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                                  <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{comm.authorName}</span>
                                  <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{comm.authorRole}</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  {new Date(comm.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                                {comm.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Sidebar: Joined Clubs & Guidelines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Joined Clubs */}
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>My Joined Clubs</h4>
                <button onClick={() => setActiveTab('clubs')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
                  Browse All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {clubs.filter((c) => currentUser.joinedClubs.includes(c.id)).map((club) => (
                  <div
                    key={club.id}
                    onClick={() => setFilterClubId(filterClubId === club.id ? 'All' : club.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px',
                      borderRadius: 'var(--radius-md)',
                      background: filterClubId === club.id ? 'var(--primary-light)' : 'transparent',
                      cursor: 'pointer',
                    }}
                    className="card-hover"
                  >
                    <img src={club.logo} alt={club.name} style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {club.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {club.memberCount} members
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Rules Banner */}
            <div className="card" style={{ padding: '18px', background: 'var(--bg-hover)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={16} color="var(--primary)" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>CampusVerse Guidelines</h4>
              </div>
              <ul style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: 1.6 }}>
                <li>Be respectful and inclusive to all students.</li>
                <li>Share verified opportunities & open-source tools.</li>
                <li>No spam, self-promotion, or abusive remarks.</li>
                <li>Use descriptive titles to help peers find solutions.</li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Create New Campus Post</h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Post Title *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. My top takeaways from cracking the Google Summer of Code application"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="select-field"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Post Type *</label>
                    <select
                      className="select-field"
                      value={newPostType}
                      onChange={(e) => setNewPostType(e.target.value as any)}
                    >
                      {POST_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Post to Student Club (Optional)</label>
                  <select
                    className="select-field"
                    value={newClubId}
                    onChange={(e) => setNewClubId(e.target.value)}
                  >
                    <option value="">Campus-wide (General Feed)</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Content *</label>
                  <textarea
                    required
                    className="textarea-field"
                    rows={4}
                    placeholder="Write your advice, project details, code snippet or question..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="DSA, React, Internship, Design"
                    value={newTagsStr}
                    onChange={(e) => setNewTagsStr(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Optional Image URL</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://images.unsplash.com/..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Publish to Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Post Modal */}
      {reportModalPostId && (
        <div className="modal-overlay" onClick={() => setReportModalPostId(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Report Discussion</h3>
              <button onClick={() => setReportModalPostId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Select the reason for reporting this content to campus moderators:
              </p>
              {['Spam', 'Harassment', 'Inappropriate Content', 'Misleading/Scam', 'Other'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleReportPost(reason)}
                  className="btn btn-outline btn-sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Flag size={14} /> {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteModalPostId}
        title="Delete Post?"
        message="Are you sure you want to permanently delete this discussion? This action cannot be undone."
        confirmLabel="Delete Post"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalPostId(null)}
      />
    </div>
  );
};
